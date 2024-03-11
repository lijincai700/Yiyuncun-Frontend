<template>
    <div class="getshare-view">

        <el-form class="form" label-width="120px" style="max-width: 300px;">
            <span>提取分享</span>
            <el-form-item label="分享密码">
                <el-input v-model="password" placeholder="请输入分享密码"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onSubmit">提取下载文件</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getDownloadFile } from "../api/downloadFile"
import { ElMessage } from 'element-plus'
import {downloadShareDocumentApi} from "../api/document"
const { query } = useRoute()
let password = ref('')
let documentId = ref(0)
const onSubmit = async () => {
    // console.log('submit!');?
    await downloadShareDocumentApi(documentId.value, password.value).then(async res => {
        console.log(res.data)
        if (res.code == 0) {
            try {
                const response = await getDownloadFile('download1', { "documentId": res.data.id })
                const blob1 = new Blob([response]);
                const blobUrl = window.URL.createObjectURL(blob1);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = res.data.name;
                a.click();
                window.URL.revokeObjectURL(blobUrl);
            } catch (e) { 
                console.log(e)
                ElMessage.error("下载错误");
            }
        }
    })
}
onMounted(() => {
    password.value = query.sharePassword
    documentId.value = query.documentId
})

</script>
<style>
.getshare-view {
    height: 100%;
    width: 100%;
    float: left;
    margin-top: 20%;
    margin-right: 60px;
}
</style>