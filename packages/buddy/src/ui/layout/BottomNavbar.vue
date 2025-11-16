<script setup lang="ts">
  import { Button } from '@coffic/cosy-ui/vue';
  import {
    RiSearchLine,
    RiComputerLine,
    RiCloudLine,
    RiCodeBoxLine,
    RiFolderZipLine,
    RiSettings3Line,
    RiSparklingLine,
  } from '@remixicon/vue';
  import { useNavigation } from '@/ui/composables/useNavigation';
  import { useRoute } from 'vue-router';

  const {
    goToHome,
    goToMarketUser,
    goToMarketRemote,
    goToMarketDevRepo,
    goToMarketDevPackage,
    goToSettings,
    goToAIChat,
  } = useNavigation();

  const route = useRoute();

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
    <!-- <Button
      size="sm"
      variant="ghost"
      @click="goToMarketDevRepo"
      :class="{ 'bg-primary/10': isRouteActive('market-dev-repo') }"
      tooltip="开发仓库">
      <RiCodeBoxLine class="w-4 h-4" />
    </Button> -->

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

    <!-- AI 聊天 -->
    <Button
      size="sm"
      variant="ghost"
      @click="goToAIChat"
      :class="{ 'bg-primary/10': isRouteActive('ai-chat') }"
      tooltip="AI 聊天">
      <RiSparklingLine class="w-4 h-4" />
    </Button>

    <!-- 设置 -->
    <Button
      size="sm"
      variant="ghost"
      @click="goToSettings"
      :class="{ 'bg-primary/10': isRouteActive('settings') || isRouteActive('ai-settings') }"
      tooltip="设置">
      <RiSettings3Line class="w-4 h-4" />
    </Button>
  </div>
</template>
