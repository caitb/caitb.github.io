---
title: Mac OS/Linux命令查询网络端口占用情况
categories:
  - Mac
tags:
  - Mac
---



##### 命令赋权： #####

`sudo chmod 755   *.sh/文件夹名`



##### netstat命令 #####

`netstat -an | grep 3306`   //3306替换成需要grep的端口号

 

##### lsof命令 #####

通过list open file命令可以查看到当前打开文件，在linux中所有事物都是以文件形式存在，包括网络连接及硬件设备。

`lsof -i:port` 或者 `lsof -i tcp:port`  //port替换成端口号，比如6379

**-i**参数表示网络链接，**:80**指明端口号，该命令会同时列出PID，方便kill

查看所有进程监听的端口

`sudo lsof -i -P | grep -i "listen"`

```basic
COMMAND   PID     USER    FD      TYPE             DEVICE                      SIZE/OFF      NODE       NAME

java               716      a           313u   IPv6               0x1111111111111      0t0                 TCP        *:cslistener (LISTEN)
```

然后根据PID杀进程：

`sudo kill -9 716`