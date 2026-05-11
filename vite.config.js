import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // 确保这里指向的是你修改后的那个根目录下的文件
        doc: resolve(__dirname, 'doc.html') 
      }
    }
  }
})