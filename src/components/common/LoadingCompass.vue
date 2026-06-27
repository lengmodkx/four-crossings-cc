<script setup lang="ts">
/**
 * LoadingCompass — 复古指南针加载动画
 *
 * 显示旋转指南针符号 + "正在加载史料..." 文字。
 */
</script>

<template>
  <div class="loading-compass">
    <div class="compass-ring">
      <span class="compass-needle">&#x1F9ED;</span>
    </div>
    <p class="loading-text">正在加载史料...</p>
  </div>
</template>

<style scoped>
.loading-compass {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px;
}

.compass-ring {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  animation: spin 2s linear infinite;
}

.compass-needle {
  font-size: 48px;
}

.loading-text {
  font-family: var(--font-body, serif);
  font-size: 14px;
  color: var(--color-text-muted, #6B5D4A);
  letter-spacing: 2px;
  margin: 0;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
