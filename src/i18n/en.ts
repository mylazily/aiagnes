const en = {
  // Header
  "app.title": "Agnes AI Agent",
  "app.subtitle": "Running on EdgeOne Makers with Agnes 2.0 Flash, session memory & streaming",

  // Empty state
  "empty.title": "Agnes AI Agent",
  "empty.hint": "I'm an AI assistant powered by Agnes 2.0 Flash, running on EdgeOne. I can help you with answering questions, writing code, analyzing data, and creative tasks.",
  "empty.features": "Agnes 2.0 Flash · Session Memory · Streaming",

  // Chat input
  "chat.placeholder": "Type a message...  ⏎ Send · Shift+⏎ Newline",
  "chat.hint": "Powered by Agnes 2.0 Flash + EdgeOne Makers",

  // Preset questions
  "preset.1": "What can you do? Tell me about your capabilities.",
  "preset.2": "Write a Python function to calculate the first 10 Fibonacci numbers.",
  "preset.4": "Explain the difference between REST and GraphQL APIs.",
  "preset.screenshotEdgeOne": "What is EdgeOne Makers?",

  // Tool indicators
  "tool.commands": "Commands",
  "tool.files": "Files",
  "tool.codeRunner": "Code Runner",
  "tool.browser": "Browser",

  // Web search activity (in-bubble chip)
  "webSearch.error.wsaMissing": "Web search unavailable — needs a {0} API key",
  "webSearch.error.wsaCta": "Get a key",

  // Status & errors
  "status.error": "Request failed. Please check if the backend service is running.",
  "status.stopped": "⏹ *Generation stopped*",
  "status.backendError": "Backend abort request failed. The server may still be running.",

  // Debug panel
  "debug.title": "Trace",
  "debug.events": "events",
  "debug.clear": "Clear",
  "debug.empty": "Waiting for SSE events...",
  "debug.emptyHint": "After sending a message, all raw backend data will be displayed here.",

  // Language toggle
  "lang.switch": "中文",

  // Sidebar
  "sidebar.label": "Conversation list",
  "sidebar.title": "Chats",
  "sidebar.newChat": "New chat",
  "sidebar.loading": "Loading conversations...",
  "sidebar.loadMore": "Load more",
  "sidebar.loadingMore": "Loading...",
  "sidebar.emptyTitle": "No conversations yet",
  "sidebar.emptyHint": "Click \"New chat\" to start your first conversation.",
  "sidebar.delete": "Delete conversation",
  "sidebar.deleteConfirm": "Permanently delete this conversation? This cannot be undone.",

  // Aria labels (button hover/screen-reader)
  "aria.send": "Send",
  "aria.clearHistory": "Clear history",
  "aria.stopGeneration": "Stop generation",

  // ─── Floating bottom-right action badges ─────────────────────────────
  "floatingLink.deploy": "Deploy",
  "floatingLink.github": "GitHub",
} as const;

export default en;
