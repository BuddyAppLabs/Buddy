/**
 * 配置相关路由
 * 处理应用配置的增删改查
 */

import { Route } from '@coffic/buddy-foundation';
import { configManager } from '../managers/ConfigManager.js';
import { IpcResponse } from '@coffic/buddy-types';
import { IPC_METHODS } from '@/types/ipc-methods.js';

const logger = console;

// 获取所有配置
Route.handle(IPC_METHODS.CONFIG_GET_ALL, async (_event) => {
    try {
        return configManager.getAll();
    } catch (error) {
        logger.error('IPC获取所有配置失败:', error);
        throw error;
    }
})
    .description('获取所有配置项');

// 获取单个配置
Route.handle(IPC_METHODS.CONFIG_GET, async (_event, key: string, defaultValue?: any) => {
    try {
        return configManager.get(key, defaultValue);
    } catch (error) {
        logger.error(`IPC获取配置[${key}]失败:`, error);
        throw error;
    }
})
    .validation({
        '0': { required: true, type: 'string' }
    })
    .description('获取指定配置项的值');

// 设置配置
Route.handle(IPC_METHODS.CONFIG_SET, async (_event, key: string, value: any) => {
    try {
        configManager.set(key, value);
        return true;
    } catch (error) {
        logger.error(`IPC设置配置[${key}]失败:`, error);
        throw error;
    }
})
    .validation({
        '0': { required: true, type: 'string' },
        '1': { required: true }
    })
    .description('设置指定配置项的值');

// 删除配置
Route.handle(IPC_METHODS.CONFIG_DELETE, async (_event, key: string) => {
    try {
        configManager.delete(key);
        return true;
    } catch (error) {
        logger.error(`IPC删除配置[${key}]失败:`, error);
        throw error;
    }
})
    .validation({
        '0': { required: true, type: 'string' }
    })
    .description('删除指定的配置项');

// 重置所有配置
Route.handle(IPC_METHODS.CONFIG_RESET, async (_event) => {
    try {
        configManager.reset();
        return true;
    } catch (error) {
        logger.error('IPC重置所有配置失败:', error);
        throw error;
    }
})
    .description('重置所有配置为默认值');

// 获取配置文件路径
Route.handle(IPC_METHODS.CONFIG_GET_PATH, async (_event): Promise<IpcResponse<string>> => {
    try {
        const path = configManager.getConfigPath();
        return {
            success: true,
            data: path
        };
    } catch (error) {
        logger.error('IPC获取配置路径失败:', error);
        return {
            success: false,
            error: (error as Error).message
        };
    }
})
    .description('获取配置文件的路径'); 