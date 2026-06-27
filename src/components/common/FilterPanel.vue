<script setup lang="ts">
/**
 * FilterPanel — 探索模式筛选面板
 *
 * 筛选功能: 红/蓝 toggle、事件类型 checkbox、部队列表 (按军/师分组)。
 * 点击部队 → emit filter 事件。
 */
import { computed } from 'vue'
import { useScenarioStore } from '@/stores/scenario'
import type { ForceSide, EventType, ForceFeature } from '@/data/types'

const scenarioStore = useScenarioStore()

// ===== 筛选状态 =====
// 为了简化，筛选逻辑由父组件处理，FilterPanel 仅负责 UI

const emit = defineEmits<{
  filterSide: [side: ForceSide | null]
  filterEventType: [types: EventType[]]
  selectForce: [force: ForceFeature]
}>()

const eventTypeOptions: { value: EventType; label: string }[] = [
  { value: 'battle', label: '战斗' },
  { value: 'meeting', label: '会议' },
  { value: 'crossing', label: '渡河' },
  { value: 'maneuver', label: '机动' },
]

/** 按编制级别分组部队 */
const forcesByLevel = computed(() => {
  const groups: Record<string, ForceFeature[]> = {}
  for (const force of scenarioStore.forces) {
    const level = force.properties.level
    if (!groups[level]) {
      groups[level] = []
    }
    groups[level].push(force)
  }
  return groups
})

const levelLabels: Record<string, string> = {
  army: '军团',
  division: '师',
  regiment: '团',
}

function handleSideToggle(side: ForceSide | null): void {
  emit('filterSide', side)
}

function handleForceClick(force: ForceFeature): void {
  emit('selectForce', force)
}
</script>

<template>
  <aside class="filter-panel">
    <h3 class="panel-title">筛选</h3>

    <!-- 红/蓝阵营切换 -->
    <fieldset class="filter-group">
      <legend class="filter-label">阵营</legend>
      <div class="side-toggles">
        <button
          class="side-btn red-btn"
          @click="handleSideToggle('red')"
        >
          红军
        </button>
        <button
          class="side-btn blue-btn"
          @click="handleSideToggle('blue')"
        >
          敌军
        </button>
        <button
          class="side-btn all-btn"
          @click="handleSideToggle(null)"
        >
          全部
        </button>
      </div>
    </fieldset>

    <!-- 事件类型 -->
    <fieldset class="filter-group">
      <legend class="filter-label">事件类型</legend>
      <label
        v-for="opt in eventTypeOptions"
        :key="opt.value"
        class="checkbox-label"
      >
        <input
          type="checkbox"
          :value="opt.value"
          class="checkbox-input"
        />
        {{ opt.label }}
      </label>
    </fieldset>

    <!-- 部队列表 -->
    <div class="filter-group">
      <span class="filter-label">部队列表</span>
      <div
        v-for="(forces, level) in forcesByLevel"
        :key="level"
        class="force-group"
      >
        <h4 class="force-level-heading">{{ levelLabels[level] || level }}</h4>
        <ul class="force-list">
          <li
            v-for="force in forces"
            :key="force.properties.id"
            class="force-item"
            :class="force.properties.side"
            @click="handleForceClick(force)"
          >
            <span class="force-dot" :class="force.properties.side"></span>
            {{ force.properties.name }}
            <span class="force-commander">{{ force.properties.commander }}</span>
          </li>
        </ul>
      </div>
    </div>
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

.panel-title {
  font-family: var(--font-heading, serif);
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-main, #1A1410);
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-bg-dark, #3D2F1F);
}

.filter-group {
  border: none;
  margin: 0 0 16px;
  padding: 0;
}

.filter-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted, #6B5D4A);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.side-toggles {
  display: flex;
  gap: 4px;
}

.side-btn {
  flex: 1;
  padding: 6px 0;
  border: 1px solid var(--color-bg-dark, #3D2F1F);
  border-radius: 3px;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
  color: var(--color-text-main, #1A1410);
}

.side-btn:hover {
  opacity: 0.8;
}

.red-btn:hover {
  background: var(--color-accent-red, #C0392B);
  color: #fff;
  border-color: var(--color-accent-red, #C0392B);
}

.blue-btn:hover {
  background: var(--color-accent-blue, #2C5F7C);
  color: #fff;
  border-color: var(--color-accent-blue, #2C5F7C);
}

.all-btn:hover {
  background: var(--color-bg-dark, #3D2F1F);
  color: var(--color-bg-paper, #F2E8D0);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  font-size: 13px;
  color: var(--color-text-main, #1A1410);
  cursor: pointer;
}

.checkbox-input {
  accent-color: var(--color-bg-dark, #3D2F1F);
}

.force-group {
  margin-bottom: 12px;
}

.force-level-heading {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted, #6B5D4A);
  margin: 0 0 4px;
  text-transform: uppercase;
}

.force-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.force-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
}

.force-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.force-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.force-dot.red {
  background: var(--color-accent-red, #C0392B);
}

.force-dot.blue {
  background: var(--color-accent-blue, #2C5F7C);
}

.force-commander {
  margin-left: auto;
  font-size: 10px;
  color: var(--color-text-muted, #6B5D4A);
}
</style>
