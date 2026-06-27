<script setup lang="ts">
/**
 * ErrorState — 错误状态组件 (军报中断)
 *
 * Props: message (默认 "数据缺失"), emit retry
 * 军用风格错误提示 + 重试按钮。
 */

defineProps<{
  message?: string
}>()

const emit = defineEmits<{
  retry: []
}>()

function handleRetry(): void {
  emit('retry')
}
</script>

<template>
  <div class="error-state">
    <div class="error-icon">&#x26A0;</div>
    <p class="error-message">军报中断——{{ message || '数据缺失' }}</p>
    <button class="retry-btn" @click="handleRetry">重试</button>
  </div>
</template>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  color: var(--color-accent-red, #C0392B);
}

.error-message {
  font-family: var(--font-body, serif);
  font-size: 15px;
  color: var(--color-accent-red, #C0392B);
  margin: 0;
  letter-spacing: 1px;
}

.retry-btn {
  padding: 8px 24px;
  border: 1px solid var(--color-accent-red, #C0392B);
  border-radius: 3px;
  background: transparent;
  color: var(--color-accent-red, #C0392B);
  font-family: var(--font-body, serif);
  font-size: 13px;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: var(--color-accent-red, #C0392B);
  color: var(--color-bg-paper, #F2E8D0);
}
</style>
