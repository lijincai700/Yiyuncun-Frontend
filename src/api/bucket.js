// @ts-ignore
import {ElMessage} from "element-plus";
// request
import api from "../utils/request"

export async function getBucketListApi() {
    return api.get("/bucket/getBucketList").then(res => {
        return res
    })
}

export async function createBucketApi(bucket) {
    return api.post("/bucket/createBucket",bucket
    ).then(res => {
        ElMessage.success(res.message)
        return res
    })
}

export async function deleteBucketApi(bucketId) {
    return api.delete("/bucket/deleteBucket",{
        params:{
            bucketId
        }
    }
    ).then(res => {
        ElMessage.success(res.message)
        return res
    })
}