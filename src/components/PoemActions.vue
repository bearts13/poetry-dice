<script setup lang="ts">
import { ref, watch } from 'vue'
import { useGameStore } from '../store'

const store = useGameStore()
const authorInput = ref(store.author)
const copiedText = ref(false)
const copiedImg = ref(false)
const generating = ref(false)

watch(authorInput, v => store.setAuthor(v))

async function copyText() {
  await navigator.clipboard.writeText(store.getPoemText())
  copiedText.value = true
  setTimeout(() => copiedText.value = false, 2000)
}

async function copyImage() {
  generating.value = true
  try {
    const el = document.getElementById('poem-container')
    if (!el) return

    const theme = store.currentTheme
    const lines = store.lines.map(line => line.map(di => store.dice[di].word).join(' '))
    const allText = [...lines]
    if (store.author) { allText.push(''); allText.push(`—— ${store.author}`) }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const fontSize = 24
    const lineGap = 16
    const pad = 60

    // measure max width
    ctx.font = `${fontSize}px "Noto Serif SC", "LXGW WenKai", serif`
    let maxW = 0
    for (const l of allText) maxW = Math.max(maxW, ctx.measureText(l).width)

    canvas.width = Math.max(maxW + pad * 2, 400)
    canvas.height = allText.length * (fontSize * 2 + lineGap) + pad * 2

    // bg
    ctx.fillStyle = theme.bg
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    // card
    const cw = canvas.width - pad * 2, ch = canvas.height - pad * 2
    ctx.fillStyle = theme.surface
    ctx.fillRect(pad, pad, cw, ch)
    ctx.strokeStyle = theme.border
    ctx.lineWidth = 2
    ctx.strokeRect(pad, pad, cw, ch)

    // text
    ctx.fillStyle = theme.text
    ctx.textAlign = 'center'
    ctx.font = `${fontSize}px "Noto Serif SC", "LXGW WenKai", serif`
    let y = pad + 80
    for (const l of lines) {
      ctx.fillText(l || '\u3000', canvas.width / 2, y)
      y += fontSize * 2 + lineGap
    }

    if (store.author) {
      y += lineGap
      ctx.font = `18px "Noto Serif SC", serif`
      ctx.fillStyle = theme.textMuted
      ctx.textAlign = 'right'
      ctx.fillText(`—— ${store.author}`, canvas.width - pad, y)
    }

    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.download = `诗歌骰子_${Date.now()}.png`
      a.href = url
      a.click()
      URL.revokeObjectURL(url)
    })

    copiedImg.value = true
    setTimeout(() => copiedImg.value = false, 2000)
  } catch (e) {
    console.error('生成图片失败:', e)
  } finally {
    generating.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg mt-6">
    <div class="flex items-center justify-center gap-3 mb-4">
      <label class="font-serif text-sm" style="color: var(--theme-text-muted);">作者</label>
      <input
        v-model="authorInput"
        type="text"
        placeholder="可留空"
        class="author-input font-serif text-sm px-3 py-2 rounded-lg outline-none"
        style="background: var(--theme-surface); border: 1px solid var(--theme-border); color: var(--theme-text);"
      />
    </div>
    <div class="flex justify-center gap-4">
      <button @click="copyText" class="btn-secondary">
        📋 {{ copiedText ? '已复制 ✓' : '复制诗歌' }}
      </button>
      <button @click="copyImage" :disabled="generating" class="btn-primary">
        🖼️ {{ generating ? '生成中…' : copiedImg ? '已保存 ✓' : '保存图片' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.author-input { transition: all 0.2s; width: 140px; }
.author-input:focus { border-color: var(--theme-accent) !important; box-shadow: 0 0 0 2px var(--theme-accent); }

.btn-primary {
  padding: 0.5rem 1.2rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  color: var(--theme-text);
  border: 1px solid var(--theme-border);
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary:hover { transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.btn-secondary {
  padding: 0.5rem 1.2rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  background: transparent;
  color: var(--theme-text-muted);
  border: 1px solid var(--theme-border);
  cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary:hover { background: var(--theme-surface); color: var(--theme-text); }
</style>
