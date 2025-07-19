<template>
  <div class="attachmentUploadContainer">
    <div class="attachmentUploadPanel">
      <div class="upBtn" v-if="!value">
        <label
          for="attachmentUploadInput"
          class="attachmentUploadInputArea"
          @dragenter.stop.prevent
          @dragover.stop.prevent
          @drop.stop.prevent="onDrop"
          >点击此处选择文件、或拖动文件到此</label
        >
        <input
          type="file"
          accept="image/*"
          id="attachmentUploadInput"
          @change="onAttachmentUploadInputChange"
        />
      </div>
      <div v-if="value" class="uploadInfoBox">
        <div
          class="previewBox"
          :style="{ backgroundImage: `url('${value}')` }"
        ></div>
        <span class="delBtn el-icon-close" @click="deleteAttachment"></span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AttachmentUpload',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      file: null
    }
  },
  methods: {
    /**
     * @Author: 王林
     * @Date: 2019-12-22 19:47:19
     * @Desc: 图片选择事件
     */
    onAttachmentUploadInputChange(e) {
      let file = e.target.files[0]
      this.selectAttachment(file)
    },

    /**
     * @Author: 王林
     * @Date: 2019-12-22 20:32:31
     * @Desc: 拖动上传图片
     */
    onDrop(e) {
      let dt = e.dataTransfer
      let file = dt.files && dt.files[0]
      this.selectAttachment(file)
    },

    /**
     * @Author: 王林
     * @Date: 2021-06-06 16:56:14
     * @Desc: 选择图片
     */
    selectAttachment(file) {
      this.file = file
      let fr = new FileReader()
      fr.readAsDataURL(file)
      fr.onload = e => {
        this.$emit('change', e.target.result)
      }
    },


    /**
     * @Author: 王林
     * @Date: 2021-06-06 21:59:57
     * @Desc: 删除图片
     */
    deleteAttachment() {
      this.$emit('change', '')
      this.file = null
      console.log('删除图片')
    }
  }
}
</script>

<style lang="less" scoped>
@import './style.less';
</style>
