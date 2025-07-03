/**
 * IPC 通信中的方法名称常量
 */
export const IPC_METHODS = {
  // Views 相关的路由
  Create_View: 'views/create',
  Destroy_View: 'views/destroy',
  Update_View_Bounds: 'views/update-bounds',
  UPSERT_VIEW: 'views/upsert',
  BATCH_UPSERT_VIEWS: 'views/batch-upsert',

  // Folders 相关的路由
  OPEN_FOLDER: 'folders/open',

  // Plugins 相关的路由
  GET_PLUGINS: 'plugins',
  Plugin_Is_Installed: 'plugins/status',
  GET_ACTIONS: 'plugins/actions',
  EXECUTE_PLUGIN_ACTION: 'plugins/actions/execute',
  GET_ACTION_VIEW_HTML: 'plugins/actions/view/html',

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
  GET_DEV_PACKAGE: 'plugins/dev/package',
  DOWNLOAD_PLUGIN: 'plugins/download',
  UNINSTALL_PLUGIN: 'plugins/uninstall',

  // Plugin Directories 相关的路由
  GET_PLUGIN_DIRECTORIES_USER: 'plugins/directories/user',
  GET_PLUGIN_DIRECTORIES_DEV: 'plugins/directories/dev/get',
  SET_PLUGIN_DIRECTORIES_DEV: 'plugins/directories/dev/set',
  RESET_PLUGIN_DIRECTORIES_DEV: 'plugins/directories/dev/reset',
  GET_PLUGIN_DIRECTORIES_DEV_PACKAGE: 'plugins/directories/dev/package/get',
  SET_PLUGIN_DIRECTORIES_DEV_PACKAGE: 'plugins/directories/dev/package/set',
  RESET_PLUGIN_DIRECTORIES_DEV_PACKAGE: 'plugins/directories/dev/package/reset',

  // Overlaid Apps 相关的路由
  Get_Current_App: 'overlaid-apps/current',

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
  CHECK_UPDATE: 'versions/update/check',

  // 其他
  OPEN_CONFIG_FOLDER: 'config/open-folder',
} as const;

/**
 * IPC 方法名称类型
 */
export type IpcMethod = (typeof IPC_METHODS)[keyof typeof IPC_METHODS];
