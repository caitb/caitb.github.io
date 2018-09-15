---
title: hexo博客系统 代码高亮插件
---

hexo的默认高亮插件总感觉支持的太少，代码高亮显示的不够细，下面我们来看下怎么把它替换为prettify高亮插件

## hexo-prettify-highlight ##

> 一个为[Hexo](https://hexo.io/)打造的，具有多个可选的代码高亮的主题插件

### 安装 ###

##### 1.下载 #####

```tcl
$ git clone https://github.com/caitb/hexo-prettify-highlight.git source/plugs/hexo-prettify-highlight
```

##### 2.修改hexo博客系统根目录的配置文件`_config.yml` #####

（1）将`highlight`插件禁用

```yaml
highlight:
  enable: false        //这里设置为false，禁用highlight
  line_number: false
  auto_detect: false
  tab_replace:
```

（2）增加如下配置

```yaml
highlight_prettify:
  enable: true
  skin: tomorrow-night-blue          //这里是主题的文件名
  prefix_path: '/plugs/hexo-prettify-highlight/'  //插件根目录
```

(3)接着我们还要对`hexo`的`_config.yml`做如下配置

```yaml
skip_render:
  - 'plugs/hexo-prettify-highlight/js/**'
```

这个配置就是要告诉`hexo`对`plugins`目录下的`js`文件跳过解析渲染，因为测试时发现如果不配置，加载`hexo-prettify-highlight`的相关js会报脚本错误，猜测hexo渲染造成的编码问题

### 2.引用插件 ###

在`xxx `主题展示文章的页面加入样式和脚本，这里以`*.pug`模板为例

```javascript
  //在head中加入如下代码
  if config.highlight_prettify && config.highlight_prettify.enable
      link(rel='stylesheet', href=config.highlight_prettify.prefix_path + 'themes/'+config.highlight_prettify.skin+'.css')
  
  
  //在页面底部(为了页面友好展示)引入如下代码
  if config.highlight_prettify && config.highlight_prettify.enable
        script(src=config.highlight_prettify.prefix_path + 'js/jquery-2.2.4.min.js')
        script(src=config.highlight_prettify.prefix_path + 'js/prettify.js')
        script.
            $(window).load(function () {
                $('pre').addClass('prettyprint linenums').attr('style', 'overflow:auto;');
                prettyPrint();
            });
```

### 3.安装`hexo-renderer-sass`依赖插件 ###

该插件的样式文件是`*.scss`,所以需要安装`hexo-renderer-sass`编译这些文件

```tcl
$ npm install --save hexo-renderer-sass
```

