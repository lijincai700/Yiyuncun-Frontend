<template>
    <div class="share" >
        <span style="float: left;">分享密码:</span><el-input v-model="password" />
        <br /><br />
        <el-button @click="cancleHandle">取消</el-button>
        <el-button type="primary" @click="confirmShare">
            确认分享
        </el-button>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { shareDocumentApi } from '../api/document'
import { ElMessage } from 'element-plus'
const emit = defineEmits(['closeShareDialog']);
let password = ref('');
const cancleHandle = () => {
    password.value = ''
    
    emit('closeShareDialog', false);
};

const confirmShare = async () => {
    // 当前vue项目的地址
    let shareLink = window.location.origin+'/#/share';
    const shareDocument = {
        documentId: info.documentId,
        sharePassword: password.value,
        shareLink: shareLink
    }
    await shareDocumentApi(shareDocument).then(res => {
        ElMessage.success(res.message);
    }).catch(err => {
        ElMessage.error(res.message);
    });
    cancleHandle();
    emit('closeShareDialog', false);
};

const info = defineProps({
    documentId: {
        type: Number,
        default: ''
    }
});
</script>