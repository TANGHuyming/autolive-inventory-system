import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'

import App from './App.vue'
import router from './router'

// on app load, before mount (put this in main.ts, ideally before createApp)
function initTheme() {
  const saved = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (saved === 'dark' || (!saved && prefersDark)) {
    document.documentElement.classList.add('dark')
  }
}
initTheme()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
