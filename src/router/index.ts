import { createRouter, createWebHashHistory } from 'vue-router'

import upload from "../components/GlobalUploader/upload.vue"

import preview from '../components/preview.vue'

import list from '../components/list.vue'

import login from '../views/LoginView.vue'

import home from '../views/HomeView.vue'

import first from '../views/FirstView.vue'

import share from '../views/GetShareView.vue'

import sharelist from '../components/ShareList.vue'
const routes = [
  {
    path: '/',
    name: 'login',
    component: login
  },
  {
    path: '/share',
    name: 'share',
    component: share,
  },
  {
    path: '/',
    name: 'first',
    component: first,
    children: [{
      path: '/home',
      name: 'home',
      component: home
    },
    {
      path: '/preview',
      name: 'preview',
      component: preview
    },
    {
      path: '/list',
      name: 'list',
      component: list
    },
    {
      path: '/sharelist',
      name: 'sharelist',
      component: sharelist
    }
    ]
  },
  // {
  //   path: '/first',
  //   name: 'first',
  //   component: first
  // },
  // {
  //   path: '/download',
  //   name: 'download',
  //   component: download
  // },
  // {
  //   path: '/preview',
  //   name: 'preview',
  //   component: preview
  // },
  // {
  //   path: '/list',
  //   name: 'list',
  //   component: list
  // },
  // {
  //   path: '/test',
  //   name: 'test',
  //   component: test
  // }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
