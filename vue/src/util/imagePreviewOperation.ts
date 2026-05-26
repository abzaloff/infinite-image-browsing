
export const closeImageFullscreenPreview = () => {
  const ele = Array.from(document.querySelectorAll('.ant-image-preview-wrap') as unknown as HTMLDivElement[])
    .find(e => e.style.display !== 'none');
  if (ele) {
    console.log('closeImageFullscreenPreview success');
    simulateClick(ele);
  } else {
    console.log('closeImageFullscreenPreview not found');
  }
};

function simulateClick(element: HTMLElement) {
  if (!(element instanceof HTMLElement)) {
    throw new Error('The provided value is not an HTMLElement.');
  }

  const event = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
    target: element, // Although setting target here has no effect as it's a read-only property
  } as any);

  element.dispatchEvent(event);
}

type PreviewZoomState = {
  zoom: number
  panX: number
  panY: number
  cleanup?: () => void
}

let previewZoomState: PreviewZoomState | null = null

const getVisiblePreviewWrap = () => Array.from(document.querySelectorAll('.ant-image-preview-wrap') as unknown as HTMLDivElement[])
  .find(e => e.style.display !== 'none')

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export const installImagePreviewFocusZoom = () => {
  previewZoomState?.cleanup?.()
  const wrap = getVisiblePreviewWrap()
  const img = wrap?.querySelector('.ant-image-preview-img') as HTMLImageElement | null
  if (!wrap || !img) return

  const state: PreviewZoomState = { zoom: 1, panX: 0, panY: 0 }
  const apply = () => {
    const limitX = Math.max(0, (img.clientWidth * state.zoom - wrap.clientWidth) / 2)
    const limitY = Math.max(0, (img.clientHeight * state.zoom - wrap.clientHeight) / 2)
    state.panX = clamp(state.panX, -limitX, limitX)
    state.panY = clamp(state.panY, -limitY, limitY)
    img.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`
    img.style.transformOrigin = '50% 50%'
    img.style.transition = 'transform 0.06s linear'
    img.style.cursor = state.zoom > 1 ? 'grab' : 'zoom-in'
  }

  const onWheel = (event: WheelEvent) => {
    if (!(event.target as HTMLElement).closest('.ant-image-preview-img')) return
    event.stopImmediatePropagation()
    event.preventDefault()
    const currentZoom = state.zoom
    const nextZoom = clamp(currentZoom * (event.deltaY < 0 ? 1.16 : 1 / 1.16), 1, 8)
    const rect = wrap.getBoundingClientRect()
    const focusX = event.clientX - (rect.left + rect.width / 2)
    const focusY = event.clientY - (rect.top + rect.height / 2)
    const zoomRatio = nextZoom / currentZoom
    state.zoom = nextZoom
    if (nextZoom === 1) {
      state.panX = 0
      state.panY = 0
    } else {
      state.panX = focusX - (focusX - state.panX) * zoomRatio
      state.panY = focusY - (focusY - state.panY) * zoomRatio
    }
    apply()
  }

  const onContextMenu = (event: MouseEvent) => {
    if (state.zoom > 1) {
      event.stopImmediatePropagation()
      event.preventDefault()
    }
  }

  const onMouseDown = (event: MouseEvent) => {
    if (event.button !== 2 || state.zoom <= 1) return
    event.stopImmediatePropagation()
    event.preventDefault()
    const startX = event.clientX
    const startY = event.clientY
    const startPanX = state.panX
    const startPanY = state.panY
    img.style.cursor = 'grabbing'

    const onMouseMove = (moveEvent: MouseEvent) => {
      state.panX = startPanX + moveEvent.clientX - startX
      state.panY = startPanY + moveEvent.clientY - startY
      apply()
    }
    const onMouseUp = (upEvent: MouseEvent) => {
      if (upEvent.button !== 2) return
      img.style.cursor = state.zoom > 1 ? 'grab' : 'zoom-in'
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  wrap.addEventListener('wheel', onWheel, { passive: false, capture: true })
  wrap.addEventListener('contextmenu', onContextMenu, { capture: true })
  wrap.addEventListener('mousedown', onMouseDown, { capture: true })
  state.cleanup = () => {
    wrap.removeEventListener('wheel', onWheel, { capture: true })
    wrap.removeEventListener('contextmenu', onContextMenu, { capture: true })
    wrap.removeEventListener('mousedown', onMouseDown, { capture: true })
    img.style.transform = ''
    img.style.transformOrigin = ''
    img.style.transition = ''
    img.style.cursor = ''
  }
  previewZoomState = state
  apply()
}


export const openImageFullscreenPreview = (idx: number, root: HTMLElement) => {
  const el = root.querySelector(`.idx-${idx} .ant-image-img`) as HTMLImageElement | null
  if (el) {
    el.click()
  } else {
    console.log('openImageFullscreenPreview error: not found', idx, root);
  }
}
