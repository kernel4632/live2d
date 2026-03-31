# live2d（实验示例）

一个“突然想玩 Live2D 就开干”的小实验项目。

这个仓库不是完整产品，也不是最佳实践模板，而是一个可运行、可改造的 **Live2D + Vue + Pixi** 示例。先开源上来，后面有空会继续往里塞一些有趣功能。

## 这个项目目前有什么

- 用 Vue 3 + Vite 跑一个前端页面
- 使用 pixi-live2d-display 加载 Live2D 模型
- 提供一些基础交互示例（动作、表情、换装、重置）
- 模型资源放在 `public/ulvm2_0001/` 下，开箱可跑

## 为什么开源

- 记录一次个人实验过程，方便以后回看
- 给想快速试 Live2D 的同学一个最小参考
- 先发布，再迭代：后续会逐步补充更好玩的能力

## 快速开始

> 建议 Node.js 18+。

### 1）安装依赖

```bash
pnpm install
```

### 2）本地开发

```bash
pnpm dev
```

### 3）构建产物

```bash
pnpm build
```

### 4）本地预览构建结果

```bash
pnpm preview
```

## 技术栈

- Vue 3
- Vite
- PixiJS v6
- pixi-live2d-display

## 项目结构（精简）

```text
.
├─ src/
│  ├─ App.vue
│  └─ components/
│     └─ live2d.vue        # Live2D 示例逻辑
├─ public/
│  ├─ live2dcubismcore.min.js
│  └─ ulvm2_0001/          # 模型资源
├─ package.json
└─ README.md
```

## 当前状态

- ✅ 可运行
- ✅ 可进行基础交互实验
- 🚧 代码结构与工程化程度仍偏实验性质

## 后续计划（有空就更）

- [ ] 优化组件结构与命名
- [ ] 增加更多动作/表情控制面板
- [ ] 增加参数调试面板（位置、缩放、命中区可视化）
- [ ] 补充更多说明文档与注释
- [ ] 尝试加入更多有趣玩法

## 开源说明

本项目以实验示例为定位，欢迎：

- 提 issue 提建议
- 提 PR 一起改进
- 基于本仓库二次开发

具体授权方式见 `LICENSE` 文件。

## 致谢

- Live2D 相关生态
- PixiJS 社区
- Vue / Vite 社区

---

如果这个仓库刚好帮你少踩了一个坑，那它就已经完成使命了。