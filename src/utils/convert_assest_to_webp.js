// scripts/convert-assets-to-webp.js
const sharp = require('sharp')
const fs = require('fs').promises
const path = require('path')

class WebPConverter {
    constructor(options = {}) {
        this.options = {
            inputDir: './src/assets',
            outputDir: './src/assets', // 同一目录输出
            quality: 75,
            maxWidth: 1200, // 限制最大宽度
            overwrite: false, // 不覆盖已存在的 WebP 文件
            skipExisting: true, // 跳过已存在的 WebP 文件
            ...options,
        }
    }

    async convertAll() {
        try {
            console.log('🔄 开始扫描图片文件...\n')

            const imageFiles = await this.findImageFiles()
            console.log(`📁 找到 ${imageFiles.length} 个图片文件\n`)

            const results = await this.processImages(imageFiles)
            await this.generateReport(results)

            return results
        } catch (error) {
            console.error('❌ 转换失败:', error)
            throw error
        }
    }

    async findImageFiles() {
        const files = await this.walkDirectory(this.options.inputDir)

        return files.filter((file) => {
            const ext = path.extname(file).toLowerCase()
            return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'].includes(ext)
        })
    }

    async walkDirectory(dir) {
        let results = []
        const list = await fs.readdir(dir)

        for (const file of list) {
            const filePath = path.join(dir, file)
            const stat = await fs.stat(filePath)

            if (stat.isDirectory()) {
                // 递归遍历子目录
                const subResults = await this.walkDirectory(filePath)
                results = results.concat(subResults)
            } else {
                results.push(filePath)
            }
        }

        return results
    }

    async processImages(imageFiles) {
        const results = []
        let processed = 0
        let skipped = 0
        let failed = 0

        // 限制并发数量，避免内存溢出
        const concurrency = 5
        const batches = []

        for (let i = 0; i < imageFiles.length; i += concurrency) {
            batches.push(imageFiles.slice(i, i + concurrency))
        }

        for (const batch of batches) {
            const batchPromises = batch.map((file) => this.convertImage(file))
            const batchResults = await Promise.allSettled(batchPromises)

            for (const result of batchResults) {
                if (result.status === 'fulfilled') {
                    const fileResult = result.value
                    if (fileResult.status === 'converted') {
                        processed++
                        console.log(
                            `✅ ${fileResult.input} → ${fileResult.output} (${fileResult.reduction}%)`,
                        )
                    } else if (fileResult.status === 'skipped') {
                        skipped++
                        console.log(`⏭️  跳过: ${fileResult.input} (${fileResult.reason})`)
                    } else if (fileResult.status === 'failed') {
                        failed++
                        console.log(`❌ 失败: ${fileResult.input} - ${fileResult.error}`)
                    }
                    results.push(fileResult)
                } else {
                    failed++
                    console.log(`❌ 处理失败:`, result.reason)
                }
            }
        }

        console.log(`\n📊 处理完成:`)
        console.log(`✅ 成功转换: ${processed} 个`)
        console.log(`⏭️  跳过: ${skipped} 个`)
        console.log(`❌ 失败: ${failed} 个`)

        return results
    }

    async convertImage(inputPath) {
        try {
            // 检查输入文件是否存在
            try {
                await fs.access(inputPath)
            } catch {
                return {
                    status: 'failed',
                    input: path.basename(inputPath),
                    error: '文件不存在',
                }
            }

            // 生成输出路径
            const outputPath = this.getOutputPath(inputPath)

            // 检查是否跳过已存在的文件
            if (this.options.skipExisting) {
                try {
                    await fs.access(outputPath)
                    return {
                        status: 'skipped',
                        input: path.basename(inputPath),
                        output: path.basename(outputPath),
                        reason: 'WebP 文件已存在',
                    }
                } catch {
                    // 文件不存在，继续处理
                }
            }

            // 读取原文件
            const originalBuffer = await fs.readFile(inputPath)
            const originalSize = originalBuffer.length

            // 获取图片信息
            const metadata = await sharp(originalBuffer).metadata()

            let sharpInstance = sharp(originalBuffer)

            // 调整尺寸（如果超过最大宽度）
            if (metadata.width > this.options.maxWidth) {
                sharpInstance = sharpInstance.resize(this.options.maxWidth, null, {
                    withoutEnlargement: true,
                    fit: 'inside',
                })
            }

            // 转换为 WebP
            const webpBuffer = await sharpInstance
                .webp({
                    quality: this.options.quality,
                    effort: 4,
                    nearLossless: 60,
                })
                .toBuffer()

            const webpSize = webpBuffer.length
            const reduction = (((originalSize - webpSize) / originalSize) * 100).toFixed(1)

            // 写入输出文件
            await fs.writeFile(outputPath, webpBuffer)

            return {
                status: 'converted',
                input: path.basename(inputPath),
                output: path.basename(outputPath),
                originalSize: Math.round(originalSize / 1024),
                webpSize: Math.round(webpSize / 1024),
                reduction: reduction,
                dimensions: `${metadata.width}x${metadata.height}`,
            }
        } catch (error) {
            return {
                status: 'failed',
                input: path.basename(inputPath),
                error: error.message,
            }
        }
    }

    getOutputPath(inputPath) {
        const dir = path.dirname(inputPath)
        const ext = path.extname(inputPath)
        const baseName = path.basename(inputPath, ext)
        return path.join(dir, `${baseName}.webp`)
    }

    async generateReport(results) {
        const converted = results.filter((r) => r.status === 'converted')
        const skipped = results.filter((r) => r.status === 'skipped')
        const failed = results.filter((r) => r.status === 'failed')

        const totalOriginalSize = converted.reduce((sum, img) => sum + img.originalSize, 0)
        const totalWebpSize = converted.reduce((sum, img) => sum + img.webpSize, 0)
        const totalReduction = (
            ((totalOriginalSize - totalWebpSize) / totalOriginalSize) *
            100
        ).toFixed(1)

        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalFiles: results.length,
                converted: converted.length,
                skipped: skipped.length,
                failed: failed.length,
                totalOriginalSize: totalOriginalSize,
                totalWebpSize: totalWebpSize,
                totalReduction: totalReduction,
            },
            converted: converted,
            skipped: skipped,
            failed: failed,
        }

        // 保存报告到文件
        const reportPath = path.join(this.options.outputDir, 'webp-conversion-report.json')
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2))

        console.log('\n📋 详细报告已保存到: webp-conversion-report.json')

        // 控制台总结
        console.log('\n🎉 转换总结:')
        console.log(`📦 原始总大小: ${totalOriginalSize}KB`)
        console.log(`🚀 WebP 总大小: ${totalWebpSize}KB`)
        console.log(`💪 总体积减少: ${totalReduction}%`)
        console.log(`💰 节省空间: ${totalOriginalSize - totalWebpSize}KB`)

        return report
    }
}

// 使用示例
async function main() {
    const converter = new WebPConverter({
        inputDir: '/src/assets',
        outputDir: '/src/assets',
        quality: 75,
        maxWidth: 800, // 限制最大宽度为800px
        skipExisting: true, // 跳过已存在的WebP文件
    })

    await converter.convertAll()
}

// 运行脚本
if (require.main === module) {
    main().catch(console.error)
}

module.exports = WebPConverter
