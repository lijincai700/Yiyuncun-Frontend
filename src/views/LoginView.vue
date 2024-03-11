<template>
    <div class="login-register">
      <div class="contain">
        <div :class="{ active: isLogin }" class="big-box">
          <div v-if="isLogin" class="big-contain">
            <div class="btitle">账户登录</div>
            <div class="bform">
              <input v-model="form.username" placeholder="账号" type="username" />
              <input v-model="form.userpwd" placeholder="密码" type="password" />
            </div>
            <button class="bbutton" @click="tryLogin">登录</button>
          </div>
          <div v-else class="big-contain">
            <div class="btitle">创建账户</div>
            <div class="bform">
              <input v-model="form.username" placeholder="账号" type="username" />
              <input v-model="form.userpwd" placeholder="密码" type="password" />
              <input v-model="form.confirmpwd" placeholder="确认密码" type="password" />
            </div>
            <button class="bbutton" @click="tryRegister">注册</button>
          </div>
        </div>
        <div :class="{ active: isLogin }" class="small-box">
          <div v-if="isLogin" class="small-contain">
            <div class="stitle">你好，朋友!</div>
            <p class="scontent">开始注册，一起加入逸云存</p>
            <button class="sbutton" @click="changeType">注册</button>
          </div>
          <div v-else class="small-contain">
            <div class="stitle">欢迎回来!</div>
            <p class="scontent">与我们保持联系，请登录你的账户</p>
            <button class="sbutton" @click="changeType">登录</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ElMessage } from "element-plus";
  import { ref } from "vue";
  // import { useStore } from "vuex";
  
  import {useTokenStore} from "../stores/token"
  import { post } from "../api/user.js";
  import router from "../router";
  const isLogin = ref(true);
  // const existed = ref(false);
  const form = ref({
    username: "",
    userpwd: "",
    confirmpwd: "",
  });
  //登录
  const tokenStore = useTokenStore()
  const tryLogin = async () => {
    const response = await post('/user/login', {
      username: form.value.username,
      password: form.value.userpwd
    });
    tokenStore.setToken(response.data)//存储token到vuex
    ElMessage.success("登录成功")
    router.push("/home")
  };
  
  const tryRegister = async () => {
    if (form.value.userpwd !== form.value.confirmpwd) {
      ElMessage.error('两次输入的密码不一致，请重新输入!');
      return;
    }
    const response = await post('/user/register', {
      username: form.value.username,
      password: form.value.userpwd
    });
    if (response.code === 0) {
      ElMessage({
        showClose: true,
        message: "注册成功,欢迎登录逸云存！",
        type: "success",
      });
    }
  }
  const changeType = () => {
    isLogin.value = !isLogin.value;
    form.value.username = "";
    form.value.userpwd = "";
    form.value.confirmpwd = "";
  };
  </script>
  
  <style scoped>
  .login-register {
    width: 100vw;
    height: 100vh;
    box-sizing: border-box;
    background-image: url("../images/login.jpg");
    background-size: cover;
    background-repeat: no-repeat;
  }
  
  .contain {
    width: 60%;
    height: 60%;
    position: relative;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    border-radius: 20px;
    box-shadow: 0 0 3px #f0f0f0, 0 0 6px #f0f0f0;
  }
  
  .big-box {
    width: 70%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 30%;
    transform: translateX(0%);
    transition: all 1s;
  }
  
  .big-contain {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  .btitle {
    font-size: 1.5em;
    font-weight: bold;
    color: rgb(101, 151, 255);
  }
  
  .bform {
    width: 100%;
    height: 40%;
    padding: 2em 0;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
  }
  
  .bform .errTips {
    display: block;
    width: 50%;
    text-align: left;
    color: red;
    font-size: 0.7em;
    margin-left: 1em;
  }
  
  .bform input {
    width: 50%;
    height: 30px;
    border: none;
    outline: none;
    border-radius: 10px;
    padding-left: 2em;
    background-color: #f0f0f0;
  }
  
  .bbutton {
    width: 20%;
    height: 40px;
    border-radius: 24px;
    border: none;
    outline: none;
    background-color: rgb(101, 151, 255);
    color: #fff;
    font-size: 0.9em;
    cursor: pointer;
  }
  
  .small-box {
    width: 30%;
    height: 100%;
    background: linear-gradient(135deg, rgb(236, 245, 255), rgb(101, 151, 255));
    position: absolute;
    top: 0;
    left: 0;
    transform: translateX(0%);
    transition: all 1s;
    border-top-left-radius: inherit;
    border-bottom-left-radius: inherit;
  }
  
  .small-contain {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  .stitle {
    font-size: 1.5em;
    font-weight: bold;
    color: #fff;
  }
  
  .scontent {
    font-size: 0.8em;
    color: #fff;
    text-align: center;
    padding: 2em 4em;
    line-height: 1.7em;
  }
  
  .sbutton {
    width: 60%;
    height: 40px;
    border-radius: 24px;
    border: 1px solid #fff;
    outline: none;
    background-color: transparent;
    color: #fff;
    font-size: 0.9em;
    cursor: pointer;
  }
  
  .big-box.active {
    left: 0;
    transition: all 0.5s;
  }
  
  .small-box.active {
    left: 100%;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-top-right-radius: inherit;
    border-bottom-right-radius: inherit;
    transform: translateX(-100%);
    transition: all 1s;
  }
  </style>
  