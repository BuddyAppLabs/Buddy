/**
 * IPC 通信中的方法名称常量
 */
export const IPC_METHODS = {
  // Views 相关的路由
  Create_View: 'views/create',
  Destroy_View: 'views/destroy',
  Update_View_Bounds: 'views/update-bounds',
  UPSERT_VIEW: 'views/upsert',

  // Folders 相关的路由
  OPEN_FOLDER: 'folders/open',

  // Plugins 相关的路由
  GET_PLUGINS: 'plugins',
  Plugin_Is_Installed: 'plugins/status',
  GET_ACTIONS: 'plugins/actions',
  EXECUTE_PLUGIN_ACTION: 'plugins/actions/execute',
  GET_ACTION_VIEW: 'plugins/actions/view',

  // Plugin Views 相关的路由
  CREATE_PLUGIN_VIEW: 'plugins/views',
  SHOW_PLUGIN_VIEW: 'plugins/views/show',
  HIDE_PLUGIN_VIEW: 'plugins/views/hide',
  DESTROY_PLUGIN_VIEW: 'plugins/views/destroy',
  Destroy_Plugin_Views: 'plugins/views/destroy',

  // Plugin DevTools 相关的路由
  TOGGLE_PLUGIN_DEVTOOLS: 'plugins/devtools/toggle',

  // Plugin Pages 相关的路由
  Get_PLUGIN_PAGE_SOURCE_CODE: 'plugins/pages/source',

  // Plugin Store 相关的路由
  GET_USER_PLUGINS: 'plugins/store',
  GET_DEV_PLUGINS: 'plugins/dev',
  GET_REMOTE_PLUGINS: 'plugins/remote',
  DOWNLOAD_PLUGIN: 'plugins/download',
  UNINSTALL_PLUGIN: 'plugins/uninstall',

  // Plugin Directories 相关的路由
  GET_PLUGIN_DIRECTORIES_USER: 'plugins/directories/user',
  GET_PLUGIN_DIRECTORIES_DEV: 'plugins/directories/dev',
  SET_PLUGIN_DIRECTORIES_DEV: 'plugins/directories/dev/set',

  // Overlaid Apps 相关的路由
  Get_Current_App: 'overlaid-apps/current',

  // AI Chats 相关的路由
  AI_CHAT: 'ai/chats',
  AI_CHAT_SEND: 'ai/chats/messages',
  AI_CHAT_CANCEL: 'ai/chats/cancel',

  // AI Chat Streams 相关的路由
  AI_CHAT_STREAM_CHUNK: 'ai/chats/streams/chunks',
  AI_CHAT_STREAM_DONE: 'ai/chats/streams/completion',

  // Configs 相关的路由
  CONFIG_GET_ALL: 'configs',
  CONFIG_GET: 'configs/items/get',
  CONFIG_SET: 'configs/items/set',
  CONFIG_DELETE: 'configs/items/delete',
  CONFIG_RESET: 'configs/items/reset',
  CONFIG_GET_PATH: 'configs/items/path',

  // Dev Tests 相关的路由
  DEV_TEST_ECHO: 'dev/tests/echo', // 回显测试
  DEV_TEST_ERROR: 'dev/tests/errors', // 错误处理测试
  DEV_TEST_STREAM: 'dev/tests/streams', // 流处理测试

  // 版本相关的路由
  GET_VERSIONS: 'versions/get',
  CHECK_UPDATE: 'versions/update',

  // 其他
  OPEN_CONFIG_FOLDER: 'config/open-folder',
} as const;

/**
 * IPC 方法名称类型
 */
export type IpcMethod = (typeof IPC_METHODS)[keyof typeof IPC_METHODS];
