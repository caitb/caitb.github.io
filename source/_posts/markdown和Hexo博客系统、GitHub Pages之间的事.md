---
title: markdown和Hexo博客系统、GitHub Pages之间的事
tags:
  - 杂谈
---

Hexo博客系统搭建起来有几天了，今天抽个时间来做个总结，呃——或者说来谈谈关于写笔记的事。

其实就是想说说，markdown和Hexo博客系统、GitHub Pages之间的事。

### **Typora markdown最好用的笔记本**

写笔记是每个程序员应该做的事，总结平日的工作经验，或者看到网上有好的博客文章也想保存下来，以便需要时翻看。这样一来我们就需要一个好的笔记本工具了，笔记本工具有很多，如“有道云笔记、印象笔记、为知笔记、Onenote”等，笔者用过有道笔记和为知笔记，但真心不觉得好用，因为实在是难以排版，而且网上复制粘贴下来的文章的样式很难看。本来精力就有限，每次写笔记还得花时间排版，不是已经愉悦的事。

说到这里，肯定有朋友会说用markdown啊。是的，markdown的确是写文字的好工具，它采用简单标记语法，就可以按照一直的排版样式展现。那么在众多markdown工具里，哪一个更好用呢？

笔者极力推荐用[Typora](https://typora.io/)，Typora正在使用的是[GitHub使用的Markdown](GFM)。简直是相见恨晚啊，因为Typora没有预览窗口，哦不，应该说是预览窗口和编辑窗口合二为一了，这是Typora最与众不同的地方，简直是逆天的创意。试想你写文字时，看着一堆“标记”夹杂在文字中，你会觉得舒服？为了看到排版效果，还不得不开启预览窗口占用面积有限的屏幕。

下面罗列Typora的一些特性：

###### （1）编辑器与预览窗合并

[![img](https://ws1.sinaimg.cn/large/0069RVTdgy1fuyfpe9lyhg30go0erabn.gif)](https://ws2.sinaimg.cn/large/0069RVTdgy1fuuycceandg30go0erabn.gif)

[img](https://ws2.sinaimg.cn/large/0069RVTdgy1fuuycceandg30go0erabn.gif)

###### (2)Typora还支持快捷键输入，写入速度又翻了一遍啊

![img](https://ws3.sinaimg.cn/large/0069RVTdgy1fuyf60pu9zj30d20ia79x.jpg)

###### （3）可以直接复制粘贴网页的文章，Typora会自动解析成markdown源码

###### （4）如果你想查看或编辑markdown源码也很方便

点击[这里](https://typora.io/)下载**Typora**，更多Typora的特性可查看[官方文档](https://support.typora.io/)

### 发布笔记到网上

Typora的不足的一点是，它不提供线上保存，所有文件均保存在本地。这样一来，我们想在网络上查看笔记怎么办呢？

对于cdn、博客园等网站可以本地导入md文件或者复制粘贴。**对于GitHub Pages静态博客网站，我们可以使用Hexo博客系统。**

##### Hexo博客系统

[Hexo博客系统](https://hexo.io/zh-cn/)，更准确的说法是，静态网站生成工具。Hexo用NodeJS编写，将markdown文件解析成既定的数据结构，根据既定的HTML页面模板，渲染成网页。 Hexo 提供了快速方便的一键部署功能，让你只需一条命令就能将网站部署到GitHub Pages或者其他服务器上。

GitHub Pages免费的个人博客网站，一直想用，但之前一直不知道有这些工具，以至于一直荒废GitHub Pages。

---

写这篇文章的目的，是想把自己觉得好用的工具分享给大家。

**一句话，用最好的markdown工具Typora写出漂亮的文章，用好用的工具如Hexo发布到自己的博客。**

