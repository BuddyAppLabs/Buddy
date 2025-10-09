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
