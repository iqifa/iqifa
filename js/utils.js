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
            
            // 处理数组 [A, B]
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

    // 代码高亮与折叠
    renderer.code = function(code, language) {
        try {
            if (typeof code === 'object' && code !== null) {
                language = code.lang;
                code = code.text;
            }
            // 别名修正
            if (language && language.toLowerCase() === 'c++') language = 'cpp';
            
            const validLang = hljs.getLanguage(language) ? language : 'plaintext';
            const highlighted = hljs.highlight(code, { language: validLang }).value;
            
            return `
            <details class="code-details" open>
                <summary><span>Code: ${validLang}</span> <i class="fas fa-chevron-down"></i></summary>
                <pre><code class="hljs language-${validLang}">${highlighted}</code></pre>
            </details>`;
        } catch (e) {
            return `<pre><code>${code}</code></pre>`;
        }
    };

    // 标题 ID 生成 (支持中文)
    renderer.heading = function(text, level) {
        try {
            if (typeof text === 'object') { level = text.depth; text = text.text; }
            const safeText = String(text || '');
            // 简单处理：将非单词字符转为 -，保留中文可能需要更复杂的逻辑，这里简化
            const id = safeText.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-');
            return `<h${level} id="${id}">${text}</h${level}>`;
        } catch (e) {
            return `<h${level}>${text}</h${level}>`;
        }
    };

    marked.setOptions({ renderer: renderer });
}