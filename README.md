# 四渡赤水·全景沙盘 (Four Crossings of the Red Army)

四渡赤水战役可视化平台 — 为军史爱好者构建的可推演、可考据、可沉浸的战役沙盘。

## 快速开始

```bash
npm install
npm run dev
```

## 技术栈

- **框架**: Vue 3 + TypeScript + Vite
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **样式**: SCSS (Sass)
- **动画**: GSAP
- **数据验证**: Zod
- **2D 地图**: Mapbox GL JS
- **3D 沙盘**: Three.js
- **测试**: Vitest + Playwright

## 字体安装

本项目使用自托管字体,需手动下载后放置在 `public/fonts/` 目录下:

### 霞鹜文楷 (LXGW WenKai)

- 下载地址: <https://github.com/lxgw/LxgwWenkaiTC/releases>
- 下载 `LXGWWenKaiTC-Regular.ttf` 放入 `public/fonts/`

### 思源宋体 (Source Han Serif)

- 下载地址: <https://github.com/adobe-fonts/source-han-serif/releases>
- 下载 `SourceHanSerifSC-Regular.otf` 放入 `public/fonts/`

> 注意:字体文件较大(150MB+),未纳入版本管理。部署前请确保字体文件已就位。

## 设计文档

详见设计文档: `C:\Users\lengm\.claude\brainstorm-docs\projects\2026-06-27-four-crossings-website-design.md`
