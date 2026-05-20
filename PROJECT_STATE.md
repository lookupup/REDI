# PROJECT_STATE

## 1. 当前项目阶段

项目已从 KOL demo 阶段迁移到正式发布版本的前端工程基础。

当前定位：

- 移动端优先的 REDI 月经人格测试 H5。
- 技术栈为 Vite + React + TypeScript。
- 现阶段重点是建立可部署、可维护、可继续接真实服务的前端基础。
- 视觉、文案和页面体验先尽量保持已有版本，不在本阶段重做设计。
- 结果页已经接入真实计分逻辑，不再是纯结果预览入口。

## 2. 当前技术栈

正式技术栈：

- Vite
- React 18
- TypeScript
- Tailwind CSS 构建期编译
- PostCSS / Autoprefixer
- 自定义 CSS 动效与移动端样式

已移除旧 demo 形态：

- 不再使用浏览器端 Babel。
- 不再使用 `src/main.jsx`。
- 不再依赖 `src/data/content.js` 双数据源。
- 不再使用 runtime JS 数据副本。
- 不再依赖 Tailwind CDN。

## 3. 当前主要目录结构

核心入口：

- `index.html`
  - Vite HTML 入口。
  - 加载 `/src/main.ts`。

- `src/main.ts`
  - React 应用入口。
  - 管理封面、答题、真实结果页与结果弹窗。
  - 使用 React state 保存当前页面、题目进度、答案和 popup 状态。
  - 答题完成后调用 `calculateResult`，并进入真实结果页。

- `src/styles.css`
  - Tailwind 指令。
  - 字体声明。
  - 移动端页面样式。
  - 题目选项、结果页卡片、popup、key elements 动效。
  - `prefers-reduced-motion` 支持。

数据文件：

- `src/data/cover.ts`
- `src/data/questions.ts`
- `src/data/mainResults.ts`
- `src/data/badges.ts`
- `src/data/actionKits.ts`
- `src/data/dimensions.ts`

逻辑文件：

- `src/lib/scoring.ts`
  - 统一计分逻辑。
  - 输出主人格、六维分数、行动锦囊、特别勋章和 `personaImageKey`。

埋点适配：

- `src/analytics.ts`
  - 预留正式埋点接口。
  - 当前先 `console.log`。
  - 后续可在此接 Supabase、PostHog 或其它 analytics 服务。

工程配置：

- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `tsconfig.json`
- `tailwind.config.js`
- `postcss.config.js`

## 4. 当前已完成

已完成：

- 搭建 Vite + React + TypeScript 正式工程基础。
- 将旧静态 demo 迁移为 TypeScript 源码入口。
- 清理旧运行时 JS 与双数据源。
- 题目、选项、结果、特别勋章、行动锦囊、维度已拆到 `src/data`。
- 计分逻辑保留在 `src/lib/scoring.ts`。
- 答题流程已由 React state 管理。
- 结果页已动态读取 `calculateResult` 的结果。
- 答完 25 题后直接进入真实结果页。
- 结果页包含：
  - 主人格图像。
  - 主人格标签。
  - 主人格宣言。
  - 三个可点击斜卡片入口：
    - 人格档案
    - 经期行动小锦囊
    - 隐藏标签解读
  - 长图保存按钮。
  - 分享按钮。
- popup 已接入：
  - 点击卡片打开 popup。
  - popup 出现时 key elements 弹出。
  - 长图保存 popup 预留 `image_saved` 埋点。
- 已预留基础无障碍：
  - 原生 `button`。
  - 图片 `alt`。
  - SVG `aria-label`。
  - 主要内容使用 `main` / `section` / `figure` / `blockquote`。
  - focus-visible 样式。
  - reduced motion。
  - 文本保持高对比度。
- 已接入构建期 Tailwind，生产环境不再依赖 Tailwind CDN。
- `npm run build` 已通过，生成 `dist/`。
- 当前 production preview 可通过 `http://127.0.0.1:5173/` 查看。

## 5. 当前埋点接口

当前所有埋点统一从 `src/analytics.ts` 发出。

已预留事件：

- `page_view`
- `test_start`
- `question_answered`
- `test_completed`
- `image_generated`
- `image_saved`
- `share_clicked`

当前行为：

- 统一 `console.log("[analytics]", event, payload)`。
- payload 会附带 timestamp。

后续接入建议：

- PostHog：在 `track` 内替换为 `posthog.capture(event, payload)`。
- Supabase：在 `track` 内写入 event table 或 edge function。
- 如果同时接 PostHog 和 Supabase，保持 `track` 对外 API 不变，内部 fan-out。

## 6. PERIOD 六维度逻辑

六个维度：

- `P` Presence / 存在感
- `E` Energy / 能量场
- `R` Rhythm / 稳定度
- `I` Intuition / 身体直觉
- `O` Openness / 开放度
- `D` Documentation / 记录管理

计分来源：

- `P = P1 + P2 + P3 + P4`，满分 12。
- `E = E1 + E2 + E3 + E4`，满分 12。
- `R = R1 + R2 + R3`，满分 9。
- `I = I1 + I2 + I3`，满分 9。
- `O = O1 + O2 + O3`，满分 9。
- `D = D1 + D2 + D3`，满分 9。

特殊说明：

- Q0 不计入六维分数，只触发状态类特别勋章。
- H1、H2、H3、H4 不计入六维分数，只触发特别勋章。
- D1 的 E 选项触发 `ECO`，同时按 D 维度 3 分计入，避免破坏 D 维度结构。
- 百分比计算为 `Math.round(score / maxScore * 100)`。

## 7. 主人格逻辑

主人格只由 P/E/R 三个维度决定。

阈值：

- `P >= 6` 为 `↑`，否则 `↓`。
- `E >= 5` 为 `↑`，否则 `↓`。
- `R >= 5` 为 `↑`，否则 `↓`。

映射：

- `↑↑↑` = `STAR` 顶流女明星
- `↑↑↓` = `WILD` 大艺术家
- `↑↓↑` = `COACH` 硬核教练
- `↑↓↓` = `NEWS` 战地记者
- `↓↑↑` = `INVISIBLE` 隐形嘉宾
- `↓↑↓` = `SURPRISE` 神秘转学生
- `↓↓↑` = `ASSASSIN` 电量刺客
- `↓↓↓` = `OWL` 沉默系室友

`calculateResult` 输出中的 `mainPersona` 包含：

- `id`
- `name`
- `englishName`

## 8. 特别勋章逻辑

特别勋章可以同时触发多个，并使用 `Set` 去重。

可能触发特别勋章的题目：

- Q0
- D1
- H1
- H2
- H3
- H4

当前特别勋章：

- `BLANK`
- `GAP`
- `GRAD`
- `ALLY`
- `FREE`
- `HARD`
- `VOYAGER`
- `DIVER`
- `ECO`
- `RESILIENT`
- `ACTION`

去重规则：

- 同一个勋章只显示一次。
- D1 和 H3 同时触发 `ECO` 时只显示一次。
- H1 和 H3 同时触发 `RESILIENT` 时只显示一次。

## 9. HARD 特殊机制

`HARD` 是特别勋章，同时影响最终人格图像 key。

触发条件：

- H2 选择 C，触发 `HARD`。

计算顺序：

1. 根据 P/E/R 判断主人格。
2. 检查是否触发 `HARD`。
3. 未触发 HARD：`personaImageKey = mainPersona.id`。
4. 触发 HARD：`personaImageKey = mainPersona.id + "_HARD"`。

普通版 key：

- `STAR`
- `WILD`
- `COACH`
- `NEWS`
- `INVISIBLE`
- `SURPRISE`
- `ASSASSIN`
- `OWL`

HARD 融合版 key：

- `STAR_HARD`
- `WILD_HARD`
- `COACH_HARD`
- `NEWS_HARD`
- `INVISIBLE_HARD`
- `SURPRISE_HARD`
- `ASSASSIN_HARD`
- `OWL_HARD`

当前注意：

- 代码已输出 HARD 视觉 key。
- 结果页当前仍使用普通人格图像资源展示。
- 后续需要补齐 8 个 HARD 融合版视觉资产，并按 `personaImageKey` 切换图片。

## 10. 行动锦囊逻辑

行动锦囊由 I/O/D 三个维度决定。

先计算：

- `I = I1 + I2 + I3`
- `O = O1 + O2 + O3`
- `D = D1 + D2 + D3`

自由流动型条件：

- 三项最高分 `<= 3`
- 或最高分与次高分分差 `<= 1`

非自由流动型：

- 取 I/O/D 最高分。
- 并列优先级为 `I > O > D`。

映射：

- `I` = 感知型锦囊
- `O` = 表达型锦囊
- `D` = 记录型锦囊
- `FREE_FLOW` = 自由流动型锦囊

## 11. 当前未完成

下一阶段仍需完成：

- 结果页视觉与设计师稿进一步对齐，尤其是精确间距、层级、漂浮元素和 popup 细节。
- `personaImageKey` 到 HARD 融合版图片的真实资源映射。
- 长图保存真实生成能力：
  - 可选 html2canvas。
  - 或服务端生成分享图。
- 分享按钮真实能力：
  - 复制链接。
  - Web Share API。
  - 渠道参数。
- 正式 analytics 接入：
  - Supabase。
  - PostHog。
- 正式部署配置：
  - 域名。
  - 静态资源缓存策略。
  - Open Graph / 分享 meta。
- 移动端多设备 QA：
  - iPhone SE / 13 / 15 Pro Max。
  - 常见 Android viewport。
  - 微信内置浏览器。
- 更完整的测试：
  - scoring 单元测试。
  - 关键流程端到端测试。
  - popup 交互测试。

## 12. 开发注意事项

继续开发时请遵守：

- 不要重新引入 `src/data/content.js` 或 runtime JS 双数据源。
- 文案、题目、结果、badge、行动锦囊优先改 `src/data/*`。
- 计分规则优先改 `src/lib/scoring.ts`。
- 页面状态和结果展示优先从 `calculateResult` 输出读取。
- 不要绕过 `src/analytics.ts` 直接在组件里接第三方 SDK。
- 不要在没有明确需求时重做整体 UI。
- 每次关键改动后至少跑：
  - `npm run build`
  - 本地浏览器从封面答题到结果页

## 13. 当前可用命令

安装依赖：

```bash
npm install
```

开发：

```bash
npm run dev
```

生产构建：

```bash
npm run build
```

生产预览：

```bash
npm run preview
```
