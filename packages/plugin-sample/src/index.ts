import fs from 'fs';
import path from 'path';
import { GetActionsArgs, SuperAction, SuperPlugin, ExecuteResult } from '@coffic/buddy-types';

// 日志函数
const log = {
    info: function (message: string, ...args: any[]): void {
        console.log(`[示例插件] ${message}`, ...args);
    },
    error: function (message: string, ...args: any[]): void {
        console.error(`[示例插件] ${message}`, ...args);
    },
    debug: function (message: string, ...args: any[]): void {
        console.log(`[示例插件:调试] ${message}`, ...args);
    },
};

// 插件信息
const plugin: SuperPlugin = {
    name: '示例插件',
    description: '这是一个示例插件，演示如何创建GitOK插件',
    version: '1.0.0',
    author: 'Coffic',
    id: '',
    path: '',
    type: 'user',

    /**
     * 获取插件提供的动作列表
     * @param {PluginContext} context 插件上下文
     * @returns {Promise<Action[]>} 动作列表
     */
    async getActions(args: GetActionsArgs): Promise<SuperAction[]> {
        log.info(
            `获取动作列表，关键词: "${args.keyword}", 被覆盖应用: "${args.overlaidApp}"`
        );

        // 创建基础动作列表
        const actions: SuperAction[] = [
            {
                id: `hello`,
                description: '显示一个问候消息',
                icon: '👋',
                globalId: '',
                pluginId: ''
            },
            {
                id: `time`,
                description: '显示当前时间',
                icon: '🕒',
                viewPath: 'views/time.html',
                viewMode: 'embedded',
                devTools: false,
                globalId: '',
                pluginId: ''
            },
            {
                id: `calculate`,
                description: '简单的计算器',
                icon: '🧮',
                viewPath: 'views/calculator.html',
                viewMode: 'window',
                devTools: false,
                globalId: '',
                pluginId: ''
            },
        ];

        log.debug(`基础动作列表: ${actions.length} 个动作`);

        // 如果有关键词，过滤匹配的动作
        if (args.keyword) {
            const lowerKeyword = args.keyword.toLowerCase();
            log.debug(`过滤包含关键词 "${lowerKeyword}" 的动作`);

            const filteredActions = actions.filter(
                (action) => action.description.toLowerCase().includes(lowerKeyword)
            );

            log.info(`过滤后返回 ${filteredActions.length} 个动作`);
            return filteredActions;
        }

        log.info(`返回所有 ${actions.length} 个动作`);
        return actions;
    },

    /**
     * 执行插件动作
     * @param {string} actionId 要执行的动作ID
     * @param {string} keyword 搜索关键词
     * @returns {Promise<ExecuteResult>} 动作执行结果
     */
    async executeAction(actionId: string, keyword: string): Promise<ExecuteResult> {
        log.info(`执行动作: ${actionId}`);

        try {
            switch (actionId) {
                case `hello`:
                    log.debug(`执行打招呼动作`);
                    return { success: true, message: '你好，这是来自示例插件的问候！' };

                case `time`:
                    log.debug(`执行时间动作（有自定义视图）`);
                    return { success: true, message: '当前时间是：' + new Date().toLocaleString() };

                case `calculate`:
                    log.debug(`执行计算器动作（有自定义视图）`);
                    return { success: true, message: '计算结果是：' + (1 + 1) };

                default:
                    const errorMsg = `未知的动作ID: ${actionId}`;
                    log.error(errorMsg);
                    throw new Error(errorMsg);
            }
        } catch (error) {
            log.error(`执行动作 ${actionId} 失败:`, error);
            throw error;
        }
    },

    /**
     * 获取视图内容
     * @param {string} viewPath 视图路径
     * @returns {Promise<string>} HTML内容
     */
    async getViewContent(viewPath: string): Promise<string> {
        log.info(`获取视图内容: ${viewPath}`);

        try {
            // 从文件系统读取HTML文件
            const htmlFilePath = path.join(__dirname, '..', viewPath);
            log.debug(`尝试读取文件: ${htmlFilePath}`);

            if (!fs.existsSync(htmlFilePath)) {
                throw new Error(`视图文件不存在: ${htmlFilePath}`);
            }

            // 读取HTML文件内容
            const html = fs.readFileSync(htmlFilePath, 'utf-8');

            log.info(
                `成功读取视图HTML，文件: ${htmlFilePath}，长度: ${html.length} 字节`
            );
            return html;
        } catch (error) {
            const err = error as Error;
            log.error(`获取视图内容失败:`, err);
            throw err;
        }
    },
};

// 插件初始化输出
log.info(`示例插件已加载: ${plugin.name} v${plugin.version}`);

// 导出插件
export = plugin;