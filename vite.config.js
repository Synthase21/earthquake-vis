import { defineConfig } from 'vite'

export default defineConfig({
  // 必须写这个，否则部署后找不到引用的 CSS 和 JS 文件
  base: './', 
  build: {
    outDir: 'docs', // 把输出目录设为 docs
    emptyOutDir: true
  }
})