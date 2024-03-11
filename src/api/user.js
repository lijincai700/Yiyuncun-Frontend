// @ts-ignore
import {ElMessage} from "element-plus";
// request
import api from "../utils/request"
export async function post(url, data) {
    return api.post(url, data)
        .then(response => {
            return response;
        })
        .catch(error => {
            // 在实际应用中，您可以根据需要处理错误，例如显示错误消息等
            throw error;
        });
}

export async function get(url, data) {
    return api.get(url, data)
        .then(response => {
            return response;
        })
        .catch(error => {
            // 在实际应用中，您可以根据需要处理错误，例如显示错误消息等
            ElMessage({
                showClose: true,
                type: 'error',
            });
            throw error;
        });
}

export async function logoutApi(){
    return api.get("/user/logout").then(response => {
        return response;
    })
}

//获取文件类型和数量