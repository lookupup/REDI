export const DIMENSION_IDS = ["P", "E", "R", "I", "O", "D"] as const;

export type DimensionId = (typeof DIMENSION_IDS)[number];

export const dimensions = {
  P: {
    id: "P",
    name: "Presence",
    chineseName: "存在感",
    description: "月经对生活的影响强度",
    maxScore: 12
  },
  E: {
    id: "E",
    name: "Energy",
    chineseName: "能量场",
    description: "经期体力与情绪变化方向",
    maxScore: 12
  },
  R: {
    id: "R",
    name: "Rhythm",
    chineseName: "稳定度",
    description: "周期规律程度",
    maxScore: 9
  },
  I: {
    id: "I",
    name: "Intuition",
    chineseName: "身体直觉",
    description: "对身体信号的感知敏锐度",
    maxScore: 9
  },
  O: {
    id: "O",
    name: "Openness",
    chineseName: "开放度",
    description: "月经话题表达开放程度",
    maxScore: 9
  },
  D: {
    id: "D",
    name: "Documentation",
    chineseName: "记录管理",
    description: "记录、囤货、准备习惯",
    maxScore: 9
  }
} as const;

export const dimensionMaxScores = Object.fromEntries(
  DIMENSION_IDS.map((id) => [id, dimensions[id].maxScore])
) as Record<DimensionId, number>;
