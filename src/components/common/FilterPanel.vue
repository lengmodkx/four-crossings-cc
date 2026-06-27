<script setup lang="ts">
/**
 * FilterPanel — 探索模式筛选面板 (占位)
 *
 * Task 4.5 将实现完整筛选面板。
 */
</script>

<template>
  <aside class="filter-panel">
    <p class="placeholder-text">筛选面板</p>
  </aside>
</template>

<style scoped>
.filter-panel {
  width: 280px;
  border-right: 1px solid var(--color-bg-dark, #3D2F1F);
  overflow-y: auto;
  background: var(--color-bg-paper, #F2E8D0);
  flex-shrink: 0;
  padding: 1rem;
  font-family: var(--font-body, serif);
}

.placeholder-text {
  color: var(--color-text-muted, #6B5D4A);
  font-size: 14px;
}
</style>
