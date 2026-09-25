import { scenes } from './scenes.js';

const escape = (value = '') => String(value).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
const num = (value) => String(value).padStart(2, '0');

function renderItem(kind, item, index) {
  const tags = item.tags?.length ? `<span class="scene-tags">${item.tags.map((tag) => `<span>${escape(tag)}</span>`).join('')}</span>` : '';
  if (kind === 'works') {
    const tag = item.href ? 'a' : 'div';
    const link = item.href ? ` href="${escape(item.href)}"` : '';
    return `<${tag} class="scene-work"${link} style="--i:${index}">
      <span class="scene-work-head"><span>${num(index + 1)}</span><span>${escape(item.meta)}</span></span>
      <strong>${escape(item.title)}</strong>
      <small>${escape(item.kind)}</small>
      <p>${escape(item.summary)}</p>
      ${item.href ? '<span class="scene-work-arrow" aria-hidden="true">↗</span>' : ''}
    </${tag}>`;
  }
  return `<article class="scene-entry" style="--i:${index}">
    <span class="scene-entry-meta">${escape(item.meta)}</span>
    <div class="scene-entry-body">
      <h3>${escape(item.title)}${item.org ? ` <span>@ ${escape(item.org)}</span>` : ''}</h3>
      <p>${escape(item.summary)}</p>
      ${tags}
    </div>
  </article>`;
}

export function createSceneView({ gallery, albums }) {
  gallery.insertAdjacentHTML('afterend', '<section class="scene-panel" id="scene-panel" aria-live="polite" inert></section>');
  const panel = document.querySelector('#scene-panel');
  const caption = document.querySelector('.tabletop-caption');
  const defaultCaption = caption.innerHTML;
  let current = null;
  let dispose = null;

  function unmount() {
    dispose?.();
    dispose = null;
  }

  function show(index) {
    const album = albums[index];
    const scene = scenes[album?.scene];
    if (!scene) return hide();
    const key = scene.source ? album.scene : `${album.scene}|${index}`;
    caption.innerHTML = `${scene.label} / ${escape(scene.name)} <span>SIDE A · ${escape(album.title.toUpperCase())}</span>`;
    if (current === key) return;
    current = key;
    unmount();
    panel.className = `scene-panel scene-${scene.kind}`;
    panel.inert = false;
    requestAnimationFrame(() => panel.classList.add('is-visible'));
    if (scene.source === 'firestore') {
      panel.innerHTML = '<div class="scene-inner"></div>';
      panel.scrollTop = 0;
      const root = panel.firstElementChild;
      import('./blog/blog-scene.js').then(({ mountBlog }) => {
        if (current === key && root.isConnected) dispose = mountBlog(root, scene);
      }).catch((error) => {
        root.innerHTML = `<p class="blog-state error">博客模块加载失败：${escape(error.message)}</p>`;
      });
      return;
    }
    panel.innerHTML = `
      <div class="scene-inner">
        <header class="scene-heading">
          <span class="eyebrow"><span class="status-dot"></span> ${scene.label} — ${escape(scene.name)}</span>
          <h2>${scene.title}<span class="green-period">.</span></h2>
          <p>${escape(scene.intro)}</p>
        </header>
        <div class="scene-list">${scene.items.map((item, i) => renderItem(scene.kind, item, i)).join('')}</div>
      </div>`;
    panel.scrollTop = 0;
  }

  function hide() {
    current = null;
    unmount();
    panel.classList.remove('is-visible');
    panel.inert = true;
    caption.innerHTML = defaultCaption;
  }

  return { show, hide };
}
