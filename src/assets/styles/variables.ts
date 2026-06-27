// 从 SCSS 色板导出给 TypeScript 使用
// 参考设计文档 §5.1 配色方案

export const COLORS = {
  // 主色板
  bgPaper: '#F2E8D0',
  bgDark: '#3D2F1F',
  textMain: '#1A1410',
  textMuted: '#6B5D4A',
  accentRed: '#C0392B',
  accentBlue: '#2C5F7C',
  highlight: '#D4A017',
  contour: '#6B7F4A',

  // 数据可视化梯度
  redGradientStart: '#F5D5C8',
  redGradientEnd: '#C0392B',
  blueGradientStart: '#C8D8E0',
  blueGradientEnd: '#2C5F7C',

  // 3D 沙盘
  terrainWater: '#5C7A8C',
  terrainMid: '#C9A86A',
  terrainHigh: '#8B6B47',
  terrainSnow: '#E8E0D0',
  fog: 'rgba(242, 232, 208, 0.8)',

  // 红军色阶
  redArmy: ['#F5D5C8', '#E8B4A3', '#DB9380', '#D06155', '#C0392B'] as readonly string[],

  // 敌军色阶
  blueArmy: ['#C8D8E0', '#A8C0CC', '#7BA0B0', '#4A8098', '#2C5F7C'] as readonly string[],
} as const

export const FONTS = {
  title: "'LXGW WenKai', 'STKaiti', 'KaiTi', serif",
  body: "'Source Han Serif SC', 'Noto Serif SC', 'STSong', 'SimSun', serif",
  mono: "'JetBrains Mono', 'Consolas', 'Monaco', monospace",
  english: "'IM Fell English', 'Georgia', serif",
} as const

export type ColorName = keyof typeof COLORS
export type FontName = keyof typeof FONTS
