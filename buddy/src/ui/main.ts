import './app.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './components/App.vue';
import router from './router/index.js';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');
