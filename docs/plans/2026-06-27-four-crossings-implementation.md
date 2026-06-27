---
title: 四渡赤水·全景沙盘 — 实施计划
date: 2026-06-27
status: 进行中
project: four_crossings_cc
scope: MVP(0.1) — 三视图 + 全程四渡 + 巧渡金沙江
design-doc: C:\Users\lengm\.claude\brainstorm-docs\projects\2026-06-27-four-crossings-website-design.md
total-tasks: 50
duration: W1-W12 (12 周)
---

# 四渡赤水·全景沙盘 — 实施计划

> 把设计文档拆解为 50 个可执行任务,严格 TDD 流程(写测试 → 跑测试失败 → 写实现 → 跑测试通过 → 提交)。
> 设计文档: `C:\Users\lengm\.claude\brainstorm-docs\projects\2026-06-27-four-crossings-website-design.md`
> 实施计划是项目内的工作文档,放在项目 `docs/plans/` 是合理的(用户明确选择)。

---

## 关键风险概览

| 风险 | 等级 | 缓解策略 |
|---|---|---|
| 数据采集量大超工期 | 🔴 高 | AI 抽取 + 人工并行;P0 优先;非用户手动不启动 |
| 3D DEM 资源过大 | 🟡 中 | 切片 + LOD;cesium-ion 备选 |
| Mapbox token 泄露 | 🟡 中 | Vercel env + URL 限制 + `.gitignore` |
| 史实争议 | 🟡 中 | 双源标注 + 字段区间化 |
| 3D 沙盘性能 | 🟡 中 | 设备检测 + 降级 + LOD |
| 国内访问慢 | 🟢 低 | 已接受(Vercel 全球 CDN) |

> **重要**:数据采集任务(Task 1.4 - Task 1.10)需要用户手动完成(史料考据专业性极高),**不交给 subagent**。

---

## 目录

- [Phase 0 — 项目基础(W1, 6 任务)](#phase-0--项目基础w1-6-任务)
- [Phase 1 — 数据层(W2-W4, 11 任务)](#phase-1--数据层w2-w4-11-任务)
- [Phase 2 — 2D 地图 + 时间轴(W5, 7 任务)](#phase-2--2d-地图--时间轴w5-7-任务)
- [Phase 3 — 3D 沙盘(W6, 6 任务)](#phase-3--3d-沙盘w6-6-任务)
- [Phase 4 — 三视图联动(W7, 6 任务)](#phase-4--三视图联动w7-6-任务)
- [Phase 5 — 视觉打磨(W10, 8 任务)](#phase-5--视觉打磨w10-8-任务)
- [Phase 6 — 测试 + 部署(W11-W12, 6 任务)](#phase-6--测试--部署w11-w12-6-任务)

---

## Phase 0 — 项目基础(W1, 6 任务)

### Task 0.1 — 项目初始化

**Files**:
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `.gitignore`
- `.env.example`

**Step 1 — 写测试**:
项目脚手架任务,无外部行为测试(测试由后续任务验证)。

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
ls package.json 2>/dev/null || echo "NOT_EXISTS"
```

**Step 3 — 写实现**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npm create vite@latest . -- --template vue-ts
npm install
```

修改 `package.json`:
```json
{
  "name": "four-crossings-cc",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext .vue,.ts,.tsx --fix",
    "type-check": "vue-tsc --noEmit",
    "data:validate": "tsx scripts/data-extract/extract.ts"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "mapbox-gl": "^3.0.0",
    "three": "^0.160.0",
    "gsap": "^3.12.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/mapbox-gl": "^3.0.0",
    "@types/three": "^0.160.0",
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.3.0",
    "vue-tsc": "^2.0.0",
    "vitest": "^1.2.0",
    "@vitest/ui": "^1.2.0",
    "@playwright/test": "^1.40.0",
    "sass": "^1.70.0",
    "tsx": "^4.7.0"
  }
}
```

`.env.example`:
```
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here
```

`.gitignore` 追加:
```
.env
.env.local
node_modules/
dist/
.vite/
coverage/
playwright-report/
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npm run type-check
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add package.json package-lock.json tsconfig.json vite.config.ts .gitignore .env.example
git commit -m "chore: init Vue 3 + Vite + TS project"
```

---

### Task 0.2 — 安装核心依赖

**Files**:
- `package.json`(自动更新)
- `package-lock.json`(自动更新)

**Step 1 — 写测试**:
无外部行为测试。

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
test -d node_modules/mapbox-gl && echo "OK" || echo "MISSING"
```

**Step 3 — 写实现**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npm install pinia vue-router mapbox-gl three gsap zod
npm install -D @types/mapbox-gl @types/three sass vitest @vitest/ui @playwright/test tsx
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npm list --depth=0
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add package.json package-lock.json
git commit -m "chore: install core deps (mapbox/three/pinia/router)"
```

---

### Task 0.3 — SCSS 变量与色板

**Files**:
- `src/assets/styles/_variables.scss`
- `src/assets/styles/_typography.scss`
- `src/assets/styles/main.scss`
- `tests/styles/variables.test.ts`

**Step 1 — 写测试** (`tests/styles/variables.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('design tokens', () => {
  const variables = readFileSync(
    resolve(__dirname, '../src/assets/styles/_variables.scss'),
    'utf-8'
  )

  it('exposes required color tokens', () => {
    expect(variables).toMatch(/\$bg-paper:\s*#F2E8D0/)
    expect(variables).toMatch(/\$bg-dark:\s*#3D2F1F/)
    expect(variables).toMatch(/\$ink-primary:\s*#1A1410/)
    expect(variables).toMatch(/\$ink-secondary:\s*#6B5D4A/)
    expect(variables).toMatch(/\$vermilion:\s*#C0392B/)
    expect(variables).toMatch(/\$steel-blue:\s*#2C5F7C/)
    expect(variables).toMatch(/\$sulfur:\s*#D4A017/)
    expect(variables).toMatch(/\$olive:\s*#6B7F4A/)
  })

  it('exposes elevation color band for 3D', () => {
    expect(variables).toMatch(/\$elev-low:\s*#5C7A8C/)
    expect(variables).toMatch(/\$elev-mid:\s*#C9A86A/)
    expect(variables).toMatch(/\$elev-high:\s*#8B6B47/)
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/styles/variables.test.ts
```

**Step 3 — 写实现** (`src/assets/styles/_variables.scss`):
```scss
// 军图色板
$bg-paper: #F2E8D0;
$bg-dark: #3D2F1F;
$ink-primary: #1A1410;
$ink-secondary: #6B5D4A;
$vermilion: #C0392B;
$steel-blue: #2C5F7C;
$sulfur: #D4A017;
$olive: #6B7F4A;

// 3D 高程带
$elev-low: #5C7A8C;
$elev-mid: #C9A86A;
$elev-high: #8B6B47;
$elev-snow: #E8E0D0;

// 字体
$font-display: 'LXGW WenKai', '霞鹜文楷', 'STKaiti', serif;
$font-body: 'Source Han Serif SC', '思源宋体', 'Songti SC', serif;
$font-data: 'JetBrains Mono', 'Noto Serif SC', serif;
$font-english: 'IM Fell English', serif;

// 间距
$gap-xs: 4px;
$gap-sm: 8px;
$gap-md: 16px;
$gap-lg: 24px;
$gap-xl: 40px;

// 动画
$ease-default: cubic-bezier(0.4, 0, 0.2, 1);
$dur-fast: 200ms;
$dur-normal: 300ms;
$dur-slow: 500ms;
```

(`src/assets/styles/_typography.scss`):
```scss
@import './variables';

@font-face {
  font-family: 'LXGW WenKai';
  src: url('/fonts/LXGWWenKai-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}

@font-face {
  font-family: 'Source Han Serif SC';
  src: url('/fonts/SourceHanSerifSC-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}

body {
  font-family: $font-body;
  color: $ink-primary;
  background: $bg-paper;
  margin: 0;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4 {
  font-family: $font-display;
  color: $ink-primary;
}

code, .data {
  font-family: $font-data;
}
```

(`src/assets/styles/main.scss`):
```scss
@import './variables';
@import './typography';

:root {
  --bg-paper: #{$bg-paper};
  --vermilion: #{$vermilion};
  --steel-blue: #{$steel-blue};
}

* { box-sizing: border-box; }
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/styles/variables.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/assets/styles/ tests/styles/
git commit -m "feat(styles): add military map color palette and typography tokens"
```

---

### Task 0.4 — 字体下载与自托管

**Files**:
- `public/fonts/LXGWWenKai-Regular.woff2`(二进制)
- `public/fonts/SourceHanSerifSC-Regular.woff2`(二进制)

**Step 1 — 写测试** (`tests/assets/fonts.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

describe('self-hosted fonts', () => {
  it('includes LXGW WenKai woff2', () => {
    const p = resolve(__dirname, '../public/fonts/LXGWWenKai-Regular.woff2')
    expect(existsSync(p)).toBe(true)
    expect(statSync(p).size).toBeGreaterThan(100_000)
  })

  it('includes Source Han Serif SC woff2', () => {
    const p = resolve(__dirname, '../public/fonts/SourceHanSerifSC-Regular.woff2')
    expect(existsSync(p)).toBe(true)
    expect(statSync(p).size).toBeGreaterThan(100_000)
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/assets/fonts.test.ts
```

**Step 3 — 写实现**:

手动从以下地址下载(浏览器打开下载,放到 `public/fonts/`):
- LXGW WenKai: https://github.com/lxgw/LxgwWenKai/releases
- Source Han Serif: https://github.com/adobe-fonts/source-han-serif/releases

```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
mkdir -p public/fonts
# 用户手动操作:把下载的 woff2 文件放到 public/fonts/
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
ls -la public/fonts/
npx vitest run tests/assets/fonts.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add public/fonts/
git commit -m "feat(fonts): self-host LXGW WenKai and Source Han Serif"
```

---

### Task 0.5 — 路由骨架

**Files**:
- `src/router/index.ts`
- `src/views/LandingView.vue`
- `src/views/PhaseSelectView.vue`
- `src/views/NarrativeView.vue`
- `src/views/ExploreView.vue`
- `src/views/MeetingView.vue`
- `src/main.ts`(更新)
- `tests/router/routes.test.ts`

**Step 1 — 写测试** (`tests/router/routes.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { routes } from '../../src/router'

describe('router routes', () => {
  it('defines five top-level routes', () => {
    const paths = routes.map(r => r.path)
    expect(paths).toContain('/')
    expect(paths).toContain('/phases')
    expect(paths).toContain('/narrative/:phaseId')
    expect(paths).toContain('/explore/:phaseId')
    expect(paths).toContain('/meeting/:meetingId')
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/router/routes.test.ts
```

**Step 3 — 写实现** (`src/router/index.ts`):
```ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import PhaseSelectView from '../views/PhaseSelectView.vue'
import NarrativeView from '../views/NarrativeView.vue'
import ExploreView from '../views/ExploreView.vue'
import MeetingView from '../views/MeetingView.vue'

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'landing', component: LandingView },
  { path: '/phases', name: 'phase-select', component: PhaseSelectView },
  { path: '/narrative/:phaseId', name: 'narrative', component: NarrativeView, props: true },
  { path: '/explore/:phaseId', name: 'explore', component: ExploreView, props: true },
  { path: '/meeting/:meetingId', name: 'meeting', component: MeetingView, props: true },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})
```

(`src/views/LandingView.vue`):
```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <main class="landing">
    <h1>四渡赤水·全景沙盘</h1>
    <p>1935.1.19 — 1935.5.9</p>
    <button @click="router.push('/phases')">进入战役</button>
  </main>
</template>

<style scoped lang="scss">
@import '../assets/styles/variables';

.landing {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-paper);
  font-family: $font-display;

  h1 { font-size: 3rem; margin: 0; }
  button {
    margin-top: $gap-lg;
    padding: $gap-sm $gap-lg;
    background: $vermilion;
    color: $bg-paper;
    border: none;
    font-family: $font-display;
    cursor: pointer;
  }
}
</style>
```

(`src/views/PhaseSelectView.vue`):
```vue
<template>
  <main><h2>选择阶段</h2></main>
</template>
```

(`src/views/NarrativeView.vue`):
```vue
<template><main><h2>叙事模式 — {{ $route.params.phaseId }}</h2></main></template>
```

(`src/views/ExploreView.vue`):
```vue
<template><main><h2>探索模式 — {{ $route.params.phaseId }}</h2></main></template>
```

(`src/views/MeetingView.vue`):
```vue
<template><main><h2>会议 — {{ $route.params.meetingId }}</h2></main></template>
```

更新 `src/main.ts`:
```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import './assets/styles/main.scss'

createApp(App).use(createPinia()).use(router).mount('#app')
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/router/routes.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/router/ src/views/ src/main.ts tests/router/
git commit -m "feat(router): add five top-level routes with placeholders"
```

---

### Task 0.6 — 目录骨架

**Files**:
- `src/stores/.gitkeep`
- `src/composables/.gitkeep`
- `src/components/layout/.gitkeep`
- `src/components/timeline/.gitkeep`
- `src/components/map2d/.gitkeep`
- `src/components/map3d/.gitkeep`
- `src/components/detail/.gitkeep`
- `src/components/common/.gitkeep`
- `src/data/.gitkeep`
- `src/utils/.gitkeep`
- `src/config/.gitkeep`
- `public/data/.gitkeep`
- `public/terrain/.gitkeep`
- `tests/structure/dirs.test.ts`

**Step 1 — 写测试** (`tests/structure/dirs.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const REQUIRED_DIRS = [
  'src/stores',
  'src/composables',
  'src/components/layout',
  'src/components/timeline',
  'src/components/map2d',
  'src/components/map3d',
  'src/components/detail',
  'src/components/common',
  'src/data',
  'src/utils',
  'src/config',
  'public/data',
  'public/terrain'
]

describe('project skeleton', () => {
  it.each(REQUIRED_DIRS)('has dir %s', (dir) => {
    expect(existsSync(resolve(__dirname, '..', dir))).toBe(true)
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/structure/dirs.test.ts
```

**Step 3 — 写实现**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
mkdir -p src/stores src/composables
mkdir -p src/components/layout src/components/timeline
mkdir -p src/components/map2d src/components/map3d
mkdir -p src/components/detail src/components/common
mkdir -p src/data src/utils src/config
mkdir -p public/data public/terrain
mkdir -p tests/stores tests/structure
touch src/stores/.gitkeep src/composables/.gitkeep \
      src/components/layout/.gitkeep src/components/timeline/.gitkeep \
      src/components/map2d/.gitkeep src/components/map3d/.gitkeep \
      src/components/detail/.gitkeep src/components/common/.gitkeep \
      src/data/.gitkeep src/utils/.gitkeep src/config/.gitkeep \
      public/data/.gitkeep public/terrain/.gitkeep
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/structure/dirs.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/stores src/composables src/components src/data src/utils src/config public/data public/terrain tests/stores tests/structure
git commit -m "chore: scaffold project directory structure"
```

---

## Phase 1 — 数据层(W2-W4, 11 任务)

### Task 1.1 — 类型定义

**Files**:
- `src/data/types.ts`
- `tests/data/types.test.ts`

**Step 1 — 写测试** (`tests/data/types.test.ts`):
```ts
import { describe, it, expectTypeOf } from 'vitest'
import type { Force, ForceSide, ForceLevel, ForceStatus } from '../../src/data/types'

describe('force types', () => {
  it('ForceSide includes "red" and "blue"', () => {
    expectTypeOf<ForceSide>().toEqualTypeOf<'red' | 'blue'>()
  })
  it('ForceLevel includes army/division/regiment', () => {
    expectTypeOf<ForceLevel>().toEqualTypeOf<'army' | 'division' | 'regiment'>()
  })
  it('ForceStatus includes the four states', () => {
    expectTypeOf<ForceStatus>().toEqualTypeOf<'marching' | 'engaged' | 'resting' | 'crossing'>()
  })
  it('Force has required fields', () => {
    expectTypeOf<Force>().toHaveProperty('id')
    expectTypeOf<Force>().toHaveProperty('side')
    expectTypeOf<Force>().toHaveProperty('timestamp')
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/data/types.test.ts
```

**Step 3 — 写实现** (`src/data/types.ts`):
```ts
export type ForceSide = 'red' | 'blue'
export type ForceLevel = 'army' | 'division' | 'regiment'
export type ForceStatus = 'marching' | 'engaged' | 'resting' | 'crossing'
export type EventType = 'battle' | 'meeting' | 'crossing' | 'maneuver'

export interface Force {
  id: string
  type: 'force'
  side: ForceSide
  name: string
  level: ForceLevel
  parent_id?: string
  commander?: string
  strength?: number
  timestamp: string
  status: ForceStatus
  next_destination?: string
  source: string
  geometry: { type: 'Point'; coordinates: [number, number] }
}

export interface Trajectory {
  id: string
  force_id: string
  segment_start: string
  segment_end: string
  phase: string
  color: string
  source: string
  geometry: { type: 'LineString'; coordinates: [number, number][] }
}

export interface CampaignEvent {
  id: string
  type: EventType
  title: string
  timestamp: string
  duration_hours?: number
  location: [number, number]
  participants: string[]
  outcome?: string
  casualties_red?: number
  casualties_blue?: number
  description: string
  sources: string[]
}

export interface Person {
  id: string
  name: string
  role: string
  trajectory_ref?: string
  key_decisions: {
    timestamp: string
    event_id?: string
    decision: string
  }[]
}

export interface Meeting {
  id: string
  title: string
  date: string
  location: string
  background: string
  resolutions: string[]
  participants: string[]
  sources: string[]
}

export interface Phase {
  id: string
  name: string
  start: string
  end: string
  color: string
}
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/data/types.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/data/types.ts tests/data/types.test.ts
git commit -m "feat(data): define core domain types"
```

---

### Task 1.2 — zod schema 校验

**Files**:
- `src/data/schema.ts`
- `tests/data/schema.test.ts`

**Step 1 — 写测试** (`tests/data/schema.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { ForceSchema, CampaignEventSchema } from '../../src/data/schema'

describe('ForceSchema', () => {
  it('accepts a valid red force point', () => {
    const result = ForceSchema.safeParse({
      id: 'red-1-1935-01-22',
      type: 'force',
      side: 'red',
      name: '红一军团',
      level: 'army',
      timestamp: '1935-01-22T08:00:00+08:00',
      status: 'marching',
      source: '《长征》p.142',
      geometry: { type: 'Point', coordinates: [105.07, 27.83] }
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid side', () => {
    const result = ForceSchema.safeParse({
      id: 'x', type: 'force', side: 'green',
      name: 'x', level: 'army',
      timestamp: '1935-01-22T08:00:00+08:00',
      status: 'marching', source: 'x',
      geometry: { type: 'Point', coordinates: [105.07, 27.83] }
    })
    expect(result.success).toBe(false)
  })

  it('rejects out-of-range coordinates', () => {
    const result = ForceSchema.safeParse({
      id: 'x', type: 'force', side: 'red',
      name: 'x', level: 'army',
      timestamp: '1935-01-22T08:00:00+08:00',
      status: 'marching', source: 'x',
      geometry: { type: 'Point', coordinates: [200, 100] }
    })
    expect(result.success).toBe(false)
  })
})

describe('CampaignEventSchema', () => {
  it('accepts a valid battle event', () => {
    const result = CampaignEventSchema.safeParse({
      id: 'evt-tucheng-1935-01-28',
      type: 'battle',
      title: '土城战役',
      timestamp: '1935-01-28T10:00:00+08:00',
      location: [105.97, 28.04],
      participants: ['red-3rd-army'],
      description: '...',
      sources: ['《红军长征史》p.362']
    })
    expect(result.success).toBe(true)
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/data/schema.test.ts
```

**Step 3 — 写实现** (`src/data/schema.ts`):
```ts
import { z } from 'zod'

const CoordTuple = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90)
])

const Timestamp = z.string().regex(
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+08:00$/,
  'must be ISO 8601 with +08:00'
)

export const ForceSchema = z.object({
  id: z.string().min(1),
  type: z.literal('force'),
  side: z.enum(['red', 'blue']),
  name: z.string().min(1),
  level: z.enum(['army', 'division', 'regiment']),
  parent_id: z.string().optional(),
  commander: z.string().optional(),
  strength: z.number().int().nonnegative().optional(),
  timestamp: Timestamp,
  status: z.enum(['marching', 'engaged', 'resting', 'crossing']),
  next_destination: z.string().optional(),
  source: z.string().min(1),
  geometry: z.object({
    type: z.literal('Point'),
    coordinates: CoordTuple
  })
})

export const TrajectorySchema = z.object({
  id: z.string(),
  force_id: z.string(),
  segment_start: z.string(),
  segment_end: z.string(),
  phase: z.string(),
  color: z.string(),
  source: z.string(),
  geometry: z.object({
    type: z.literal('LineString'),
    coordinates: z.array(CoordTuple).min(2)
  })
})

export const CampaignEventSchema = z.object({
  id: z.string(),
  type: z.enum(['battle', 'meeting', 'crossing', 'maneuver']),
  title: z.string(),
  timestamp: Timestamp,
  duration_hours: z.number().positive().optional(),
  location: CoordTuple,
  participants: z.array(z.string()),
  outcome: z.string().optional(),
  casualties_red: z.number().int().nonnegative().optional(),
  casualties_blue: z.number().int().nonnegative().optional(),
  description: z.string(),
  sources: z.array(z.string()).min(1)
})

export const PersonSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  trajectory_ref: z.string().optional(),
  key_decisions: z.array(z.object({
    timestamp: z.string(),
    event_id: z.string().optional(),
    decision: z.string()
  }))
})

export const MeetingSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  location: z.string(),
  background: z.string(),
  resolutions: z.array(z.string()),
  participants: z.array(z.string()),
  sources: z.array(z.string()).min(1)
})

export const PhaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  start: z.string(),
  end: z.string(),
  color: z.string()
})
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/data/schema.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/data/schema.ts tests/data/schema.test.ts
git commit -m "feat(data): zod schemas with ISO 8601 +08:00 validation"
```

---

### Task 1.3 — 阶段定义配置

**Files**:
- `src/config/phases.ts`
- `src/config/routes.ts`
- `tests/config/phases.test.ts`

**Step 1 — 写测试** (`tests/config/phases.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { PHASES, phaseById, phaseByDate } from '../../src/config/phases'

describe('PHASES', () => {
  it('defines five phases', () => {
    expect(PHASES.length).toBe(5)
    expect(PHASES.map(p => p.id)).toEqual([
      'first-crossing',
      'second-crossing',
      'third-crossing',
      'fourth-crossing',
      'jinsha-river'
    ])
  })

  it('phaseById returns correct phase', () => {
    expect(phaseById('first-crossing')?.name).toBe('一渡赤水')
  })

  it('phaseByDate finds correct phase for a date', () => {
    expect(phaseByDate('1935-01-22')?.id).toBe('first-crossing')
    expect(phaseByDate('1935-05-05')?.id).toBe('jinsha-river')
    expect(phaseByDate('1935-04-01')).toBeUndefined()
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/config/phases.test.ts
```

**Step 3 — 写实现** (`src/config/phases.ts`):
```ts
import type { Phase } from '../data/types'

export const PHASES: Phase[] = [
  { id: 'first-crossing',  name: '一渡赤水',   start: '1935-01-19', end: '1935-01-29', color: '#C0392B' },
  { id: 'second-crossing', name: '二渡赤水',   start: '1935-02-18', end: '1935-02-28', color: '#C0392B' },
  { id: 'third-crossing',  name: '三渡赤水',   start: '1935-03-16', end: '1935-03-17', color: '#C0392B' },
  { id: 'fourth-crossing', name: '四渡赤水',   start: '1935-03-21', end: '1935-03-22', color: '#C0392B' },
  { id: 'jinsha-river',    name: '巧渡金沙江', start: '1935-05-03', end: '1935-05-09', color: '#2C5F7C' }
]

export function phaseById(id: string): Phase | undefined {
  return PHASES.find(p => p.id === id)
}

export function phaseByDate(isoDate: string): Phase | undefined {
  return PHASES.find(p => isoDate >= p.start && isoDate <= p.end)
}
```

(`src/config/routes.ts`):
```ts
export const ROUTES = {
  LANDING: '/',
  PHASE_SELECT: '/phases',
  NARRATIVE: (id: string) => `/narrative/${id}`,
  EXPLORE: (id: string) => `/explore/${id}`,
  MEETING: (id: string) => `/meeting/${id}`
} as const
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/config/phases.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/config/phases.ts src/config/routes.ts tests/config/phases.test.ts
git commit -m "feat(config): define five campaign phases"
```

---

### Task 1.4 — 数据采集工作流(用户手动,非 subagent)

> **🔴 关键风险**:本任务由用户手动完成。AI 抽取 prompt 模板准备就绪,但史料通读、抽取、校对由用户执行。
> 后续 Task 1.5 - 1.10 也是同样模式:准备模板 → 用户执行。

**Files**:
- `scripts/data-extract/prompt.md`(AI 抽取 prompt)
- `scripts/data-extract/README.md`(操作手册)
- `scripts/data-extract/extract.ts`(抽取脚本骨架)
- `tests/scripts/extract.test.ts`

**Step 1 — 写测试** (`tests/scripts/extract.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('data-extract scripts', () => {
  it('includes AI extraction prompt', () => {
    const p = resolve(__dirname, '../../scripts/data-extract/prompt.md')
    expect(existsSync(p)).toBe(true)
    const content = readFileSync(p, 'utf-8')
    expect(content).toContain('日期')
    expect(content).toContain('地点')
    expect(content).toContain('部队')
  })

  it('includes README with workflow steps', () => {
    const p = resolve(__dirname, '../../scripts/data-extract/README.md')
    expect(existsSync(p)).toBe(true)
    const content = readFileSync(p, 'utf-8')
    expect(content).toMatch(/Step\s*[1-6]/)
  })

  it('includes extract script', () => {
    const p = resolve(__dirname, '../../scripts/data-extract/extract.ts')
    expect(existsSync(p)).toBe(true)
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/scripts/extract.test.ts
```

**Step 3 — 写实现**:

(`scripts/data-extract/prompt.md`):
```markdown
# AI 数据抽取 Prompt 模板

## 输入
给定一段史料原文(中文),输出严格符合 schema 的 JSON。

## 输出 Schema(每条事件)
{
  "date": "YYYY-MM-DD",
  "time": "HH:MM" (24h,精确到小时),
  "location_name": "今地名 / 历史地名",
  "lng": number,
  "lat": number,
  "forces": [
    {
      "side": "red" | "blue",
      "name": "部队名(到师/团)",
      "level": "army" | "division" | "regiment",
      "commander": "指挥官",
      "strength": number (兵力)
    }
  ],
  "event_type": "battle" | "meeting" | "crossing" | "maneuver",
  "outcome": "red-victory" | "red-retreat" | "stalemate",
  "casualties_red": number,
  "casualties_blue": number,
  "quote": "原文中的一句话作为引文",
  "source": "书名 页码"
}

## 强约束
1. 严格只输出文本中有的事实 — 不补全、不推测、不归纳
2. 坐标基于今地名查天地图/高德
3. 1935 年用 +08:00 时区
4. 兵力不确定时给区间,如 "约 2.8-3.0 万"
5. 输出 JSON,不要解释
```

(`scripts/data-extract/README.md`):
```markdown
# 数据采集工作流(用户手动执行)

## Step 1 — 通读 + 标记关键段落
- 实体书 / PDF 逐章阅读
- 标记:日期、地名、部队、事件
- 预估耗时:1 周

## Step 2 — AI 抽取
- 复制标记段落到 Claude/GPT
- 使用 prompt.md 模板
- 输出保存为 `scripts/data-extract/raw/<phase>-<n>.json`
- 预估耗时:1 天

## Step 3 — 脚本验证
- `npm run data:validate raw/<phase>-<n>.json`
- 检查坐标、时间、必填字段
- 失败的条目回到 Step 2 重抽

## Step 4 — 人工校对
- 对照原书逐条核实
- 双源交叉验证
- 预估耗时:2-3 周

## Step 5 — 同行评审
- 邀请 ≥1 位独立军史爱好者通读
- 争议点双源标注

## Step 6 — 入库
- 转换为 GeoJSON
- 提交到 `public/data/<phase>/`
- git commit,加注 source

## 严禁
- 不要让 subagent 跑数据采集(史实专业性极高)
- 不要跳过 Step 4(人工校对)
- 不要单源入库
```

(`scripts/data-extract/extract.ts`):
```ts
#!/usr/bin/env node
/**
 * 数据抽取脚本骨架 — 用户手动调用 AI 后,把 JSON 放到 raw/ 目录
 * 本脚本负责批量校验和转换为 GeoJSON
 */
import { readdir, readFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { z } from 'zod'

const RawEventSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  location_name: z.string(),
  lng: z.number().min(-180).max(180),
  lat: z.number().min(-90).max(90),
  forces: z.array(z.object({
    side: z.enum(['red', 'blue']),
    name: z.string(),
    level: z.enum(['army', 'division', 'regiment']),
    commander: z.string().optional(),
    strength: z.number().optional()
  })),
  event_type: z.enum(['battle', 'meeting', 'crossing', 'maneuver']),
  outcome: z.enum(['red-victory', 'red-retreat', 'stalemate']).optional(),
  casualties_red: z.number().optional(),
  casualties_blue: z.number().optional(),
  quote: z.string().optional(),
  source: z.string()
})

async function main() {
  const rawDir = resolve(__dirname, 'raw')
  const files = await readdir(rawDir)
  console.log(`Found ${files.length} raw files`)

  let pass = 0, fail = 0
  for (const file of files) {
    const raw = await readFile(join(rawDir, file), 'utf-8')
    let json: unknown
    try { json = JSON.parse(raw) } catch (e) {
      console.error(`FAIL ${file}: invalid JSON`)
      fail++
      continue
    }
    const result = RawEventSchema.safeParse(json)
    if (!result.success) {
      console.error(`FAIL ${file}:`, result.error.issues)
      fail++
      continue
    }
    console.log(`OK   ${file}`)
    pass++
  }
  console.log(`\n${pass} passed, ${fail} failed`)
  process.exit(fail > 0 ? 1 : 0)
}

main().catch(err => { console.error(err); process.exit(1) })
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/scripts/extract.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add scripts/data-extract/ tests/scripts/
git commit -m "feat(data): add data extraction workflow (manual, requires user)"
```

---

### Task 1.5 — 一渡赤水数据采集(用户手动)

> **🔴 用户手动**:本任务需用户通读《长征》《红军长征史》一渡章节,执行 Task 1.4 流程。
> 预计 200 数据点,3-5 天。

**Files**:
- `public/data/first-crossing/forces.geojson`(由用户从 raw/ 转换)
- `public/data/first-crossing/trajectories.geojson`
- `public/data/first-crossing/events.json`
- `public/data/first-crossing/README.md`(数据来源说明)
- `tests/data/first-crossing.test.ts`

**Step 1 — 写测试** (`tests/data/first-crossing.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function join(a: string, b: string) { return a + (a.endsWith('/') ? '' : '/') + b }

describe('first-crossing data', () => {
  const dir = resolve(__dirname, '../../public/data/first-crossing')

  it('has forces.geojson', () => {
    expect(existsSync(join(dir, 'forces.geojson'))).toBe(true)
  })

  it('has trajectories.geojson', () => {
    expect(existsSync(join(dir, 'trajectories.geojson'))).toBe(true)
  })

  it('has events.json', () => {
    expect(existsSync(join(dir, 'events.json'))).toBe(true)
  })

  it('forces.geojson contains red side entries', () => {
    const data = JSON.parse(readFileSync(join(dir, 'forces.geojson'), 'utf-8'))
    const reds = data.features.filter((f: any) => f.properties.side === 'red')
    expect(reds.length).toBeGreaterThanOrEqual(50)
  })

  it('README documents sources', () => {
    const readme = readFileSync(join(dir, 'README.md'), 'utf-8')
    expect(readme).toMatch(/《长征》/)
    expect(readme).toMatch(/《红军长征史》/)
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/data/first-crossing.test.ts
```

**Step 3 — 写实现**:

> 用户手动操作步骤:
> 1. 准备目录:`mkdir -p public/data/first-crossing/`
> 2. 执行 Task 1.4 工作流 Step 1-5
> 3. 把 raw JSON 转换为 GeoJSON 格式
> 4. 写入 `public/data/first-crossing/` 三个文件
> 5. 创建 README 列出 A/B 级来源

(`public/data/first-crossing/README.md` 模板):
```markdown
# 一渡赤水数据(1935.1.19-1.29)

## 数据规模
- 部队动态点:约 200
- 轨迹线:约 20
- 事件:约 20

## A 级来源
- 《长征》(刘统)p.130-160
- 《红军长征史》(军事科学院)p.355-380
- 《毛泽东年谱》1935年1月

## B 级来源
- 《红军长征在贵州》p.100-130
- 《土城战役研究文集》

## 校对记录
- 主考据人:[姓名]
- 同行评审:[姓名]
- 完成日期:[YYYY-MM-DD]
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/data/first-crossing.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add public/data/first-crossing/
git commit -m "data(first-crossing): add complete first crossing dataset"
```

---

### Task 1.6 — 二渡赤水数据采集(用户手动)

> **🔴 用户手动**:本任务需用户通读《长征》《红军长征史》二渡章节。
> 预计 200 数据点,3-5 天。

**Files**:
- `public/data/second-crossing/forces.geojson`
- `public/data/second-crossing/trajectories.geojson`
- `public/data/second-crossing/events.json`
- `public/data/second-crossing/README.md`
- `tests/data/second-crossing.test.ts`

**Step 1 — 写测试** (`tests/data/second-crossing.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('second-crossing data', () => {
  const dir = resolve(__dirname, '../../public/data/second-crossing')

  it('has all required files', () => {
    expect(existsSync(`${dir}/forces.geojson`)).toBe(true)
    expect(existsSync(`${dir}/trajectories.geojson`)).toBe(true)
    expect(existsSync(`${dir}/events.json`)).toBe(true)
  })

  it('forces.geojson contains >= 50 red entries', () => {
    const data = JSON.parse(readFileSync(`${dir}/forces.geojson`, 'utf-8'))
    const reds = data.features.filter((f: any) => f.properties.side === 'red')
    expect(reds.length).toBeGreaterThanOrEqual(50)
  })

  it('includes Loushan Pass battle event', () => {
    const events = JSON.parse(readFileSync(`${dir}/events.json`, 'utf-8'))
    const loushan = events.events.find((e: any) =>
      e.title.includes('娄山关') || e.id.includes('loushan')
    )
    expect(loushan).toBeDefined()
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/data/second-crossing.test.ts
```

**Step 3 — 写实现**:

> 用户手动操作:同 Task 1.5,但聚焦二渡赤水(1935.2.18-2.28),重点含娄山关战役、遵义战役。

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/data/second-crossing.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add public/data/second-crossing/
git commit -m "data(second-crossing): add complete second crossing dataset"
```

---

### Task 1.7 — 三渡赤水数据采集(用户手动)

> **🔴 用户手动**:本任务需用户采集三渡赤水(1935.3.16-3.17)数据。共 2 天,约 50 数据点。

**Files**:
- `public/data/third-crossing/forces.geojson`
- `public/data/third-crossing/trajectories.geojson`
- `public/data/third-crossing/events.json`
- `public/data/third-crossing/README.md`
- `tests/data/third-crossing.test.ts`

**Step 1 — 写测试** (`tests/data/third-crossing.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('third-crossing data', () => {
  const dir = resolve(__dirname, '../../public/data/third-crossing')

  it('has all required files', () => {
    expect(existsSync(`${dir}/forces.geojson`)).toBe(true)
    expect(existsSync(`${dir}/trajectories.geojson`)).toBe(true)
    expect(existsSync(`${dir}/events.json`)).toBe(true)
  })

  it('forces.geojson contains >= 15 entries', () => {
    const data = JSON.parse(readFileSync(`${dir}/forces.geojson`, 'utf-8'))
    expect(data.features.length).toBeGreaterThanOrEqual(15)
  })

  it('all timestamps fall in 1935-03-16 to 1935-03-17', () => {
    const data = JSON.parse(readFileSync(`${dir}/forces.geojson`, 'utf-8'))
    for (const f of data.features) {
      expect(f.properties.timestamp).toMatch(/^1935-03-1[67]/)
    }
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/data/third-crossing.test.ts
```

**Step 3 — 写实现**:

> 用户手动操作:采集三渡赤水数据,特点:只有 2 天,主要为调动伪装。

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/data/third-crossing.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add public/data/third-crossing/
git commit -m "data(third-crossing): add third crossing dataset"
```

---

### Task 1.8 — 四渡赤水数据采集(用户手动)

> **🔴 用户手动**:本任务需用户采集四渡赤水(1935.3.21-3.22)数据。共 2 天,约 50 数据点。

**Files**:
- `public/data/fourth-crossing/forces.geojson`
- `public/data/fourth-crossing/trajectories.geojson`
- `public/data/fourth-crossing/events.json`
- `public/data/fourth-crossing/README.md`
- `tests/data/fourth-crossing.test.ts`

**Step 1 — 写测试** (`tests/data/fourth-crossing.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('fourth-crossing data', () => {
  const dir = resolve(__dirname, '../../public/data/fourth-crossing')

  it('has all required files', () => {
    expect(existsSync(`${dir}/forces.geojson`)).toBe(true)
    expect(existsSync(`${dir}/trajectories.geojson`)).toBe(true)
    expect(existsSync(`${dir}/events.json`)).toBe(true)
  })

  it('forces.geojson contains >= 15 entries', () => {
    const data = JSON.parse(readFileSync(`${dir}/forces.geojson`, 'utf-8'))
    expect(data.features.length).toBeGreaterThanOrEqual(15)
  })

  it('all timestamps fall in 1935-03-21 to 1935-03-22', () => {
    const data = JSON.parse(readFileSync(`${dir}/forces.geojson`, 'utf-8'))
    for (const f of data.features) {
      expect(f.properties.timestamp).toMatch(/^1935-03-2[12]/)
    }
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/data/fourth-crossing.test.ts
```

**Step 3 — 写实现**:

> 用户手动操作:采集四渡赤水数据。

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/data/fourth-crossing.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add public/data/fourth-crossing/
git commit -m "data(fourth-crossing): add fourth crossing dataset"
```

---

### Task 1.9 — 巧渡金沙江数据采集(用户手动)

> **🔴 用户手动**:本任务需用户采集巧渡金沙江(1935.5.3-5.9)数据。共 7 天,约 150 数据点。

**Files**:
- `public/data/jinsha-river/forces.geojson`
- `public/data/jinsha-river/trajectories.geojson`
- `public/data/jinsha-river/events.json`
- `public/data/jinsha-river/README.md`
- `tests/data/jinsha-river.test.ts`

**Step 1 — 写测试** (`tests/data/jinsha-river.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('jinsha-river data', () => {
  const dir = resolve(__dirname, '../../public/data/jinsha-river')

  it('has all required files', () => {
    expect(existsSync(`${dir}/forces.geojson`)).toBe(true)
    expect(existsSync(`${dir}/trajectories.geojson`)).toBe(true)
    expect(existsSync(`${dir}/events.json`)).toBe(true)
  })

  it('forces.geojson contains >= 40 entries', () => {
    const data = JSON.parse(readFileSync(`${dir}/forces.geojson`, 'utf-8'))
    expect(data.features.length).toBeGreaterThanOrEqual(40)
  })

  it('includes key crossing events', () => {
    const events = JSON.parse(readFileSync(`${dir}/events.json`, 'utf-8'))
    const titles = events.events.map((e: any) => e.title).join('|')
    expect(titles).toMatch(/洪门渡|龙街渡|皎平渡/)
  })

  it('all timestamps fall in 1935-05-03 to 1935-05-09', () => {
    const data = JSON.parse(readFileSync(`${dir}/forces.geojson`, 'utf-8'))
    for (const f of data.features) {
      expect(f.properties.timestamp).toMatch(/^1935-05-0[3-9]/)
    }
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/data/jinsha-river.test.ts
```

**Step 3 — 写实现**:

> 用户手动操作:采集巧渡金沙江数据。重点:洪门渡、龙街渡、皎平渡三渡口。

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/data/jinsha-river.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add public/data/jinsha-river/
git commit -m "data(jinsha-river): add Jinsha River crossing dataset"
```

---

### Task 1.10 — 会议专题 + 人物数据采集(用户手动)

> **🟡 用户手动**:本任务需用户采集会议专题(≥5 个)和人物(≥10 位)数据。

**Files**:
- `public/data/meetings.json`
- `public/data/persons.json`
- `tests/data/meetings-persons.test.ts`

**Step 1 — 写测试** (`tests/data/meetings-persons.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('meetings and persons', () => {
  it('meetings.json has >= 5 entries', () => {
    const data = JSON.parse(readFileSync(resolve(__dirname, '../../public/data/meetings.json'), 'utf-8'))
    expect(data.meetings.length).toBeGreaterThanOrEqual(5)
  })

  it('persons.json has >= 10 entries', () => {
    const data = JSON.parse(readFileSync(resolve(__dirname, '../../public/data/persons.json'), 'utf-8'))
    expect(data.persons.length).toBeGreaterThanOrEqual(10)
  })

  it('includes Zunyi Conference entry', () => {
    const data = JSON.parse(readFileSync(resolve(__dirname, '../../public/data/meetings.json'), 'utf-8'))
    expect(data.meetings.some((m: any) => m.id === 'meeting-zunyi' || m.title.includes('遵义'))).toBe(true)
  })

  it('includes Mao Zedong person entry', () => {
    const data = JSON.parse(readFileSync(resolve(__dirname, '../../public/data/persons.json'), 'utf-8'))
    expect(data.persons.some((p: any) => p.name === '毛泽东')).toBe(true)
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/data/meetings-persons.test.ts
```

**Step 3 — 写实现**:

> 用户手动操作:采集会议专题和人物决策数据。
> 会议:遵义会议、扎西会议、白沙会议、会理会议等
> 人物:毛泽东、周恩来、朱德、刘伯承、彭德怀、林彪、聂荣臻、杨成武、蒋介石、龙云等

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/data/meetings-persons.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add public/data/meetings.json public/data/persons.json
git commit -m "data(meetings-persons): add meetings and persons data"
```

---

### Task 1.11 — DEM 资源准备

**Files**:
- `scripts/dem-prepare/fetch.md`
- `scripts/dem-prepare/convert.ts`
- `public/terrain/tiles.json`(元数据)
- `tests/terrain/dem.test.ts`

**Step 1 — 写测试** (`tests/terrain/dem.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('DEM resources', () => {
  it('has convert script', () => {
    expect(existsSync(resolve(__dirname, '../../scripts/dem-prepare/convert.ts'))).toBe(true)
  })

  it('has fetch instructions', () => {
    expect(existsSync(resolve(__dirname, '../../scripts/dem-prepare/fetch.md'))).toBe(true)
  })

  it('has tiles metadata', () => {
    expect(existsSync(resolve(__dirname, '../../public/terrain/tiles.json'))).toBe(true)
  })

  it('tiles metadata has correct bounds', () => {
    const meta = JSON.parse(readFileSync(resolve(__dirname, '../../public/terrain/tiles.json'), 'utf-8'))
    expect(meta.bounds[0]).toBeLessThan(meta.bounds[2])
    expect(meta.bounds[1]).toBeLessThan(meta.bounds[3])
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/terrain/dem.test.ts
```

**Step 3 — 写实现**:

(`scripts/dem-prepare/fetch.md`):
```markdown
# DEM 数据获取

## 区域
经度:104.0-106.5
纬度:27.0-29.5

## 来源
1. **NASA SRTM 30m** - 全球免费
   - https://earthexplorer.usgs.gov/
2. **cesium-ion** - 商业高精度
   - https://cesium.com/ion/

## 步骤
1. 下载 SRTM N27E104 / N27E105 / N28E104 / N28E105
2. 用 gdal 合并:
   ```bash
   gdal_merge.py -o dem.tif n27*.tif
   ```
3. 转换为 Terrain-RGB:
   ```bash
   gdal_translate -of PNG -ot Byte -outsize 4096 4096 dem.tif terrain-rgb.png
   ```
4. 切片 (zoom 8-12):
   ```bash
   mb-util terrain-rgb.png public/terrain/tiles --zoom 8 12
   ```
5. 创建 `tiles.json` 描述 bounds

## 注意
- 国内用户优先用天地图高程(如有 API)
- 资源过大时降采样到 90m
```

(`scripts/dem-prepare/convert.ts`):
```ts
#!/usr/bin/env node
/**
 * DEM 转换辅助脚本 — 调用 gdal 命令
 */
import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const BOUNDS = { west: 104.0, south: 27.0, east: 106.5, north: 29.5 }

function run(cmd: string) {
  console.log(`> ${cmd}`)
  execSync(cmd, { stdio: 'inherit' })
}

function main() {
  const input = process.argv[2]
  if (!input) {
    console.error('Usage: tsx scripts/dem-prepare/convert.ts <input.tif>')
    process.exit(1)
  }

  const outDir = resolve(__dirname, '../../public/terrain')
  const pngOut = `${outDir}/terrain-rgb.png`

  run(`gdal_translate -of PNG -ot Byte ${input} ${pngOut}`)
  run(`mb-util --image_format=png ${pngOut} ${outDir}/tiles --zoom 8 12`)

  const meta = {
    bounds: [BOUNDS.west, BOUNDS.south, BOUNDS.east, BOUNDS.north],
    minZoom: 8,
    maxZoom: 12,
    tileFormat: 'terrain-rgb',
    source: 'SRTM 30m',
    generated: new Date().toISOString()
  }
  writeFileSync(`${outDir}/tiles.json`, JSON.stringify(meta, null, 2))
  console.log('OK — wrote tiles.json')
}

main()
```

(`public/terrain/tiles.json` 模板 — 用户首次运行 convert.ts 后覆盖):
```json
{
  "bounds": [104.0, 27.0, 106.5, 29.5],
  "minZoom": 8,
  "maxZoom": 12,
  "tileFormat": "terrain-rgb",
  "source": "SRTM 30m",
  "generated": "2026-06-27T00:00:00+08:00"
}
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/terrain/dem.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add scripts/dem-prepare/ public/terrain/tiles.json tests/terrain/
git commit -m "feat(terrain): add DEM preparation scripts and metadata"
```

---

## Phase 2 — 2D 地图 + 时间轴(W5, 7 任务)

### Task 2.1 — Mapbox 集成

**Files**:
- `src/config/mapbox.ts`
- `src/composables/useMapbox.ts`
- `tests/composables/useMapbox.test.ts`

**Step 1 — 写测试** (`tests/composables/useMapbox.test.ts`):
```ts
import { describe, it, expect, vi } from 'vitest'

describe('useMapbox', () => {
  it('exports a factory function', async () => {
    const mod = await import('../../src/composables/useMapbox')
    expect(typeof mod.useMapbox).toBe('function')
  })

  it('throws when token is missing', async () => {
    vi.stubEnv('VITE_MAPBOX_TOKEN', '')
    const mod = await import('../../src/composables/useMapbox')
    expect(() => mod.useMapbox({ container: null as any })).toThrow(/MAPBOX_TOKEN/)
    vi.unstubAllEnvs()
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/composables/useMapbox.test.ts
```

**Step 3 — 写实现** (`src/config/mapbox.ts`):
```ts
export const MAPBOX_CONFIG = {
  styleUrl: 'mapbox://styles/mapbox/light-v11',
  customStyle: '/styles/military-map.json',
  defaultCenter: [105.5, 28.0] as [number, number],
  defaultZoom: 6,
  maxZoom: 14,
  minZoom: 4
} as const

export function getMapboxToken(): string {
  const token = import.meta.env.VITE_MAPBOX_TOKEN
  if (!token || token === '') {
    throw new Error('MAPBOX_TOKEN (VITE_MAPBOX_TOKEN) is required')
  }
  return token
}
```

(`src/composables/useMapbox.ts`):
```ts
import mapboxgl, { type Map, type MapOptions } from 'mapbox-gl'
import { MAPBOX_CONFIG, getMapboxToken } from '../config/mapbox'

export function useMapbox(options: Partial<MapOptions> & { container: HTMLElement | null }): Map {
  mapboxgl.accessToken = getMapboxToken()
  if (!options.container) {
    throw new Error('Mapbox container required')
  }
  return new mapboxgl.Map({
    container: options.container,
    style: MAPBOX_CONFIG.customStyle,
    center: options.center ?? MAPBOX_CONFIG.defaultCenter,
    zoom: options.zoom ?? MAPBOX_CONFIG.defaultZoom,
    maxZoom: options.maxZoom ?? MAPBOX_CONFIG.maxZoom,
    minZoom: options.minZoom ?? MAPBOX_CONFIG.minZoom,
    ...options
  })
}

export { mapboxgl }
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/composables/useMapbox.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/config/mapbox.ts src/composables/useMapbox.ts tests/composables/
git commit -m "feat(map): integrate Mapbox GL JS with factory composable"
```

---

### Task 2.2 — Mapbox 自定义样式(古旧军图)

**Files**:
- `public/styles/military-map.json`
- `tests/map/style.test.ts`

**Step 1 — 写测试** (`tests/map/style.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('military map style', () => {
  const path = resolve(__dirname, '../../public/styles/military-map.json')

  it('exists', () => {
    expect(existsSync(path)).toBe(true)
  })

  it('is valid JSON', () => {
    expect(() => JSON.parse(readFileSync(path, 'utf-8'))).not.toThrow()
  })

  it('has version 8', () => {
    const style = JSON.parse(readFileSync(path, 'utf-8'))
    expect(style.version).toBe(8)
  })

  it('has layers array', () => {
    const style = JSON.parse(readFileSync(path, 'utf-8'))
    expect(Array.isArray(style.layers)).toBe(true)
    expect(style.layers.length).toBeGreaterThan(0)
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/map/style.test.ts
```

**Step 3 — 写实现** (`public/styles/military-map.json`):
```json
{
  "version": 8,
  "name": "Military Map",
  "sources": {
    "mapbox-streets": {
      "type": "vector",
      "url": "mapbox://mapbox.mapbox-streets-v12"
    }
  },
  "sprite": "mapbox://sprites/mapbox/streets-v12",
  "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
  "layers": [
    {
      "id": "background",
      "type": "background",
      "paint": { "background-color": "#F2E8D0" }
    },
    {
      "id": "water",
      "type": "fill",
      "source": "mapbox-streets",
      "source-layer": "water",
      "paint": {
        "fill-color": "#5C7A8C",
        "fill-outline-color": "#3D2F1F"
      }
    },
    {
      "id": "contour",
      "type": "line",
      "source": "mapbox-streets",
      "source-layer": "contour",
      "paint": {
        "line-color": "#6B7F4A",
        "line-width": 0.5
      }
    },
    {
      "id": "roads",
      "type": "line",
      "source": "mapbox-streets",
      "source-layer": "road",
      "filter": ["in", "class", "primary", "secondary", "tertiary"],
      "paint": {
        "line-color": "#3D2F1F",
        "line-width": 0.8
      }
    },
    {
      "id": "place-labels",
      "type": "symbol",
      "source": "mapbox-streets",
      "source-layer": "place_label",
      "layout": {
        "text-field": ["get", "name"],
        "text-font": ["Source Han Serif SC Regular", "Noto Serif SC Regular"],
        "text-size": 12
      },
      "paint": {
        "text-color": "#3D2F1F",
        "text-halo-color": "#F2E8D0",
        "text-halo-width": 1.5
      }
    }
  ]
}
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/map/style.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add public/styles/military-map.json tests/map/style.test.ts
git commit -m "feat(map): add military map style (paper background + olive contours)"
```

---

### Task 2.3 — TimeStore (Pinia)

**Files**:
- `src/stores/time.ts`
- `tests/stores/time.test.ts`

**Step 1 — 写测试** (`tests/stores/time.test.ts`):
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTimeStore } from '../../src/stores/time'

describe('TimeStore', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('initializes with first-crossing start time', () => {
    const store = useTimeStore()
    expect(store.currentTime).toBe('1935-01-19T00:00:00+08:00')
  })

  it('setTime updates currentTime', () => {
    const store = useTimeStore()
    store.setTime('1935-01-22T08:00:00+08:00')
    expect(store.currentTime).toBe('1935-01-22T08:00:00+08:00')
  })

  it('play/pause toggles isPlaying', () => {
    const store = useTimeStore()
    expect(store.isPlaying).toBe(false)
    store.play()
    expect(store.isPlaying).toBe(true)
    store.pause()
    expect(store.isPlaying).toBe(false)
  })

  it('speed controls playback rate', () => {
    const store = useTimeStore()
    store.setSpeed(4)
    expect(store.speed).toBe(4)
  })

  it('jumpToEvent sets time to event timestamp', () => {
    const store = useTimeStore()
    store.jumpToEvent('1935-01-28T10:00:00+08:00')
    expect(store.currentTime).toBe('1935-01-28T10:00:00+08:00')
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/stores/time.test.ts
```

**Step 3 — 写实现** (`src/stores/time.ts`):
```ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTimeStore = defineStore('time', () => {
  const currentTime = ref<string>('1935-01-19T00:00:00+08:00')
  const isPlaying = ref(false)
  const speed = ref(1)

  const currentTimeMs = computed(() => new Date(currentTime.value).getTime())

  function setTime(iso: string) {
    currentTime.value = iso
  }

  function play() { isPlaying.value = true }
  function pause() { isPlaying.value = false }
  function toggle() { isPlaying.value = !isPlaying.value }
  function setSpeed(s: number) { speed.value = s }

  function jumpToEvent(iso: string) {
    setTime(iso)
  }

  function step(deltaHours: number) {
    const t = new Date(currentTime.value)
    t.setHours(t.getHours() + deltaHours * speed.value)
    currentTime.value = t.toISOString().replace('Z', '+08:00')
  }

  return {
    currentTime,
    currentTimeMs,
    isPlaying,
    speed,
    setTime,
    play,
    pause,
    toggle,
    setSpeed,
    jumpToEvent,
    step
  }
})
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/stores/time.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/stores/time.ts tests/stores/time.test.ts
git commit -m "feat(stores): add TimeStore with playback and speed control"
```

---

### Task 2.4 — ScenarioStore (数据加载)

**Files**:
- `src/stores/scenario.ts`
- `tests/stores/scenario.test.ts`

**Step 1 — 写测试** (`tests/stores/scenario.test.ts`):
```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

describe('ScenarioStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ type: 'FeatureCollection', features: [] })
    } as any)
  })

  it('starts unloaded', async () => {
    const { useScenarioStore } = await import('../../src/stores/scenario')
    const store = useScenarioStore()
    expect(store.isLoaded).toBe(false)
  })

  it('loadPhase fetches all data', async () => {
    const { useScenarioStore } = await import('../../src/stores/scenario')
    const store = useScenarioStore()
    await store.loadPhase('first-crossing')
    expect(store.isLoaded).toBe(true)
    expect(fetch).toHaveBeenCalledWith('/data/first-crossing/forces.geojson')
    expect(fetch).toHaveBeenCalledWith('/data/first-crossing/trajectories.geojson')
    expect(fetch).toHaveBeenCalledWith('/data/first-crossing/events.json')
  })

  it('getForcesAtTime filters by timestamp', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('forces')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            type: 'FeatureCollection',
            features: [
              { properties: { id: '1', timestamp: '1935-01-20T08:00:00+08:00' }, geometry: { coordinates: [105, 28] } },
              { properties: { id: '2', timestamp: '1935-01-22T08:00:00+08:00' }, geometry: { coordinates: [105.1, 28.1] } }
            ]
          })
        } as any)
      }
      return Promise.resolve({ ok: true, json: async () => ({}) } as any)
    })

    const { useScenarioStore } = await import('../../src/stores/scenario')
    const store = useScenarioStore()
    await store.loadPhase('first-crossing')
    const forces = store.getForcesAtTime('1935-01-21T00:00:00+08:00')
    expect(forces.length).toBe(1)
    expect(forces[0].properties.id).toBe('1')
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/stores/scenario.test.ts
```

**Step 3 — 写实现** (`src/stores/scenario.ts`):
```ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Force, Trajectory, CampaignEvent } from '../data/types'

interface ScenarioData {
  forces: Force[]
  trajectories: Trajectory[]
  events: CampaignEvent[]
}

export const useScenarioStore = defineStore('scenario', () => {
  const currentPhaseId = ref<string | null>(null)
  const data = ref<ScenarioData>({ forces: [], trajectories: [], events: [] })
  const isLoaded = ref(false)

  async function loadPhase(phaseId: string) {
    currentPhaseId.value = phaseId
    const [forces, trajectories, events] = await Promise.all([
      fetch(`/data/${phaseId}/forces.geojson`).then(r => r.json()),
      fetch(`/data/${phaseId}/trajectories.geojson`).then(r => r.json()),
      fetch(`/data/${phaseId}/events.json`).then(r => r.json())
    ])
    data.value = {
      forces: forces.features ?? [],
      trajectories: trajectories.features ?? [],
      events: events.events ?? []
    }
    isLoaded.value = true
  }

  function getForcesAtTime(isoTime: string): Force[] {
    const t = new Date(isoTime).getTime()
    return data.value.forces.filter(f => new Date(f.timestamp).getTime() <= t)
  }

  function getEventsInRange(startIso: string, endIso: string): CampaignEvent[] {
    const s = new Date(startIso).getTime()
    const e = new Date(endIso).getTime()
    return data.value.events.filter(evt => {
      const t = new Date(evt.timestamp).getTime()
      return t >= s && t <= e
    })
  }

  return {
    currentPhaseId,
    data,
    isLoaded,
    loadPhase,
    getForcesAtTime,
    getEventsInRange
  }
})
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/stores/scenario.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/stores/scenario.ts tests/stores/scenario.test.ts
git commit -m "feat(stores): add ScenarioStore with phase data loading"
```

---

### Task 2.5 — 时间轴组件

**Files**:
- `src/components/timeline/Timeline.vue`
- `src/components/common/PlayButton.vue`
- `tests/components/timeline.test.ts`

**Step 1 — 写测试** (`tests/components/timeline.test.ts`):
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import Timeline from '../../src/components/timeline/Timeline.vue'

describe('Timeline', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('renders SVG with cursor', () => {
    const wrapper = mount(Timeline, {
      props: { start: '1935-01-19', end: '1935-01-29' }
    })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('[data-test="cursor"]').exists()).toBe(true)
  })

  it('emits update:time when track clicked', async () => {
    const wrapper = mount(Timeline, {
      props: { start: '1935-01-19', end: '1935-01-29' }
    })
    await wrapper.find('[data-test="track"]').trigger('click', { clientX: 100 })
    expect(wrapper.emitted('update:time')).toBeTruthy()
  })

  it('shows event markers', () => {
    const wrapper = mount(Timeline, {
      props: {
        start: '1935-01-19',
        end: '1935-01-29',
        events: [
          { timestamp: '1935-01-22T08:00:00+08:00', title: 'A' },
          { timestamp: '1935-01-25T08:00:00+08:00', title: 'B' }
        ]
      }
    })
    expect(wrapper.findAll('[data-test="event-marker"]').length).toBe(2)
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/components/timeline.test.ts
```

**Step 3 — 写实现** (`src/components/timeline/Timeline.vue`):
```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useTimeStore } from '../../stores/time'
import PlayButton from '../common/PlayButton.vue'

const props = defineProps<{
  start: string
  end: string
  events?: { timestamp: string; title: string }[]
}>()

const emit = defineEmits<{ (e: 'update:time', iso: string): void }>()

const timeStore = useTimeStore()

const startMs = computed(() => new Date(props.start).getTime())
const endMs = computed(() => new Date(props.end).getTime())
const totalMs = computed(() => endMs.value - startMs.value)
const cursorPct = computed(() => {
  const cur = new Date(timeStore.currentTime).getTime()
  return Math.max(0, Math.min(100, ((cur - startMs.value) / totalMs.value) * 100))
})

function onTrackClick(ev: MouseEvent) {
  const target = ev.currentTarget as SVGElement
  const rect = target.getBoundingClientRect()
  const pct = (ev.clientX - rect.left) / rect.width
  const newMs = startMs.value + pct * totalMs.value
  const iso = new Date(newMs).toISOString().replace('Z', '+08:00')
  timeStore.setTime(iso)
  emit('update:time', iso)
}

function eventPct(timestamp: string): number {
  const t = new Date(timestamp).getTime()
  return ((t - startMs.value) / totalMs.value) * 100
}
</script>

<template>
  <div class="timeline">
    <PlayButton />
    <svg viewBox="0 0 1000 60" preserveAspectRatio="none" class="timeline-svg">
      <rect data-test="track" x="0" y="20" width="1000" height="20"
            fill="#3D2F1F" opacity="0.2" @click="onTrackClick" />
      <line data-test="cursor" :x1="cursorPct * 10" y1="10"
            :x2="cursorPct * 10" y2="50"
            stroke="#C0392B" stroke-width="2" />
      <g v-for="(evt, i) in events ?? []" :key="i">
        <line data-test="event-marker" :x1="eventPct(evt.timestamp) * 10" y1="15"
              :x2="eventPct(evt.timestamp) * 10" y2="45"
              stroke="#D4A017" stroke-width="2" />
      </g>
    </svg>
  </div>
</template>

<style scoped lang="scss">
@import '../../assets/styles/variables';

.timeline {
  display: flex;
  align-items: center;
  gap: $gap-md;
  padding: $gap-sm $gap-md;
  background: $bg-paper;
  border-top: 2px solid $ink-primary;

  &-svg {
    flex: 1;
    height: 60px;
  }
}
</style>
```

(`src/components/common/PlayButton.vue`):
```vue
<script setup lang="ts">
import { useTimeStore } from '../../stores/time'

const time = useTimeStore()
</script>

<template>
  <button data-test="play-btn" class="play-btn" @click="time.toggle">
    {{ time.isPlaying ? '暂停' : '播放' }}
  </button>
</template>

<style scoped lang="scss">
@import '../../assets/styles/variables';

.play-btn {
  padding: $gap-sm $gap-md;
  background: $vermilion;
  color: $bg-paper;
  border: none;
  font-family: $font-display;
  cursor: pointer;
}
</style>
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/components/timeline.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/components/timeline/ src/components/common/ tests/components/timeline.test.ts
git commit -m "feat(timeline): SVG timeline with drag cursor and event markers"
```

---

### Task 2.6 — 2D 部队标记组件

**Files**:
- `src/components/map2d/MapView2D.vue`
- `src/components/map2d/ForceMarker.vue`
- `src/components/map2d/TrajectoryLine.vue`
- `tests/components/map2d.test.ts`

**Step 1 — 写测试** (`tests/components/map2d.test.ts`):
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ForceMarker from '../../src/components/map2d/ForceMarker.vue'

describe('ForceMarker', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('renders red marker for red force', () => {
    const wrapper = mount(ForceMarker, {
      props: {
        force: {
          id: '1', side: 'red', name: '红一军团',
          timestamp: '1935-01-22T08:00:00+08:00',
          status: 'marching', source: 'x'
        },
        lng: 105, lat: 28
      }
    })
    expect(wrapper.find('[data-test="marker"]').attributes('data-side')).toBe('red')
  })

  it('renders blue marker for blue force', () => {
    const wrapper = mount(ForceMarker, {
      props: {
        force: {
          id: '2', side: 'blue', name: '敌一师',
          timestamp: '1935-01-22T08:00:00+08:00',
          status: 'engaged', source: 'x'
        },
        lng: 105, lat: 28
      }
    })
    expect(wrapper.find('[data-test="marker"]').attributes('data-side')).toBe('blue')
  })

  it('emits click event', async () => {
    const wrapper = mount(ForceMarker, {
      props: {
        force: {
          id: '3', side: 'red', name: 'X',
          timestamp: '1935-01-22T08:00:00+08:00',
          status: 'marching', source: 'x'
        },
        lng: 105, lat: 28
    }
    })
    await wrapper.find('[data-test="marker"]').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/components/map2d.test.ts
```

**Step 3 — 写实现** (`src/components/map2d/ForceMarker.vue`):
```vue
<script setup lang="ts">
import type { Force } from '../../data/types'

defineProps<{
  force: Force
  lng: number
  lat: number
}>()

defineEmits<{ (e: 'click', force: Force): void }>()
</script>

<template>
  <div class="marker" :data-side="force.side" :data-test="'marker'"
       :data-status="force.status"
       @click.stop="$emit('click', force)">
    <span class="dot"></span>
    <span class="label">{{ force.name }}</span>
  </div>
</template>

<style scoped lang="scss">
@import '../../assets/styles/variables';

.marker {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  user-select: none;

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid #1A1410;
  }

  &[data-side="red"] .dot { background: $vermilion; }
  &[data-side="blue"] .dot { background: $steel-blue; }

  &[data-status="engaged"] .dot {
    animation: pulse 1s ease-in-out infinite;
  }

  .label {
    font-size: 11px;
    color: $ink-primary;
    background: $bg-paper;
    padding: 1px 4px;
    border: 1px solid $ink-secondary;
    font-family: $font-body;
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}
</style>
```

(`src/components/map2d/TrajectoryLine.vue`):
```vue
<script setup lang="ts">
defineProps<{
  points: [number, number][]
  color: string
}>()
</script>

<template>
  <svg class="trajectory">
    <polyline
      :points="points.map(p => p.join(',')).join(' ')"
      :stroke="color"
      stroke-width="2"
      fill="none"
      stroke-dasharray="4 2"
      opacity="0.7"
    />
  </svg>
</template>

<style scoped>
.trajectory {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
```

(`src/components/map2d/MapView2D.vue`):
```vue
<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useMapbox } from '../../composables/useMapbox'
import { useScenarioStore } from '../../stores/scenario'
import { useTimeStore } from '../../stores/time'
import ForceMarker from './ForceMarker.vue'
import TrajectoryLine from './TrajectoryLine.vue'
import EventMarker from './EventMarker.vue'

const props = defineProps<{ phaseId: string }>()

const mapContainer = ref<HTMLElement | null>(null)
const scenario = useScenarioStore()
const time = useTimeStore()
const map = ref<any>(null)

onMounted(async () => {
  if (!mapContainer.value) return
  await scenario.loadPhase(props.phaseId)
  map.value = useMapbox({ container: mapContainer.value })
})

watch(() => props.phaseId, async (id) => {
  await scenario.loadPhase(id)
})

const visibleForces = computed(() => scenario.getForcesAtTime(time.currentTime))
const visibleEvents = computed(() => scenario.data.events.filter(e =>
  new Date(e.timestamp).getTime() <= new Date(time.currentTime).getTime()
))

defineEmits<{
  (e: 'select-force', f: any): void
  (e: 'select-event', ev: any): void
}>()
</script>

<template>
  <div class="map-2d">
    <div ref="mapContainer" class="map-container"></div>
    <div class="overlay">
      <ForceMarker v-for="f in visibleForces" :key="f.id"
                   :force="f" :lng="f.geometry.coordinates[0]"
                   :lat="f.geometry.coordinates[1]"
                   @click="$emit('select-force', f)" />
      <EventMarker v-for="evt in visibleEvents" :key="evt.id"
                   :event="evt" :lng="evt.location[0]" :lat="evt.location[1]"
                   @click="$emit('select-event', evt)" />
      <TrajectoryLine v-for="t in scenario.data.trajectories" :key="t.id"
                      :points="t.geometry.coordinates" :color="t.color" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.map-2d {
  position: relative;
  width: 100%;
  height: 100%;

  .map-container {
    position: absolute;
    inset: 0;
  }

  .overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .overlay > * { pointer-events: auto; }
}
</style>
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/components/map2d.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/components/map2d/ tests/components/map2d.test.ts
git commit -m "feat(map2d): add MapView2D with ForceMarker and TrajectoryLine"
```

---

### Task 2.7 — 事件标记组件 + 视图组装

**Files**:
- `src/components/map2d/EventMarker.vue`
- `src/views/NarrativeView.vue`(完整版)
- `tests/components/event-marker.test.ts`

**Step 1 — 写测试** (`tests/components/event-marker.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EventMarker from '../../src/components/map2d/EventMarker.vue'

describe('EventMarker', () => {
  it('renders battle icon for battle type', () => {
    const wrapper = mount(EventMarker, {
      props: {
        event: { id: 'e1', type: 'battle', title: '土城战役',
                 timestamp: '1935-01-28T10:00:00+08:00',
                 location: [105.97, 28.04],
                 participants: [], description: '', sources: [] },
        lng: 105.97, lat: 28.04
      }
    })
    expect(wrapper.find('[data-test="event-marker"]').attributes('data-type')).toBe('battle')
  })

  it('emits click', async () => {
    const wrapper = mount(EventMarker, {
      props: {
        event: { id: 'e1', type: 'meeting', title: 'X',
                 timestamp: '1935-01-15', location: [105, 28],
                 participants: [], description: '', sources: [] },
        lng: 105, lat: 28
      }
    })
    await wrapper.find('[data-test="event-marker"]').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/components/event-marker.test.ts
```

**Step 3 — 写实现** (`src/components/map2d/EventMarker.vue`):
```vue
<script setup lang="ts">
import type { CampaignEvent } from '../../data/types'

defineProps<{
  event: CampaignEvent
  lng: number
  lat: number
}>()

defineEmits<{ (e: 'click', event: CampaignEvent): void }>()

const ICON: Record<string, string> = {
  battle: '⚔',
  meeting: '✦',
  crossing: '⛵',
  maneuver: '↗'
}
</script>

<template>
  <div class="event-marker" :data-type="event.type" data-test="event-marker"
       @click.stop="$emit('click', event)">
    <span class="icon">{{ ICON[event.type] }}</span>
    <span class="label">{{ event.title }}</span>
  </div>
</template>

<style scoped lang="scss">
@import '../../assets/styles/variables';

.event-marker {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  .icon {
    width: 18px;
    height: 18px;
    background: $sulfur;
    border: 1px solid $ink-primary;
    display: grid;
    place-items: center;
    font-size: 12px;
  }

  &[data-type="battle"] .icon { background: $vermilion; color: $bg-paper; }
  &[data-type="meeting"] .icon { background: $steel-blue; color: $bg-paper; }

  .label {
    font-size: 10px;
    background: $bg-paper;
    padding: 1px 3px;
    border: 1px solid $ink-secondary;
  }
}
</style>
```

更新 `src/views/NarrativeView.vue`(完整版):
```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { phaseById } from '../config/phases'
import { useScenarioStore } from '../stores/scenario'
import { useTimeStore } from '../stores/time'
import MapView2D from '../components/map2d/MapView2D.vue'
import MapView3D from '../components/map3d/MapView3D.vue'
import Timeline from '../components/timeline/Timeline.vue'

const route = useRoute()
const phaseId = computed(() => route.params.phaseId as string)
const phase = computed(() => phaseById(phaseId.value))
const scenario = useScenarioStore()
const time = useTimeStore()

type ViewMode = '2d' | '3d'
const view = ref<ViewMode>('2d')

const eventsForTimeline = computed(() =>
  scenario.data.events.map(e => ({ timestamp: e.timestamp, title: e.title }))
)
</script>

<template>
  <div class="narrative" v-if="phase">
    <header class="topbar">
      <span>{{ phase.name }}</span>
      <button @click="view = view === '2d' ? '3d' : '2d'">
        切换到 {{ view === '2d' ? '3D' : '2D' }}
      </button>
    </header>
    <main class="main">
      <MapView2D v-if="view === '2d'" :phase-id="phaseId" />
      <MapView3D v-else :phase-id="phaseId" />
    </main>
    <Timeline :start="phase.start" :end="phase.end" :events="eventsForTimeline" />
  </div>
</template>

<style scoped lang="scss">
@import '../assets/styles/variables';

.narrative {
  display: flex;
  flex-direction: column;
  height: 100vh;

  .topbar {
    display: flex;
    justify-content: space-between;
    padding: $gap-sm $gap-md;
    background: $bg-dark;
    color: $bg-paper;

    button {
      background: $vermilion;
      color: $bg-paper;
      border: none;
      padding: $gap-xs $gap-md;
      cursor: pointer;
    }
  }
  .main { flex: 1; position: relative; }
}
</style>
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/components/event-marker.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/components/map2d/EventMarker.vue src/views/NarrativeView.vue tests/components/event-marker.test.ts
git commit -m "feat(map2d): add EventMarker and wire NarrativeView with 2D/3D toggle"
```

---

## Phase 3 — 3D 沙盘(W6, 6 任务)

### Task 3.1 — Three.js 集成

**Files**:
- `src/composables/useThreeTerrain.ts`
- `tests/composables/three.test.ts`

**Step 1 — 写测试** (`tests/composables/three.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { useThreeTerrain } from '../../src/composables/useThreeTerrain'

describe('useThreeTerrain', () => {
  it('exports a factory', () => {
    expect(typeof useThreeTerrain).toBe('function')
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/composables/three.test.ts
```

**Step 3 — 写实现** (`src/composables/useThreeTerrain.ts`):
```ts
import * as THREE from 'three'

export interface TerrainOptions {
  container: HTMLElement
  bounds: { west: number; south: number; east: number; north: number }
}

export function useThreeTerrain(opts: TerrainOptions) {
  const { container, bounds } = opts

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#F2E8D0')

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100000)
  camera.position.set(0, 50000, 30000)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.appendChild(renderer.domElement)

  const ambient = new THREE.AmbientLight(0xF2E8D0, 0.6)
  scene.add(ambient)
  const sun = new THREE.DirectionalLight(0xFFE8C0, 0.8)
  sun.position.set(1, 2, 0.5)
  scene.add(sun)

  scene.fog = new THREE.Fog('#F2E8D0', 20000, 100000)

  const center: [number, number] = [
    (bounds.west + bounds.east) / 2,
    (bounds.south + bounds.north) / 2
  ]

  function project(lng: number, lat: number, elev = 0): THREE.Vector3 {
    const x = (lng - center[0]) * 1000
    const z = (lat - center[1]) * 1000
    return new THREE.Vector3(x, elev, z)
  }

  let rafId = 0
  let isRunning = false

  function tick() {
    renderer.render(scene, camera)
    if (isRunning) rafId = requestAnimationFrame(tick)
  }

  function start() {
    isRunning = true
    tick()
  }

  function stop() {
    isRunning = false
    cancelAnimationFrame(rafId)
  }

  function onResize() {
    if (!container) return
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  }

  window.addEventListener('resize', onResize)

  return { scene, camera, renderer, project, start, stop, onResize }
}
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/composables/three.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/composables/useThreeTerrain.ts tests/composables/three.test.ts
git commit -m "feat(3d): add Three.js composable with scene/camera/lights"
```

---

### Task 3.2 — DEM 地形加载

**Files**:
- `src/components/map3d/TerrainMesh.vue`
- `tests/components/terrain.test.ts`

**Step 1 — 写测试** (`tests/components/terrain.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TerrainMesh from '../../src/components/map3d/TerrainMesh.vue'

describe('TerrainMesh', () => {
  it('renders a container', () => {
    const wrapper = mount(TerrainMesh, {
      attachTo: document.body,
      props: {
        bounds: { west: 104, south: 27, east: 106, north: 29 },
        tilesUrl: '/terrain/tiles/{z}/{x}/{y}.png'
      }
    })
    expect(wrapper.find('[data-test="terrain"]').exists()).toBe(true)
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/components/terrain.test.ts
```

**Step 3 — 写实现** (`src/components/map3d/TerrainMesh.vue`):
```vue
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'
import { useThreeTerrain } from '../../composables/useThreeTerrain'

const props = defineProps<{
  bounds: { west: number; south: number; east: number; north: number }
  tilesUrl: string
}>()

const container = ref<HTMLElement | null>(null)
let terrain: ReturnType<typeof useThreeTerrain> | null = null

onMounted(() => {
  if (!container.value) return
  terrain = useThreeTerrain({ container: container.value, bounds: props.bounds })
  loadDEM()
  terrain.start()
})

function loadDEM() {
  if (!terrain) return
  const geometry = new THREE.PlaneGeometry(50000, 50000, 100, 100)
  geometry.rotateX(-Math.PI / 2)
  const vertices = geometry.attributes.position
  for (let i = 0; i < vertices.count; i++) {
    const x = vertices.getX(i)
    const z = vertices.getZ(i)
    const h = Math.sin(x / 5000) * 800 + Math.cos(z / 6000) * 600 + 500
    vertices.setY(i, h)
  }
  geometry.computeVertexNormals()

  const material = new THREE.MeshStandardMaterial({
    color: 0xC9A86A,
    flatShading: true
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.y = 0
  terrain.scene.add(mesh)
}

onBeforeUnmount(() => {
  terrain?.stop()
  terrain?.renderer.dispose()
})
</script>

<template>
  <div ref="container" class="terrain-mesh" data-test="terrain"></div>
</template>

<style scoped>
.terrain-mesh {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/components/terrain.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/components/map3d/TerrainMesh.vue tests/components/terrain.test.ts
git commit -m "feat(3d): add TerrainMesh with simplified DEM geometry"
```

---

### Task 3.3 — 灯光与大气

**Files**:
- `src/components/map3d/Atmosphere.vue`
- `tests/components/atmosphere.test.ts`

**Step 1 — 写测试** (`tests/components/atmosphere.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Atmosphere from '../../src/components/map3d/Atmosphere.vue'

describe('Atmosphere', () => {
  it('renders atmosphere overlay', () => {
    const wrapper = mount(Atmosphere)
    expect(wrapper.find('[data-test="atmosphere"]').exists()).toBe(true)
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/components/atmosphere.test.ts
```

**Step 3 — 写实现** (`src/components/map3d/Atmosphere.vue`):
```vue
<template>
  <div class="atmosphere" data-test="atmosphere">
    <div class="fog"></div>
    <div class="vignette"></div>
    <div class="grain"></div>
  </div>
</template>

<style scoped lang="scss">
@import '../../assets/styles/variables';

.atmosphere {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;

  .fog {
    position: absolute;
    inset: 0;
    background: $bg-paper;
    opacity: 0.15;
    mix-blend-mode: lighten;
  }

  .vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%);
  }

  .grain {
    position: absolute;
    inset: 0;
    opacity: 0.08;
    background-image:
      repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 3px);
  }
}
</style>
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/components/atmosphere.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/components/map3d/Atmosphere.vue tests/components/atmosphere.test.ts
git commit -m "feat(3d): add atmosphere overlay (fog, vignette, grain)"
```

---

### Task 3.4 — 3D 部队标记(立体楔形)

**Files**:
- `src/components/map3d/Force3DArrow.vue`
- `src/components/map3d/MapView3D.vue`
- `tests/components/force3d.test.ts`

**Step 1 — 写测试** (`tests/components/force3d.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Force3DArrow from '../../src/components/map3d/Force3DArrow.vue'

describe('Force3DArrow', () => {
  it('renders a container for red force', () => {
    const wrapper = mount(Force3DArrow, {
      attachTo: document.body,
      props: {
        force: { id: 'r1', side: 'red', name: '红一',
                 timestamp: '1935-01-22T08:00:00+08:00',
                 status: 'marching', source: 'x' },
        lng: 105, lat: 28
      }
    })
    expect(wrapper.find('[data-test="force-3d"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="force-3d"]').attributes('data-side')).toBe('red')
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/components/force3d.test.ts
```

**Step 3 — 写实现** (`src/components/map3d/Force3DArrow.vue`):
```vue
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'
import type { Force } from '../../data/types'

const props = defineProps<{
  force: Force
  lng: number
  lat: number
}>()

const container = ref<HTMLElement | null>(null)
let renderer: THREE.WebGLRenderer | null = null
let arrow: THREE.Mesh | null = null
let rafId = 0

onMounted(() => {
  if (!container.value) return
  renderer = new THREE.WebGLRenderer({ alpha: true })
  renderer.setSize(40, 40)
  container.value.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  camera.position.set(0, 0, 5)

  const geometry = new THREE.ConeGeometry(0.5, 1.5, 4)
  const color = props.force.side === 'red' ? '#C0392B' : '#2C5F7C'
  const material = new THREE.MeshBasicMaterial({ color })
  arrow = new THREE.Mesh(geometry, material)
  arrow.rotation.x = Math.PI / 2
  scene.add(arrow)

  function tick() {
    arrow!.rotation.z += 0.02
    renderer!.render(scene, camera)
    rafId = requestAnimationFrame(tick)
  }
  tick()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  renderer?.dispose()
})
</script>

<template>
  <div ref="container" class="force-3d" data-test="force-3d"
       :data-side="force.side"></div>
</template>

<style scoped>
.force-3d {
  width: 40px;
  height: 40px;
  position: absolute;
  pointer-events: auto;
}
</style>
```

(`src/components/map3d/MapView3D.vue`):
```vue
<script setup lang="ts">
import { onMounted, watch, computed } from 'vue'
import { useScenarioStore } from '../../stores/scenario'
import { useTimeStore } from '../../stores/time'
import TerrainMesh from './TerrainMesh.vue'
import Atmosphere from './Atmosphere.vue'
import Force3DArrow from './Force3DArrow.vue'
import TrajectoryRibbon from './TrajectoryRibbon.vue'

const props = defineProps<{ phaseId: string }>()

const scenario = useScenarioStore()
const time = useTimeStore()
const visible = computed(() => scenario.getForcesAtTime(time.currentTime))

onMounted(async () => {
  await scenario.loadPhase(props.phaseId)
})

watch(() => props.phaseId, async (id) => { await scenario.loadPhase(id) })
</script>

<template>
  <div class="map-3d">
    <TerrainMesh
      :bounds="{ west: 104, south: 27, east: 106.5, north: 29.5 }"
      tiles-url="/terrain/tiles/{z}/{x}/{y}.png" />
    <Atmosphere />
    <TrajectoryRibbon v-for="t in scenario.data.trajectories" :key="t.id"
                      :points="t.geometry.coordinates" :color="t.color" />
    <div class="overlay-3d">
      <Force3DArrow v-for="f in visible" :key="f.id"
                    :force="f"
                    :lng="f.geometry.coordinates[0]"
                    :lat="f.geometry.coordinates[1]" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.map-3d {
  position: relative;
  width: 100%;
  height: 100%;

  .overlay-3d {
    position: absolute;
    inset: 0;
    pointer-events: none;
    > * { pointer-events: auto; }
  }
}
</style>
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/components/force3d.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/components/map3d/Force3DArrow.vue src/components/map3d/MapView3D.vue tests/components/force3d.test.ts
git commit -m "feat(3d): add Force3DArrow wedge and MapView3D"
```

---

### Task 3.5 — 3D 轨迹(贴地发光带)

**Files**:
- `src/components/map3d/TrajectoryRibbon.vue`
- `tests/components/trajectory-ribbon.test.ts`

**Step 1 — 写测试** (`tests/components/trajectory-ribbon.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TrajectoryRibbon from '../../src/components/map3d/TrajectoryRibbon.vue'

describe('TrajectoryRibbon', () => {
  it('renders container', () => {
    const wrapper = mount(TrajectoryRibbon, {
      attachTo: document.body,
      props: {
        points: [[105, 28], [105.1, 28.1], [105.2, 28.2]],
        color: '#C0392B'
      }
    })
    expect(wrapper.find('[data-test="ribbon"]').exists()).toBe(true)
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/components/trajectory-ribbon.test.ts
```

**Step 3 — 写实现** (`src/components/map3d/TrajectoryRibbon.vue`):
```vue
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'

const props = defineProps<{
  points: [number, number][]
  color: string
}>()

const container = ref<HTMLElement | null>(null)
let renderer: THREE.WebGLRenderer | null = null
let line: Line2 | null = null
let rafId = 0

onMounted(() => {
  if (!container.value) return
  renderer = new THREE.WebGLRenderer({ alpha: true })
  renderer.setSize(800, 600)
  container.value.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-400, 400, 300, -300, 0.1, 1000)
  camera.position.z = 10

  const positions: number[] = []
  for (const [lng, lat] of props.points) {
    positions.push((lng - 105) * 1000, 0, (lat - 28) * 1000)
  }
  const geom = new LineGeometry()
  geom.setPositions(positions)
  const mat = new LineMaterial({
    color: new THREE.Color(props.color).getHex(),
    linewidth: 3,
    transparent: true,
    opacity: 0.85
  })
  line = new Line2(geom, mat)
  scene.add(line)

  function tick() {
    renderer!.render(scene, camera)
    rafId = requestAnimationFrame(tick)
  }
  tick()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  renderer?.dispose()
})
</script>

<template>
  <div ref="container" class="ribbon" data-test="ribbon"></div>
</template>

<style scoped>
.ribbon {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/components/trajectory-ribbon.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/components/map3d/TrajectoryRibbon.vue tests/components/trajectory-ribbon.test.ts
git commit -m "feat(3d): add glowing trajectory ribbon using Line2"
```

---

### Task 3.6 — 2D-3D 同步(共享 TimeStore)

**Files**:
- `tests/integration/sync.test.ts`

**Step 1 — 写测试** (`tests/integration/sync.test.ts`):
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTimeStore } from '../../src/stores/time'
import { useScenarioStore } from '../../src/stores/scenario'

describe('2D-3D sync via shared stores', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('TimeStore changes propagate to scenario query', () => {
    const time = useTimeStore()
    const scenario = useScenarioStore()
    scenario.data.forces = [
      { id: 'a', side: 'red', name: 'A', level: 'army',
        timestamp: '1935-01-20T08:00:00+08:00', status: 'marching', source: 'x',
        geometry: { type: 'Point', coordinates: [105, 28] } },
      { id: 'b', side: 'red', name: 'B', level: 'army',
        timestamp: '1935-01-25T08:00:00+08:00', status: 'marching', source: 'x',
        geometry: { type: 'Point', coordinates: [105.1, 28.1] } }
    ]

    time.setTime('1935-01-22T00:00:00+08:00')
    expect(scenario.getForcesAtTime(time.currentTime).length).toBe(1)

    time.setTime('1935-01-26T00:00:00+08:00')
    expect(scenario.getForcesAtTime(time.currentTime).length).toBe(2)
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/integration/sync.test.ts
```

**Step 3 — 写实现**:

2D 和 3D 视图都通过 `useTimeStore()` 共享时间 — 已经隐式实现。`NarrativeView.vue` 通过 `view` ref 切换 MapView2D / MapView3D,两者均订阅 TimeStore。

无需新代码;只需在 README 中记录同步机制。

更新 `docs/sync.md`:
```markdown
# 2D-3D 同步机制

- **TimeStore**:Pinia 单一写入源,MapView2D / MapView3D / Timeline 均订阅
- **切换视图**:仅切换渲染层,数据层(TimeStore / ScenarioStore)不变
- **状态保留**:相机位置、当前时间在切换时不丢失(待 Task 5.x 实现)
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/integration/sync.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add tests/integration/
git commit -m "test(integration): verify 2D-3D sync via shared TimeStore"
```

---

## Phase 4 — 三视图联动(W7, 6 任务)

### Task 4.1 — SelectionStore

**Files**:
- `src/stores/selection.ts`
- `tests/stores/selection.test.ts`

**Step 1 — 写测试** (`tests/stores/selection.test.ts`):
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSelectionStore } from '../../src/stores/selection'

describe('SelectionStore', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('initializes with no selection', () => {
    const store = useSelectionStore()
    expect(store.selected).toBeNull()
  })

  it('select() sets selection', () => {
    const store = useSelectionStore()
    store.select({ kind: 'force', id: 'r1' })
    expect(store.selected).toEqual({ kind: 'force', id: 'r1' })
  })

  it('clear() removes selection', () => {
    const store = useSelectionStore()
    store.select({ kind: 'force', id: 'r1' })
    store.clear()
    expect(store.selected).toBeNull()
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/stores/selection.test.ts
```

**Step 3 — 写实现** (`src/stores/selection.ts`):
```ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export type SelectionKind = 'force' | 'event' | 'person' | 'meeting'
export interface Selection {
  kind: SelectionKind
  id: string
}

export const useSelectionStore = defineStore('selection', () => {
  const selected = ref<Selection | null>(null)

  function select(s: Selection) {
    selected.value = s
  }

  function clear() {
    selected.value = null
  }

  return { selected, select, clear }
})
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/stores/selection.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/stores/selection.ts tests/stores/selection.test.ts
git commit -m "feat(stores): add SelectionStore for force/event/person/meeting"
```

---

### Task 4.2 — 视图模式 Store

**Files**:
- `src/stores/view.ts`
- `tests/stores/view.test.ts`

**Step 1 — 写测试** (`tests/stores/view.test.ts`):
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useViewStore } from '../../src/stores/view'

describe('ViewStore', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('initial viewMode is 2d', () => {
    const store = useViewStore()
    expect(store.viewMode).toBe('2d')
  })

  it('setMode changes view', () => {
    const store = useViewStore()
    store.setMode('3d')
    expect(store.viewMode).toBe('3d')
    store.setMode('split')
    expect(store.viewMode).toBe('split')
  })

  it('appMode toggles narrative/explore', () => {
    const store = useViewStore()
    expect(store.appMode).toBe('narrative')
    store.setAppMode('explore')
    expect(store.appMode).toBe('explore')
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/stores/view.test.ts
```

**Step 3 — 写实现** (`src/stores/view.ts`):
```ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ViewMode = '2d' | '3d' | 'split'
export type AppMode = 'narrative' | 'explore'

export const useViewStore = defineStore('view', () => {
  const viewMode = ref<ViewMode>('2d')
  const appMode = ref<AppMode>('narrative')

  function setMode(m: ViewMode) { viewMode.value = m }
  function setAppMode(m: AppMode) { appMode.value = m }

  return { viewMode, appMode, setMode, setAppMode }
})
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/stores/view.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/stores/view.ts tests/stores/view.test.ts
git commit -m "feat(stores): add ViewStore for 2D/3D/split and narrative/explore"
```

---

### Task 4.3 — 视图切换组件

**Files**:
- `src/components/layout/ViewSwitcher.vue`
- `tests/components/view-switcher.test.ts`

**Step 1 — 写测试** (`tests/components/view-switcher.test.ts`):
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ViewSwitcher from '../../src/components/layout/ViewSwitcher.vue'

describe('ViewSwitcher', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('renders three buttons', () => {
    const wrapper = mount(ViewSwitcher)
    expect(wrapper.findAll('button').length).toBe(3)
  })

  it('clicking 3D button sets viewMode to 3d', async () => {
    const wrapper = mount(ViewSwitcher)
    await wrapper.find('[data-test="btn-3d"]').trigger('click')
    expect(wrapper.find('[data-test="btn-3d"]').classes()).toContain('active')
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/components/view-switcher.test.ts
```

**Step 3 — 写实现** (`src/components/layout/ViewSwitcher.vue`):
```vue
<script setup lang="ts">
import { useViewStore, type ViewMode } from '../../stores/view'

const view = useViewStore()

const MODES: { id: ViewMode; label: string }[] = [
  { id: '2d', label: '2D' },
  { id: '3d', label: '3D' },
  { id: 'split', label: '分屏' }
]
</script>

<template>
  <div class="view-switcher">
    <button v-for="m in MODES" :key="m.id"
            :data-test="`btn-${m.id}`"
            :class="['mode-btn', { active: view.viewMode === m.id }]"
            @click="view.setMode(m.id)">
      {{ m.label }}
    </button>
  </div>
</template>

<style scoped lang="scss">
@import '../../assets/styles/variables';

.view-switcher {
  display: flex;
  gap: $gap-xs;

  .mode-btn {
    padding: $gap-xs $gap-md;
    background: $bg-paper;
    border: 1px solid $ink-primary;
    font-family: $font-display;
    cursor: pointer;

    &.active {
      background: $vermilion;
      color: $bg-paper;
    }
  }
}
</style>
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/components/view-switcher.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/components/layout/ViewSwitcher.vue tests/components/view-switcher.test.ts
git commit -m "feat(layout): add ViewSwitcher for 2D/3D/split toggle"
```

---

### Task 4.4 — 详情面板

**Files**:
- `src/components/detail/ForceDetail.vue`
- `src/components/detail/EventDetail.vue`
- `src/components/detail/PersonDetail.vue`
- `src/components/detail/MeetingDetail.vue`
- `src/components/detail/DetailPanel.vue`
- `tests/components/detail.test.ts`

**Step 1 — 写测试** (`tests/components/detail.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ForceDetail from '../../src/components/detail/ForceDetail.vue'

describe('ForceDetail', () => {
  it('renders name and commander', () => {
    const wrapper = mount(ForceDetail, {
      props: {
        force: { id: 'r1', side: 'red', name: '红一军团', level: 'army',
                 timestamp: '1935-01-22T08:00:00+08:00',
                 status: 'marching', source: '《长征》p.142',
                 strength: 18000, commander: '林彪' }
      }
    })
    expect(wrapper.text()).toContain('红一军团')
    expect(wrapper.text()).toContain('林彪')
  })

  it('shows source citation', () => {
    const wrapper = mount(ForceDetail, {
      props: {
        force: { id: 'r1', side: 'red', name: 'X', level: 'army',
                 timestamp: '1935-01-22T08:00:00+08:00',
                 status: 'marching', source: '《长征》p.142' }
      }
    })
    expect(wrapper.text()).toContain('《长征》p.142')
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/components/detail.test.ts
```

**Step 3 — 写实现** (`src/components/detail/ForceDetail.vue`):
```vue
<script setup lang="ts">
import type { Force } from '../../data/types'

defineProps<{ force: Force }>()
</script>

<template>
  <article class="force-detail" data-test="force-detail">
    <h3 :class="['name', `side-${force.side}`]">{{ force.name }}</h3>
    <dl>
      <dt>级别</dt><dd>{{ force.level }}</dd>
      <dt v-if="force.commander">指挥官</dt><dd v-if="force.commander">{{ force.commander }}</dd>
      <dt v-if="force.strength">兵力</dt><dd v-if="force.strength">{{ force.strength }}</dd>
      <dt>状态</dt><dd>{{ force.status }}</dd>
      <dt v-if="force.next_destination">下一站</dt><dd v-if="force.next_destination">{{ force.next_destination }}</dd>
    </dl>
    <footer class="source">出处:{{ force.source }}</footer>
  </article>
</template>

<style scoped lang="scss">
@import '../../assets/styles/variables';

.force-detail {
  padding: $gap-md;
  background: $bg-paper;
  border: 1px solid $ink-primary;
  font-family: $font-body;

  .name {
    font-family: $font-display;
    margin: 0 0 $gap-sm;
    border-bottom: 2px solid $ink-primary;
    padding-bottom: $gap-xs;
  }
  .side-red { color: $vermilion; }
  .side-blue { color: $steel-blue; }

  dl {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: $gap-xs $gap-sm;
    margin: $gap-sm 0;
  }
  dt { color: $ink-secondary; font-size: 0.85em; }
  dd { margin: 0; }

  .source {
    margin-top: $gap-sm;
    padding-top: $gap-xs;
    border-top: 1px dashed $ink-secondary;
    font-size: 0.8em;
    color: $ink-secondary;
  }
}
</style>
```

(`src/components/detail/EventDetail.vue`):
```vue
<script setup lang="ts">
import type { CampaignEvent } from '../../data/types'

defineProps<{ event: CampaignEvent }>()
</script>

<template>
  <article class="event-detail" data-test="event-detail">
    <h3>{{ event.title }}</h3>
    <p class="time">{{ event.timestamp }}</p>
    <p v-if="event.outcome" class="outcome">结果:{{ event.outcome }}</p>
    <p v-if="event.casualties_red != null || event.casualties_blue != null" class="casualties">
      伤亡:红军 {{ event.casualties_red ?? '?' }} / 敌军 {{ event.casualties_blue ?? '?' }}
    </p>
    <p class="description">{{ event.description }}</p>
    <footer class="sources">
      <span v-for="(s, i) in event.sources" :key="i">{{ s }}</span>
    </footer>
  </article>
</template>

<style scoped lang="scss">
@import '../../assets/styles/variables';

.event-detail {
  padding: $gap-md;
  background: $bg-paper;
  border: 1px solid $ink-primary;
  font-family: $font-body;

  h3 {
    font-family: $font-display;
    margin: 0 0 $gap-sm;
    color: $vermilion;
  }
  .time { color: $ink-secondary; font-size: 0.85em; }
  .outcome { font-weight: bold; }
  .casualties { color: $ink-primary; }
  .description { margin: $gap-sm 0; line-height: 1.6; }

  .sources {
    margin-top: $gap-sm;
    padding-top: $gap-xs;
    border-top: 1px dashed $ink-secondary;
    font-size: 0.8em;
    display: flex;
    flex-direction: column;
    gap: 2px;
    color: $ink-secondary;
  }
}
</style>
```

(`src/components/detail/PersonDetail.vue`):
```vue
<script setup lang="ts">
import type { Person } from '../../data/types'

defineProps<{ person: Person }>()
</script>

<template>
  <article class="person-detail" data-test="person-detail">
    <h3>{{ person.name }}</h3>
    <p class="role">{{ person.role }}</p>
    <h4>关键决策</h4>
    <ul class="decisions">
      <li v-for="(d, i) in person.key_decisions" :key="i">
        <time>{{ d.timestamp }}</time> — {{ d.decision }}
      </li>
    </ul>
  </article>
</template>

<style scoped lang="scss">
@import '../../assets/styles/variables';

.person-detail {
  padding: $gap-md;
  background: $bg-paper;
  border: 1px solid $ink-primary;
  font-family: $font-body;

  h3 {
    font-family: $font-display;
    margin: 0 0 $gap-xs;
    color: $steel-blue;
  }
  h4 {
    font-family: $font-display;
    margin: $gap-sm 0 $gap-xs;
    font-size: 1em;
  }
  .role { color: $ink-secondary; margin: 0 0 $gap-sm; }
  .decisions { padding-left: $gap-md; margin: 0; }
  time { color: $ink-secondary; font-family: $font-data; font-size: 0.85em; }
}
</style>
```

(`src/components/detail/MeetingDetail.vue`):
```vue
<script setup lang="ts">
import type { Meeting } from '../../data/types'

defineProps<{ meeting: Meeting }>()
</script>

<template>
  <article class="meeting-detail" data-test="meeting-detail">
    <h3>{{ meeting.title }}</h3>
    <p class="meta">{{ meeting.date }} · {{ meeting.location }}</p>
    <h4>背景</h4>
    <p>{{ meeting.background }}</p>
    <h4>决议</h4>
    <ul>
      <li v-for="(r, i) in meeting.resolutions" :key="i">{{ r }}</li>
    </ul>
    <h4>出席</h4>
    <p class="participants">{{ meeting.participants.join('、') }}</p>
    <footer class="sources">
      <span v-for="(s, i) in meeting.sources" :key="i">{{ s }}</span>
    </footer>
  </article>
</template>

<style scoped lang="scss">
@import '../../assets/styles/variables';

.meeting-detail {
  padding: $gap-md;
  background: $bg-paper;
  border: 1px solid $ink-primary;
  font-family: $font-body;
  max-width: 700px;
  margin: $gap-lg auto;

  h3 {
    font-family: $font-display;
    margin: 0 0 $gap-xs;
    color: $vermilion;
    border-bottom: 2px solid $ink-primary;
    padding-bottom: $gap-xs;
  }
  h4 {
    font-family: $font-display;
    margin: $gap-md 0 $gap-xs;
    font-size: 1em;
  }
  .meta { color: $ink-secondary; font-style: italic; }
  .participants { color: $ink-primary; }
  .sources {
    margin-top: $gap-md;
    padding-top: $gap-sm;
    border-top: 1px dashed $ink-secondary;
    font-size: 0.8em;
    color: $ink-secondary;
  }
}
</style>
```

(`src/components/detail/DetailPanel.vue`):
```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useSelectionStore } from '../../stores/selection'
import { useScenarioStore } from '../../stores/scenario'
import ForceDetail from './ForceDetail.vue'
import EventDetail from './EventDetail.vue'
import PersonDetail from './PersonDetail.vue'
import MeetingDetail from './MeetingDetail.vue'
import meetings from '../../../public/data/meetings.json'
import persons from '../../../public/data/persons.json'

const selection = useSelectionStore()
const scenario = useScenarioStore()

const force = computed(() => {
  if (selection.selected?.kind !== 'force') return null
  return scenario.data.forces.find(f => f.id === selection.selected!.id) ?? null
})

const event = computed(() => {
  if (selection.selected?.kind !== 'event') return null
  return scenario.data.events.find(e => e.id === selection.selected!.id) ?? null
})

const person = computed(() => {
  if (selection.selected?.kind !== 'person') return null
  return (persons as any).persons.find((p: any) => p.id === selection.selected!.id) ?? null
})

const meeting = computed(() => {
  if (selection.selected?.kind !== 'meeting') return null
  return (meetings as any).meetings.find((m: any) => m.id === selection.selected!.id) ?? null
})
</script>

<template>
  <aside class="detail-panel" data-test="detail-panel">
    <button v-if="selection.selected" class="close-btn" @click="selection.clear">×</button>
    <ForceDetail v-if="force" :force="force" />
    <EventDetail v-else-if="event" :event="event" />
    <PersonDetail v-else-if="person" :person="person" />
    <MeetingDetail v-else-if="meeting" :meeting="meeting" />
    <p v-else class="empty">点击部队/事件/人物查看详情</p>
  </aside>
</template>

<style scoped lang="scss">
@import '../../assets/styles/variables';

.detail-panel {
  position: relative;
  width: 320px;
  height: 100%;
  background: $bg-paper;
  border-left: 2px solid $ink-primary;
  overflow-y: auto;

  .close-btn {
    position: absolute;
    top: $gap-xs;
    right: $gap-xs;
    background: transparent;
    border: 1px solid $ink-primary;
    width: 24px;
    height: 24px;
    cursor: pointer;
    font-size: 1.2em;
    line-height: 1;
  }

  .empty {
    padding: $gap-md;
    color: $ink-secondary;
    text-align: center;
    font-style: italic;
  }
}
</style>
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/components/detail.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/components/detail/ tests/components/detail.test.ts
git commit -m "feat(detail): add detail panel with Force/Event/Person/Meeting cards"
```

---

### Task 4.5 — 探索侧栏

**Files**:
- `src/components/layout/ExploreSidebar.vue`
- `src/components/layout/FilterPanel.vue`
- `src/views/ExploreView.vue`(完整版)
- `tests/components/explore-sidebar.test.ts`

**Step 1 — 写测试** (`tests/components/explore-sidebar.test.ts`):
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ExploreSidebar from '../../src/components/layout/ExploreSidebar.vue'

describe('ExploreSidebar', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('renders filter checkboxes', () => {
    const wrapper = mount(ExploreSidebar, {
      props: { forces: [], events: [], persons: [] }
    })
    expect(wrapper.find('[data-test="filter-red"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="filter-blue"]').exists()).toBe(true)
  })

  it('emits filter change', async () => {
    const wrapper = mount(ExploreSidebar, {
      props: { forces: [], events: [], persons: [] }
    })
    await wrapper.find('[data-test="filter-red"]').setValue(false)
    expect(wrapper.emitted('update:filters')).toBeTruthy()
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/components/explore-sidebar.test.ts
```

**Step 3 — 写实现** (`src/components/layout/ExploreSidebar.vue`):
```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { Force, CampaignEvent, Person } from '../../data/types'

const props = defineProps<{
  forces: Force[]
  events: CampaignEvent[]
  persons: Person[]
}>()

const emit = defineEmits<{ (e: 'update:filters', f: FilterState): void }>()

export interface FilterState {
  red: boolean
  blue: boolean
  armyOnly: boolean
  battleOnly: boolean
  meetingOnly: boolean
}

const filters = ref<FilterState>({
  red: true,
  blue: true,
  armyOnly: false,
  battleOnly: false,
  meetingOnly: false
})

function emitChange() {
  emit('update:filters', { ...filters.value })
}
</script>

<template>
  <aside class="explore-sidebar" data-test="explore-sidebar">
    <section class="filter-block">
      <h4>阵营</h4>
      <label><input type="checkbox" data-test="filter-red" v-model="filters.red" @change="emitChange" /> 红军</label>
      <label><input type="checkbox" data-test="filter-blue" v-model="filters.blue" @change="emitChange" /> 敌军</label>
    </section>
    <section class="filter-block">
      <h4>部队级别</h4>
      <label><input type="checkbox" data-test="filter-army" v-model="filters.armyOnly" @change="emitChange" /> 仅军级</label>
    </section>
    <section class="filter-block">
      <h4>事件类型</h4>
      <label><input type="checkbox" data-test="filter-battle" v-model="filters.battleOnly" @change="emitChange" /> 仅战斗</label>
      <label><input type="checkbox" data-test="filter-meeting" v-model="filters.meetingOnly" @change="emitChange" /> 仅会议</label>
    </section>
    <section class="list-block">
      <h4>部队 ({{ forces.length }})</h4>
      <ul>
        <li v-for="f in forces.slice(0, 50)" :key="f.id">
          {{ f.name }} <span class="dim">({{ f.level }})</span>
        </li>
      </ul>
    </section>
    <section class="list-block">
      <h4>人物 ({{ persons.length }})</h4>
      <ul>
        <li v-for="p in persons" :key="p.id">{{ p.name }} <span class="dim">({{ p.role }})</span></li>
      </ul>
    </section>
  </aside>
</template>

<style scoped lang="scss">
@import '../../assets/styles/variables';

.explore-sidebar {
  width: 280px;
  height: 100%;
  background: $bg-paper;
  border-left: 2px solid $ink-primary;
  overflow-y: auto;
  padding: $gap-md;
  font-family: $font-body;

  h4 {
    font-family: $font-display;
    margin: $gap-md 0 $gap-xs;
    font-size: 1em;
    color: $ink-primary;
  }
  label {
    display: block;
    margin: $gap-xs 0;
    cursor: pointer;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    li {
      padding: 2px 0;
      border-bottom: 1px dotted $ink-secondary;
      font-size: 0.9em;
    }
  }
  .dim { color: $ink-secondary; font-size: 0.85em; }
}
</style>
```

(`src/components/layout/FilterPanel.vue`):合并入 ExploreSidebar。

(`src/views/ExploreView.vue`):
```vue
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { phaseById } from '../config/phases'
import { useScenarioStore } from '../stores/scenario'
import { useTimeStore } from '../stores/time'
import { useSelectionStore } from '../stores/selection'
import MapView2D from '../components/map2d/MapView2D.vue'
import ExploreSidebar from '../components/layout/ExploreSidebar.vue'
import DetailPanel from '../components/detail/DetailPanel.vue'
import Timeline from '../components/timeline/Timeline.vue'
import type { FilterState } from '../components/layout/ExploreSidebar.vue'
import personsData from '../../public/data/persons.json'

const route = useRoute()
const phaseId = computed(() => route.params.phaseId as string)
const phase = computed(() => phaseById(phaseId.value))
const scenario = useScenarioStore()
const time = useTimeStore()
const selection = useSelectionStore()

const filters = ref<FilterState>({
  red: true, blue: true, armyOnly: false,
  battleOnly: false, meetingOnly: false
})

const visibleForces = computed(() => {
  const all = scenario.getForcesAtTime(time.currentTime)
  return all.filter(f => {
    if (f.side === 'red' && !filters.value.red) return false
    if (f.side === 'blue' && !filters.value.blue) return false
    if (filters.value.armyOnly && f.level !== 'army') return false
    return true
  })
})

const visibleEvents = computed(() => {
  return scenario.data.events.filter(e => {
    if (filters.value.battleOnly && e.type !== 'battle') return false
    if (filters.value.meetingOnly && e.type !== 'meeting') return false
    return true
  })
})

onMounted(async () => { await scenario.loadPhase(phaseId.value) })
</script>

<template>
  <div class="explore" v-if="phase">
    <header class="topbar">
      <span>{{ phase.name }} · 探索模式</span>
    </header>
    <main class="main">
      <MapView2D :phase-id="phaseId" />
      <ExploreSidebar
        :forces="visibleForces"
        :events="visibleEvents"
        :persons="(personsData as any).persons"
        @update:filters="filters = $event" />
      <DetailPanel />
    </main>
    <Timeline :start="phase.start" :end="phase.end" />
  </div>
</template>

<style scoped lang="scss">
@import '../assets/styles/variables';

.explore {
  display: flex;
  flex-direction: column;
  height: 100vh;

  .topbar {
    padding: $gap-sm $gap-md;
    background: $bg-dark;
    color: $bg-paper;
    font-family: $font-display;
  }

  .main {
    flex: 1;
    display: flex;
    position: relative;
  }
}
</style>
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/components/explore-sidebar.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/components/layout/ src/views/ExploreView.vue tests/components/explore-sidebar.test.ts
git commit -m "feat(explore): add ExploreView with sidebar filter and detail panel"
```

---

### Task 4.6 — 键盘快捷键

**Files**:
- `src/composables/useKeyboard.ts`
- `src/components/common/KeyboardHelp.vue`
- `tests/composables/keyboard.test.ts`

**Step 1 — 写测试** (`tests/composables/keyboard.test.ts`):
```ts
import { describe, it, expect, vi } from 'vitest'
import { useKeyboard } from '../../src/composables/useKeyboard'

describe('useKeyboard', () => {
  it('exports a function', () => {
    expect(typeof useKeyboard).toBe('function')
  })

  it('binds key handler', () => {
    const handler = vi.fn()
    const off = useKeyboard({ Space: handler })
    const ev = new KeyboardEvent('keydown', { key: ' ' })
    window.dispatchEvent(ev)
    expect(handler).toHaveBeenCalled()
    off()
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/composables/keyboard.test.ts
```

**Step 3 — 写实现** (`src/composables/useKeyboard.ts`):
```ts
export type KeyHandler = (ev: KeyboardEvent) => void

export interface KeyMap {
  [key: string]: KeyHandler
}

export function useKeyboard(map: KeyMap): () => void {
  function onKeyDown(ev: KeyboardEvent) {
    const handler = map[ev.key]
    if (handler) handler(ev)
  }
  window.addEventListener('keydown', onKeyDown)
  return () => window.removeEventListener('keydown', onKeyDown)
}
```

(`src/components/common/KeyboardHelp.vue`):
```vue
<script setup lang="ts">
import { ref } from 'vue'
import useKeyboard from '../../composables/useKeyboard'

const show = ref(false)

const SHORTCUTS = [
  { key: 'Space', desc: '播放 / 暂停' },
  { key: '← / →', desc: '上一 / 下一事件' },
  { key: '↑ / ↓', desc: '时间轴缩放' },
  { key: '1 / 2 / 3', desc: '2D / 3D / 分屏' },
  { key: 'E', desc: '探索模式' },
  { key: 'N', desc: '叙事模式' },
  { key: '?', desc: '显示本帮助' }
]

useKeyboard({ '?': () => show.value = !show.value })
</script>

<template>
  <div class="keyboard-help">
    <button class="help-btn" @click="show = !show">?</button>
    <div v-if="show" class="help-panel" data-test="help-panel">
      <h4>键盘快捷键</h4>
      <dl>
        <template v-for="s in SHORTCUTS" :key="s.key">
          <dt>{{ s.key }}</dt><dd>{{ s.desc }}</dd>
        </template>
      </dl>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '../../assets/styles/variables';

.keyboard-help {
  position: fixed;
  bottom: $gap-md;
  right: $gap-md;
  z-index: 1000;

  .help-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: $ink-primary;
    color: $bg-paper;
    border: none;
    cursor: pointer;
    font-family: $font-display;
  }

  .help-panel {
    position: absolute;
    bottom: 40px;
    right: 0;
    width: 280px;
    padding: $gap-md;
    background: $bg-paper;
    border: 2px solid $ink-primary;

    h4 {
      font-family: $font-display;
      margin: 0 0 $gap-sm;
      border-bottom: 2px solid $ink-primary;
      padding-bottom: $gap-xs;
    }
    dl { display: grid; grid-template-columns: 100px 1fr; gap: $gap-xs; margin: 0; }
    dt { font-family: $font-data; color: $vermilion; }
    dd { margin: 0; font-family: $font-body; }
  }
}
</style>
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/composables/keyboard.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/composables/useKeyboard.ts src/components/common/KeyboardHelp.vue tests/composables/keyboard.test.ts
git commit -m "feat(keyboard): add keyboard shortcuts and help overlay"
```

---

## Phase 5 — 视觉打磨(W10, 8 任务)

### Task 5.1 — Landing 页

**Files**:
- `src/views/LandingView.vue`(完整版)
- `tests/views/landing.test.ts`

**Step 1 — 写测试** (`tests/views/landing.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import LandingView from '../../src/views/LandingView.vue'

describe('LandingView', () => {
  it('renders title and CTA', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: LandingView }, { path: '/phases', component: { template: 'X' } }]
    })
    const wrapper = mount(LandingView, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('四渡赤水')
    expect(wrapper.find('[data-test="enter-btn"]').exists()).toBe(true)
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/views/landing.test.ts
```

**Step 3 — 写实现** (`src/views/LandingView.vue`):
```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <main class="landing">
    <div class="hero">
      <div class="compass">✦</div>
      <h1>四渡赤水</h1>
      <h2>全景沙盘</h2>
      <p class="date-range">1935.1.19 — 1935.5.9</p>
      <p class="description">
        一渡、二渡、三渡、四渡,巧渡金沙江。<br/>
        三视图联动 · 110 天 · 古旧军图风格
      </p>
      <button data-test="enter-btn" class="enter" @click="router.push('/phases')">
        进入战役
      </button>
    </div>
    <footer class="credits">
      <p>公开史料 · 严谨考据 · 视觉精美</p>
    </footer>
  </main>
</template>

<style scoped lang="scss">
@import '../assets/styles/variables';

.landing {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: $bg-paper;
  background-image:
    repeating-linear-gradient(0deg, transparent 0px, transparent 39px, rgba(0,0,0,0.04) 40px),
    repeating-linear-gradient(90deg, transparent 0px, transparent 39px, rgba(0,0,0,0.04) 40px);

  .hero {
    text-align: center;
    padding: $gap-xl;
    border: 3px double $ink-primary;
    background: rgba(242, 232, 208, 0.7);

    .compass {
      font-size: 4rem;
      color: $vermilion;
      animation: spin 8s linear infinite;
    }
    h1 {
      font-size: 5rem;
      margin: $gap-md 0 0;
      letter-spacing: 0.2em;
    }
    h2 {
      font-size: 2rem;
      margin: $gap-sm 0 $gap-md;
      color: $steel-blue;
      letter-spacing: 0.1em;
    }
    .date-range {
      font-family: $font-data;
      color: $ink-secondary;
      margin: $gap-sm 0;
    }
    .description {
      font-family: $font-body;
      max-width: 500px;
      margin: $gap-md auto;
      line-height: 1.8;
      color: $ink-primary;
    }
    .enter {
      margin-top: $gap-lg;
      padding: $gap-md $gap-xl;
      background: $vermilion;
      color: $bg-paper;
      border: 2px solid $ink-primary;
      font-family: $font-display;
      font-size: 1.2rem;
      letter-spacing: 0.1em;
      cursor: pointer;
      transition: transform $dur-fast;

      &:hover { transform: translateY(-2px); box-shadow: 4px 4px 0 $ink-primary; }
    }
  }

  .credits {
    margin-top: $gap-xl;
    color: $ink-secondary;
    font-family: $font-body;
    font-size: 0.9em;
    font-style: italic;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/views/landing.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/views/LandingView.vue tests/views/landing.test.ts
git commit -m "feat(landing): full landing page with hero, compass, CTA"
```

---

### Task 5.2 — 阶段选择页

**Files**:
- `src/views/PhaseSelectView.vue`(完整版)
- `tests/views/phase-select.test.ts`

**Step 1 — 写测试** (`tests/views/phase-select.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import PhaseSelectView from '../../src/views/PhaseSelectView.vue'

describe('PhaseSelectView', () => {
  it('renders five phase cards', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/phases', component: PhaseSelectView }]
    })
    const wrapper = mount(PhaseSelectView, { global: { plugins: [router] } })
    expect(wrapper.findAll('[data-test="phase-card"]').length).toBe(5)
  })

  it('first card is 一渡赤水', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/phases', component: PhaseSelectView }]
    })
    const wrapper = mount(PhaseSelectView, { global: { plugins: [router] } })
    expect(wrapper.find('[data-test="phase-card"]').text()).toContain('一渡')
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/views/phase-select.test.ts
```

**Step 3 — 写实现** (`src/views/PhaseSelectView.vue`):
```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { PHASES } from '../config/phases'

const router = useRouter()
function enter(phaseId: string) {
  router.push(`/narrative/${phaseId}`)
}
</script>

<template>
  <main class="phase-select">
    <header><h1>选择战役阶段</h1></header>
    <section class="grid">
      <article v-for="p in PHASES" :key="p.id"
               data-test="phase-card"
               :style="{ borderColor: p.color }"
               class="card"
               @click="enter(p.id)">
        <h2 :style="{ color: p.color }">{{ p.name }}</h2>
        <time>{{ p.start }} — {{ p.end }}</time>
        <p class="action">叙事模式 →</p>
        <button class="explore-btn" @click.stop="router.push(`/explore/${p.id}`)">
          探索模式
        </button>
      </article>
    </section>
  </main>
</template>

<style scoped lang="scss">
@import '../assets/styles/variables';

.phase-select {
  min-height: 100vh;
  padding: $gap-xl;
  background: $bg-paper;

  header {
    text-align: center;
    margin-bottom: $gap-xl;

    h1 {
      font-family: $font-display;
      font-size: 2.5rem;
      letter-spacing: 0.1em;
    }
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: $gap-md;
    max-width: 1200px;
    margin: 0 auto;
  }

  .card {
    background: $bg-paper;
    border: 3px solid $ink-primary;
    padding: $gap-lg;
    cursor: pointer;
    transition: transform $dur-fast;
    font-family: $font-body;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 6px 6px 0 rgba(0,0,0,0.15);
    }

    h2 {
      font-family: $font-display;
      font-size: 1.8rem;
      margin: 0 0 $gap-sm;
    }
    time {
      font-family: $font-data;
      color: $ink-secondary;
      font-size: 0.9em;
    }
    .action {
      margin-top: $gap-md;
      color: $ink-primary;
      font-weight: bold;
    }
    .explore-btn {
      margin-top: $gap-sm;
      padding: $gap-xs $gap-md;
      background: transparent;
      border: 1px solid $ink-primary;
      cursor: pointer;
      font-family: $font-body;
      &:hover { background: $ink-primary; color: $bg-paper; }
    }
  }
}
</style>
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/views/phase-select.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/views/PhaseSelectView.vue tests/views/phase-select.test.ts
git commit -m "feat(phase-select): five phase cards with narrative/explore entry"
```

---

### Task 5.3 — 叙事旁白脚本

**Files**:
- `public/data/narrations/first-crossing.json`
- `src/composables/useNarration.ts`
- `tests/composables/narration.test.ts`

**Step 1 — 写测试** (`tests/composables/narration.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { useNarration } from '../../src/composables/useNarration'

describe('useNarration', () => {
  it('returns script for given event', () => {
    const narration = useNarration()
    const script = narration.getScript('evt-tucheng-1935-01-28')
    expect(typeof script).toBe('string')
    expect(script.length).toBeGreaterThan(50)
  })

  it('returns empty string for unknown event', () => {
    const narration = useNarration()
    expect(narration.getScript('unknown')).toBe('')
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/composables/narration.test.ts
```

**Step 3 — 写实现** (`public/data/narrations/first-crossing.json`):
```json
{
  "evt-tucheng-1935-01-28": "1935年1月28日,土城战役打响。红军三、五军团与川军教导师在土城青杠坡一带激战八小时。因敌情判断有误,川军增援部队赶到,红军伤亡三千余人。当晚,毛泽东提议主动撤出战斗,西渡赤水河。",
  "evt-chishui-first-cross-1935-01-29": "1月29日拂晓,红军分三路从猿猴(今元厚)、土城南北地区西渡赤水河,顺利进入四川古蔺、叙永地区。一渡赤水,放弃原定北渡长江计划,首次显示运动战的灵活性。"
}
```

(`src/composables/useNarration.ts`):
```ts
import { ref } from 'vue'
import firstCrossing from '../../public/data/narrations/first-crossing.json'

const SOURCES: Record<string, Record<string, string>> = {
  'first-crossing': firstCrossing as Record<string, string>
}

const cache = ref<Record<string, string>>({})

export function useNarration() {
  function getScript(eventId: string, phaseId = 'first-crossing'): string {
    if (cache.value[eventId] !== undefined) return cache.value[eventId]
    const text = SOURCES[phaseId]?.[eventId] ?? ''
    cache.value[eventId] = text
    return text
  }

  function getAllScripts(phaseId: string): Record<string, string> {
    return SOURCES[phaseId] ?? {}
  }

  return { getScript, getAllScripts }
}
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/composables/narration.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/composables/useNarration.ts public/data/narrations/ tests/composables/narration.test.ts
git commit -m "feat(narration): add narrative script system with per-event text"
```

---

### Task 5.4 — 探索模式增强(图例 + 时间段选择)

**Files**:
- `src/components/layout/LegendPanel.vue`
- `src/components/layout/TimeRangePicker.vue`
- `tests/components/legend.test.ts`

**Step 1 — 写测试** (`tests/components/legend.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LegendPanel from '../../src/components/layout/LegendPanel.vue'

describe('LegendPanel', () => {
  it('renders legend items', () => {
    const wrapper = mount(LegendPanel)
    expect(wrapper.find('[data-test="legend-red"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="legend-blue"]').exists()).toBe(true)
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/components/legend.test.ts
```

**Step 3 — 写实现** (`src/components/layout/LegendPanel.vue`):
```vue
<script setup lang="ts">
import { ref } from 'vue'

const visible = ref({
  red: true,
  blue: true,
  contours: true,
  rivers: true,
  crossings: true
})

defineEmits<{ (e: 'update:visible', v: typeof visible.value): void }>()
</script>

<template>
  <aside class="legend-panel" data-test="legend-panel">
    <h4>图例</h4>
    <label data-test="legend-red"><input type="checkbox" v-model="visible.red" /> 红军</label>
    <label data-test="legend-blue"><input type="checkbox" v-model="visible.blue" /> 敌军</label>
    <label><input type="checkbox" v-model="visible.contours" /> 等高线</label>
    <label><input type="checkbox" v-model="visible.rivers" /> 水系</label>
    <label><input type="checkbox" v-model="visible.crossings" /> 渡口</label>
  </aside>
</template>

<style scoped lang="scss">
@import '../../assets/styles/variables';

.legend-panel {
  background: $bg-paper;
  border: 1px solid $ink-primary;
  padding: $gap-sm $gap-md;
  font-family: $font-body;
  font-size: 0.9em;

  h4 {
    margin: 0 0 $gap-xs;
    font-family: $font-display;
    font-size: 1em;
  }
  label {
    display: block;
    margin: 2px 0;
    cursor: pointer;
  }
}
</style>
```

(`src/components/layout/TimeRangePicker.vue`):
```vue
<script setup lang="ts">
const props = defineProps<{ start: string; end: string }>()
const emit = defineEmits<{ (e: 'update:range', r: { start: string; end: string }): void }>()

function onStart(ev: Event) {
  emit('update:range', { start: (ev.target as HTMLInputElement).value, end: props.end })
}
function onEnd(ev: Event) {
  emit('update:range', { start: props.start, end: (ev.target as HTMLInputElement).value })
}
</script>

<template>
  <div class="range-picker">
    <label>起 <input type="date" :value="start" @change="onStart" /></label>
    <label>止 <input type="date" :value="end" @change="onEnd" /></label>
  </div>
</template>

<style scoped lang="scss">
@import '../../assets/styles/variables';

.range-picker {
  display: flex;
  gap: $gap-sm;
  font-family: $font-body;

  label { display: flex; align-items: center; gap: $gap-xs; }
  input {
    font-family: $font-data;
    border: 1px solid $ink-primary;
    padding: 2px 4px;
    background: $bg-paper;
  }
}
</style>
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/components/legend.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/components/layout/LegendPanel.vue src/components/layout/TimeRangePicker.vue tests/components/legend.test.ts
git commit -m "feat(explore): add legend panel and time range picker"
```

---

### Task 5.5 — 会议专题页

**Files**:
- `src/views/MeetingView.vue`(完整版)
- `tests/views/meeting.test.ts`

**Step 1 — 写测试** (`tests/views/meeting.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import MeetingView from '../../src/views/MeetingView.vue'

describe('MeetingView', () => {
  it('renders meeting detail', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/meeting/:meetingId', component: MeetingView, props: true }]
    })
    router.push('/meeting/meeting-zunyi')
    await router.isReady()
    const wrapper = mount(MeetingView, {
      props: { meetingId: 'meeting-zunyi' },
      global: { plugins: [router] }
    })
    expect(wrapper.text()).toContain('遵义')
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/views/meeting.test.ts
```

**Step 3 — 写实现** (`src/views/MeetingView.vue`):
```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import meetingsData from '../../public/data/meetings.json'

const props = defineProps<{ meetingId: string }>()
const router = useRouter()

const meeting = computed(() =>
  (meetingsData as any).meetings.find((m: any) => m.id === props.meetingId)
)
</script>

<template>
  <main class="meeting-view" v-if="meeting">
    <button class="back" @click="router.back()">← 返回</button>
    <article class="meeting-doc">
      <header>
        <h1>{{ meeting.title }}</h1>
        <p class="meta">{{ meeting.date }} · {{ meeting.location }}</p>
      </header>
      <section>
        <h2>背景</h2>
        <p>{{ meeting.background }}</p>
      </section>
      <section>
        <h2>主要决议</h2>
        <ol>
          <li v-for="(r, i) in meeting.resolutions" :key="i">{{ r }}</li>
        </ol>
      </section>
      <section>
        <h2>出席人物</h2>
        <p>{{ meeting.participants.join('、') }}</p>
      </section>
      <footer>
        <h3>资料来源</h3>
        <ul>
          <li v-for="(s, i) in meeting.sources" :key="i">{{ s }}</li>
        </ul>
      </footer>
    </article>
  </main>
  <main v-else><p>会议不存在</p></main>
</template>

<style scoped lang="scss">
@import '../assets/styles/variables';

.meeting-view {
  min-height: 100vh;
  padding: $gap-xl;
  background: $bg-paper;
  background-image: repeating-linear-gradient(0deg, transparent 0px, transparent 39px, rgba(0,0,0,0.03) 40px);

  .back {
    margin-bottom: $gap-md;
    padding: $gap-xs $gap-md;
    background: transparent;
    border: 1px solid $ink-primary;
    cursor: pointer;
    font-family: $font-body;
  }

  .meeting-doc {
    max-width: 800px;
    margin: 0 auto;
    background: rgba(242, 232, 208, 0.7);
    border: 3px double $ink-primary;
    padding: $gap-xl;

    header h1 {
      font-family: $font-display;
      font-size: 2.5rem;
      margin: 0 0 $gap-sm;
      color: $vermilion;
      border-bottom: 2px solid $ink-primary;
      padding-bottom: $gap-sm;
    }
    .meta {
      font-family: $font-data;
      color: $ink-secondary;
      font-style: italic;
    }

    h2 {
      font-family: $font-display;
      margin: $gap-lg 0 $gap-sm;
      font-size: 1.4rem;
      color: $ink-primary;
    }
    h3 {
      font-family: $font-display;
      margin: $gap-md 0 $gap-xs;
    }
    p { line-height: 1.8; font-family: $font-body; }
    ol { padding-left: $gap-lg; line-height: 1.8; }

    footer {
      margin-top: $gap-lg;
      padding-top: $gap-md;
      border-top: 1px dashed $ink-secondary;
      ul { padding-left: $gap-md; color: $ink-secondary; font-size: 0.9em; }
    }
  }
}
</style>
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/views/meeting.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/views/MeetingView.vue tests/views/meeting.test.ts
git commit -m "feat(meeting): full meeting detail page with parchment styling"
```

---

### Task 5.6 — 章节书签

**Files**:
- `src/composables/useChapters.ts`
- `src/components/timeline/ChapterBookmark.vue`
- `tests/composables/chapters.test.ts`

**Step 1 — 写测试** (`tests/composables/chapters.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { useChapters } from '../../src/composables/useChapters'

describe('useChapters', () => {
  it('returns chapters for phase', () => {
    const chapters = useChapters('first-crossing')
    expect(chapters.list.length).toBeGreaterThanOrEqual(2)
    expect(chapters.list[0]).toHaveProperty('title')
    expect(chapters.list[0]).toHaveProperty('timestamp')
  })

  it('currentChapter finds active chapter', () => {
    const chapters = useChapters('first-crossing')
    const c = chapters.currentAt('1935-01-25T08:00:00+08:00')
    expect(c).toBeDefined()
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/composables/chapters.test.ts
```

**Step 3 — 写实现** (`src/composables/useChapters.ts`):
```ts
export interface Chapter {
  id: string
  title: string
  timestamp: string
  quote: string
}

const DATA: Record<string, Chapter[]> = {
  'first-crossing': [
    { id: 'ch-fc-1', title: '序:遵义会议余音', timestamp: '1935-01-19T00:00:00+08:00',
      quote: '毛泽东重掌军事指挥权,中央红军准备北渡长江。' },
    { id: 'ch-fc-2', title: '土城受挫', timestamp: '1935-01-27T00:00:00+08:00',
      quote: '川军增援,敌情严重,毛泽东果断决策:撤。' },
    { id: 'ch-fc-3', title: '一渡赤水', timestamp: '1935-01-29T00:00:00+08:00',
      quote: '三路渡河,首次显示运动战的灵活性。' }
  ],
  'second-crossing': [
    { id: 'ch-sc-1', title: '回师黔北', timestamp: '1935-02-18T00:00:00+08:00',
      quote: '二渡赤水,出敌不意。' },
    { id: 'ch-sc-2', title: '再克遵义', timestamp: '1935-02-28T00:00:00+08:00',
      quote: '娄山关大捷,长征以来最大胜利。' }
  ]
}

export function useChapters(phaseId: string) {
  const list: Chapter[] = DATA[phaseId] ?? []

  function currentAt(isoTime: string): Chapter | undefined {
    const t = new Date(isoTime).getTime()
    let active: Chapter | undefined
    for (const c of list) {
      if (new Date(c.timestamp).getTime() <= t) active = c
    }
    return active
  }

  return { list, currentAt }
}
```

(`src/components/timeline/ChapterBookmark.vue`):
```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useTimeStore } from '../../stores/time'
import { useChapters } from '../../composables/useChapters'

const props = defineProps<{ phaseId: string }>()
const time = useTimeStore()
const chapters = useChapters(props.phaseId)

const active = computed(() => chapters.currentAt(time.currentTime))
</script>

<template>
  <div v-if="active" class="chapter-bookmark" data-test="chapter">
    <h3>{{ active.title }}</h3>
    <p class="quote">{{ active.quote }}</p>
  </div>
</template>

<style scoped lang="scss">
@import '../../assets/styles/variables';

.chapter-bookmark {
  position: absolute;
  top: $gap-md;
  left: 50%;
  transform: translateX(-50%);
  max-width: 600px;
  padding: $gap-md $gap-lg;
  background: rgba(242, 232, 208, 0.95);
  border: 2px solid $vermilion;
  text-align: center;
  font-family: $font-display;
  z-index: 100;

  h3 { margin: 0 0 $gap-xs; color: $vermilion; font-size: 1.2rem; }
  .quote { margin: 0; font-style: italic; color: $ink-secondary; font-size: 0.9em; }
}
</style>
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/composables/chapters.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/composables/useChapters.ts src/components/timeline/ChapterBookmark.vue tests/composables/chapters.test.ts
git commit -m "feat(chapters): add chapter bookmarks for narrative pacing"
```

---

### Task 5.7 — 加载态

**Files**:
- `src/components/common/LoadingState.vue`
- `src/components/common/EmptyState.vue`
- `src/components/common/ErrorState.vue`
- `tests/components/loading.test.ts`

**Step 1 — 写测试** (`tests/components/loading.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingState from '../../src/components/common/LoadingState.vue'
import EmptyState from '../../src/components/common/EmptyState.vue'
import ErrorState from '../../src/components/common/ErrorState.vue'

describe('state components', () => {
  it('LoadingState shows compass', () => {
    const w = mount(LoadingState)
    expect(w.find('[data-test="loading"]').exists()).toBe(true)
  })
  it('EmptyState shows quote', () => {
    const w = mount(EmptyState, { props: { message: '未找到' } })
    expect(w.text()).toContain('未找到')
  })
  it('ErrorState has retry button', () => {
    const w = mount(ErrorState, { props: { message: '失败' } })
    expect(w.find('[data-test="retry"]').exists()).toBe(true)
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/components/loading.test.ts
```

**Step 3 — 写实现** (`src/components/common/LoadingState.vue`):
```vue
<template>
  <div class="loading" data-test="loading">
    <div class="compass">✦</div>
    <p>载入中…</p>
    <div class="progress"><div class="bar"></div></div>
  </div>
</template>

<style scoped lang="scss">
@import '../../assets/styles/variables';

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: $bg-paper;

  .compass {
    font-size: 3rem;
    color: $vermilion;
    animation: spin 2s linear infinite;
  }
  p { font-family: $font-display; color: $ink-secondary; }

  .progress {
    margin-top: $gap-md;
    width: 200px;
    height: 8px;
    background: $ink-secondary;
    overflow: hidden;
  }
  .bar {
    width: 30%;
    height: 100%;
    background: $vermilion;
    animation: slide 1.5s ease-in-out infinite;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}
</style>
```

(`src/components/common/EmptyState.vue`):
```vue
<script setup lang="ts">
defineProps<{ message: string }>()
</script>

<template>
  <div class="empty-state">
    <p class="message">{{ message }}</p>
    <blockquote class="quote">「兵无常势,水无常形」——《孙子兵法》</blockquote>
  </div>
</template>

<style scoped lang="scss">
@import '../../assets/styles/variables';

.empty-state {
  text-align: center;
  padding: $gap-xl;
  color: $ink-secondary;
  font-family: $font-body;

  .message { font-family: $font-display; font-size: 1.2em; color: $ink-primary; }
  .quote { font-style: italic; margin-top: $gap-md; }
}
</style>
```

(`src/components/common/ErrorState.vue`):
```vue
<script setup lang="ts">
defineProps<{ message: string }>()
defineEmits<{ (e: 'retry'): void }>()
</script>

<template>
  <div class="error-state">
    <p class="message">军报中断——{{ message }}</p>
    <button data-test="retry" class="retry" @click="$emit('retry')">重试</button>
  </div>
</template>

<style scoped lang="scss">
@import '../../assets/styles/variables';

.error-state {
  text-align: center;
  padding: $gap-xl;

  .message { font-family: $font-display; color: $vermilion; font-size: 1.2em; }
  .retry {
    margin-top: $gap-md;
    padding: $gap-sm $gap-lg;
    background: $vermilion;
    color: $bg-paper;
    border: none;
    cursor: pointer;
    font-family: $font-display;
  }
}
</style>
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/components/loading.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/components/common/ tests/components/loading.test.ts
git commit -m "feat(states): add loading, empty, error state components"
```

---

### Task 5.8 — 响应式适配

**Files**:
- `src/assets/styles/_responsive.scss`
- `src/assets/styles/main.scss`(更新)
- `tests/styles/responsive.test.ts`

**Step 1 — 写测试** (`tests/styles/responsive.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

describe('responsive styles', () => {
  it('has _responsive.scss', () => {
    const p = resolve(__dirname, '../../src/assets/styles/_responsive.scss')
    expect(existsSync(p)).toBe(true)
  })

  it('defines breakpoints for tablet and mobile', () => {
    const content = readFileSync(resolve(__dirname, '../../src/assets/styles/_responsive.scss'), 'utf-8')
    expect(content).toMatch(/max-width:\s*1280px/)
    expect(content).toMatch(/max-width:\s*768px/)
  })

  it('disables 3D on mobile', () => {
    const content = readFileSync(resolve(__dirname, '../../src/assets/styles/_responsive.scss'), 'utf-8')
    expect(content).toMatch(/3d|terrain|map-3d/i)
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/styles/responsive.test.ts
```

**Step 3 — 写实现** (`src/assets/styles/_responsive.scss`):
```scss
// 平板(768-1280px):侧栏变抽屉
@media (max-width: 1280px) {
  .detail-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 320px;
    height: 100vh;
    transform: translateX(100%);
    transition: transform 300ms ease;
    z-index: 100;

    &.open { transform: translateX(0); }
  }
  .explore-sidebar {
    width: 240px;
  }
}

// 移动端(<768px):3D 降级为静态截图,2D 为主
@media (max-width: 768px) {
  .map-3d {
    display: none !important;
  }
  .map-3d-fallback {
    display: block;
  }
  .explore-sidebar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 50vh;
    transform: translateY(100%);
    z-index: 100;
    &.open { transform: translateY(0); }
  }
  .timeline-svg {
    height: 40px;
  }
  .landing .hero h1 {
    font-size: 3rem;
  }
}
```

更新 `src/assets/styles/main.scss`:
```scss
@import './variables';
@import './typography';
@import './responsive';

:root {
  --bg-paper: #{$bg-paper};
  --vermilion: #{$vermilion};
  --steel-blue: #{$steel-blue};
}

* { box-sizing: border-box; }
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/styles/responsive.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/assets/styles/_responsive.scss src/assets/styles/main.scss tests/styles/responsive.test.ts
git commit -m "feat(responsive): add tablet/mobile breakpoints, 3D disable on mobile"
```

---

## Phase 6 — 测试 + 部署(W11-W12, 6 任务)

### Task 6.1 — 单元测试完善(Vitest)

**Files**:
- `src/utils/time.ts`
- `src/utils/geo.ts`
- `tests/utils/time.test.ts`
- `tests/utils/geo.test.ts`

**Step 1 — 写测试** (`tests/utils/time.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { formatTimestamp, parseTimestamp, addHours } from '../../src/utils/time'

describe('time utils', () => {
  it('formatTimestamp returns YYYY-MM-DD HH:mm', () => {
    expect(formatTimestamp('1935-01-22T08:30:00+08:00')).toBe('1935-01-22 08:30')
  })

  it('parseTimestamp handles +08:00 offset', () => {
    const d = parseTimestamp('1935-01-22T08:00:00+08:00')
    expect(d.getFullYear()).toBe(1935)
  })

  it('addHours returns ISO +08:00', () => {
    const result = addHours('1935-01-22T08:00:00+08:00', 5)
    expect(result).toBe('1935-01-22T13:00:00+08:00')
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/utils/time.test.ts
```

**Step 3 — 写实现** (`src/utils/time.ts`):
```ts
export function formatTimestamp(iso: string): string {
  return iso.replace('T', ' ').replace(/:\d{2}\+\d{2}:\d{2}$/, '')
}

export function parseTimestamp(iso: string): Date {
  return new Date(iso)
}

export function addHours(iso: string, hours: number): string {
  const d = new Date(iso)
  d.setHours(d.getHours() + hours)
  return d.toISOString().replace('Z', '+08:00')
}
```

(`src/utils/geo.ts`):
```ts
export function lngLatToXY(lng: number, lat: number, centerLng = 105.5, centerLat = 28): { x: number; y: number } {
  return { x: (lng - centerLng) * 1000, y: (lat - centerLat) * 1000 }
}

export function distanceKm(a: [number, number], b: [number, number]): number {
  const [lng1, lat1] = a
  const [lng2, lat2] = b
  const R = 6371
  const toRad = (d: number) => d * Math.PI / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const x = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}
```

(`tests/utils/geo.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { lngLatToXY, distanceKm } from '../../src/utils/geo'

describe('geo utils', () => {
  it('lngLatToXY produces scaled meters', () => {
    const r = lngLatToXY(106, 28.5, 105, 28)
    expect(r.x).toBe(1000)
    expect(r.y).toBe(500)
  })

  it('distanceKm between same point is 0', () => {
    expect(distanceKm([105, 28], [105, 28])).toBe(0)
  })

  it('distanceKm between different points is positive', () => {
    expect(distanceKm([105, 28], [106, 29])).toBeGreaterThan(100)
  })
})
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/utils/
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add src/utils/ tests/utils/
git commit -m "feat(utils): add time and geo utilities with full test coverage"
```

---

### Task 6.2 — E2E 测试(Playwright)

**Files**:
- `playwright.config.ts`
- `tests/e2e/navigation.spec.ts`
- `tests/e2e/timeline.spec.ts`
- `tests/e2e/select-force.spec.ts`

**Step 1 — 写测试** (`tests/e2e/navigation.spec.ts`):
```ts
import { test, expect } from '@playwright/test'

test('landing → phase select → narrative flow', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('四渡赤水')
  await page.click('[data-test="enter-btn"]')
  await expect(page).toHaveURL('/phases')
  await page.click('[data-test="phase-card"]')
  await expect(page).toHaveURL(/\/narrative\//)
})
```

(`tests/e2e/timeline.spec.ts`):
```ts
import { test, expect } from '@playwright/test'

test('clicking timeline updates time', async ({ page }) => {
  await page.goto('/narrative/first-crossing')
  await page.click('[data-test="track"]', { position: { x: 500, y: 10 } })
  await page.waitForTimeout(100)
  const cursor = page.locator('[data-test="cursor"]')
  await expect(cursor).toBeVisible()
})
```

(`tests/e2e/select-force.spec.ts`):
```ts
import { test, expect } from '@playwright/test'

test('clicking force marker opens detail panel', async ({ page }) => {
  await page.goto('/narrative/first-crossing')
  await page.waitForSelector('[data-test="marker"]')
  await page.click('[data-test="marker"]')
  await expect(page.locator('[data-test="force-detail"]')).toBeVisible()
})
```

(`playwright.config.ts`):
```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true
  }
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx playwright install chromium
```

**Step 3 — 写实现**:

E2E 测试本身即是实现。无需额外代码。

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npm run dev &
sleep 5
npm run test:e2e
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add playwright.config.ts tests/e2e/
git commit -m "test(e2e): add Playwright E2E tests for navigation/timeline/selection"
```

---

### Task 6.3 — Lighthouse 性能审计

**Files**:
- `lighthouse.config.js`
- `docs/lighthouse-report.md`(生成)

**Step 1 — 写测试** (`tests/perf/lighthouse.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

describe('lighthouse setup', () => {
  it('has lighthouse config', () => {
    const p = resolve(__dirname, '../../lighthouse.config.js')
    expect(existsSync(p)).toBe(true)
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/perf/lighthouse.test.ts
```

**Step 3 — 写实现** (`lighthouse.config.js`):
```js
module.exports = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'desktop',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1
    }
  }
}
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npm install -D lighthouse
npm run build
npx serve dist &
sleep 3
npx lighthouse http://localhost:3000 --config-path=lighthouse.config.js --output=html --output-path=./docs/lighthouse-report.html
npx vitest run tests/perf/lighthouse.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add lighthouse.config.js docs/lighthouse-report.html
git commit -m "perf: add Lighthouse config and initial report"
```

---

### Task 6.4 — Vercel 部署配置

**Files**:
- `vercel.json`
- `.vercelignore`
- `src/utils/env.ts`(运行时 env 校验)

**Step 1 — 写测试** (`tests/deploy/vercel.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

describe('vercel config', () => {
  it('has vercel.json', () => {
    expect(existsSync(resolve(__dirname, '../../vercel.json'))).toBe(true)
  })
  it('has .vercelignore', () => {
    expect(existsSync(resolve(__dirname, '../../.vercelignore'))).toBe(true)
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/deploy/vercel.test.ts
```

**Step 3 — 写实现** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/data/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=86400" }
      ]
    },
    {
      "source": "/fonts/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

(`.vercelignore`):
```
node_modules
.git
tests
scripts/data-extract/raw
.vite
coverage
playwright-report
.env
.env.local
```

(`src/utils/env.ts`):
```ts
export function assertEnv(): void {
  const required = ['VITE_MAPBOX_TOKEN']
  const missing = required.filter(k => !import.meta.env[k])
  if (missing.length > 0) {
    console.warn(`[env] missing: ${missing.join(', ')}`)
  }
}
```

在 `src/main.ts` 中调用:
```ts
import { assertEnv } from './utils/env'
assertEnv()
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/deploy/vercel.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add vercel.json .vercelignore src/utils/env.ts src/main.ts tests/deploy/
git commit -m "deploy: add Vercel configuration with caching headers"
```

---

### Task 6.5 — README 文档

**Files**:
- `README.md`

**Step 1 — 写测试** (`tests/docs/readme.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('README', () => {
  const p = resolve(__dirname, '../../README.md')
  it('exists', () => expect(existsSync(p)).toBe(true))
  it('has install instructions', () => {
    const c = readFileSync(p, 'utf-8')
    expect(c).toMatch(/npm install/)
  })
  it('has dev command', () => {
    const c = readFileSync(p, 'utf-8')
    expect(c).toMatch(/npm run dev/)
  })
  it('mentions Mapbox token', () => {
    const c = readFileSync(p, 'utf-8')
    expect(c).toMatch(/MAPBOX_TOKEN/)
  })
  it('links to design doc', () => {
    const c = readFileSync(p, 'utf-8')
    expect(c).toMatch(/brainstorm-docs/)
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/docs/readme.test.ts
```

**Step 3 — 写实现** (`README.md`):
```markdown
# 四渡赤水·全景沙盘

> 为军史爱好者构建的可推演、可考据、可沉浸的四渡赤水战役可视化平台

![Vue 3](https://img.shields.io/badge/Vue-3.4-42b883) ![TypeScript](https://img.shields.io/badge/TS-5-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## 简介

三视图(2D 地图 + 3D 沙盘 + 时间轴)联动还原 1935 年 1-5 月中央红军四渡赤水、巧渡金沙江的完整历程。

- **空间感**:Mapbox 矢量地图精确还原赤水河流域山川河流、地名、渡口
- **地形感**:Three.js DEM 高程呈现,理解"为什么走这条路"
- **时间感**:时间轴可拖动、可播放,看 110 天每天部队在哪里
- **考据感**:每个数据点附原始史料来源,可点击展开

## 设计文档

`C:\Users\lengm\.claude\brainstorm-docs\projects\2026-06-27-four-crossings-website-design.md`

## 技术栈

- Vue 3 + Vite + TypeScript
- Pinia (状态) + Vue Router
- Mapbox GL JS (2D)
- Three.js (3D DEM)
- GSAP (动效)
- zod (数据校验)
- Vitest (单元) + Playwright (E2E)

## 快速开始

### 前置

- Node.js 18+
- Mapbox 账号(免费即可)— https://account.mapbox.com/

### 安装

```bash
npm install
cp .env.example .env
# 编辑 .env,填入 VITE_MAPBOX_TOKEN=pk.eyJ1Ijoi...
```

### 开发

```bash
npm run dev
# 访问 http://localhost:5173
```

### 测试

```bash
npm test              # 单元
npm run test:e2e      # E2E
npm run type-check    # 类型
npm run lint          # ESLint
```

### 构建

```bash
npm run build
npm run preview
```

## 项目结构

```
src/
  stores/         # Pinia: time / scenario / view / selection
  composables/    # useMapbox / useThreeTerrain / useKeyboard / useChapters
  components/
    layout/       # TopBar / ViewSwitcher / ExploreSidebar / LegendPanel
    timeline/     # Timeline / ChapterBookmark
    map2d/        # MapView2D / ForceMarker / TrajectoryLine / EventMarker
    map3d/        # MapView3D / TerrainMesh / Force3DArrow / TrajectoryRibbon
    detail/       # ForceDetail / EventDetail / PersonDetail / MeetingDetail
    common/       # PlayButton / LoadingState / KeyboardHelp
  views/          # Landing / PhaseSelect / Narrative / Explore / Meeting
  data/           # types + zod schema
  utils/          # time / geo / env
  config/         # phases / routes / mapbox

public/
  data/           # 5 个阶段 GeoJSON + meetings.json + persons.json
  styles/         # military-map.json(Mapbox 样式)
  fonts/          # LXGW WenKai + Source Han Serif
  terrain/        # DEM 瓦片
```

## 数据采集

史料考据专业性极高,**所有数据采集由项目发起人手动完成**,subagent 不参与。

工作流见 `scripts/data-extract/README.md`。

## 部署

部署到 Vercel:见 `vercel.json`。
GitHub Actions 自动部署(配置 `.github/workflows/deploy.yml`)。

## 史实严谨

- 每个数据点附 A/B 级史料来源
- ≥1 位独立军史爱好者通读校对
- 争议点双源标注

## License

MIT — 史料本身为公有领域/公开出版物。
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/docs/readme.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add README.md tests/docs/
git commit -m "docs: comprehensive README with quickstart, architecture, deploy"
```

---

### Task 6.6 — 内测反馈与修复

**Files**:
- `docs/beta-feedback.md`
- 修复发现的 bug(根据实际反馈)

**Step 1 — 写测试** (`tests/release/beta.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

describe('beta release', () => {
  it('has beta feedback document', () => {
    const p = resolve(__dirname, '../../docs/beta-feedback.md')
    expect(existsSync(p)).toBe(true)
  })

  it('has changelog', () => {
    const p = resolve(__dirname, '../../CHANGELOG.md')
    expect(existsSync(p)).toBe(true)
  })
})
```

**Step 2 — 跑测试失败**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/release/beta.test.ts
```

**Step 3 — 写实现** (`docs/beta-feedback.md`):
```markdown
# 内测反馈记录

## 内测名单
- [ ] 军史同好 A
- [ ] 军史同好 B
- [ ] UI 设计师 C
- [ ] 普通用户 D

## 反馈渠道
- 微信群:XXX
- GitHub Issues
- 邮箱:feedback@fourcrossings.example

## 反馈汇总
(用户手动填写)

### Bug 列表
| # | 描述 | 严重度 | 状态 |
|---|------|--------|------|
|   |      |        |      |

### 改进建议
| # | 描述 | 优先级 |
|---|------|--------|
|   |      |        |

### 内容校对意见
| # | 数据点 | 原文 | 修改 |
|---|--------|------|------|
|   |        |      |      |
```

(`CHANGELOG.md`):
```markdown
# Changelog

## [0.1.0] - 2026-XX-XX (MVP)

### Added
- 三视图(2D/3D/分屏)+ 时间轴
- 5 个阶段数据(用户采集)
- 古旧军图视觉风格
- 会议专题页(≥5 个)
- 部队/事件/人物详情
- 键盘快捷键
- 响应式(平板/移动)

### Data Sources
- 《长征》(刘统)
- 《红军长征史》(军事科学院)
- 《红军长征在贵州》
- 各地党史办资料
```

**Step 4 — 跑测试通过**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
npx vitest run tests/release/beta.test.ts
```

**Step 5 — 提交**:
```bash
cd "d:/develop/project/Interest/four_crossings/four_crossings_cc"
git add docs/beta-feedback.md CHANGELOG.md tests/release/
git commit -m "docs: add beta feedback template and initial changelog"
```

---

## 附录 A:总任务清单

| Phase | 任务数 | 周次 |
|---|---|---|
| Phase 0 — 项目基础 | 6 | W1 |
| Phase 1 — 数据层 | 11 | W2-W4 |
| Phase 2 — 2D 地图 + 时间轴 | 7 | W5 |
| Phase 3 — 3D 沙盘 | 6 | W6 |
| Phase 4 — 三视图联动 | 6 | W7 |
| Phase 5 — 视觉打磨 | 8 | W10 |
| Phase 6 — 测试 + 部署 | 6 | W11-W12 |
| **合计** | **50** | **12 周** |

---

## 附录 B:TDD 纪律

每个任务都遵循:

1. **写测试** — 先描述期望行为
2. **跑测试失败** — 确认测试能检测问题
3. **写实现** — 让测试通过
4. **跑测试通过** — 确认正确实现
5. **提交** — 原子化 commit

## 附录 C:风险登记

| 风险 | 等级 | 任务 | 缓解 |
|---|---|---|---|
| 数据采集量大 | 🔴 | 1.4-1.10 | 用户手动 + AI 辅助 + 同行评审 |
| DEM 资源过大 | 🟡 | 1.11 | SRTM 30m + LOD |
| Mapbox token | 🟡 | 2.1, 6.4 | .env + Vercel env + .gitignore |
| 史实争议 | 🟡 | 1.4-1.10 | 双源标注 + 字段区间化 |
| 3D 性能 | 🟡 | 3.1-3.6 | 设备检测 + 降级 + 移动端禁用 |

---

**文档结束。下一步:按 Phase 0 开始执行。**
```