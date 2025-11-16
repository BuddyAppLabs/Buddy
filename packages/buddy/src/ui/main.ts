import './app.css';
import '../../node_modules/@coffic/cosy-ui/dist/app.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from '@/ui/layout/App.vue';
import router from '@/ui/router.js';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');

// 监听窗口模式变化
const ipc = window.ipc;
if (ipc) {
  ipc.receive('window-mode-changed', (mode: 'compact' | 'full') => {
    console.log('[UI] 窗口模式变化:', mode);
    
    // 更新 body 的 class
    document.body.classList.remove('compact-mode', 'full-mode');
    document.body.classList.add(`${mode}-mode`);
    
    // 触发自定义事件，供组件监听
    window.dispatchEvent(new CustomEvent('window-mode-changed', { detail: mode }));
  });
}
