<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="placeholder-view">
    <h1>{{ title || 'Placeholder' }}</h1>
    <p>This view is under construction.</p>
  </div>
</template>

<style scoped>
.placeholder-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}
</style>
