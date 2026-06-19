# 诗歌骰子 - 开发文档

## 项目概述

**项目名称**：诗歌骰子 (Poetry Dice)

**项目地址**：https://bearts13.github.io/poetry-dice/

**项目简介**：一个利用 9 颗骰子创作现代诗的网页应用。骰子每面印有汉字词组，用户通过投掷骰子随机获取词组，然后自由排列组合创作诗歌。

**技术栈**：
- Vue 3 (Composition API)
- TypeScript
- Vite
- Tailwind CSS
- Pinia (状态管理)
- GitHub Pages (部署)

---

## 开发需求

用户最初的需求是：
1. 9 颗 6 面骰子，每面是汉字词组
2. 投掷骰子后显示面朝上的词组
3. 词组可自由排列组合创作现代诗
4. 界面简约文艺

### 骰子词组配置

| 骰子编号 | 词组内容 |
|---------|---------|
| 1 | 我们、蝴蝶、诗歌、夜晚、旷野、光线 |
| 2 | 后来、在、于是、而、像、的 |
| 3 | 然而、转瞬即逝、你的、无人知晓、宇宙轰鸣、漫无边际 |
| 4 | 永恒、明亮、神秘、错轨、旋转、自由 |
| 5 | 沉默、告别、燃烧、生锈、模糊、失重 |
| 6 | 影子、谜语、命运、时间、梦境、心脏 |
| 7 | 捕捉、亲吻、跳入、选择、拥抱、幻想 |
| 8 | 所有的、蓝色、轻盈的、盛夏、自己的、最小的 |
| 9 | 天空、呼吸、小狗、月亮、花朵、海水 |

---

## 功能迭代历程

### v1.0 - 基础版本
- 9 颗骰子 3x3 网格展示
- 点击"投掷骰子"按钮随机生成词组
- 词组以卡片形式展示在下方
- 诗歌展示区显示排列结果
- 一键复制诗歌功能

### v2.0 - 界面优化
- **色调调整**：淡蓝色主题，背景添加波纹动画
- **骰子缩小**：从 96x96px 缩小到 80x80px
- **交互优化**：词组可拖拽调整顺序，支持换行

### v3.0 - 交互重构
- **主题系统**：4 套蓝色撞色主题可切换（后精简为 2 套）
- **待选区模式**：上方待选区 + 下方诗歌行
- **行编辑器**：词组在不同行间拖拽，支持新增/删除行
- **双击换行**：词组可双击添加换行标记

### v4.0 - 细节打磨
- **固定尺寸**：词组卡片尺寸固定，与骰子大小一致
- **字体加粗**：骰子和词组字体加粗加大
- **移除动画**：hover 和 dragging 时不再有缩放变换

### v5.0 - 增强功能
- **作者署名**：可输入作者名，显示在诗歌右下角
- **复制图片**：生成带边框和装饰的诗歌图片，适合分享

### v6.0 - 移动端适配
- **触摸拖拽**：使用 Pointer Events 实现移动端触摸拖拽
- **点击操作**：最终改为"点击选择 + 点击放入"模式，兼容所有设备

---

## 技术难点与解决方案

### 1. GitHub Pages 部署 404 问题

**问题描述**：
- GitHub Actions 部署失败
- 部署成功后显示 404 页面
- 电脑浏览器首次能访问，后续无法访问

**解决方案**：
1. 修改 `package.json` 的 build 脚本，移除 `vue-tsc` 类型检查
2. 使用 `npm install` 替代 `npm ci`（避免 lockfile 严格检查）
3. 创建 `.nojekyll` 文件避免 GitHub Pages 跳过下划线开头的文件
4. 添加 `404.html` 作为 SPA 回退页
5. 添加 `dist/.gitignore` 防止 node_modules 被提交

### 2. 移动端拖拽失效

**问题描述**：
- HTML5 Drag API 在移动端不生效
- 触摸事件被浏览器默认滚动行为干扰
- 尝试使用 Pointer Events 配合延迟触发，仍不稳定

**解决方案**：
采用**点击选择 + 点击放入**模式：
- 点击词组选中（高亮显示）
- 点击目标行将词组放入
- 点击行内词组移除回待选区
- 同时保留 PC 端的拖拽功能

这种方案完全绕过了触摸拖拽的技术难题，用户体验反而更直观。

### 3. 浏览器缓存导致页面不更新

**问题描述**：
- 强制刷新后页面正常
- 再次访问或关闭重开又显示 404

**解决方案**：
在 `index.html` 添加缓存控制 meta 标签：
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
```

---

## 项目结构

```
poetry-dice/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 部署配置
├── dist/                       # 构建输出目录（部署用）
├── node_modules/                # 依赖
├── public/
│   └── favicon.svg             # 网站图标
├── src/
│   ├── assets/
│   │   └── main.css            # 全局样式
│   ├── components/
│   │   ├── DiceBoard.vue       # 骰子展示区
│   │   ├── PoemActions.vue      # 操作按钮（复制）
│   │   ├── PoemDisplay.vue      # 诗歌展示区
│   │   ├── ThemeSwitcher.vue   # 主题切换器
│   │   └── WordCards.vue        # 词组编辑区
│   ├── stores/
│   │   └── gameStore.ts        # Pinia 状态管理
│   ├── types/
│   │   └── index.ts            # TypeScript 类型定义
│   ├── App.vue                 # 根组件
│   ├── main.ts                 # 入口文件
│   └── style.css               # 全局 CSS 变量
├── .gitignore
├── index.html                  # HTML 模板
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md                   # 项目说明
```

---

## 环境要求

- Node.js >= 18
- npm >= 9

---

## 开发命令

```bash
# 安装依赖
npm install

# 开发调试
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

---

## 部署说明

项目已配置 GitHub Actions，push 到 main 分支会自动构建并部署到 GitHub Pages。

**部署地址**：https://bearts13.github.io/poetry-dice/

---

## 关键代码说明

### 骰子数据结构 (types/index.ts)

```typescript
interface DiceResult {
  id: number;           // 骰子编号 1-9
  faces: string[];      // 6 个面
  currentFace: number;  // 当前显示的面索引
  word: string;         // 当前显示的词组
}

interface Theme {
  name: string;
  bg: string;           // 背景色
  surface: string;      // 卡片色
  accent: string;      // 强调色
  text: string;        // 主文字色
  textMuted: string;   // 次要文字色
  border: string;      // 边框色
}
```

### 主题配置 (stores/gameStore.ts)

项目包含两套主题：
- **晴空**（默认）：浅蓝色调，适合日常使用
- **深海**：深蓝色调，适合夜晚使用

---

## 未来可扩展方向

1. **词组自定义**：用户可编辑骰子词组
2. **历史记录**：保存投掷历史和创作
3. **社交分享**：直接分享到社交平台
4. **多语言支持**：支持其他语言的骰子组
5. **离线模式**：支持 PWA 离线使用

---

## 开发时间线

| 日期 | 版本 | 主要内容 |
|-----|-----|---------|
| 2026-06-18 | v1.0 | 基础版本完成 |
| 2026-06-18 | v2.0 | 界面优化、波纹动画 |
| 2026-06-18 | v3.0 | 主题系统、待选区模式 |
| 2026-06-18 | v4.0 | 尺寸调整、细节打磨 |
| 2026-06-18 | v5.0 | 作者署名、复制图片 |
| 2026-06-18 | v6.0 | 移动端适配、点击操作 |

---

*文档生成时间：2026-06-18*
