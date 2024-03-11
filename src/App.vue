<template>
  <div>
    <!-- 根据登录状态显示 GlobalUploader 组件 -->
    <GlobalUploader />
    <router-view></router-view>
    <!-- <GlobalUploader /> -->
    <!-- <FirstView></FirstView> -->
  </div>
</template>
<script lang="ts" setup>

// import Menu from "./components/Menu.vue";
import GlobalUploader from "./components/GlobalUploader/upload.vue";
// import FirstView from './views/FirstView.vue';
</script>
<style>
@import "assets/font/font.css";
@import "style.css";

.app-container {
  height: 100vh;
}

.left-bar {
  height: 100%;
}

.right-contain {
  height: 100%;
  overflow: hidden;
}

.hello {
  margin-top: -18px;
  color: gray;
  font-weight: 600;
  font-size: 14px;
}

.show-main {
  padding-left: 55px;
  padding-right: 20px;
  padding-bottom: 16px;
  margin-left: 38px;
}

.top-padding {
  padding-top: 12px;
}

.left-padding {
  padding-left: 10%;
  border-left: 2px solid rgb(246, 246, 246);
  height: 100%;
}
</style>