<template>
  <div
    class="editContainer"
    @dragenter.stop.prevent="onDragenter"
    @dragleave.stop.prevent
    @dragover.stop.prevent
    @drop.stop.prevent
  >
    <div
      class="mindMapContainer"
      id="mindMapContainer"
      ref="mindMapContainer"
    ></div>
    <Count :mindMap="mindMap" v-if="!isZenMode"></Count>
    <Navigator v-if="mindMap" :mindMap="mindMap"></Navigator>
    <NavigatorToolbar :mindMap="mindMap" v-if="!isZenMode"></NavigatorToolbar>
    <OutlineSidebar :mindMap="mindMap"></OutlineSidebar>
    <Style v-if="!isZenMode"></Style>
    <BaseStyle :data="mindMapData" :mindMap="mindMap"></BaseStyle>
    <Theme v-if="mindMap" :mindMap="mindMap"></Theme>
    <Structure :mindMap="mindMap"></Structure>
    <ShortcutKey></ShortcutKey>
    <Contextmenu v-if="mindMap" :mindMap="mindMap"></Contextmenu>
    <RichTextToolbar v-if="mindMap" :mindMap="mindMap"></RichTextToolbar>
    <NodeNoteContentShow
      v-if="mindMap"
      :mindMap="mindMap"
    ></NodeNoteContentShow>
    <NodeAttachment v-if="mindMap" :mindMap="mindMap"></NodeAttachment>
    <NodeImgPreview v-if="mindMap" :mindMap="mindMap"></NodeImgPreview>
    <SidebarTrigger v-if="!isZenMode"></SidebarTrigger>
    <Search v-if="mindMap" :mindMap="mindMap"></Search>
    <NodeIconSidebar v-if="mindMap" :mindMap="mindMap"></NodeIconSidebar>
    <NodeIconToolbar v-if="mindMap" :mindMap="mindMap"></NodeIconToolbar>
    <OutlineEdit v-if="mindMap" :mindMap="mindMap"></OutlineEdit>
    <Scrollbar v-if="isShowScrollbar && mindMap" :mindMap="mindMap"></Scrollbar>
    <FormulaSidebar v-if="mindMap" :mindMap="mindMap"></FormulaSidebar>
    <SourceCodeEdit v-if="mindMap" :mindMap="mindMap"></SourceCodeEdit>
    <NodeOuterFrame v-if="mindMap" :mindMap="mindMap"></NodeOuterFrame>
    <div
      class="dragMask"
      v-if="showDragMask"
      @dragleave.stop.prevent="onDragleave"
      @dragover.stop.prevent
      @drop.stop.prevent="onDrop"
    >
      <div class="dragTip">{{ $t('edit.dragTip') }}</div>
    </div>
  </div>
</template>

<script>
import * as diff from 'deep-diff';
import MindMap from 'simple-mind-map'
import MiniMap from 'simple-mind-map/src/plugins/MiniMap.js'
import Watermark from 'simple-mind-map/src/plugins/Watermark.js'
import KeyboardNavigation from 'simple-mind-map/src/plugins/KeyboardNavigation.js'
import ExportPDF from 'simple-mind-map/src/plugins/ExportPDF.js'
import ExportXMind from 'simple-mind-map/src/plugins/ExportXMind.js'
import Export from 'simple-mind-map/src/plugins/Export.js'
import Drag from 'simple-mind-map/src/plugins/Drag.js'
import Select from 'simple-mind-map/src/plugins/Select.js'
import RichText from 'simple-mind-map/src/plugins/RichText.js'
import AssociativeLine from 'simple-mind-map/src/plugins/AssociativeLine.js'
import TouchEvent from 'simple-mind-map/src/plugins/TouchEvent.js'
import NodeImgAdjust from 'simple-mind-map/src/plugins/NodeImgAdjust.js'
import SearchPlugin from 'simple-mind-map/src/plugins/Search.js'
import Painter from 'simple-mind-map/src/plugins/Painter.js'
import ScrollbarPlugin from 'simple-mind-map/src/plugins/Scrollbar.js'
import Formula from 'simple-mind-map/src/plugins/Formula.js'
import RainbowLines from 'simple-mind-map/src/plugins/RainbowLines.js'
import Demonstrate from 'simple-mind-map/src/plugins/Demonstrate.js'
import OuterFrame from 'simple-mind-map/src/plugins/OuterFrame.js'
import { loadImage } from 'simple-mind-map/src/utils'
// 协同编辑插件
// import Cooperate from 'simple-mind-map/src/plugins/Cooperate.js'
// 手绘风格插件，该插件为付费插件，详情请查看开发文档
// import HandDrawnLikeStyle from 'simple-mind-map-plugin-handdrawnlikestyle'
// 标记插件，该插件为付费插件，详情请查看开发文档
// import Notation from 'simple-mind-map-plugin-notation'
import OutlineSidebar from './OutlineSidebar'
import Style from './Style'
import BaseStyle from './BaseStyle'
import Theme from './Theme'
import Structure from './Structure'
import Count from './Count'
import NavigatorToolbar from './NavigatorToolbar'
import ShortcutKey from './ShortcutKey'
import Contextmenu from './Contextmenu'
import RichTextToolbar from './RichTextToolbar'
import NodeNoteContentShow from './NodeNoteContentShow.vue'
import Navigator from './Navigator.vue'
import NodeImgPreview from './NodeImgPreview.vue'
import SidebarTrigger from './SidebarTrigger.vue'
import { mapState, mapActions, mapMutations } from 'vuex'
import icon from '@/config/icon'
import customThemeList from '@/customThemes'
import Search from './Search.vue'
import NodeIconSidebar from './NodeIconSidebar.vue'
import NodeIconToolbar from './NodeIconToolbar.vue'
import OutlineEdit from './OutlineEdit.vue'
import { showLoading, hideLoading } from '@/utils/loading'
import handleClipboardText from '@/utils/handleClipboardText'
import Scrollbar from './Scrollbar.vue'
import FormulaSidebar from './FormulaSidebar.vue'
import SourceCodeEdit from './SourceCodeEdit.vue'
import NodeAttachment from './NodeAttachment.vue'
import NodeOuterFrame from './NodeOuterFrame.vue'
import * as api from '@/api'
// 添加缺失的导入
// import { Notation } from 'simple-mind-map/src/plugins/Notation'
// import { HandDrawnLikeStyle } from 'simple-mind-map/src/plugins/HandDrawnLikeStyle'


// 注册插件
MindMap.usePlugin(MiniMap)
  .usePlugin(Watermark)
  .usePlugin(Drag)  // node拖拽插件
  .usePlugin(KeyboardNavigation)
  .usePlugin(ExportPDF)
  .usePlugin(ExportXMind)
  .usePlugin(Export)
  .usePlugin(Select)
  .usePlugin(AssociativeLine)
  .usePlugin(NodeImgAdjust)
  .usePlugin(TouchEvent)
  .usePlugin(SearchPlugin)
  .usePlugin(Painter)
  .usePlugin(Formula)
  .usePlugin(RainbowLines)
  .usePlugin(Demonstrate)
  .usePlugin(OuterFrame)

// 注册自定义主题
customThemeList.forEach(item => {
  MindMap.defineTheme(item.value, item.theme)
})

/**
 * @Author: 王林
 * @Date: 2021-06-24 22:56:17
 * @Desc: 编辑区域
 */
export default {
  name: 'Edit',
  components: {
    OutlineSidebar,
    Style,
    BaseStyle,
    Theme,
    Structure,
    Count,
    NavigatorToolbar,
    ShortcutKey,
    Contextmenu,
    RichTextToolbar,
    NodeNoteContentShow,
    Navigator,
    NodeImgPreview,
    SidebarTrigger,
    Search,
    NodeIconSidebar,
    NodeIconToolbar,
    OutlineEdit,
    Scrollbar,
    FormulaSidebar,
    SourceCodeEdit,
    NodeAttachment,
    NodeOuterFrame
  },
  data() {
    return {
      enableShowLoading: true,
      mindMap: null,
      mindMapData: null,
      prevImg: '',
      autoSaveTimer: null,
      storeConfigTimer: null,
      showDragMask: false,
      isFirst: false,

    }
  },
  computed: {
    ...mapState({
      isZenMode: state => state.localConfig.isZenMode,
      openNodeRichText: state => state.localConfig.openNodeRichText,
      isShowScrollbar: state => state.localConfig.isShowScrollbar,
      useLeftKeySelectionRightKeyDrag: state =>
        state.localConfig.useLeftKeySelectionRightKeyDrag,
      isUseHandDrawnLikeStyle: state =>
        state.localConfig.isUseHandDrawnLikeStyle,
      extraTextOnExport: state => state.extraTextOnExport,
      userInfo: state => state.userInfo

    })
  },
  watch: {

    openNodeRichText() {
      if (this.openNodeRichText) {
        this.addRichTextPlugin()
      } else {
        this.removeRichTextPlugin()
      }
    },
    isShowScrollbar() {
      if (this.isShowScrollbar) {
        this.addScrollbarPlugin()
      } else {
        this.removeScrollbarPlugin()
      }
    },
    isUseHandDrawnLikeStyle() {
      if (this.isUseHandDrawnLikeStyle) {
        this.addHandDrawnLikeStylePlugin()
      } else {
        this.removeHandDrawnLikeStylePlugin()
      }
    }
  },
  async mounted() {

    try {
      showLoading()
      
      // 确保用户信息已加载
      if (!this.userInfo) {
        await this.getUserInfo()
      }
      
      const { content } = await this.getUserMindMapData(this.$route.params.id)
      this.mindMapData = content
      this.init()
      
      // 绑定事件监听器
      this.bindEventListeners()
      
    } catch (error) {
      console.error('初始化失败:', error)
      hideLoading()
    }

    // try {
    //   showLoading()
    //   const { content } = await this.getUserMindMapData(this.$route.params.id)
    //   this.mindMapData = content
    //   this.init()
    //   this.$bus.$on('execCommand', this.execCommand)
    //   this.$bus.$on('paddingChange', this.onPaddingChange)
    //   this.$bus.$on('export', this.export)
    //   this.$bus.$on('setData', this.setData)
    //   this.$bus.$on('startTextEdit', this.handleStartTextEdit)
    //   this.$bus.$on('endTextEdit', this.handleEndTextEdit)
    //   this.$bus.$on('createAssociativeLine', this.handleCreateLineFromActiveNode)
    //   this.$bus.$on('startPainter', this.handleStartPainter)
    //   this.$bus.$on('node_tree_render_end', this.handleHideLoading)
    //   this.$bus.$on('showLoading', this.handleShowLoading)
    //   this.$bus.$on('manualSave', this.manualSave)
    //   this.$bus.$on('saveCover', this.saveCover)
    //   window.addEventListener('resize', this.handleResize)
    // } catch (error) {
    //   console.log(error)
    // }
  },
  // beforeDestroy() {
  //   this.$bus.$off('execCommand', this.execCommand)
  //   this.$bus.$off('paddingChange', this.onPaddingChange)
  //   this.$bus.$off('export', this.export)
  //   this.$bus.$off('setData', this.setData)
  //   this.$bus.$off('startTextEdit', this.handleStartTextEdit)
  //   this.$bus.$off('endTextEdit', this.handleEndTextEdit)
  //   this.$bus.$off('createAssociativeLine', this.handleCreateLineFromActiveNode)
  //   this.$bus.$off('startPainter', this.handleStartPainter)
  //   this.$bus.$off('node_tree_render_end', this.handleHideLoading)
  //   this.$bus.$off('showLoading', this.handleShowLoading)
  //   this.$bus.$off('manualSave', this.manualSave)
  //   this.$bus.$off('saveCover', this.saveCover)
  //   window.removeEventListener('resize', this.handleResize)
  //   if (this.mindMap) this.mindMap.destroy()
  // },
  methods: {
        // 提取事件绑定逻辑
    bindEventListeners() {
      // 先解绑，避免重复绑定
      this.unbindEventListeners()
      
      // 绑定 Bus 事件
      this.$bus.$on('execCommand', this.execCommand)
      this.$bus.$on('paddingChange', this.onPaddingChange)
      this.$bus.$on('export', this.export)
      this.$bus.$on('setData', this.setData)
      this.$bus.$on('startTextEdit', this.handleStartTextEdit)
      this.$bus.$on('endTextEdit', this.handleEndTextEdit)
      this.$bus.$on('createAssociativeLine', this.handleCreateLineFromActiveNode)
      this.$bus.$on('startPainter', this.handleStartPainter)
      this.$bus.$on('node_tree_render_end', this.handleHideLoading)
      this.$bus.$on('showLoading', this.handleShowLoading)
      this.$bus.$on('manualSave', this.manualSave)
      this.$bus.$on('saveCover', this.saveCover)
      
      // 绑定窗口事件
      window.addEventListener('resize', this.handleResize)
    },

        // 解绑事件监听器
    unbindEventListeners() {
      this.$bus.$off('execCommand', this.execCommand)
      this.$bus.$off('paddingChange', this.onPaddingChange)
      this.$bus.$off('export', this.export)
      this.$bus.$off('setData', this.setData)
      this.$bus.$off('startTextEdit', this.handleStartTextEdit)
      this.$bus.$off('endTextEdit', this.handleEndTextEdit)
      this.$bus.$off('createAssociativeLine', this.handleCreateLineFromActiveNode)
      this.$bus.$off('startPainter', this.handleStartPainter)
      this.$bus.$off('node_tree_render_end', this.handleHideLoading)
      this.$bus.$off('showLoading', this.handleShowLoading)
      this.$bus.$off('manualSave', this.manualSave)
      this.$bus.$off('saveCover', this.saveCover)
      
      window.removeEventListener('resize', this.handleResize)
    },
    

    ...mapMutations(['setAutoSaveStatus']),



    ...mapActions([
      'getUserMindMapData',
      'storeData',
      'storeConfig',
      'getUserInfo',
      'storeFileInfo'
    ]),

    handleStartTextEdit() {
      this.mindMap.renderer.startTextEdit()
    },

    handleEndTextEdit() {
      this.mindMap.renderer.endTextEdit()
    },

    handleCreateLineFromActiveNode() {
      this.mindMap.associativeLine.createLineFromActiveNode()
    },

    handleStartPainter() {
      this.mindMap.painter.startPainter()
    },

    handleResize() {
      this.mindMap.resize()
    },

    // 显示loading
    handleShowLoading() {
      this.enableShowLoading = true
      showLoading()
    },

    // 渲染结束后关闭loading
    handleHideLoading() {
      if (this.enableShowLoading) {
        this.enableShowLoading = false
        hideLoading()
      }
    },

    

    /**
     * @Author: 王林
     * @Date: 2021-08-01 10:19:07
     * @Desc: 存储数据当数据有变时
     */
    // bindSaveEvent() {
    //   this.$bus.$on('data_change', data => {
    //     if (!this.isFirst) {
    //       this.setAutoSaveStatus('wait')
    //       clearTimeout(this.autoSaveTimer)
    //       this.autoSaveTimer = setTimeout(() => {
    //         this.storeData(data)
    //       }, 3000)
    //     } else {
    //       this.isFirst = false
    //     }
    //   })
    //   this.$bus.$on('view_data_change', data => {
    //     this.setAutoSaveStatus('wait')
    //     clearTimeout(this.storeConfigTimer)
    //     this.storeConfigTimer = setTimeout(() => {
    //       this.storeConfig({
    //         view: data
    //       })
    //     }, 3000)
    //   })
    // },

    /**
     * @Author: 王林
     * @Date: 2021-08-02 23:19:52
     * @Desc: 手动保存
     */
    manualSave() {
      this.storeConfig(this.mindMap.getData(true))
    },

    // 生成封面
    async saveCover() {
      try {
        const res = await this.mindMap.export('png', false)
        const { data } = await api.uploadImg({
          imgData: res
        })
        this.storeFileInfo({
          img: data
        })
      } catch (error) {
        console.log(error)
      }
    },

    async showNodeTooltip(node, e) {
      // console.log('showNodeTooltip', node, e)
      const nodeData = node.getData()

      // 获取节点信息
      const policeNumber = nodeData._creator || nodeData.creator
      const updatedAt = nodeData._updatedAt || nodeData.updated_at
      const isSystemDefault = nodeData._isSystemDefault || nodeData.is_system_default

      // 格式化时间
      const formatTime = (timeStr) => {
        if (!timeStr) return '未知时间'
        try {
          const date = new Date(timeStr)
          return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
        } catch {
          return '未知时间'
        }
      }
        // 获取用户信息
      let userName = nodeData._creator || nodeData.creator || '未知用户'
      let userUnit = nodeData._creatorUnit || '未知单位'


      // 创建提示框内容
      let tooltipContent = `<div class="node-tooltip">
        <div class="tooltip-item">
          <span class="tooltip-label">创建者:</span>
          <span class="tooltip-value">${userName}</span>
        </div>
        <div class="tooltip-item">
          <span class="tooltip-label">单位:</span>
          <span class="tooltip-value">${userUnit}</span>
        </div>`

      if (updatedAt) {
        tooltipContent += `
        <div class="tooltip-item">
          <span class="tooltip-label">更新时间:</span>
          <span class="tooltip-value">${formatTime(updatedAt)}</span>
        </div>`
      }

      tooltipContent += '</div>'

      // 创建或更新提示框元素
      let tooltip = document.getElementById('node-tooltip')
      if (!tooltip) {
        tooltip = document.createElement('div')
        tooltip.id = 'node-tooltip'
        document.body.appendChild(tooltip)
      }

      tooltip.innerHTML = tooltipContent
      tooltip.style.display = 'block'

      // 定位提示框 - 让提示框更靠近鼠标
      const x = e.clientX + 5  // 向右偏移5px
      const y = e.clientY - 5  // 向上偏移5px

      tooltip.style.left = x + 'px'
      tooltip.style.top = y + 'px'

      // 检查边界，防止提示框超出屏幕
      const tooltipRect = tooltip.getBoundingClientRect()
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight

      // 如果超出右边界，向左显示
      if (tooltipRect.right > screenWidth) {
        tooltip.style.left = (e.clientX - tooltipRect.width - 5) + 'px'
      }

      // 如果超出下边界，向上显示
      if (tooltipRect.bottom > screenHeight) {
        tooltip.style.top = (e.clientY - tooltipRect.height - 5) + 'px'
      }
    },
    // 隐藏节点悬浮提示
    hideNodeTooltip() {
      const tooltip = document.getElementById('node-tooltip')
      if (tooltip) {
        tooltip.style.display = 'none'
      }
    },

    async handleNodePasteImg(val) {
      try {
        console.log('handleNodePasteImg', val)
        
        // 获取当前激活的节点
        const activeNodes = this.mindMap.renderer.activeNodeList
        console.log('当前激活的节点:', activeNodes)
  
        const nodeData = activeNodes[0].getData()
        
        // 如果有激活节点，可以进行权限检查
        if (activeNodes && activeNodes.length === 1) {
          
          
          // 检查是否有权限编辑此节点
          if (nodeData._isSystemDefault || nodeData.is_system_default) {
            this.$message.warning('系统默认节点不能添加图片')
            return val
          } else if (nodeData._creatorPoliceNumber && 
              nodeData._creatorPoliceNumber !== this.userInfo?.police_number) {
            this.$message.warning('您没有权限在此节点添加图片')
            return val
          }
        }
        else if (activeNodes && activeNodes.length > 1) {
          this.$message.warning('请先选择一个节点进行图片上传')
          return val
        }
        
        const res = await loadImage(val)
        const { data } = await api.uploadImg({
          imgData: res.url,
          node_uid:nodeData.uid
        })
        
        return { url: data, size: res.size }
      } catch (error) {
        console.error('图片处理失败:', error)
        this.$message.error('图片上传失败')
        return val
      }
    },





    /**
     * @Author: 王林
     * @Date: 2021-04-10 15:01:01
     * @Desc: 初始化
     */
    init() {
      let { root, layout, theme, view, config } = this.mindMapData
      this.mindMap = new MindMap({
        el: this.$refs.mindMapContainer,
        data: root,
        fit: false,
        layout: layout,
        theme: theme.template,
        themeConfig: theme.config,
        viewData: view,
        nodeTextEditZIndex: 1000,
        nodeNoteTooltipZIndex: 1000,
        customNoteContentShow: {
          show: (content, left, top, node) => {
            this.$bus.$emit('showNoteContent', content, left, top, node)
          },
          hide: () => {
            // this.$bus.$emit('hideNoteContent')
          }
        },
        ...(config || {}),
        iconList: [...icon],
        useLeftKeySelectionRightKeyDrag: this.useLeftKeySelectionRightKeyDrag,
        customInnerElsAppendTo: null,
        enableAutoEnterTextEditWhenKeydown: true,
        customHandleClipboardText: handleClipboardText,
        defaultNodeImage: require('../../../assets/img/图片加载失败.svg'),
        initRootNodePosition: ['center', 'center'],
        beforeTextEdit: (node) => {
          // 检查是否允许编辑节点
          // 只读权限只能查看，不能编辑
          // 如果当前用户没有编辑权限，阻止编辑
          if(node.nodeData.data._creator===undefined) {
          // 添加自定义字段，创建者姓名，创建者警号，创建者单位，更新时间
            node.nodeData.data._creator = this.userInfo?.userName || '未知用户'
            node.nodeData.data._creatorPoliceNumber = this.userInfo?.police_number 
            node.nodeData.data._creatorUnit = this.userInfo?.department_display
            node.nodeData.data._creatorPhoneNo = this.userInfo?.phone_number
            node.nodeData.data._updatedAt = new Date().toISOString()
            node.nodeData.data._synced = false // 标记为未同步
            node.nodeData.data._isSystemDefault=false// 标记为非系统默认节点

            return true 
          }
          console.log('beforeTextEdit@@@@@', this.userInfo)

          if (node.getData()._isSystemDefault || node.getData().is_system_default) {
            this.$message.warning('系统默认节点不能编辑')
            return false // 阻止编辑
          }
          else if (node.getData()._creator || node.getData().creator) {
            // 如果是当前用户创建的节点，允许编辑
            if (node.getData()._creatorPoliceNumber === this.userInfo?.police_number) {
              return true // 允许编辑
            }
            // 否则，阻止编辑
            this.$message.warning('init()您只能编辑自己创建的节点')
            return false
          }
          else
            return true // 允许编辑
        },
      //   beforeShortcutRun: (key, activeNodeList) => {
      //   // 处理快捷键事件,对执行事件无效
      //   for (const node of activeNodeList) {
      //     if (key === "Del" || key === "Backspace") {
      //       if (activeNodeList.length > 1) {
      //         this.$message.warning('请先删除子节点')
      //         return true; // 阻止删除
      //       }
      //       else if (node.nodeData.children && node.nodeData.children.length > 0) {
      //         this.$message.warning('请先删除子节点')
      //         return true; // 阻止删除
      //       }
      //       else if (node.nodeData.data && node.nodeData.data._isSystemDefault || node.nodeData.is_system_default) {
      //         this.$message.warning('系统默认节点不能删除')
      //         return true; // 阻止删除
      //       }
      //       else if (node.nodeData.data._creator || node.nodeData.data.creator) {
      //         // 如果是当前用户创建的节点，允许删除
      //         if (node.nodeData.data._creatorPoliceNumber === authStore.user?.police_number) {
      //           return false // 允许删除
      //         }
      //         // 否则，阻止删除
      //         this.$message.warning('您只能删除自己创建的节点')
      //         return true
      //       }
      //     }
      //     else if (key === "Control+x") {
      //       if (activeNodeList.length > 1) {
      //         this.$message.warning('不能剪切多个节点')
      //         return true; // 阻止删除
      //       }
      //       else if (node.nodeData.children && node.nodeData.children.length > 0) {
      //         this.$message.warning('请先剪切子节点')
      //         return true; // 阻止剪切
      //       }
      //       else if (node.nodeData.data._isSystemDefault || node.nodeData.data.is_system_default) {
      //         this.$message.warning('系统默认节点不能剪切')
      //         return true; // 阻止剪切
      //       }
      //       else if (node.nodeData.data._creator || node.nodeData.data.creator) {
      //         // 如果是当前用户创建的节点，允许剪切
      //         if (node.nodeData.data._creator === authStore.user?.police_number) {
      //           return false // 允许剪切
      //         }
      //         // 否则，阻止剪切
      //         this.$message.warning('您只能剪切自己创建的节点')
      //         return true
      //       }
      //     }
      //     else if (key === "Control+c" || key === "Cmd+c" || key === "Meta+c") {
      //       // 允许复制操作
      //       return false; // 允许复制
      //     }
      //     else if (key === "Control+v" || key === "Cmd+v" || key === "Meta+v") {
      //       // 允许粘贴操作
      //       this.$message.warning('粘贴节点功能在开发中')
      //       return true; // 允许粘贴
      //     }
      //     else if (key === "Control+a" || key === "Cmd+a" || key === "Meta+a") {
      //       // 允许全选操作
      //       return false; // 允许全选
      //     }
      //     else if (key === "Control+z" || key === "Cmd+z" || key === "Meta+z") {
      //       // 允许撤销操作
      //       return false; // 允许撤销
      //     }
      //     else if (key === "Control+y" || key === "Cmd+y" || key === "Meta+y") {
      //       // 允许重做操作
      //       return false; // 允许重做
      //     }
      //   }

      //   // console.log('快捷键触发:', key, activeNodeList)
      //   // console.log(typeof (key))
      //   // if (key === "Del" || key === "Backspace") {
      //   //   console.log('删除节点:', activeNodeList)
      //   //   return true;
      //   // }
      //   // if (key === "Control+x") {

      //   // }

      // },
        handleIsSplitByWrapOnPasteCreateNewNode: () => {
          return this.$confirm(
            this.$t('edit.splitByWrap'),
            this.$t('edit.tip'),
            {
              confirmButtonText: this.$t('edit.yes'),
              cancelButtonText: this.$t('edit.no'),
              type: 'warning'
            }
          )
        },
        errorHandler: (code, err) => {
          console.error(err)
          switch (code) {
            case 'export_error':
              this.$message.error(this.$t('edit.exportError'))
              break
            default:
              break
          }
        },
        addContentToFooter: () => {
          const text = this.extraTextOnExport.trim()
          if (!text) return null
          const el = document.createElement('div')
          el.className = 'footer'
          el.innerHTML = text
          const cssText = `
            .footer {
              width: 100%;
              height: 30px;
              display: flex;
              justify-content: center;
              align-items: center;
              font-size: 12px;
              color: #979797;
            }
          `
          return {
            el,
            cssText,
            height: 30
          }
        },
        handleNodePasteImg: this.handleNodePasteImg
      })
      // 修复事件监听器重复绑定
      if (this.mindMap) {
        this.mindMap.off('data_change_detail')
        this.mindMap.off('node_mouseenter')
        this.mindMap.off('node_mouseleave')
      }
      
      this.mindMap.on('data_change_detail', async (arr) => {
        console.log('data_change_detail', arr)
        
        // 添加防抖处理
        if (this.dataChangeTimer) {
          clearTimeout(this.dataChangeTimer)
        }
        
        this.dataChangeTimer = setTimeout(() => {
          this.handleDataChange(arr)
        }, 100)
      })
        

      
      this.mindMap.on('node_mouseenter', async (node, e) => {
        await this.showNodeTooltip(node, e)
      })
      
      this.mindMap.on('node_mouseleave', () => {
        this.hideNodeTooltip()
      })
      if (this.openNodeRichText) this.addRichTextPlugin()
      if (this.isShowScrollbar) this.addScrollbarPlugin()
      if (this.isUseHandDrawnLikeStyle) this.addHandDrawnLikeStylePlugin()
      if (typeof HandDrawnLikeStyle !== 'undefined') {
        this.$store.commit('setSupportHandDrawnLikeStyle', true)
      }
      if (typeof Notation !== 'undefined') {
        this.mindMap.addPlugin(Notation)
        this.$store.commit('setSupportMark', true)
      }
      this.mindMap.keyCommand.addShortcut('Control+s', () => {
        this.manualSave()
      })
      // 转发事件
      ;[
        'node_active',
        'data_change',
        'view_data_change',
        'back_forward',
        'node_contextmenu',
        'node_click',
        'draw_click',
        'expand_btn_click',
        'svg_mousedown',
        'mouseup',
        'mode_change',
        'node_tree_render_end',
        'rich_text_selection_change',
        'transforming-dom-to-images',
        'generalization_node_contextmenu',
        'painter_start',
        'painter_end',
        'scrollbar_change',
        'scale',
        'translate',
        'node_attachmentClick',
        'node_attachmentContextmenu',
        'demonstrate_jump',
        'exit_demonstrate',
      ].forEach(event => {
        this.mindMap.on(event, (...args) => {
          this.$bus.$emit(event, ...args)
        })
      })
    },


          // 提取数据变更处理逻辑
      async handleDataChange(arr) {

        // console.log('数据变更:', arr[0].data, arr[1].data)
        
        switch(arr.length) {
          case 0:
            break
          case 1:
            const diffrents1 = diff(arr[0].oldData,arr[0].data)
            console.log('单个节点变更:', diffrents1)
            // 处理单个节点变更
            if (arr[0].data.data._isSystemDefault){
              // 如果是更新操作且已同步，直接返回
              this.$message.warning('case 1 sysdef您只能编辑自己创建的节点')
              await this.reloadData()
              return
            }

            if (arr[0].data.data._creatorPoliceNumber!== this.userInfo?.police_number) {
              // 如果不是当前用户创建的节点，直接返回
              this.$message.warning('case 1 policenumber您只能编辑自己创建的节点')
              await this.reloadData()
              return
            }


            const nodeData = arr[0].data.data
            const data={
              nodeData: nodeData
            }
            const res = await api.updateNodeData(data)


            


            break
          case 2:
            // 避免强制刷新，使用更优雅的方式
            // this.reloadData()
            const diffrents2 = diff(arr[0].data, arr[0].oldData)
            console.log('单个节点变更:', diffrents2)
            //create
            if (arr[0].action=== 'update' && arr[1].action === 'create') {
              // 处理创建操作           
              
              const parent_node_uid = arr[0].oldData.data.uid
              const nodeData = arr[1].data.data
              const data={
                projectId: this.$route.params.id,
                parent_node_uid: parent_node_uid,
                nodeData: nodeData
              }
              const res = await api.createNodeData(data)              
            }
            //delete
            else if (arr[0].action === 'update' && arr[1].action === 'delete') {
              // 处理删除操作
                          // 处理单个节点变更
              if (arr[1].data.data._isSystemDefault ){
                // 如果是更新操作且已同步，直接返回
                this.$message.warning('您只能删除自己创建的节点')
                await this.reloadData()
                return
              }

              if (arr[1].data.data._creatorPoliceNumber!== this.userInfo?.police_number) {
                // 如果不是当前用户创建的节点，直接返回
                console.log('删除节点:', arr[1].data._creatorPoliceNumber, this.userInfo?.police_number)
                this.$message.warning('您只能删除自己创建的节点')
                await this.reloadData()
                return
              }

              const nodeData = arr[1].data.data
              const data={
                nodeData: nodeData
              }
              const res = await api.deleteNodeData(data)

            }
            else{
              this.$message.warning('批量更新操作暂不支持')
              // 重新加载数据
              await this.reloadData()
            }
            break
          default:
            // 处理批量更新操作
            if(arr.length > 2) {
              let i=0
              let j=0;
              for (let item of arr) {
                if(item.action === 'update'){
                  i++;
                  if(i>1){
                    this.$message.warning('不支持多个节点的批量创建功能')
                    // 重新加载数据
                    await this.reloadData()
                    return
                  }
                }
                if(item.action === 'delete'){
                  this.$message.warning('批量更新操作暂不支持删除节点')
                  // 重新加载数据
                  await this.reloadData()
                }
                if(item.action === 'create'){
                  j++;
                  if(j>0){
                    if(item.data.children.length > 0) {
                      this.$message.warning('不支持此功能')
                      // 重新加载数据
                      await this.reloadData()
                      return
                    }
              
                  }
                }

              }

              const parent_node_uid = arr[0].oldData.data.uid
              const createNodes = arr.filter(item => item.action === 'create')
        
              console.log('批量创建的节点:', createNodes)
              const res = await api.createBatchNodeData({
                projectId: this.$route.params.id,
                parent_node_uid: parent_node_uid,
                nodesArr: createNodes.map(item => item.data.data)
              })
              console.log('批量创建结果:', res)

 
            }
            
            this.$message.success('批量更新成功')
        }
      },
      
      // 重新加载数据
      async reloadData() {
        try {
          showLoading()
          const { content } = await this.getUserMindMapData(this.$route.params.id)
          this.mindMapData = content
          this.mindMap.setFullData(content)
          hideLoading()

        } catch (error) {
          console.error('重新加载数据失败:', error)
          hideLoading()

        }
      },
    
    

    /**
     * @Author: 王林
     * @Date: 2021-08-03 23:01:13
     * @Desc: 动态设置思维导图数据
     */
    setData(data) {
      this.handleShowLoading()
      if (data.root) {
        this.mindMap.setFullData(data)
      } else {
        this.mindMap.setData(data)
      }
      this.mindMap.view.reset()
      this.manualSave()
    },

    /**
     * @Author: 王林
     * @Date: 2021-05-05 13:32:11
     * @Desc: 重新渲染
     */
    reRender() {
      this.mindMap.reRender()
    },

    /**
     * @Author: 王林
     * @Date: 2021-05-04 13:08:28
     * @Desc: 执行命令
     */
    execCommand(...args) {
      this.mindMap.execCommand(...args)
    },

    /**
     * @Author: 王林
     * @Date: 2021-07-01 22:33:02
     * @Desc: 导出
     */
    async export(...args) {
      try {
        showLoading()
        await this.mindMap.export(...args)
        hideLoading()
      } catch (error) {
        console.log(error)
        hideLoading()
      }
    },

    // 修改导出内边距
    onPaddingChange(data) {
      this.mindMap.updateConfig(data)
    },

    // 加载节点富文本编辑插件
    addRichTextPlugin() {
      if (!this.mindMap) return
      this.mindMap.addPlugin(RichText)
    },

    // 移除节点富文本编辑插件
    removeRichTextPlugin() {
      this.mindMap.removePlugin(RichText)
    },

    // 加载滚动条插件
    addScrollbarPlugin() {
      if (!this.mindMap) return
      this.mindMap.addPlugin(ScrollbarPlugin)
    },

    // 移除滚动条插件
    removeScrollbarPlugin() {
      this.mindMap.removePlugin(ScrollbarPlugin)
    },

    // 加载手绘风格插件
    addHandDrawnLikeStylePlugin() {
      try {
        if (!this.mindMap) return
        this.mindMap.addPlugin(HandDrawnLikeStyle)
        this.mindMap.reRender()
      } catch (error) {
        console.log('手绘风格插件不存在')
      }
    },

    // 移除手绘风格插件
    removeHandDrawnLikeStylePlugin() {
      try {
        this.mindMap.removePlugin(HandDrawnLikeStyle)
        this.mindMap.reRender()
      } catch (error) {
        console.log('手绘风格插件不存在')
      }
    },

    // 拖拽文件到页面导入
    onDragenter() {
      this.showDragMask = true
    },
    onDragleave() {
      this.showDragMask = false
    },
    onDrop(e) {
      this.showDragMask = false
      const dt = e.dataTransfer
      const file = dt.files && dt.files[0]
      this.$bus.$emit('importFile', file)
    }
  },

  beforeDestroy() {
      // 清理定时器
      if (this.dataChangeTimer) {
        clearTimeout(this.dataChangeTimer)
      }
      
      // 解绑事件监听器
      this.unbindEventListeners()
      
      // 销毁思维导图实例
      if (this.mindMap) {
        this.mindMap.destroy()
      }
    }
}
</script>

<style lang="less" scoped>
.editContainer {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  .dragMask {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3999;

    .dragTip {
      pointer-events: none;
      font-weight: bold;
    }
  }

  .mindMapContainer {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;

    // left: 100px;
    // top: 100px;
    // right: 100px;
    // bottom: 100px;
  }
}
/* 节点悬浮提示框样式 */
:global(#node-tooltip) {
  position: fixed;
  background: rgba(50, 50, 50, 0.95);
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  pointer-events: none;
  display: none;
  max-width: 280px;
  word-wrap: break-word;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
}

:global(.node-tooltip) {
  min-width: 160px;
}

:global(.tooltip-item) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  gap: 12px;
}

:global(.tooltip-item:last-child) {
  margin-bottom: 0;
}

:global(.tooltip-label) {
  font-weight: 600;
  color: #bbb;
  white-space: nowrap;
  min-width: 60px;
}

:global(.tooltip-value) {
  color: #fff;
  text-align: right;
  flex: 1;
  font-weight: 500;
}
</style>
