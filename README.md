抄袭(bushi,借鉴部分 [借鉴](https://kazama-suichiku.github.io/)

之前是hexo做的静态网页，如果hexo端不在身边，博客就更改不了了，而且如果markdown数据丢失还要下静态网页再转markdown


得益于翠竹的灵感，我让AI帮我写了一个，

Github Pages 部署，Firebase 数据库  

如果想使用请Fork或者Clone后去修改

我拆分了数据Config

##  配置指南 (Configuration)
 本项目将配置项进行了模块化拆分，请根据实际情况修改以下文件。
### 数据库配置 (blog/js/firebase.js)
#### firebase.js
请前往 [Firebase Console](https://console.firebase.google.com/) 创建一个 数据库，获取配置信息，并填入 blog/js/firebase.js：
```javascripts
    const firebaseConfig = {
        apiKey: "apiKey",
        authDomain: "authDomain",
        projectId: "projectId",
        storageBucket: "storageBucket",
        messagingSenderId: "messagingSenderId",
        appId: "appId",
        measurementId: "easurementId"
    };

    修改为自己的
```


### 个人信息配置 (blog/data/profile.json)
#### profile.json
```json
{
    "name": "alaala",
    "avatar": "assets/head.jpg",
    "bio": "摆！摆兵就该摆！",
    "socials": [
        { "icon": "fab fa-github", "link": "https://github.com/yourname", "name": "GitHub" },
        { "icon": "fab fa-twitter", "link": "https://twitter.com/yourname", "name": "Twitter" },
        { "icon": "fas fa-envelope", "link": "mailto:test@example.com", "name": "Email" }
    ]
}

    同样修改为自己的
```
#### ~~博客主图~~
~~对于没有缩略图的主图，我选择读取本地的默认图片，随机选择~~

~~默认图放在**assets/** 下，默认固定四张，可以自己修改代码去~~

## 写作指南 (Writing)
后台编辑器使用了 Markdown 语法，并在前端使用 marked + Highlight.js + KaTeX 进行渲染。
### Front Matter (文章元数据)
在文章顶部，请务必包含如下格式的 YAML 元数据：

    ---
    title: 我的第一篇文章
    date: 2025-10-27
    categories: [Unity/渲染]
    tags: [ES6, 笔记]
    ---

    这里是正文内容...

- categories (分类): 支持多级分类，使用 / 分隔（例如 Unity/渲染）。
- tags (标签): 文章的标签列表。

### 图片插入
因为firebase的免费额度只给用博客，所以我采用两种方式插入图片

1. 转为base64模式，直接嵌入markdown 好处是再文本内部，不会丢失，缺点是如果图片过多或者过大，会超过content大小，写不进数据库。
2. 上传图床模式，这种可以直接按本地引用的方式插入图片无非换成URL链接，但是图床我觉得大部分不算稳定，还要本地存储一份。

## 更新日志
#### version 0.2.0
- 优化视觉效果
    
    - 界面色调修改，三栏格式修改
    - 添加星空背景
- 编辑界面重写

    - 不再使用 **Toast UI Editor**作为markdown编辑器
    - 调整editor和preview 修复双栏的各种bug
#### version 0.1.0
- 发布