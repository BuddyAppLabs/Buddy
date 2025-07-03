<template>
    <div v-if="errorStore.isErrorModalVisible" class="modal modal-open">
        <div class="modal-box max-w-2xl max-h-[80vh]">
            <h3 class="font-bold text-lg mb-4">系统提示</h3>

            <div class="space-y-2 max-h-[60vh] overflow-y-auto">
                <div v-for="error in errorStore.errors" :key="error.id" :class="[
                    'alert',
                    error.type === 'error' ? 'alert-error' : 'alert-warning',
                ]">
                    <div class="flex justify-between items-start w-full">
                        <div class="flex gap-2">
                            <i v-if="error.type === 'error'" class="fas fa-exclamation-circle mt-1" />
                            <i v-else class="fas fa-exclamation-triangle mt-1" />
                            <span>{{ error.message }}</span>
                        </div>
                        <button class="btn btn-ghost btn-xs" @click="errorStore.removeError(error.id)">
                            <i class="fas fa-times" />
                        </button>
                    </div>
                </div>
            </div>

            <div class="modal-action">
                <button v-if="errorStore.errors.length > 0" class="btn btn-sm" @click="errorStore.clearErrors()">
                    清除全部
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useErrorStore } from '@/ui/stores/error-store';

const errorStore = useErrorStore();
</script>