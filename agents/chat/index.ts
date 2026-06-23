/**
 * Agent handler — EdgeOne Makers
 * ========================================
 *
 * File path agents/chat/index.ts maps to **POST /chat**
 *
 * Uses Agnes AI (OpenAI-compatible API) instead of Claude Agent SDK.
 * Streams responses via SSE to the frontend.
 *
 * context convention:
 *   context.request.body    — object, request body
 *   context.request.signal  — AbortSignal, set when /stop is called
 *   context.conversation_id — conversation ID
 *   context.store           — store adapter (appendMessage / getMessages)
 *   context.tools           — EdgeOne platform sandbox toolkit
 */

import { resolveModelName, resolveBaseUrl, resolveApiKey } from '../_model';
import { createLogger } from '../_logger';
import { createChatStream } from './_stream';

const logger = createLogger('chat');

const SYSTEM_PROMPT =
  'You are a helpful AI assistant powered by Agnes 2.0 Flash, built on EdgeOne Makers.\n' +
  'When introducing yourself, clearly say that you are an AI assistant built with Agnes 2.0 Flash on EdgeOne Makers.\n' +
  'You help users with a wide range of tasks including answering questions, writing code, analyzing data, and creative tasks.\n\n' +
  'Guidelines:\n' +
  '1. Be helpful, accurate, and concise.\n' +
  '2. When writing code, use proper formatting and explain your approach.\n' +
  '3. If you are unsure about something, say so honestly.\n' +
  '4. Respond in the same language the user uses.\n';

export async function onRequest(context: any) {
  const body = context.request.body ?? {};
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const userMsgId = typeof body.userMsgId === 'string' ? body.userMsgId : undefined;
  const botMsgId = typeof body.botMsgId === 'string' ? body.botMsgId : undefined;
  const rawUserId = typeof body.userId === 'string' ? body.userId : (typeof body.user_id === 'string' ? body.user_id : '');
  const userId = rawUserId.trim() || undefined;

  if (!message) {
    return new Response(
      JSON.stringify({ error: "'message' is required" }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const signal: AbortSignal | undefined = context.request.signal;
  const conversationId: string = context.conversation_id ?? '';
  const { store } = context;
  const ctxEnv = context.env ?? process.env ?? {};

  logger.log(`[request] cid=${conversationId}, uid=${userId ?? '-'}, message="${message.slice(0, 50)}..."`);

  // Save user message to store
  if (conversationId) {
    try {
      const appendArgs: Record<string, unknown> = {
        conversationId,
        role: 'user',
        content: message,
        messageId: userMsgId,
      };
      if (userId) appendArgs.userId = userId;
      await store.appendMessage(appendArgs);
    } catch (e) { logger.error('[store] failed to save user message:', e); }
  }

  // Resolve Agnes AI configuration
  const model = resolveModelName(ctxEnv);
  const baseUrl = resolveBaseUrl(ctxEnv);
  const apiKey = resolveApiKey(ctxEnv);

  logger.log(`[config] model=${model}, baseUrl=${baseUrl}`);

  // Build conversation history from store for multi-turn support
  let conversationHistory: Array<{ role: string; content: string }> = [];
  if (conversationId) {
    try {
      const messages = await store.getMessages({ conversationId });
      if (Array.isArray(messages)) {
        conversationHistory = messages
          .filter((m: any) => m.role === 'user' || m.role === 'assistant')
          .map((m: any) => ({
            role: m.role,
            content: typeof m.content === 'string' ? m.content : String(m.content),
          }));
      }
    } catch (e) {
      logger.error('[store] failed to load conversation history:', e);
    }
  }

  const stream = createChatStream({
    message,
    model,
    baseUrl,
    apiKey,
    systemPrompt: SYSTEM_PROMPT,
    conversationHistory,
    signal,
    logger,
    conversationId,
    store,
    botMsgId,
    userId,
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
