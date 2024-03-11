<template>
  <el-row>
    <el-col :span="23">
      <div class="show-main">
        <el-row class="top-padding">
          <h2>存储空间</h2>
        </el-row>
        <el-row><span class="hello"> </span></el-row>
        <el-row>
          <el-col :span="8">
            <el-button type="primary" @click="createBucket">创建新的文件夹</el-button>
            <el-button type="primary" @click="upload">上传</el-button>
          </el-col>

        </el-row>
        <el-row style="height: 100%; padding-top: 20px">
          <!--   这是左边-->
          <el-col :span="5" style=" padding: 5px">
            <el-menu class="el-menu-vertical-demo" @close="handleClose" @open="handleOpen">
              <el-menu-item v-for="bucketItem in bucketList" @click=handleClick(bucketItem.id)>
                <EpFolderOpened v-if="bucketItem.id == bucketId" />
                <EpFolderClosed v-if="bucketItem.id !== bucketId" />
                <span>{{ bucketItem.bucketName }}</span>
                <el-button type="info" style="margin-left: 5%;" @click="deleteBucket(bucketItem.id)" :icon="Delete"
                  circle />
              </el-menu-item>
            </el-menu>
          </el-col>
          <!--    这是右边-->
          <el-col :span="19" style="padding-left: 1% ; ">
            <div v-if="showTable == 1" class="scroll-container">
              <el-row class="top-padding">
                <el-table :data="fileShowList" :row-style="{ height: '80px' }" style="width: 93%">
                  <el-table-column label="文件名称" prop="name" width="400">
                    <template #default="scope">
                      <span :class="scope.row.icon" class="icon iconfont"></span>
                      <span class="table-title" @click="perView(scope.row)">{{ scope.row.name }}</span>
                    </template>
                  </el-table-column>

                  <el-table-column label="类型" prop="type">

                    <template #default="scope">
                      <span>{{ scope.row.type }}</span>
                    </template>
                  </el-table-column>

                  <el-table-column label="大小">

                    <template #default="scope">
                      <span>{{ scope.row.size }}</span>
                    </template>
                  </el-table-column>

                  <el-table-column width="80">

                    <template #default="scope">
                      <el-dropdown trigger="click">
                        <span class="iconfont icon-sangedian-copy">
                        </span>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item @click="handleShare(scope.row)">
                              <span class="icon iconfont icon-a-fenxiang2"></span>
                              <span>分享</span>
                            </el-dropdown-item>

                            <el-dropdown-item @click="handleDownload(scope.row)">
                              <span class="icon iconfont icon-xiazai"></span>
                              <span>下载</span>
                            </el-dropdown-item>
                            <el-dropdown-item>
                              <span class="icon iconfont icon-icon-"></span>
                              <span>移动</span>
                            </el-dropdown-item>
                            <el-dropdown-item>
                              <span class="icon iconfont icon-fuzhi-01"></span>
                              <span>复制</span>
                            </el-dropdown-item>
                            <el-dropdown-item @click="handleDelete(scope.row)">
                              <span class="icon iconfont icon-shanchu"></span>
                              <span>删除</span>
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </template>
                  </el-table-column>
                </el-table>
              </el-row>
            </div>
            <el-row>
              <PerViewPage v-if="showTable == 0" :documentId="documentId" :documentName="documentName"></PerViewPage>
            </el-row>
          </el-col>
        </el-row>
        <el-dialog v-model="dialogVisible" title="创建文件夹" width="500">
          <CreateBucket @closeDialog="handleCloseDialog" @refreshBucketList="handlerRfreshBucketList" />
        </el-dialog>
        <el-dialog v-model="dialogVisibleShare" :title="shareNameText" width="500">
          <ShareDocument @closeShareDialog="handleCloseShareDialog" :documentId="sharedDocumentId" />
        </el-dialog>
      </div>
    </el-col>

  </el-row>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { getDownloadFile, getFileBlocks, getFileBlock } from "../api/downloadFile"
import PerViewPage from "../components/preview.vue";
import Bus from "../components/GlobalUploader/utils/bus.js";
import { convertFileSize, matchIcon } from '../utils/convertFileSize';
import { getBucketListApi, deleteBucketApi } from "../api/bucket";
import { getDocumentListApi, DocumentDeleteApi } from "../api/document";
import EpFolderOpened from "../components/Icon/EpFolderOpened.vue";
import EpFolderClosed from "./Icon/EpFolderClosed.vue";
import Delete from "./Icon/Delete.vue";
import CreateBucket from "../components/CreateBucket.vue"
import ShareDocument from "../components/ShareDocument.vue";
import { useTokenStore } from "../stores/token";

// import streamSaver from 'streamsaver'
import saveAs from "file-saver";
let documentId = ref(0);
let sharedDocumentId = ref(0);
let documentName = ref("");
let showTable = ref(1);
let bucketId = ref(0);
let dialogVisible = ref(false);
let dialogVisibleShare = ref(false);
let shareNameText = ref("")
const handleDownload = async (row) => {
  console.log(row)
  try {
    const response = await getDownloadFile('download1', { "documentId": row.id });
    const blob1 = new Blob([response]);
    const blobUrl = window.URL.createObjectURL(blob1);


    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = row.name;
    a.click();
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('下载文件发生错误:', error);
  }

}
// const handleDownload = async (row) => {
//   console.log(row)
//   try {
//     // 定义保存文件的方法
//     const saveResponse = (data) => {
//       const blob = new Blob([data]);
//       const blobUrl = window.URL.createObjectURL(blob);


//       const a = document.createElement('a');
//       a.href = blobUrl;
//       a.download = row.name;
//       a.click();
//       window.URL.revokeObjectURL(blobUrl);
//     };
//     const tokenStore = useTokenStore();
//     let start = 0;
//     let partNo = 1;
//     let end = start + 50*1024*1024;
//     // 定义查询参数
//     // 获取文件
//     const response = await fetch('http://localhost:10086/download1?documentId=84', {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: tokenStore.token,
//         'Range': `bytes=${start}-${end}`  // 设置 Range 请求头
//       }
//     });

//     // 检查响应是否ok
//     if (!response.ok) {
//       throw new Error('Network response was not ok.');
//     }

//     // 使用 blob() 处理流
//     response.blob().then(saveResponse);

//   } catch (error) {
//     console.error('下载文件发生错误:', error);
//   }
// }
async function handleGetFileBlocks(row) {
  if (row.type === 11) {
    handleDownload(row)
  } else {
    const fileBlocks = await getFileBlocks('download1', { documentId: row.id });
    console.log(row);  // 打印看一下返回的信息

    console.log(fileBlocks);  // 打印看一下返回的信息
    // 在此处添加下载每一文件块的逻辑
    // 下载并保存每一块文件
    for (let [index, blockUrl] of Object.entries(fileBlocks)) {
      const data = await getFileBlock(blockUrl);
      const blob = new Blob([data]);
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${row.name}.part${index}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }


  }
}
const handleDelete = async (row) => {
  console.log(row)
  const response = await DocumentDeleteApi(row.id)
    .then(() => {
      getDocumentList(bucketId.value);
    })
    .catch(e => {
      console.error(e);
    });
}

const upload = () => {
  // 打开文件选择框
  Bus.emit('openUploader', {
    // 给服务端的额外参数
    params: {
      page: 'upload',
      bucketId: bucketId.value
    },
    options: {
      target: 'http://localhost:10086/upload'
    }
  })
}

interface FileShow {
  etag: string
  lastModified: string
  name: string
  size: string | number
  type: string
  icon: string
}
//文件信息列表
const fileShowList = ref<FileShow[]>(new Array<FileShow>())



onMounted(async () => {
  await getBucketList()
  bucketId.value = bucketList.value[0].id
  getDocumentList(bucketId.value);
  // 文件选择后的回调
  Bus.on('fileAdded', () => {
    console.log('文件已选择')
  })

  // 文件上传成功的回调
  Bus.on('fileSuccess', () => {
    getDocumentList(bucketId.value);
    console.log('文件上传成功咯')
  })
})

onBeforeUnmount(() => {
  Bus.off('fileAdded')
  Bus.off('fileSuccess')
})

//
//右边
//


//
//左边
//
//生成桶的数组
const bucketList = ref({});
const activeIndex = ref(-1); // 默认选中项的索引

function handleOpen() {
}

function handleClose() {
}

const perView = (data: any) => {
  showTable.value = 0;
  documentId.value = data.id
  documentName.value = data.name
  console.log(documentId.value, documentName.value)
}

// };


// 监听 items 数组数据变化，并重新设置 activeIndex 的值
watch(
  () => bucketList,
  () => {
    activeIndex.value = -1;
  }
);

const getDocumentList = async (bucketId: number) => {
  // documentId.value = bucketList.value[index].id
  const response = await getDocumentListApi(bucketId);
  for (let i = 0; i < response.data.length; i++) {
    response.data[i].size = convertFileSize(response.data[i].size);
    response.data[i].icon = matchIcon(response.data[i].type);
  }
  fileShowList.value = response.data;
}

const getBucketList = async () => {
  const response = await getBucketListApi();
  bucketList.value = response.data
};

const handleClick = async (bucketIds: number) => {
  bucketId.value = bucketIds;
  getDocumentList(bucketIds);
}

const createBucket = async () => {
  console.log("创建桶");
  // 创建桶
  dialogVisible.value = true;
}

const handleCloseDialog = (data) => {
  dialogVisible.value = data;
}

const handleCloseShareDialog = (data) => {
  dialogVisibleShare.value = data;
}

const handlerRfreshBucketList = () => {
  getBucketList();
}

const deleteBucket = async (bucketId: number) => {
  await deleteBucketApi(bucketId)
  getBucketList();
}

const handleShare = async (row) => {
  dialogVisibleShare.value = true;
  shareNameText.value = "分享:" + row.name
  sharedDocumentId.value = row.id
} 
</script>

<style scoped>
.scroll-container {
  height: 600px;
  /* 设置容器的高度 */
  overflow-y: auto;
  /* 在垂直方向上显示滚动条，当内容超过容器高度时显示滚动条 */
}

.button-group {
  display: flex;
  justify-content: center;
}

.el-button {
  margin-right: 10px;
  border-radius: 4px;
  border: none;
  outline: none;
}

.el-button .active {
  background-color: #409eff;
  color: #ffffff;
}


.logo {
  max-width: 90%;
  height: auto;
  margin-top: 25px;
  margin-bottom: 25px;
}

.el-menu-item {
  font-weight: bold;
  color: gray;
}

.el-menu {
  max-height: 100%;
  height: 100vh;
}

.el-menu-vertical-demo .el-menu-item.is-active {
  /* background-color: #f5f5f5; /* 设置选中项的背景颜色 */
  background-color: rgb(240, 244, 254);
  /* color:#181818;  */
  color: rgb(111, 152, 247);
}

.el-menu-item {
  border-bottom: 1px solid #ebebeb;
  /* 添加菜单项之间的边框 */
}

.icon {
  margin-right: 15px;
  height: 20px;
  width: 20px;
}
</style>

<style lang="scss" scoped>
@import url(../assets/font_4094392_70o7k4r745u/iconfont.css);
@import url(../assets/themecss/theme.scss);

.icon {
  padding-right: 10px;
}

.table-title {
  font-weight: bold;
  color: #000000
}

.icon-sangedian-copy {
  transform: rotate(90deg);
}

:deep(.el-col.el-col-15) {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.left-padding {
  padding-left: 80px;
}
</style>