<script setup lang="ts">
  import { Container } from '@coffic/cosy-ui/vue';
  import { useMarket } from '../composables/useMarket';
  import { RouterLink, useRoute } from 'vue-router';

  const { loadPlugins } = useMarket();
  const route = useRoute();

  // 根据当前路由确定活动的tab
  const getActiveTab = () => {
    return route.name || 'market-user';
  };

  // 当路由改变时重新加载数据
  loadPlugins();
</script>

<template>
  <Container border flex="col">
    <!-- 操作栏 -->
    <Container size="full" border>
      <RouterLink
        to="/plugins/user"
        role="tab"
        class="tab"
        :class="{ 'tab-active': getActiveTab() === 'market-user' }">
        本地仓库
      </RouterLink>
      <RouterLink
        to="/plugins/remote"
        role="tab"
        class="tab"
        :class="{ 'tab-active': getActiveTab() === 'market-remote' }">
        远程仓库
      </RouterLink>
      <RouterLink
        to="/plugins/dev-repo"
        role="tab"
        class="tab"
        :class="{ 'tab-active': getActiveTab() === 'market-dev-repo' }">
        开发仓库
      </RouterLink>
      <RouterLink
        to="/plugins/dev-package"
        role="tab"
        class="tab"
        :class="{
          'tab-active': getActiveTab() === 'market-dev-package',
        }">
        开发包
      </RouterLink>
    </Container>

    <router-view />
  </Container>
</template>
