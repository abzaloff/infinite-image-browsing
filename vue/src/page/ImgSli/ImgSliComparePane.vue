<script setup lang="ts">
// @ts-ignore
import { Splitpanes, Pane } from 'splitpanes'
import ImgSliSide from './ImgSliSide.vue'
import PromptCompare from './PromptCompare.vue'
import { asyncComputed, useElementSize } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { FileNodeInfo } from '@/api/files'
import { toRawFileUrl } from '@/util/file'
import { createImage } from '@/util'
import { ArrowDownOutlined } from '@/icon'

const props = defineProps<{
  left: FileNodeInfo,
  right: FileNodeInfo
  container?: 'drawer'
}>()
const percent = ref(50)
const onResize = ([{ size }]: { size: number }[]) => {
  percent.value = size
}

const wrapperEl = ref<HTMLDivElement>()
const { width } = useElementSize(wrapperEl)
const zoom = ref(1)
const pan = ref({ x: 0, y: 0 })
const isPanning = ref(false)

watch(
  () => [props.left?.fullpath, props.right?.fullpath],
  () => {
    zoom.value = 1
    pan.value = { x: 0, y: 0 }
  }
)

const requestFullScreen = () => {
  wrapperEl.value?.requestFullscreen()
}
defineExpose({ requestFullScreen })

const clampPan = (nextPan = pan.value, nextZoom = zoom.value) => {
  const el = wrapperEl.value
  if (!el) return nextPan
  const limitX = Math.max(0, (el.clientWidth * nextZoom - el.clientWidth) / 2)
  const limitY = Math.max(0, (el.clientHeight * nextZoom - el.clientHeight) / 2)
  return {
    x: Math.max(-limitX, Math.min(limitX, nextPan.x)),
    y: Math.max(-limitY, Math.min(limitY, nextPan.y))
  }
}

const onWheel = (event: WheelEvent) => {
  const target = event.target as HTMLElement
  if (target.closest('.splitpanes__splitter')) return
  if (!target.closest('img.img')) return
  event.preventDefault()
  const el = wrapperEl.value
  if (!el) return
  const currentZoom = zoom.value
  const nextZoom = Math.max(1, Math.min(8, currentZoom * (event.deltaY < 0 ? 1.16 : 1 / 1.16)))
  const rect = el.getBoundingClientRect()
  const focusX = event.clientX - (rect.left + rect.width / 2)
  const focusY = event.clientY - (rect.top + rect.height / 2)
  const zoomRatio = nextZoom / currentZoom
  const nextPan = nextZoom === 1
    ? { x: 0, y: 0 }
    : {
        x: focusX - (focusX - pan.value.x) * zoomRatio,
        y: focusY - (focusY - pan.value.y) * zoomRatio
      }
  zoom.value = nextZoom
  pan.value = clampPan(nextPan, nextZoom)
}

const onContextMenu = (event: MouseEvent) => {
  if (zoom.value > 1) event.preventDefault()
}

const onMouseDown = (event: MouseEvent) => {
  if ((event.target as HTMLElement).closest('.splitpanes__splitter')) return
  if (event.button !== 2 || zoom.value <= 1) return
  event.preventDefault()
  const startPan = pan.value
  const startX = event.clientX
  const startY = event.clientY
  isPanning.value = true

  const onMouseMove = (moveEvent: MouseEvent) => {
    pan.value = clampPan({
      x: startPan.x + moveEvent.clientX - startX,
      y: startPan.y + moveEvent.clientY - startY
    })
  }
  const onMouseUp = (upEvent: MouseEvent) => {
    if (upEvent.button !== 2) return
    isPanning.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const onClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (
    event.button === 0 &&
    document.fullscreenElement === wrapperEl.value &&
    !target.closest('img.img') &&
    !target.closest('.splitpanes__splitter')
  ) {
    document.exitFullscreen()
  }
}

const maxArea = asyncComputed(async () => {
  if (!props.left || !props.right) {
    return {
      width: 0,
      height: 0
    }
  }
  const [l, r] = await Promise.all([createImage(toRawFileUrl(props.left)), createImage(toRawFileUrl(props.right))])
  return {
    width: Math.max(l.width, r.width),
    height: Math.max(r.height, l.height)
  }
})

const maxEdge = asyncComputed(async () => {
  const area = maxArea.value
  if (!area?.width || !area?.height) {
    return undefined
  }
  const { height, width } = area
  const aspectRatio = width / height
  const clientAR = document.body.clientWidth / document.body.clientHeight
  return aspectRatio > clientAR ? 'width' : 'height'
})

const canRenderCompare = computed(() => !!maxEdge.value && !!maxArea.value?.width && !!maxArea.value?.height)
</script>
<template>
  <div
    ref="wrapperEl"
    class="img-sli-zoom-stage"
    :class="{ 'is-panning': isPanning }"
    @wheel="onWheel"
    @mousedown="onMouseDown"
    @click="onClick"
    @contextmenu="onContextMenu"
  >
    <splitpanes v-if="canRenderCompare" class="default-theme img-sli-zoom-content" @resize="onResize">
      <pane v-if="left">
        <ImgSliSide
          side="left"
          :max-edge="maxEdge"
          :container-width="width"
          :percent="percent"
          :img="left"
          :zoom="zoom"
          :pan-x="pan.x"
          :pan-y="pan.y"
        />
      </pane>
      <pane v-if="right">
        <ImgSliSide
          :max-edge="maxEdge"
          :percent="percent"
          :img="right"
          side="right"
          :container-width="width"
          :zoom="zoom"
          :pan-x="pan.x"
          :pan-y="pan.y"
        />
      </pane>
    </splitpanes>
  </div>
  <div class="hint" v-if="container !== 'drawer'">
    <div class="hint-inline">
      <ArrowDownOutlined /> {{ $t('scrollDownToComparePrompt') }}
    </div>
  </div>
  <PromptCompare :lImg="left" :rImg="right"></PromptCompare>
</template>


<style lang="scss">
.hint {
  text-align: center;
  position: relative;
  z-index: 222;
  top: -48px;

  .hint-inline {
    display: inline-block;
    color: var(--zp-primary);
    margin: 0 auto;
    padding: 4px 8px;
    border-radius: 4px;
    background-color: var(--zp-primary-background);
  }
}

.img-sli .default-theme {

  .splitpanes__splitter {
    background: linear-gradient(
      to right,
      transparent 0 calc(50% - 0.5px),
      var(--zp-grey70) calc(50% - 0.5px) calc(50% + 0.5px),
      transparent calc(50% + 0.5px)
    ) !important;
    border: 0 !important;
    box-shadow: none !important;
    position: relative;
    width: 16px !important;
    min-width: 16px !important;
    margin-left: -7.5px !important;
    margin-right: -7.5px !important;
    cursor: col-resize;
    z-index: 20;

    &::before {
      content: none !important;
      display: none !important;
    }

    &::after {
      content: none !important;
      display: none !important;
    }
  }

}

.img-sli-zoom-stage {
  height: 100%;
  overflow: hidden;
  cursor: zoom-in;
  touch-action: none;
}

.img-sli-zoom-stage.is-panning {
  cursor: grabbing;
}

.img-sli-zoom-content {
  height: 100%;
}
</style>
