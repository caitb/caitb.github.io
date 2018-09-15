---
title: 【Java并发基础】——对象共享
categories:
  - Java
     - 多线程
        - 并发基础
tags:
  - 多线程线程
---



**要编写正确的并发程序，关键问题在于：在访问*共享的可变状态*时需要进行正确的管理。**

【Java并发基础】——线程安全性 介绍了如何通过同步来避免多个线程在同一时刻访问相同的数据，而本章将介绍如何共享和发布对象，从而使它们能够安全地由多个线程同时访问。这两章合在一起，就形成了构建线程安全类以及通过`java.util.concurrent`类库来构建并发应用程序的重要基础。

<!-- more -->

### **可见性** ###

关键字`synchronize`不仅能保证*原子性或者确定“临界区”*，还能确保*内存可见性*。为了*确保多个线程*之间对内存写入操作的可见性，必须使用同步机制。

在程序清单3-1中的`NoVisibility`说明了当多个线程在没有同步的情况下共享数据时出现的错误。

###### 程序清单3-1 在没有同步的情况下共享变量（不要这么做） ######

```java
public class NoVisibility {

    private static boolean ready;
    private static int number;

    public static void main(String[] args) throws InterruptedException {
        //读线程
        ExecutorService executorService = Executors.newSingleThreadExecutor();
        //读任务
        Runnable task = () -> {
            while (!ready) {
                Thread.yield();
            }
            System.out.println(number);
            executorService.shutdown();
        };
        //启动读线程
        executorService.execute(task);
        //主线程操作数据
        number = 42;
        ready = true;
    }
}
```

`NoVisibility`可能会持续循环下去，因为读线程可能永远看不到`ready`的值。一种更奇怪的现象是，`NoVisibility`可能会输出0，因为读线程可能看到了写入`ready`的值，但却没有看到之后写入`number`的值，这种现象被称为“*重排序*”

##### 非原子的64位操作 #####

*最低安全性保证*：当线程在没有同步的情况下读取变量时，可能会得到一个失效值，但至少这个值是由之前某个线程设置的值，而不是一个随机值。

<span style="color:red;">Java内存模型要求，变量的读操作和写入操作都必须是原子操作，但对于非`volatile`类型的`long`和`double`变量，JVM允许将64位的读操作或写操作分解为两个32位的操作。</span>

##### 加锁与可见性 #####

如图3-1所示，加锁可以确保当线程B执行由锁保护的同步代码块时，可以看<u>到线</u>程A之前在同一个同步代码块中的所有操作结果。如果没有同步，那么就无法实现上述保证。

![同步的可见性保证](Java并发基础之对象共享.assets/visibility-3937012.png)

###### 图3-1 同步的可见性保证 ######

*加锁的含义不仅仅局限于互斥行为，还包括内存可见性。为了确保所有线程都能看到共享变量的最新值，所有执行读操作或者写操作的线程都必须在同一个锁上同步。*

##### Volatile变量 #####

*volatile*<u>变量上的操作不会与其他内存操作一起重排序</u>，当线程A首先写入一个*volatile*变量并且线程B随后读取该变量时，在写入*volatile*变量之前对A可见的所有变量的值，在B读取了*volatile*变量后，对B也是可见的。因此，从内存可见性的角度来看，写入*volatile*变量相当于退出同步代码块，而读取*volatile*变量就相当于进入同步代码块。

> 加锁机制既可以确保可见性又可以确保原子性，而*volatile*变量只能确保可见性。
>
> 当且仅当满足以下所有条件时，才应该使用*volatile*变量：
>
> - 对变量的写入操作不依赖变量的当前值，或者你能确保只有单个线程更新变量的值
> - 该变量不会与其他状态变量一起纳入不变性条件中
> - 在访问变量时不需要加锁

*volatile*变量的正确使用方式包括：确保它们自身状态的可见性，确保它们所引用对象的状态的可见性，以及标识一些重要的程序生命周期事件的发生(例如，初始化或关闭)。程序清单3-4给出了volatile变量的一种典型用法：检查某个状态标记以判断是否退出循环。

###### 程序清单3-4 数绵羊 ######

```java
    volatile boolean asleep;
    ...
        while (!asleep) {
            countSomeSheep();
        }
```

*volatile*变量通常用做某个操作完成、发生中断或者状态标志，例如程序清单3-4中的asleep标志。

### **发布与逸出** ###

*“发布”一个对象*：使对象能够在当前作用域之外的代码中使用。

*“逸出”一个对象*：某个不应该发布的对象被发布了。

如程序清单3-5所示，给出了发布对象的方式。

###### 程序清单3-5 发布对象的方式 ######

```java
    // 1 将指向该对象的引用保存到其他代码可以访问的地方
    public static Set<Secret> knownSecrets;

    public void initialize() {
        knownSecrets = new HashSet<>();
    }

    // 2 在某一个非私有的方法中返回该对象的引用
    private Set<Secret> knownSecrets = new HashSet<>();

    public Set<Secret> getKnownSecrets() {
        return knownSecrets;
    }

    // 3 将对象的引用传递到其他类的方法中
    private Set<Secret> knownSecrets;

    public void setKnownSecrets(Set<Secret> knownSecrets) {
        this.knownSecrets = knownSecrets;
    }

    // 4 最后一种发布对象或其内部状态的机制就是发布一个内部类的实例
    public class ThisEscape {
        public ThisEscape(EventSource source) {
            // 当ThisEscape发布EventListener时，也隐含地发布了ThisEscape实例本身，
            // 因为在这个内部类的实例中包含了对ThisEscape实例的隐含引用
            source.registerListener(new EventListener() {
                public void onEvent(Event e) {
                    doSomething(e);
                }
            });
        }
    }
```

当发布某个对象时，可能会间接地发布其他对象（例如，`knownSecrets`对象里`Secret`实例会被间接地发布；在该对象的非私有域中引用的所有对象同样会被发布）。一般来说，如果一个已经发布的对象能够通过非私有的变量引用和方法调用到达其他对象，那么这些对象也会被发布。

##### 安全的对象构造过程 #####

当且仅当对象的构造函数返回时，对象才处于可预测的和一致的状态。因此，当从对象的构造函数中发布对象时，只是发布了一个尚未构造完成的对象。即使发布对象的语句位于构造函数的最后一行也是如此。如果this引用在构造过程中逸出，那么这种对象就被认为是不正确构造。

在构造过程中使this引用逸出的常见错误是：1.在构造函数中启动一个线程，2.在构造函数中调用一个可改写的实例方法(既不是私有[private]方法也不是终结[final]方法)。

### **线程封闭** ###

*线程封闭*：仅在单线程内访问数据（多线程之间的访问是通过方法传递）。

当某个对象封闭在一个线程中时，这种用法将自动实现线程安全性，即使被封闭的对象本身不是线程安全的。

##### Ad-线程封闭 #####

Ad-hoc线程封闭是指，维护线程封闭性的职责完全由程序实现来承担。

在`volatile`变量上存在一种特殊的线程封闭。只要你能确保只要单个线程对共享的`volatile`变量执行写入操作，那么就可以安全地在这些共享的`volatile`变量上执行“读取-修改-写入”的操作。在这种情况下，相当于将修改操作封闭在单个线程中以防止发生竞态条件，并且`volatile`变量的可见性保证还确保了其他线程能看到最新的值。

##### 栈封闭 #####

在栈封闭中，只能通过局部变量才能访问对象。局部变量的固有属性之一就是封闭在执行线程中。它们位于执行线程的栈中，其他线程无法访问这个栈。

*基本类型的局部变量始终封闭在线程内。*因为Java语言的语义规定了任何方法都无法获得对基本类型的引用。例如程序清单3-9中`loadTheArk`方法的`numPairs`，无论如何都不会破坏栈封闭性。

###### 程序清单3-9 基本类型的局部变量与引用变量的线程封闭性 ######

```java
    public int loadTheArk(Collection<Animal> candidates) {
        SortedSet<Animal> animals;
        int numPairs = 0;
        Animal candidate = null;
        
        // animals被封闭在方法中，不要使它们逸出！
        animals = new TreeSet<Animal>(new SpeciesGenderComparator());
        animals.addAll(candidates);
        for (Animal a : animals) {
            if (candidate * null || candidate.isPotentialMate(a)) {
                candidate = a;
            } else {
                ark.load(new AnimalPair(candidate, a));
                ++numPairs;
                candidate = null;
            }
        }
        // numPairs是基本类型的变量，不会逸出
        return numPairs;
    }
```

在维护对象引用的栈封闭性时，程序员需要多做一些工作以确保被引用的对象不会逸出。例如程序清单3-9中`loadTheArk`方法的`animals`，是不能逸出的，否则栈封闭性将被破坏。

##### ThreadLocal类 #####

维持线程封闭性的一种更规范方法是使用`ThreadLocal`。`ThreadLocal`提供了`get`与`set`等访问接口或方法，这些方法为每个使用该变量的线程都存有一份独立的副本，因此`get`总是返回由当前执行线程在调用set时设置的最新值。

### **不变性** ###

##### 不可变对象 #####

满足同步需求的另一种方法是使用*不可变对象*。

> *不可变对象一定是线程安全的。*
>
> 当满足以下条件时，对象才是不可变的：
>
> - 对象创建以后其状态就不能修改
> - 对象的所有域都是final类型
> - 对象是正确创建的（在对象的创建期间，this引用没有逸出）

不可变性并不等于将对象中所有的域都声明为final类型，即使对象中所有的域都是final类型的，这个对象也仍然是可变的，因为在final类型的域中可以保存对可变对象的引用。

##### Final域 #####

`final`域能确保初始化过程的安全性。

##### 示例：使用Volatile类型来发布不可变对象 #####

<u>每当需要一组相关数据以原子方式执行某个操作时，就可以考虑创建一个不可变的类来包含这些数据</u>，例如程序清单3-12中的`OneValueCache`。

###### 程序清单3-12 对数值及其因数分解结果进行缓存的不可变容器类 ######

```java
public class OneValueCache {
    
    private final BigInteger lastNumber;
    private final BigInteger[] lastFactors;

    public OneValueCache(BigInteger lastNumber, BigInteger[] factors) {
        this.lastNumber = lastNumber;
        this.lastFactors = Arrays.copyOf(factors, factors.length);
    }

    public BigInteger[] getFactors(BigInteger i) {
        if (lastNumber * null || !lastFactors.equals(i)) {
            return null;
        }
        return Arrays.copyOf(lastFactors, lastFactors.length);
    }
}
```

对于在访问和更新多个相关变量时出现的竞态条件问题，可以通过将这些变量全部保存在一个不可变对象中来消除。如果是一个可变的对象，那么就必须使用锁来确保原子性。

程序清单3-13中，通过使用包含多个状态变量的容器对象来维持不变性条件，并使用一个`volatile`类型的引用来确保可见性，使得`VolatileCachedFactorizer`在没有显示地使用锁的情况下仍然是线程安全的。

###### 程序清单3-13 使用指向不可变容器对象的volatile类型引用以缓存最新的结果 ######

```java
public class VolatileCachedFactorizer implements Servlet {

    private volatile OneValueCache cache = new OneValueCache(null, null);

    public void service(ServletRequest req, ServletResponse resp) {
        BigInteger i = extractFromRequest(req);
        BigInteger[] factors = cache.getFactors(i);
        if (factors * null) {
            factors = factor(i);
            cache = new OneValueCache(i, factors);
        }
        encodeIntoResponse(resp, factors);
    }
}
```

### **安全发布** ###

*要安全的发布一个对象，对象的引用以及对象的状态必须同时对其他线程可见。*

> 1. 一个正确构造的对象可以通过以下方式来安全地发布：
>    - 在静态初始化函数中初始化一个对象引用
>    - 将对象的引用保存到`volatile`类型的域或者`AtomicReferance`对象中
>    - 将对象的引用保存到某个正确构造对象的`final`类型域中
>    - 将对象的引用保存到由一个锁保护的域中
>
> 2. 对象的发布需求取决于它的可变性：
>    - 不可变对象可以通过任意机制来发布
>    - 事实不可变对象必须通过安全方式来发布
>    - 可变对象必须通过安全方式来发布，并且必须是线程安全的或者由某个锁保护起来

静态初始化器由JVM在类的初始化阶段执行。由于JVM内部存在着同步机制，因此通过这种方式初始化的任何对象都可以被安全地发布。例如：`public static Holder holder = new Holder(42)`。