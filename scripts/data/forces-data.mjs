/**
 * forces-data.mjs  部队档案 + 5 阶段时序位置数据
 *
 * waypoint 字段: { ts, lng, lat, status, dest }
 */
export const SZ = "+08:00"

export const FORCE_DEFS = {
  "red-1st-army":  { name: "红一军团",        side: "red",  level: "army",     commander: "林彪",   strength: 18000, color: "#C0392B" },
  "red-3rd-army":  { name: "红三军团",        side: "red",  level: "army",     commander: "彭德怀", strength: 14000, color: "#D06155" },
  "red-5th-army":  { name: "红五军团",        side: "red",  level: "army",     commander: "董振堂", strength: 9000,  color: "#B03A2E" },
  "red-9th-army":  { name: "红九军团",        side: "red",  level: "army",     commander: "罗炳辉", strength: 7000,  color: "#A93226" },
  "blue-chuan-army":      { name: "川军郭勋祺部",     side: "blue", level: "army",     commander: "郭勋祺", strength: 12000, color: "#2E86C1" },
  "blue-chuan-army-b":    { name: "川军郭勋祺部(旅)",  side: "blue", level: "division", commander: "廖泽",  strength: 6000,  color: "#2E86C1", parent_id: "blue-chuan-army" },
  "blue-guizhou":         { name: "黔军王家烈部",     side: "blue", level: "army",     commander: "王家烈", strength: 14000, color: "#2C5F7C" },
  "blue-sichuan":         { name: "川军模范师(独立)",  side: "blue", level: "division", commander: "范绍增", strength: 8000,  color: "#2C5F7C", parent_id: "blue-chuan-army" },
  "blue-center-xueyue":   { name: "中央军薛岳部",     side: "blue", level: "army",     commander: "薛岳",   strength: 30000, color: "#1F618D" },
  "blue-yunnan-sundu":    { name: "滇军孙渡部",       side: "blue", level: "army",     commander: "孙渡",   strength: 15000, color: "#2980B9" },
  "blue-sichuan-liuxiang":{ name: "川军刘湘主力",     side: "blue", level: "army",     commander: "刘湘(遥控)", strength: 25000, color: "#3498DB" },
  "blue-zhouhunyuan":     { name: "中央军周浑元部",   side: "blue", level: "army",     commander: "周浑元", strength: 18000, color: "#5DADE2" },
  "blue-wuqiwei":         { name: "中央军吴奇伟部",   side: "blue", level: "army",     commander: "吴奇伟", strength: 20000, color: "#2874A6" },
}

export const PHASES = [
  { id: "first-crossing",   start: "1935-01-19", end: "1935-02-09" },
  { id: "second-crossing",  start: "1935-02-10", end: "1935-03-01" },
  { id: "third-crossing",   start: "1935-03-02", end: "1935-03-17" },
  { id: "fourth-crossing",  start: "1935-03-18", end: "1935-04-07" },
  { id: "jinsha-river",     start: "1935-04-08", end: "1935-05-09" },
]

// 关键地名坐标 [lng, lat]
export const P = {
  zunyi:       [106.92, 27.72],
  tucheng:     [105.97, 28.04],
  xishui:      [106.25, 28.25],
  chishui_x:   [105.70, 28.30],
  chishui_e:   [105.95, 28.10],
  gulin:       [105.81, 28.05],
  xuyong:      [105.45, 28.18],
  zhaxi:       [105.05, 27.85],
  taiping:     [105.75, 27.85],
  erlangtan:   [105.95, 27.90],
  loushan:     [106.85, 28.05],
  tongzi:      [106.82, 28.15],
  meitai:      [106.30, 27.85],
  lubanchang:  [106.30, 27.75],
  xifeng:      [106.20, 27.20],
  wujiang_s:   [106.85, 27.00],
  wujiang_n:   [106.85, 27.30],
  gui_yang:    [106.71, 26.58],
  anshun:      [105.95, 26.25],
  qujing:      [103.80, 25.50],
  zhanyi:      [103.82, 25.40],
  kunming:     [102.71, 25.04],
  jiaopingdu:  [102.30, 26.10],
  longjie:     [102.45, 26.25],
  huili:       [102.25, 26.65],
  yuexi:       [102.50, 28.95],
  wuqiong:     [102.50, 27.40],
  qiaojia:     [103.10, 27.00],
  huize:       [103.55, 26.40],
  lufeng:      [102.10, 25.15],
  yuanmou:     [101.85, 25.70],
  changqian:   [106.20, 27.85],
  maotai_s:    [106.32, 27.88],
  zheng_an:    [107.18, 27.32],
  anlong:      [105.61, 25.10],
  songkan:     [106.80, 28.55],
  jiangjinshi: [106.20, 28.75],
  hezhang:     [104.62, 27.13],
  weining:     [104.20, 26.85],
}
