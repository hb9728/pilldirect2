import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 🌐 Tailwind or global styles
import './style.css'

// ✅ FullCalendar styles — ensure these are loaded globally
import '@fullcalendar/daygrid/main.css'
import '@fullcalendar/timegrid/main.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
