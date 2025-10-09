<script setup lang="ts">
  import { Container } from '@coffic/cosy-ui/vue';
  import { RouterLink, useRoute } from 'vue-router';

  interface Props {
    hideTabs?: boolean;
  }

  withDefaults(defineProps<Props>(), {
    hideTabs: false,
  });

  const route = useRoute();

  // 根据当前路由确定活动的tab
  const getActiveTab = () => {
    return route.name || 'market-user';
  };
</script>

<template>
  <Container width="full" flex="col" gap="lg">
    <!-- 操作栏 -->
    <Container v-if="!hideTabs" width="full" background="primary/10">
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

    <slot />
  </Container>
</template>
