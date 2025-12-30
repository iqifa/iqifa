// 1. 引入 Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

// 2. 您的 Firebase 配置 (请将您之前 firebase.js 里的配置对象复制到这里)
const firebaseConfig = {
    apiKey: "AIzaSyC1Lqi7VtImX07P2X2QFdxD-irrn4P5oGg",
    authDomain: "iqifa-blog.firebaseapp.com",
    projectId: "iqifa-blog",
    storageBucket: "iqifa-blog.firebasestorage.app",
    messagingSenderId: "987890590833",
    appId: "1:987890590833:web:22495876288bc435f2e7d0",
    measurementId: "G-ZCY764T6Y5"
};

// 3. 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 4. 导出服务实例，供 app.js 使用
export const db = getFirestore(app);
export const auth = getAuth(app);