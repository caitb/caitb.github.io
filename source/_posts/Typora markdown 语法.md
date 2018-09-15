---
title: Typora markdown 语法
---

# Typora markdown 语法

## 概述

Markdown是由[Daring Fireball](http://daringfireball.net/)创建的，原始指南在[这里](http://daringfireball.net/projects/markdown/syntax)。然而，它的语法在不同的解析器或编辑器之间是不同的。Typora正在使用的是[GitHub使用的Markdown](GFM)。

*Outline*

[TOC]

## Block Elements

### 段和换行符

段落只是一段或多段连续的文字。在markdown源代码中，段落由多个空行分隔。在Typora中，只需要按`Return`键就可以创建一个新段落。

按`Shift` + `Return`来创建一个单换行符。但是，大多数markdown解析器会忽略单换行符，为了让其他markdown解析器识别您的换行符，您可以在行尾留下两个空格，或者插入`<br/>`。



### 标题

标题是在行开头使用1-6个`#`，对应于标题级别1-6。例如:

```markdown
# 这是标题 H1

## 这是标题 H2

###### 这是标题 H6
```

在typora中，输入' # '后面跟着标题内容，然后按回车键将创建一个标题。

### 引用

Markdown使用邮件样式的`>`字符进行块引用。他们提出了:

```markdown
> This is a blockquote with two paragraphs. This is first paragraph.
>
> This is second pragraph.Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.



> This is another blockquote with one paragraph. There is three empty line to seperate two blockquote.
```

在typora中，只需输入' > '，后面跟着引号内容，就会生成一个块引号。Typora会为你插入适当的“>”或换行符。通过添加额外的级别' > '，允许在另一个块引用内的块引用。

### 列表项

输入`*`列表项1将创建一个无序列表， `*`符号可以替换为+或-。

输入`1`。列表项1将创建一个有序的列表，其标记的源代码如下:

```markdown
## un-ordered list
*   Red
*   Green
*   Blue

## ordered list
1.  Red
2. 	Green
3.	Blue
```

### 制作一份待办事宜 [Todo 列表](https://www.zybuluo.com/mdeditor?url=https://www.zybuluo.com/static/editor/md-help.markdown#13-%E5%BE%85%E5%8A%9E%E4%BA%8B%E5%AE%9C-todo-%E5%88%97%E8%A1%A8)

任务列表是将项目标记为[]或[x]的列表。例如:

```markdown
- [ ] a task list item
- [ ] list syntax required
- [ ] normal **formatting**, @mentions, #1234 refs
- [ ] incomplete
- [x] completed
```

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

### 公式块

可以使用MathJax呈现LaTeX数学表达式。

输入`$$`，然后按'`Return`'键将触发一个接受Tex/LaTex源的输入字段。下面是一个例子:
$$
\mathbf{V}_1 \times \mathbf{V}_2 =  \begin{vmatrix} 
\mathbf{i} & \mathbf{j} & \mathbf{k} \\
\frac{\partial X}{\partial u} &  \frac{\partial Y}{\partial u} & 0 \\
\frac{\partial X}{\partial v} &  \frac{\partial Y}{\partial v} & 0 \\
\end{vmatrix}
$$
在markdown源文件中，math块是由' $$ ' mark包装的LaTeX表达式:

```markdown
$$
\mathbf{V}_1 \times \mathbf{V}_2 =  \begin{vmatrix} 
\mathbf{i} & \mathbf{j} & \mathbf{k} \\
\frac{\partial X}{\partial u} &  \frac{\partial Y}{\partial u} & 0 \\
\frac{\partial X}{\partial v} &  \frac{\partial Y}{\partial v} & 0 \\
\end{vmatrix}
$$
```

### 表格

输入`|First Header|Second Header|`，按回车键将创建一个有两列的表。

在创建表之后，将焦点放在该表上，将弹出一个用于表的工具栏，您可以在其中调整、对齐或删除表。您还可以使用上下文菜单复制和添加/删除列/行。

下面的描述可以跳过，因为typora会自动生成表的标记源代码。

在markdown源代码中，它们看起来如下:

```markdown
| First Header  | Second Header |
| ------------- | ------------- |
| Content Cell  | Content Cell  |
| Content Cell  | Content Cell  |
```

还可以包括内联标记，如链接、粗体、斜体或删除线。

最后，通过包含冒号:在标题行中，您可以定义文本为左对齐、右对齐或居中对齐:

```markdown
| Left-Aligned  | Center Aligned  | Right Aligned |
| :------------ |:---------------:| -----:|
| col 3 is      | some wordy text | $1600 |
| col 2 is      | centered        |   $12 |
| zebra stripes | are neat        |    $1 |
```

最左边的冒号表示左对齐的列；在最右边的冒号表示右对齐的列；两边的冒号表示中心对齐的列。

### 脚注

```markdown
你可以创建这样的脚注[^footnote].

[^footnote]: Here is the *text* of the **footnote**.
```

会产生:

你可以创建这样的脚注。

[^footnote]: Here is the *text* of the **footnote**.

鼠标在“脚注”上的上标以查看脚注的内容。

### 水平分隔线

在空行上输入`***`或`---`按`回车`键将画出一条水平线。

------

### YAML Front Matter

Typora现在支持 [YAML Front Matter](http://jekyllrb.com/docs/frontmatter/)。在文章的顶部输入`---`，然后按`回车`键会出现类似代码块的元素，用于描述本文件的信息。或者也可以从菜单中插入。

### 文章目录 (TOC)

输入`[toc]`然后按`回车`键将创建一个“`目录`”部分，从一个人的写作中提取所有标题，其内容将自动更新。

### Diagrams (用于画流程图、状态图、时序图、甘特图等)

Typora supports, [sequence](https://bramp.github.io/js-sequence-diagrams/), [flowchart](http://flowchart.js.org/) and [mermaid](https://knsv.github.io/mermaid/#mermaid), after this feature is enabled from preference panel.

See this [document](http://support.typora.io/Draw-Diagrams-With-Markdown/) for detail.

Typora支持，[时序图](https://bramp.github.io/js-sequence-diagrams/)，[流程图](http://flowchart.js.org/)和[甘特图](https://knsv.github.io/mermaid/#mermaid)，这个功能是从偏好面板启用。

有关详细信息，请参阅本[文档](http://support.typora.io/Draw-Diagrams-With-Markdown/)。

## Span Elements

Span elements will be parsed and rendered right after your typing. Moving cursor in middle of those span elements will expand those elements into markdown source. Following will explain the syntax of those span element.

### Links

Markdown supports two style of links: inline and reference.

In both styles, the link text is delimited by [square brackets].

To create an inline link, use a set of regular parentheses immediately after the link text’s closing square bracket. Inside the parentheses, put the URL where you want the link to point, along with an optional title for the link, surrounded in quotes. For example:

```markdown
This is [an example](http://example.com/ "Title") inline link.

[This link](http://example.net/) has no title attribute.
```

will produce:

This is [an example](http://example.com/"Title") inline link. (`<p>This is <a href="http://example.com/" title="Title">`)

[This link](http://example.net/) has no title attribute. (`<p><a href="http://example.net/">This link</a> has no`)

#### Internal Links

**You can set the href to headers**, which will create a bookmark that allow you to jump to that section after clicking. For example:

Command(on Windows: Ctrl) + Click [This link](#block-elements) will jump to header `Block Elements`. To see how to write that, please move cursor or click that link with `⌘` key pressed to expand the element into markdown source.

#### 参考链接

Reference-style links use a second set of square brackets, inside which you place a label of your choosing to identify the link:

```markdown
This is [an example][id] reference-style link.

Then, anywhere in the document, you define your link label like this, on a line by itself:

[id]: http://example.com/  "Optional Title Here"
```

In typora, they will be rendered like:

This is [an example][id] reference-style link.

[id]: http://example.com/	"Optional Title Here"

The implicit link name shortcut allows you to omit the name of the link, in which case the link text itself is used as the name. Just use an empty set of square brackets — e.g., to link the word “Google” to the google.com web site, you could simply write:

```markdown
[Google][]
And then define the link:

[Google]: http://google.com/
```

In typora click link will expand it for editing, command+click will open the hyperlink in web browser.

### 超链接

Typora允许你插入url作为链接，包装在<方括号>。

`<i@typora.io>` becomes <i@typora.io>.

Typora也会自动转成超链接。例如直接输入`www.google.com`，变成 www.google.com.

### 图片

图像看起来类似与链接，但它需要一个额外的!链接开始前的字符。图像语法如下:

```markdown
![Alt text](/path/to/img.jpg)

![Alt text](/path/to/img.jpg "Optional title")
```

您可以使用拖放从图像文件或我们的浏览器插入图像。并通过单击图像修改标记的源代码。在拖放时，如果图像与当前编辑文档位于同一目录或子目录，则使用相对路径。

有关图像的更多提示，请阅读http://support.typora.io//Images/

### 强调

Markdown将星号(*)和下划线(_)作为强调的标记。用' * '或 ' _ '包装的文本将用HTML <em>标记包装。例如:

```markdown
*single asterisks*

_single underscores_
```

输出: 

*single asterisks*

_single underscores_

GFM会忽略单词中的下划线，这通常在代码和名称中使用，如下:

> wow_great_stuff
>
> do_this_and_do_that_and_another_thing.

要在一个位置产生一个文字星号或下划线，否则它将被用作强调分隔符，您可以反斜杠转义它:

```markdown
\*this text is surrounded by literal asterisks\*
```

Typora建议使用`*`符号。

### 加粗

双`**`或`__`将被一个HTML <strong>标签包装，例如:

```markdown
**double asterisks**

__double underscores__
```

输出:

**double asterisks**

__double underscores__

Typora建议使用`**`符号。

### Code

要表示一段代码，可以用反引号括起来(')。与预先格式化的代码块不同，代码跨度表示正常段落中的代码。例如:

```markdown
Use the `printf()` function.
```

输出:

Use the `printf()` function.

### 删除线

GFM添加语法来创建删除文本，这是标准标记所缺少的。

`~~Mistaken text.~~` becomes ~~Mistaken text.~~

### 下划线

下划线由原始HTML提供支持。

`<u>Underline</u>` becomes <u>Underline</u>.

### Emoji :smile:

Input emoji with syntax `:smile:`. 

User can trigger auto-complete suggestions for emoji by pressing `ESC` key, or trigger it automatically after enable it on preference panel. Also, input UTF8 emoji char directly from `Edit` -> `Emoji & Symbols` from menu bar is also supported. 

### Inline Math

To use this feature, first, please enable it in `Preference` Panel -> `Markdown` Tab. Then use `$` to wrap TeX command, for example: `$\lim_{x \to \infty} \exp(-x) = 0$` will be rendered as LaTeX command. 

To trigger inline preview for inline math: input “$”, then press `ESC` key, then input TeX command, a preview tooltip will be visible like below:

<img src="http://typora.io/img/inline-math.gif" style="zoom:50%;" />

### Subscript

To use this feature, first, please enable it in `Preference` Panel -> `Markdown` Tab. Then use `~` to wrap subscript content, for example: `H~2~O`, `X~long\ text~`/

### Superscript

To use this feature, first, please enable it in `Preference` Panel -> `Markdown` Tab. Then use `^` to wrap superscript content, for example: `X^2^`.

### Highlight(行内代码高亮)

要使用这个特性，首先，请在`偏好设置`面板-> `Markdown`选项卡中启用它。然后使用`==`包装上标内容，例如:`==highlight==`。

## HTML

您可以使用HTML来样式化纯Markdown不支持的内容，例如，使用`<span style="color:red">这个文本是红色</span>`来添加带有红色颜色的文本。

### 内联框架

一些网站提供基于iframe的内联框架嵌入另外一个文档(网页)，你也可以粘贴到Typora，例如:

```Markdown
<iframe height='265' scrolling='no' title='Fancy Animated SVG Menu' src='http://codepen.io/jeangontijo/embed/OxVywj/?height=265&theme-id=0&default-tab=css,result&embed-version=2' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>
```

### Video

你可以使用<video> HTML标签来嵌入视频，例如:

```Markdown
<video src="xxx.mp4" />
```

### Other HTML Support

You could find details [here](http://support.typora.io/HTML/).

[GFM]: https://help.github.com/articles/github-flavored-markdown/