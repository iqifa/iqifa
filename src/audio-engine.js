const frequency = (midi) => 440 * 2 ** ((midi - 69) / 12);

export class AudioEngine {
  constructor(onChange, onEnded) {
    this.onChange = onChange;
    this.onEnded = onEnded;
    this.album = null;
    this.playing = false;
    this.loading = false;
    this.error = '';
    this.volume = 0.45;
    this.offset = 0;
    this.request = 0;
    this.voices = new Set();
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.audio.volume = this.volume;
    this.audio.addEventListener('ended', () => this.finish());
    this.audio.addEventListener('loadedmetadata', () => this.emit());
    this.audio.addEventListener('error', () => {
      if (this.album?.audioSrc) this.fail('音频加载失败，请检查文件地址后重试。');
    });
    this.audio.addEventListener('pause', () => {
      if (this.album?.audioSrc && this.playing && !this.audio.ended) {
        this.playing = false;
        this.emit();
      }
    });
  }

  get duration() {
    return this.album?.audioSrc && Number.isFinite(this.audio.duration) ? this.audio.duration : this.album?.duration || 0;
  }

  get currentTime() {
    if (this.album?.audioSrc) return this.audio.currentTime;
    return Math.min(this.duration, this.offset + (this.playing && this.context ? this.context.currentTime - this.startedAt : 0));
  }

  emit() {
    this.onChange({ album: this.album, playing: this.playing, loading: this.loading, error: this.error });
  }

  initialize() {
    if (this.context) return;
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) throw new Error('此浏览器不支持合成试听，请使用新版 Chrome、Edge 或 Safari。');
    this.context = new Context();
    this.master = this.context.createGain();
    this.master.gain.value = this.volume * 0.45;
    this.compressor = this.context.createDynamicsCompressor();
    this.compressor.threshold.value = -18;
    this.compressor.ratio.value = 4;
    this.master.connect(this.compressor).connect(this.context.destination);
    this.context.addEventListener('statechange', () => {
      if (this.playing && !this.album?.audioSrc && this.context.state !== 'running') this.pause();
    });
  }

  async play(album = this.album) {
    if (!album) return;
    this.pause(false);
    const request = ++this.request;
    const changed = this.album !== album;
    this.album = album;
    this.error = '';
    if (changed) {
      this.offset = 0;
      this.audio.removeAttribute('src');
      this.audio.load();
      if (album.audioSrc) this.audio.src = album.audioSrc;
    }
    if (this.currentTime >= this.duration - 0.01) {
      this.offset = 0;
      if (album.audioSrc) this.audio.currentTime = 0;
    }
    this.loading = true;
    this.emit();
    try {
      if (album.audioSrc) {
        await this.audio.play();
      } else {
        this.initialize();
        await this.context.resume();
        if (this.context.state !== 'running') throw new Error('音频尚未启动，请再次点击播放。');
      }
      if (request !== this.request) return;
      this.loading = false;
      this.playing = true;
      if (!album.audioSrc) {
        this.startedAt = this.context.currentTime;
        this.nextStep = Math.floor(this.offset / (60 / album.bpm));
        this.schedule();
        this.timer = setInterval(() => this.schedule(), 100);
      }
      this.emit();
    } catch (error) {
      if (request !== this.request) return;
      this.fail(album.audioSrc ? '无法播放音频，请检查文件或再次点击播放。' : error.message);
    }
  }

  pause(notify = true) {
    this.offset = this.currentTime;
    this.playing = false;
    this.loading = false;
    this.request++;
    this.audio.pause();
    this.clearVoices();
    if (notify) this.emit();
  }

  clearVoices() {
    clearInterval(this.timer);
    this.timer = null;
    for (const voice of this.voices) {
      const now = this.context.currentTime;
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setTargetAtTime(0, now, 0.01);
      voice.oscillator.stop(now + 0.04);
    }
    this.voices.clear();
  }

  tone(midi, when, duration, volume, type = 'sine', pan = 0) {
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const panner = this.context.createStereoPanner();
    const start = Math.max(this.context.currentTime + 0.015, when);
    const attack = type === 'sine' ? 0.025 : 0.3;
    oscillator.type = type;
    oscillator.frequency.value = frequency(midi);
    panner.pan.value = pan;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(panner).connect(this.master);
    const voice = { oscillator, gain };
    this.voices.add(voice);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
      panner.disconnect();
      this.voices.delete(voice);
    };
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  schedule() {
    if (!this.playing) return;
    if (this.currentTime >= this.duration) {
      this.finish();
      return;
    }
    const { seed, bpm } = this.album;
    const beat = 60 / bpm;
    const now = this.context.currentTime;
    const elapsed = this.offset + now - this.startedAt;
    this.nextStep = Math.max(this.nextStep, Math.floor(elapsed / beat));
    while (this.nextStep * beat < Math.min(elapsed + 0.6, this.duration)) {
      const step = this.nextStep++;
      const when = this.startedAt + step * beat - this.offset;
      const root = [45, 48, 43, 50, 46, 41][seed % 6];
      const chord = [0, 5, 3, 7][Math.floor(step / 8) % 4];
      const melody = [0, 7, 12, 3, 10, 7, 15, 12];
      this.tone(root + chord + 12 + melody[(step + seed * 3) % 8], when, beat * 2.6, 0.1, 'sine', (step % 3 - 1) * 0.45);
      if (step % 2 === 0) this.tone(root + chord - 12, when, beat * 1.8, 0.15);
      if (step % 8 === 0) {
        [0, 3, 7, 10].forEach((note, index) => this.tone(root + chord + note, when, beat * 7.8, 0.035, 'triangle', (index - 1.5) * 0.35));
      }
    }
  }

  seek(value) {
    if (!this.album || !Number.isFinite(value)) return;
    const seconds = Math.max(0, Math.min(this.duration, value));
    if (this.album.audioSrc) {
      if (this.audio.readyState > 0) this.audio.currentTime = seconds;
    } else {
      this.clearVoices();
      this.offset = seconds;
      if (this.playing) {
        this.startedAt = this.context.currentTime;
        this.nextStep = Math.floor(seconds / (60 / this.album.bpm));
        this.schedule();
        if (this.playing) this.timer = setInterval(() => this.schedule(), 100);
      }
    }
    this.emit();
  }

  setVolume(value) {
    if (!Number.isFinite(value)) return;
    this.volume = Math.max(0, Math.min(1, value));
    this.audio.volume = this.volume;
    if (this.master) this.master.gain.setTargetAtTime(this.volume * 0.45, this.context.currentTime, 0.03);
  }

  finish() {
    this.pause(false);
    this.offset = this.duration;
    this.emit();
    this.onEnded();
  }

  eject() {
    this.pause(false);
    this.album = null;
    this.offset = 0;
    this.error = '';
    this.audio.removeAttribute('src');
    this.audio.load();
    this.emit();
  }

  fail(message) {
    this.pause(false);
    this.error = message;
    this.emit();
  }

  destroy() {
    this.pause(false);
    this.audio.removeAttribute('src');
    this.audio.load();
    this.context?.close();
  }
}
