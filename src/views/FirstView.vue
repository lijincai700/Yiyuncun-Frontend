<template>
    <el-row class="app-container">
        <el-col :span="4" class="left-bar">
            <Menu></Menu>
        </el-col>
        <el-col :span="20" class="right-contain">
            <router-view></router-view>
        </el-col>
    </el-row>
</template>
<script lang="ts" setup>//使用ts编写，
// 有setup之后无需使用export default
    import Menu from "../components/Menu.vue";
</script>
<style>

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
</style>