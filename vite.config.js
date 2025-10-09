/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { visualizer } from 'rollup-plugin-visualizer'
import ViteImagemin from 'vite-plugin-imagemin'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

const ViteImageminOptions = {
    webp: {
        quality: 20,
    },
    gifsicle: {
        optimizationLevel: 3,
        interlaced: false,
    },
    optipng: {
        optimizationLevel: 7,
    },
    mozjpeg: {
        quality: 75,
    },
    pngquant: {
        quality: [0.6, 0.8],
        speed: 4,
    },
    svgo: {
        plugins: [
            {
                removeViewBox: false,
            },
        ],
    },
}

export default defineConfig(({ mode }) => {
    console.log('当前开发模式：', mode, ' @替换为:', new URL('./src', import.meta.url).pathname)

    const plugins = [
        vue(),
        vueDevTools(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
        ViteImagemin(ViteImageminOptions),
    ]

    // 只在开发模式下添加 visualizer
    if (mode === 'development' || mode === 'analyze') {
        plugins.push(
            visualizer({
                emitFile: true,
                filename: 'stats.html',
                open: true, // 自动在浏览器打开分析报告
            }),
        )
    }

    return {
        plugins,
        base: '/yike/',
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `
            @use "@/styles/var.scss" as *;
          `,
                },
            },
        },
        test: {
            
        },
        build: {
            // 设置 Base64 内联阈值 (16KB 以下转 Base64)
            assetsInlineLimit: 1024 * 16,
            target: 'es2020',
            rollupOptions: {
                external: ['video.js'],
                output: {
                    dir: 'dist',
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            // 按优先级从高到低匹配

                            // UI 组件库
                            if (id.includes('/element-plus/') || id.includes('/element-ui/')) {
                                // 将组件和工具库分开
                                if (id.includes('/components/') || id.includes('/es/components/')) {
                                    return 'element-components'
                                } else if (id.includes('/hooks/') || id.includes('/utils/')) {
                                    return 'element-utils'
                                } else {
                                    return 'element-core'
                                }
                            }

                            // 路由和状态管理
                            if (id.includes('/vue-router/') || id.includes('/pinia/')) {
                                return 'vue-ecosystem'
                            }
                            if (id.includes('vue')) {
                                return 'vue-chunks'
                            }
                            // 工具库 - 按库名精确匹配
                            if (id.includes('/lodash/') || id.includes('/lodash-es/')) {
                                return 'lodash-utils'
                            }

                            if (id.includes('/axios/')) {
                                return 'axios-http'
                            }

                            // 媒体相关
                            if (id.includes('/video.js/') || id.includes('/videojs/')) {
                                return 'video-player'
                            }

                            if (id.includes('/@videojs/') || id.includes('/m3u8-parser/')) {
                                return 'video-utils'
                            }

                            // VueUse 工具集
                            if (id.includes('/@vueuse/')) {
                                return 'vueuse-utils'
                            }

                            // 剩余的第三方库
                            return 'vendor-other'
                        }
                    },
                },
            },
        },
    }
})
