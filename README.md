# HueKind AI Color Analysis

HueKind 是一个个人色彩分析网页演示项目。用户可以通过问卷和可选自拍，获得季型、肤色特征、推荐色板与颜色替换建议。

项目使用原生 HTML、CSS、JavaScript 和 Vite 构建，不依赖后端服务。

## 功能

- 10 步个人色彩问卷
- 支持上传、拖放和预览自拍
- 根据问卷答案生成季型结果
- 展示肤色特征、个人色板和颜色替换建议
- 浏览春、夏、秋、冬季型色板
- 下载文本格式的个人色彩报告
- 响应式页面和移动端导航
- 隐私政策与服务条款页面

## 技术栈

- HTML5
- CSS3
- JavaScript（ES Modules）
- Vite 8

## 环境要求

- Node.js 20.19+ 或 22.12+
- npm

## 本地启动

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

终端会显示本地访问地址，通常为：

```text
http://localhost:5173
```

## 构建与预览

生成生产构建：

```bash
npm run build
```

构建文件会输出到 `dist/` 目录。

在本地预览生产构建：

```bash
npm run preview
```

## 可用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |

## 项目结构

```text
ColorAnalysis/
├── assets/          # 页面使用的图片资源
├── images/          # 项目相关图片
├── index.html       # 首页与色彩分析界面
├── main.js          # 问卷、评分、上传预览和交互逻辑
├── styles.css       # 全局样式与响应式布局
├── privacy.html     # 隐私政策
├── terms.html       # 服务条款
├── favicon.svg      # 网站图标
├── vite.config.js   # Vite 多页面构建配置
└── package.json     # 项目依赖与 npm 命令
```

## 当前实现说明

当前版本是纯前端交互演示：

- 色彩结果由 `main.js` 中的本地规则评分生成。
- 上传的照片仅通过浏览器对象 URL 用于本地预览，不会发送到服务器。
- 邮箱表单不会提交或保存邮箱地址。
- “分析中”进度为界面演示，不包含真实 AI 模型调用。
- 下载报告为浏览器生成的 `.txt` 文件。

如需用于生产环境，应接入真实分析服务、表单接口、数据保护机制，并同步更新页面中的隐私说明。

## 新增博客文章

博客文章统一维护在 `blog/articles.js`。新增文章时：

1. 在 `articles` 数组中增加一条文章数据。
2. 为文章准备一张图片并放入 `assets/blog/`。
3. 运行 `npm run generate:blog`。

生成脚本会自动创建 `/blog/{slug}/index.html` 静态页面并更新 `public/sitemap.xml`。`npm run dev` 和 `npm run build` 也会自动执行该步骤。
