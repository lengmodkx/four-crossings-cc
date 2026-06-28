<script setup lang="ts">
/**
 * FilterPanel - 探索模式筛选面板 (手风琴折叠)
 *
 * 桌面端 (>1024px): 作为内联侧栏固定显示
 * 移动端 (<=1024px): 作为底部抽屉,通过 uiStore.filterOpen 切换
 *
 * Sections (accordion):
 *  1. 部队列表 - from scenario.forces, deduplicated names, click selects
 *  2. 事件列表 - from scenario.events, sorted by time, click jumps time
 *  3. 人物列表 - from scenario.persons, click selects
 *  4. 阵营筛选 - red/blue/all toggle
 *  5. 事件类型 - checkboxes
 */

import { ref, computed } from 'vue'
import { useScenarioStore } from '@/stores/scenario'
import { useTimeStore } from '@/stores/time'
import { useSelectionStore } from '@/stores/selection'
import { useUiStore } from '@/stores/ui'
import { useBreakpoint } from '@/composables/useBreakpoint'
import type { ForceSide, EventType, ForceFeature, EventRecord, Person } from '@/data/types'

const scenarioStore = useScenarioStore()
const timeStore = useTimeStore()
const selectionStore = useSelectionStore()
const uiStore = useUiStore()
const { isTablet, isMobile } = useBreakpoint()
// 桌面端 = width >= 1024 (即 !isMobile && !isTablet)
// 移动端 = isMobile || isTablet
const onMobileOrTablet = computed(() => isMobile.value || isTablet.value)

// ===== Accordion state =====
const expandedSections = ref<Set<string>>(new Set(['forces', 'events']))

function toggleSection(key: string): void {
  if (expandedSections.value.has(key)) {
    expandedSections.value.delete(key)
  } else {
    expandedSections.value.add(key)
  }
}

function isExpanded(key: string): boolean {
  return expandedSections.value.has(key)
}

// ===== 部队列表 (去重部队名) =====
const dedupedForces = computed<ForceFeature[]>(() => {
  const seen = new Set<string>()
  return scenarioStore.forces.filter((f) => {
    const key = f.properties.name
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
})

// ===== 事件列表 (按时间排序) =====
const sortedEvents = computed<EventRecord[]>(() => {
  return [...scenarioStore.events].sort(
    (a, b) => a.timestamp.localeCompare(b.timestamp)
  )
})

// ===== 人物列表 =====
const persons = computed<Person[]>(() => {
  return scenarioStore.persons
})

// ===== 阵营筛选 =====
function handleSideToggle(_side: ForceSide | null): void {
  // 筛选逻辑由父组件处理; 可用于未来扩展
}

// ===== 部队点击 =====
function handleForceClick(force: ForceFeature): void {
  selectionStore.selectForce(force)
}

// ===== 事件点击 => 跳转时间 =====
function handleEventClick(evt: EventRecord): void {
  timeStore.setTime(evt.timestamp)
  selectionStore.selectEvent(evt)
  if (onMobileOrTablet.value) uiStore.closeFilter()
}

// ===== 人物点击 =====
function handlePersonClick(person: Person): void {
  selectionStore.selectPerson(person)
  if (onMobileOrTablet.value) uiStore.closeFilter()
}

// === Event type helpers ===
const eventTypeOptions: { value: EventType; label: string }[] = [
  { value: 'battle', label: '战斗' },
  { value: 'meeting', label: '会议' },
  { value: 'crossing', label: '渡赤' },
  { value: 'maneuver', label: '机动' },
]
</script>

<template>
  <!-- 桌面端内联面板 -->
  <aside class="filter-panel only-desktop">
    <h3 class="panel-title">探索目录</h3>

    <!-- 1. 部队列表 -->
    <div class="accordion-section">
      <button
        class="accordion-header"
        :class="{ expanded: isExpanded('forces') }"
        @click="toggleSection('forces')"
      >
        <span class="accordion-arrow" :class="{ open: isExpanded('forces') }">&#9654;</span>
        部队列表
        <span class="accordion-count">({{ dedupedForces.length }})</span>
      </button>
      <div v-show="isExpanded('forces')" class="accordion-body">
        <ul class="item-list">
          <li
            v-for="force in dedupedForces"
            :key="force.properties.id"
            class="item-row"
            :class="force.properties.side"
            @click="handleForceClick(force)"
          >
            <span class="item-dot" :class="force.properties.side"></span>
            <span class="item-name">{{ force.properties.name }}</span>
            <span class="item-meta">{{ force.properties.commander }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- 2. 事件列表 -->
    <div class="accordion-section">
      <button
        class="accordion-header"
        :class="{ expanded: isExpanded('events') }"
        @click="toggleSection('events')"
      >
        <span class="accordion-arrow" :class="{ open: isExpanded('events') }">&#9654;</span>
        事件列表
        <span class="accordion-count">({{ sortedEvents.length }})</span>
      </button>
      <div v-show="isExpanded('events')" class="accordion-body">
        <ul class="item-list">
          <li
            v-for="evt in sortedEvents"
            :key="evt.id"
            class="item-row"
            @click="handleEventClick(evt)"
          >
            <span class="item-dot event"></span>
            <span class="item-name">{{ evt.title }}</span>
            <span class="item-meta">{{ evt.timestamp.slice(0, 10) }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- 3. 人物列表 -->
    <div class="accordion-section">
      <button
        class="accordion-header"
        :class="{ expanded: isExpanded('persons') }"
        @click="toggleSection('persons')"
      >
        <span class="accordion-arrow" :class="{ open: isExpanded('persons') }">&#9654;</span>
        人物列表
        <span class="accordion-count">({{ persons.length }})</span>
      </button>
      <div v-show="isExpanded('persons')" class="accordion-body">
        <ul class="item-list">
          <li
            v-for="person in persons"
            :key="person.id"
            class="item-row"
            @click="handlePersonClick(person)"
          >
            <span class="item-dot person"></span>
            <span class="item-name">{{ person.name }}</span>
            <span class="item-meta">{{ person.role }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- 4. 阵营筛选 -->
    <div class="accordion-section">
      <button
        class="accordion-header"
        :class="{ expanded: isExpanded('side') }"
        @click="toggleSection('side')"
      >
        <span class="accordion-arrow" :class="{ open: isExpanded('side') }">&#9654;</span>
        阵营筛选
      </button>
      <div v-show="isExpanded('side')" class="accordion-body">
        <div class="side-toggles">
          <button class="side-btn red-btn" @click="handleSideToggle('red')">红军</button>
          <button class="side-btn blue-btn" @click="handleSideToggle('blue')">敌军</button>
          <button class="side-btn all-btn" @click="handleSideToggle(null)">全部</button>
        </div>
      </div>
    </div>

    <!-- 5. 事件类型 -->
    <div class="accordion-section">
      <button
        class="accordion-header"
        :class="{ expanded: isExpanded('eventType') }"
        @click="toggleSection('eventType')"
      >
        <span class="accordion-arrow" :class="{ open: isExpanded('eventType') }">&#9654;</span>
        事件类型
      </button>
      <div v-show="isExpanded('eventType')" class="accordion-body">
        <label
          v-for="opt in eventTypeOptions"
          :key="opt.value"
          class="checkbox-label"
        >
          <input type="checkbox" :value="opt.value" class="checkbox-input" />
          {{ opt.label }}
        </label>
      </div>
    </div>
  </aside>

  <!-- 移动端底部抽屉 -->
  <div
    class="drawer-backdrop only-mobile"
    :class="{ 'is-open': uiStore.filterOpen }"
    @click="uiStore.closeFilter()"
  ></div>
  <aside
    class="drawer filter-panel-drawer only-mobile"
    :class="['drawer-bottom', { 'is-open': uiStore.filterOpen }]"
  >
    <div class="drawer-header">
      <span class="drawer-title">探索目录</span>
      <button class="drawer-close" @click="uiStore.closeFilter()" aria-label="关闭">×</button>
    </div>
    <div class="drawer-body">
      <!-- 1. 部队列表 -->
      <div class="accordion-section">
        <button
          class="accordion-header"
          :class="{ expanded: isExpanded('forces') }"
          @click="toggleSection('forces')"
        >
          <span class="accordion-arrow" :class="{ open: isExpanded('forces') }">&#9654;</span>
          部队列表
          <span class="accordion-count">({{ dedupedForces.length }})</span>
        </button>
        <div v-show="isExpanded('forces')" class="accordion-body">
          <ul class="item-list">
            <li
              v-for="force in dedupedForces"
              :key="force.properties.id"
              class="item-row"
              :class="force.properties.side"
              @click="handleForceClick(force)"
            >
              <span class="item-dot" :class="force.properties.side"></span>
              <span class="item-name">{{ force.properties.name }}</span>
              <span class="item-meta">{{ force.properties.commander }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 2. 事件列表 -->
      <div class="accordion-section">
        <button
          class="accordion-header"
          :class="{ expanded: isExpanded('events') }"
          @click="toggleSection('events')"
        >
          <span class="accordion-arrow" :class="{ open: isExpanded('events') }">&#9654;</span>
          事件列表
          <span class="accordion-count">({{ sortedEvents.length }})</span>
        </button>
        <div v-show="isExpanded('events')" class="accordion-body">
          <ul class="item-list">
            <li
              v-for="evt in sortedEvents"
              :key="evt.id"
              class="item-row"
              @click="handleEventClick(evt)"
            >
              <span class="item-dot event"></span>
              <span class="item-name">{{ evt.title }}</span>
              <span class="item-meta">{{ evt.timestamp.slice(0, 10) }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 3. 人物列表 -->
      <div class="accordion-section">
        <button
          class="accordion-header"
          :class="{ expanded: isExpanded('persons') }"
          @click="toggleSection('persons')"
        >
          <span class="accordion-arrow" :class="{ open: isExpanded('persons') }">&#9654;</span>
          人物列表
          <span class="accordion-count">({{ persons.length }})</span>
        </button>
        <div v-show="isExpanded('persons')" class="accordion-body">
          <ul class="item-list">
            <li
              v-for="person in persons"
              :key="person.id"
              class="item-row"
              @click="handlePersonClick(person)"
            >
              <span class="item-dot person"></span>
              <span class="item-name">{{ person.name }}</span>
              <span class="item-meta">{{ person.role }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 4. 阵营筛选 -->
      <div class="accordion-section">
        <button
          class="accordion-header"
          :class="{ expanded: isExpanded('side') }"
          @click="toggleSection('side')"
        >
          <span class="accordion-arrow" :class="{ open: isExpanded('side') }">&#9654;</span>
          阵营筛选
        </button>
        <div v-show="isExpanded('side')" class="accordion-body">
          <div class="side-toggles">
            <button class="side-btn red-btn" @click="handleSideToggle('red')">红军</button>
            <button class="side-btn blue-btn" @click="handleSideToggle('blue')">敌军</button>
            <button class="side-btn all-btn" @click="handleSideToggle(null)">全部</button>
          </div>
        </div>
      </div>

      <!-- 5. 事件类型 -->
      <div class="accordion-section">
        <button
          class="accordion-header"
          :class="{ expanded: isExpanded('eventType') }"
          @click="toggleSection('eventType')"
        >
          <span class="accordion-arrow" :class="{ open: isExpanded('eventType') }">&#9654;</span>
          事件类型
        </button>
        <div v-show="isExpanded('eventType')" class="accordion-body">
          <label
            v-for="opt in eventTypeOptions"
            :key="opt.value"
            class="checkbox-label"
          >
            <input type="checkbox" :value="opt.value" class="checkbox-input" />
            {{ opt.label }}
          </label>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* ===== 桌面端内联 ===== */
.filter-panel {
  width: 280px;
  border-right: 1px solid var(--color-bg-dark, #3D2F1F);
  overflow-y: auto;
  background: var(--color-bg-paper, #F2E8D0);
  flex-shrink: 0;
  font-family: var(--font-body, serif);
}
.panel-title {
  font-family: var(--font-heading, serif);
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-main, #1A1410);
  margin: 0;
  padding: 16px 12px 12px;
  border-bottom: 2px solid var(--color-bg-dark, #3D2F1F);
}
.accordion-section {
  border-bottom: 1px solid var(--color-contour, #6B7F4A);
}
.accordion-header {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  font-family: var(--font-heading, serif);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-main, #1A1410);
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
  min-height: 40px;
  -webkit-tap-highlight-color: transparent;
}
.accordion-header:hover { background: rgba(0, 0, 0, 0.04); }
.accordion-header:active { background: rgba(0, 0, 0, 0.08); }
.accordion-arrow {
  display: inline-block;
  width: 14px;
  font-size: 10px;
  color: var(--color-text-muted, #6B5D4A);
  transition: transform 0.2s;
}
.accordion-arrow.open { transform: rotate(90deg); }
.accordion-count {
  margin-left: auto;
  font-size: 11px;
  font-weight: 400;
  color: var(--color-text-muted, #6B5D4A);
}
.accordion-body { padding: 4px 0 8px; }
.item-list { list-style: none; margin: 0; padding: 0; }
.item-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.12s;
  min-height: 36px;
}
.item-row:hover { background: rgba(0, 0, 0, 0.06); }
.item-row:active { background: rgba(0, 0, 0, 0.1); }
.item-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.item-dot.red   { background: var(--color-accent-red, #C0392B); }
.item-dot.blue  { background: var(--color-accent-blue, #2C5F7C); }
.item-dot.event { background: var(--color-highlight, #D4A017); }
.item-dot.person{ background: var(--color-contour, #6B7F4A); }
.item-name {
  flex: 1; min-width: 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  color: var(--color-text-main, #1A1410);
}
.item-meta { font-size: 10px; color: var(--color-text-muted, #6B5D4A); flex-shrink: 0; }
.side-toggles { display: flex; gap: 4px; padding: 0 12px; }
.side-btn {
  flex: 1; padding: 8px 0;
  border: 1px solid var(--color-bg-dark, #3D2F1F);
  border-radius: 3px;
  font-family: inherit; font-size: 12px;
  cursor: pointer; transition: all 0.2s;
  background: transparent;
  color: var(--color-text-main, #1A1410);
  min-height: 36px;
  -webkit-tap-highlight-color: transparent;
}
.red-btn:hover   { background: var(--color-accent-red, #C0392B); color: #fff; border-color: var(--color-accent-red, #C0392B); }
.blue-btn:hover  { background: var(--color-accent-blue, #2C5F7C); color: #fff; border-color: var(--color-accent-blue, #2C5F7C); }
.all-btn:hover   { background: var(--color-bg-dark, #3D2F1F); color: var(--color-bg-paper, #F2E8D0); }
.checkbox-label {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 12px;
  font-size: 13px;
  color: var(--color-text-main, #1A1410);
  cursor: pointer;
  min-height: 36px;
}
.checkbox-input { accent-color: var(--color-bg-dark, #3D2F1F); width: 16px; height: 16px; }

/* ===== 移动端抽屉 (共享 panel 内容样式) ===== */
.filter-panel-drawer {
  font-family: var(--font-body, serif);
}
.filter-panel-drawer .accordion-header { padding: 12px 16px; }
.filter-panel-drawer .item-row { padding: 10px 16px; }
.filter-panel-drawer .checkbox-label { padding: 8px 16px; }
.filter-panel-drawer .side-toggles { padding: 0 16px; }
</style>
