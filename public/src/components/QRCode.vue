<template>
  <div>
    <!-- todo: ':val' is set as workaround for update not being fired on props change.. -->
    <canvas
      :style="{height: size + 'px', width: size + 'px'}"
      :height="size"
      :width="size"
      ref="qr"
      :val="val"
    ></canvas>
  </div>
</template>


<script>
import qr from 'qr.js'

export default {
  props: ['val', 'size', 'level', 'bgColor', 'fgColor'],
  data() {
    return {}
  },
  beforeUpdate: this.update,
  mounted: this.update,
  methods: {
    update() {
      const size = this.size
      const bgColor = this.bgColor
      const fgColor = this.fgColor
      const $qr = this.$refs.qr

      const qrcode = qr(this.val)

      const ctx = $qr.getContext('2d')
      const cells = qrcode.modules
      const tileW = size / cells.length
      const tileH = size / cells.length
      const scale = (window.devicePixelRatio || 1) / this.getBackingStorePixelRatio(ctx)

      $qr.height = $qr.width = size * scale
      ctx.scale(scale, scale)

      cells.forEach((row, rdx) => {
        row.forEach((cell, cdx) => {
          ctx.fillStyle = cell ? fgColor : bgColor
          const w = Math.ceil((cdx + 1) * tileW) - Math.floor(cdx * tileW)
          const h = Math.ceil((rdx + 1) * tileH) - Math.floor(rdx * tileH)
          ctx.fillRect(Math.round(cdx * tileW), Math.round(rdx * tileH), w, h)
        })
      })
    },
    getBackingStorePixelRatio(ctx) {
      return (
        ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio ||
        1
      )
    }
  }
}
</script>