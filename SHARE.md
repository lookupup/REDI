# 如何发给其她人预览

推荐用 Netlify Drop，最快不需要写代码。

1. 打开 https://app.netlify.com/drop
2. 登录或注册 Netlify
3. 把 `redi-period-personality-h5-share.zip` 拖进去
4. 等上传完成，复制 Netlify 生成的 `https://...netlify.app` 链接
5. 把链接发给你想邀请预览的人

注意：

- 本地的 `http://127.0.0.1:5173/` 只能你自己电脑访问，不能直接发给别人。
- 这个 demo 使用 CDN 加载 React、Tailwind 和 Framer Motion，所以预览者需要能正常访问外网 CDN。
- 如果后续要正式上线，建议再改成 Vite/Next 工程并做生产构建。
