export const projects = [
  {
    id: 'windswept', scene: 'now', title: 'Windswept', category: 'Visual exploration', year: '2025',
    image: 'windswept.webp', original: '1763744592-unveil_windswept_9.jpg', ratio: 0.8,
    description: 'A landscape caught between stillness and movement. An exploration of the invisible forces that shape the world around us.',
    color: '#747b71',
  },
  {
    id: 'sculpted-optics', scene: 'works', title: 'Sculpted Optics', category: 'Material studies', year: '2026',
    image: 'sculpted-optics.webp', original: '1786377078-unveil_sculpted_optics_1.png', ratio: 0.76,
    description: 'Light becomes a material of its own. Familiar objects are refracted into unfamiliar forms, somewhere between the physical and the impossible.',
    color: '#777e79',
  },
  {
    id: 'composites', scene: 'lab', title: 'Composites', category: 'Digital experiments', year: '2025',
    image: 'composites.webp', original: '1742434094-unveil_composites_4.png', ratio: 0.78,
    description: 'Fragments of the natural world, reassembled. A study of unexpected connections, organic structures and the beauty of things that do not quite exist.',
    color: '#555653',
  },
  {
    id: 'cursed', scene: 'blog', title: 'Cursed', category: 'Image-making', year: '2025',
    image: 'cursed.webp', original: '1753893412-unveil_cursed_1.png', ratio: 0.76,
    description: 'The familiar takes an unexpected turn. A collection of uncanny impressions that invites a second look at the everyday.',
    color: '#949c78',
  },
  {
    id: 'memories', scene: 'experience', title: 'Memories', category: 'Art & imagination', year: '2024',
    image: 'memories.webp', original: '1714828861-unveil_memories_09.png', ratio: 0.84,
    description: 'Not quite a place, not quite a dream. Fleeting landscapes explore the way memory softens reality, leaving behind colour, emotion and a sense of somewhere we have been.',
    color: '#ba83a5',
  },
  {
    id: 'spells', scene: 'lab', title: 'Spells', category: 'Digital experiments', year: '2025',
    image: 'spells.webp', original: '1760709828-spells_1.webp', ratio: 0.77,
    description: 'An archive of imagined specimens. The boundaries between science and magic dissolve into intricate, otherworldly forms.',
    color: '#7d8991',
  },
  {
    id: 'eclipse-shadows', scene: 'reading', title: 'Eclipse Shadows', category: 'Light studies', year: '2026',
    image: 'eclipse-shadows.webp', original: '1788538976-unveil_eclipse_shadows_1.png', ratio: 0.81,
    description: 'An encounter between light and its absence. Sculptural silhouettes find their shape in the quiet space between illumination and shadow.',
    color: '#5c625d',
  },
  {
    id: 'portraits-of-a-vase', scene: 'works', title: 'Portraits of a Vase', category: 'Object studies', year: '2026',
    image: 'portraits-of-a-vase.webp', original: '1788541837-unveil_mmc_1c.png', ratio: 0.75,
    description: 'One object. Many possibilities. A simple vessel becomes a starting point for a conversation about material, perception and transformation.',
    color: '#bdbaac',
  },
  {
    id: 'neo', scene: 'blog', title: 'Neo', category: 'New perspectives', year: '2025',
    image: 'neo.webp', original: '1763662264-unveil_neo_1.png', ratio: 0.82,
    description: 'A small glimpse of another possible world. Synthetic textures and organic gestures meet in a study of new visual languages.',
    color: '#6f7c80',
  },
  {
    id: 'afterimage', scene: 'experience', title: 'Afterimage', category: 'Art & imagination', year: '2024',
    image: 'afterimage.webp', original: '1714828695-unveil_memories_01.png', ratio: 0.8,
    description: 'The image that stays when you close your eyes. Another chapter from Memories, exploring colour as the trace of an experience.',
    color: '#a99d7c',
  },
  {
    id: 'axis-mundi', scene: 'reading', title: 'Axis Mundi', category: 'Motion & form', year: '2024',
    image: 'axis-mundi.webp', original: '1715952204-unveil_axm_01_thumbnail.jpg', ratio: 0.8,
    description: 'An imagined axis connecting worlds. Architectural gestures and elemental forms draw a line between earth and the infinite.',
    color: '#718183',
  },
  {
    id: 'blue-sky', scene: 'now', title: 'A Piece of Blue Sky', category: 'Visual poetry', year: '2025',
    image: 'blue-sky.webp', original: '1742436034-unveil_somuch_1f.jpg', ratio: 0.8,
    description: 'A moment of openness. An atmospheric exploration of distance, possibility and the quiet poetry of looking up.',
    color: '#8fabae',
  },
];

export const imagePath = (project) => `/images/${project.image}`;

const genres = ['Ambient', 'Minimal electronica', 'Downtempo', 'Experimental', 'Dream ambient', 'Electronica', 'Dark ambient', 'Minimal', 'Future ambient', 'Soundscape', 'Organic electronic', 'Atmospheric'];

export const albums = projects.map((project, index) => ({
  ...project,
  artist: 'ÉTHER · Sound sketches',
  genre: genres[index],
  duration: 120 + (index % 4) * 24,
  bpm: 64 + (index % 5) * 6,
  seed: index,
  audioSrc: project.audioSrc ?? null,
}));
