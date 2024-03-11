import {createApp, toRaw} from 'vue'
// @ts-ignore
import App from './App.vue'
// @ts-ignore
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// @ts-ignore
import uploader from 'vue-simple-uploader';
import 'vue-simple-uploader/dist/style.css'

import {Icon} from '@iconify/vue'
import store from './stores'
import {createPinia} from 'pinia'
import { createPersistedState } from 'pinia-persistedstate-plugin'

const pinia = createPinia();
const persist = createPersistedState();
pinia.use(persist)

createApp(App)
    .use(router)
    .use(pinia)
    .use(uploader)
    .use(ElementPlus)
    .use(store)
    .component('Icon', Icon).mount('#app')
