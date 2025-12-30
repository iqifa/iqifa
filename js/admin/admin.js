import { db, auth } from '../firebase.js';
import { doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { parsePost } from '../utils.js';

export class AdminManager {
    constructor(postManager, routerCallback) {
        this.postManager = postManager; // 需要访问 post 数据来渲染列表
        this.routerCallback = routerCallback; // 需要调用路由跳转
        this.user = null;
        this.editingId = null;
    }

    init() {
        // 监听登录状态
        onAuthStateChanged(auth, (user) => {
            this.user = user;
            if (user) {
                console.log("Logged in:", user.email);
                const loginPanel = document.getElementById('login-panel');
                if(loginPanel) loginPanel.style.display = 'none';
                
                const emailDisplay = document.getElementById('user-email-display');
                if(emailDisplay) emailDisplay.innerText = user.email;
                
                // 如果当前在 admin 路由，则显示仪表盘
                if(location.hash === '#admin') this.showDashboard();
            } else {
                const loginPanel = document.getElementById('login-panel');
                if(loginPanel) loginPanel.style.display = 'flex';
                document.getElementById('admin-dashboard').style.display = 'none';
                document.getElementById('editor-panel').style.display = 'none';
            }
        });

        // 绑定编辑器双向同步事件
        this.bindEditorEvents();
    }

    // 登录与注销
    async login() {
        const pwdInput = document.getElementById('admin-pwd');
        const pwd = pwdInput.value;
        const email = "admin@iqifa-blog.com"; 
        try { 
            await signInWithEmailAndPassword(auth, email, pwd); 
            // 登录成功后清空密码框
            pwdInput.value = '';
        } catch (e) { 
            alert("登录失败: " + e.message); 
        }
    }

    logout() { 
        signOut(auth); 
    }

    // 仪表盘展示
    showDashboard() {
        document.getElementById('admin-dashboard').style.display = 'block';
        document.getElementById('editor-panel').style.display = 'none';
        document.getElementById('main-container').classList.add('admin-mode');
        this.renderAdminList();
    }

    renderAdminList() {
        const tbody = document.getElementById('admin-post-list');
        if(!tbody) return;
        
        const posts = this.postManager.data;
        if(posts.length === 0) { 
            tbody.innerHTML='<tr><td colspan="3" style="text-align:center">暂无文章</td></tr>'; 
            return;
        }
        
        tbody.innerHTML = posts.map(post => `
            <tr>
                <td><strong>${post.title}</strong></td>
                <td>${post.date}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="window.app.editPost('${post.id}')">Edit</button> 
                    <button class="btn btn-sm btn-danger" onclick="window.app.deletePost('${post.id}')">Delete</button>
                </td>
            </tr>`).join('');
    }

    // 编辑器相关操作
    newPost() {
        this.editingId = null;
        document.getElementById('admin-dashboard').style.display = 'none';
        document.getElementById('editor-panel').style.display = 'block';
        
        const template = `---
title: New Post
date: ${new Date().toISOString().split('T')[0]}
categories: [Dev]
tags: []
---

Write content...`;
        
        const editor = document.getElementById('markdown-editor');
        editor.value = template;
        this.updatePreview(template);
        this.syncTitleFromContentToInput(template);
        document.getElementById('main-container').classList.add('admin-mode');
    }

    editPost(id) {
        const post = this.postManager.data.find(p => p.id === id);
        if (!post) return;
        this.editingId = id;
        document.getElementById('admin-dashboard').style.display = 'none';
        document.getElementById('editor-panel').style.display = 'block';
        
        const editor = document.getElementById('markdown-editor');
        editor.value = post.content;
        this.updatePreview(post.content);
        this.syncTitleFromContentToInput(post.content);
        document.getElementById('main-container').classList.add('admin-mode');
    }

    async savePost() {
        const editor = document.getElementById('markdown-editor');
        if(!editor) return;
        const btn = document.getElementById('btn-save');
        
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        btn.disabled = true;

        const content = editor.value;
        const { metadata } = parsePost(content);
        if(!metadata.date) metadata.date = new Date().toISOString().split('T')[0];

        try {
            const safeCategories = Array.isArray(metadata.categories) ? metadata.categories : (metadata.categories?[metadata.categories]:[]);
            const safeTags = Array.isArray(metadata.tags) ? metadata.tags : (metadata.tags?[metadata.tags]:[]);

            const docData = {
                content: content,
                title: metadata.title || 'Untitled',
                date: metadata.date,
                categories: safeCategories,
                tags: safeTags,
                updatedAt: new Date().toISOString()
            };

            if (this.editingId) {
                await setDoc(doc(db, "posts", this.editingId), docData);
            } else {
                const newId = Date.now().toString();
                await setDoc(doc(db, "posts", newId), docData);
            }
            
            btn.innerHTML = '<i class="fas fa-check"></i> Saved';
            
            // 重新获取数据以更新列表
            await this.postManager.fetchPosts();
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
                this.showDashboard();
            }, 1000);

        } catch (e) {
            console.error(e);
            alert("Error saving: " + e.message);
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    async deletePost(id) {
        if (confirm("确认删除？")) {
            try { 
                await deleteDoc(doc(db, "posts", id)); 
                await this.postManager.fetchPosts(); 
                this.renderAdminList(); 
            } catch (e) { 
                alert("Error deleting: " + e.message); 
            }
        }
    }

    // 编辑器辅助逻辑
    bindEditorEvents() {
        const editor = document.getElementById('markdown-editor');
        const titleInput = document.getElementById('edit-title-input');

        if(editor && titleInput) {
            editor.addEventListener('input', (e) => {
                const val = e.target.value;
                this.updatePreview(val);
                this.syncTitleFromContentToInput(val);
            });

            titleInput.addEventListener('input', (e) => {
                this.syncTitleFromInputToContent(e.target.value);
            });
        }
    }

    updatePreview(rawContent) {
        const { body } = parsePost(rawContent);
        const previewEl = document.getElementById('editor-preview');
        if(previewEl) {
            previewEl.innerHTML = marked.parse(body);
            if (typeof renderMathInElement !== 'undefined') {
                renderMathInElement(previewEl, { delimiters: [ {left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false} ] });
            }
        }
    }

    syncTitleFromContentToInput(content) {
        const match = content.match(/^title:\s*(.+)$/m);
        if (match && match[1]) {
            const currentTitle = match[1].trim();
            const input = document.getElementById('edit-title-input');
            if (input.value !== currentTitle) input.value = currentTitle;
        }
    }

    syncTitleFromInputToContent(newTitle) {
        const editor = document.getElementById('markdown-editor');
        let content = editor.value;
        if (/^title:\s*.+$/m.test(content)) {
            content = content.replace(/^title:\s*.+$/m, `title: ${newTitle}`);
        } else {
            content = content.startsWith('---') 
                ? content.replace('---', `---\ntitle: ${newTitle}`) 
                : `---\ntitle: ${newTitle}\n---\n${content}`;
        }
        editor.value = content;
        this.updatePreview(content);
    }
}