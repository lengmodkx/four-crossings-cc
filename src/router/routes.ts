import type { RouteRecordRaw } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import PhaseSelectView from '../views/PhaseSelectView.vue'
import NarrativeView from '../views/NarrativeView.vue'
import ExploreView from '../views/ExploreView.vue'
import MeetingView from '../views/MeetingView.vue'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'landing',
    component: LandingView,
  },
  {
    path: '/phase-select',
    name: 'phase-select',
    component: PhaseSelectView,
  },
  {
    path: '/narrative/:phaseId',
    name: 'narrative',
    component: NarrativeView,
  },
  {
    path: '/explore/:phaseId',
    name: 'explore',
    component: ExploreView,
  },
  {
    path: '/meeting/:meetingId',
    name: 'meeting',
    component: MeetingView,
  },
]
