<script setup lang="ts">
/**
 * SidePanel — 详情侧面板 (占位)
 *
 * Task 4.4 将实现完整的详情面板与 DetailCards。
 */
</script>

<template>
  <aside class="side-panel">
    <p class="placeholder-text">点击部队/事件/人物查看详情</p>
  </aside>
</template>

<style scoped>
.side-panel {
  width: 360px;
  border-left: 1px solid var(--color-bg-dark, #3D2F1F);
  overflow-y: auto;
  background: var(--color-bg-paper, #F2E8D0);
  flex-shrink: 0;
}

.placeholder-text {
  padding: 24px;
  color: var(--color-text-muted, #6B5D4A);
  font-style: italic;
  font-size: 14px;
}
</style>
