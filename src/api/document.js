import {ElMessage} from "element-plus";
// request
import api from "../utils/request"


export async function enCondingApi(filename) {
    return api.get("/download1/Encoding",{
        params: {
            filename: filename
        }
    }).then(res => {
        return res
    })
}
export async function getDocumentListApi(bucketId) {
    return api.get("/document/list",{
        params: {
            bucketId: bucketId
        }
    }).then(res => {
        return res
    })
}

export async function DocumentDeleteApi(documentId) {
    return api.delete("/document/delete",{
        params: {
            documentId: documentId
        }
    }).then(res => {
        return res
    })
}
export async function getTypeCount(){
    return api.get("/document/getTypeCount").then(res =>{
        return res
    })
}
// 确认上传完成
export async function confirmUploadApi(md5) {
    return api.post("/document/confirmUpload",{
        md5: md5
    }).then(res => {
        ElMessage.success(res.message)
        return res
    })
}

// 文件分享
export async function shareDocumentApi(shareDocument) {
    return await api.post("/share/shareDocument",shareDocument).then(res => {
        return res
    })
}

export async function getShareDocumentListApi() {
    return await api.get("/share/getShareDocumentList").then(res => {
        return res
    })
}

export async function deleteSharedApi(id) {
    return await api.delete("/share/deleteShareDocument",{
        params: {
            shareId: id
        }
    }).then(res => {
        return res
    })
}


export async function modifySharePasswordApi(shareDocument) {
    return await api.post("/share/modifySharePassword",
        shareDocument
    ).then(res => {
        return res
    })
}

export async function downloadShareDocumentApi(documentId,sharePassword){
    console.log(documentId)
    return await api.get("/share/downloadShareDocument",{
        params:{
            documentId:documentId,
            sharePassword:sharePassword
        }
    }
    ).then(res => {
        return res
    })
}