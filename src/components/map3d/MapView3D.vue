<script setup lang="ts">
/**
 * MapView3D — 鸟瞰沙盘 3D 地图组件
 *
 * 使用 Three.js 渲染地形、部队、轨迹的 3D 鸟瞰场景。
 * 设计参考: §5.4 鸟瞰沙盘模式
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useThreeSetup } from './useThreeSetup'

const containerRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!containerRef.value) {
    console.error('3D 容器未找到')
    return
  }

  const { scene, camera, renderer, dispose } = useThreeSetup(containerRef)

  // 存储到 template ref 以便清理
  const el = containerRef.value as any
  el.__threeDispose = dispose
})

onBeforeUnmount(() => {
  const el = containerRef.value as any
  if (el && typeof el.__threeDispose === 'function') {
    el.__threeDispose()
  }
})
</script>

<template>
  <div class="map-3d" ref="containerRef"></div>
</template>

<style scoped>
.map-3d {
  width: 100%;
  height: 100%;
}
</style>
