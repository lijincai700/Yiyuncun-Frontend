
import axios from "axios";
import { useTokenStore } from "../stores/token";
import { ElMessage } from 'element-plus';
import streamSaver from 'streamsaver'

export async function getFileBlocks(url, data) {
    const tokenStore = useTokenStore();
    const fileStream = streamSaver.createWriteStream('file-name.zip')
    const writer = fileStream.getWriter()
    return axios.create({
        baseURL: "http://localhost:10086/",
        responseType: "json",  // 更改为json
        headers: {
            Authorization: tokenStore.token
        }
    }).get(url, { params: data })
        .then(response => {
            // 获取数据流
            const readableStream = response.body
            if (window.WritableStream && readableStream.pipeTo) {
                console.log("pipeTo")
                // 使用 pipeTo 直接将可读流 pipe 到可写流
                return readableStream.pipeTo(fileStream)
                    .then(() => writer.close())
            }

            // Fallback，手动每次读取并写入
            const reader = readableStream.getReader()
            const pump = () =>
                reader.read()
                    .then(res => res.done
                        ? writer.close()
                        : writer.write(res.value).then(pump)
                    )

            pump().catch(e => { throw e })
        })
        .catch(error => {
            ElMessage({
                showClose: true,
                message: '数据异常',
                type: 'error',
            });
            throw error;
        });
}

export async function getFileBlock(blockUrl) {
    const tokenStore = useTokenStore();
    return axios.create({
        responseType: "blob",
        headers: {
            Authorization: tokenStore.token
        }
    }).get(blockUrl + "/block")
        .then(response => {
            return response.data;
        })
        .catch(error => {
            ElMessage({
                showClose: true,
                message: '数据异常',
                type: 'error',
            });
            throw error;
        });
}

export async function getDownloadFile(url, data) {

    const tokenStore = useTokenStore();
    return axios.create({
        // 根据您的实际情况设置baseURL
        baseURL: "http://localhost:10086/",
        responseType: "blob",
        headers: {
            Authorization: tokenStore.token
        }
    }).get(url,
        {
            params: data
        }
    )
        .then(response => {
            return response.data;
        })
        .catch(error => {
            // 在实际应用中，您可以根据需要处理错误，例如显示错误消息等
            ElMessage({
                showClose: true,
                message: '数据异常',
                type: 'error',
            });
            throw error;
        });
}
