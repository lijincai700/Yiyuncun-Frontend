<template>
    <div id="global-uploader" :class="{ 'global-uploader-single': !global }">
        <div class="logo"></div>
        <uploader ref="uploaderRef" :options="options" :autoStart="false" :file-status-text="fileStatusText"
            class="uploader-app" @file-added="onFileAdded" @file-success="onFileSuccess" @file-error="onFileError"
            @file-progress="onFileProgress">

            <uploader-unsupport></uploader-unsupport>
            <uploader-btn id="global-uploader-btn" ref="uploadBtnRef">选择文件</uploader-btn>
            <uploader-list v-show="panelShow">
                <template #default="{ fileList }">
                    <div :class="{ collapse: collapse }" class="file-panel">
                        <div class="file-title">
                            <div class="title">文件列表</div>
                            <div class="operate">
                                <el-button :title="collapse ? '展开' : '折叠'" link @click="collapse = !collapse">
                                    <Icon :icon="collapse ? 'ri:fullscreen-fill' : 'ri:subtract-fill'" width="18" />
                                </el-button>
                                <el-button link title="关闭" @click="close">
                                    <Icon icon="ri:close-fill" width="20" />
                                </el-button>
                            </div>
                        </div>

                        <ul class="file-list">
                            <li v-for="file in fileList" :key="file.id" class="file-item">
                                <uploader-file ref="files" :class="['file_' + file.id, customStatus]" :file="file"
                                    :list="true"></uploader-file>
                            </li>
                            <div v-if="!fileList.length" class="no-file">
                                <Icon icon="ri:file-3-line" width="16" />
                                暂无待上传文件
                            </div>
                        </ul>
                    </div>
                </template>
            </uploader-list>
        </uploader>

    </div>
</template>

<script>
import SparkMD5 from "spark-md5";
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import Bus from './utils/bus'
import axios from "axios";


// import { encodingApi } from "../../api/uploadFile.js"
import { getDownloadFile } from "../../api/downloadFile.js"
import { confirmUploadApi, enCondingApi } from "../../api/document.js"
import { generateMD5 } from "./utils/md5.js"
import { useTokenStore } from "../../stores/token";
const FILE_UPLOAD_ID_KEY = "file_upload_id";
let customParams = {};
// 分片大小，1MB
const CHUNK_SIZE = 50 * 1024 * 1024;
const MD5_CHUNK_SIZE =  100 * 1024 * 1024;


let md5map = [];
let index = 0;
let bucketId = 0;
export default {
    name: 'GlobalUploader',
    props: {
        global: {
            type: Boolean,
            default: true
        },
        // 发送给服务器的额外参数
        params: {
            type: Object,
        },
        options: {
            type: Object
        }
    },
    emits: ['fileAdded', 'fileSuccess'],

    setup(props, { emit }) {

        let md5map = {};
        let spark = new SparkMD5.ArrayBuffer();// 新建一个Spark实例计算每个分片的MD5
        const tokenStore = useTokenStore();
        const options = {
            query: (file, chunk) => {
                let index = chunk.startByte / CHUNK_SIZE
                return {
                    chunkMD5: md5map[index]
                }
            },
            // 上传地址
            // target: "http://192.168.0.100:10086/upload",
            target: "http://localhost:10086/upload",
            // 是否开启服务器分片校验。默认为 true
            testChunks: true,
            // 真正上传的时候使用的 HTTP 方法,默认 POST
            uploadMethod: "post",
            // 分片大小
            chunkSize: CHUNK_SIZE,
            // 并发上传数，默认为 3
            simultaneousUploads: 3,
            forceChunkSize: true,
            headers: {
                Authorization: tokenStore.token
            },
            /**
             * 判断分片是否上传，秒传和断点续传基于此方法
             * 这里根据实际业务来 用来判断哪些片已经上传过了 不用再重复上传了 [这里可以用来写断点续传！！！]
             */
            checkChunkUploadedByResponse: (chunk, message) => {
                // message是后台返回
                let messageObj = JSON.parse(message);
                let dataObj = messageObj;
                if (dataObj.uploaded !== undefined) {
                    return dataObj.uploaded;
                }
                // 判断文件或分片是否已上传，已上传返回 true
                // 这里的 uploadedChunks 是后台返回]
                return (dataObj || []).indexOf(chunk.offset + 1) >= 0;
            },


            preprocess(chunk) {
                return new Promise((resolve, reject) => {

                    let reader = new FileReader();
                    reader.onload = function (e) {
                        let result = e.target.result;
                        // 使用SparkMD5计算分片MD5
                        let spark = new SparkMD5.ArrayBuffer();
                        spark.append(result);
                        let md5 = spark.end();
                        // 将计算结果存入md5map对象，其中CHUNK_SIZE需要你提前定义或从正确地方获取
                        md5map[chunk.startByte / CHUNK_SIZE] = md5;
                        chunk.preprocessFinished();
                        resolve();
                    };
                    reader.onerror = reject;
                    // 这里我更改了从 chunk.file 读取文件分片内容的方式
                    reader.readAsArrayBuffer(chunk.file.file.slice(chunk.startByte, chunk.endByte));
                });
            },

            parseTimeRemaining: function (timeRemaining, parsedTimeRemaining) {
                //格式化时间
                return parsedTimeRemaining
                    .replace(/\syears?/, "年")
                    .replace(/\days?/, "天")
                    .replace(/\shours?/, "小时")
                    .replace(/\sminutes?/, "分钟")
                    .replace(/\sseconds?/, "秒");
            },
        },

            // 修改上传状态
            fileStatusTextObj = {
                success: "上传成功",
                error: "上传错误",
                uploading: "正在上传",
                paused: "停止上传",
                waiting: "等待中",
            }
        const panelShow = ref(false)
        const collapse = ref(false),

            uploadIdInfo = ref(null),
            uploadFileList = ref([]),
            fileChunkList = ref([]),

            customStatus = ref(''),
            uploaderRef = ref(),
            uploadBtnRef = ref()
        let customParams = {}

        const uploader = computed(() => uploaderRef.value?.uploader)
        watch(
            () => props.params,
            (data) => {
                if (data) {
                    customParams = data
                }
            }
        ),
            watch(
                () => props.options,
                (data) => {
                    if (data) {
                        setTimeout(() => {
                            customizeOptions(data)
                        }, 0)
                    }
                }
            )
        function customizeOptions(opts) {

            // 自定义上传url
            if (opts.target) {
                uploader.value.opts.target = opts.target
            }
            // 是否可以秒传、断点续传
            if (opts.testChunks !== undefined) {
                uploader.value.opts.testChunks = opts.testChunks
            }
            // merge 的方法，类型为Function，返回Promise
            if (opts.mergeFn) {
                mergeFn = opts.mergeFn
            }
            // 自定义文件上传类型
            if (opts.accept) {
                let input = document.querySelector('#global-uploader-btn input')
                input.setAttribute(opts.accept, accept.join())
            }

        }
        onMounted(() => {
            Bus.on('openUploader', ({ params = {}, options = {} }) => {
                bucketId = params.bucketId
                customParams = params
                if (uploadBtnRef.value) {
                    uploadBtnRef.value.$el.click()
                }
            })
        }),
            /**
     * 折叠、展开面板动态切换
     */
            function operate() {
                if (this.collapse === false) {
                    this.collapse = true;
                } else {
                    this.collapse = false;
                }
            },

            /**
             * 关闭折叠面板
             */
            function close() {
                uploader.value.cancel()
                panelShow.value = false
            }

        return {
            options,
            fileStatusTextObj,
            customStatus,
            collapse,
            uploadIdInfo,
            uploadFileList,
            fileChunkList,
            uploadBtnRef,
            uploaderRef,
            panelShow,
            uploader,
            md5map,
            close,
        };
    },

    created() {
    },

    methods: {
        async onFileAdded(file, event) {
            // 当添加文件时，根据文件大小动态调整分片大小
            // if (file.size <100 * 1024 * 1024) {
            //     uploader.opts.chunkSize = LARGE_CHUNK_SIZE;
            // } else {
            //     uploader.opts.chunkSize = SMALL_CHUNK_SIZE;
            // }
            this.panelShow = true;
            const tokenStore = useTokenStore();
            this.uploadFileList.push(file);
            // Bus.$emit('fileAdded');
            file.params = this.params
            console.log(file)
            console.log("file :>> ", file);
            // 有时 fileType为空，需截取字符
            console.log(this.uploadFileList)


            console.log("文件类型：" + file.fileType);
            // 文件大小
            console.log("文件大小：" + file.size + "B");

            console.log("校验MD5");

            // // 计算MD5
            // const md5 = await getFileMD5(file)
            // console.log("md5 :>> ", md5);
            this.getFileMD5(file)
                .then(({ totalMd5 }) => {
                    if (totalMd5 != "") {
                        // file.params = this.md5map
                        // console.log(file.params)
                        // 修改文件唯一标识
                        file.uniqueIdentifier = totalMd5;
                        // 1. todo 判断文件类型是否允许上传
                        // 2. 计算文件 MD5 并请求后台判断是否已上传，是则取消上传
                        console.log("判断是否可以上传")
                        console.log(totalMd5)
                        axios.post('http://localhost:10086/document/metadata', {
                            name: file.name,
                            typeString: file.fileType,
                            size: file.size,
                            bucketId: bucketId,
                            md5: file.uniqueIdentifier,
                            // ...您想传送的其他数据...
                        }, {
                            headers: {
                                Authorization: tokenStore.token
                            }
                        })
                            .then((response) => {
                                console.log(response);
                                if (response.data.message === "操作成功") {
                                    file.resume();
                                }
                                else if (response.data.message === "该文件已存在") {
                                    let index = this.uploadFileList.findIndex(f => f.name === file.name);
                                    if (index !== -1) {
                                        this.uploadFileList.splice(index, 1);
                                    }
                                    alert('该文件已存在!');
                                }

                            })
                            .catch((error) => {
                                // if (error.data.message==="该文件已存在") {
                                //     let index = this.uploadFileList.findIndex(f => f.name === file.name);
                                //     if (index !== -1) {
                                //         this.uploadFileList.splice(index, 1);
                                //     }
                                //     alert('该文件已存在!');
                                // }
                                console.log(error);
                            });
                        // 恢复上传

                    }
                });

        },

        onFileSuccess(rootFile, file, response, chunk) {

            //进行确认上传完成操作
            confirmUploadApi(file.uniqueIdentifier)
                .then(() => {
                    Bus.emit('fileSuccess');
                })
                .catch(e => {
                    console.error(e);
                });

            // console.log(file.uniqueIdentifier);
            enCondingApi(file.name).then(response => {
                // 需要处理的逻辑
            }).catch(error => {
                // 捕获并处理异常
                console.log("error");
                console.log(error);
            });

            console.log("上传成功");
        },
        onFileError(rootFile, file, message, chunk) {
            console.log("上传出错：" + message);
        },
        onFileProgress(rootFile, file, chunk) {
            console.log(`当前进度：${Math.ceil(file._prevProgress * 100)}%`);
        },


        getFileMD5(file) {
            console.log('getFileMD5 started')
            let fileReader = new FileReader()
            let time = new Date().getTime()
            let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
            let currentChunk = 0
            const chunkSize = MD5_CHUNK_SIZE
            let chunks = Math.ceil(file.size / chunkSize)
            // let chunks = Math.floor(file.size / chunkSize)
            console.log(chunks)
            // let spark = new SparkMD5.ArrayBuffer()
            let totalSpark = new SparkMD5.ArrayBuffer() //新创建一个实例来用于计算整个文件的MD5

            // 文件状态设为"计算MD5"
            this.statusSet(file.id, 'md5')
            file.pause()

            loadNext()

            return new Promise((resolve, reject) => {
                fileReader.onload = (e) => {
                    // let chunkMd5;
                    // 使用 totalSpark 计算整个文件的 MD5
                    totalSpark.append(e.target.result);

                    if (currentChunk < chunks) {
                        // console.log(`Reading chunk ${currentChunk}`);
                        // 使用 spark 计算每个分片的 MD5
                        // spark.append(e.target.result);
                        // chunkMd5 = spark.end();
                        // this.md5map[currentChunk] = chunkMd5; // 将计算结果存储到对象中

                        // console.log(`Chunk MD5 for chunk ${currentChunk} is: ${chunkMd5}`);
                        currentChunk++
                        // spark = new SparkMD5.ArrayBuffer(); // 新建一个Spark实例计算下个分片的MD5
                        loadNext()

                        // 实时展示MD5的计算进度
                        this.$nextTick(() => {
                            console.log('next tick called', currentChunk, chunks);
                            const md5ProgressText = '正在验证 MD5' + ((currentChunk / chunks) * 100).toFixed(0) + '%'
                            document.querySelector(`.custom-status-${file.id}`).innerText = md5ProgressText
                        })

                    } else {
                        // 在所有分片读取完毕后开始计算整个文件的 MD5
                        let totalMd5 = totalSpark.end()

                        resolve({ totalMd5, /*chunkMd5,*/file })

                        console.log(
                            `MD5计算完毕：${file.name} \nTotal MD5：${totalMd5} \n分片：${chunks} 大小:${file.size} 用时：${new Date().getTime() - time
                            } ms`
                        )
                    }
                }

                fileReader.onerror = function () {
                    this.error(`文件${file.name}读取出错，请检查该文件`)
                    file.cancel()
                    reject()
                }
            })

            function loadNext() {
                let start = currentChunk * chunkSize
                let end = (start + chunkSize >= file.size) ? file.size : start + chunkSize
                // // 判断下一个分片是否是最后一个完整的分片（如果是，将剩余的全部一并读入）
                // if ((end + chunkSize) >= file.size && file.size > end) {
                //     end = file.size
                // }

                fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end))
            }
        },

        fileStatusText(status, response) {
            if (status === "md5") {
                return "校验MD5";
            } else {
                return this.fileStatusTextObj[status];
            }
        },
        statusSet(id, status) {
            const statusMap = {
                md5: {
                    text: '校验MD5',
                    bgc: '#fff'
                },
                merging: {
                    text: '合并中',
                    bgc: '#e2eeff'
                },
                transcoding: {
                    text: '转码中',
                    bgc: '#e2eeff'
                },
                failed: {
                    text: '上传失败',
                    bgc: '#e2eeff'
                }
            }

            this.customStatus = status
            nextTick(() => {
                const statusTag = document.createElement('p')
                statusTag.className = `custom-status-${id} custom-status`
                statusTag.innerText = statusMap[status].text
                statusTag.style.backgroundColor = statusMap[status].bgc

                const statusWrap = document.querySelector(`.file_${id} .uploader-file-status`)
                statusWrap.appendChild(statusTag)
            })
        },

        statusRemove(id) {
            this.customStatus = ''
            nextTick(() => {
                const statusTag = document.querySelector(`.custom-status-${id}`)
                statusTag.remove()
            })
        },


    },
};
</script>

<style lang="scss">
#global-uploader {
    &:not(.global-uploader-single) {
        position: fixed;
        z-index: 20;
        right: 15px;
        bottom: 15px;
        box-sizing: border-box;
    }

    .uploader-app {
        width: 520px;
    }

    .file-panel {
        background-color: #fff;
        border: 1px solid #e2e2e2;
        border-radius: 7px 7px 0 0;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);

        .file-title {
            display: flex;
            height: 40px;
            line-height: 40px;
            padding: 0 15px;
            border-bottom: 1px solid #ddd;

            .operate {
                flex: 1;
                text-align: right;

                .el-button {
                    --el-button-hover-link-text-color: #{$blue};

                    +.el-button {
                        margin-left: 8px;
                    }
                }
            }
        }

        .file-list {
            margin: 0;
            padding: 0;
            position: relative;
            height: 240px;
            overflow-x: hidden;
            overflow-y: auto;
            background-color: #fff;
            transition: all 0.3s;

            .file-item {
                background-color: #fff;
            }
        }

        &.collapse {
            .file-title {
                background-color: #e7ecf2;
            }

            .file-list {
                height: 0;
            }
        }
    }

    .no-file {
        position: absolute;
        top: 45%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #999;

        svg {
            vertical-align: text-bottom;
        }
    }

    .uploader-file {
        &.md5 {
            .uploader-file-resume {
                display: none;
            }
        }
    }

    .uploader-file-icon {
        &:before {
            content: '' !important;
        }

        &[icon='image'] {
            background: url(./images/image-icon.png);
        }

        &[icon='audio'] {
            background: url(./images/audio-icon.png);
            background-size: contain;
        }

        &[icon='video'] {
            background: url(./images/video-icon.png);
        }

        &[icon='document'] {
            background: url(./images/text-icon.png);
        }

        &[icon='unknown'] {
            background: url(./images/zip.png) no-repeat center;
            background-size: contain;
        }
    }

    .uploader-file-actions>span {
        margin-right: 6px;
    }

    .custom-status {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1;
    }
}

/* 隐藏上传按钮 */
#global-uploader-btn {
    position: absolute;
    clip: rect(0, 0, 0, 0);
}

.global-uploader-single {
    #global-uploader-btn {
        position: relative;
    }
}
</style>