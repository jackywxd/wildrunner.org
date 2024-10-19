# 跑步博客项目

这是一个专注于跑步和比赛的博客网站项目，使用Next.js和Velite构建。

## 主要特性

- 基于MDX的博客系统
- 响应式设计，使用`shadcn/ui`和`tailwindcss`
- 代码语法高亮
- 比赛信息管理
- 图片相册展示
- SEO优化

## 技术栈

- `Next.js`: 利用其静态站点生成(SSG)能力创建用户界面
- `shadcn/ui`: 提供美观且可定制的UI组件
- `Tailwind CSS`: 用于高效的样式开发
- `MDX`: 支持在Markdown中使用JSX组件
- `Velite`: 用于构建类型安全的数据层，处理Markdown/MDX、YAML、JSON等文件

## 项目结构

- `src/app/page.tsx`: 网站首页组件
- `src/store/day.ts`: 日期相关的状态管理
- `next.config.mjs`: Next.js配置文件
- `velite.config.ts`: Velite内容管理配置
- `src/lib/cn.ts`: 通用工具函数

## 主要功能

1. 博客系统
   - 支持MDX格式的文章
   - 文章列表和详情页面

2. 比赛信息
   - 展示最新比赛信息
   - 按年份筛选比赛

3. 图片相册
   - 支持多个相册
   - 首页展示精选图片

4. SEO优化
   - 自动生成元数据和Open Graph信息

## 本地运行

1. 克隆仓库：
   ```bash
   git clone [仓库URL]
   cd [项目文件夹]
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 运行开发服务器：
   ```bash
   npm run dev
   ```

4. 在浏览器中访问 `http://localhost:3000`

## 添加新内容

要添加新的博客内容，请在 `content` 文件夹中创建新的 `.mdx` 文件。

## 贡献

欢迎提交问题和拉取请求。对于重大更改，请先开issue讨论您想要更改的内容。

## 许可证

[MIT](https://choosealicense.com/licenses/mit/)
