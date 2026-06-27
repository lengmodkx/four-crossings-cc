<script setup lang="ts">
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

useKeyboardShortcuts()
</script>

<template>
  <router-view />
</template>
