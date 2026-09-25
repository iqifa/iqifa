import { Marked } from 'marked';
import katex from 'katex';
import DOMPurify from 'dompurify';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import 'katex/dist/katex.min.css';

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
const aliases = { 'c++': 'cpp', 'c#': 'csharp', cs: 'csharp', js: 'javascript', ts: 'typescript', sh: 'bash', shell: 'bash', py: 'python', html: 'markup', xml: 'markup', yml: 'yaml', md: 'markdown' };
const math = (source, displayMode) => katex.renderToString(source, { displayMode, throwOnError: false });

const slugify = (text) => text.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '') || 'section';

function createParser(slugs) {
  return new Marked({
    gfm: true,
    extensions: [
      {
        name: 'blockMath',
        level: 'block',
        start: (src) => src.indexOf('$$'),
        tokenizer(src) {
          const match = /^\$\$([\s\S]+?)\$\$(?:\n+|$)/.exec(src);
          if (match) return { type: 'blockMath', raw: match[0], text: match[1].trim() };
        },
        renderer: (token) => `<div class="math-block">${math(token.text, true)}</div>`,
      },
      {
        name: 'inlineMath',
        level: 'inline',
        start: (src) => src.indexOf('$'),
        tokenizer(src) {
          const match = /^\$\$([^$]+?)\$\$|^\$(?!\s)([^$\n]+?)(?<!\s)\$(?!\d)/.exec(src);
          if (match) return { type: 'inlineMath', raw: match[0], text: (match[1] ?? match[2]).trim(), display: !!match[1] };
        },
        renderer: (token) => math(token.text, token.display),
      },
    ],
    renderer: {
      code({ text, lang }) {
        const language = aliases[(lang || '').toLowerCase()] || (lang || 'text').toLowerCase();
        const grammar = Prism.languages[language];
        const html = grammar ? Prism.highlight(text, grammar, language) : escapeHtml(text);
        return `<figure class="code-block"><figcaption><span>${escapeHtml(language.toUpperCase())}</span><button type="button" class="code-copy">COPY</button></figcaption><pre class="language-${escapeHtml(language)}"><code class="language-${escapeHtml(language)}">${html}</code></pre></figure>`;
      },
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        const base = slugify(inner);
        const count = slugs.get(base) ?? 0;
        slugs.set(base, count + 1);
        return `<h${depth} id="${count ? `${base}-${count}` : base}">${inner}</h${depth}>`;
      },
      image({ href, title, text }) {
        return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${title ? ` title="${escapeHtml(title)}"` : ''} loading="lazy">`;
      },
      link({ href, title, tokens }) {
        const external = /^https?:\/\//i.test(href);
        return `<a href="${escapeHtml(href)}"${title ? ` title="${escapeHtml(title)}"` : ''}${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${this.parser.parseInline(tokens)}</a>`;
      },
    },
  });
}

export function renderMarkdown(element, body) {
  element.innerHTML = DOMPurify.sanitize(createParser(new Map()).parse(body || ''), { ADD_ATTR: ['target'] });
  return [...element.querySelectorAll('h2, h3, h4')].map((heading) => ({ id: heading.id, text: heading.textContent, level: Number(heading.tagName[1]) }));
}

export function bindCodeCopy(root) {
  root.addEventListener('click', async (event) => {
    const button = event.target.closest('.code-copy');
    if (!button) return;
    const code = button.closest('.code-block')?.querySelector('code')?.textContent ?? '';
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = 'COPIED';
    } catch {
      button.textContent = 'FAILED';
    }
    setTimeout(() => { button.textContent = 'COPY'; }, 1800);
  });
}
