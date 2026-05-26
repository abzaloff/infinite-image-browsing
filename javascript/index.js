/* eslint-disable no-undef */
Promise.resolve().then(async () => {
  /**
   * This is a file generated using `yarn build`.
   * If you want to make changes, please modify `index.tpl.js` and run the command to generate it again.
   */
  const iframeRuntimePatch = `
    <style>
      :root {
        --zp-black: #0B0F19 !important;
        --zp-grey96: #1F2937 !important;
        --zp-grey90: #1F2937 !important;
      }
      .img-sli .ant-drawer-footer .actions {
        justify-content: center !important;
        width: 100% !important;
      }
      .iib-compare-zoom-stage {
        overflow: hidden !important;
        cursor: zoom-in !important;
        touch-action: none !important;
      }
      .iib-compare-zoom-stage.is-panning {
        cursor: grabbing !important;
      }
      .iib-compare-zoom-content {
        height: 100% !important;
      }
      .iib-compare-zoom-stage .splitpanes__splitter {
        background: linear-gradient(to right, transparent 0 calc(50% - 0.5px), var(--zp-grey70) calc(50% - 0.5px) calc(50% + 0.5px), transparent calc(50% + 0.5px)) !important;
        border: 0 !important;
        box-shadow: none !important;
        width: 16px !important;
        min-width: 16px !important;
        margin-left: -7.5px !important;
        margin-right: -7.5px !important;
        cursor: col-resize !important;
        position: relative !important;
        z-index: 20 !important;
      }
      .iib-compare-zoom-stage .splitpanes__splitter::before {
        content: none !important;
        display: none !important;
      }
      .iib-compare-zoom-stage .splitpanes__splitter::after {
        content: none !important;
        display: none !important;
      }
      .iib-compare-zoom-stage .container .img,
      .iib-compare-zoom-stage img.img {
        height: 100%;
        max-width: none;
      }
    </style>
    <script>
      (() => {
        const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
        const compareStates = new WeakMap();
        const previewStates = new WeakMap();

        const findCompareStages = () => Array.from(document.querySelectorAll('.img-sli-container > div > .default-theme, .img-sli .default-theme'))
          .map(content => ({ content, stage: content.parentElement }))
          .filter(({ content, stage }) => stage && !content.classList.contains('img-sli-zoom-content') && !content.closest('.iib-compare-zoom-content'));

        const enhanceCompareStage = ({ content, stage }) => {
          if (compareStates.has(stage)) return;
          const state = { zoom: 1, panX: 0, panY: 0, panning: false, applying: false, scheduled: false, imageKey: '' };
          compareStates.set(stage, state);
          stage.classList.add('iib-compare-zoom-stage');
          content.classList.add('iib-compare-zoom-content');

          const lastTransforms = new WeakMap();
          const stripRuntimeTransform = transform => (transform || '').replace(/\\s+translate\\(-?\\d+(?:\\.\\d+)?px,\\s*-?\\d+(?:\\.\\d+)?px\\)\\s+scale\\(-?\\d+(?:\\.\\d+)?\\)\\s*$/, '');
          const getCompareImages = () => Array.from(content.querySelectorAll('.container .img, img.img'));
          const getImageKey = () => getCompareImages().map(img => img.currentSrc || img.src || '').join('|');
          const apply = () => {
            state.applying = true;
            state.imageKey = getImageKey();
            const limitX = Math.max(0, (stage.clientWidth * state.zoom - stage.clientWidth) / 2);
            const limitY = Math.max(0, (stage.clientHeight * state.zoom - stage.clientHeight) / 2);
            state.panX = clamp(state.panX, -limitX, limitX);
            state.panY = clamp(state.panY, -limitY, limitY);
            getCompareImages().forEach(img => {
              const baseTransform = stripRuntimeTransform(img.style.transform);
              const nextTransform = \`\${baseTransform} translate(\${state.panX}px, \${state.panY}px) scale(\${state.zoom})\`;
              img.style.transform = nextTransform;
              img.style.transformOrigin = '50% 50%';
              img.style.willChange = 'transform';
              lastTransforms.set(img, nextTransform);
            });
            queueMicrotask(() => { state.applying = false; });
          };
          const resetForCurrentImages = () => {
            state.zoom = 1;
            state.panX = 0;
            state.panY = 0;
            apply();
          };
          const scheduleApply = () => {
            if (state.zoom <= 1 || state.scheduled) return;
            state.scheduled = true;
            requestAnimationFrame(() => {
              state.scheduled = false;
              apply();
            });
          };
          new MutationObserver(mutations => {
            if (state.applying) return;
            const imageKey = getImageKey();
            if (imageKey && state.imageKey && imageKey !== state.imageKey) {
              resetForCurrentImages();
              return;
            }
            if (state.zoom <= 1) return;
            if (mutations.some(mutation => mutation.target instanceof HTMLImageElement && mutation.target.style.transform !== lastTransforms.get(mutation.target))) {
              scheduleApply();
            }
          }).observe(content, { subtree: true, childList: true, attributes: true, attributeFilter: ['style', 'src'] });
          apply();

          stage.addEventListener('wheel', event => {
            if (event.target.closest && event.target.closest('.splitpanes__splitter')) return;
            if (!event.target.closest || !event.target.closest('img.img')) return;
            event.preventDefault();
            const currentZoom = state.zoom;
            const nextZoom = clamp(currentZoom * (event.deltaY < 0 ? 1.16 : 1 / 1.16), 1, 8);
            const rect = stage.getBoundingClientRect();
            const focusX = event.clientX - (rect.left + rect.width / 2);
            const focusY = event.clientY - (rect.top + rect.height / 2);
            const zoomRatio = nextZoom / currentZoom;
            state.zoom = nextZoom;
            if (nextZoom === 1) {
              state.panX = 0;
              state.panY = 0;
            } else {
              state.panX = focusX - (focusX - state.panX) * zoomRatio;
              state.panY = focusY - (focusY - state.panY) * zoomRatio;
            }
            apply();
          }, { passive: false });

          stage.addEventListener('contextmenu', event => {
            if (state.zoom > 1) event.preventDefault();
          });

          stage.addEventListener('mousedown', event => {
            if (event.target.closest && event.target.closest('.splitpanes__splitter')) return;
            if (event.button !== 2 || state.zoom <= 1) return;
            event.preventDefault();
            const startX = event.clientX;
            const startY = event.clientY;
            const startPanX = state.panX;
            const startPanY = state.panY;
            stage.classList.add('is-panning');
            const onMove = moveEvent => {
              state.panX = startPanX + moveEvent.clientX - startX;
              state.panY = startPanY + moveEvent.clientY - startY;
              apply();
            };
            const onUp = upEvent => {
              if (upEvent.button !== 2) return;
              stage.classList.remove('is-panning');
              document.removeEventListener('mousemove', onMove);
              document.removeEventListener('mouseup', onUp);
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
          });

          stage.addEventListener('click', event => {
            if (
              event.button === 0 &&
              document.fullscreenElement === stage &&
              (!event.target.closest || (!event.target.closest('img.img') && !event.target.closest('.splitpanes__splitter')))
            ) {
              document.exitFullscreen();
            }
          });
        };

        const enhanceCompareStages = () => findCompareStages().forEach(enhanceCompareStage);

        const getVisiblePreviewWrap = target => {
          const wrap = target && target.closest && target.closest('.ant-image-preview-wrap');
          return wrap && wrap.style.display !== 'none' ? wrap : null;
        };

        const getPreviewState = wrap => {
          const img = wrap.querySelector('.ant-image-preview-img');
          if (!img) return null;
          let state = previewStates.get(wrap);
          if (state && state.img === img) return state;
          state = { img, zoom: 1, panX: 0, panY: 0 };
          previewStates.set(wrap, state);
          return state;
        };

        const applyPreview = (wrap, state) => {
          const { img } = state;
          const limitX = Math.max(0, (img.clientWidth * state.zoom - wrap.clientWidth) / 2);
          const limitY = Math.max(0, (img.clientHeight * state.zoom - wrap.clientHeight) / 2);
          state.panX = clamp(state.panX, -limitX, limitX);
          state.panY = clamp(state.panY, -limitY, limitY);
          img.style.transform = \`translate(\${state.panX}px, \${state.panY}px) scale(\${state.zoom})\`;
          img.style.transformOrigin = '50% 50%';
          img.style.transition = 'transform 0.06s linear';
          img.style.cursor = state.zoom > 1 ? 'grab' : 'zoom-in';
        };

        document.addEventListener('wheel', event => {
          const wrap = getVisiblePreviewWrap(event.target);
          if (!wrap) return;
          if (!event.target.closest || !event.target.closest('.ant-image-preview-img')) return;
          const state = getPreviewState(wrap);
          if (!state) return;
          event.stopImmediatePropagation();
          event.preventDefault();
          const currentZoom = state.zoom;
          const nextZoom = clamp(currentZoom * (event.deltaY < 0 ? 1.16 : 1 / 1.16), 1, 8);
          const rect = wrap.getBoundingClientRect();
          const focusX = event.clientX - (rect.left + rect.width / 2);
          const focusY = event.clientY - (rect.top + rect.height / 2);
          const zoomRatio = nextZoom / currentZoom;
          state.zoom = nextZoom;
          if (nextZoom === 1) {
            state.panX = 0;
            state.panY = 0;
          } else {
            state.panX = focusX - (focusX - state.panX) * zoomRatio;
            state.panY = focusY - (focusY - state.panY) * zoomRatio;
          }
          applyPreview(wrap, state);
        }, { passive: false, capture: true });

        document.addEventListener('contextmenu', event => {
          const wrap = getVisiblePreviewWrap(event.target);
          const state = wrap && previewStates.get(wrap);
          if (state && state.zoom > 1) {
            event.stopImmediatePropagation();
            event.preventDefault();
          }
        }, true);

        document.addEventListener('mousedown', event => {
          const wrap = getVisiblePreviewWrap(event.target);
          const state = wrap && getPreviewState(wrap);
          if (!wrap || !state || event.button !== 2 || state.zoom <= 1) return;
          event.stopImmediatePropagation();
          event.preventDefault();
          const startX = event.clientX;
          const startY = event.clientY;
          const startPanX = state.panX;
          const startPanY = state.panY;
          state.img.style.cursor = 'grabbing';
          const onMove = moveEvent => {
            state.panX = startPanX + moveEvent.clientX - startX;
            state.panY = startPanY + moveEvent.clientY - startY;
            applyPreview(wrap, state);
          };
          const onUp = upEvent => {
            if (upEvent.button !== 2) return;
            state.img.style.cursor = state.zoom > 1 ? 'grab' : 'zoom-in';
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
          };
          document.addEventListener('mousemove', onMove);
          document.addEventListener('mouseup', onUp);
        }, true);

        new MutationObserver(enhanceCompareStages).observe(document.documentElement, { childList: true, subtree: true });
        document.addEventListener('DOMContentLoaded', enhanceCompareStages);
        enhanceCompareStages();
      })();
    <\/script>
  `
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Expires" content="0" />
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Infinite Image Browsing</title>
    <script type="module" crossorigin src="/infinite_image_browsing/fe-static/assets/index-b01f57e3.js"></script>
    <link rel="stylesheet" href="/infinite_image_browsing/fe-static/assets/index-882e7f3d.css">
  </head>

  <body>
    <div id="zanllp_dev_gradio_fe">
      It seems to have failed to load. You can try refreshing the page. <br> If that doesn't work, click on <a href="https://github.com/zanllp/sd-webui-infinite-image-browsing/issues/90" target="_blank" >FAQ</a> for help</div>
    </div>
    
  </body>
</html>
`
    .replace(/<\/body>/, `${iframeRuntimePatch}</body>`)
    .replace(/\/infinite_image_browsing/g, (window.location.pathname + '/infinite_image_browsing').replace(/\/\//g, '/'))
  let containerSelector = '#infinite_image_browsing_container_wrapper'
  let shouldMaximize = localStorage.getItem('iib://disable_maximize') !== 'true'

  try {
    containerSelector = __iib_root_container__
    shouldMaximize = __iib_should_maximize__
  } catch (e) { /* empty */ }

  const delay = (timeout = 0) => new Promise((resolve) => setTimeout(resolve, timeout))
  const asyncCheck = async (getter, checkSize = 100, timeout = 1000) => {
    let target = getter()
    let num = 0
    while (checkSize * num < timeout && (target === undefined || target === null)) {
      await delay(checkSize)
      target = getter()
      num++
    }
    return target
  }
  
  const getTabIdxById = (id) => {
    const tabList = gradioApp().querySelectorAll('#tabs > .tabitem[id^=tab_]')
    return Array.from(tabList).findIndex((v) => v.id.includes(id))
  }

  const switch2targetTab = (idx) => {
    try {
      gradioApp().querySelector('#tabs').querySelectorAll('button')[idx].click()
    } catch (error) {
      console.error(error)
    }
  }

  const isLobe = () => {
    try {
      return !!gradioApp().querySelector('[alt*="lobehub"]')
    } catch (error) {
      return false
    }
  }

  /**
   * @type {HTMLDivElement}
   */
  const wrap = await asyncCheck(() => gradioApp().querySelector(containerSelector), 500, Infinity)
  wrap.childNodes.forEach((v) => wrap.removeChild(v))
  const iframe = document.createElement('iframe')
  iframe.srcdoc = html
  iframe.style = 'width: 100%;height:100vh'
  wrap.appendChild(iframe)

  if (shouldMaximize) {
    onUiTabChange(() => {
      const el = get_uiCurrentTabContent()
      if (el?.id.includes('infinite-image-browsing')) {
        try {
          const iibTop = gradioApp().querySelector('#iib_top')
          if (!iibTop) {
            throw new Error('element \'#iib_top\' is not found')
          }
          const topRect = iibTop.getBoundingClientRect()
          wrap.style = `
            top:${Math.max(isLobe() ? 32 : 128, topRect.top) - 10}px;
            position: fixed;
            left: 10px;
            right: 10px;
            z-index: 100;
            width: unset;
            bottom: 10px;`
          iframe.style = 'width: 100%;height:100%'
        } catch (error) {
          console.error('Error mounting IIB. Running fallback.', error)
          wrap.style = ''
          iframe.style = 'width: 100%;height:100vh'
        }
      }
    })
  }

  const IIB_container_id = [Date.now(), Math.random()].join()
  window.IIB_container_id = IIB_container_id
  const imgTransferBus = new BroadcastChannel('iib-image-transfer-bus')
  imgTransferBus.addEventListener('message', async (ev) => {
    const data = ev.data
    if (
      typeof data !== 'object' ||
      (typeof data.IIB_container_id === 'string' && data.IIB_container_id !== IIB_container_id)
    ) {
      return
    }
    console.log('iib-message:', data)
    const appDoc = gradioApp()
    switch (data.event) {
      case 'click_hidden_button': {
        const btn = gradioApp().querySelector(`#${data.btnEleId}`)
        btn.click()
        break
      }
      case 'send_to_control_net': {
        data.type === 'img2img' ? window.switch_to_img2img() : window.switch_to_txt2img()
        await delay(100)
        const cn = appDoc.querySelector(`#${data.type}_controlnet`)
        const wrap = cn.querySelector('.label-wrap')
        if (!wrap.className.includes('open')) {
          wrap.click()
          await delay(100)
        }
        wrap.scrollIntoView()
        wrap.dispatchEvent(await createPasteEvent(data.url))
        break
      }
      case 'send_to_outpaint': {
        switch2targetTab(getTabIdxById('openOutpaint'))
        await delay(100)
        const iframe = appDoc.querySelector('#openoutpaint-iframe')
        openoutpaint_send_image(await imgUrl2DataUrl(data.url))
        iframe.contentWindow.postMessage({
          key: appDoc.querySelector('#openoutpaint-key').value,
          type: 'openoutpaint/set-prompt',
          prompt: data.prompt,
          negPrompt: data.negPrompt
        })
        break
      }
    }

    function imgUrl2DataUrl(imgUrl) {
      return new Promise((resolve, reject) => {
        fetch(imgUrl)
          .then((response) => response.blob())
          .then((blob) => {
            const reader = new FileReader()
            reader.readAsDataURL(blob)
            reader.onloadend = function () {
              const dataURL = reader.result
              resolve(dataURL)
            }
          })
          .catch((error) => reject(error))
      })
    }

    async function createPasteEvent(imgUrl) {
      const response = await fetch(imgUrl)
      const imageBlob = await response.blob()
      const imageFile = new File([imageBlob], 'image.jpg', {
        type: imageBlob.type,
        lastModified: Date.now()
      })
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(imageFile)
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: dataTransfer,
        bubbles: true
      })
      return pasteEvent
    }
  })
})
