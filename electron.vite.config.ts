import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.ts')
        }
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        external: ['@services/*', '@schemas/*', '@config/*'],
        input: {
          index: resolve(__dirname, 'src/preload/index.ts')
        }
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, 'src/renderer/src'),
        '@': resolve(__dirname),
        '@config': resolve(__dirname, './config'),
        '@services': resolve(__dirname, './services'),
        '@schemas': resolve(__dirname, './schemas')
      },
      extensions: ['.js', '.ts', '.vue', '.json']
    },
    plugins: [vue(), tailwindcss()]
  }
})
