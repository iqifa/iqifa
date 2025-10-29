import {
  auth,
  onAuthStateChanged,
  signOut,
  db,
  collection,
  getDocs,
  deleteDoc,
  doc
} from "./firebase.js";

// DOM元素
const userInfo = document.getElementById('userInfo');
const postsList = document.getElementById('postsList');
const newPostBtn = document.getElementById('newPostBtn');

// 格式化日期显示
function formatDate(timestamp) {
  if (!timestamp) return '未知时间';
  return new Date(timestamp).toLocaleString();
}

// 渲染分类标签
function renderCategories(categories) {
  if (!categories || categories.length === 0) {
    return '<span class="no-category">无分类</span>';
  }
  return categories.map(cat => `<span class="category-tag">${cat}</span>`).join('');
}
// 渲染多级分类（新增函数）
function renderHierarchicalCategories(categories) {
  if (!categories || categories.length === 0) {
    return '<span class="no-category">无分类</span>';
  }
  
  return categories.map(cat => {
    // 拆分多级分类（如 "前端/JavaScript" 拆分为 ["前端", "JavaScript"]）
    const levels = cat.split('/');
    
    // 为不同层级添加不同样式
    return `<div class="category-hierarchy">
      ${levels.map((level, index) => {
        // 最后一级用深色，其他级用浅色
        const isLastLevel = index === levels.length - 1;
        return `<span class="category-level ${isLastLevel ? 'last-level' : ''}">
          ${level}${index < levels.length - 1 ? ' / ' : ''}
        </span>`;
      }).join('')}
    </div>`;
  }).join('');
}

// 渲染标签
function renderTags(tags) {
  if (!tags || tags.length === 0) {
    return '';
  }
  return tags.map(tag => `<span class="tag-item">${tag}</span>`).join('');
}

// 加载文章列表
async function loadPosts() {
  try {
    const postsCol = collection(db, "posts");
    const postsSnap = await getDocs(postsCol);
    const posts = postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // 按创建时间排序（最新的在前）
    posts.sort((a, b) => b.createdAt - a.createdAt);

    if (posts.length === 0) {
      postsList.innerHTML = "<p style='padding: 1.5rem; text-align: center; color: #666;'>暂无文章，点击上方按钮开始创作吧</p>";
      return;
    }

    // 渲染文章列表
  postsList.innerHTML = posts.map(post => `
    <div class="post-item">
      <div>
        <div class="post-title">${post.title}</div>
        <div class="metadata-tags">
          ${renderTags(post.metadata?.tags || [])}
        </div>
      </div>
      <div class="category-container">
        ${renderHierarchicalCategories(post.metadata?.categories || [])}
      </div>
      <div class="post-date">
        ${post.metadata?.date || formatDate(post.createdAt)}
      </div>
      <div class="post-actions">
        <button class="btn" onclick="window.location.href='admin-editor.html?id=${post.id}'">编辑</button>
        <button class="btn" onclick="confirm('确定删除？') && deletePost('${post.id}')">删除</button>
      </div>
    </div>
  `).join('');
  } catch (error) {
    console.error("加载文章失败:", error);
    postsList.innerHTML = `<p style='padding: 1.5rem; text-align: center; color: #dc3545;'>加载失败: ${error.message}</p>`;
  }
}

// 删除文章
async function deletePost(postId) {
  try {
    await deleteDoc(doc(db, "posts", postId));
    loadPosts(); // 重新加载列表
  } catch (error) {
    console.error("删除失败:", error);
    alert("删除失败: " + error.message);
  }
}

// 暴露deletePost函数到全局，以便在HTML中调用
window.deletePost = deletePost;

// 初始化用户信息
function initUserInfo(user) {
  if (user) {
    userInfo.innerHTML = `
      <span style="margin-right: 1rem;">${user.email}</span>
      <button class="btn" style="background-color: #e74c3c; color: white;" id="logoutBtn">
        退出登录
      </button>
    `;
    document.getElementById('logoutBtn').addEventListener('click', () => {
      signOut(auth).then(() => window.location.reload());
    });
    loadPosts(); // 加载文章列表
  } else {
    userInfo.innerHTML = `
      <button class="btn btn-primary" onclick="window.location.href='login.html'">
        登录
      </button>
    `;
    postsList.innerHTML = '<p style="padding: 1.5rem; text-align: center;">请先登录管理您的文章</p>';
  }
}

// 初始化
function init() {
  // 新建文章按钮跳转
  newPostBtn.addEventListener('click', () => {
    window.location.href = 'admin-editor.html';
  });

  // 监听登录状态
  onAuthStateChanged(auth, initUserInfo);
}

document.addEventListener('DOMContentLoaded', init);