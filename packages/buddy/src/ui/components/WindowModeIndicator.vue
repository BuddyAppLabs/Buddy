<!--
  窗口模式指示器组件
  显示当前窗口模式（精简/完整）
-->
<script setup lang="ts">
import { useWindowMode } from '@/ui/composables/useWindowMode';

const { mode, isCompact, isFull } = useWindowMode();
</script>

<template>
  <div class="window-mode-indicator">
    <div class="mode-badge" :class="{ 'compact': isCompact(), 'full': isFull() }">
      <span class="mode-icon">{{ isCompact() ? '⚡' : '🖥️' }}</span>
      <span class="mode-text">{{ isCompact() ? '精简模式' : '完整模式' }}</span>
    </div>
  </div>
</template>

<style scoped>
.window-mode-indicator {
  display: inline-flex;
  align-items: center;
}

.mode-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  transition: all 0.3s ease;
}

.mode-badge.compact {
  background-color: rgba(59, 130, 246, 0.1);
  color: rgb(59, 130, 246);
}

.mode-badge.full {
  background-color: rgba(16, 185, 129, 0.1);
  color: rgb(16, 185, 129);
}

.mode-icon {
  font-size: 1rem;
}

.mode-text {
  font-weight: 500;
}
</style>
