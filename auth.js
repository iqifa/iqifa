import {
  auth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "./firebase.js";

// DOM元素
const showLoginBtn = document.getElementById('showLoginBtn');
const closeLoginBtn = document.getElementById('closeLoginBtn');
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginStatus = document.getElementById('loginStatus');

// 显示登录弹窗
showLoginBtn.addEventListener('click', () => {
  loginModal.classList.add('active');
  emailInput.focus();
});

// 关闭登录弹窗
closeLoginBtn.addEventListener('click', () => {
  loginModal.classList.remove('active');
  resetForm();
});

// 点击弹窗外部关闭
loginModal.addEventListener('click', (e) => {
  if (e.target === loginModal) {
    loginModal.classList.remove('active');
    resetForm();
  }
});

// 重置表单
function resetForm() {
  loginForm.reset();
  loginStatus.className = 'status-message';
}

// 登录表单提交
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  
  try {
    // 显示加载状态
    loginStatus.textContent = '登录中...';
    loginStatus.className = 'status-message status-success';
    
    // 调用Firebase邮箱登录
    await signInWithEmailAndPassword(auth, email, password);
    
    // 登录成功提示
    loginStatus.textContent = '登录成功，正在跳转...';
    loginStatus.className = 'status-message status-success';
    
    // 延迟跳转管理页面
    setTimeout(() => {
      window.location.href = 'admin.html';
    }, 1000);
    
  } catch (error) {
    // 处理登录错误
    console.error('登录失败:', error);
    let errorMessage = '登录失败，请检查邮箱和密码';
    
    // 具体错误类型处理
    switch(error.code) {
      case 'auth/user-not-found':
        errorMessage = '该邮箱未注册';
        break;
      case 'auth/wrong-password':
        errorMessage = '密码错误';
        break;
      case 'auth/invalid-email':
        errorMessage = '邮箱格式无效';
        break;
    }
    
    loginStatus.textContent = errorMessage;
    loginStatus.className = 'status-message status-error';
  }
});

// 检查用户是否已登录
onAuthStateChanged(auth, (user) => {
  if (user) {
    // 如果已登录，直接跳转到管理页面
    window.location.href = 'admin.html';
  }
});