import { IpcRoute } from '@/main/providers/RouterService.js';
import { userPluginDB, devPluginDB } from '@coffic/buddy-foundation';
import { remotePluginDB } from '@/main/repo/PluginRepoRemote.js';
import { SendablePlugin } from '@/types/sendable-plugin.js';
import { Market } from '@coffic/buddy-foundation';
import { IPC_METHODS } from '@/types/ipc-methods.js';

export const marketHandler: IpcRoute[] = [
    {
        channel: IPC_METHODS.Plugin_Is_Installed,
        handler: async (_: unknown, pluginId: string): Promise<boolean> => {
            return await userPluginDB.has(pluginId);
        },
    },
    {
        channel: IPC_METHODS.GET_USER_PLUGINS,
        handler: async (): Promise<SendablePlugin[]> => {
            return await userPluginDB.getSendablePlugins();
        },
    },
    {
        channel: IPC_METHODS.GET_DEV_PLUGINS,
        handler: async (): Promise<SendablePlugin[]> => {
            return await devPluginDB.getSendablePlugins();
        }
    },
    {
        channel: IPC_METHODS.GET_REMOTE_PLUGINS,
        handler: async (): Promise<SendablePlugin[]> => {
            return await remotePluginDB.getSendablePlugins();
        },
    },
    {
        channel: IPC_METHODS.DOWNLOAD_PLUGIN,
        handler: async (_, pluginId: string): Promise<void> => {
            await Market.install(pluginId);
        },
    },
    {
        channel: IPC_METHODS.GET_PLUGIN_DIRECTORIES,
        handler: (): string => {
            return userPluginDB.getRootDir();
        },
    },
    {
        channel: IPC_METHODS.UNINSTALL_PLUGIN,
        handler: async (_, pluginId: string): Promise<void> => {
            await Market.uninstall(pluginId);
        },
    },
];
