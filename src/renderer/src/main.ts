import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router/index'
import { createPinia } from 'pinia'
import piniaPlupinPersistedstate from 'pinia-plugin-persistedstate'
const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPlupinPersistedstate)

app.use(router).use(pinia).mount('#app')
