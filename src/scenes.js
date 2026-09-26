import data from './content/scenes.json';

export const scenes = Object.fromEntries(Object.entries(data).map(([id, scene]) => [id, {
  label: id.toUpperCase(),
  name: '',
  kind: 'posts',
  title: id,
  intro: '',
  items: [],
  ...scene,
}]));
