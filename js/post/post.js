import { db } from '../firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { parsePost } from '../utils.js';

export class PostManager {
    constructor() {
        this.data = [];
        this.currentFilter = null;
        
        // --- 分页状态初始化 ---
        this.currentPage = 1;
        this.itemsPerPage = 10; // 每页显示 10 个
    }

    async fetchPosts() {
        const container = document.getElementById('post-list-container');
        try {
            const q = collection(db, "posts"); 
            const querySnapshot = await getDocs(q);
            
            this.data = [];
            querySnapshot.forEach((doc) => {
                const rawContent = doc.data().content;
                if (!rawContent) return;
                const { metadata, body } = parsePost(rawContent);
                
                const safeCategories = Array.isArray(metadata.categories) ? metadata.categories : (metadata.categories ? [metadata.categories] : []);
                const safeTags = Array.isArray(metadata.tags) ? metadata.tags : (metadata.tags ? [metadata.tags] : []);

                this.data.push({
                    id: doc.id,
                    content: rawContent,
                    ...metadata,
                    categories: safeCategories,
                    tags: safeTags,
                    body: body,
                    preview: body.replace(/[#*`]/g, '').substring(0, 100) + '...'
                });
            });
            
            this.data.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

            this.renderHome();
            this.renderSidebar();

        } catch (e) {
            console.error("Error fetching posts:", e);
            if(container) container.innerHTML = `<div style="text-align:center;color:red;">Failed to load: ${e.message}</div>`;
        }
    }

    renderHome() {
        const container = document.getElementById('post-list-container');
        if(!container) return;
        
        let posts = this.data;

        // 1. 执行筛选
        const filterStatus = document.getElementById('filter-status');
        if (this.currentFilter) {
            if(filterStatus) filterStatus.style.display = 'block';
            document.getElementById('filter-keyword').innerText = `${this.currentFilter.type}: ${this.currentFilter.value}`;
            
            posts = posts.filter(post => {
                const filterVal = this.currentFilter.value;
                if (this.currentFilter.type === 'Category') {
                    return post.categories.some(c => c === filterVal || c.startsWith(filterVal + '/'));
                } else {
                    const target = post.tags;
                    if (Array.isArray(target)) return target.includes(filterVal);
                    return target == filterVal;
                }
            });
        } else {
            if(filterStatus) filterStatus.style.display = 'none';
        }

        if (posts.length === 0) {
            container.innerHTML = `<div class="card" style="text-align:center; padding:40px; color:#666;">暂无文章</div>`;
            this.renderPagination(0); // 隐藏分页条
            return;
        }

        // 2. --- 分页核心逻辑 ---
        const totalPosts = posts.length;
        const totalPages = Math.ceil(totalPosts / this.itemsPerPage);

        // 边界检查：防止在第5页筛选后，结果只有1页的情况
        if (this.currentPage > totalPages) this.currentPage = 1;
        if (this.currentPage < 1) this.currentPage = 1;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const displayedPosts = posts.slice(startIndex, endIndex);

        // 3. 渲染文章列表
        container.innerHTML = displayedPosts.map(post => `
            <article class="card post-item" onclick="window.router('post', '${post.id}')">
                <h2 class="post-title">${post.title || 'Untitled'}</h2>
                <div class="post-meta">
                    <span>${post.date || 'No Date'}</span> | <span>${post.categories.join(', ')}</span>
                </div>
                <div class="post-excerpt">${post.preview}</div>
                <div style="margin-top:10px;">${(post.tags||[]).map(t=>`<span class="category-tag">#${t}</span>`).join(' ')}</div>
            </article>
        `).join('');

        // 4. 渲染分页按钮
        this.renderPagination(totalPages);
    }

    // --- 新增：渲染分页控件 ---
    renderPagination(totalPages) {
        // 自动创建分页容器（如果 HTML 里没有的话）
        let pagContainer = document.getElementById('pagination-container');
        if (!pagContainer) {
            pagContainer = document.createElement('div');
            pagContainer.id = 'pagination-container';
            pagContainer.className = 'pagination-container';
            const listContainer = document.getElementById('post-list-container');
            // 插入到文章列表后面
            if(listContainer) listContainer.parentNode.insertBefore(pagContainer, listContainer.nextSibling);
        }

        if (totalPages <= 1) {
            pagContainer.style.display = 'none';
            return;
        }
        
        pagContainer.style.display = 'flex';
        let html = '';

        // 上一页
        html += `<button class="page-btn" ${this.currentPage === 1 ? 'disabled' : ''} onclick="window.app.changePage(${this.currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>`;

        // 页码逻辑 (智能显示：1 ... 4 5 6 ... 10)
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 || 
                i === totalPages || 
                (i >= this.currentPage - 1 && i <= this.currentPage + 1)
            ) {
                const activeClass = i === this.currentPage ? 'active' : '';
                html += `<button class="page-btn ${activeClass}" onclick="window.app.changePage(${i})">${i}</button>`;
            } else if (
                i === this.currentPage - 2 || 
                i === this.currentPage + 2
            ) {
                html += `<span class="page-dots">...</span>`;
            }
        }

        // 下一页
        html += `<button class="page-btn" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="window.app.changePage(${this.currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>`;

        pagContainer.innerHTML = html;
    }

    // --- 新增：翻页动作 ---
    changePage(page) {
        this.currentPage = page;
        this.renderHome();
        // 平滑滚动回顶部
        const mainContainer = document.getElementById('post-list-container');
        if(mainContainer) {
            // 减去 header 高度，避免被遮挡
            const y = mainContainer.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({top: y, behavior: 'smooth'});
        }
    }

    // --- 树状分类逻辑 (保持不变) ---
    buildCategoryTree() {
        const tree = {}; 
        this.data.forEach(post => {
            post.categories.forEach(catPath => {
                const parts = catPath.split('/'); 
                let currentLevel = tree;
                let currentPath = "";
                parts.forEach((part, index) => {
                    currentPath = currentPath ? `${currentPath}/${part}` : part;
                    if (!currentLevel[part]) {
                        currentLevel[part] = { name: part, fullPath: currentPath, count: 0, children: {} };
                    }
                    currentLevel[part].count++;
                    currentLevel = currentLevel[part].children;
                });
            });
        });
        return tree;
    }

    renderCategoryTreeHTML(treeNode, isRoot = true) {
        // ... (保持原代码不变) ...
        if (Object.keys(treeNode).length === 0) return '';
        const displayStyle = isRoot ? '' : 'style="display:none"';
        const ulClass = isRoot ? 'category-tree-ul' : 'category-tree-ul nested-ul';
        let html = `<ul class="${ulClass}" ${displayStyle}>`;
        for (const key in treeNode) {
            const node = treeNode[key];
            const hasChildren = Object.keys(node.children).length > 0;
            html += `
                <li>
                    <div class="category-tree-item">
                        <span class="tree-toggle" 
                              onclick="${hasChildren ? 'event.stopPropagation(); window.app.toggleCategory(this)' : ''}"
                              style="${hasChildren ? 'cursor:pointer; visibility:visible' : 'visibility:hidden'}">
                            <i class="fas fa-caret-right cat-caret"></i>
                        </span>
                        <span class="cat-name-wrapper" onclick="event.stopPropagation(); window.app.setFilter('Category', '${node.fullPath}')">
                            <span class="cat-name">${node.name}</span>
                        </span>
                        <span class="cat-count">${node.count}</span>
                    </div>
                    ${this.renderCategoryTreeHTML(node.children, false)}
                </li>
            `;
        }
        html += '</ul>';
        return html;
    }

    renderSidebar() {
        // ... (保持原代码不变) ...
        const treeData = this.buildCategoryTree();
        const catList = document.getElementById('category-list');
        if(catList) {
            catList.innerHTML = this.renderCategoryTreeHTML(treeData, true);
            catList.className = 'category-tree-container';
        }

        const tags = new Set();
        this.data.forEach(post => post.tags.forEach(t => tags.add(t)));
        const tagList = document.getElementById('tag-cloud');
        if(tagList) tagList.innerHTML = Array.from(tags).map(t => 
            `<span class="tag-chip" onclick="window.app.setFilter('Tag', '${t}')">#${t}</span>`
        ).join('');
    }

    // --- 详情页渲染 (保持不变) ---
    renderDetail(id) {
        // ... (保持原代码不变) ...
        const post = this.data.find(p => p.id === id);
        if (!post) return;
        
        document.getElementById('single-post-title').innerText = post.title;
        document.getElementById('single-post-meta').innerHTML = `<span>${post.date}</span> | <span>${post.categories.join(', ')}</span>`;
        
        const contentEl = document.getElementById('markdown-content');
        contentEl.innerHTML = marked.parse(post.body);
        
        if (typeof renderMathInElement !== 'undefined') {
            renderMathInElement(contentEl, { 
                delimiters: [ {left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false} ], 
                throwOnError: false 
            });
        }

        setTimeout(() => {
            const headers = contentEl.querySelectorAll('h2, h3, h4');
            const tocContainer = document.getElementById('toc-list');
            
            if(tocContainer) {
                tocContainer.innerHTML = Array.from(headers).map(h => 
                    `<a href="#${h.id}" class="toc-${h.tagName.toLowerCase()}">${h.innerText}</a>`
                ).join('') || '<p style="color:#999;font-size:0.9rem;">暂无目录</p>';

                const links = tocContainer.querySelectorAll('a');
                links.forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault(); 
                        const targetId = link.getAttribute('href').substring(1);
                        const targetElement = document.getElementById(targetId);
                        if (targetElement) {
                            const headerOffset = 80; 
                            const elementPosition = targetElement.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                        }
                    });
                });
            }
        }, 100);
    }

    setFilter(type, value) { 
        this.currentFilter = { type, value }; 
        this.currentPage = 1; // 筛选时重置到第一页
        this.renderHome(); 
        window.router('home'); 
    }
    
    clearFilter() { 
        this.currentFilter = null; 
        this.currentPage = 1; // 清空筛选时也重置
        this.renderHome(); 
    }
}