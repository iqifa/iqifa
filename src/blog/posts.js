import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from './firebase.js';

const today = () => new Date().toISOString().split('T')[0];
const toList = (value) => (Array.isArray(value) ? value : value ? [value] : []).filter(Boolean);

export function parsePost(raw = '') {
  const content = raw.trim();
  if (!content.startsWith('---')) return { metadata: { title: 'Untitled', date: today(), categories: [], tags: [] }, body: content };
  const lines = content.split(/\r?\n/);
  const end = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
  if (end === -1) return { metadata: { title: 'Untitled' }, body: content };
  const metadata = {};
  for (const line of lines.slice(1, end)) {
    const split = line.indexOf(':');
    if (split < 1) continue;
    const key = line.slice(0, split).trim();
    let value = line.slice(split + 1).trim();
    if (value.startsWith('[') && value.endsWith(']')) value = value.slice(1, -1).split(',').map((item) => item.trim()).filter(Boolean);
    else if (key === 'categories' || key === 'tags') value = value ? [value] : [];
    metadata[key] = value;
  }
  return { metadata, body: lines.slice(end + 1).join('\n').trim() };
}

function toPost(id, content) {
  const { metadata, body } = parsePost(content);
  const plain = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)]\([^)]*\)/g, '$1')
    .replace(/[#>*`_~|-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return {
    id,
    content,
    body,
    title: metadata.title || 'Untitled',
    date: metadata.date || '',
    categories: toList(metadata.categories),
    tags: toList(metadata.tags),
    preview: plain.length > 110 ? `${plain.slice(0, 110)}…` : plain,
  };
}

let cache = null;

export async function fetchPosts({ refresh = false } = {}) {
  if (cache && !refresh) return cache;
  const snapshot = await getDocs(collection(db, 'posts'));
  const posts = [];
  snapshot.forEach((item) => {
    const content = item.data().content;
    if (content) posts.push(toPost(item.id, content));
  });
  posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  cache = posts;
  return posts;
}

export async function savePost(id, content) {
  const post = toPost(id || Date.now().toString(), content);
  await setDoc(doc(db, 'posts', post.id), {
    content,
    title: post.title,
    date: post.date || today(),
    categories: post.categories,
    tags: post.tags,
    updatedAt: new Date().toISOString(),
  });
  cache = null;
  return post.id;
}

export async function deletePost(id) {
  await deleteDoc(doc(db, 'posts', id));
  cache = null;
}

export const newPostTemplate = () => `---
title: New Post
date: ${today()}
categories: [Dev]
tags: []
---

Write content...`;

export const onUserChange = (callback) => onAuthStateChanged(auth, callback);
export const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);
