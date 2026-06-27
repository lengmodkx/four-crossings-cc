import type { RouteRecordRaw } from 'vue-router'
import PlaceholderView from '../views/PlaceholderView.vue'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'landing',
    component: PlaceholderView,
    props: { title: '战役扉页' },
  },
  {
    path: '/phase-select',
    name: 'phase-select',
    component: PlaceholderView,
    props: { title: '战役阶段选择' },
  },
  {
    path: '/narrative/:phaseId',
    name: 'narrative',
    component: PlaceholderView,
    props: { title: '叙事模式' },
  },
  {
    path: '/explore/:phaseId',
    name: 'explore',
    component: PlaceholderView,
    props: { title: '探索模式' },
  },
  {
    path: '/meeting/:meetingId',
    name: 'meeting',
    component: PlaceholderView,
    props: { title: '会议专题' },
  },
]
