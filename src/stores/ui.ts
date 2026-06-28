/**
 * UiStore - UI overlay state (filter panel, side sheet, topbar menu, etc.)
 *
 * Mobile-first: most overlays default closed and are toggled by buttons.
 * Desktop users typically leave them open; mobile users toggle on demand.
 */
import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', () => {
  // 筛选目录抽屉(Explore 模式移动端)
  const filterOpen = ref<boolean>(false);
  function openFilter(): void { filterOpen.value = true; }
  function closeFilter(): void { filterOpen.value = false; }
  function toggleFilter(): void { filterOpen.value = !filterOpen.value; }

  // 详情侧滑面板(Narrative 模式移动端)
  const sideOpen = ref<boolean>(false);
  function openSide(): void { sideOpen.value = true; }
  function closeSide(): void { sideOpen.value = false; }
  function toggleSide(): void { sideOpen.value = !sideOpen.value; }

  // 顶栏汉堡菜单(全局移动端导航)
  const menuOpen = ref<boolean>(false);
  function openMenu(): void { menuOpen.value = true; }
  function closeMenu(): void { menuOpen.value = false; }
  function toggleMenu(): void { menuOpen.value = !menuOpen.value; }

  return {
    filterOpen, openFilter, closeFilter, toggleFilter,
    sideOpen, openSide, closeSide, toggleSide,
    menuOpen, openMenu, closeMenu, toggleMenu,
  };
});
