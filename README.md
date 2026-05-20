# REDI 月经人格测试 H5

这是 REDI 月经人格测试的正式版前端工程骨架，技术栈为 Vite + React + TypeScript。

## 本地开发

```bash
npm install
npm run dev
```

开发地址默认是：

```txt
http://127.0.0.1:5173
```

## 构建与预览

```bash
npm run build
npm run preview
```

`npm run build` 会先执行 TypeScript 检查，再生成可部署的 `dist/`。

## 结构

- `src/main.ts`：React 应用入口、答题流程、真实结果页与弹窗交互。
- `src/data/*`：封面、题目、结果、特别勋章、行动锦囊、维度配置。
- `src/lib/scoring.ts`：计分逻辑，输出主人格、HARD 图像 key、行动锦囊、特别勋章与六维分数。
- `src/analytics.ts`：埋点适配层，目前先 `console.log`，后续可接 Supabase / PostHog。
- `src/styles.css`：全局样式、移动端结果页结构、弹窗动效、reduced motion。

## 已预留埋点

- `page_view`
- `test_start`
- `question_answered`
- `test_completed`
- `image_generated`
- `image_saved`
- `share_clicked`
