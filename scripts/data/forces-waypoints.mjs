// forces-waypoints.mjs  一渡赤水阶段时序位置数据
//
// 数据来源: events.json (30 个事件) + 公开史料
// 每支部队至少 2 个不同坐标,避免轨迹退化为单点
export const PHASE_WAYPOINTS = {
  "first-crossing": {
    "red-1st-army": [
      {ts:"1935-01-19T08:00:00+08:00",lng:106.92,lat:27.72,status:"marching",dest:"遵义出发"},
      {ts:"1935-01-22T08:00:00+08:00",lng:106.25,lat:28.25,status:"marching",dest:"习水会师"},
      {ts:"1935-01-24T08:00:00+08:00",lng:105.97,lat:28.04,status:"marching",dest:"向土城推进"},
      {ts:"1935-01-28T08:00:00+08:00",lng:105.97,lat:28.04,status:"engaged",dest:"土城战役"},
      {ts:"1935-01-29T08:00:00+08:00",lng:105.70,lat:28.30,status:"crossing",dest:"一渡赤水"},
      {ts:"1935-01-30T08:00:00+08:00",lng:105.81,lat:28.05,status:"marching",dest:"进入川南"},
      {ts:"1935-02-05T08:00:00+08:00",lng:105.05,lat:27.85,status:"resting",dest:"扎西整编"},
    ],
    "red-3rd-army": [
      {ts:"1935-01-19T08:00:00+08:00",lng:106.92,lat:27.72,status:"marching",dest:"遵义出发"},
      {ts:"1935-01-22T08:00:00+08:00",lng:106.25,lat:28.25,status:"marching",dest:"习水会师"},
      {ts:"1935-01-24T08:00:00+08:00",lng:105.97,lat:28.04,status:"marching",dest:"向土城"},
      {ts:"1935-01-28T08:00:00+08:00",lng:105.97,lat:28.04,status:"engaged",dest:"土城战役主攻"},
      {ts:"1935-01-29T08:00:00+08:00",lng:105.70,lat:28.30,status:"crossing",dest:"一渡赤水"},
      {ts:"1935-01-30T08:00:00+08:00",lng:105.81,lat:28.05,status:"marching",dest:"进入川南"},
      {ts:"1935-02-05T08:00:00+08:00",lng:105.05,lat:27.85,status:"resting",dest:"扎西整编"},
    ],
    "red-5th-army": [
      {ts:"1935-01-19T08:00:00+08:00",lng:106.92,lat:27.72,status:"marching",dest:"遵义出发"},
      {ts:"1935-01-24T08:00:00+08:00",lng:105.97,lat:28.04,status:"marching",dest:"青杠坡对峙"},
      {ts:"1935-01-28T08:00:00+08:00",lng:105.97,lat:28.04,status:"engaged",dest:"土城后卫"},
      {ts:"1935-01-29T08:00:00+08:00",lng:105.70,lat:28.30,status:"crossing",dest:"一渡赤水"},
      {ts:"1935-01-30T08:00:00+08:00",lng:105.81,lat:28.05,status:"marching",dest:"后卫掩护"},
      {ts:"1935-02-02T08:00:00+08:00",lng:105.45,lat:28.18,status:"marching",dest:"后卫入川南"},
      {ts:"1935-02-05T08:00:00+08:00",lng:105.05,lat:27.85,status:"resting",dest:"扎西整编"},
    ],
    "red-9th-army": [
      {ts:"1935-01-19T08:00:00+08:00",lng:106.92,lat:27.72,status:"marching",dest:"遵义出发"},
      {ts:"1935-01-24T08:00:00+08:00",lng:105.97,lat:28.04,status:"marching",dest:"跟进"},
      {ts:"1935-01-29T08:00:00+08:00",lng:105.95,lat:28.10,status:"crossing",dest:"一渡赤水"},
      {ts:"1935-01-30T08:00:00+08:00",lng:105.81,lat:28.05,status:"marching",dest:"侧翼掩护"},
      {ts:"1935-02-02T08:00:00+08:00",lng:105.81,lat:28.05,status:"marching",dest:"掩护"},
      {ts:"1935-02-05T08:00:00+08:00",lng:105.05,lat:27.85,status:"resting",dest:"扎西整编"},
    ],
    "blue-chuan-army": [
      {ts:"1935-01-24T08:00:00+08:00",lng:105.97,lat:28.04,status:"marching",dest:"抢占土城"},
      {ts:"1935-01-28T08:00:00+08:00",lng:105.97,lat:28.04,status:"engaged",dest:"土城战役"},
      {ts:"1935-01-30T08:00:00+08:00",lng:105.70,lat:28.30,status:"marching",dest:"追击"},
      {ts:"1935-02-02T08:00:00+08:00",lng:105.45,lat:28.18,status:"marching",dest:"防守叙永"},
      {ts:"1935-02-06T08:00:00+08:00",lng:105.81,lat:28.05,status:"resting",dest:"整补"},
    ],
    "blue-chuan-army-b": [
      {ts:"1935-01-24T08:00:00+08:00",lng:105.97,lat:28.04,status:"marching",dest:"增援土城"},
      {ts:"1935-01-28T08:00:00+08:00",lng:105.97,lat:28.04,status:"engaged",dest:"土城战役"},
      {ts:"1935-01-30T08:00:00+08:00",lng:105.70,lat:28.30,status:"marching",dest:"追击"},
      {ts:"1935-02-02T08:00:00+08:00",lng:105.81,lat:28.05,status:"marching",dest:"扫荡古蔺"},
      {ts:"1935-02-06T08:00:00+08:00",lng:105.81,lat:28.05,status:"resting",dest:"原地待命"},
    ],
    "blue-guizhou": [
      {ts:"1935-01-22T08:00:00+08:00",lng:106.92,lat:27.72,status:"marching",dest:"回防遵义"},
      {ts:"1935-01-26T08:00:00+08:00",lng:106.92,lat:27.72,status:"resting",dest:"驻防"},
      {ts:"1935-01-30T08:00:00+08:00",lng:105.45,lat:28.18,status:"marching",dest:"南下截击"},
      {ts:"1935-02-02T08:00:00+08:00",lng:105.45,lat:28.18,status:"marching",dest:"防守叙永"},
      {ts:"1935-02-06T08:00:00+08:00",lng:106.92,lat:27.72,status:"resting",dest:"撤回遵义"},
    ],
    "blue-sichuan": [
      {ts:"1935-01-26T08:00:00+08:00",lng:105.81,lat:28.05,status:"marching",dest:"围堵红军"},
      {ts:"1935-01-30T08:00:00+08:00",lng:105.81,lat:28.05,status:"marching",dest:"围堵"},
      {ts:"1935-02-02T08:00:00+08:00",lng:105.45,lat:28.18,status:"marching",dest:"协助防守"},
      {ts:"1935-02-06T08:00:00+08:00",lng:105.45,lat:28.18,status:"resting",dest:"防守叙永"},
    ],
    "blue-center-xueyue": [
      {ts:"1935-01-22T08:00:00+08:00",lng:106.71,lat:26.58,status:"marching",dest:"贵阳待命"},
      {ts:"1935-01-26T08:00:00+08:00",lng:106.71,lat:26.58,status:"marching",dest:"出发"},
      {ts:"1935-01-30T08:00:00+08:00",lng:106.92,lat:27.72,status:"marching",dest:"进占遵义"},
      {ts:"1935-02-02T08:00:00+08:00",lng:106.92,lat:27.72,status:"resting",dest:"驻防"},
      {ts:"1935-02-06T08:00:00+08:00",lng:106.92,lat:27.72,status:"marching",dest:"北进合围"},
    ],
    "blue-yunnan-sundu": [
      {ts:"1935-01-20T08:00:00+08:00",lng:105.45,lat:27.30,status:"marching",dest:"毕节出发"},
      {ts:"1935-01-26T08:00:00+08:00",lng:105.05,lat:27.85,status:"marching",dest:"进至扎西"},
      {ts:"1935-02-02T08:00:00+08:00",lng:105.05,lat:27.85,status:"marching",dest:"围堵扎西"},
      {ts:"1935-02-06T08:00:00+08:00",lng:105.05,lat:27.85,status:"marching",dest:"围堵扎西"},
    ],
    "blue-sichuan-liuxiang": [
      {ts:"1935-01-22T08:00:00+08:00",lng:105.55,lat:28.25,status:"marching",dest:"泸州出发"},
      {ts:"1935-01-26T08:00:00+08:00",lng:105.45,lat:28.18,status:"marching",dest:"进至叙永"},
      {ts:"1935-02-02T08:00:00+08:00",lng:105.45,lat:28.18,status:"resting",dest:"防守叙永"},
      {ts:"1935-02-06T08:00:00+08:00",lng:105.45,lat:28.18,status:"resting",dest:"防守叙永"},
    ],
    "blue-zhouhunyuan": [
      {ts:"1935-01-22T08:00:00+08:00",lng:106.20,lat:27.85,status:"marching",dest:"从常德出发"},
      {ts:"1935-01-26T08:00:00+08:00",lng:105.97,lat:28.04,status:"marching",dest:"进至土城"},
      {ts:"1935-02-02T08:00:00+08:00",lng:105.97,lat:28.04,status:"marching",dest:"追击"},
      {ts:"1935-02-06T08:00:00+08:00",lng:105.97,lat:28.04,status:"resting",dest:"驻防土城"},
    ],
    "blue-wuqiwei": [
      {ts:"1935-01-22T08:00:00+08:00",lng:106.71,lat:26.58,status:"marching",dest:"贵阳整补"},
      {ts:"1935-01-26T08:00:00+08:00",lng:106.71,lat:26.58,status:"resting",dest:"贵阳"},
      {ts:"1935-01-30T08:00:00+08:00",lng:106.71,lat:26.58,status:"marching",dest:"北进"},
      {ts:"1935-02-02T08:00:00+08:00",lng:106.92,lat:27.72,status:"marching",dest:"进占遵义"},
      {ts:"1935-02-06T08:00:00+08:00",lng:106.92,lat:27.72,status:"marching",dest:"北进合围"},
    ],
  },
}