import Head from 'next/head'
import { useEffect, useMemo, useRef, useState } from 'react'

const CATEGORIES = {
  scenery: {
    label: '风景',
    palette: ['#0f1c3f', '#1f4f7a', '#6cb2eb', '#a3d9ff'],
    accent: '#f2b705'
  },
  city: {
    label: '城市',
    palette: ['#0f172a', '#1e293b', '#334155', '#475569'],
    accent: '#22d3ee'
  },
  monochrome: {
    label: '黑白',
    palette: ['#0b0c0f', '#17181c', '#22232a', '#2f3038'],
    accent: '#f5f5f5'
  }
}

const RESOLUTIONS = [
  '1920x1080 (全高清)',
  '2560x1440 (2K)',
  '3840x2160 (4K)',
  '4500x3000 (平板)',
  '1170x2532 (手机竖屏)'
]

const PRICE = '¥9.90'

const roundedRect = (ctx, x, y, w, h, r) => {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

const parseResolution = value => {
  const [size] = value.split(' ')
  const [width, height] = size.split('x').map(Number)
  return { width, height }
}

const drawBackdrop = (ctx, width, height, palette) => {
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, palette[0])
  gradient.addColorStop(0.35, palette[1])
  gradient.addColorStop(0.7, palette[2])
  gradient.addColorStop(1, palette[3])
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
  for (let i = 0; i < 40; i++) {
    const radius = Math.random() * 2 + 0.6
    const x = Math.random() * width
    const y = Math.random() * (height * 0.35)
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }
}

const drawScenery = (ctx, width, height, accent) => {
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.fillRect(0, height * 0.72, width, height * 0.28)

  const mountainBaseY = height * 0.78
  const mountainWidth = width * 0.28

  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.beginPath()
  ctx.moveTo(width * 0.4, mountainBaseY - 160)
  ctx.lineTo(width * 0.4 - mountainWidth, mountainBaseY)
  ctx.lineTo(width * 0.4 + mountainWidth, mountainBaseY)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.beginPath()
  ctx.moveTo(width * 0.65, mountainBaseY - 120)
  ctx.lineTo(width * 0.65 - mountainWidth * 0.7, mountainBaseY)
  ctx.lineTo(width * 0.65 + mountainWidth * 0.7, mountainBaseY)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = accent
  ctx.fillRect(width * 0.2, mountainBaseY + 16, width * 0.6, 12)
}

const drawCity = (ctx, width, height, accent) => {
  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.fillRect(0, height * 0.68, width, height * 0.32)

  const buildings = [
    { x: 0.12, w: 0.12, h: 0.25 },
    { x: 0.27, w: 0.09, h: 0.18 },
    { x: 0.38, w: 0.14, h: 0.32 },
    { x: 0.56, w: 0.1, h: 0.22 },
    { x: 0.7, w: 0.12, h: 0.28 }
  ]

  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  buildings.forEach(b => {
    const x = b.x * width
    const w = b.w * width
    const h = b.h * height
    const y = height * 0.68 - h
    ctx.fillRect(x, y, w, h)
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fillRect(x + w * 0.1, y + h * 0.15, w * 0.1, h * 0.2)
    ctx.fillRect(x + w * 0.4, y + h * 0.4, w * 0.08, h * 0.3)
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
  })

  ctx.fillStyle = accent
  ctx.fillRect(width * 0.32, height * 0.66, width * 0.36, height * 0.06)
  ctx.fillStyle = '#0f172a'
  ctx.font = `${Math.max(14, width * 0.015)}px "SF Pro Display", "Noto Sans SC", system-ui`
  ctx.fillText('Modern Wallpaper Studio', width * 0.34, height * 0.7)
}

const drawMonochrome = (ctx, width, height, accent) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#202329')
  gradient.addColorStop(1, '#0c0d11')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1
  for (let i = 0; i < 7; i++) {
    const x = (width / 7) * i + (i % 2 === 0 ? 0 : 8)
    ctx.beginPath()
    ctx.moveTo(x, height * 0.2)
    ctx.lineTo(x + 18, height * 0.8)
    ctx.stroke()
  }

  ctx.fillStyle = accent
  ctx.globalAlpha = 0.1
  ctx.beginPath()
  ctx.arc(width * 0.55, height * 0.42, width * 0.18, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
}

const drawDevices = (ctx, width, height, previewColor) => {
  const sizes = [
    { w: width * 0.6, h: height * 0.4, x: width * 0.2, y: height * 0.12, r: 18 },
    { w: width * 0.35, h: height * 0.25, x: width * 0.08, y: height * 0.45, r: 16 },
    { w: width * 0.2, h: height * 0.35, x: width * 0.72, y: height * 0.3, r: 22 }
  ]

  sizes.forEach(({ w, h, x, y, r }) => {
    ctx.fillStyle = 'rgba(10, 12, 16, 0.65)'
    roundedRect(ctx, x, y, w, h, r)
    ctx.fill()
    ctx.fillStyle = previewColor
    roundedRect(ctx, x + 12, y + 12, w - 24, h - 24, r * 0.6)
    ctx.fill()
  })
}

const drawOverlay = (ctx, width, height, categoryLabel, resolutionLabel) => {
  ctx.fillStyle = 'rgba(0,0,0,0.32)'
  ctx.fillRect(0, 0, width, height * 0.11)

  ctx.fillStyle = '#f8fafc'
  ctx.font = `${Math.max(24, width * 0.02)}px "Noto Sans SC", "Inter", system-ui`
  ctx.textAlign = 'center'
  ctx.fillText('Copyright by Modern Wallpaper', width / 2, height * 0.07)

  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.font = `${Math.max(16, width * 0.012)}px "Noto Sans SC", "Inter", system-ui`
  ctx.textAlign = 'left'
  ctx.fillText(`类别：${categoryLabel}`, width * 0.06, height * 0.92)
  ctx.fillText(`分辨率：${resolutionLabel}`, width * 0.06, height * 0.96)

  ctx.fillStyle = '#0ea5e9'
  ctx.font = `${Math.max(14, width * 0.013)}px "Noto Sans SC", "Inter", system-ui`
  ctx.textAlign = 'right'
  ctx.fillText('点击导出，即刻解锁高清商用文件', width * 0.94, height * 0.94)

  ctx.fillStyle = '#0d9488'
  roundedRect(ctx, width * 0.8, height * 0.18, width * 0.14, 42, 12)
  ctx.fill()
  ctx.fillStyle = '#e0f2fe'
  ctx.font = `${Math.max(16, width * 0.014)}px "Noto Sans SC", "Inter", system-ui`
  ctx.textAlign = 'center'
  ctx.fillText(`解锁高清 ${PRICE}`, width * 0.87, height * 0.21)
}

const WallpaperGenerator = () => {
  const [category, setCategory] = useState('scenery')
  const [resolution, setResolution] = useState(RESOLUTIONS[2])
  const [previewUrl, setPreviewUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const canvasRef = useRef(null)

  const currentPalette = useMemo(() => CATEGORIES[category], [category])

  const renderWallpaper = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const { width, height } = parseResolution(resolution)
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsGenerating(true)
    drawBackdrop(ctx, width, height, currentPalette.palette)

    if (category === 'scenery') {
      drawScenery(ctx, width, height, currentPalette.accent)
    } else if (category === 'city') {
      drawCity(ctx, width, height, currentPalette.accent)
    } else {
      drawMonochrome(ctx, width, height, currentPalette.accent)
    }

    drawDevices(ctx, width, height, 'rgba(255,255,255,0.05)')
    drawOverlay(
      ctx,
      width,
      height,
      currentPalette.label,
      resolution.replace(' (', '  (')
    )

    const data = canvas.toDataURL('image/png')
    setPreviewUrl(data)
    setIsGenerating(false)
  }

  useEffect(() => {
    renderWallpaper()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, resolution])

  const handleExport = () => {
    if (!previewUrl) return
    const { width, height } = parseResolution(resolution)
    const link = document.createElement('a')
    link.download = `modern-wallpaper-${width}x${height}.png`
    link.href = previewUrl
    link.click()
  }

  return (
    <>
      <Head>
        <title>现代壁纸生成器｜Modern Wallpaper</title>
      </Head>
      <div className='min-h-screen bg-slate-50 text-slate-900'>
        <div className='mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:py-16'>
          <header className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-[0.22em] text-sky-600'>Modern Wallpaper Studio</p>
              <h1 className='mt-2 text-3xl font-bold text-slate-900 md:text-4xl'>一键生成沉浸式壁纸封面</h1>
              <p className='mt-2 text-base text-slate-600'>选择类别与分辨率，生成带有品牌标识的预览图，导出高清文件后进入收费流程。</p>
            </div>
            <div className='rounded-2xl border border-sky-100 bg-white/70 px-4 py-3 text-right shadow-sm backdrop-blur'>
              <p className='text-xs text-slate-500'>高清授权价</p>
              <p className='text-2xl font-semibold text-slate-900'>{PRICE}</p>
              <p className='text-xs text-slate-400'>导出后将自动生成付费记录</p>
            </div>
          </header>

          <div className='grid gap-8 lg:grid-cols-[1.3fr_0.8fr]'>
            <section className='overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md'>
              <div className='flex items-center justify-between border-b border-slate-100 px-6 py-4'>
                <div>
                  <p className='text-sm font-medium text-slate-900'>生成中的封面图</p>
                  <p className='text-xs text-slate-500'>实时预览，可点击导出保存为 PNG</p>
                </div>
                <span className='rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-600'>支持 4K / 平板 / 手机</span>
              </div>
              <div className='relative bg-slate-900 px-4 pb-6 pt-4 sm:px-8'>
                <div className='flex justify-center'>
                  <img
                    src={previewUrl}
                    alt='Wallpaper preview'
                    className='max-h-[520px] w-full max-w-5xl rounded-2xl border border-slate-700 bg-slate-800 object-contain shadow-2xl'
                  />
                </div>
                <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='flex items-center gap-2 text-xs text-slate-300'>
                    <span className='inline-flex h-2 w-2 rounded-full bg-emerald-400'></span>
                    <span>{isGenerating ? '生成中...' : '预览已更新，可导出高清版本'}</span>
                  </div>
                  <div className='flex gap-3'>
                    <button
                      onClick={renderWallpaper}
                      className='rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20'
                    >
                      重新生成
                    </button>
                    <button
                      onClick={handleExport}
                      className='rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600'
                    >
                      导出高清文件
                    </button>
                  </div>
                </div>
                <canvas ref={canvasRef} className='hidden' aria-hidden='true' />
              </div>
            </section>

            <section className='space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-md'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-slate-900'>生成参数</p>
                  <p className='text-xs text-slate-500'>选择类别与目标分辨率，点击右侧即可导出</p>
                </div>
                <span className='rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600'>包含水印预览</span>
              </div>

              <div className='space-y-3'>
                <p className='text-xs font-semibold text-slate-500'>壁纸类别</p>
                <div className='grid gap-3 sm:grid-cols-3'>
                  {Object.entries(CATEGORIES).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => setCategory(key)}
                      className={`rounded-xl border px-4 py-3 text-left transition ${
                        category === key
                          ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <p className='text-sm font-semibold'>{value.label}</p>
                      <p className='text-xs text-slate-500'>
                        {key === 'scenery' && '自然山景与柔和光线'}
                        {key === 'city' && '都市霓虹与商业质感'}
                        {key === 'monochrome' && '极简黑白与质感纹理'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className='space-y-3'>
                <p className='text-xs font-semibold text-slate-500'>输出分辨率</p>
                <div className='space-y-2'>
                  {RESOLUTIONS.map(option => (
                    <label
                      key={option}
                      className='flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition hover:border-slate-300'
                    >
                      <div className='space-y-0.5'>
                        <span className='text-sm font-medium text-slate-900'>{option}</span>
                        <p className='text-xs text-slate-500'>适配设备：{option.includes('1170') ? '手机竖屏' : '桌面 / 平板'}</p>
                      </div>
                      <input
                        type='radio'
                        name='resolution'
                        className='h-4 w-4 accent-sky-500'
                        value={option}
                        checked={resolution === option}
                        onChange={e => setResolution(e.target.value)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className='rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500'>
                导出文件将包含授权信息与水印，支付完成后将生成无水印高清资源。支持 PNG 下载与自定义命名。
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}

export default WallpaperGenerator
