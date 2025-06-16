import { createApp } from 'vue'
import App from './App.vue'
import router from './router'     // our router setup
import './style.css'

const app = createApp(App)
app.use(router)                  // <-- add router
app.mount('#app')
