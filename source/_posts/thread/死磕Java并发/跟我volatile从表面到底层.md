---
title: 跟我volatile从表面到底层
tags:
  - 线程
---



该篇文章讨论的议题：

- java语义上的volatile
- 内存屏障
- JVM的实现
- 生成的汇编指令
- 如何保障的的可见性和有序性
- 为什么volatile不能保证复合操作的原子性

## java语义上的volatile ##

我们从一个很常见的案例开始出发

```java
public class Test {
    public static void main(String[] args) throws InterruptedException {
        Demo demo = new Demo();
        demo.setName("demo-thread");
        demo.start();
        Thread.sleep(1000);
        demo.flag = false;
        demo.join();
        System.out.println(demo.getName() + "线程执行完毕：" + demo.count);
    }

    static class Demo extends Thread{
        boolean flag = true;
        int count = 0;
        @Override
        public void run(){
            while (flag){
                count ++;
            }
        }
    }
}
```

这段代码在执行时，会发生无法停止下来的现象，显而易见，`demo-thread`从主内存中读取出`flag`的值为`true`放在了工作内存中，然后`while`去判断该值是否为`true`如果为`true`就会不断的循环，直至`flag`的值为`false`为止，然后在`main`方法的线程中修改了`demo`实例中的flag的值，但`demo-thread`线程并没有感知到`flag`的值已经被`main`线程修改为`true`了，从而发生了无法停止的现象，简单点来说这就是线程之间的可见性问题，简单的画个图加深下理解。

![img](http://ww1.sinaimg.cn/large/7fd2951agy1fudrra1em6j21ga0lydir.jpg)

![img](http://ww1.sinaimg.cn/large/7fd2951agy1fudrp40230j21fq0l6776.jpg)

![img](http://ww1.sinaimg.cn/large/7fd2951agy1fudrwmhvmwj20i60i60ty.jpg)

![img](http://ww1.sinaimg.cn/large/7fd2951agy1fudrb3q14yj21fu0lqtc9.jpg)

![img](http://ww1.sinaimg.cn/large/7fd2951agy1fudrcvie9cj21hi0k0n15.jpg)

![image-20180818125038462](http://www.spring4all.com/var/folders/tq/5890jwvd2mj_jvg2yqbynx180000gn/T/abnerworks.Typora/image-20180818125038462.png)

那么how to 解决呢？就是我们这篇的主角`volatile`（实际上解决的方式有多种，我这里是为了写这篇文章所以这样解决）

```java
public class Test {
    public static void main(String[] args) throws InterruptedException {
        ...................
    }

    static class Demo extends Thread{
        volatile boolean flag = true;
        ...........
    }
}
```

通过`volatile`关键字来修饰该变量，使得该变量的修改是对其它线程可见的，同时`volatile`还会禁止指令优化的重排序在修饰完`volatile`后会在对该变量执行操作时插入内存屏障，在进入下一个议题之前先说说何为内存屏障。

## 内存屏障 ##

先说说处理器的内存屏障，再来讨论下JVM定义的内存屏障，首先理解内存屏障本质是什么，在本质上的内存屏障实际上就是一类同步屏障指令，加了屏障的地方，假如屏障前有读写操作以及屏障后也有读写操作，那么屏障前的读写操作必然必须先于屏障后的读写操作，屏障后的读写操作也必然必须后于屏障前的读写操作（这里如果理解了乱序执行应该很好理解）

**处理器的内存屏障**

- read memory barrier (内存读屏障)

  保障早于屏障之前的读操作之后再执行晚于屏障的读操作

- write memory barrier（内存写屏障）

  保障早于屏障之前的写操作之后再执行晚于屏障的写操作

- full memory barrier（完全内存屏障）

  保障早于屏障之前的读写操作之后再执行晚于屏障之后的读写操作

先来认识几个语义的指令，因为待会在JVM的实现中也会发现它的身影，这里简单阐述一下

`acquire`: 屏障前的指令不会被排到屏障后去

`release`: 屏障后的指令不会被排到屏障前去

`fence`:屏障前的指令不会被排到屏障后去，屏障后的指令也不会排到屏障前去

**JVM的内存屏障**

`LoadLoad` 读屏障：例如有指令`Load1`和`Load2`那么假如插入屏障指令为`Load1;LoadLoad;Load2`，在中间插入`LoadLoad`屏障可以保障读操作不会进行乱序优化，即`Load2`在执行时，`Load1`的读操作应是执行完了的。

`StoreStore` 写屏障：例如有指令`Store1`和`Store2`那么假如插入屏障指令为`Store1;StoreSotre;Store2`，在中间插入`StoreStore`屏障可以保障写操作不会进行乱序优化，即`Store2`在执行时，`Store1`的写操作应是执行完了的，并且`Sotre1`的写操作是对`Store2`可见的，至于为什么可见，我会在说完这四种屏障时给出答案。

`LoadStore` 读写屏障：例如有指令`Load1`和`Store2`那么假如插入屏障指令为`Load1;LoadStore;Store2`，在中间插入`LoadStore`屏障可以保障前面的读操作和后面的写操作不会被乱序优化，即`Store2`执行时，`Load1`应是执行完了的

`StoreLoad` 写读屏障：例如有指令`Store1`和`Load2`那么假如插入屏障的指令为`Store1;StoreLoad;Load2`，在中间插入`StoreLoad`屏障可以保障前面的写操作对后面的读操作不会被乱序优化，并且是可见的，即`Load2`执行时，`Store1`应是执行完了的，并其写操作对屏障后的读操作可见

> 如果无论是加了何种屏障，例如`LoadStore`屏障即屏障前的读操作都会从主存中读取值，屏障后的指令会往主存写值，再例如`StoreLoad`屏障即屏障前的写操作会往主存写值，从而对屏障后的读操作可见，当然仅仅是往主存写值也不能保障就是可见的，所以后面的读操作也是从主存中读值

## JVM的实现 ##

So,现在是不是对`volatile`很清晰了，也知道上面为什么加了`volatile`关键字后，变量是对其它线程可见的了吧？,从而使得我们的`flag`修改后能够在多线程环境下能够有效，以一个非常简单的例子，深入的探讨下去。

```java
public class Demo{
    static volatile int i;
    public static void main(String[] args){
        i = 1;
    }
}
```

查看生成的字节码（部分片段）

```
 static volatile int i;
    descriptor: I
    flags: ACC_STATIC, ACC_VOLATILE
```

可以看到在字节码文件上有一个`ACC_VOLATILE`的标识符，接着打开JVM（我用的Hotspot）的代码来看看吧~

![img](http://ww1.sinaimg.cn/large/7fd2951agy1fuf3w1v5nlj20jx08rgnk.jpg)

可以在JVM源码中看到有一个`is_volatile`判断是否是`volatile`访问限定符修饰的,然后再看字节码解释器的部分源码

![img](http://ww1.sinaimg.cn/large/7fd2951agy1fuf42jzj7mj20n40drjte.jpg)

注意有三个细节，首先会判断是否标识了`volatile`，然后再判断类型，我们这个是`int`类型所以会调用`release_int_field_put`，最后插入一道屏障`storeload`，首先先看`itos`的定义

![img](http://ww1.sinaimg.cn/large/7fd2951agy1fuf48fwz0ij20dn07r3z3.jpg)

顾名思义：表示栈顶缓存的int类型数据

接着看`release_int_field_put`

![img](http://ww1.sinaimg.cn/large/7fd2951agy1fuf4h7s1wgj20wi026q36.jpg)

会发现它调用了`OrderAccess::release_store`

![img](http://ww1.sinaimg.cn/large/7fd2951agy1fuf4klyqcuj20pe07k768.jpg)

那么这个方法究竟是干什么的呢？首先注意方法参数添加了`volatile`关键字，这是c++的`volatile`关键字和Java(java语法也有这个同名的关键字不是吗？)被该关键字所修饰的变量意味着易变的，再c++中修饰了这个关键字的变量每次使用时都会从变量对应的内存地址且编译器也不会对它进行优化。

那么`os::atomic_copy64`又是什么呢？这里会针对不同的系统，我这里只看Linux的

![img](http://ww1.sinaimg.cn/large/7fd2951agy1fuf5alpnlmj20k20b20tt.jpg)

粗暴点，就是生成汇编代码去拷贝值吧？

接着我们看

![img](http://ww1.sinaimg.cn/large/7fd2951agy1fuf5i4ieabj20lc0dojtd.jpg)

接着看`OrderAccess::storeload`

![img](http://ww1.sinaimg.cn/large/7fd2951agy1fuf5r7kowqj20b602fjra.jpg)

请告诉我这4个东西眼熟不眼熟？！？，这当然只是定义不同系统下实现不一样，我们这里还是看`linux`的

![img](http://ww1.sinaimg.cn/large/7fd2951agy1fuf5tjt30dj20ee03574h.jpg)

看这个方法的实现，还有其它三种的实现是什么？本篇文章上面也对该语义进行了阐述吧？继续看`linux`下的实现

![img](http://ww1.sinaimg.cn/large/7fd2951agy1fuf5vfvk6ej20ch020wec.jpg)

`FULL_MEM_BARRIER`是什么本文上面也说了吧

![img](http://ww1.sinaimg.cn/large/7fd2951agy1fuf68xzlbsj20hm0f53zv.jpg)

针对的环境不通实现也不同，这里具体就不再阐述

## 生成的汇编指令 ##

= = 写到这个小节的时候笔者是用的windows了，所以再补一下windows对fence实现的源码

![img](http://ww1.sinaimg.cn/large/7fd2951agy1fuf755htt3j20es05zdg2.jpg)

看下在我机器上生成的汇编代码

```tcl
[Disassembling for mach='amd64']
[Entry Point]
[Verified Entry Point]
[Constants]
  # {method} {0x0000000017cf2a38} 'main' '([Ljava/lang/String;)V' in 'org/yuequan/thread/test/Demo'
  # parm0:    rdx:rdx   = '[Ljava/lang/String;'
  #           [sp+0x40]  (sp of caller)
  0x00000000037e5320: mov     dword ptr [rsp+0ffffffffffffa000h],eax
  0x00000000037e5327: push    rbp
  0x00000000037e5328: sub     rsp,30h
  0x00000000037e532c: mov     rsi,17cf2af8h     ;   {metadata(method data for {method} {0x0000000017cf2a38} 'main' '([Ljava/lang/String;)V' in 'org/yuequan/thread/test/Demo')}
  0x00000000037e5336: mov     edi,dword ptr [rsi+0dch]
  0x00000000037e533c: add     edi,8h
  0x00000000037e533f: mov     dword ptr [rsi+0dch],edi
  0x00000000037e5345: mov     rsi,17cf2a30h     ;   {metadata({method} {0x0000000017cf2a38} 'main' '([Ljava/lang/String;)V' in 'org/yuequan/thread/test/Demo')}
  0x00000000037e534f: and     edi,0h
  0x00000000037e5352: cmp     edi,0h
  0x00000000037e5355: je      37e537eh          ;*iconst_1
                                                ; - org.yuequan.thread.test.Demo::main@0 (line 6)

  0x00000000037e535b: mov     rsi,0d5b0dad0h    ;   {oop(a 'java/lang/Class' = 'org/yuequan/thread/test/Demo')}
  0x00000000037e5365: mov     edi,1h
  0x00000000037e536a: mov     dword ptr [rsi+68h],edi
  0x00000000037e536d: lock add dword ptr [rsp],0h  ;*putstatic i
                                                ; - org.yuequan.thread.test.Demo::main@1 (line 6)

  0x00000000037e5372: add     rsp,30h
  0x00000000037e5376: pop     rbp
  0x00000000037e5377: test    dword ptr [2f20100h],eax
                                                ;   {poll_return}
  0x00000000037e537d: ret
  0x00000000037e537e: mov     qword ptr [rsp+8h],rsi
  0x00000000037e5383: mov     qword ptr [rsp],0ffffffffffffffffh
  0x00000000037e538b: call    37e20a0h          ; OopMap{rdx=Oop off=112}
                                                ;*synchronization entry
                                                ; - org.yuequan.thread.test.Demo::main@-1 (line 6)
                                                ;   {runtime_call}
  0x00000000037e5390: jmp     37e535bh
  0x00000000037e5392: nop
  0x00000000037e5393: nop
  0x00000000037e5394: mov     rax,qword ptr [r15+2a8h]
  0x00000000037e539b: mov     r10,0h
  0x00000000037e53a5: mov     qword ptr [r15+2a8h],r10
  0x00000000037e53ac: mov     r10,0h
  0x00000000037e53b6: mov     qword ptr [r15+2b0h],r10
  0x00000000037e53bd: add     rsp,30h
  0x00000000037e53c1: pop     rbp
  0x00000000037e53c2: jmp     374ece0h          ;   {runtime_call}
  0x00000000037e53c7: hlt
  0x00000000037e53c8: hlt
  0x00000000037e53c9: hlt
  0x00000000037e53ca: hlt
  0x00000000037e53cb: hlt
  0x00000000037e53cc: hlt
  0x00000000037e53cd: hlt
  0x00000000037e53ce: hlt
  0x00000000037e53cf: hlt
  0x00000000037e53d0: hlt
  0x00000000037e53d1: hlt
  0x00000000037e53d2: hlt
  0x00000000037e53d3: hlt
  0x00000000037e53d4: hlt
  0x00000000037e53d5: hlt
  0x00000000037e53d6: hlt
  0x00000000037e53d7: hlt
  0x00000000037e53d8: hlt
  0x00000000037e53d9: hlt
  0x00000000037e53da: hlt
  0x00000000037e53db: hlt
  0x00000000037e53dc: hlt
  0x00000000037e53dd: hlt
  0x00000000037e53de: hlt
  0x00000000037e53df: hlt
[Exception Handler]
[Stub Code]
  0x00000000037e53e0: call    3750aa0h          ;   {no_reloc}
  0x00000000037e53e5: mov     qword ptr [rsp+0ffffffffffffffd8h],rsp
  0x00000000037e53ea: sub     rsp,80h
  0x00000000037e53f1: mov     qword ptr [rsp+78h],rax
  0x00000000037e53f6: mov     qword ptr [rsp+70h],rcx
  0x00000000037e53fb: mov     qword ptr [rsp+68h],rdx
  0x00000000037e5400: mov     qword ptr [rsp+60h],rbx
  0x00000000037e5405: mov     qword ptr [rsp+50h],rbp
  0x00000000037e540a: mov     qword ptr [rsp+48h],rsi
  0x00000000037e540f: mov     qword ptr [rsp+40h],rdi
  0x00000000037e5414: mov     qword ptr [rsp+38h],r8
  0x00000000037e5419: mov     qword ptr [rsp+30h],r9
  0x00000000037e541e: mov     qword ptr [rsp+28h],r10
  0x00000000037e5423: mov     qword ptr [rsp+20h],r11
  0x00000000037e5428: mov     qword ptr [rsp+18h],r12
  0x00000000037e542d: mov     qword ptr [rsp+10h],r13
  0x00000000037e5432: mov     qword ptr [rsp+8h],r14
  0x00000000037e5437: mov     qword ptr [rsp],r15
  0x00000000037e543b: mov     rcx,6601c4e0h     ;   {external_word}
  0x00000000037e5445: mov     rdx,37e53e5h      ;   {internal_word}
  0x00000000037e544f: mov     r8,rsp
  0x00000000037e5452: and     rsp,0fffffffffffffff0h
  0x00000000037e5456: call    65cd4510h         ;   {runtime_call}
  0x00000000037e545b: hlt
[Deopt Handler Code]
  0x00000000037e545c: mov     r10,37e545ch      ;   {section_word}
  0x00000000037e5466: push    r10
  0x00000000037e5468: jmp     3727600h          ;   {runtime_call}
  0x00000000037e546d: hlt
  0x00000000037e546e: hlt
  0x00000000037e546f: hlt
Decoding compiled method 0x00000000037e4ed0:
Code:
Argument 0 is unknown.RIP: 0x37e5020 Code size: 0x00000110
[Entry Point]
[Verified Entry Point]
[Constants]
  # {method} {0x0000000017cf2a38} 'main' '([Ljava/lang/String;)V' in 'org/yuequan/thread/test/Demo'
  # parm0:    rdx:rdx   = '[Ljava/lang/String;'
  #           [sp+0x40]  (sp of caller)
  0x00000000037e5020: mov     dword ptr [rsp+0ffffffffffffa000h],eax
  0x00000000037e5027: push    rbp
  0x00000000037e5028: sub     rsp,30h           ;*iconst_1
                                                ; - org.yuequan.thread.test.Demo::main@0 (line 6)

  0x00000000037e502c: mov     rsi,0d5b0dad0h    ;   {oop(a 'java/lang/Class' = 'org/yuequan/thread/test/Demo')}
  0x00000000037e5036: mov     edi,1h
  0x00000000037e503b: mov     dword ptr [rsi+68h],edi
  0x00000000037e503e: lock add dword ptr [rsp],0h  ;*putstatic i
                                                ; - org.yuequan.thread.test.Demo::main@1 (line 6)

  0x00000000037e5043: add     rsp,30h
  0x00000000037e5047: pop     rbp
  0x00000000037e5048: test    dword ptr [2f20100h],eax
                                                ;   {poll_return}
  0x00000000037e504e: ret
  0x00000000037e504f: nop
  0x00000000037e5050: nop
  0x00000000037e5051: mov     rax,qword ptr [r15+2a8h]
  0x00000000037e5058: mov     r10,0h
  0x00000000037e5062: mov     qword ptr [r15+2a8h],r10
  0x00000000037e5069: mov     r10,0h
  0x00000000037e5073: mov     qword ptr [r15+2b0h],r10
  0x00000000037e507a: add     rsp,30h
  0x00000000037e507e: pop     rbp
  0x00000000037e507f: jmp     374ece0h          ;   {runtime_call}
  0x00000000037e5084: hlt
  0x00000000037e5085: hlt
  0x00000000037e5086: hlt
  0x00000000037e5087: hlt
  0x00000000037e5088: hlt
  0x00000000037e5089: hlt
  0x00000000037e508a: hlt
  0x00000000037e508b: hlt
  0x00000000037e508c: hlt
  0x00000000037e508d: hlt
  0x00000000037e508e: hlt
  0x00000000037e508f: hlt
  0x00000000037e5090: hlt
  0x00000000037e5091: hlt
  0x00000000037e5092: hlt
  0x00000000037e5093: hlt
  0x00000000037e5094: hlt
  0x00000000037e5095: hlt
  0x00000000037e5096: hlt
  0x00000000037e5097: hlt
  0x00000000037e5098: hlt
  0x00000000037e5099: hlt
  0x00000000037e509a: hlt
  0x00000000037e509b: hlt
  0x00000000037e509c: hlt
  0x00000000037e509d: hlt
  0x00000000037e509e: hlt
  0x00000000037e509f: hlt
[Exception Handler]
[Stub Code]
  0x00000000037e50a0: call    3750aa0h          ;   {no_reloc}
  0x00000000037e50a5: mov     qword ptr [rsp+0ffffffffffffffd8h],rsp
  0x00000000037e50aa: sub     rsp,80h
  0x00000000037e50b1: mov     qword ptr [rsp+78h],rax
  0x00000000037e50b6: mov     qword ptr [rsp+70h],rcx
  0x00000000037e50bb: mov     qword ptr [rsp+68h],rdx
  0x00000000037e50c0: mov     qword ptr [rsp+60h],rbx
  0x00000000037e50c5: mov     qword ptr [rsp+50h],rbp
  0x00000000037e50ca: mov     qword ptr [rsp+48h],rsi
  0x00000000037e50cf: mov     qword ptr [rsp+40h],rdi
  0x00000000037e50d4: mov     qword ptr [rsp+38h],r8
  0x00000000037e50d9: mov     qword ptr [rsp+30h],r9
  0x00000000037e50de: mov     qword ptr [rsp+28h],r10
  0x00000000037e50e3: mov     qword ptr [rsp+20h],r11
  0x00000000037e50e8: mov     qword ptr [rsp+18h],r12
  0x00000000037e50ed: mov     qword ptr [rsp+10h],r13
  0x00000000037e50f2: mov     qword ptr [rsp+8h],r14
  0x00000000037e50f7: mov     qword ptr [rsp],r15
  0x00000000037e50fb: mov     rcx,6601c4e0h     ;   {external_word}
  0x00000000037e5105: mov     rdx,37e50a5h      ;   {internal_word}
  0x00000000037e510f: mov     r8,rsp
  0x00000000037e5112: and     rsp,0fffffffffffffff0h
  0x00000000037e5116: call    65cd4510h         ;   {runtime_call}
  0x00000000037e511b: hlt
[Deopt Handler Code]
  0x00000000037e511c: mov     r10,37e511ch      ;   {section_word}
  0x00000000037e5126: push    r10
  0x00000000037e5128: jmp     3727600h          ;   {runtime_call}
  0x00000000037e512d: hlt
  0x00000000037e512e: hlt
  0x00000000037e512f: hlt
```

这么长肿么看？看关键部位就好拉

![img](http://ww1.sinaimg.cn/large/7fd2951agy1fuf77i4oslj20ls01rjr9.jpg)

看到是使用的`lock`指令吧？那么问题来了`lock`指令是什么，我在这里肤浅的解释一下：CPU提供了在执行指令期间提供了总线加锁的手段，那么加了`lock`的汇编生成机器码就使CPU在执行这条指令的时候会把#HLOCK pin的电位拉低，持续到这条指令结束时放开，从而把总线锁住，从而保证这条指令执行的原子性

## 如何保障的的可见性和有序性 ##

通过内存屏障来提醒编译器和CPU不对指令进行优化防止其优化乱序执行从而达到有序性，在屏障的前后都是通过主存读写达到线程之间的可见性。（O(∩_∩)O 我想不用再多解释了）

## 为什么volatile不能保证复合操作的原子性 ##

就比如在多线程中，多个线程对于一个实例变量的变量`i`进行自增操作，例如`i++`，这时候就产生了竞态条件导致，例如给`i`变量加5000次，得到的结果可能是5000得到的结果也可能是少于5000，尽管你加了`volatile`，这是为什么呢？要知道`volatile`仅是通过内存屏障的机制来保障

例如

```
load1;load2;store1;store2;StoreLoad;load3;store3.....
```

尽管你保证了可见性，但你不能保证该操作的原子性，所谓的原子性本质就是指令在执行期间不被打断，要么就是不执行，仔细想想`i++`是不是一个三步的复合操作：取值、相加、赋值，就比如：你在未赋值时别的线程执行时，别的线程也正在处以赋值状态，语言解释好麻烦看下列示例

```
i= 0
线程A    线程B
取值 0
         取值 0
相加 1   
         相加 1
赋值 1   
         赋值 1
```

尽管你保障了可见性，但你并不能保证你拿到手上的值永远是最新值。