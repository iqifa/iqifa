import './style.css';
import { projects, imagePath } from './data.js';

const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.5"/></svg>';
const chevron = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 5 7 7-7 7" stroke="currentColor" stroke-width="1.5"/></svg>';
const cross = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" stroke="currentColor" stroke-width="1.5"/></svg>';
const spaceIcon = '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="m2 7 4 1v8l-4-1V7Zm5-4 4 1v8l-4-1V3Zm5-2 4 1v8l-4-1V1Z" stroke="currentColor"/></svg>';
const gridIcon = '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M2 2h5v5H2zM11 2h5v5h-5zM2 11h5v5H2zM11 11h5v5h-5z" stroke="currentColor"/></svg>';
const num = (value) => String(value).padStart(2, '0');
const mod = (value, size) => ((value % size) + size) % size;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

 document.querySelector('#app').innerHTML = `
  <header class="header">
    <a class="wordmark" href="#" aria-label="Éther home">ÉTHER<span>®</span></a>
    <span class="brand-descriptor">INDEPENDENT CREATIVE STUDIO<br>ART, TECHNOLOGY & THE IN-BETWEEN</span>
    <nav class="navigation" aria-label="Main navigation">
      <button class="nav-link active" id="work-nav">Work <sup>12</sup></button>
      <button class="nav-link" id="about-nav">About</button>
      <button class="contact-nav" id="contact-nav">Let’s talk <span>${arrow}</span></button>
    </nav>
  </header>

  <main id="main">
    <section class="introduction" aria-labelledby="hero-title">
      <div class="eyebrow"><span class="status-dot"></span> A SPACE FOR THE UNEXPECTED</div>
      <h1 id="hero-title">A different<br><span>perspective.</span><span class="title-period">↗</span></h1>
      <p>Exploring the possibilities between<br>what is real and what could be.</p>
      <button class="explore-link" id="explore-button">Step inside <span>↗</span></button>
    </section>

    <div class="archive-label"><span>SELECTED EXPLORATIONS</span><span>2024 — 2026</span></div>
    <section class="gallery-stage" id="gallery" aria-label="Interactive spatial gallery. Scroll, drag, or use arrow keys to explore.">
      <div class="gallery-origin" id="gallery-origin">
        ${projects.map((p, i) => `
          <button class="artwork" data-index="${i}" aria-label="View ${p.title}" style="--art-color:${p.color};--ratio:${p.ratio}">
            <span class="artwork-surface">
              <img src="${imagePath(p)}" alt="${p.title} — ${p.category}" draggable="false" decoding="async" fetchpriority="${i === 4 ? 'high' : 'auto'}" />
              <span class="artwork-sheen"></span>
              <span class="artwork-label"><span>${p.title}</span><span>↗</span></span>
            </span>
          </button>
        `).join('')}
      </div>
    </section>
    <span class="axis-note" aria-hidden="true">IMAGINATION HAS NO FIXED POINT OF VIEW <span>↓</span></span>
    <div class="gallery-cursor" id="gallery-cursor" aria-hidden="true">VIEW <span>↗</span></div>

    <section class="index-panel" id="index-panel" aria-labelledby="index-title" hidden>
      <div class="index-heading"><div><span class="eyebrow">THE SELECTED ARCHIVE / 2024 — 2026</span><h2 id="index-title">Work index<span>(${num(projects.length)})</span></h2></div>
        <div class="index-filters" role="group" aria-label="Filter work">
          <button class="filter active" data-filter="all" aria-pressed="true">All work <sup>12</sup></button>
          <button class="filter" data-filter="art" aria-pressed="false">Art & imagination</button>
          <button class="filter" data-filter="study" aria-pressed="false">Studies & form</button>
        </div>
      </div>
      <div class="index-grid" id="index-grid">
        ${projects.map((p, i) => `
          <button class="index-card" data-index="${i}" data-group="${/studies|form/i.test(p.category) ? 'study' : 'art'}" aria-label="View ${p.title}">
            <div class="index-image" style="background:${p.color}"><img src="${imagePath(p)}" alt="${p.title}" loading="lazy" /><span class="index-image-arrow">${arrow}</span></div>
            <div class="index-card-info"><span class="index-card-number">${num(i + 1)}</span><span class="index-card-title">${p.title}<small>${p.category}</small></span><span class="index-card-year">${p.year}</span></div>
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
        <div class="project-steppers"><button id="previous-project" aria-label="Previous project">${chevron}</button><div class="position-track" id="position-track">${projects.map((_, i) => `<button class="position-mark ${i === 4 ? 'active' : ''}" data-position="${i}" aria-label="Focus project ${i + 1}"></button>`).join('')}</div><button id="next-project" aria-label="Next project">${chevron}</button></div>
        <span class="scroll-hint"><span class="scroll-icon"></span><span class="desktop-hint">SCROLL OR DRAG TO EXPLORE</span><span class="mobile-hint">SWIPE TO EXPLORE</span></span>
      </div>
    </div>
    <div class="footer-meta"><span>© ÉTHER STUDIO 2026</span><span class="footer-manifesto">AN ONGOING EXPLORATION OF WHAT’S NEXT.</span><span class="clock-label"><span class="status-dot"></span> LOCAL TIME <time id="local-clock"></time></span></div>
  </footer>

  <dialog class="project-dialog" id="project-dialog" aria-labelledby="project-title">
    <button class="dialog-close" data-close aria-label="Close project">${cross}</button>
    <div class="project-image-wrap"><img id="project-image" src="${imagePath(projects[4])}" alt="" /><span class="image-credit">IMAGE STUDY / UNVEIL®</span></div>
    <div class="project-content"><span class="eyebrow" id="project-number"></span><h2 id="project-title"></h2><span class="project-category" id="project-category"></span><p class="project-description" id="project-description"></p>
      <div class="project-details"><div><span>EXPLORATION</span><span id="project-discipline"></span></div><div><span>YEAR</span><span id="project-year"></span></div></div>
      <a class="source-link" href="https://unveil.fr/" target="_blank" rel="noopener noreferrer">Discover the original artwork ${arrow}</a>
      <div class="dialog-project-navigation"><button id="modal-previous">${chevron} Previous</button><span id="modal-count"></span><button id="modal-next">Next ${chevron}</button></div>
    </div>
  </dialog>

  <dialog class="about-dialog text-dialog" id="about-dialog" aria-labelledby="about-title">
    <button class="dialog-close" data-close aria-label="Close about">${cross}</button>
    <span class="eyebrow"><span class="status-dot"></span> A LITTLE ABOUT THIS SPACE</span>
    <h2 id="about-title">Curiosity,<br>without limits<span class="green-period">.</span></h2>
    <div class="about-columns"><p>We believe the most interesting things happen in the in-between.</p><div><p>ÉTHER is a concept for an independent creative practice, exploring the intersection of art, technology and human imagination.</p><p>This spatial archive is an invitation to slow down, look closer, and find a different perspective.</p></div></div>
    <div class="disciplines"><span>Art direction</span><span>Image-making</span><span>Digital experiences</span><span>Creative exploration</span></div>
    <div class="about-credit">AN INTERFACE STUDY INSPIRED BY <a href="https://unveil.fr/" target="_blank" rel="noopener noreferrer">UNVEIL® ↗</a><p>ÉTHER is a fictional demonstration brand, not affiliated with UNVEIL. Artwork belongs to its respective creators and is included for visual reference only. Descriptions are interpretive demo copy.</p></div>
  </dialog>

  <dialog class="contact-dialog text-dialog" id="contact-dialog" aria-labelledby="contact-title">
    <button class="dialog-close" data-close aria-label="Close contact">${cross}</button>
    <span class="eyebrow"><span class="status-dot"></span> GOOD THINGS START WITH A CONVERSATION</span>
    <h2 id="contact-title">Have something<br>in mind<span class="green-period">?</span></h2>
    <p class="contact-intro">A bold idea, an unexpected collaboration,<br>or just a hello. We’d love to hear it.</p>
    <div class="contact-email"><a href="mailto:hello@ether.studio">hello@ether.studio ${arrow}</a><button id="copy-email" aria-label="Copy email address">COPY</button></div>
    <span class="contact-note">DEMO CONTACT — REPLACE WITH YOUR STUDIO’S EMAIL BEFORE PUBLISHING.</span>
  </dialog>
  <div class="toast" id="toast" role="status"></div>
`;

const gallery = document.querySelector('#gallery');
const artworkElements = [...document.querySelectorAll('.artwork')];
const positionMarks = [...document.querySelectorAll('.position-mark')];
const cursor = document.querySelector('#gallery-cursor');
const selectedTitle = document.querySelector('#selected-title');
const selectedCategory = document.querySelector('#selected-category');
const selectedCount = document.querySelector('#selected-count');
const selectedWork = document.querySelector('#selected-work');
const artworkStates = artworkElements.map((element) => ({ element, width: 0, styles: {} }));
let position = 4;
let target = 4;
let activeIndex = 4;
let selectedIndex = -1;
let modalIndex = 4;
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

function showSelected(index) {
  if (index === selectedIndex) return;
  selectedIndex = index;
  const p = projects[index];
  selectedTitle.textContent = p.title;
  selectedCategory.textContent = `${p.category}, ${p.year}`;
  selectedCount.innerHTML = `${num(index + 1)} <span>/ ${num(projects.length)}</span>`;
  selectedWork.setAttribute('aria-label', `View ${p.title}`);
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
    anchorX: viewport.width * (mobile ? 0.56 : 0.66),
    anchorY: viewport.height * (mobile ? 0.54 : 0.51),
    height: (mobile ? 330 : 356) * scale,
    stepX: (mobile ? 111 : 123) * scale,
    stepY: (mobile ? 86 : 84) * scale,
    top: bounds.top,
    bottom: bounds.bottom,
  };
  artworkStates.forEach((state, index) => {
    state.width = layout.height * projects[index].ratio;
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
  if (view !== 'space' || document.hidden || dialogOpen) return;
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
    const visible = x + halfWidth + 120 > 0 && x - halfWidth < viewport.width && y + halfHeight > layout.top && y - halfHeight < layout.bottom;
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
  if (view !== 'space' || document.hidden || dialogOpen) {
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
  resumeAnimation();
}

window.addEventListener('resize', () => {
  viewport = { width: window.innerWidth, height: window.innerHeight };
  layoutDirty = true;
  resumeAnimation();
});
document.addEventListener('visibilitychange', resumeAnimation);
reducedMotion.addEventListener('change', () => {
  pointer.x = 0;
  pointer.y = 0;
  resumeAnimation();
});
window.addEventListener('pointermove', (event) => {
  if (view !== 'space' || dialogOpen || (drag && drag.pointerId !== event.pointerId)) return;
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
  if (event.button !== 0) return;
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
window.addEventListener('wheel', (event) => {
  if (view !== 'space' || dialogOpen || event.ctrlKey || drag) return;
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
}, { passive: false });

artworkElements.forEach((element, index) => {
  element.addEventListener('pointerenter', (event) => {
    if (drag || event.pointerType === 'touch' || Math.abs(target - position) >= 0.01 || view !== 'space' || dialogOpen) return;
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
    openProject(Number(element.dataset.index));
  });
});
positionMarks.forEach((mark) => mark.addEventListener('click', () => focusProject(Number(mark.dataset.position))));
document.querySelector('#previous-project').addEventListener('click', () => step(-1));
document.querySelector('#next-project').addEventListener('click', () => step(1));
document.querySelector('#explore-button').addEventListener('click', () => step(1));
document.querySelector('#selected-work').addEventListener('click', () => openProject(hovered >= 0 ? hovered : activeIndex));
document.querySelector('#space-view').addEventListener('click', () => setView('space'));
document.querySelector('#index-view').addEventListener('click', () => setView('index'));
document.querySelector('#work-nav').addEventListener('click', () => setView('index'));
document.querySelector('.wordmark').addEventListener('click', (event) => { event.preventDefault(); target = 4; setView('space'); });

function showDialog(id) {
  const dialog = document.querySelector(id);
  setHovered(-1);
  dialog.showModal();
  dialogOpen = true;
  resumeAnimation();
}
function updateProject(index) {
  modalIndex = mod(index, projects.length);
  const p = projects[modalIndex];
  const image = document.querySelector('#project-image');
  image.src = imagePath(p);
  image.alt = `${p.title} — artwork by UNVEIL`;
  image.parentElement.style.background = p.color;
  document.querySelector('#project-number').textContent = `SELECTED EXPLORATION / ${num(modalIndex + 1)}`;
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
    if (dialog.id === 'project-dialog') focusProject(modalIndex);
    resumeAnimation();
  });
});
window.addEventListener('keydown', (event) => {
  if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(event.key) || event.altKey || event.metaKey || event.ctrlKey) return;
  const openDialog = document.querySelector('dialog[open]');
  const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
  if (openDialog?.id === 'project-dialog') {
    event.preventDefault();
    updateProject(modalIndex + direction);
  } else if (!openDialog && view === 'space') {
    event.preventDefault();
    step(direction);
  }
});

document.querySelectorAll('.filter').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach((filter) => {
      const active = filter === button;
      filter.classList.toggle('active', active);
      filter.setAttribute('aria-pressed', String(active));
    });
    let count = 0;
    document.querySelectorAll('.index-card').forEach((card) => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.group !== button.dataset.filter;
      if (!card.hidden) count++;
    });
    document.querySelector('#index-title span').textContent = `(${num(count)})`;
  });
});

let toastTimer;
function toast(message) {
  const element = document.querySelector('#toast');
  element.textContent = message;
  element.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('visible'), 2600);
}
document.querySelector('#copy-email').addEventListener('click', async () => {
  const button = document.querySelector('#copy-email');
  try {
    await navigator.clipboard.writeText('hello@ether.studio');
    button.textContent = 'COPIED';
    toast('Email address copied');
    setTimeout(() => { button.textContent = 'COPY'; }, 2200);
  } catch {
    button.textContent = 'SELECT EMAIL';
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(document.querySelector('.contact-email a'));
    selection.removeAllRanges();
    selection.addRange(range);
    toast('Select and copy the email address');
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
