---
title: MacOS设置环境变量PATH的完全总结
categories:
  - Mac
tags:
  - Mac
---



###### 一、MacOS加载bash shell 环境变量的加载顺序

**1、系统级别的**

```basic
/etc/profile
/etc/bashrc
/etc/paths
```

**2、用户级别的**

```basic
~/.bash_profile(mac用的)
~/.bash_login
~/.profile
~/.bashrc (这个linux用的)
```

###### 二、各加载方式的分析和修改方法

**1、/etc/profile**

etc - environment config 环境设置, profile - 档案

(1)文件构成

执行vi /etc/profile之后呈现

```bash
# System-wide .profile for sh(1)

if [ -x /usr/libexec/path_helper ]; then
        eval `/usr/libexec/path_helper -s`
fi

if [ "${BASH-no}" != "no" ]; then
        [ -r /etc/bashrc ] && . /etc/bashrc
fi

```

(2)级别：系统级别，应该是不管哪个shell都调用这个profile，所以不建议用这个文件用于全局环境变量

/etc/profile:此文件为系统的每个用户设置环境信息,当用户第一次登录时,该文件被执行，并从/etc/profile.d目录的配置文件中搜集shell的设置

(3) 修改方法：

如果没特殊说明,设置PATH的语法都为：

```bash
#中间用冒号隔开
export PATH=$PATH:<PATH 1>:<PATH 2>:<PATH 3>:------:<PATH N>
```

**2、/etc/bashrc - 建议修改，方法复杂（系统级别2、和下面的3只修改一个就可以了）**

bashrc - bash run config，bash运行时候的设置

(1) 文件构成

执行vi /etc/bashrc之后呈现：

```bash
# System-wide .bashrc file for interactive bash(1) shells.
if [ -z "$PS1" ]; then
   return
fi


PS1='\h:\W \u\$ '
# Make bash check its window size after a process completes
shopt -s checkwinsize

[ -r "/etc/bashrc_$TERM_PROGRAM" ] && . "/etc/bashrc_$TERM_PROGRAM"
```

(2) 级别：这个是bash启动时候必须加载的环境变量，做为全局环境变量设置是可以行的

/etc/bashrc:为每一个运行bash shell的用户执行此文件，当bash shell被打开时,该文件被读取。

(3) 修改方法：同上/etc/profile

**3、/etc/paths - 建议修改，方法简单**

(1) 文件构成

执行vi /etc/paths之后呈现：

```basic
/usr/local/bin
/usr/bin
/bin
/usr/sbin/sbin
```

(2) 级别：实质上这就是个系统全局的路径，不建议做直接改动，具体改动的方法两个

(3) 修改方法：就是加载路径

```bash
1.创建一个文件：
sudo touch /etc/paths.d/mysql
    
2.用 vim 打开这个文件（如果是以 open -t 的方式打开，则不允许编辑）：
sudo vim /etc/paths.d/mysql

3.编辑该文件，键入路径并保存（关闭该 Terminal 窗口并重新打开一个，就能使用 mysql 命令了）
/usr/local/mysql/bin
```

或者

```tex
sudo -s 'echo "/usr/local/sbin/mypath" > /etc/paths.d/mypath'
```

**4、~/.bash_profile 用户级别，建议修改这个文件。系统、用户级别只要选一个修改就够了**

```basic
/usr/local/bin
~/.bash_login
~/.profile
```

 (1) 文件构成：和/etc/profile一样，export PATH=$PATH:/xxx/bin:/bin

(2) 级别：用户级别，这三个MacOS按照顺序查找，找到了一个，就不往下查找了。用户登录后执行一次

(3) 修改方法：同/etc/profile

**5、~/.bashrc 用户级别**

(1) 文件构成：和/etc/profile一样，export PATH=$PATH:/xxx/bin:/bin

(2) 级别：用户级别。每次打开新的shell窗口，都会去读取一次。

（注：Linux 里面是 .bashrc 而 Mac 是 .bash_profile）

(3) 修改方法：同/etc/profile

###### 延 * 伸 * 阅 * 读

```basic

延伸阅读http://elf8848.iteye.com/blog/1582137

Mac 启动加载文件位置（可设置环境变量）
  
-------------------------------------------------------

（1）首先要知道你使用的Mac OS X是什么样的Shell，使用命令  

echo $SHELL

如果输出的是：csh或者是tcsh，那么你用的就是C Shell。
  
如果输出的是：bash，sh，zsh，那么你的用的可能就是Bourne Shell的一个变种。
 
Mac OS X 10.2之前默认的是C Shell。
 
Mac OS X 10.3之后默认的是Bourne Shell。
 
（2）如果是Bourne Shell。
  
那么你可以把你要添加的环境变量添加到你主目录下面的.profile或者.bash_profile，如果存在没有关系添加进去即可，如果没有生成一个。

Mac配置环境变量的地方
 
1./etc/profile   （建议不修改这个文件 ）
 
全局（公有）配置，不管是哪个用户，登录时都会读取该文件。
 
2./etc/bashrc    （一般在这个文件中添加系统级环境变量）
  
全局（公有）配置，bash shell执行时，不管是何种方式，都会读取此文件。
  
3.~/.bash_profile  （一般在这个文件中添加用户级环境变量）
 
每个用户都可使用该文件输入专用于自己使用的shell信息,当用户登录时,该文件仅仅执行一次!
```

