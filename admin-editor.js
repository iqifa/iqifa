import {
  auth,
  onAuthStateChanged,
  db,
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
} from "./firebase.js";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
// DOM元素
const titleInput = document.getElementById('titleInput');
const saveBtn = document.getElementById('saveBtn');
const statusMessage = document.getElementById('statusMessage');
const previewArea = document.getElementById('previewArea');
let toastuiEditor; // 全局Markdown编辑器实例
let currentThumbnailBase64 = null;
// 从内容中提取元数据（支持多级分类）
function extractMetadata(content) {
  const metadata = {
    date: new Date().toISOString().slice(0, 19).replace('T', ' '),
    categories: [], // 支持多级分类，如 ["前端/JavaScript", "框架/Vue"]
    tags: []
  };
  
  const lines = content.split('\n');
  
  if (lines.length > 0 && lines[0].trim() === '---') {
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '---') break;
      
      const [key, value] = line.split(':').map(item => item.trim());
      if (!key || !value) continue;
      
      switch (key.toLowerCase()) {
        case 'date':
          metadata.date = value;
          break;
          
        case 'categories':
          // 提取多级分类，如 [前端/JavaScript, 框架/Vue]
          const cats = value.match(/\[([^]+?)\]/);
          if (cats && cats[1]) {
            metadata.categories = cats[1].split(',').map(c => c.trim());
          }
          break;
          
        case 'tags':
          const tgs = value.match(/\[([^]+?)\]/);
          if (tgs && tgs[1]) {
            metadata.tags = tgs[1].split(',').map(t => t.trim());
          }
          break;
      }
    }
  }
  
  return metadata;
}

// 获取URL参数中的文章ID
function getPostId() {
  return new URLSearchParams(window.location.search).get('id');
}

// 显示状态消息
function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.className = 'status-message';
  statusMessage.classList.add(isError ? 'status-error' : 'status-success');
  
  setTimeout(() => {
    statusMessage.className = 'status-message';
  }, 3000);
}


// 初始化Markdown编辑器
// function initMarkdownEditor() {
//   if (simplemde) {
//     simplemde.toTextArea();
//   }
//     const imageUploader = document.getElementById('imageUploader');
//   simplemde = new SimpleMDE({
//     element: document.getElementById('markdownEditor'),
//     autoDownloadFontAwesome: true,
//     spellChecker: false,
//     // 启用键自带双栏模式（关键配置）
//     sideBySide: true,  // 启用编辑区与预览区并排显示

//     renderingConfig: {
//       singleLineBreaks: false, // 禁用“单个回车转<br>”，与 post.js 的默认行为保持一致
//       gfm: true      // 保持 GFM (GitHub Flavored Markdown) 开启
//     },

//     toolbar: [
//       "bold", "italic", "strikethrough", "heading",
//       "|", "quote", "code", "link", 
//       {
//         name: "image",
//         action: function customImage() {
//           // 触发文件选择器
//           imageUploader.click();
//         },
//         className: "fa fa-picture-o",
//         title: "插入图片"
//       },
//       "|", "unordered-list", "ordered-list", "checked-list",
//       "|", "table", "horizontal-rule", 
//       "|","side-by-side", "fullscreen","preview",  // 保留preview按钮切换按钮
//       "|", "guide"
//     ],
//     status: false,
//   });


//    imageUploader.addEventListener('change', handleImageUpload);
//   function handleImageUpload(e) {
//     const file = e.target.files[0];
//     if (!file) return;

//     // 验证文件类型
//     if (!file.type.startsWith('image/')) {
//       alert('请选择图片文件（jpg、png、gif等）');
//       return;
//     }

//     // 验证文件大小（限制10MB）
//     if (file.size > 10 * 1024 * 1024) {
//       alert('图片大小不能超过10MB');
//       return;
//     }

//     // 读取文件并转换为base64
//     const reader = new FileReader();
//     reader.onload = function(event) {
//       // 获取编辑器光标位置
//       const cursor = simplemde.codemirror.getCursor();
//       // 插入Markdown图片语法（![alt](base64...)）
//       simplemde.codemirror.replaceRange(
//         `![图片描述](${event.target.result})`,
//         cursor
//       );
//       // 清空文件选择器，允许重复选择同一文件
//       imageUploader.value = '';
//     };
//     // 以DataURL格式读取（base64编码）
//     reader.readAsDataURL(file);
//   }

//   // 移除自定义预览更新逻辑
//   // 删掉：simplemde.codemirror.on('change', updatePreview);
// }

function initMarkdownEditor() {
  const markdownContent = document.getElementById('markdownEditor');
  
  // 检查 Toast UI 库是否加载成功
  if (!window.toastui || !window.toastui.Editor) {
    console.error("Toast UI Editor 库未找到。请检查 admin-editor.html 中的 <script> 标签。");
    // 如果加载失败，可以给用户一个简单的文本输入框作为备用
    markdownContent.innerHTML = '<textarea id="markdownFallback" style="width: 100%; height: 500px;"></textarea>';
    return;
  }
  
  // 初始化 Toast UI Editor 实例
  toastuiEditor = new window.toastui.Editor({
    el: markdownContent,
    height: '500px',
    initialEditType: 'markdown', // 默认 Markdown 模式
    previewStyle: 'vertical',   // 垂直预览，类似 SimpleMDE 的 sideBySide
    markdown: { breaks: false ,gfm: true} ,
    toolbarItems: [
    ['heading', 'bold', 'italic', 'strike'],
    ['hr', 'quote'],
    ['ul', 'ol', 'task', 'indent', 'outdent'],
    ['table', 'link', 'image',{
      el: createFullscreenButton(),  // 自定义按钮
      command: 'fullscreen',
      tooltip: '切换全屏'
    }],
      ['scrollSync'],
    ['code', 'codeblock'],
    
  ],
    customHTMLRenderer: {
  softbreak() { return ' '; } // 单回车当空格处理
}
    // GFM 默认已启用，通常会自动忽略单个回车（Line Breaks: false）
    // 如果仍有问题，可在此处配置 hooks 或自定义渲染器。
    // 但我们先使用默认配置来保持简洁和一致性。
  });
}


function createFullscreenButton() {
  const button = document.createElement('button');
  button.className = 'toastui-editor-toolbar-icons ti-fullscreen';
  button.style.backgroundImage = 'url("https://cdn-icons-png.flaticon.com/512/709/709586.png")'; // 图标可换
  button.style.backgroundSize = '16px';
  button.addEventListener('click', toggleFullscreen);
  return button;
}

function toggleFullscreen() {
  const editorContainer = document.querySelector('.editor-container');
  editorContainer.classList.toggle('fullscreen');

  if (editorContainer.classList.contains('fullscreen')) {
    toastuiEditor.setHeight('100vh');
  } else {
    toastuiEditor.setHeight('500px');
  }
}
// 添加加载现有文章缩略图的逻辑
async function loadPostData() {
  const postId = getPostId();
  if (!postId) return;

  try {
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);
    
    if (postSnap.exists()) {
      const data = postSnap.data();
      titleInput.value = data.title || "";
      
      // 显示已有的缩略图（Base64格式）
      if (data.thumbnail) {
        currentThumbnailBase64 = data.thumbnail;
        document.getElementById('thumbnailPreview').innerHTML = `
          <img src="${data.thumbnail}" style="max-width: 100%; border-radius: 8px;" alt="缩略图">
          <button id="removeThumbnail" class="mt-2 text-sm text-red-500 hover:text-red-700">移除缩略图</button>
        `;
        document.getElementById('removeThumbnail').addEventListener('click', function() {
          currentThumbnailBase64 = null;
          document.getElementById('thumbnailPreview').innerHTML = '';
        });
      }

      // 加载文章内容（原有逻辑）
      const waitForEditor = setInterval(() => {
        if (toastuiEditor) {
            clearInterval(waitForEditor);
            toastuiEditor.setMarkdown(data.content || "", false);
            document.title = `${data.title || '编辑文章'} - 博客管理`;
        }
        
      }, 100);
    }
  } catch (error) {
    console.error("加载失败:", error);
    showStatus('加载失败: ' + error.message, true);
  }
}


async function savePost() {
  const user = auth.currentUser;
  if (!user) {
    showStatus('请先登录', true);
    setTimeout(() => window.location.href = "admin.html", 1500);
    return;
  }

  const title = titleInput.value.trim();
  if (!title) {
    showStatus('请输入文章标题', true);
    titleInput.focus();
    return;
  }


  // 获取编辑器内容（Markdown格式）
const content = toastuiEditor.getMarkdown();
  if (!content.trim()) {
    showStatus('文章内容不能为空', true);
    return;
  }

  // 提取元数据
  const metadata = extractMetadata(content);

  // 构建文章数据
const postData = {
    title,
    content,
    slug: title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, ''),
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
    author: user.uid,
    authorEmail: user.email,
    metadata: metadata,
    thumbnail: currentThumbnailBase64 // 存储Base64字符串
  };

  try {
    const postId = getPostId();
    if (postId) {
      // 更新现有文章
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, { ...postData, updatedAt: new Date().getTime() });
      showStatus('文章更新成功！');
    } else {
      // 创建新文章
      await addDoc(collection(db, "posts"), postData);
      showStatus('文章创建成功！');
      titleInput.value = "";
    }
  } catch (error) {
    console.error("保存失败:", error);
    showStatus('保存失败: ' + error.message, true);
  }
}



// 初始化
function init() {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "admin.html";
    } else {
      initMarkdownEditor();
      loadPostData();
    }
  });

  saveBtn.addEventListener('click', savePost);

  // 键盘快捷键: Ctrl+S 保存
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      savePost();
    }
  });

  titleInput.addEventListener('input', () => {
    document.title = `${titleInput.value || '编辑文章'} - 博客管理`;
  });
}

document.addEventListener('DOMContentLoaded', init);
document.getElementById('thumbnailUpload').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  // 限制文件大小（2MB以内）
  if (file.size > 2 * 1024 * 1024) {
    alert('图片大小不能超过2MB');
    return;
  }

  // 读取文件并转为Base64
  const reader = new FileReader();
  reader.onload = function(event) {
    // 显示预览
    const preview = document.getElementById('thumbnailPreview');
    preview.innerHTML = `
      <img src="${event.target.result}" style="max-width: 100%; border-radius: 8px;" alt="缩略图预览">
      <button id="removeThumbnail" class="mt-2 text-sm text-red-500 hover:text-red-700">移除缩略图</button>
    `;
    currentThumbnailBase64 = event.target.result; // 保存Base64字符串

    // 绑定移除按钮事件
    document.getElementById('removeThumbnail').addEventListener('click', function() {
      currentThumbnailBase64 = null;
      preview.innerHTML = '';
    });
  };
  reader.readAsDataURL(file); // 转为Base64
});