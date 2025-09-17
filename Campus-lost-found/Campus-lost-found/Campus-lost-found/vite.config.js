// vite.config.js

import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },

  server: {
    proxy: {
      // 规则一：代理所有以 /api 开头的API请求
      '/api': {
        target: ' http://10.21.141.210:5000', // 您的后端服务器地址
        changeOrigin: true, // 必须设置为 true
      },
      // 【新增】规则二：代理所有以 /static 开头的静态资源请求（如图片）
      '/static': {
        target: 'http://10.21.141.210:5000', // 同样指向您的后端服务器
        changeOrigin: true, // 必须设置为 true
      }
    }
  }
})