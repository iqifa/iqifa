export function createTabletop({ gallery, cards, onLockChange, onEnter, onExit }) {
  gallery.insertAdjacentHTML('beforebegin', `
    <section class="tabletop-toolbar" aria-label="单专辑聆听" inert>
      <button class="tabletop-back" type="button" aria-label="返回唱片收藏">
        <span aria-hidden="true">←</span> Back to collection <kbd>ESC</kbd>
      </button>
      <span class="tabletop-caption">THE LISTENING TABLE <span>01 / 01</span></span>
    </section>
    <div class="tabletop-note" aria-hidden="true"><span>SIDE A</span><span>TAKE YOUR TIME. LET IT PLAY.</span><span>33⅓ RPM</span></div>
  `);
  const toolbar = document.querySelector('.tabletop-toolbar');
  const back = toolbar.querySelector('.tabletop-back');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const collectionUI = [...document.querySelectorAll('.introduction, .footer-primary')];
  let phase = 'browse';
  let selected = -1;
  let returnTimer;
  let resizeFrame;
  let savedInert = [];
  let focusBefore;

  function positionRecord() {
    if (phase !== 'table' || selected < 0) return;
    const card = cards[selected];
    const bounds = gallery.getBoundingClientRect();
    const baseWidth = parseFloat(card.style.width);
    if (!baseWidth) return;
    const mobile = innerWidth < 700;
    const availableHeight = Math.max(130, bounds.height - (mobile ? 105 : 145));
    const size = Math.max(80, Math.min(430, (innerWidth - (mobile ? 40 : 150)) / 1.85, availableHeight / 1.25));
    const centerX = innerWidth / 2 - size * 0.3;
    const centerY = bounds.top + bounds.height / 2 + (mobile ? 16 : 20);
    card.style.setProperty('--table-transform', `translate3d(${(centerX - baseWidth / 2).toFixed(2)}px, ${(centerY - baseWidth / 2).toFixed(2)}px, 0) scale(${(size / baseWidth).toFixed(5)})`);
  }

  function isolate() {
    const active = document.activeElement;
    cards.forEach((card, index) => {
      card.classList.toggle('is-on-table', index === selected);
      card.inert = true;
    });
    if (cards.some((card) => card.contains(active))) document.querySelector('#record-toggle')?.focus({ preventScroll: true });
  }

  function enter() {
    if (selected < 0 || phase === 'browse') return;
    phase = 'table';
    onLockChange(true);
    const card = cards[selected];
    if (!card.style.getPropertyValue('--table-transform')) card.style.setProperty('--table-transform', card.style.transform);
    document.body.classList.remove('tabletop-returning');
    document.body.classList.add('tabletop-mode');
    toolbar.inert = false;
    if (!savedInert.length) {
      savedInert = collectionUI.map((element) => element.inert);
      focusBefore = document.activeElement;
    }
    collectionUI.forEach((element) => { element.inert = true; });
    isolate();
    positionRecord();
    onEnter?.(selected);
    if (collectionUI.some((element) => element.contains(document.activeElement))) back.focus({ preventScroll: true });
  }

  function select(index) {
    if (index < 0 || index >= cards.length) return;
    if (phase === 'table' && index === selected) return;
    clearTimeout(returnTimer);
    selected = index;
    phase = 'table';
    enter();
  }

  function finishReturn() {
    if (phase !== 'returning') return;
    phase = 'browse';
    selected = -1;
    document.body.classList.remove('tabletop-returning');
    cards.forEach((card) => {
      card.classList.remove('is-on-table');
      card.style.removeProperty('--table-transform');
      card.inert = false;
    });
    collectionUI.forEach((element, index) => {
      element.inert = (savedInert[index] ?? false) || (element.classList.contains('introduction') && document.body.classList.contains('index-mode'));
    });
    savedInert = [];
    onLockChange(false);
  }

  function exit({ restoreFocus = false } = {}) {
    clearTimeout(returnTimer);
    if (phase === 'browse') return;
    phase = 'returning';
    onExit?.();
    toolbar.inert = true;
    document.body.classList.add('tabletop-returning');
    document.body.classList.remove('tabletop-mode');
    cards.forEach((card) => { card.inert = true; });
    if (restoreFocus) {
      const focusTarget = focusBefore?.isConnected && !focusBefore.closest('[inert]') ? focusBefore : document.querySelector('.wordmark');
      focusTarget?.focus({ preventScroll: true });
    }
    if (reducedMotion.matches) finishReturn();
    else returnTimer = setTimeout(finishReturn, 960);
  }

  back.addEventListener('click', () => exit({ restoreFocus: true }));
  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || document.querySelector('dialog[open]') || phase === 'browse') return;
    event.preventDefault();
    exit({ restoreFocus: true });
  });
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(positionRecord);
  });
  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return;
    if (phase === 'returning') { clearTimeout(returnTimer); finishReturn(); }
  });
  if (import.meta.hot) import.meta.hot.dispose(() => {
    clearTimeout(returnTimer);
    cancelAnimationFrame(resizeFrame);
  });
  return { select, exit, get locked() { return phase === 'table' || phase === 'returning'; } };
}
