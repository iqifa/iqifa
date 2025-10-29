抄袭(bushi,借鉴部分 [借鉴](https://kazama-suichiku.github.io/)

之前是hexo做的静态网页，如果hexo端不在身边，博客就更改不了了，而且如果markdown数据丢失还要下静态网页再转markdown


得益于翠竹的灵感，我让AI帮我写了一个，

Github Pages 部署，Firebase 数据库  

如果想使用请Fork或者Clone后去修改

我拆分了数据Config



## 数据库修改
### firebase.js
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


### 简介修改
#### profile.json
```json
    {
    "name": "alaala",
    "title": "tile",
    "introduction": "introduction",
    "contacts": [
        { "type": "github", "url": "https://github.com", "icon": "fa-github" },
        { "type": "twitter", "url": "https://twitter.com", "icon": "fa-twitter" },
        { "type": "linkedin", "url": "https://linkedin.com", "icon": "fa-linkedin" },
        { "type": "email", "url": "mailto:example@mail.com", "icon": "fa-envelope" }
    ]
    }

    同样修改为自己的
```
#### 博客主图
对于没有缩略图的主图，我选择读取本地的默认图片，随机选择 

默认图放在**assets/** 下，默认固定四张，可以自己修改代码去


### 图片插入
因为firebase的免费额度只给用博客，所以我采用两种方式插入图片

1. 转为base64模式，直接嵌入markdown 好处是再文本内部，不会丢失，缺点是如果图片过多或者过大，会超过content大小，写不进数据库。
2. 上传图床模式，这种可以直接按本地引用的方式插入图片无非换成URL链接，但是图床我觉得大部分不算稳定，还要本地存储一份。

### markdown
编辑部分使用的 **Toast UI Editor** 文章渲染部分使用的 marked，因为marked 算是比较简陋的，所以可能一部分语法会出现问题 我之后修改，另外，Toast UI Editor  原生不支持全屏编辑，所以我的实现方案是借由CSS让其覆盖整个视口，测试很少，可能会有奇奇怪怪的bug

### 标签，分类

categories 采用多级分类在markdown中编辑时  
```
    ---
    date: 2025-10-27 20:43:20
    categories: [前端/JavaScript, 框架/Vue, 工具/Webpack]
    tags: [ES6, 组件化, 性能优化]
    ---

    如此，可做多级分类和多类别
```