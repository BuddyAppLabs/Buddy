/**
 * 路由模块索引文件
 * 统一导入所有路由，确保它们被注册到全局路由器
 */

// 导入所有路由模块以确保它们被执行和注册
import './actions.js';
import './ai.js';
import './common.js';
import './config.js';
import './market.js';
import './state.js';
import './update.js';

// 导出路由器实例和初始化函数
import { router } from '@coffic/buddy-foundation';

/**
 * 初始化所有路由
 */
export function initializeRoutes(): void {
    // 所有路由已经通过import自动注册
    router.initialize();

    console.log('🚀 路由系统已初始化');
    console.log(`📊 注册的路由数量: ${router.getRoutes().size}`);

    // 输出所有注册的路由（用于调试）
    if (process.env.NODE_ENV !== 'production') {
        console.log('📋 已注册的路由列表:');
        router.getRoutes().forEach((config, channel) => {
            console.log(`  - ${channel}: ${config.description || '无描述'}`);
        });
    }
}

export { router }; 