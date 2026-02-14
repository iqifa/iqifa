// js/utils.js

// 1. 定义转义函数 (防止 HTML 注入)
function escapeHtml(text) {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 解析文章内容（Front Matter + Body）
export function parsePost(rawContent) {
    let content = rawContent ? rawContent.trim() : "";

    // 检查是否包含 Front Matter
    if (!content.startsWith('---')) {
        return {
            metadata: { title: "Untitled", date: new Date().toISOString().split('T')[0], categories: [], tags: [] },
            body: content
        };
    }

    const lines = content.split('\n');
    let endFMIndex = -1;

    // 寻找第二个 ---
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '---') {
            endFMIndex = i;
            break;
        }
    }

    if (endFMIndex === -1) {
        return { metadata: { title: "Untitled" }, body: content };
    }

    // 解析元数据
    const metaLines = lines.slice(1, endFMIndex);
    const metadata = {};

    metaLines.forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            let value = parts.slice(1).join(':').trim();

            if (value.startsWith('[') && value.endsWith(']')) {
                value = value.slice(1, -1).split(',').map(v => v.trim());
            } else if (key === 'categories' || key === 'tags') {
                value = [value];
            }
            metadata[key] = value;
        }
    });

    const body = lines.slice(endFMIndex + 1).join('\n').trim();
    return { metadata, body };
}

// 配置 Marked 渲染器
export function configureMarked() {
    const renderer = new marked.Renderer();

    // --- 修改重点：Prism 适配逻辑 ---
    renderer.code = function (code, language) {
        try {
            // 处理 marked 升级后的对象传参 (Token Object)
            if (typeof code === 'object' && code !== null) {
                language = code.lang;
                code = code.text;
            }

            // 语言名称标准化
            let validLang = (language || 'text').toLowerCase();
            // 别名修正
            if (validLang === 'c++') validLang = 'cpp';
            if (validLang === 'c#') validLang = 'csharp';
            if (validLang === 'js') validLang = 'javascript';
            if (validLang === 'ts') validLang = 'typescript';

            // HTML 转义
            const escapedCode = escapeHtml(code);

            // 构建 HTML
            // 修复点：
            // 1. 给 <pre> 添加 class="language-${validLang}"，这样 Prism 的背景色和文字颜色样式才会生效，覆盖继承的颜色。
            // 2. 移除模板字符串内部的换行符和缩进，防止代码块内容前面出现多余的空格。
            return `
<details class="code-details" open>
    <summary>
        <span class="lang-label">${validLang.toUpperCase()}</span>
        <div class="summary-tools">
            <button class="copy-btn" aria-label="Copy code">
                <i class="fas fa-copy"></i>
            </button>
            <i class="fas fa-chevron-down toggle-icon"></i>
        </div>
    </summary>
    <pre class="language-${validLang}"><code class="language-${validLang}">${escapedCode}</code></pre>
</details>
`.trim();

        } catch (e) {
            console.error("Code highlight error:", e);
            // 降级处理
            return `<pre class="language-plaintext"><code class="language-plaintext">${code}</code></pre>`;
        }
    };

    // 标题 ID 生成
    renderer.heading = function (text, level) {
        try {
            if (typeof text === 'object') { level = text.depth; text = text.text; }
            const safeText = String(text || '');
            const id = safeText.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-');
            return `<h${level} id="${id}">${text}</h${level}>`;
        } catch (e) {
            return `<h${level}>${text}</h${level}>`;
        }
    };

    // 使用 marked.use
    if (typeof marked.use === 'function') {
        marked.use({ renderer: renderer });
    } else {
        marked.setOptions({ renderer: renderer });
    }
}