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