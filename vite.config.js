import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 这是项目的 Vite 配置入口；当前只启用 Vue 插件，后续需要扩展构建能力时在这里追加。
export default defineConfig({
  plugins: [vue()],
})
