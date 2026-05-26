<script setup lang="ts">
import DraggingPort from './DraggingPort.vue'
import TiktokViewer from './TiktokViewer.vue'
import { useImgSliStore } from '@/store/useImgSli'
import ImgSliSplitPane from './ImgSliComparePane.vue'
import { ref } from 'vue'

const sli = useImgSliStore()
const splitpane = ref<{ requestFullScreen (): void }>()
</script>
<template>
  <ADrawer width="100vw" v-model:visible="sli.drawerVisible" destroy-on-close class="img-sli" :close-icon="null">
    <ImgSliSplitPane ref="splitpane" container="drawer" v-if="sli.left && sli.right" :left="sli.left"
      :right="sli.right" />
    <template #footer>
      <div class="actions">
        <AButton @click="splitpane?.requestFullScreen()">{{ $t('fullscreenview') }}</AButton>
        <a-alert banner style="height: 32px;" :message="'👇 ' + $t('scrollDownToComparePrompt')" type="info" show-icon />
        <AButton @click="sli.drawerVisible = false">{{ $t('close') }}</AButton>
      </div>
    </template>
  </ADrawer>
  <DraggingPort />
  <TiktokViewer />
</template>


<style lang="scss" scoped>
.actions {
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
}
</style>
<style lang="scss">
.img-sli {

  .ant-drawer-header,
  .ant-drawer-body {
    padding: 0;
  }

  .default-theme {
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


    .splitpanes__pane {
      background: var(--zp-primary-background);
    }

  }
}
</style>
