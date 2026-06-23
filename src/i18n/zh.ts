const zh = {
  // Header
  "app.title": "Agnes AI 智能助手",
  "app.subtitle": "基于 EdgeOne Makers 运行，使用 Agnes 2.0 Flash 模型，支持会话记忆和流式响应",

  // Empty state
  "empty.title": "Agnes AI 智能助手",
  "empty.hint": "我是基于 Agnes 2.0 Flash 的 AI 助手，运行在 EdgeOne 上。我可以帮助你回答问题、编写代码、分析数据和创意任务。",
  "empty.features": "Agnes 2.0 Flash · 会话记忆 · 流式响应",

  // Chat input
  "chat.placeholder": "输入消息...  ⏎ 发送 · Shift+⏎ 换行",
  "chat.hint": "由 Agnes 2.0 Flash + EdgeOne Makers 驱动",

  // Preset questions
  "preset.1": "你能做什么？介绍一下你的能力。",
  "preset.2": "写一个 Python 函数，计算斐波那契数列的前 10 项。",
  "preset.4": "解释 REST 和 GraphQL API 的区别。",
  "preset.screenshotEdgeOne": "EdgeOne Makers 是什么？",

  // Tool indicators
  "tool.commands": "命令行",
  "tool.files": "文件",
  "tool.codeRunner": "代码运行",
  "tool.browser": "浏览器",

  // Web search activity (in-bubble chip)
  "webSearch.error.wsaMissing": "搜索不可用，需配置 {0} API Key",
  "webSearch.error.wsaCta": "获取 Key",

  // Debug panel
  "debug.title": "Trace",
  "debug.events": "事件",
  "debug.clear": "清除",
  "debug.empty": "等待 SSE 事件...",
  "debug.emptyHint": "发送消息后，所有原始后端数据将在此处显示。",

  // Status & errors
  "status.error": "请求失败，请检查后端服务是否正常运行。",
  "status.stopped": "⏹ *已停止生成*",
  "status.backendError": "后端中止请求失败，服务器可能仍在运行。",

  // Language toggle
  "lang.switch": "English",

  // Sidebar
  "sidebar.label": "会话列表",
  "sidebar.title": "会话",
  "sidebar.newChat": "新建聊天",
  "sidebar.loading": "正在加载会话...",
  "sidebar.loadMore": "加载更多",
  "sidebar.loadingMore": "加载中...",
  "sidebar.emptyTitle": "暂无会话",
  "sidebar.emptyHint": "点击「新建聊天」开始第一段对话。",
  "sidebar.delete": "删除会话",
  "sidebar.deleteConfirm": "确定要永久删除这个会话吗？此操作不可恢复。",

  // Aria labels (button hover/screen-reader)
  "aria.send": "发送",
  "aria.clearHistory": "清除历史",
  "aria.stopGeneration": "停止生成",

  // ─── Floating bottom-right action badges ─────────────────────────────
  "floatingLink.deploy": "一键部署",
  "floatingLink.github": "GitHub",
} as const;

export default zh;
