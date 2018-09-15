---
title: Mac下Apache服务器配置
categories:
  - Mac
tags:
  - Mac
---

##### 一、Apache服务器 #####

　　1. 使用最广的 Web 服务器

　　2. Mac自带，只需要修改几个配置就可以，简单，快捷

　　3. 有些特殊的服务器功能，Apache都能很好的支持

　　目的：让有一个自己专属的测试环境



##### 二、准备工作 #####

1. 设置用户密码
2. MAC 10.10及以上



##### 三、配置服务器（此过程会用到vim命令，建议先了解一下） #####

   1. 常见命令

      `sudo apachectl -v`

      *//一般来说Mac系统都会自带Apache环境，此命令的用处是查看当前系统的Apache版本*

      *//此过程会要求用户输入密码，输入时是隐藏的，用户输入完成直接回车即可。*



      `sudo apachectl -k start`

      *//启动Apache*

      *//此步骤过后就可以查看Apche是否已经启动了，在safari地址栏中输入”http://localhost“或”127.0.0.1“，如果网页中出现”ItWork！“则表示已经启动*



      `sudo apachectl -k stop`

      *//停止Apache*



      `sudo apachectl -k restart`

      *//重启Apache*

2. 配置服务器的工作

      1>在Finder中创建一个"Sites"的文件夹，直接创建在/Users/apple(当前用户名)目录下

      ![img](https://ws4.sinaimg.cn/large/006tNbRwgy1fuic0r1w1tj30iv09hgmh.jpg)

      2>修改配置文件中的"两个路径"，指向刚刚创建的文件夹(==按照4.的流程命令步骤去做==）

       3>拷贝一个文件(==按照4.的流程命令步骤去做==）

3. 配置服务器注意事项

      1>关闭中文输入法

      2>命令和参数之间需要有"空格"

      3>修改系统文件一定记住"sudo"，否则会没有权限

      4>目录要在/Users/***(当前用户名) : 将你创建的文件夹Sites直接拖放到终端中就可以查看你创建的Apache服务器文件夹路径

   4. 配置服务器流程（以下命令终端执行）

      *// 切换工作目录*
      `cd /etc/apache2`

      *// *** 备份文件，以防不测，只需要执行一次就可以了(可以使用ls命令查看是否新增了httpd.conf.bak文件）*
      `sudo cp httpd.conf httpd.conf.bak`

      *// 提示：如果后续操作出现错误！可以使用以下命令，恢复备份过的 httpd.conf 文件（此步骤不需执行）*
      `sudo cp httpd.conf.bak httpd.conf`

      *// 用vim编辑httpd.conf（vim里面只能用键盘，不能用鼠标）*
      `sudo vim httpd.conf`

      *// 查找DocumentRoot（搜索完后会出现下图界面）*
      `/DocumentRoot` 

      ![img](https://ws4.sinaimg.cn/large/006tNbRwgy1fuicts2gskj30oj09340s.jpg)

      *"键盘方向键控制，将光标移动到首行"*

      *"修改引号中的路径"*

      *// 修改两个lib/WebSer/Docume改成我们自己的服务器文件夹路径（/Users/**用户名**/Sites）*
      *"按i进入编辑模式"  (终端最下面出现下图字符表示已经进入编辑模式)*

      *// 退出编辑模式，进入命令模式*
      `ESC`

      *"将光标移动到首行"*
      `0`  *//这是零，不是字母o*

      *"保存并退出一下"*
      `:wq`

      ”继续进入编辑”
      `sudo vim httpd.conf`

      *"这时候如果你想看看是否更改成功的话，可以继续执行上面的/DocumentRoot查看一下那两个路径是否已经更改"*
      *”查找“* 
      `/options`

      *"按向下箭头往下走"*

      *//找到* 
      **Options FollowSymLinks Multiviews** 

      *"进入编辑模式  按i”*

      *//加一个单词* 
      Options ==Indexes== FollowSymLinks Multiviews 

      *// 查找php* 
      `/php`

      *"将光标移动到首行"*
      `0`

      *删除行首注释# (如下图位置,按i进入编辑模式，删除之后按Esc退出编辑模式)*

      ![img](https://ws4.sinaimg.cn/large/006tNbRwgy1fuicvkbhmmj30ld0auadh.jpg)

      *// 保存并退出*
      `:wq`

      *// 不保存退出!!!!!!!!!(这一步不需要执行，如果自己写错输入错了的话就在执行）*
      `:q!`

      *// 切换工作目录*
      `cd /etc`

      *// 拷贝php.ini文件*
      `sudo cp php.ini.default php.ini`

      *// 重新启动apache服务器*
      `sudo apachectl -k restart`  (之后出现下图所示警告表示正常）

      ![img](https://ws3.sinaimg.cn/large/006tNbRwgy1fuicw9nprwj30pv02iq3n.jpg)

      测试 Apache 服务器

      在浏览器地址栏输入 `127.0.0.1`，这时候你会发现还是坑爹的**it Work！**

      那么，请清空一下你的safari-->”清除历史记录和网站数据"

      再次输入“127.0.0.1”试试吧

      如果你想你的Apache里面多些内容，试试下面的步骤。

      随便创建个文件夹，以.json的后缀名或其他都行，放一段json文本在里面，把它放到Sites文件夹里面吧

      ![img](https://ws3.sinaimg.cn/large/006tNbRwgy1fuicx43f9sj30gl0ayq3n.jpg)

      然后输入`127.0.0.1/demo.json`试试吧。

      

      Apache是一个服务器，为了保证用户的安全，每次重新启动计算机Apache不会自动启动

      　需要进入终端，手动启动一次