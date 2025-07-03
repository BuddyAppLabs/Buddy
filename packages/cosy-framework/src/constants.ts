export const EMOJI = '💤';

export const IPC_CHANNELS = {
  DISPATCH: 'cody-framework:dispatch',
  ROUTES: 'cody-framework:routes',
} as const;

// 服务容器中注册的抽象名称
export const AppAbstract = 'app';
export const AppAlias = ['Application'];

export const ContainerAbstract = 'container';
export const ContainerAlias = ['ServiceContainer'];

export const RouterAbstract = 'router';
export const RouterAlias = ['Router'];

export const ConfigAbstract = 'config';
export const ConfigAlias = ['ConfigManager'];

export const SettingAbstract = 'setting';
export const SettingAlias = ['SettingManager'];

export const UpdateContract = 'update';

export const LogAbstract = 'log';
export const LogAlias = ['LogManager'];
