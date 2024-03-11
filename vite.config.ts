import {defineConfig} from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'

const pathSrc = path.resolve(__dirname, 'src')

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    build: {
        outDir: 'docs'
    },
    resolve: {
        alias: {
            '~/': `${pathSrc}/`
        }
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        // 是否开启 https
        https: false,
      },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@use "~/assets/themecss/variable.scss" as *;`
            }
        }
    },
})
