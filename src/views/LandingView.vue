<script setup lang="ts">
/**
 * LandingView — 首屏扉页
 *
 * 古旧军图风格首屏，展示战役标题与副标题，
 * 点击 [进入战役] 跳转至阶段选择页。
 */
import { useRouter } from 'vue-router'

const router = useRouter()

function enterCampaign(): void {
  router.push('/phase-select')
}
</script>

<template>
  <div class="landing">
    <div class="landing-overlay"></div>
    <div class="landing-content">
      <h1 class="landing-title">四渡赤水·全景沙盘</h1>
      <p class="landing-subtitle">
        1935.1.19—1935.5.9 · 中央红军长征中的四渡赤水
      </p>
      <button class="landing-btn" @click="enterCampaign">
        进入战役
      </button>
    </div>
  </div>
</template>

<style scoped>
.landing {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background:
    radial-gradient(ellipse at center, #3D2F1F 0%, #1A1410 70%);
  overflow: hidden;
}

.landing-overlay {
  position: absolute;
  inset: 0;
  background-image:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(255, 255, 255, 0.015) 2px,
      rgba(255, 255, 255, 0.015) 4px
    );
  pointer-events: none;
}

.landing-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px;
}

.landing-title {
  font-family: var(--font-heading, serif);
  font-size: 52px;
  font-weight: 700;
  color: var(--color-bg-paper, #F2E8D0);
  letter-spacing: 6px;
  margin: 0 0 24px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.landing-subtitle {
  font-family: var(--font-body, serif);
  font-size: 18px;
  color: var(--color-text-muted, #6B5D4A);
  margin: 0 0 48px;
  letter-spacing: 2px;
}

.landing-btn {
  padding: 14px 48px;
  border: 2px solid var(--color-accent-red, #C0392B);
  border-radius: 4px;
  background: transparent;
  color: var(--color-accent-red, #C0392B);
  font-family: var(--font-heading, serif);
  font-size: 18px;
  letter-spacing: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.landing-btn:hover {
  background: var(--color-accent-red, #C0392B);
  color: var(--color-bg-paper, #F2E8D0);
}
</style>
