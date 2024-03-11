export function convertFileSize(size) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let index = 0;
    while (size >= 1024 && index < units.length - 1) {
        size /= 1024;
        index++;
    }
    return size.toFixed(2) + ' ' + units[index];
}

export function formatDateTime(datetime) {
    const now = new Date();
    const date = new Date(datetime);

    const diff = Math.floor((now - date) / 1000); // 计算时间差，单位为秒

    if (diff < 60) {
        return diff + "秒前";
    } else if (diff < 3600) {
        return Math.floor(diff / 60) + "分钟前";
    } else if (diff < 86400) {
        return Math.floor(diff / 3600) + "小时前";
    } else if (diff < 2592000) {
        return Math.floor(diff / 86400) + "天前";
    } else {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return year + "-" + month.toString().padStart(2, "0") + "-" + day.toString().padStart(2, "0");
    }
}


export function matchIcon(fileType) {
    // IMAGE_PNG(1, "image/png"),
    // IMAGE_JPG(2, "image/jpg"),
    // APPLICATION_PDF(3, "application/pdf"),
    // VIDEO_MP4(4, "video/mp4"),
    // AUDIO_MP3(5, "audio/mp3"),
    // IMAGE_JPEG(6, "image/jpeg"),
    // APPLICATION_MSWORD(7, "application/msword"),
    // WORD_DOCUMENT(8, "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
    // EXCEL_SHEET(9, "application/vnd.ms-excel"),
    // EXCELX_SHEET(10, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
    // PPTX(11, "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
    // TXT(12, "text/plain");
    const icons = {
        1:'png',     // 对应 IMAGE_PNG
        2:'jpg',     // 对应 IMAGE_JPG
        3:'pdf',     // 对应 APPLICATION_PDF
        4:'mp4',     // 对应 VIDEO_MP4
        5:'mp3',     // 对应 AUDIO_MP3
        6:'jpeg',    // 对应 IMAGE_JPEG
        7:'doc',     // 对应 APPLICATION_MSWORD
        8:'docx',    // 对应 WORD_DOCUMENT
        9:'xls',     // 对应 EXCEL_SHEET
        10:'xlsx',   // 对应 EXCELX_SHEET
        11:'pptx',   // 对应 PPTX
        12:'txt'     // 对应 TXT
    };


    // for (const key in icons) {
    //     fileType = fileType.toString(); // 把数字转为字符串
    //     if (fileType.includes(key)) {
    //         return icons[key];
    //     }
    // }
    // // 如果没有找到匹配的图标字符串，可以返回一个默认值或者null
    // return null;
    let extension = icons[fileType];

    if (extension) {
        return extension;
    }
}
