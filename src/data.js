import records from './content/records.json';
import { scenes } from './scenes.js';

const asset = (value, folder) => {
  if (!value) return null;
  return /^(https?:)?\/\//.test(value) || value.startsWith('/') ? value : `${import.meta.env.BASE_URL}${folder}/${value}`;
};

export const projects = records.map((record, index) => {
  if (!scenes[record.scene]) console.warn(`records.json: "${record.title}" 的 scene "${record.scene}" 在 scenes.json 里不存在`);
  return {
    id: record.id || `record-${index + 1}`,
    title: record.title || `Untitled ${index + 1}`,
    scene: scenes[record.scene] ? record.scene : null,
    cover: asset(record.cover, 'images'),
    audioSrc: asset(record.audio, 'audio'),
    genre: record.genre || 'Soundscape',
    year: String(record.year ?? ''),
    category: record.category || '',
    color: record.color || '#777b71',
    description: record.description || '',
  };
});

export const imagePath = (project) => project.cover;
export const sceneOf = (project) => scenes[project.scene] ?? null;
export const defaultIndex = Math.min(4, projects.length - 1);

export const albums = projects.map((project, index) => ({
  ...project,
  artist: 'PI · Sound sketches',
  duration: 120 + (index % 4) * 24,
  bpm: 64 + (index % 5) * 6,
  seed: index,
}));
