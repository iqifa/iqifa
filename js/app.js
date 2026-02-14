import { configureMarked } from './utils.js';
import { PostManager } from './post/post.js';
import { AdminManager } from './admin/admin.js';
import { StarBackground } from './background-stars.js';

console.log("js/app.js is starting execution (Modular Version)...");

class App {
    constructor() {
        // 实例化模块
        this.postManager = new PostManager();
        // Admin 模块需要调用 Post 模块的数据，也需要路由能力
        this.adminManager = new AdminManager(this.postManager, this.router.bind(this));
    }

    async init() {
        console.log("App Initializing...");
        
        // 1. 初始化星空背景
        new StarBackground();

        // 2. 配置 Markdown 工具
        if (typeof marked !== 'undefined') {
            try { configureMarked(); } catch (e) { console.warn("Marked config failed:", e); }
        }

        // 3. 加载个人资料
        this.loadProfile();

        // 4. 初始化 Admin (监听登录状态)
        this.adminManager.init();

        // 5. 加载文章数据
        await this.postManager.fetchPosts();
        
        // 6. 处理初始路由
        this.handleRoute();
        // 7. 全局复制按钮监听
        this.initCopyListener();

        window.addEventListener('hashchange', () => this.handleRoute());
    }
initCopyListener() {
        document.addEventListener('click', async (e) => {
            // 查找是否点击了 .copy-btn 或其内部图标
            const btn = e.target.closest('.copy-btn');
            if (!btn) return;

            // 阻止冒泡，防止触发 details 的折叠/展开
            e.preventDefault();
            e.stopPropagation();

            // 找到对应的代码块
            const details = btn.closest('details');
            const codeBlock = details.querySelector('code');
            
            if (!codeBlock) return;

            try {
                // 执行复制
                await navigator.clipboard.writeText(codeBlock.innerText);
                
                // 视觉反馈：图标变成对勾
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                btn.classList.add('copied');
                
                // 2秒后恢复
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
                alert('复制失败，请手动复制');
            }
        });
}
    // --- 加载个人资料 ---
    async loadProfile() {
        try {
            const response = await fetch('./data/profile.json');
            if (!response.ok) throw new Error("Profile file not found");
            const data = await response.json();

            const avatarEl = document.querySelector('.profile-img');
            if (avatarEl && data.avatar) avatarEl.src = data.avatar;

            const nameEl = document.querySelector('.profile-name');
            if (nameEl && data.name) nameEl.innerText = data.name;

            const bioEl = document.querySelector('.profile-bio');
            if (bioEl && data.bio) bioEl.innerText = data.bio;

            const socialEl = document.querySelector('.social-links');
            if (socialEl && data.socials && Array.isArray(data.socials)) {
                socialEl.innerHTML = data.socials.map(s => `
                    <a href="${s.link}" target="_blank" title="${s.name || ''}" style="margin: 0 5px;">
                        <i class="${s.icon}"></i>
                    </a>
                `).join('');
            }

        } catch (e) {
            console.error("Error loading profile:", e);
        }
    }

    // --- 路由逻辑 ---
    router(page, param) {
        if (page === 'home') location.hash = '';
        if (page === 'post') location.hash = `#post=${param}`;
        if (page === 'admin') location.hash = '#admin';
    }

    handleRoute() {
        const hash = location.hash;
        
        // 隐藏所有视图
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        
        // 样式处理：Admin 模式和编辑器模式下使用宽屏
        const mainContainer = document.getElementById('main-container');
        
        // 修复：只要 hash 不是 #admin，就移除 admin-mode，防止从编辑器返回首页时宽度异常
        // 我们不再依赖 editor-panel 的显示状态来决定布局
        if (hash === '#admin') {
             mainContainer.classList.add('admin-mode');
        } else {
             mainContainer.classList.remove('admin-mode');
        }

        // 路由分发
        if (hash.startsWith('#post=')) {
            const id = hash.split('=')[1];
            document.getElementById('post-view').classList.add('active');
            this.postManager.renderDetail(id);
        } else if (hash === '#admin') {
            document.getElementById('admin-view').classList.add('active');
            // 如果已登录，Admin模块会自动显示Dashboard，否则显示登录框
            if (this.adminManager.user) this.adminManager.showDashboard();
        } else {
            document.getElementById('home-view').classList.add('active');
        }
        window.scrollTo(0, 0);
    }

    // --- 分类树交互逻辑 ---
    toggleCategory(btn) {
        const li = btn.closest('li');
        const childUl = li.querySelector('ul');
        const icon = btn.querySelector('.cat-caret');

        if (childUl) {
            const isHidden = childUl.style.display === 'none';
            if (isHidden) {
                childUl.style.display = 'block';
                if(icon) icon.style.transform = 'rotate(90deg)';
                btn.classList.add('active');
            } else {
                childUl.style.display = 'none';
                if(icon) icon.style.transform = 'rotate(0deg)';
                btn.classList.remove('active');
            }
        }
    }

    // --- 代理方法 (为了兼容 HTML 中的 window.app.xxx 调用) ---
    
    // 代理给 PostManager 的方法
    setFilter(type, value) { this.postManager.setFilter(type, value); }
    clearFilter() { this.postManager.clearFilter(); }
    setFilter(type, value) { this.postManager.setFilter(type, value); }
    clearFilter() { this.postManager.clearFilter(); }
    changePage(page) { this.postManager.changePage(page); } // <--- 新增这一行

    // 代理给 AdminManager 的方法
    login() { this.adminManager.login(); }
    logout() { this.adminManager.logout(); }
    showDashboard() { this.adminManager.showDashboard(); }
    newPost() { this.adminManager.newPost(); }
    editPost(id) { this.adminManager.editPost(id); }
    savePost() { this.adminManager.savePost(); }
    deletePost(id) { this.adminManager.deletePost(id); }
}

// 挂载到全局 window，保持与 index.html 的兼容性
const app = new App();
window.app = app;
window.router = (page, param) => app.router(page, param);

// 启动应用
app.init();