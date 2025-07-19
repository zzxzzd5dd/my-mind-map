<template>
  <div>
    <div
      class="nodeAttachmentContextMenu"
      :style="{
        left: this.left + 'px',
        top: this.top + 'px',
        visibility: show ? 'visible' : 'hidden'
      }"
      @click.stop="deleteAttachment"
    >
      <div class="menuItem">{{ $t('attachment.deleteAttachment') }}</div>
    </div>
    <!-- <el-dialog
      class="nodeAttachmentDialog"
      :title="附件"
      :visible.sync="dialogVisible"
      :width="isMobile ? '90%' : '50%'"
      :top="isMobile ? '20px' : '15vh'"
    >
      <div class="title">方式一</div>
      <AttachmentUpload
        ref="AttachmentUpload"
        v-model="attachment"
        style="margin-bottom: 12px;"
      ></AttachmentUpload>
      <div class="title">方式二</div>
      <div class="inputBox">
        <span class="label">请输入图片地址</span>
        <el-input
          v-model="attachmentUrl"
          size="mini"
          placeholder="http://xxx.com/xx.jpg"
          @keydown.native.stop
        ></el-input>
      </div>
      <div class="title">可选</div>
      <div class="inputBox">
        <span class="label">{{ $t('nodeAttachment.attachmentTitle') }}</span>
        <el-input v-model="attachmentTitle" size="mini" @keydown.native.stop></el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">{{ $t('dialog.cancel') }}</el-button>
        <el-button type="primary" @click="confirm">{{
          $t('dialog.confirm')
        }}</el-button>
      </span>
    </el-dialog> -->
  </div>
</template>

<script>

import * as api from '@/api'
import { mapState } from 'vuex'

export default {
  name: 'NodeAttachment',
  props: {
    mindMap: {
      type: Object,
      default() {
        return null
      }
    }
  },
  data() {
    return {
      show: false,
      left: 0,
      top: 0,
      node: null,
      icon: null,
      dialogVisible: false,
      attachment: '',
      attachmentUrl: '',
      attachmentTitle: '',
      isMobile: false,
      activeNodes: []  // 添加这个属性

    }
  },
  created() {
    this.$bus.$on('node_attachmentClick', this.onNodeAttachmentClick)
    this.$bus.$on('selectAttachment', this.onSelectAttachment)
    this.$bus.$on(
      'node_attachmentContextmenu',
      this.onNodeAttachmentContextmenu
    )
    this.$bus.$on('hide', this.hide)
    document.body.addEventListener('click', this.hide)
    this.$bus.$on('node_active', this.hide)
    this.$bus.$on('scale', this.onScale)
    this.$bus.$on('translate', this.onScale)
    this.$bus.$on('svg_mousedown', this.hide)
    // this.$bus.$on('showNodeAttachment', () => {
    //   this.dialogVisible = true
    // })
  },
    computed: {
    ...mapState({
      userInfo: state => state.userInfo

    })
  },
  beforeDestroy() {
    this.$bus.$off('node_attachmentClick', this.onNodeAttachmentClick)
    this.$bus.$off('selectAttachment', this.onSelectAttachment)
    this.$bus.$off(
      'node_attachmentContextmenu',
      this.onNodeAttachmentContextmenu
    )
    this.$bus.$off('hide', this.hide)
    document.body.removeEventListener('click', this.hide)
    this.$bus.$off('node_active', this.hide)
    this.$bus.$off('scale', this.onScale)
    this.$bus.$off('translate', this.onScale)
    this.$bus.$off('svg_mousedown', this.hide)
    // this.$bus.$off('showNodeAttachment')
  },
  methods: {
    // 选择附件
    onSelectAttachment(activeNodes) {
      // activeNodes.forEach(node => {
      //   node.setAttachment('/test.md', '我去')
      // })
      this.activeNodes = activeNodes // 保存选中的节点
      if (this.activeNodes.length > 1) {
        this.$message.warning('请先选择一个节点')
        return
      }
      this.createFileInput() // 创建文件选择器
    },
        // 创建文件输入框
    createFileInput() {
      const input = document.createElement('input')
      input.type = 'file'
      // input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.zip,.rar'
      input.style.display = 'none'
      
      // 监听文件选择事件
      input.addEventListener('change', this.handleFileSelect)
      
      // 添加到 DOM 并触发点击
      document.body.appendChild(input)
      input.click()
      
      // 清理 DOM
      setTimeout(() => {
        document.body.removeChild(input)
      }, 1000)
    },
    // 处理文件选择
    async handleFileSelect(event) {
      const file = event.target.files[0]
      if (!file) return

      // 在方法开始时声明 loading 变量
      let loading = null  

      try {
        // 文件验证
        if (!this.validateFile(file)) {
          return
        }

                // 显示文件信息
        const fileSize = this.formatFileSize(file.size)
        const fileType = file.type || '未知类型'
        
        console.log(`选择文件: ${file.name}`)
        console.log(`文件大小: ${fileSize}`)
        console.log(`文件类型: ${fileType}`)

        // 显示上传进度
        loading = this.$loading({
          lock: true,
          text: `正在上传 "${file.name}" (${fileSize})...`,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })

        // 上传文件
        const result = await this.uploadFile(file)
        
        loading.close()

        if (result.success) {
          // 设置节点附件
          this.activeNodes.forEach(node => {
            node.setAttachment(result.data, file.name)
          })
          this.$message.success(`附件 "${file.name}" 上传成功`)
        } else {
          this.$message.error(result.message || '上传失败')
        }

      } catch (error) {

        console.error('上传失败:', error)
        
        // 根据错误类型显示不同的错误信息
        let errorMessage = '上传失败，请重试'
        if (error.response) {
          // 服务器响应错误
          if (error.response.status === 413) {
            errorMessage = '文件过大，超过服务器限制'
          } else if (error.response.data?.message) {
            errorMessage = error.response.data.message
          }
        } else if (error.code === 'NETWORK_ERROR') {
          errorMessage = '网络连接失败，请检查网络'
        } else if (error.message.includes('timeout')) {
          errorMessage = '上传超时，请重试'
        }
        
        this.$message.error(errorMessage)
      } finally {
        // 确保 loading 总是被关闭
        if (loading) {
          loading.close()
        }
      }
    },

    // 文件验证
    validateFile(file) {
      // 文件大小验证 (100MB)
      const maxSize = 100 * 1024 * 1024
      if (file.size > maxSize) {
        this.$message.error('文件大小不能超过100MB')
        return false
      }

      return true
    },

        // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    // 上传文件到服务器
    async uploadFile(file) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('node_uid', this.activeNodes[0].getData().uid)
      formData.append('filename', file.name)
      formData.append('file_size', file.size)

      const response = await api.uploadAttachment(formData)
      return response.data
    },





    // 点击附件图标，一般用来打开或下载附件
    onNodeAttachmentClick(node, e, icon) {
      // console.log(node.getData('attachmentUrl'))
      this.$message.info(this.$t('attachment.tip'))
    },

    // 显示删除浮层
    onNodeAttachmentContextmenu(node, e, icon) {
      e.stopPropagation()
      e.preventDefault()
      this.node = node
      this.icon = icon
      this.updatePosition()
      this.show = true
    },

    // 更新位置
    updatePosition() {
      const iconSize = this.mindMap.themeConfig.iconSize
      const { x, y } = this.icon.rbox()
      this.left = x + iconSize
      this.top = y
    },

    // 画布缩放事件
    onScale() {
      if (!this.node || !this.show) return
      this.updatePosition()
    },

    // 删除附件
    async deleteAttachment() {

      if (this.node.getData()._creatorPoliceNumber !== this.userInfo?.police_number) {
        this.$message.error('您没有权限删除该附件')
        return
      }
      if (!this.node || !this.show) return
      await api.deleteAttachment({
        node_uid: this.node.getData().uid,
      })
      this.node.setAttachment('', '')
      this.hide()
    },

    // 隐藏浮层
    hide() {
      this.show = false
    }
  }
}
</script>

<style lang="less" scoped>
.nodeAttachmentContextMenu {
  position: fixed;
  background-color: #fff;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.06);

  .menuItem {
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #1a1a1a;
    cursor: pointer;
    user-select: none;
  }
}
.nodeImageDialog {
  .title {
    font-size: 18px;
    margin-bottom: 12px;
  }

  .inputBox {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    .label {
      width: 150px;
    }
  }
}
</style>
