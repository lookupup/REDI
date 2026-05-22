import type { BadgeId } from "./badges";
import type { DimensionId } from "./dimensions";

export type QuestionOption = {
  id: string;
  text: string;
  score: number | null;
  dimension: DimensionId | null;
  triggeredBadges: BadgeId[];
};

export type Question = {
  id: string;
  title: string;
  type: "warmup" | "formal" | "hidden";
  dimension: DimensionId | null;
  options: QuestionOption[];
};

const option = (
  id: string,
  text: string,
  score: number | null,
  dimension: DimensionId | null,
  triggeredBadges: BadgeId[] = []
): QuestionOption => ({ id, text, score, dimension, triggeredBadges });

export const q0: Question = {
  id: "Q0",
  title: "在开始之前，请选择最符合你目前状态的描述：",
  type: "warmup",
  dimension: null,
  options: [
    option("A", "我还没来过月经", null, null, ["BLANK"]),
    option("B", "我在来月经", null, null),
    option("C", "我的月经暂时不来（怀孕、哺乳等特殊身体情况）", null, null, ["GAP"]),
    option("D", "我曾经来过月经，现在不来了（处于围绝经期/已绝经/因为其它原因而停止来月经）", null, null, ["GRAD"]),
    option("E", "我不来月经", null, null, ["ALLY"]),
    option("F", "其它情况", null, null, ["FREE"])
  ]
};

export const formalQuestions: Question[] = [
  {
    id: "P1",
    title: "你的月经流量是什么级别？",
    type: "formal",
    dimension: "P",
    options: [
      option("A", "顶流级别：量大到一天换好几次，不换就喜提“爆”热搜", 3, "P"),
      option("B", "常驻卡司：中等流量，正常换就够，偶尔小出圈", 2, "P"),
      option("C", "查无此人：少到自己都搜不到存在感，心想“就这？”", 1, "P"),
      option("D", "退圈人士：几乎没有，怀疑月经已经注销工作室", 0, "P")
    ]
  },
  {
    id: "P2",
    title: "痛经对你来说是什么级别的“身体剧本”？",
    type: "formal",
    dimension: "P",
    options: [
      option("A", "年度大戏：每次必到，止痛药是我的灵魂伴侣，严重时只能和床组队休息", 3, "P"),
      option("B", "日常短剧：不舒服，但靠热水袋和“我很好”的表情包能撑过去", 2, "P"),
      option("C", "花絮片段：偶尔微微痛，热敷一下就像给肚子发了张“休息券”", 1, "P"),
      option("D", "预告都没发：痛经？这部剧我没收到试镜通知", 0, "P")
    ]
  },
  {
    id: "P3",
    title: "你正在开一个很重要的会，突然感觉到“它来了”。此刻你——",
    type: "formal",
    dimension: "P",
    options: [
      option("A", "系统直接崩溃：蓝屏 + 重启中，会议是什么？我先找个厕所重装系统", 3, "P"),
      option("B", "弹出“内存不足”警告：心里咯噔一下，但强行关掉弹窗继续运行", 2, "P"),
      option("C", "收到一条“静默通知”：默默划掉，后台运行，不耽误前台工作", 1, "P"),
      option("D", "已设置“免打扰模式”：它来它的，我开我的会，互不打扰", 0, "P")
    ]
  },
  {
    id: "P4",
    title: "如果你明天有个很重要的安排，发现那天正好是经期高峰——",
    type: "formal",
    dimension: "P",
    options: [
      option("A", "灾难预演：开始写“如何礼貌地取消重要安排”小作文", 3, "P"),
      option("B", "启动防御：热水袋+止痛药+备用裤，三重铠甲穿上", 2, "P"),
      option("C", "佛系备货：多拿两片卫生巾，像多带一包纸巾", 1, "P"),
      option("D", "硬核无视：经期高峰？那是什么？我的日程不等人", 0, "P")
    ]
  },
  {
    id: "E1",
    title: "经期那几天，你的情绪通常是什么“播放模式”？",
    type: "formal",
    dimension: "E",
    options: [
      option("A", "悲情单曲循环：低落、焦虑、想哭，整个人被调成了悲剧频道，且找不到遥控器", 0, "E"),
      option("B", "信号增强模式：比平时敏感，一点小事就像被加了“催泪弹”特效，但还能换台", 1, "E"),
      option("C", "稳定白噪音：和平时差不多，情绪像老式收音机，不调台就不杂音", 2, "E"),
      option("D", "灵感全开模式：有时候反而更清醒、更有感受力，像是情绪天线突然被打开了，收得到更多信号", 3, "E")
    ]
  },
  {
    id: "E2",
    title: "经期那几天，你对出门、运动、社交的态度是什么模式？",
    type: "formal",
    dimension: "E",
    options: [
      option("A", "超级省电模式：全部取消，经期就是我的“免打扰”开关，任何约都是对不起改天吧", 0, "E"),
      option("B", "低电量运行：能推就推，推不掉的去了也是挂着“我不在”的状态", 1, "E"),
      option("C", "均衡模式：照常，可能稍微调低亮度或音量，但不会特意关机", 2, "E"),
      option("D", "性能模式：有时候反而更想出门，感觉体力没掉线，甚至像充了个电", 3, "E")
    ]
  },
  {
    id: "E3",
    title: "经期那几天，你的睡眠和身体疲惫感是什么“充电状态”？",
    type: "formal",
    dimension: "E",
    options: [
      option("A", "充电线坏了：比平时疲惫很多，睡多久都像没充进去", 0, "E"),
      option("B", "慢速充电：容易累，需要比平时多充一会儿才回血", 1, "E"),
      option("C", "正常快充：和平时差不多，该睡睡该醒醒", 2, "E"),
      option("D", "电池满格：睡眠反而不错，精力基本不掉线，像换了块新电池", 3, "E")
    ]
  },
  {
    id: "E4",
    title: "经期你的“美食信号”和“社交信号”是什么？",
    type: "formal",
    dimension: "E",
    options: [
      option("A", "两盏全灭：什么都不想吃，也不想和人类接触", 0, "E"),
      option("B", "只有食欲亮红灯：特别馋某类食物，社交信号灯完全黑着", 1, "E"),
      option("C", "两盏都是黄灯：和平时差不多，不急不躁", 2, "E"),
      option("D", "两盏绿灯：食欲好，社交信号也亮着，欢迎搭话", 3, "E")
    ]
  },
  {
    id: "R1",
    title: "你和月经之间的“默契度”怎么样？",
    type: "formal",
    dimension: "R",
    options: [
      option("A", "随缘模式：它来得不太规律，有时间隔比较长，但我知道这就是我的节奏", 0, "R"),
      option("B", "大致有数：我能猜个大概范围，但误差有时超过一周", 1, "R"),
      option("C", "基本合拍：误差不超过三五天，心里比较有底", 2, "R"),
      option("D", "灵魂同步：非常稳定，我会提前在日历上写好“要来咯”", 3, "R")
    ]
  },
  {
    id: "R2",
    title: "你的月经“营业天数”稳定吗？",
    type: "formal",
    dimension: "R",
    options: [
      option("A", "完全看心情：有时3天就收工，有时拖到7天，像没有剧本的即兴演出", 0, "R"),
      option("B", "偶尔改档期：大概知道多长，但经常有明显波动", 1, "R"),
      option("C", "基本按排班：稳定为主，偶尔多一天或少一天", 2, "R"),
      option("D", "固定工号：非常固定，几乎每次都一样", 3, "R")
    ]
  },
  {
    id: "R3",
    title: "最近半年，你的月经“画风”有没有明显改变？",
    type: "formal",
    dimension: "R",
    options: [
      option("A", "彻底换画风：经量、周期、痛感都和以前不一样了", 0, "R"),
      option("B", "偶尔换滤镜：有些波动，但说不清是规律变了还是偶然", 1, "R"),
      option("C", "基本原画：偶尔小波动", 2, "R"),
      option("D", "稳定输出：几乎没有变化", 3, "R")
    ]
  },
  {
    id: "I1",
    title: "月经要来之前，你的身体会提前“剧透”吗？",
    type: "formal",
    dimension: "I",
    options: [
      option("A", "完全没剧透：每次都是正片突然上线，我才反应过来“啊？开始了？”", 0, "I"),
      option("B", "片尾字幕型：来了之后才想起“对哦，那些症状就是预告片”，但当时没看懂", 1, "I"),
      option("C", "偶尔发预告：有时能感觉到，比如突然想吃甜食、冒痘、腰酸", 2, "I"),
      option("D", "专属预警系统：身体有一套固定信号，我已经能准确翻译成“月经即将抵达”", 3, "I")
    ]
  },
  {
    id: "I2",
    title: "你能分辨“今天情绪差是经期前兆”和“今天就是心情不好”的区别吗？",
    type: "formal",
    dimension: "I",
    options: [
      option("A", "不分彼此：情绪来了就是来了，我才不管它是谁派来的", 0, "I"),
      option("B", "事后回想才能分辨，当下真的说不准", 1, "I"),
      option("C", "当下能模糊感觉到，有时候猜得准", 2, "I"),
      option("D", "基本能分辨，我对自己的身体信号比较敏感", 3, "I")
    ]
  },
  {
    id: "I3",
    title: "在“记录”和“感受”之间，你更相信哪个来判断月经周期？",
    type: "formal",
    dimension: "I",
    options: [
      option("A", "只信体感：记录没什么用，我的身体比任何日历都准", 3, "I"),
      option("B", "两者结合：我会记日期，同时也听身体的信号", 2, "I"),
      option("C", "靠日历提醒：我的记性不靠谱，全靠App告诉我“该来了”", 1, "I"),
      option("D", "完全随缘：我不记也不感觉，它来了我就知道", 0, "I")
    ]
  },
  {
    id: "O1",
    title: "平时你一般怎么称呼“月经”？",
    type: "formal",
    dimension: "O",
    options: [
      option("A", "直呼其名：月经", 3, "O"),
      option("B", "常用暗号：大姨妈、那个、好朋友、例假", 2, "O"),
      option("C", "更隐晦的说法：倒霉了、身上来了、亲戚来了", 1, "O"),
      option("D", "完全不说，用眼神或动作暗示", 0, "O")
    ]
  },
  {
    id: "O2",
    title: "如果有人说“你们老是聊月经，挺尴尬的”，你会——",
    type: "formal",
    dimension: "O",
    options: [
      option("A", "有点认同，确实不是所有场合都适合说", 0, "O"),
      option("B", "不认同，但懒得解释，沉默就好", 1, "O"),
      option("C", "会回一句“这有什么尴尬的”，但不会展开争论", 2, "O"),
      option("D", "直接反驳，月经不是禁忌话题，觉得尴尬才是需要被讨论的问题", 3, "O")
    ]
  },
  {
    id: "O3",
    title: "你觉得月经更像以下哪种存在？",
    type: "formal",
    dimension: "O",
    options: [
      option("A", "每月一次的麻烦事，希望它低调点", 0, "O"),
      option("B", "生活中不得不处理的琐事，像交水电费", 1, "O"),
      option("C", "普通的生理现象，和流汗、呼吸差不多", 2, "O"),
      option("D", "身体自带的健康提示器，甚至有点酷", 3, "O")
    ]
  },
  {
    id: "D1",
    title: "卫生用品快用完时，你通常怎么处理？",
    type: "formal",
    dimension: "D",
    options: [
      option("A", "极限生存挑战：等到山穷水尽再说，临时找朋友借或狂奔去超市", 0, "D"),
      option("B", "事后补票型：用完了才一拍脑袋想起来，然后顺手买一包", 1, "D"),
      option("C", "主动备货型：看到存量告急就自觉补货，绝不让自己陷入危机", 2, "D"),
      option("D", "囤囤鼠模式：家里随时有备货，从不断货，像开了一家小卖部", 3, "D"),
      option("E", "我不会用完！我用的不是一次性产品，是月经杯/月经碟/月经裤等", 3, "D", ["ECO"])
    ]
  },
  {
    id: "D2",
    title: "你会给自己的月经“写日记”吗？（经量、症状、情绪都算）",
    type: "formal",
    dimension: "D",
    options: [
      option("A", "佛系玩家：从来不记，来了就来了，随它去", 0, "D"),
      option("B", "脑内备忘录：偶尔在脑子里留个印象，但没写下来过", 1, "D"),
      option("C", "间歇性勤快：有时候会记一笔，但断断续续不成系统", 2, "D"),
      option("D", "数据小能手：有完整的记录习惯，能从记录里看出自己的身体规律", 3, "D")
    ]
  },
  {
    id: "D3",
    title: "关于经期用品，你大概了解到什么程度？",
    type: "formal",
    dimension: "D",
    options: [
      option("A", "够用就好派：我只用我一直用的那种，其他的没研究过", 0, "D"),
      option("B", "普通玩家：知道有不同选择这回事，但没认真研究过", 1, "D"),
      option("C", "进阶玩家：研究过不同产品的优缺点，会根据状态换着用", 2, "D"),
      option("D", "满级攻略博主：对市面上的选择如数家珍，还会主动给朋友安利或避雷", 3, "D")
    ]
  }
];

export const hiddenQuestions: Question[] = [
  {
    id: "H1",
    title: "关于经期用品，你的状态更接近以下哪一种？",
    type: "hidden",
    dimension: null,
    options: [
      option("A", "我基本可以按自己的舒适度和习惯来选择用品", null, null),
      option("B", "会比较价格，但不到影响使用的程度", null, null),
      option("C", "我偶尔会因为出门、忘记携带等情况临时调整使用方式", null, null),
      option("D", "我会因为价格、获取不便等现实原因，不得不减少更换频率或做取舍", null, null, ["RESILIENT"])
    ]
  },
  {
    id: "H2",
    title: "关于月经，你有没有特殊情况？（如果你同时有以下几个情况，请选择最让你困扰的一项）",
    type: "hidden",
    dimension: null,
    options: [
      option("A", "没有，和大多数人差不多", null, null),
      option("B", "我有慢性病或特殊健康情况，会影响我的经期体验或管理方式", null, null, ["VOYAGER"]),
      option("C", "我是一名身障者，经期管理比一般人更复杂", null, null, ["HARD"]),
      option("D", "月经让我在心理或情绪上承受了额外的负担或压力", null, null, ["DIVER"])
    ]
  },
  {
    id: "H3",
    title: "目前你最常使用的经期用品是？",
    type: "hidden",
    dimension: null,
    options: [
      option("A", "一次性卫生巾，使用方便", null, null),
      option("B", "卫生棉条，舒适度高", null, null),
      option("C", "月经杯 / 月经碟等可重复使用用品", null, null, ["ECO"]),
      option("D", "我所在的地方买不到太多种类，或者价格太高，只能有什么用什么，有时候甚至用卫生纸或布条代替", null, null, ["RESILIENT"])
    ]
  },
  {
    id: "H4",
    title: "除了照顾好自己的月经，你还为月经友好做过哪些很酷的事？（如果你同时参与过以下多个月经友好行动，请选择近期你刚做的一件事情）",
    type: "hidden",
    dimension: null,
    options: [
      option("A", "我在公司/学校/社区设置了免费卫生用品互助盒，应急取用、取一还一，为突发月经期的女性提供应急物资支持", null, null, ["ACTION"]),
      option("B", "我在网上或现实里为月经假、公共卫生间是否配备经期产品、月经税减免等摇旗呐喊过", null, null, ["ACTION"]),
      option("C", "我关注或参与过帮助偏远地区女孩获取卫生用品的行动（如捐赠、义卖、传播信息等）", null, null, ["ACTION"]),
      option("D", "暂时还没行动，但我在精神上举双手支持", null, null)
    ]
  }
];

export const questions: Question[] = [q0, ...formalQuestions, ...hiddenQuestions];

export const questionById = Object.fromEntries(
  questions.map((question) => [question.id, question])
) as Record<string, Question>;
