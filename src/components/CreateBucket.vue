<template>
    <div class="create-bucket">
        <span style="float: left;">文件夹名称:</span><el-input v-model="bucketName" />
        <br/><br/>
        <el-button @click="cancleHandle">取消</el-button>
        <el-button type="primary" @click="createBucket">
          创建
        </el-button>
    </div>
</template>
<script setup>
// import { defineEmits } from 'vue';
import { ref } from 'vue';
import { createBucketApi } from '../api/bucket'
import { ElMessage } from 'element-plus'
const emit = defineEmits(['closeDialog','refreshBucketList']);
let bucketName = ref('');
const cancleHandle = () => {
    bucketName.value = ''
    emit('closeDialog',false);
};

const createBucket = async () => {
    if(bucketName.value === ''){
        ElMessage({
            type: 'error',
            message: '文件夹名称不能为空'
        });
        return;
    }
    let bucket = {
        bucketName: bucketName.value
    }
    await createBucketApi(bucket);
    bucketName.value = ''
    emit('refreshBucketList');
    emit('closeDialog',false);
};
</script>