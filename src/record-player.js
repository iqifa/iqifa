import { AudioEngine } from './audio-engine.js';
import { imagePath } from './data.js';

const icon = (path) => `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">${path}</svg>`;
const playIcon = icon('<path d="m9 5 11 7-11 7V5Z" fill="currentColor"/>');
const pauseIcon = icon('<path d="M7 5h4v14H7zm7 0h4v14h-4z" fill="currentColor"/>');
const previousIcon = icon('<path d="M5 5v14m14-14L8 12l11 7V5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>');
const nextIcon = icon('<path d="M19 5v14M5 5l11 7-11 7V5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>');
const volumeIcon = icon('<path d="m11 5-5 4H3v6h3l5 4V5Zm4 3c3 2 3 6 0 8m3-11c5 4 5 10 0 14" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>');
const muteIcon = icon('<path d="m11 5-5 4H3v6h3l5 4V5Zm5 4 6 6m0-6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>');
const ejectIcon = icon('<path d="m12 5 7 10H5L12 5ZM5 19h14" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>');
const infoIcon = icon('<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M12 11v6m0-10v1" stroke="currentColor" stroke-width="1.5"/>');
const time = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export function createRecordPlayer({ albums, onChange, onSelect, onDetails, getDefaultIndex }) {
  document.querySelector('.footer-meta').insertAdjacentHTML('beforebegin', `
    <div class="player-drawer is-collapsed">
      <button class="player-drawer-handle" id="player-drawer-toggle" type="button" aria-expanded="false" aria-controls="player-drawer-content" aria-label="展开播放器">
        <span class="drawer-grip" aria-hidden="true"></span>
        <span class="drawer-summary"><strong id="drawer-track">The listening room</strong><span id="drawer-state">SELECT A RECORD</span></span>
        <span class="drawer-action"><span id="drawer-action-label">展开播放器</span><span class="drawer-chevron" aria-hidden="true">${icon('<path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="1.5"/>')}</span></span>
      </button>
      <div class="player-drawer-body" id="player-drawer-content" inert aria-hidden="true">
        <div class="player-drawer-clip">
    <section class="record-console console-empty" aria-label="黑胶唱片播放器">
      <button class="console-album" id="record-locate" aria-label="定位当前唱片" disabled>
        <span class="console-art"><img id="record-cover" src="${imagePath(albums[4])}" alt="" /></span>
        <span class="console-album-copy"><strong id="record-title">Nothing on the turntable</strong><small><span class="console-dot"></span><span id="record-subtitle">SELECT A RECORD TO PLAY</span></small></span>
      </button>
      <div class="console-transport">
        <button id="record-previous" aria-label="播放上一张专辑" title="上一张专辑">${previousIcon}</button>
        <button id="record-toggle" aria-label="播放专辑" title="播放 / 暂停">${playIcon}</button>
        <button id="record-next" aria-label="播放下一张专辑" title="下一张专辑">${nextIcon}</button>
      </div>
      <div class="console-timeline"><time id="record-elapsed">0:00</time><input id="record-progress" type="range" min="0" max="1" value="0" step="0.1" aria-label="播放进度" disabled /><time id="record-duration">0:00</time></div>
      <div class="console-tools">
        <div class="console-volume"><button id="record-mute" aria-label="静音" aria-pressed="false" title="静音">${volumeIcon}</button><input id="record-volume" type="range" min="0" max="1" value="0.45" step="0.01" aria-label="音量" style="--progress:45%" /></div>
        <button id="record-info" aria-label="查看专辑封面信息" title="封面信息" disabled>${infoIcon}</button>
        <button id="record-eject" aria-label="停止并收回黑胶" title="停止并收回黑胶" disabled>${ejectIcon}</button>
      </div>
      <span class="console-status" id="record-status" role="status">选择专辑，开始聆听 · 内置合成试听</span>
    </section>
        </div>
      </div>
    </div>
  `);
  const drawer = document.querySelector('.player-drawer');
  const drawerToggle = document.querySelector('#player-drawer-toggle');
  const drawerBody = document.querySelector('#player-drawer-content');
  const drawerTrack = document.querySelector('#drawer-track');
  const drawerState = document.querySelector('#drawer-state');
  const drawerAction = document.querySelector('#drawer-action-label');
  const element = document.querySelector('.record-console');
  const title = element.querySelector('#record-title');
  const subtitle = element.querySelector('#record-subtitle');
  const cover = element.querySelector('#record-cover');
  const toggle = element.querySelector('#record-toggle');
  const progress = element.querySelector('#record-progress');
  const elapsed = element.querySelector('#record-elapsed');
  const duration = element.querySelector('#record-duration');
  const volume = element.querySelector('#record-volume');
  const mute = element.querySelector('#record-mute');
  const status = element.querySelector('#record-status');
  let progressTimer = null;
  let previousVolume = 0.45;
  let scrubbing = false;
  let renderedState = '';
  let expanded = false;
  document.body.classList.add('player-collapsed');
  const engine = new AudioEngine(update, () => changeAlbum(1));

  function setExpanded(value) {
    if (expanded === value) return;
    finishSeek();
    expanded = value;
    if (!expanded && drawerBody.contains(document.activeElement)) drawerToggle.focus({ preventScroll: true });
    drawerBody.inert = !expanded;
    drawerBody.setAttribute('aria-hidden', String(!expanded));
    drawer.classList.toggle('is-collapsed', !expanded);
    document.body.classList.toggle('player-collapsed', !expanded);
    drawerToggle.setAttribute('aria-expanded', String(expanded));
    const action = expanded ? '收起播放器' : '展开播放器';
    drawerToggle.setAttribute('aria-label', action);
    drawerAction.textContent = action;
    syncProgressTimer();
    updateProgress();
    window.dispatchEvent(new Event('playerdrawerchange'));
  }

  function syncProgressTimer() {
    clearInterval(progressTimer);
    progressTimer = expanded && engine.playing && !document.hidden ? setInterval(updateProgress, 250) : null;
  }

  drawerToggle.addEventListener('click', () => setExpanded(!expanded));

  function updateProgress() {
    if (document.hidden || scrubbing || !expanded) return;
    const total = engine.duration;
    const current = engine.currentTime;
    progress.max = String(total || 1);
    progress.value = String(current);
    progress.style.setProperty('--progress', `${total ? current / total * 100 : 0}%`);
    progress.setAttribute('aria-valuetext', `${time(current)} / ${time(total)}`);
    elapsed.textContent = time(current);
    duration.textContent = time(total);
  }

  function update(state) {
    const { album, playing, loading, error } = state;
    const signature = `${album?.id}|${playing}|${loading}|${error}`;
    if (signature !== renderedState) {
      renderedState = signature;
      element.classList.toggle('console-empty', !album);
      element.classList.toggle('is-playing', playing);
      element.classList.toggle('has-error', !!error);
      element.setAttribute('aria-busy', String(loading));
      title.textContent = album?.title || 'Nothing on the turntable';
      subtitle.textContent = album ? `${loading ? 'LOADING' : playing ? 'NOW SPINNING' : 'PAUSED'} · ${album.audioSrc ? album.genre.toUpperCase() : 'SYNTH DEMO'}` : 'SELECT A RECORD TO PLAY';
      drawerTrack.textContent = album?.title || 'The listening room';
      drawerState.textContent = error ? 'PLAYBACK ERROR' : album ? loading ? 'LOADING' : playing ? 'NOW SPINNING' : 'PAUSED' : 'SELECT A RECORD';
      drawer.classList.toggle('is-playing', playing);
      if (album) cover.src = imagePath(album);
      toggle.innerHTML = playing || loading ? pauseIcon : playIcon;
      toggle.setAttribute('aria-label', loading ? '取消播放' : playing ? '暂停播放' : '播放专辑');
      for (const id of ['record-locate', 'record-info', 'record-eject']) element.querySelector(`#${id}`).disabled = !album;
      progress.disabled = !album || loading || !!error;
      status.textContent = error || (album ? `${album.audioSrc ? '音频播放' : '合成试听，非原专辑录音'} · ${loading ? '正在准备' : playing ? '33⅓ RPM / STEREO' : '已暂停，点击继续'}` : '选择专辑，开始聆听 · 内置合成试听');
      onChange({ ...state, index: albums.indexOf(album) });
    }
    syncProgressTimer();
    updateProgress();
  }

  function select(index) {
    const normalized = ((index % albums.length) + albums.length) % albums.length;
    const album = albums[normalized];
    setExpanded(true);
    onSelect(normalized);
    if (engine.album === album && (engine.playing || engine.loading)) engine.pause();
    else void engine.play(album);
  }

  function changeAlbum(direction) {
    const index = engine.album ? albums.indexOf(engine.album) : getDefaultIndex();
    const next = ((index + direction) % albums.length + albums.length) % albums.length;
    onSelect(next);
    void engine.play(albums[next]);
  }

  toggle.addEventListener('click', () => {
    if (engine.playing || engine.loading) engine.pause();
    else if (engine.album) void engine.play();
    else select(getDefaultIndex());
  });
  element.querySelector('#record-previous').addEventListener('click', () => changeAlbum(-1));
  element.querySelector('#record-next').addEventListener('click', () => changeAlbum(1));
  element.querySelector('#record-eject').addEventListener('click', () => engine.eject());
  element.querySelector('#record-locate').addEventListener('click', () => onSelect(albums.indexOf(engine.album)));
  element.querySelector('#record-info').addEventListener('click', () => onDetails(albums.indexOf(engine.album)));
  progress.addEventListener('input', () => {
    scrubbing = true;
    elapsed.textContent = time(Number(progress.value));
    progress.style.setProperty('--progress', `${Number(progress.value) / Number(progress.max) * 100}%`);
  });
  function finishSeek() {
    if (!scrubbing) return;
    scrubbing = false;
    engine.seek(Number(progress.value));
  }
  progress.addEventListener('change', finishSeek);
  progress.addEventListener('blur', finishSeek);
  progress.addEventListener('pointercancel', () => { scrubbing = false; updateProgress(); });
  function setVolume(value) {
    engine.setVolume(value);
    volume.value = String(engine.volume);
    volume.style.setProperty('--progress', `${engine.volume * 100}%`);
    mute.innerHTML = engine.volume === 0 ? muteIcon : volumeIcon;
    mute.setAttribute('aria-pressed', String(engine.volume === 0));
    mute.setAttribute('aria-label', engine.volume === 0 ? '取消静音' : '静音');
  }
  volume.addEventListener('input', () => setVolume(Number(volume.value)));
  mute.addEventListener('click', () => {
    if (engine.volume > 0) { previousVolume = engine.volume; setVolume(0); }
    else setVolume(previousVolume || 0.45);
  });
  document.addEventListener('visibilitychange', () => { syncProgressTimer(); updateProgress(); });
  window.addEventListener('pagehide', () => engine.pause());
  if (import.meta.hot) import.meta.hot.dispose(() => { clearInterval(progressTimer); engine.destroy(); });
  engine.emit();
  return { select, changeAlbum, get index() { return albums.indexOf(engine.album); }, get playing() { return engine.playing; } };
}
