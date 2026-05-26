<script setup lang="ts">
import { toRawFileUrl } from '@/util/file'
import { computed } from 'vue'
import { FileNodeInfo } from '@/api/files'
import { asyncComputed } from '@vueuse/core'
import { createImage, pick } from '@/util'
const props = withDefaults(defineProps<{
  side: 'left' | 'right',
  containerWidth: number,
  img: FileNodeInfo,
  maxEdge: 'width' | 'height',
  percent: number,
  zoom?: number,
  panX?: number,
  panY?: number
}>(), {
  zoom: 1,
  panX: 0,
  panY: 0
})
const rect = asyncComputed(async () =>  pick(await createImage(toRawFileUrl(props.img)), 'width', 'height'))

const style = computed(() => {
  let x = ''
  const handlerWidth = 4
  const width = props.containerWidth
  if (props.side === 'left') {
    x = `calc(50% - ${(props.percent - 50) / 100 * width}px)`
  } else {
    x = `calc(-50% - ${(props.percent - 50) / 100 * width + handlerWidth}px)`
  }
  const transform = `translate(${x}, -50%) translate(${props.panX}px, ${props.panY}px) scale(${props.zoom})`
  if (props.maxEdge === 'height') {
    return `height:100%;transform:${transform};transform-origin:50% 50%;`
  } else {
    const r = rect.value
    if (!r) {
      return `height:100%;transform:${transform};transform-origin:50% 50%;`
    }
    return `height:${width / r.width * r.height}px;transform:${transform};transform-origin:50% 50%;`
  }
})
</script>

<template>
  <div class="container">
    <img class="img" :class="[side]" :style="style" :src="toRawFileUrl(img)" @dragstart.prevent.stop />
  </div>
</template>

<style lang="scss" scoped>
.container {
  position: relative;
  user-select: none;
  height: 100%;

  .img {
    position: absolute;
    top: 50%;
    height: 100%;
    will-change: transform;
  }

  .left {
    transform: translate(50%, -50%);
    right: 0;
  }

  .right {
    transform: translate(-50%, -50%);
    left: 0;
  }
}
</style>
