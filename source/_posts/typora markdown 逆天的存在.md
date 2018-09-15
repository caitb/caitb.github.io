---
title: Typora markdown 逆天的存在
tags:
  - markdown
---



`markdown`其实就是一种写作工具，它能让我们专注在写文字上面，而无需关心排版美观。试想一下以前我们用world软件写作，每次写完都得来一次排版，很是无奈。说起`markdown`其实在市面上已经有很多了，无论是web端的亦或是桌面端的。但无一例外都分为编辑区和预览区，这样一来屏幕有限的窗口面积就被占用了，而且编辑区里并非纯粹是我们写作的文字，还有`markdown`的语法标记，看着很不舒服，这不是真正的<u>所见即所得</u>。

说到所见即所得，我不禁要提到`Typora markdown`啦，`Typora`才是众多`markdown`产品里逆天的存在。`Typora`将编辑区和预览区合二为一，你写出来的就是你想看到的样子。正如官方所言：**<u>A truly minimal markdown editor. I think this the one, it.</u> **

![img](https://ws2.sinaimg.cn/large/0069RVTdgy1fuuycceandg30go0erabn.gif)

`Typora`的界面非常简洁，只有文件列表区和编辑区。`Typora`以文件夹的形式管理你的文件，你只需打开存放你的文件的文件夹，即可管理你的所有文件。

![img](https://ws1.sinaimg.cn/large/0069RVTdgy1fuuyrrlkc2g30go05jto9.gif)

------



# Typora语法 #

`Typora`语法和众多`markdown`编辑器是一致的。语法可分为单标记和双标记，下面以单标记为例介绍`Typora`的的语法。



### 段和换行符

段落只是一段或多段连续的文字。在markdown源代码中，段落由多个空行分隔。在Typora中，只需要按`Return`键就可以创建一个新段落。

按`Shift` + `Return`来创建一个单换行符。但是，大多数markdown解析器会忽略单换行符，为了让其他markdown解析器识别您的换行符，您可以在行尾留下两个空格，或者插入`<br/>`。



### 标题

标题在行开头使用1-6个`#`，对应于标题级别1-6。例如:

```markdown
# 这是标题 H1

## 这是标题 H2

###### 这是标题 H6
```

输出：

# 这是标题 H1

## 这是标题 H2

###### 这是标题 H6

在typora中，输入' # '后面跟着标题内容，然后按回车键将创建一个标题。



### 引用

Markdown使用邮件样式的`>`字符进行块引用。他们提出了:

```markdown
> This is a blockquote with two paragraphs. This is first paragraph.
>
> This is second pragraph.Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.



> This is another blockquote with one paragraph. There is three empty line to seperate two blockquote.
```

输出：

> This is a blockquote with two paragraphs. This is first paragraph.
>
> This is second pragraph.Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.
> This is another blockquote with one paragraph. There is three empty line to seperate two blockquote.

在typora中，只需输入' > '，后面跟着引号内容，就会生成一个块引号。Typora会为你插入适当的“>”或换行符。通过添加额外的级别' > '，允许在另一个块引用内的块引用。



### 列表项

输入`*`列表项1将创建一个无序列表， `*`符号可以替换为+或-。

输入`1`。列表项1将创建一个有序的列表，其标记的源代码如下:

```markdown
##### 无序列表
*   Red
*   Green
*   Blue

##### 有序列表
1.  Red
2. 	Green
3.	Blue
```

输出：

##### 无序列表
*   Red
*   Green
*   Blue
##### 有序列表
1.  Red
2.  Green
3.  Blue



### 制作一份待办事宜 [Todo 列表](https://www.zybuluo.com/mdeditor?url=https://www.zybuluo.com/static/editor/md-help.markdown#13-%E5%BE%85%E5%8A%9E%E4%BA%8B%E5%AE%9C-todo-%E5%88%97%E8%A1%A8)

任务列表是将项目标记为[]或[x]的列表。例如:

```markdown
- [ ] a task list item
- [ ] list syntax required
- [ ] normal **formatting**, @mentions, #1234 refs
- [ ] incomplete
- [x] completed
```

输出：

- [ ] a task list item
- [ ] list syntax required
- [ ] normal **formatting**, @mentions, #1234 refs
- [ ] incomplete
- [x] completed

您可以通过单击项目前面的复选框来更改完全/不完全状态。



### 代码块

Typora只在Github调味的Markdown支持栅栏。不支持markdown中的原始代码块。

使用围栏很容易:输入' ' '和按回车。在' ' '后添加一个可选的语言标识符，我们将通过语法高亮显示来运行它:

~~~gfm
一个例子:

没有指定语言 不高亮
```
function test() {
  console.log("notice the blank line before this function?");
}
```

指定语言 语法高亮:
```ruby
require 'redcarpet'
markdown = Redcarpet.new("Hello World!")
puts markdown.to_html
```
~~~



//待完成