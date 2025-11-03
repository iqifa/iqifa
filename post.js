import { db, doc, getDoc } from './firebase.js';

// DOM elements
const params = new URLSearchParams(window.location.search);
const postId = params.get('id');
const titleEl = document.getElementById('postTitle');
const metaEl = document.getElementById('postMeta');
const contentEl = document.getElementById('postContent');
const actionsEl = document.getElementById('postActions');

function showError(message) {
  titleEl.textContent = '出错了';
  metaEl.textContent = '';
  contentEl.innerHTML = `<p style="color: var(--error);">${message}</p>`;
}

async function loadPost(id) {
  if (!id) {
    showError('未提供文章 ID');
    return;
  }

  try {
    const postRef = doc(db, 'posts', id);
    const snap = await getDoc(postRef);

    if (!snap.exists()) {
      showError('未找到该文章');
      return;
    }

    const data = snap.data();
    const title = data.title || '无标题';
    const raw = data.content || '';

    // 解析并剥离可能存在的 front-matter（以 --- 包裹的元数据）
    function parseFrontMatter(content) {
      const metadata = { date: '', categories: [], tags: [] };
      const lines = content.split('\n');
      if (lines.length > 0 && lines[0].trim() === '---') {
        let end = -1;
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === '---') { end = i; break; }
        }
        if (end > 0) {
          const metaLines = lines.slice(1, end);
          metaLines.forEach(line => {
            const idx = line.indexOf(':');
            if (idx === -1) return;
            const key = line.slice(0, idx).trim().toLowerCase();
            const value = line.slice(idx + 1).trim();
            if (!key) return;
            if (key === 'date') {
              metadata.date = value;
            } else if (key === 'categories') {
              const m = value.match(/\[([^]*?)\]/);
              if (m && m[1]) metadata.categories = m[1].split(',').map(s => s.trim()).filter(Boolean);
            } else if (key === 'tags') {
              const m = value.match(/\[([^]*?)\]/);
              if (m && m[1]) metadata.tags = m[1].split(',').map(s => s.trim()).filter(Boolean);
            }
          });
          const body = lines.slice(end + 1).join('\n');
          return { metadata, body };
        }
      }
      return { metadata: null, body: content };
    }

    const { metadata: fm, body: md } = parseFrontMatter(raw);

    // 优先使用 Firestore 存储的 metadata，如果没有则使用 front-matter
    const date = data.metadata?.date || (fm?.date || (data.createdAt ? new Date(data.createdAt).toLocaleString() : ''));
    const categories = (data.metadata?.categories && data.metadata.categories.length) ? data.metadata.categories.join(' / ') : (fm?.categories ? fm.categories.join(' / ') : '');
    const tags = (data.metadata?.tags && data.metadata.tags.length) ? data.metadata.tags.join(', ') : (fm?.tags ? fm.tags.join(', ') : '');

    // 更新页面
    document.title = `${title} - 博客`;
    titleEl.textContent = title;

    let metaParts = [];
    if (date) metaParts.push(`📅 ${date}`);
    if (categories) metaParts.push(`📂 ${categories}`);
    if (tags) metaParts.push(`🏷️ ${tags}`);
    metaEl.textContent = metaParts.join('  ·  ');


    window.marked.setOptions({ gfm: true, breaks: true });
    // 使用剥离后的正文（md）渲染 Markdown
    // 注意：marked 输出未经过严格消毒；若需要请加入 DOMPurify 进行清洗。
    const html = window.marked.parse(md || '');


    
    

    contentEl.innerHTML = html || '<p>（无内容）</p>';

    


    const headings = [];
    const parser = new DOMParser();
    const doc_dir = parser.parseFromString(html , 'text/html');
    const allHeadings = contentEl.querySelectorAll('h1, h2, h3, h4, h5, h6');

    allHeadings.forEach((heading) => {
      const id = heading.id || heading.textContent.trim().replace(/\s+/g, '-');
      heading.id = id; // Assign an ID to each heading
      headings.push({ level: parseInt(heading.tagName[1]), text: heading.textContent, id });
    });


    console.log(headings);


    // Update the TOC
    const tocEl = document.getElementById('toc');
    if (tocEl) {
      const ul = document.createElement('ul');
      headings.forEach(heading => {
        const li = document.createElement('li');
        li.style.marginLeft = `${(heading.level - 1) * 20}px`; // Indentation based on level
        li.innerHTML = `<a href="#${heading.id}">${heading.text}</a>`;
        ul.appendChild(li);
      });
      tocEl.appendChild(ul);
    }
    // 渲染数学公式（放在设置 contentEl.innerHTML 之后）
    if (window.renderMathInElement) {
      renderMathInElement(contentEl, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ],
        throwOnError: false,
        trust: true // 允许渲染复杂公式（如分段函数cases）
      });
    }
    if (window.Prism) {
      Prism.highlightAllUnder(contentEl);
    }

    // 使代码块可折叠
    const collapsibleCodes = contentEl.querySelectorAll('pre');
    collapsibleCodes.forEach(codeBlock => {
      const collapsible = document.createElement('div');
      collapsible.classList.add('collapsible-code');
      collapsible.innerText = '点击展开/收起代码';
      codeBlock.classList.add('collapsed-code');

      collapsible.addEventListener('click', () => {
        codeBlock.classList.toggle('collapsed-code');
        collapsible.classList.toggle('expanded');
      });

      codeBlock.parentNode.insertBefore(collapsible, codeBlock);
    });


    // 文章操作（例如返回首页）
    actionsEl.innerHTML = `
      <a href="index.html" class="btn">← 返回</a>
    `;

  } catch (err) {
    console.error('加载文章失败', err);
    showError('加载文章失败，请检查控制台');
  }
}

// 启动
document.addEventListener('DOMContentLoaded', () => {
  loadPost(postId);
});
