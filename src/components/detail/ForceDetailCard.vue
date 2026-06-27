<script setup lang="ts">
/**
 * ForceDetailCard — 部队详情卡片
 *
 * Props: force (ForceFeature)
 * 显示: 部队名(h2, 红军红/敌军蓝)、指挥员/兵力/状态/下一站/来源
 * 动态战术解说: 根据部队隶属和属性生成中文战术解说文本
 */
import { computed } from 'vue'
import type { ForceFeature } from '@/data/types'

const props = defineProps<{
  force: ForceFeature
}>()

const emit = defineEmits<{
  close: []
}>()

function handleClose(): void {
  emit('close')
}

// ============================================================
// 动态战术解说
// ============================================================

/** 坐标 → 大致地点的文本描述 (根据实际坐标反查) */
function coordinateToPlaceName(lng: number, lat: number): string {
  if (lng >= 106.8 && lng <= 107.0 && lat >= 27.60 && lat <= 27.75) return '遵义地区'
  if (lng >= 106.5 && lng <= 106.9 && lat >= 27.80 && lat <= 28.00) return '娄山关/板桥地区'
  if (lng >= 106.0 && lng <= 106.5 && lat >= 28.10 && lat <= 28.30) return '习水地区'
  if (lng >= 105.9 && lng <= 106.0 && lat >= 28.00 && lat <= 28.10) return '土城地区'
  if (lng >= 105.6 && lng <= 105.9 && lat >= 28.20 && lat <= 28.40) return '赤水河地区'
  if (lng >= 105.3 && lng <= 105.6 && lat >= 28.30 && lat <= 28.50) return '元厚地区'
  if (lng >= 105.0 && lng <= 105.4 && lat >= 27.50 && lat <= 28.20) return '古蔺/叙永地区'
  if (lng >= 106.7 && lng <= 107.0 && lat >= 26.50 && lat <= 26.70) return '贵阳地区'
  if (lng >= 106.7 && lng <= 106.9 && lat >= 26.80 && lat <= 27.20) return '乌江南岸地区'
  if (lng >= 106.8 && lng <= 107.0 && lat >= 27.20 && lat <= 27.60) return '黔北刀靶水/懒板凳地区'
  if (lng >= 106.9 && lng <= 107.0 && lat >= 27.60 && lat <= 27.75) return '遵义南郊'
  if (lng >= 104.0 && lng <= 105.0 && lat >= 26.00 && lat <= 27.50) return '滇黔边境毕节/威宁地区'
  if (lng >= 105.3 && lng <= 106.0 && lat >= 28.50 && lat <= 29.00) return '川南泸州/纳溪地区'
  if (lng >= 105.4 && lng <= 106.0 && lat >= 28.00 && lat <= 28.50) return '赤水/旺隆/复兴场地区'
  return '贵州/四川交界地区'
}

/** 补充战术背景 (红军) */
function redTacticalContext(force: ForceFeature): string {
  const { name, commander } = force.properties
  if (name === '红一军团') return `林彪所部为红军主力右纵队，装备和素质居各军团之首，承担开路先锋任务。`
  if (name === '红三军团') return `彭德怀所部善打硬仗，惯以迅猛突击撕开敌军防线，土城战役中担任主攻。`
  if (name === '红五军团') return `董振堂部由宁都起义部队改编而来，以阵地战见长，常担任后卫掩护或侧翼牵制任务。`
  if (name === '红九军团') return `罗炳辉部机动灵活，兵力虽少但适合游击牵制，多配合主力侧翼行动。`
  return `${commander}指挥下的部队，承担重要的战斗任务。`
}

/** 威胁评估 (敌军) */
function blueThreatAssessment(force: ForceFeature): string {
  const { name, strength } = force.properties
  if (name.includes('中央军') || name.includes('薛岳')) {
    return `薛岳部为蒋介石嫡系精锐，装备德式轻武器，具备强大追击和野战能力。该部从贵阳向北追击，与川军南北对进，是合围红军的主要力量之一。若红军不能迅速北渡长江，将面临被中央军截断退路的危险。`
  }
  if (name.includes('滇军') || name.includes('孙渡')) {
    return `孙渡部虽属地方军阀，但在黔滇边境设防严密，其意图是阻止红军西进入滇。该部从毕节方向东进，对红军南翼构成封锁威胁，若红军继续向西转移，可能与此部发生接触。`
  }
  if (name.includes('刘湘') || name.includes('川军主力')) {
    return `刘湘主力是川军精锐，包括潘文华、范绍增等部共约10万人，沿长江北岸布防层层设障。该部占据地利，扼守赤水河与长江沿线各要点，是红军北渡长江的最大障碍。正面强攻渡江几无可能。`
  }
  if (name.includes('郭勋祺')) {
    return `郭勋祺部是川军精锐旅，装备和训练优于一般川军，在土城青杠坡战斗中给红军造成重大伤亡。该部占据赤水河沿岸制高点，是红军渡河的直接拦阻力量。`
  }
  if (name.includes('黔军') || name.includes('王家烈')) {
    return `王家烈部为贵州地方部队，兵力有限、装备较差，但熟悉黔北山地地形。该部从贵阳北上尾随红军，与中央军薛岳部协同追击，虽正面威胁有限，但若配合中央军南北夹击仍具相当威胁。`
  }
  return `该部兵力约${(strength / 10000).toFixed(1)}万人，在当前战区构成一定威胁。`
}

/** 状态描述文本 */
function statusText(status: string): string {
  const map: Record<string, string> = {
    marching: '急行军推进',
    engaged: '与敌方交战中',
    resting: '休整待命',
    crossing: '渡河行动中',
  }
  return map[status] || status
}

/** 生成动态战术解说 */
const tacticalCommentary = computed(() => {
  const f = props.force.properties
  const [lng, lat] = props.force.geometry.coordinates
  const place = coordinateToPlaceName(lng, lat)
  const formatStrength = f.strength >= 10000
    ? `${(f.strength / 10000).toFixed(1)}万`
    : f.strength.toLocaleString()

  if (f.side === 'red') {
    return `【${f.name}】当前位于${place}，正向${f.next_destination || '预定目标'}方向行军。兵力约${formatStrength}人，由${f.commander}指挥。${redTacticalContext(props.force)}`
  }

  // blue
  return `⚠ 【${f.name}】敌军，当前位于${place}，正在${statusText(f.status)}。兵力约${formatStrength}人，由${f.commander}指挥。${blueThreatAssessment(props.force)}`
})
</script>

<template>
  <article
    class="force-detail-card"
    :class="{ 'side-red': force.properties.side === 'red', 'side-blue': force.properties.side === 'blue' }"
  >
    <div class="card-header">
      <h2 class="card-title">
        <span class="side-dot" :class="force.properties.side"></span>
        {{ force.properties.name }}
      </h2>
      <button class="close-btn" @click="handleClose" title="关闭">&times;</button>
    </div>

    <dl class="card-details">
      <div class="detail-row">
        <dt>指挥员</dt>
        <dd>{{ force.properties.commander }}</dd>
      </div>
      <div class="detail-row">
        <dt>兵力</dt>
        <dd>{{ force.properties.strength.toLocaleString() }} 人</dd>
      </div>
      <div class="detail-row">
        <dt>状态</dt>
        <dd>{{ force.properties.status }}</dd>
      </div>
      <div v-if="force.properties.next_destination" class="detail-row">
        <dt>下一站</dt>
        <dd>{{ force.properties.next_destination }}</dd>
      </div>
      <div class="detail-row">
        <dt>时间</dt>
        <dd>{{ force.properties.timestamp }}</dd>
      </div>
    </dl>

    <!-- 动态战术解说 -->
    <div class="tactical-commentary" :class="force.properties.side">
      <p>{{ tacticalCommentary }}</p>
    </div>

    <div class="card-source">
      &#x1F4DC; 来源: {{ force.properties.source }}
    </div>
  </article>
</template>

<style scoped>
.force-detail-card {
  padding: 16px;
  border-bottom: 1px solid var(--color-bg-dark, #3D2F1F);
}

.force-detail-card.side-red {
  border-left: 4px solid var(--color-accent-red, #C0392B);
}

.force-detail-card.side-blue {
  border-left: 4px solid var(--color-accent-blue, #2C5F7C);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-title {
  font-family: var(--font-heading, serif);
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.side-red .card-title {
  color: var(--color-accent-red, #C0392B);
}

.side-blue .card-title {
  color: var(--color-accent-blue, #2C5F7C);
}

.side-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.side-dot.red {
  background: var(--color-accent-red, #C0392B);
}

.side-dot.blue {
  background: var(--color-accent-blue, #2C5F7C);
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-muted, #6B5D4A);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--color-accent-red, #C0392B);
}

.card-details {
  margin: 0 0 12px;
  padding: 0;
}

.detail-row {
  display: flex;
  padding: 4px 0;
  border-bottom: 1px dotted var(--color-contour, #6B7F4A);
}

.detail-row dt {
  width: 72px;
  flex-shrink: 0;
  font-size: 12px;
  color: var(--color-text-muted, #6B5D4A);
  padding-top: 1px;
}

.detail-row dd {
  flex: 1;
  margin: 0;
  font-size: 14px;
  color: var(--color-text-main, #1A1410);
}

/* === 动态战术解说 === */
.tactical-commentary {
  margin: 12px 0;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.7;
}

.tactical-commentary.red {
  background: rgba(192, 57, 43, 0.08);
  border-left: 3px solid var(--color-accent-red, #C0392B);
  color: var(--color-text-main, #1A1410);
}

.tactical-commentary.blue {
  background: rgba(44, 95, 124, 0.08);
  border-left: 3px solid var(--color-accent-blue, #2C5F7C);
  color: var(--color-text-main, #1A1410);
}

.tactical-commentary p {
  margin: 0;
}

.card-source {
  font-size: 11px;
  color: var(--color-text-muted, #6B5D4A);
  margin-top: 8px;
}
</style>
