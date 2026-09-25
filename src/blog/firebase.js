import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyC1Lqi7VtImX07P2X2QFdxD-irrn4P5oGg',
  authDomain: 'iqifa-blog.firebaseapp.com',
  projectId: 'iqifa-blog',
  storageBucket: 'iqifa-blog.firebasestorage.app',
  messagingSenderId: '987890590833',
  appId: '1:987890590833:web:22495876288bc435f2e7d0',
  measurementId: 'G-ZCY764T6Y5',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
