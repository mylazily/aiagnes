/**
 * Chat stream handler — Agnes AI (OpenAI-compatible API)
 *
 * Streams responses from Agnes AI via SSE to the frontend.
 * Uses the OpenAI Chat Completions API format.
 */

interface Logger {
  log(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

interface CreateChatStreamOptions {
  message: string;
  model: string;
  baseUrl: string;
  apiKey: string;
  systemPrompt: string;
  conversationHistory: Array<{ role: string; content: string }>;
  signal?: AbortSignal;
  logger: Logger;
  conversationId: string;
  store: any;
  botMsgId?: string;
  userId?: string;
}

function sseFrame(event: string, data: Record<string, unknown>): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/**
 * Remove image data URIs from assistant prose before streaming or storing it.
 */
function sanitizeAssistantText(text: string): string {
  return text
    .replace(/!\[[^\]]*]\(\s*data:image\/[^;)\s]+;base64,[A-Za-z0-9+/=]+\s*\)/gi, '')
    .replace(/!\[[^\]]*]\(\s*data:image\/[^;)\s]+;base64,[\s\S]*$/gi, '')
    .replace(/data:image\/[^;)\s]+;base64,[A-Za-z0-9+/=]+/gi, '')
    .replace(/data:image\/[^;)\s]+;base64,[A-Za-z0-9+/=]*$/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trimStart();
}

function enqueueSse(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  event: string,
  data: Record<string, unknown>,
): void {
  controller.enqueue(encoder.encode(sseFrame(event, data)));
}

export function createChatStream({
  message,
  model,
  baseUrl,
  apiKey,
  systemPrompt,
  conversationHistory,
  signal,
  logger,
  conversationId,
  store,
  botMsgId,
  userId,
}: CreateChatStreamOptions): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let stopped = false;

  return new ReadableStream({
    async start(controller) {
      let fullAssistantText = '';

      try {
        // Build messages array for OpenAI Chat Completions API
        const messages: Array<{ role: string; content: string }> = [
          { role: 'system', content: systemPrompt },
        ];

        // Add conversation history (exclude the last user message which is the current one)
        if (conversationHistory.length > 0) {
          // The current message was already saved to store, so history includes it.
          // We need to exclude it to avoid duplication.
          const historyWithoutCurrent = conversationHistory.slice(0, -1);
          messages.push(...historyWithoutCurrent);
        }

        // Add the current user message
        messages.push({ role: 'user', content: message });

        logger.log(`[stream] sending request to Agnes AI, model=${model}, messages=${messages.length}`);

        // Call Agnes AI OpenAI-compatible API with streaming
        const abortController = new AbortController();
        if (signal?.aborted) {
          abortController.abort();
        } else {
          signal?.addEventListener('abort', () => abortController.abort(), { once: true });
        }

        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages,
            stream: true,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          logger.error(`[stream] API error: HTTP ${response.status}, body: ${errorText}`);
          enqueueSse(controller, encoder, 'error', {
            message: `API error: HTTP ${response.status} - ${errorText}`,
            name: 'ApiError',
          });
          controller.close();
          return;
        }

        // Parse SSE stream from Agnes AI
        const reader = response.body?.getReader();
        if (!reader) {
          enqueueSse(controller, encoder, 'error', {
            message: 'ReadableStream not supported',
            name: 'StreamError',
          });
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          if (signal?.aborted) { stopped = true; break; }

          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE format: events separated by \n\n
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            if (!part.trim()) continue;

            let data = '';
            for (const line of part.split('\n')) {
              if (line.startsWith('data: ')) {
                data = line.slice(6);
              }
            }

            if (!data) continue;

            // Check for stream end
            if (data === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta;

              if (delta?.content) {
                const textDelta = delta.content;
                fullAssistantText += textDelta;
                enqueueSse(controller, encoder, 'text_delta', { delta: textDelta });
              }

              // Handle tool calls if present
              if (delta?.tool_calls) {
                for (const toolCall of delta.tool_calls) {
                  if (toolCall.function?.name) {
                    enqueueSse(controller, encoder, 'tool_called', { tool: toolCall.function.name });
                  }
                }
              }

              // Check for finish reason
              const finishReason = parsed.choices?.[0]?.finish_reason;
              if (finishReason === 'stop' || finishReason === 'end_turn') {
                logger.log(`[stream] finish_reason=${finishReason}`);
              }
            } catch {
              // Parse failure, skip this chunk
              logger.error('[stream] failed to parse SSE chunk:', data);
            }
          }
        }
      } catch (e: unknown) {
        const error = e as Error;
        if (error.name === 'AbortError' || signal?.aborted) {
          stopped = true;
          logger.log('[stream] aborted by user');
        } else {
          logger.error('[stream] error.name:', error.name);
          logger.error('[stream] error.message:', error.message);
          logger.error('[stream] error.stack:', error.stack);
          enqueueSse(controller, encoder, 'error', {
            message: String(error.message ?? e),
            name: error.name || 'Error',
            stack: error.stack,
          });
        }
      } finally {
        // Save assistant response to store
        const content = sanitizeAssistantText(fullAssistantText).trim();
        if (store && conversationId) {
          if (botMsgId) {
            try {
              const args: Record<string, unknown> = {
                conversationId, role: 'assistant', content: content || '[empty]', messageId: botMsgId,
              };
              if (userId) args.userId = userId;
              await store.appendMessage(args);
            } catch (e) { logger.error('[store] failed to save assistant response:', e); }
          } else if (content) {
            try {
              const args: Record<string, unknown> = {
                conversationId, role: 'assistant', content,
              };
              if (userId) args.userId = userId;
              await store.appendMessage(args);
            } catch (e) { logger.error('[store] failed to save assistant response:', e); }
          }
        }

        enqueueSse(controller, encoder, 'done', { stopped });
        controller.close();
      }
    },
    cancel() {
      logger.log('[stream] client disconnected');
    },
  });
}
