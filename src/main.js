import { createApp } from 'vue'
import App from './App.vue'
import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: "AIzaSyDr8MoJIIRIXwQkZBCaTTmfcJXGlvTo6PA",
  authDomain: "vue-task-74b7f.firebaseapp.com",
  databaseURL: "https://vue-task-74b7f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "vue-task-74b7f",
  storageBucket: "vue-task-74b7f.appspot.com",
  messagingSenderId: "395470495308",
  appId: "1:395470495308:web:b4f96bcee2a916c92e5ee9"
};

initializeApp(firebaseConfig)

createApp(App).mount('#app')
