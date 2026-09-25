import { deletePost, fetchPosts, login, logout, newPostTemplate, onUserChange, parsePost, savePost } from './posts.js';
import { bindCodeCopy, renderMarkdown } from './markdown.js';
import './blog.css';

const escape = (value = '') => String(value).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
const PAGE_SIZE = 10;
const cross = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" stroke="currentColor" stroke-width="1.5"/></svg>';

let user = null;
let dialogs;
const views = new Set();
onUserChange((next) => {
  user = next;
  views.forEach((view) => view.refreshAdmin());
});

function createDialogs() {
  document.body.insertAdjacentHTML('beforeend', `
    <dialog class="blog-login-dialog text-dialog" id="blog-login" aria-labelledby="blog-login-title">
      <button class="dialog-close" data-close aria-label="关闭登录">${cross}</button>
      <span class="eyebrow"><span class="status-dot"></span> ADMIN ACCESS / 管理员登录</span>
      <h2 id="blog-login-title">Sign in<span class="green-period">.</span></h2>
      <form class="blog-login-form">
        <label><span>EMAIL</span><input type="email" name="email" autocomplete="username" required /></label>
        <label><span>PASSWORD</span><input type="password" name="password" autocomplete="current-password" required /></label>
        <p class="blog-form-error" role="alert"></p>
        <button class="blog-button primary" type="submit">Sign in ↗</button>
      </form>
    </dialog>
    <dialog class="blog-editor-dialog" id="blog-editor" aria-label="文章编辑器">
      <div class="blog-editor-toolbar">
        <button class="blog-button" type="button" data-close>← Close</button>
        <input class="blog-editor-title" type="text" placeholder="Post title…" aria-label="文章标题" />
        <span class="blog-editor-status" role="status"></span>
        <button class="blog-button primary" type="button" data-save>Publish ↗</button>
      </div>
      <div class="blog-editor-panes">
        <textarea class="blog-editor-source" spellcheck="false" aria-label="Markdown 内容"></textarea>
        <div class="blog-editor-preview blog-markdown" aria-label="预览"></div>
      </div>
    </dialog>
  `);
  const loginDialog = document.querySelector('#blog-login');
  const editorDialog = document.querySelector('#blog-editor');
  const form = loginDialog.querySelector('form');
  const loginError = loginDialog.querySelector('.blog-form-error');
  const source = editorDialog.querySelector('.blog-editor-source');
  const titleInput = editorDialog.querySelector('.blog-editor-title');
  const preview = editorDialog.querySelector('.blog-editor-preview');
  const status = editorDialog.querySelector('.blog-editor-status');
  const saveButton = editorDialog.querySelector('[data-save]');
  let editing = { id: null, onSaved: null };
  let dirty = false;
  let previewFrame;
  bindCodeCopy(preview);

  const updatePreview = () => {
    cancelAnimationFrame(previewFrame);
    previewFrame = requestAnimationFrame(() => renderMarkdown(preview, parsePost(source.value).body));
  };
  const syncTitleInput = () => {
    const match = source.value.match(/^title:\s*(.+)$/m);
    if (match && titleInput.value !== match[1].trim()) titleInput.value = match[1].trim();
  };

  for (const dialog of [loginDialog, editorDialog]) {
    dialog.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('keydown', (event) => event.stopPropagation());
  }
  editorDialog.addEventListener('cancel', (event) => {
    if (dirty && !confirm('有未保存的修改，确定关闭？')) event.preventDefault();
  });
  editorDialog.querySelector('[data-close]').addEventListener('click', (event) => {
    if (dirty && !confirm('有未保存的修改，确定关闭？')) event.stopImmediatePropagation();
  }, { capture: true });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button');
    loginError.textContent = '';
    button.disabled = true;
    try {
      await login(form.email.value, form.password.value);
      form.password.value = '';
      loginDialog.close();
    } catch (error) {
      loginError.textContent = `登录失败：${error.code || error.message}`;
    } finally {
      button.disabled = false;
    }
  });

  source.addEventListener('input', () => {
    dirty = true;
    syncTitleInput();
    updatePreview();
  });
  titleInput.addEventListener('input', () => {
    const title = titleInput.value;
    if (/^title:.*$/m.test(source.value)) source.value = source.value.replace(/^title:.*$/m, `title: ${title}`);
    else source.value = source.value.startsWith('---') ? source.value.replace('---', `---\ntitle: ${title}`) : `---\ntitle: ${title}\n---\n${source.value}`;
    dirty = true;
    updatePreview();
  });
  source.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      source.setRangeText('  ', source.selectionStart, source.selectionEnd, 'end');
      source.dispatchEvent(new Event('input'));
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      saveButton.click();
    }
  });
  saveButton.addEventListener('click', async () => {
    saveButton.disabled = true;
    status.textContent = 'SAVING…';
    try {
      const id = await savePost(editing.id, source.value);
      editing.id = id;
      dirty = false;
      status.textContent = 'SAVED';
      editorDialog.close();
      editing.onSaved?.(id);
    } catch (error) {
      status.textContent = `ERROR · ${error.code || error.message}`;
    } finally {
      saveButton.disabled = false;
    }
  });

  return {
    login() {
      loginError.textContent = '';
      loginDialog.showModal();
    },
    edit(post, onSaved) {
      editing = { id: post?.id ?? null, onSaved };
      source.value = post?.content ?? newPostTemplate();
      titleInput.value = '';
      status.textContent = post ? `EDITING · ${post.id}` : 'NEW POST';
      dirty = false;
      syncTitleInput();
      updatePreview();
      editorDialog.showModal();
      source.focus({ preventScroll: true });
    },
  };
}

export function mountBlog(root, scene) {
  dialogs ??= createDialogs();
  const panel = root.closest('.scene-panel');
  let posts = [];
  let filter = null;
  let page = 1;
  let mode = 'list';
  let currentId = null;
  let disposed = false;

  root.innerHTML = `
    <header class="scene-heading blog-aside"></header>
    <div class="blog-main"><p class="blog-state">LOADING POSTS…</p></div>`;
  const aside = root.querySelector('.blog-aside');
  const main = root.querySelector('.blog-main');
  bindCodeCopy(main);

  const adminBar = () => (user
    ? `<div class="blog-admin"><span>${escape(user.email)}</span><button class="blog-link" data-action="new">+ New post</button><button class="blog-link" data-action="logout">Sign out</button></div>`
    : '<div class="blog-admin"><button class="blog-link" data-action="login">Admin sign in</button></div>');

  function renderList() {
    mode = 'list';
    currentId = null;
    root.classList.remove('blog-detail-mode');
    const tree = new Map();
    posts.forEach((post) => {
      const paths = new Set(post.categories.flatMap((value) => value.split('/').map((_, depth, parts) => parts.slice(0, depth + 1).join('/'))));
      paths.forEach((path) => {
        const parts = path.split('/');
        let level = tree;
        parts.slice(0, -1).forEach((part) => { level = level.get(part).children; });
        const name = parts.at(-1);
        if (!level.has(name)) level.set(name, { path, count: 0, children: new Map() });
        level.get(name).count++;
      });
    });
    const tags = [...new Set(posts.flatMap((post) => post.tags))];
    const isActive = (type, value) => filter?.type === type && filter.value === value;
    const chip = (type, value, label, count) => `<button class="blog-chip${isActive(type, value) ? ' active' : ''}" data-filter-type="${type}" data-filter-value="${escape(value)}">${type === 'tag' ? '#' : ''}${escape(label)}${count ? `<sup>${count}</sup>` : ''}</button>`;
    const selectedPath = filter?.type === 'category' ? filter.value.split('/') : [];
    const categoryRows = [];
    let level = tree;
    for (let depth = 0; level?.size; depth++) {
      categoryRows.push(`<div class="blog-filter-row${depth ? ' nested' : ''}" style="--depth:${depth}">${[...level].map(([name, node]) => chip('category', node.path, name, node.count)).join('')}</div>`);
      level = selectedPath[depth] ? level.get(selectedPath[depth])?.children : null;
    }
    aside.innerHTML = `
      <span class="eyebrow"><span class="status-dot"></span> ${scene.label} — ${escape(scene.name)}</span>
      <h2>${scene.title}<span class="green-period">.</span></h2>
      <p>${escape(scene.intro)}</p>
      ${tree.size ? `<div class="blog-filter"><span>CATEGORIES</span>${categoryRows.join('')}</div>` : ''}
      ${tags.length ? `<div class="blog-filter"><span>TAGS</span><div class="blog-filter-row">${tags.map((value) => chip('tag', value, value)).join('')}</div></div>` : ''}
      ${adminBar()}`;

    const filtered = posts.filter((post) => !filter || (filter.type === 'category'
      ? post.categories.some((value) => value === filter.value || value.startsWith(`${filter.value}/`))
      : post.tags.includes(filter.value)));
    const visible = filtered.slice(0, page * PAGE_SIZE);
    main.innerHTML = `
      <div class="blog-list-head"><span>${filter ? `${filter.type.toUpperCase()} · ${escape(filter.value)}` : 'ALL POSTS'}</span><span>${String(filtered.length).padStart(2, '0')} ENTRIES</span>${filter ? '<button class="blog-link" data-action="clear-filter">Clear ×</button>' : ''}</div>
      ${visible.length ? visible.map((post, index) => `
        <article class="scene-entry blog-entry" style="--i:${Math.min(index, 8)}">
          <span class="scene-entry-meta">${escape(post.date)}</span>
          <div class="scene-entry-body">
            <h3><button class="blog-open" data-open="${escape(post.id)}">${escape(post.title)}</button></h3>
            <p>${escape(post.preview)}</p>
            <span class="scene-tags">${post.categories.map((value) => `<span>${escape(value)}</span>`).join('')}${post.tags.map((value) => `<span>#${escape(value)}</span>`).join('')}</span>
          </div>
        </article>`).join('') : '<p class="blog-state">暂无文章</p>'}
      ${filtered.length > visible.length ? '<button class="blog-button blog-more" data-action="more">Load more ↓</button>' : ''}`;
  }

  function renderDetail(id) {
    const post = posts.find((item) => item.id === id);
    if (!post) return renderList();
    mode = 'detail';
    currentId = id;
    root.classList.add('blog-detail-mode');
    main.innerHTML = `<article class="blog-article"><header><span class="scene-entry-meta">${escape(post.date)}${post.categories.length ? ` · ${post.categories.map(escape).join(' / ')}` : ''}</span><h1>${escape(post.title)}</h1>${post.tags.length ? `<span class="scene-tags">${post.tags.map((value) => `<span>#${escape(value)}</span>`).join('')}</span>` : ''}</header><div class="blog-markdown"></div></article>`;
    const toc = renderMarkdown(main.querySelector('.blog-markdown'), post.body);
    aside.innerHTML = `
      <button class="blog-link blog-back" data-action="list">← All posts</button>
      <span class="eyebrow"><span class="status-dot"></span> ${scene.label} — ${escape(scene.name)}</span>
      ${toc.length ? `<nav class="blog-toc" aria-label="目录"><span>CONTENTS</span>${toc.map((item) => `<a href="#${escape(item.id)}" class="toc-${item.level}">${escape(item.text)}</a>`).join('')}</nav>` : ''}
      ${user ? `<div class="blog-admin"><button class="blog-link" data-action="edit">Edit</button><button class="blog-link danger" data-action="delete">Delete</button></div>` : ''}`;
    panel.scrollTop = 0;
  }

  const render = () => (mode === 'detail' ? renderDetail(currentId) : renderList());

  async function load(refresh = false) {
    try {
      posts = await fetchPosts({ refresh });
      if (!disposed) render();
    } catch (error) {
      if (disposed) return;
      console.error('Failed to load posts', error);
      renderList();
      main.innerHTML = `<p class="blog-state error">加载失败：${escape(error.code || error.message)}</p><button class="blog-button" data-action="retry">Retry ↻</button>`;
    }
  }

  const onSaved = async (id) => {
    await load(true);
    if (!disposed) renderDetail(id);
  };

  root.addEventListener('click', async (event) => {
    const open = event.target.closest('[data-open]');
    if (open) return renderDetail(open.dataset.open);
    const chip = event.target.closest('[data-filter-type]');
    if (chip) {
      const { filterType: type, filterValue: value } = chip.dataset;
      const same = filter?.type === type && filter.value === value;
      const parent = type === 'category' ? value.split('/').slice(0, -1).join('/') : '';
      filter = !same ? { type, value } : parent ? { type, value: parent } : null;
      page = 1;
      return renderList();
    }
    const tocLink = event.target.closest('.blog-toc a');
    if (tocLink) {
      event.preventDefault();
      root.querySelector(`[id="${CSS.escape(tocLink.getAttribute('href').slice(1))}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'list') renderList();
    else if (action === 'more') { page++; renderList(); }
    else if (action === 'clear-filter') { filter = null; page = 1; renderList(); }
    else if (action === 'retry') { main.innerHTML = '<p class="blog-state">LOADING POSTS…</p>'; load(true); }
    else if (action === 'login') dialogs.login();
    else if (action === 'logout') logout();
    else if (action === 'new') dialogs.edit(null, onSaved);
    else if (action === 'edit') dialogs.edit(posts.find((post) => post.id === currentId), onSaved);
    else if (action === 'delete' && confirm('确认删除这篇文章？')) {
      try {
        await deletePost(currentId);
        mode = 'list';
        await load(true);
      } catch (error) {
        alert(`删除失败：${error.code || error.message}`);
      }
    }
  });

  const view = {
    refreshAdmin() {
      if (disposed) return;
      if (posts.length) return render();
      const bar = aside.querySelector('.blog-admin');
      if (bar) bar.outerHTML = adminBar();
    },
  };
  views.add(view);
  renderList();
  load();

  return () => {
    disposed = true;
    views.delete(view);
  };
}
