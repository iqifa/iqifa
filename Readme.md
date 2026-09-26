文章整篇存在 Firestore，打开时再解析 front matter 和正文。渲染用 Marked、KaTeX、PrismJS，输出经 DOMPurify 消毒。

## 用到的技术

- **Firebase Auth**：后台邮箱登录，登录后才能新建、修改、删除文章。
- **Cloud Firestore**：云端文章库。一篇文章是 `posts/{id}` 里的一条文档，正文（含 front matter）放在 `content`。同时写入 `title`、`date`、`categories`、`tags`，供列表排序和筛选。
- **Marked**：Markdown 转 HTML，启用 GFM（表格、删除线、任务列表）。
- **KaTeX**：把 `$...$` / `$$...$$` 渲染成公式。
- **PrismJS**：围栏代码块高亮，并带复制按钮。
- **DOMPurify**：清洗渲染后的 HTML。

## 文章怎么写

正文是 Markdown。文章**开头必须是 front matter**，解析器只认这一种写法，写偏了标题、日期、分类都会丢。

```markdown
---
title: 我的第一篇文章
date: 2026-09-26
categories: [笔记/数学]
tags: [KaTeX, 解析]
---

这里开始写正文。
```

解析规则：

- 文件去掉首尾空白后，第一行必须是 `---`。结束的 `---` 单独占一行。两行之间才是元数据，后面全部是正文。
- 一行一个字段，用**第一个**英文冒号 `:` 分开键和值。不支持 YAML 的引号、多行 `|`、折叠 `>`、嵌套对象。写成 `title: "标题"` 时，引号会留在标题里。
- `title`：列表和文章页的标题。缺了会显示 `Untitled`。编辑器顶部的标题框只和这一行同步。
- `date`：`YYYY-MM-DD`。列表按这个日期从新到旧排，缺了或格式不对会沉到底下。
- `categories`：方括号加逗号，例如 `[Dev, 笔记/数学]`。不写方括号时，整段当作一个分类。分类名里用 `/` 表示层级，`笔记/数学` 会进「笔记」下面的「数学」。`/` 两侧不要加空格。分类名本身不要含逗号。
- `tags`：同样是 `[ES6, 笔记]`。标签名不要含逗号。可以写 `tags: []`。
- 没有这段 front matter 时，整篇都会被当成正文，标题变成 `Untitled`。

正文用普通 Markdown。文章标题已经在 front matter 里，正文从 `##` 起。目录只收集 `h2`、`h3`、`h4`。

列表摘要大约 110 字，会去掉围栏代码块和 `$$...$$` 公式。开头先写一段普通文字，摘要才看得懂。

图片用 `![说明](https://...)`。没有站内上传。文档存在 Firestore，单条大约 1 MiB，不要把大图转成 base64 嵌进正文。

## 公式

只认美元符号，不认 `\(...\)` 和 `\[...\]`。

行内，美元符贴住公式，中间不能换行，首尾不能有空格：

```markdown
质能方程 $E=mc^2$。
```

`$ E=mc^2 $` 不会渲染。`$` 紧挨着数字（如 `$100`）也不会当成公式。金额不要写成成对的 `$`。

独立公式单独成段，`$$` 放在行首，结束的 `$$` 后面换行：

```markdown
$$
\int_0^1 x^2 \, dx = \frac{1}{3}
$$
```

公式内部不要再出现 `$$`。KaTeX 用的是 LaTeX 数学语法，不支持整篇 LaTeX 文档命令。写错时页面仍会打开，公式位置显示错误提示。

## 代码块

用围栏，并写上语言名。已加载的语言：

`javascript` `typescript` `jsx` `json` `bash` `python` `c` `cpp` `csharp` `java` `go` `rust` `sql` `yaml` `markdown` `markup`（html）`css`

这些别名同样有效：`js` `ts` `py` `sh` `shell` `yml` `md` `c++` `c#` `cs` `html` `xml`。

没写语言，或不在上面的语言，会按纯文本显示，仍然可以复制。

## 唱片和页面的数据

除了博客文章，其余内容都在两个 JSON 文件里。改完保存，开发服务器会自动刷新，唱片数量、索引页、定位条都会跟着变。

- `src/content/records.json`：唱片列表，决定首页有几张唱片、封面、音乐，以及点开后进哪个页面。
- `src/content/scenes.json`：页面内容，也就是经历、作品、实验室、书单、此刻这些。

### 唱片 `records.json`

数组里一项是一张唱片，顺序就是画廊里的顺序：

```json
{
  "id": "memories",
  "title": "Memories",
  "scene": "experience",
  "cover": "memories.webp",
  "audio": "memories.mp3",
  "genre": "Dream ambient",
  "year": "2024",
  "category": "Art & imagination",
  "color": "#ba83a5",
  "description": "点唱机里「封面信息」弹窗显示的介绍。"
}
```

- `scene`：点开这张唱片进入的页面，必须是 `scenes.json` 里的一个键，比如 `blog`、`experience`、`works`。写错或留空时，唱片照常播放，但不显示页面标签，也不进页面。
- `cover`：封面。只写文件名时，从 `public/images/` 找；以 `/` 或 `http` 开头时按原样使用。建议用正方形 webp，边长 800 左右。
- `audio`：音乐。只写文件名时，从 `public/audio/` 找；也可以写完整网址。写 `null` 或不写，就播放内置的合成试听。浏览器通吃 mp3，m4a、ogg 要看浏览器。
- `color`：封面加载出来之前、以及唱片中心标签的底色。
- `id`：唯一即可，不要重复。其余字段都可以省略，会用默认值。
- 首页一开始对准第 5 张（不足 5 张时对准最后一张）。

### 页面 `scenes.json`

每个键是一个页面，键名就是 `records.json` 里 `scene` 要写的值。可以改、删，也可以新增：

```json
"works": {
  "label": "WORKS",
  "name": "作品",
  "kind": "works",
  "title": "Selected<br>works",
  "intro": "标题下面的一段介绍。",
  "items": [
    { "meta": "2026", "title": "ÉTHER", "kind": "Web experience", "summary": "一句话介绍。", "href": "https://..." }
  ]
}
```

- `label` / `name`：唱片封面右上角和页面顶部显示的英文、中文名。
- `title`：页面大标题，可以用 `<br>` 换行。
- `kind`：排版方式，三选一：
  - `posts`：列表。条目字段 `meta`（左侧小字，如日期）、`title`、`summary`、`tags`（数组）。
  - `timeline`：时间线。在 `posts` 的基础上多一个 `org`（公司或学校），显示在标题后面。
  - `works`：卡片。条目字段 `meta`（右上角小字）、`title`、`kind`（类型小字）、`summary`、`href`。写了 `href` 卡片才能点。
- `blog` 页面带 `"source": "firestore"`，文章从 Firestore 读取，不用写 `items`。其他页面不要加 `source`。
- `items` 里的文字按纯文本显示，不解析 HTML。