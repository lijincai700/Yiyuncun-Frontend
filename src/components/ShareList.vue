<template>
  <div>
    <el-card class="box-card" v-for="item in sharedlist">
      <template #header>
        <div class="card-header">
          <span>{{ item.documentName }}</span>
        </div>
      </template>
      <p>分享链接：{{ item.shareLink }}</p>
      <el-button type="primary" round @click="modifyHandle(item)">修改分享密码</el-button>
      <el-button type="danger" round @click="deleteShared(item.id)">取消分享</el-button>
      <el-button class="copy-btn" type="success" plain @click=copyLink(item.shareLink)>复制分享链接</el-button>
      <template #footer>分享时间:{{ item.createTime }}</template>
    </el-card>
    <el-dialog v-model="dialogVisible" title="修改分享密码" width="500">
      <span style="float: left;">新密码:</span><el-input v-model="newPassword" />
      <br /><br />
      <el-button @click="cancleHandle">取消</el-button>
      <el-button type="primary" @click="modifyPassword">
        修改
      </el-button>
    </el-dialog>
  </div>
</template>

<script setup>

import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getShareDocumentListApi, deleteSharedApi, modifySharePasswordApi } from '../api/document.js'
import ClipboardJS from 'clipboard'
const sharedlist = ref([])
let clipboardText = ref('')
let dialogVisible = ref(false)
let newPassword = ref('')
let modifyShareDocument = ref({})
const getShareDocumentList = () => {
  getShareDocumentListApi().then((res) => {
    sharedlist.value = res.data
  })
}



onMounted(async () => {
  getShareDocumentList()
})



const deleteShared = (id) => {
  deleteSharedApi(id).then((res) => {
    if (res.code === 0) {
      ElMessage.success(res.message)
      getShareDocumentList()
    } else {
      ElMessage.error(res.message)
    }
  })
}

const copyLink = (link) => {
  clipboardText.value = link
  copyText()
}

const copyText = () => {
  const clipboard = new ClipboardJS('.copy-btn', {
    text() {
      return clipboardText.value
    }
  })
  clipboard.on('success', () => {
    ElMessage.success('复制成功')
    clipboard.destroy()
  })
  clipboard.on('error', () => {
    ElMessage.error('复制失败')
    clipboard.destroy()
  })
}

const cancleHandle = () => {
  newPassword.value = ''
  dialogVisible.value = false
}

const modifyHandle = (item) => {
  modifyShareDocument = item
  dialogVisible.value = true
}

const modifyPassword = () => {
  if (newPassword.value === '') {
    ElMessage.error('请输入新密码')
    return
  }
  modifyShareDocument.sharePassword = newPassword.value
  modifySharePasswordApi(modifyShareDocument).then((res) => {
    newPassword.value = ''
    dialogVisible.value = false
    ElMessage.success(res.message)
    getShareDocumentList()
  })
}
</script>

<style>
.box-card {
  margin-bottom: 20px;
  margin-top: 20px;
  margin-left: 30px;
  margin-right: 30px;
  border-radius: 10px;
  float: left;
  width: calc(50%-60px);
}
</style>