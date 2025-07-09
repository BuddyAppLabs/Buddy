<script setup lang="ts">
  import { useErrorStore } from '@/ui/stores/error-store';
  import { Alert, Button } from '@coffic/cosy-ui/vue';

  const errorStore = useErrorStore();
</script>

<template>
  <div v-if="errorStore.isErrorModalVisible" class="modal modal-open z-[999]">
    <div class="modal-box flex max-w-2xl flex-col !overflow-hidden">
      <h3 class="font-bold text-lg">系统提示</h3>

      <div class="my-4 flex-1 space-y-2 overflow-y-auto">
        <Alert
          v-for="error in errorStore.errors"
          :key="error.id"
          :type="error.type"
          :title="error.message"
          closable
          @close="errorStore.removeError(error.id)" />
      </div>

      <div class="modal-action">
        <Button
          v-if="errorStore.errors.length > 0"
          @click="errorStore.clearErrors()"
          >清除全部</Button
        >
      </div>
    </div>
  </div>
</template>
