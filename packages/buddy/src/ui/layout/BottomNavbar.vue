<script setup lang="ts">
  import { Button } from '@coffic/cosy-ui/vue';
  import {
    RiSearchLine,
    RiComputerLine,
    RiCloudLine,
    RiCodeBoxLine,
    RiFolderZipLine,
  } from '@remixicon/vue';
  import { useNavigation } from '@/ui/composables/useNavigation';
  import { useRouter, useRoute } from 'vue-router';
  import { useAppStore } from '@/ui/stores/app-store';

  const { goToHome } = useNavigation();
  const router = useRouter();
  const route = useRoute();
  const appStore = useAppStore();

  // 跳转到本地仓库
  const goToMarketUser = () => {
    router.push('/plugins/user');
    appStore.setView('plugins');
  };

  // 跳转到远程仓库
  const goToMarketRemote = () => {
    router.push('/plugins/remote');
    appStore.setView('plugins');
  };

  // 跳转到开发仓库
  const goToMarketDevRepo = () => {
    router.push('/plugins/dev-repo');
    appStore.setView('plugins');
  };

  // 跳转到开发包
  const goToMarketDevPackage = () => {
    router.push('/plugins/dev-package');
    appStore.setView('plugins');
  };

  // 判断当前路由是否匹配
  const isRouteActive = (routeName: string) => {
    return route.name === routeName;
  };
</script>

<template>
  <div class="flex flex-row gap-2">
    <!-- 本地仓库 -->
    <Button
      size="sm"
      variant="ghost"
      @click="goToMarketUser"
      :class="{ 'bg-primary/10': isRouteActive('market-user') }"
      tooltip="本地仓库">
      <RiComputerLine class="w-4 h-4" />
    </Button>

    <!-- 远程仓库 -->
    <Button
      size="sm"
      variant="ghost"
      @click="goToMarketRemote"
      :class="{ 'bg-primary/10': isRouteActive('market-remote') }"
      tooltip="远程仓库">
      <RiCloudLine class="w-4 h-4" />
    </Button>

    <!-- 开发仓库 -->
    <Button
      size="sm"
      variant="ghost"
      @click="goToMarketDevRepo"
      :class="{ 'bg-primary/10': isRouteActive('market-dev-repo') }"
      tooltip="开发仓库">
      <RiCodeBoxLine class="w-4 h-4" />
    </Button>

    <!-- 开发包 -->
    <Button
      size="sm"
      variant="ghost"
      @click="goToMarketDevPackage"
      :class="{ 'bg-primary/10': isRouteActive('market-dev-package') }"
      tooltip="开发包">
      <RiFolderZipLine class="w-4 h-4" />
    </Button>

    <!-- 首页 -->
    <Button
      size="sm"
      variant="ghost"
      @click="goToHome"
      :class="{ 'bg-primary/10': route.name === 'home' }"
      tooltip="首页">
      <RiSearchLine class="w-4 h-4" />
    </Button>
  </div>
</template>
