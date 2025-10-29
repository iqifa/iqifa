// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import {
    ref as storageRef,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";
import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyC1Lqi7VtImX07P2X2QFdxD-irrn4P5oGg",
    authDomain: "iqifa-blog.firebaseapp.com",
    projectId: "iqifa-blog",
    storageBucket: "iqifa-blog.firebasestorage.app",
    messagingSenderId: "987890590833",
    appId: "1:987890590833:web:22495876288bc435f2e7d0",
    measurementId: "G-ZCY764T6Y5"
};

const app = initializeApp(firebaseConfig);

// 实例
export const db = getFirestore(app);
export const auth = getAuth(app);
// 统一导出 Firestore 常用方法（供 admin.js / app.js 直接从本文件导入）
export {
  // Firestore
  collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc,
  // Auth
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
    // Storage
    storageRef, uploadBytesResumable, getDownloadURL, deleteObject
};