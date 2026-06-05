# ⚡ Zero-Cloud Drop

A minimalist, highly secure, blazing-fast Peer-to-Peer file transfer tool. 

**No cloud storage. No file size limits. Total privacy.**

## 🚀 如何使用 (How to use)

1. **打开网页**：在任意两台设备（电脑或手机）上打开本网站。
2. **获取连接码**：设备 A 会自动在屏幕正中央生成一个 **6 位专属连接码**（如 `A8K2X1`）。
3. **建立连接**：在设备 B 下方的输入框内，填入设备 A 的连接码，点击 **Connect**。
4. **极速传文件**：连接成功后，两边任意拖拽或选择文件，文件将直接跨越空间飞入另一台设备！

## 🧠 核心原理 (How it works)

Zero-Cloud Drop 的底层基于 **WebRTC (Web Real-Time Communication)** 技术实现浏览器与浏览器之间的直接通信。

* **零云端 (Zero-Cloud)**：你的文件数据永远不会经过、也不会保存在任何第三方服务器上。隐私极度安全。
* **大文件切片引擎 (Chunking)**：针对动辄数 GB 的超大文件，我们在内存中实现了 64KB 级别的手动切片防抖传输，彻底避免了浏览器 WebRTC 默认通道的内存溢出崩溃问题。
* **无惧陌生网络 (NAT Traversal)**：内置了多重公共信令服务器和 Google STUN 穿透基站，即使在公司内网、星巴克等复杂的网络环境下也能极速握手连通。

## 🎨 极致的视觉体验

* 使用 Tailwind CSS 构建了极简的深色系毛玻璃（Glassmorphism） UI。
* 核心动效由 **GSAP** 物理引擎驱动，包含磁性阻尼悬停、错落排版滑入以及液态 svg 进度环，带来原生 App 级别的交互质感。

---

## 💻 本地开发指南 (Local Development)

```bash
# 1. 安装依赖
npm install

# 2. 启动本地开发服务 (支持局域网访问)
npm run dev -- --host

# 3. 生产环境编译打包
npm run build
```
