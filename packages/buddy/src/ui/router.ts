/**
 * 路由配置
 *
 * 管理应用的所有路由：
 * 1. 使用 hash 模式，适合桌面应用
 * 2. 配置所有可用的视图路由
 * 3. 设置路由元信息，如标题等
 */

import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from 'vue-router';
import HomeView from '@/ui/views/HomeView.vue';
import HeroView from '@/ui/views/HeroView.vue';
import LocalRepo from '@/ui/views/LocalRepo.vue';
import RemoteRepo from '@/ui/views/RemoteRepo.vue';
import DevRepo from '@/ui/views/DevRepo.vue';
import DevPackage from '@/ui/views/DevPackage.vue';
import SettingsView from '@/ui/views/SettingsView.vue';
import AISettingsView from '@/ui/views/AISettingsView.vue';
import AIChatView from '@/ui/views/AIChatView.vue';
import PluginsLayout from '@/ui/views/PluginsLayout.vue';
import { ROUTE_NAMES } from './router/routes';

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: ROUTE_NAMES.HOME,
    component: HomeView,
    meta: {
      title: '首页',
      viewType: 'home',
    },
  },
  {
    path: '/plugins',
    component: PluginsLayout,
    meta: {
      title: '插件商店',
      viewType: 'plugins',
    },
    children: [
      {
        path: '',
        redirect: 'user',
      },
      {
        path: 'user',
        name: ROUTE_NAMES.MARKET_USER,
        component: LocalRepo,
        meta: {
          title: '本地仓库',
          viewType: 'market-user',
        },
      },
      {
        path: 'remote',
        name: ROUTE_NAMES.MARKET_REMOTE,
        component: RemoteRepo,
        meta: {
          title: '远程仓库',
          viewType: 'market-remote',
        },
      },
      {
        path: 'dev-repo',
        name: ROUTE_NAMES.MARKET_DEV_REPO,
        component: DevRepo,
        meta: {
          title: '开发仓库',
          viewType: 'market-dev-repo',
        },
      },
      {
        path: 'dev-package',
        name: ROUTE_NAMES.MARKET_DEV_PACKAGE,
        component: DevPackage,
        meta: {
          title: '开发包',
          viewType: 'market-dev-package',
        },
      },
    ],
  },
  {
    path: '/hero',
    name: ROUTE_NAMES.HERO,
    component: HeroView,
  },
  {
    path: '/settings',
    name: ROUTE_NAMES.SETTINGS,
    component: SettingsView,
    meta: {
      title: '设置',
      viewType: 'settings',
    },
  },
  {
    path: '/settings/ai',
    name: ROUTE_NAMES.AI_SETTINGS,
    component: AISettingsView,
    meta: {
      title: 'AI 设置',
      viewType: 'ai-settings',
    },
  },
  {
    path: '/ai-chat',
    name: ROUTE_NAMES.AI_CHAT,
    component: AIChatView,
    meta: {
      title: 'AI 聊天',
      viewType: 'ai-chat',
    },
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 路由守卫：处理窗口标题等
router.beforeEach((to, _from, next) => {
  // 设置窗口标题
  if (to.meta.title) {
    document.title = `Buddy - ${to.meta.title}`;
  }

  next();
});

// 路由错误处理
router.onError((error) => {
  console.error('[Router] 路由错误:', error);
});

export default router;
