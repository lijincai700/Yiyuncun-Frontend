<template>
  <div class="left-padding">
    <el-badge :value="3" class="item">
      <el-dropdown trigger="click">
        <img slot="dropdown-trigger" alt="Notification" class="notification-icon" src="../images/通知.png" />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="notification in notifications" :key="notification.id">
              <el-card shadow="hover">{{ notification.message }}</el-card>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-badge>
    <div class="father">
      <div id="mycharts" ref="myRef" class="chart-box" />
    </div>
    <el-row :gutter="10" class="info-card">
      <el-col :span="8">
        <div class="card">
          <img alt="" src="../images/图片.png">
        </div>
      </el-col>
      <el-col :span="16" class="card-info">
        <el-row class="smallTitle">图片</el-row>
        <el-row>
          <el-col :span="10" class="smallText">
            文件数：{{ image.count }}
          </el-col>
          <el-col :span="14" class="smallSize">
            {{ image.size }}
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-row :gutter="10" class="info-card">
      <el-col :span="8">
        <div class="card">
          <img alt="" src="../images/文档.png">
        </div>
      </el-col>
      <el-col :span="16" class="card-info">
        <el-row class="smallTitle">文档</el-row>
        <el-row>
          <el-col :span="10" class="smallText">
            文件数：{{ document.count }}
          </el-col>
          <el-col :span="14" class="smallSize">
            {{ document.size }}
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-row :gutter="10" class="info-card">
      <el-col :span="8">
        <div class="card">
          <img alt="" src="../images/音频.png">
        </div>
      </el-col>
      <el-col :span="16" class="card-info">
        <el-row class="smallTitle">音频</el-row>
        <el-row>
          <el-col :span="10" class="smallText">
            文件数：{{ video.count }}
          </el-col>
          <el-col :span="14" class="smallSize">
            {{ video.size }}
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-row :gutter="10" class="info-card">
      <el-col :span="8">
        <div class="card">
          <img alt="" src="../images/其他.png">
        </div>
      </el-col>
      <el-col :span="16" class="card-info">
        <el-row class="smallTitle">其他</el-row>
        <el-row>
          <el-col :span="10" class="smallText">
            文件数：{{ other.count }}
          </el-col>
          <el-col :span="14" class="smallSize">
            {{ other.size }}
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>
  
<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { getTypeCount } from "../api/document";
import * as echarts from "echarts";

// 初始值，假设为1GB
const size = 1024 * 1024 * 1024;

const myRef = ref(null);

let document = ref({ count: 0, size: "" });
let image = ref({ count: 0, size: "" });
let video = ref({ count: 0, size: "" });
let other = ref({ count: 0, size: "" });

// Function to format file size
function formatSize(sizeInBytes) {
  if (sizeInBytes === 0) return "0B";

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(sizeInBytes) / Math.log(k));

  return parseFloat((sizeInBytes / Math.pow(k, i)).toFixed(2)) + sizes[i];
}

const initT = (imgSize , videoSize , docSize , otherSize, ) => {
  if (myRef.value) {
    //@ts-ignore
    const myChart = echarts.init(myRef.value);
    myChart.setOption({
      title: {
        left: 'center',
        top: 'middle',
        text: "存储空间",
        textStyle: {
          fontSize: 20,
          color: "rgb(163,197,247)",
        },
      },

      tooltip: {
        show: true,
        trigger: 'item',
        showContent: true,
        formatter: function (params) {
          return params.name + ':' + params.data.nvalue;
        }
      },
      series: [
        {
          type: "pie",
          radius: ["45%", "60%"],
          avoidLabelOverlap: false,
          data: [
            {
              name: "音频",
              value: videoSize,
              nvalue: formatSize(videoSize),
              itemStyle: {
                color: "rgb(255,209,60)",
              },
              label: {
                show: false,
              },
            },
            {
              name: "图片",
              value: imgSize,
              nvalue: formatSize(imgSize),
              itemStyle: {
                color: "rgb(0,0,255)",
              },

              label: {
                show: false,
              },
            },
            {
              name: "文档",
              value: docSize,
              nvalue: formatSize(docSize),
              itemStyle: {
                color: "rgb(255,103,97)",
              },
              label: {
                show: false,
              },
            },
            {
              name: "其他",
              value: otherSize,
              nvalue: formatSize(otherSize),
              itemStyle: {
                color: "rgb(0,0,254)",
              },
              label: {
                show: false,
              },
            },
            {
              // name: "其他",
              value: imgSize + videoSize + docSize + otherSize,
              itemStyle: {
                color: "rgb(255,255,255)",
              },
              label: {
                show: false,
              },
              tooltip: {
                show: false,
              },
            },
          ],
          startAngle: 180,
        },

      ],
    });
  }
};

// Get data from API
onMounted(async () => {
  const res = await getTypeCount();
  console.log(res.data);
  if (res.data) {
    document.value.count = res.data.document.count;
    document.value.size = formatSize(res.data.document.size);

    video.value.count = res.data.video.count;
    video.value.size = formatSize(res.data.video.size);

    image.value.count = res.data.image.count;
    image.value.size = formatSize(res.data.image.size);

    other.value.count = res.data.other.count;
    other.value.size = formatSize(res.data.other.size);
  }
  initT(res.data.image.size, res.data.video.size, res.data.document.size , res.data.other.size);

});



const notifications = ref([
  { id: 1, message: "【桶世界通知】欢迎使用桶世界分布式对象存储平台！请注意，我们已经更新了平台的安全性和性能。" },
  {
    id: 2,
    message: "【桶世界通知】重要通知：即将进行系统维护，预计将于下周二的凌晨2点开始，为确保服务的稳定性，请提前做好相应的准备和调整。"
  },
  {
    id: 3,
    message: "【桶世界通知】我们很高兴宣布，桶世界平台现在支持新的高级功能，包括自定义存储策略和数据复制选项。请查看文档以了解更多详情。"
  },

]);

</script>
  
  
<style scoped>
.item {
  margin-top: 30px;
  padding-top: 0;
}

.item img {
  height: 24px;
}

.el-card {
  width: 120%;
  padding: 0;
}

.father {
  height: 190px;
}

.chart-box {
  width: 100%;
  height: 280px;
  margin-top: -10px;
  //overflow: hidden;
}

.card {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 7px;
  box-sizing: border-box;
}

.card img {
  margin: 5px;
  width: 30px;
  height: 30px;
  max-width: 100%;
  max-height: 100%;
}

.smallTitle {
  //padding: 2px; font-weight: 600; font-size: 14px; color: #181818;
}

.smallText {
  font-weight: 600;
  font-size: 10px;
  color: gray;
}

.smallSize {
  font-weight: 600;
  font-size: 10px;
  color: #92BAF5;
}


.card-info {
  //margin: 5px;

}

.info-card {
  margin-bottom: 27px;
  padding: 10px 5px 5px;
  background-color: #F9F8FF;
}
</style>