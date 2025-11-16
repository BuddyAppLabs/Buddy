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

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: '首页',
      viewType: 'home',
    },
  },
  {
    path: '/plugins',
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
        name: 'market-user',
        component: LocalRepo,
        meta: {
          title: '本地仓库',
          viewType: 'market-user',
        },
      },
      {
        path: 'remote',
        name: 'market-remote',
        component: RemoteRepo,
        meta: {
          title: '远程仓库',
          viewType: 'market-remote',
        },
      },
      {
        path: 'dev-repo',
        name: 'market-dev-repo',
        component: DevRepo,
        meta: {
          title: '开发仓库',
          viewType: 'market-dev-repo',
        },
      },
      {
        path: 'dev-package',
        name: 'market-dev-package',
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
    name: 'hero',
    component: HeroView,
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: {
      title: '设置',
      viewType: 'settings',
    },
  },
  {
    path: '/settings/ai',
    name: 'ai-settings',
    component: AISettingsView,
    meta: {
      title: 'AI 设置',
      viewType: 'ai-settings',
    },
  },
  {
    path: '/ai-chat',
    name: 'ai-chat',
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
    document.title = `GitOK - ${to.meta.title}`;
  }

  next();
});

export default router;
