<script setup lang="ts">
  import { ref } from 'vue';
  import VersionDialog from './VersionDialog.vue';
  import { InfoIcon } from '@coffic/cosy-ui/vue';

  const showVersionDialog = ref(false);

  const openVersionDialog = () => {
    showVersionDialog.value = true;
  };
</script>

<template>
  <div class="relative">
    <button
      @click="openVersionDialog"
      class="btn btn-xs btn-ghost tooltip tooltip-top"
      data-tip="版本信息">
      <InfoIcon width="xs" />
    </button>

    <!-- 版本信息对话框 -->
    <VersionDialog v-model="showVersionDialog" />
  </div>
</template>
