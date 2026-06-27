# 四渡赤水·全景沙盘 (Four Crossings of the Red Army)

四渡赤水战役可视化平台 -- 为军史爱好者构建的可推演、可考据、可沉浸的战役沙盘。本项目以 1935 年中央红军四渡赤水战役为核心，通过 2D MapLibre 地图与 3D Three.js 地形沙盘的双视图联动，提供叙事模式（时间轴驱动的事件回顾）与探索模式（自由浏览兵力部署、会议决策与人物关系），辅以键盘快捷键控制播放与视角切换，使这场经典战役在数字空间中可感、可读、可交互。

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. MapLibre GL 无需 token，使用免费 OpenStreetMap 瓦片

# 3. 安装字体（详见下方"字体说明"）
# 将字体文件放入 public/fonts/

# 4. 启动开发服务器
npm run dev
```

### 字体说明

本项目使用自托管字体以保持离线可用性和一致的视觉风格：

**霞鹜文楷 (LXGW WenKai)**
- 下载地址：https://github.com/lxgw/LxgwWenkaiTC/releases
- 下载 `LXGWWenKaiTC-Regular.ttf` 放入 `public/fonts/`

**思源宋体 (Source Han Serif)**
- 下载地址：https://github.com/adobe-fonts/source-han-serif/releases
- 下载 `SourceHanSerifSC-Regular.otf` 放入 `public/fonts/`

> 字体文件较大（合计约 150MB+），未纳入版本管理。部署前请确保字体文件已就位。

### MapLibre GL + OpenStreetMap 瓦片

本项目已迁移至 [MapLibre GL JS](https://maplibre.org/)（Mapbox GL JS 的免费开源替代品），使用 [OpenStreetMap](https://www.openstreetmap.org/) 免费光栅瓦片。无需注册、无需 token，真正做到零成本部署。

## 技术栈

| 层级 | 技术 |
|------|------|
| **框架** | Vue 3 (Composition API) + TypeScript |
| **构建** | Vite 8 |
| **状态管理** | Pinia 3 |
| **路由** | Vue Router 4 |
| **样式** | SCSS (Sass) + CSS Custom Properties |
| **动画** | GSAP 3 |
| **数据验证** | Zod 4 |
| **2D 地图** | MapLibre GL JS 5 |
| **3D 沙盘** | Three.js + GeoTIFF (DEM 地形) |
| **单元测试** | Vitest 4 + jsdom |
| **E2E 测试** | Playwright |
| **性能审计** | Lighthouse CI |
| **类型检查** | vue-tsc |
| **部署** | Vercel (静态站点) |

## 目录结构

```
four_crossings_cc/
├── public/
│   ├── data/              # 战役数据 (GeoJSON, JSON, TIFF)
│   └── fonts/             # 自托管字体 (需手动下载)
├── src/
│   ├── assets/            # 静态资源 (图标、纹理等)
│   ├── components/        # 可复用 Vue 组件
│   │   ├── map/           # 2D MapLibre 相关组件
│   │   ├── map3d/         # 3D Three.js 相关组件
│   │   ├── narrative/     # 叙事模式组件
│   │   ├── explore/       # 探索模式组件
│   │   └── timeline/      # 时间轴组件
│   ├── composables/       # 组合式函数 (useThreeSetup, useViewSync 等)
│   ├── config/            # 应用配置常量
│   ├── data/              # 静态数据与类型定义
│   ├── router/            # Vue Router 路由配置
│   ├── stores/            # Pinia 状态管理
│   ├── utils/             # 工具函数
│   └── views/             # 页面级组件
├── tests/
│   ├── e2e/               # Playwright E2E 测试
│   └── unit/              # Vitest 单元测试
├── .env.example           # 环境变量模板
├── vercel.json            # Vercel 部署配置
├── lighthouserc.json      # Lighthouse CI 配置
├── playwright.config.ts   # Playwright 配置
├── vitest.config.ts       # Vitest 配置
├── vite.config.ts         # Vite 构建配置
└── README.md
```

## 设计文档

本项目设计文档统一存储在 Claude Code 头脑风暴目录中：

[C:\Users\lengm\.claude\brainstorm-docs\projects\2026-06-27-four-crossings-website-design.md](C:\Users\lengm\.claude\brainstorm-docs\projects\2026-06-27-four-crossings-website-design.md)

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run preview` | 预览生产构建 |
| `npx vitest run` | 运行所有单元测试 (235+) |
| `npm run test:coverage` | 运行测试并生成覆盖率报告 |
| `npx playwright test` | 运行 E2E 测试 |

## 部署

### Vercel

本项目配置了 `vercel.json`，支持一键部署：

1. 将项目推送到 GitHub/GitLab
2. 在 [Vercel](https://vercel.com/) 中导入项目
3. 部署完成后，将字体文件通过 Vercel CLI 或手动上传至 `public/fonts/`

构建输出目录为 `dist/`，框架类型为 Vite，已配置 SPA 路由回退。

### 静态部署

```bash
npm run build
# 将 dist/ 目录部署到任意静态文件服务器
```

## 数据采集说明

本项目涉及的部分数据文件因体积原因不在代码仓库中，需手动准备：

### DEM 地形数据
- 从 NASA SRTM 或 JAXA ALOS 获取贵州/四川/云南地区的 GeoTIFF 高程数据
- 放入 `public/data/` 目录
- 数据加载逻辑在 `src/composables/useTerrainMesh.ts` 中

### 战役轨迹与点位数据
- `public/data/` 中的徒步/机动轨迹、渡口、关键事件点位 (GeoJSON 格式)
- 已内置基础数据，可自行增补

## 致谢

- **史料来源**：《中国工农红军第一方面军长征史》《四渡赤水战役亲历记》等军史文献
- **地图底图**：MapLibre GL JS + OpenStreetMap
- **地形数据**：NASA SRTM / JAXA ALOS
- **中文字体**：霞鹜文楷 (LXGW WenKai)、思源宋体 (Source Han Serif)
- **军史研究**：中国人民解放军军事科学院
