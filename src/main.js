import './style.css';
import { projects, albums, imagePath, sceneOf, defaultIndex } from './data.js';
import { createRecordPlayer } from './record-player.js';
import './record-player.css';
import { createTabletop } from './tabletop.js';
import './tabletop.css';
import { createSceneView } from './scene-view.js';
import './scenes.css';
import './player-drawer.css';
import contact from './content/contact.json';

const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.5"/></svg>';
const chevron = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 5 7 7-7 7" stroke="currentColor" stroke-width="1.5"/></svg>';
const contactLinks = [
  { label: 'GitHub', href: contact.github, icon: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>' },
  { label: 'Twitter', href: contact.x, icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59z"/></svg>' },
  { label: 'Email', href: contact.email && `mailto:${contact.email}`, icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 4.5h18A1.5 1.5 0 0 1 22.5 6v.35L12 12.9 1.5 6.35V6A1.5 1.5 0 0 1 3 4.5Zm-1.5 3.62L12 14.67l10.5-6.55V18A1.5 1.5 0 0 1 21 19.5H3A1.5 1.5 0 0 1 1.5 18V8.12Z"/></svg>' },
];
const cross = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" stroke="currentColor" stroke-width="1.5"/></svg>';
const spaceIcon = '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="m2 7 4 1v8l-4-1V7Zm5-4 4 1v8l-4-1V3Zm5-2 4 1v8l-4-1V1Z" stroke="currentColor"/></svg>';
const gridIcon = '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M2 2h5v5H2zM11 2h5v5h-5zM2 11h5v5H2zM11 11h5v5h-5z" stroke="currentColor"/></svg>';
const num = (value) => String(value).padStart(2, '0');
const mod = (value, size) => ((value % size) + size) % size;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

 document.querySelector('#app').innerHTML = `
  <header class="header">
    <a class="wordmark" href="#" aria-label="PI home">PI<span>®</span></a>
    <span class="brand-descriptor">AN INDEPENDENT LISTENING ROOM<br>GOOD RECORDS. DIFFERENT PERSPECTIVES.</span>
    <nav class="navigation" aria-label="Main navigation">
      <button class="nav-link active" id="work-nav">Records <sup>${projects.length}</sup></button>      <button class="nav-link" id="about-nav">About</button>
      <button class="contact-nav" id="contact-nav">Let’s talk <span>${arrow}</span></button>
    </nav>
  </header>

  <main id="main">
    <section class="introduction" aria-labelledby="hero-title">
      <div class="eyebrow"><span class="status-dot"></span> A SPACE FOR SLOW LISTENING</div>
      <h1 id="hero-title">A different<br><span>frequency.</span><span class="title-period">↗</span></h1>
      <p>Find a record. Let it spin.<br>A little less noise. A little more feeling.</p>
      <button class="explore-link" id="explore-button">Drop the needle <span>↗</span></button>
    </section>

    <div class="archive-label"><span>THE RECORD COLLECTION</span><span>33⅓ RPM / STEREO</span></div>
    <section class="gallery-stage" id="gallery" aria-label="Interactive spatial gallery. Scroll, drag, or use arrow keys to explore.">
      <div class="gallery-origin" id="gallery-origin">
        ${projects.map((p, i) => `
          <button class="artwork" data-index="${i}" aria-label="播放 ${p.title}" aria-pressed="false" style="--art-color:${p.color}">
            <span class="artwork-surface">
              <span class="vinyl-slot" aria-hidden="true">
                <span class="vinyl-disc"><span class="vinyl-label"><span>PI / ${num(i + 1)}</span><span class="vinyl-hole"></span><span>SIDE A · 33⅓</span></span></span>
              </span>
              <span class="album-sleeve">
                <img src="${imagePath(p)}" alt="${p.title} 专辑封面" draggable="false" decoding="async" fetchpriority="${i === defaultIndex ? 'high' : 'auto'}" />
                <span class="artwork-sheen"></span>
                <span class="sleeve-catalog">PI RECORDS / ${num(i + 1)}</span>
                ${sceneOf(p) ? `<span class="sleeve-scene"><span>${sceneOf(p).label}</span><small>${sceneOf(p).name}</small></span>` : ''}
                <span class="artwork-label"><span>${p.title}</span><span class="sleeve-play-symbol">▶</span></span>
              </span>
            </span>
          </button>
        `).join('')}
      </div>
    </section>
    <span class="axis-note" aria-hidden="true">IMAGINATION HAS NO FIXED POINT OF VIEW <span>↓</span></span>
    <div class="gallery-cursor" id="gallery-cursor" aria-hidden="true">PLAY <span>↗</span><em id="cursor-scene"></em></div>

    <section class="index-panel" id="index-panel" aria-labelledby="index-title" hidden>
      <div class="index-heading"><div><span class="eyebrow">THE SELECTED COLLECTION</span><h2 id="index-title">Record index<span>(${num(projects.length)})</span></h2></div></div>
      <div class="index-grid" id="index-grid">
        ${projects.map((p, i) => `
          <button class="index-card" data-index="${i}" aria-label="播放 ${p.title}" aria-pressed="false">
            <div class="index-image" style="background:${p.color}"><img src="${imagePath(p)}" alt="${p.title}" loading="lazy" /><span class="index-image-arrow">▶</span></div>
            <div class="index-card-info"><span class="index-card-number">${num(i + 1)}</span><span class="index-card-title">${p.title}<small>${sceneOf(p) ? `${sceneOf(p).label} · ` : ''}${albums[i].genre}</small></span><span class="index-card-year">${p.year}</span></div>
          </button>
        `).join('')}
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="footer-primary">
      <button class="selected-work" id="selected-work" aria-label="View selected project">
        <span class="selected-kicker">IN FOCUS <span id="selected-count">05 <span>/ 12</span></span></span>
        <span class="selected-title"><span id="selected-title">Memories</span><span class="selected-arrow">↗</span></span>
        <span class="selected-category" id="selected-category">Art & imagination, 2024</span>
      </button>
      <div class="view-controls">
        <div class="view-switch" role="group" aria-label="Gallery view">
          <button class="view-button active" id="space-view" aria-pressed="true">${spaceIcon}<span>Space</span></button>
          <button class="view-button" id="index-view" aria-pressed="false">${gridIcon}<span>Index</span></button>
        </div>
        <span class="view-caption">SAME WORLD. ANOTHER PERSPECTIVE.</span>
      </div>
      <div class="explore-controls">
        <div class="project-steppers"><button id="previous-project" aria-label="Previous project">${chevron}</button><div class="position-track" id="position-track">${projects.map((_, i) => `<button class="position-mark ${i === defaultIndex ? 'active' : ''}" data-position="${i}" aria-label="Focus project ${i + 1}"></button>`).join('')}</div><button id="next-project" aria-label="Next project">${chevron}</button></div>
        <span class="scroll-hint"><span class="scroll-icon"></span><span class="desktop-hint">SCROLL OR DRAG TO EXPLORE</span><span class="mobile-hint">SWIPE TO EXPLORE</span></span>
      </div>
    </div>
    <div class="footer-meta"><span>© PI 2026</span><span class="footer-manifesto">AN ONGOING EXPLORATION OF WHAT’S NEXT.</span><span class="clock-label"><span class="status-dot"></span> LOCAL TIME <time id="local-clock"></time></span></div>
  </footer>

  <dialog class="project-dialog" id="project-dialog" aria-labelledby="project-title">
    <button class="dialog-close" data-close aria-label="Close project">${cross}</button>
    <div class="project-image-wrap"><img id="project-image" src="${imagePath(projects[defaultIndex])}" alt="" /><span class="image-credit">ALBUM ARTWORK</span></div>
    <div class="project-content"><span class="eyebrow" id="project-number"></span><h2 id="project-title"></h2><span class="project-category" id="project-category"></span><p class="project-description" id="project-description"></p>
      <div class="project-details"><div><span>ARTIST</span><span id="project-discipline"></span></div><div><span>YEAR</span><span id="project-year"></span></div></div>
      <div class="dialog-project-navigation"><button id="modal-previous">${chevron} Previous</button><span id="modal-count"></span><button id="modal-next">Next ${chevron}</button></div>
    </div>
  </dialog>

  <dialog class="about-dialog text-dialog" id="about-dialog" aria-labelledby="about-title">
    <button class="dialog-close" data-close aria-label="Close about">${cross}</button>
    <span class="eyebrow"><span class="status-dot"></span> A LITTLE ABOUT THIS SPACE</span>
    <h2 id="about-title">Curiosity,<br>without limits<span class="green-period">.</span></h2>
    <div class="about-columns"><p>Good records deserve a little room to breathe.</p><div><p>PI is a personal listening room. Browse a collection, slide a record from its sleeve, and find your own frequency.</p><p>Each record pairs a song with its cover art. Pause, rewind, or let the next record find you.</p></div></div>
    <div class="disciplines"><span>J-rock</span><span>Game soundtracks</span><span>Anime songs</span><span>Slow listening</span></div>
    <div class="about-credit">AN INTERFACE STUDY INSPIRED BY <a href="https://unveil.fr/" target="_blank" rel="noopener noreferrer">UNVEIL® ↗</a><p>PI is not affiliated with UNVEIL. Music and cover artwork belong to their respective artists and labels, and are shared here for personal, non-commercial listening only.</p></div>
  </dialog>

  <dialog class="contact-dialog text-dialog" id="contact-dialog" aria-labelledby="contact-title">
    <button class="dialog-close" data-close aria-label="Close contact">${cross}</button>
    <span class="eyebrow"><span class="status-dot"></span> GOOD THINGS START WITH A CONVERSATION</span>
    <h2 id="contact-title">Have something<br>in mind<span class="green-period">?</span></h2>
    <p class="contact-intro">A bold idea, an unexpected collaboration,<br>or just a hello. I’d love to hear it.</p>
    <div class="contact-links">${contactLinks.map(({ label, href, icon }) => href
      ? `<a href="${href}" ${href.startsWith('mailto:') ? '' : 'target="_blank" rel="noopener noreferrer"'} aria-label="${label}" title="${label}">${icon}</a>`
      : `<span class="is-empty" aria-label="${label}（未填写）" title="${label}（未填写）">${icon}</span>`).join('')}</div>
  </dialog>
`;

const gallery = document.querySelector('#gallery');
const artworkElements = [...document.querySelectorAll('.artwork')];
const positionMarks = [...document.querySelectorAll('.position-mark')];
const cursor = document.querySelector('#gallery-cursor');
const cursorScene = document.querySelector('#cursor-scene');
const selectedTitle = document.querySelector('#selected-title');
const selectedCategory = document.querySelector('#selected-category');
const selectedCount = document.querySelector('#selected-count');
const selectedWork = document.querySelector('#selected-work');
const artworkStates = artworkElements.map((element) => ({ element, width: 0, styles: {} }));
let position = defaultIndex;
let target = defaultIndex;
let activeIndex = defaultIndex;
let selectedIndex = -1;
let modalIndex = defaultIndex;
let hovered = -1;
let view = 'space';
const pointer = { x: 0, y: 0 };
const smoothedPointer = { x: 0, y: 0 };
const cursorPosition = { x: 0, y: 0 };
let cursorDirty = false;
let drag = null;
let lastDrag = -1000;
let snapTimer;
let frameId = null;
let previousFrame = 0;
let viewport = { width: window.innerWidth, height: window.innerHeight };
let layoutDirty = true;
let layout;
let dialogOpen = false;
let tabletopLocked = false;
const tabletop = createTabletop({
  gallery,
  cards: artworkElements,
  onLockChange(locked) {
    tabletopLocked = locked;
    clearTimeout(snapTimer);
    if (locked) {
      finishDrag();
      setHovered(-1);
    }
    layoutDirty = true;
    syncWheel();
    resumeAnimation();
  },
  onEnter: (index) => sceneView.show(index),
  onExit() {
    sceneView.hide();
    if (location.hash === '#blog') history.replaceState(null, '', location.pathname + location.search);
  },
});
const sceneView = createSceneView({ gallery, albums });
const albumCards = [...document.querySelectorAll('[data-index]')];
const recordPlayer = createRecordPlayer({
  albums,
  getDefaultIndex: () => activeIndex,
  onSelect(index) {
    if (view !== 'space') setView('space');
    setHovered(-1);
    focusProject(index);
    tabletop.select(index);
  },
  onDetails: openProject,
  onChange({ index, playing, loading }) {
    if (index < 0) tabletop.exit();
    albumCards.forEach((card) => {
      const selected = Number(card.dataset.index) === index;
      const spinning = selected && playing;
      card.classList.toggle('is-selected', selected);
      card.classList.toggle('is-playing', spinning);
      card.setAttribute('aria-pressed', String(selected));
      card.setAttribute('aria-label', `${selected && (playing || loading) ? '暂停' : '播放'} ${albums[Number(card.dataset.index)].title}`);
      const symbol = card.querySelector('.sleeve-play-symbol');
      if (symbol) symbol.textContent = spinning ? 'Ⅱ' : '▶';
    });
    cursor.firstChild.textContent = hovered === index && playing ? 'PAUSE ' : 'PLAY ';
    if (selectedIndex >= 0) selectedWork.setAttribute('aria-label', `${selectedIndex === index && playing ? '暂停' : '播放'} ${albums[selectedIndex].title}`);
  },
});

function showSelected(index) {
  if (index === selectedIndex) return;
  selectedIndex = index;
  const p = projects[index];
  selectedTitle.textContent = p.title;
  selectedCategory.textContent = `${sceneOf(p) ? `${sceneOf(p).label} / ${sceneOf(p).name} · ` : ''}${albums[index].genre}`;
  selectedCount.innerHTML = `${num(index + 1)} <span>/ ${num(projects.length)}</span>`;
  selectedWork.setAttribute('aria-label', `${recordPlayer.index === index && recordPlayer.playing ? '暂停' : '播放'} ${p.title}`);
}

function setArtworkStyle(state, property, value) {
  if (state.styles[property] === value) return;
  state.styles[property] = value;
  state.element.style[property] = value;
}

function updateLayout() {
  const mobile = viewport.width < 700;
  const scale = mobile ? Math.min(viewport.width / 520, viewport.height / 760) : Math.min(viewport.width / 1440, viewport.height / 860);
  const bounds = gallery.getBoundingClientRect();
  layout = {
    anchorX: viewport.width * (mobile ? 0.43 : 0.61),
    anchorY: (bounds.top + bounds.bottom) / 2 + (mobile ? 30 : 0),
    height: (mobile ? 245 : 300) * scale,
    stepX: (mobile ? 111 : 123) * scale,
    stepY: (mobile ? 86 : 84) * scale,
    top: bounds.top,
    bottom: bounds.bottom,
  };
  artworkStates.forEach((state) => {
    state.width = layout.height;
    setArtworkStyle(state, 'width', `${state.width.toFixed(2)}px`);
    setArtworkStyle(state, 'height', `${layout.height.toFixed(2)}px`);
  });
  layoutDirty = false;
}

function approach(current, destination, easing, epsilon) {
  const next = current + (destination - current) * easing;
  return Math.abs(destination - next) < epsilon ? destination : next;
}

function render(now) {
  frameId = null;
  if (view !== 'space' || document.hidden || dialogOpen || tabletopLocked) return;
  if (layoutDirty) updateLayout();
  const elapsed = Math.min((now - previousFrame) / 16.67 || 1, 3);
  previousFrame = now;
  const easing = reducedMotion.matches ? 1 : 1 - Math.pow(drag?.moved ? 0.72 : 0.86, elapsed);
  position = approach(position, target, easing, 0.0005);
  smoothedPointer.x = approach(smoothedPointer.x, pointer.x, easing, 0.001);
  smoothedPointer.y = approach(smoothedPointer.y, pointer.y, easing, 0.001);
  const nextActive = mod(Math.round(position), projects.length);
  if (nextActive !== activeIndex) {
    positionMarks[activeIndex].classList.remove('active');
    activeIndex = nextActive;
    positionMarks[activeIndex].classList.add('active');
  }
  if (hovered < 0) showSelected(activeIndex);
  artworkStates.forEach((state, index) => {
    const depth = mod(index - position + projects.length / 2, projects.length) - projects.length / 2;
    const size = 1 - depth * 0.023;
    const x = layout.anchorX + depth * layout.stepX + smoothedPointer.x * (9 + depth * 1.4);
    const y = layout.anchorY - depth * layout.stepY + smoothedPointer.y * (8 + depth * 1.3);
    const halfWidth = state.width * size / 2;
    const halfHeight = (layout.height + state.width * 0.2) * size / 2;
    const rightExtension = index === recordPlayer.index ? state.width * size * 0.7 + 30 : 120;
    const visible = x + halfWidth + rightExtension > 0 && x - halfWidth < viewport.width && y + halfHeight > layout.top && y - halfHeight < layout.bottom;
    setArtworkStyle(state, 'visibility', visible ? 'visible' : 'hidden');
    if (!visible) return;
    const order = mod(index - Math.floor(position) + projects.length / 2, projects.length) - projects.length / 2;
    setArtworkStyle(state, 'zIndex', String(50 - order * 5));
    const edgeOpacity = Math.min(1, (projects.length / 2 - Math.abs(depth)) * 2);
    const opacity = edgeOpacity * (depth > 2 ? Math.max(0.35, 1 - (depth - 2) * 0.15) : 1);
    setArtworkStyle(state, 'opacity', opacity.toFixed(3));
    setArtworkStyle(state, 'transform', `translate3d(${(x - state.width / 2).toFixed(2)}px, ${(y - layout.height / 2).toFixed(2)}px, 0) scale(${size.toFixed(5)})`);
  });
  if (cursorDirty && hovered >= 0 && !drag) {
    cursor.style.transform = `translate3d(${cursorPosition.x + 20}px, ${cursorPosition.y + 20}px, 0)`;
    cursorDirty = false;
  }
  if (position !== target || smoothedPointer.x !== pointer.x || smoothedPointer.y !== pointer.y) frameId = requestAnimationFrame(render);
}

function resumeAnimation() {
  if (view !== 'space' || document.hidden || dialogOpen || tabletopLocked) {
    cancelAnimationFrame(frameId);
    frameId = null;
    return;
  }
  if (frameId !== null) return;
  previousFrame = performance.now();
  frameId = requestAnimationFrame(render);
}

function setHovered(index) {
  if (hovered === index) return;
  if (hovered >= 0) artworkElements[hovered].classList.remove('is-hovered');
  hovered = index;
  if (hovered >= 0) artworkElements[hovered].classList.add('is-hovered');
  cursor.classList.toggle('visible', hovered >= 0);
  if (hovered >= 0) cursorScene.textContent = sceneOf(projects[hovered]) ? `ENTER ${sceneOf(projects[hovered]).label}` : '';
  cursor.firstChild.textContent = hovered === recordPlayer.index && recordPlayer.playing ? 'PAUSE ' : 'PLAY ';
  cursorDirty = true;
  showSelected(hovered >= 0 ? hovered : activeIndex);
  resumeAnimation();
}

function step(direction) {
  clearTimeout(snapTimer);
  setHovered(-1);
  target = Math.round(target) + direction;
  resumeAnimation();
}

function focusProject(index) {
  clearTimeout(snapTimer);
  const nearest = Math.round(target);
  const diff = mod(index - mod(nearest, projects.length) + projects.length / 2, projects.length) - projects.length / 2;
  target = nearest + diff;
  resumeAnimation();
}

function setView(nextView) {
  tabletop.exit();
  view = nextView;
  document.body.classList.toggle('index-mode', view === 'index');
  document.querySelector('#index-panel').hidden = view !== 'index';
  gallery.inert = view !== 'space';
  document.querySelector('.introduction').inert = view !== 'space';
  for (const mode of ['space', 'index']) {
    const button = document.querySelector(`#${mode}-view`);
    button.classList.toggle('active', view === mode);
    button.setAttribute('aria-pressed', String(view === mode));
  }
  setHovered(-1);
  showSelected(activeIndex);
  syncWheel();
  resumeAnimation();
}

window.addEventListener('resize', () => {
  viewport = { width: window.innerWidth, height: window.innerHeight };
  layoutDirty = true;
  resumeAnimation();
});
window.addEventListener('playerdrawerchange', () => {
  layoutDirty = true;
  resumeAnimation();
});
document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('page-hidden', document.hidden);
  resumeAnimation();
});
reducedMotion.addEventListener('change', () => {
  pointer.x = 0;
  pointer.y = 0;
  resumeAnimation();
});
window.addEventListener('pointermove', (event) => {
  if (view !== 'space' || dialogOpen || tabletopLocked || (drag && drag.pointerId !== event.pointerId)) return;
  if (event.pointerType !== 'touch') {
    cursorPosition.x = event.clientX;
    cursorPosition.y = event.clientY;
    cursorDirty = true;
    if (!drag && Math.abs(target - position) < 0.01) {
      const artwork = event.target.closest('.artwork');
      setHovered(artwork ? Number(artwork.dataset.index) : -1);
    }
    if (!reducedMotion.matches && hovered < 0 && !drag) {
      pointer.x = event.clientX / viewport.width - 0.5;
      pointer.y = event.clientY / viewport.height - 0.5;
    }
  }
  if (drag) {
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (drag.moved || Math.hypot(dx, dy) > 6) {
      if (!drag.moved) {
        drag.moved = true;
        gallery.setPointerCapture(event.pointerId);
        gallery.classList.add('is-dragging');
        setHovered(-1);
      }
      target = drag.start - (dx - dy) / (viewport.width < 700 ? 115 : 210);
    }
  }
  resumeAnimation();
}, { passive: true });

gallery.addEventListener('pointerdown', (event) => {
  if (event.button !== 0 || tabletopLocked) return;
  clearTimeout(snapTimer);
  drag = { x: event.clientX, y: event.clientY, start: target, moved: false, pointerId: event.pointerId };
});
function finishDrag() {
  if (!drag) return;
  if (drag.moved) {
    lastDrag = performance.now();
    target = Math.round(target);
  }
  if (gallery.hasPointerCapture(drag.pointerId)) gallery.releasePointerCapture(drag.pointerId);
  drag = null;
  gallery.classList.remove('is-dragging');
  resumeAnimation();
}
window.addEventListener('pointerup', finishDrag);
window.addEventListener('pointercancel', finishDrag);
window.addEventListener('blur', finishDrag);
let wheelBound = false;
function syncWheel() {
  const wanted = view === 'space' && !tabletopLocked;
  if (wanted === wheelBound) return;
  wheelBound = wanted;
  if (wanted) window.addEventListener('wheel', onWheel, { passive: false });
  else window.removeEventListener('wheel', onWheel, { passive: false });
}
function onWheel(event) {
  if (view !== 'space' || dialogOpen || event.ctrlKey || drag || tabletopLocked) return;
  event.preventDefault();
  setHovered(-1);
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.height : 1;
  const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
  target += Math.max(-150, Math.min(150, delta * unit)) * 0.004;
  clearTimeout(snapTimer);
  snapTimer = setTimeout(() => {
    target = Math.round(target);
    resumeAnimation();
  }, 180);
  resumeAnimation();
}
syncWheel();

artworkElements.forEach((element, index) => {
  element.addEventListener('pointerenter', (event) => {
    if (drag || event.pointerType === 'touch' || Math.abs(target - position) >= 0.01 || view !== 'space' || dialogOpen || tabletopLocked) return;
    cursorPosition.x = event.clientX;
    cursorPosition.y = event.clientY;
    setHovered(index);
  });
  element.addEventListener('pointerleave', () => {
    if (hovered === index) setHovered(-1);
  });
  element.addEventListener('focus', () => {
    if (view === 'space' && element.matches(':focus-visible')) focusProject(index);
  });
});
document.querySelectorAll('[data-index]').forEach((element) => {
  element.addEventListener('click', () => {
    if (performance.now() - lastDrag < 250) return;
    recordPlayer.select(Number(element.dataset.index));
  });
});
positionMarks.forEach((mark) => mark.addEventListener('click', () => focusProject(Number(mark.dataset.position))));
document.querySelector('#previous-project').addEventListener('click', () => step(-1));
document.querySelector('#next-project').addEventListener('click', () => step(1));
document.querySelector('#explore-button').addEventListener('click', () => recordPlayer.select(activeIndex));
document.querySelector('#selected-work').addEventListener('click', () => recordPlayer.select(hovered >= 0 ? hovered : activeIndex));
document.querySelector('#space-view').addEventListener('click', () => setView('space'));
document.querySelector('#index-view').addEventListener('click', () => setView('index'));
document.querySelector('#work-nav').addEventListener('click', () => setView('index'));

function openScene(sceneId) {
  const current = recordPlayer.index;
  const index = current >= 0 && projects[current].scene === sceneId ? current : projects.findIndex((p) => p.scene === sceneId);
  if (index < 0) return;
  if (view !== 'space') setView('space');
  setHovered(-1);
  focusProject(index);
  tabletop.select(index);
}
if (location.hash === '#blog') requestAnimationFrame(() => requestAnimationFrame(() => openScene('blog')));
document.querySelector('.wordmark').addEventListener('click', (event) => { event.preventDefault(); target = defaultIndex; setView('space'); });

function showDialog(id) {
  const dialog = document.querySelector(id);
  setHovered(-1);
  dialog.showModal();
  dialogOpen = true;
  document.body.classList.add('dialog-open');
  resumeAnimation();
}
function updateProject(index) {
  modalIndex = mod(index, projects.length);
  const p = projects[modalIndex];
  const image = document.querySelector('#project-image');
  image.src = imagePath(p);
  image.alt = `${p.title} — ${p.category} 专辑封面`;
  image.parentElement.style.background = p.color;
  document.querySelector('#project-number').textContent = `SELECTED RECORD / ${num(modalIndex + 1)}`;
  document.querySelector('#project-title').textContent = p.title;
  document.querySelector('#project-category').textContent = `${p.category} — ${p.year}`;
  document.querySelector('#project-description').textContent = p.description;
  document.querySelector('#project-discipline').textContent = p.category;
  document.querySelector('#project-year').textContent = p.year;
  document.querySelector('#modal-count').textContent = `${num(modalIndex + 1)} / ${num(projects.length)}`;
}
function openProject(index) {
  updateProject(index);
  focusProject(index);
  showDialog('#project-dialog');
}
document.querySelector('#modal-previous').addEventListener('click', () => updateProject(modalIndex - 1));
document.querySelector('#modal-next').addEventListener('click', () => updateProject(modalIndex + 1));
document.querySelector('#about-nav').addEventListener('click', () => showDialog('#about-dialog'));
document.querySelector('#contact-nav').addEventListener('click', () => showDialog('#contact-dialog'));
document.querySelectorAll('dialog').forEach((dialog) => {
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    dialogOpen = !!document.querySelector('dialog[open]');
    document.body.classList.toggle('dialog-open', dialogOpen);
    if (dialog.id === 'project-dialog') focusProject(modalIndex);
    resumeAnimation();
  });
});
window.addEventListener('keydown', (event) => {
  if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
  if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(event.key) || event.altKey || event.metaKey || event.ctrlKey) return;
  const openDialog = document.querySelector('dialog[open]');
  const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
  if (openDialog?.id === 'project-dialog') {
    event.preventDefault();
    updateProject(modalIndex + direction);
  } else if (!openDialog && view === 'space') {
    if (tabletopLocked && ['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault();
    if (tabletopLocked) recordPlayer.changeAlbum(direction);
    else step(direction);
  }
});

function updateClock() {
  const date = new Date();
  const clock = document.querySelector('#local-clock');
  clock.textContent = date.toLocaleTimeString('en-GB', { hour12: false });
  clock.dateTime = date.toISOString();
}
updateClock();
setInterval(updateClock, 1000);

document.querySelectorAll('img').forEach((image) => {
  image.addEventListener('error', () => {
    image.classList.add('image-unavailable');
    image.parentElement.classList.add('has-image-error');
  });
});

resumeAnimation();
requestAnimationFrame(() => document.body.classList.add('is-ready'));
