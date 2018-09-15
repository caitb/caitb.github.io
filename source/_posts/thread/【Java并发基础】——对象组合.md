---
title: 【Java并发基础】——对象组合
categories:
  - Java
      - 多线程
        - 并发基础
tags:
  - 多线程
---



本章将介绍一些组合模式，这些模式能够使一个类更容易成为线程安全的，并且在维护这些类时不会无意破坏类的线程安全性保证。

<!-- more -->

### **设计线程安全的类** ###

> 在设计线程安全类的过程中，需要包含以下三个基本要素：
>
> - 找出构成对象状态的所有变量
> - 找出约束状态变量的不变性条件
> - 建立对象状态的并发访问管理策略

要分析对象的状态，首先从对象的域开始。如果对象中所有的域都是基本类型的变量，那么这些域将构成对象的全部状态，如程序清单4-1中的`Counter`只有一个域`value`，因此这个域就是`Counter`的全部状态；如果在对象的域中引用了其他对象，那么该对象的状态将包含被引用对象的域，例如，`LinkedList`的状态就包括该链表中所有节点对象的状态。

<div style="font-size: 12px; text-align: center;">程序清单4-1 使用Java监视器模式的线程安全计数器</div>

```java
@ThreadSafe
public class Counter {

    private long value = 0;

    public synchronized long getValue() {
        return value;
    }

    public synchronized long increment() {
        if (value == Long.MAX_VALUE) {
            throw new IllegalStateException("counter overflow");
        }
        return ++value;
    }
}
```

同步策略定义了如何在不违背对象*不变条件*或*后验条件*的情况下对其状态的访问操作进行协同。同步策略规定了如何将不变性、线程封闭与加锁机制等结合起来以维护线程的安全性，并且还规定了哪些变量由哪些锁来保护。

> 对象与变量都有一个状态空间，即所有可能的取值。
>
> *不可变条件*是指，用于判断状态是有效的还是无效的。
>
> *后验条件*是指，用于判断状态迁移是否是有效的。
>
> ------
>
> 例如程序清单4-1：
>
> `Counter`的*不可变条件*是**Long.MIN_VALUE<=value<=Long.MAX_VALUE**
>
> `Counter`的*后验条件*是`value`的值在修改后必须**Long.MIN_VALUE<=value<=Long.MAX_VALUE**

##### 收集同步需求 #####

对象与变量都有一个状态空间，<span style="color:red;">在许多类中都定义了一些**不可变条件**，用于判断状态是有效的还是无效的。同样，在操作中还会包含一些**后验条件**来判断状态迁移是否是有效的</span>。

由于不变性条件以及后验条件在状态及状态转换上施加了各种约束，因此就需要额外的同步与封装。如果某些状态是无效的，那么必须对底层的状态变量进行封装，否则客户代码可能会使对象处于无效状态。如果在操作中存在无效的状态转换，那么该操作必须是原子的。

在类中也可以包含<span style="color:red;">同时约束多个状态变量的不变性条件</span>，如程序清单4-10。类似于这种包含多个变量的*不变性条件*将带来原子性需求：这些相关的变量必须在单个原子操作中进行读取或更新。

<div style="font-size: 12px; text-align: center;">程序清单4-10 NumberRange类并不足以保护它的不变性条件（不要这么做）</div>

```java
public class NumberRange {
    
    // 不变性条件：lower <= upper
    private final AtomicInteger lower = new AtomicInteger(0);
    private final AtomicInteger upper = new AtomicInteger(0);

    public void setLower(int i) {
        // 注意——不安全的"先检查后执行"
        if (i > upper.get()) {
            throw new IllegalArgumentException("can't set lower to " + i + " > upper");
        }
        lower.set(i);
    }

    public void setUpper(int i) {
        // 注意——不安全的"先检查后执行"
        if (i < lower.get()) {
            throw new IllegalArgumentException("can't set upper to " + i + " < lower");
        }
        upper.set(i);
    }
    
    public boolean isInRange(int i) {
        return (i >= lower.get() && i <= upper.get());
    }
}
```

因此只有为`NumberRange`的`setLower`、`setUpper`、`isInRange`方法都加锁(必须是同一个锁)，`NumberRange`才是线程安全的。

<span style="color:red;">如果不了解对象的不变性条件与后验条件，那么就不能确保线程安全性。要满足状态变量的有效值或状态转换上的各种约束条件，就需要借助于原子性与封装性。</span>

##### 依赖状态的操作 #####

在某个操作中包含有基于状态的先验条件，那么这个操作就称为*依赖状态的操作*。

### **实例封闭** ###

如果某对象不是线程安全的，那么可以通过多种技术使其在多线程程序中安全地使用。比如：你可以确保该对象只能由单个线程访问(*线程封闭*)，或者通过一个锁来保护该对象的所有访问。

> 封装提供了一种*实例封闭机制*(被封闭对象一定不能超出它们既定的作用域)：
>
> - 对象可以封闭在类的一个实例(例如作为类的一个私有成员)
> - 对象可以封闭在某个作用域内(例如作为一个局部变量)
> - 对象可以封闭在线程内(例如在某个线程中将对象从一个方法传递到另一个方法，而不是在多个线程之间共享该对象)
>
> 通过将封闭机制与合适的加锁策略结合起来，就可以确保以线程安全的方式来使用非线程安全的对象。

程序清单4-2中的PersonSet说明了如何通过封闭与加锁等机制使一个类成为线程安全的(即使这个类的状态变量并不是线程安全的)。

<div style="font-size: 12px; text-align: center;">程序清单4-2 通过封闭机制来确保线程安全</div>

```java
/**
 * PersonSet的状态由HashSet来管理，虽然HashSet并非线程安全，
 * 但HashSet被封闭在PersonSet中，并且HashSet由PersonSet的内置锁来保护，
 * 因此PersonSet是线程安全的，即mySet可以安全地使用。
 *
 * 当然，如果Person类是可变的，那么在访问从PersonSet中获得的
 * Person对象时，还需要额外的同步。
 */
@ThreadSafe
public class PersonSet {
    
    private final Set<Person> mySet = new HashSet<>();
    
    public synchronized void addPerson(Person p) {
        mySet.add(p);
    }
    
    public synchronized boolean containsPerson(Person p) {
        return mySet.contains(p);
    }
    
}
```

在Java平台的类库中还有很多线程封闭的实例，例如Collections.synchronizedList及其类似的方法，可以使非线程安全的容器在多线程程序中安全地使用。其原理是通过“装饰器”模式将容器类封装在一个同步的包装器对象中，而包装器能将接口中的每个方法都实现为同步方法，并将调用请求转发到底层的容器对象上。只要包装器对象拥有对底层容器对象的唯一引用(即把底层容器对象封闭在包装器中)，那么它就是线程安全的。

<div style="font-size: 12px; text-align: center;">Collections的部分源码</div>

```java
    public static <T> List<T> synchronizedList(List<T> list) {
        return (list instanceof RandomAccess ?
                new SynchronizedRandomAccessList<>(list) :
                new SynchronizedList<>(list));
    }

    ...

    //Collections的内部类
    static class SynchronizedRandomAccessList<E>
        extends SynchronizedList<E>
        implements RandomAccess {

        SynchronizedRandomAccessList(List<E> list) {
            super(list);
        }
        
        ...
    }
    
    //Collections的内部类
    static class SynchronizedList<E>
        extends SynchronizedCollection<E>
        implements List<E> {
        private static final long serialVersionUID = -7754090372962971524L;

        final List<E> list;

        SynchronizedList(List<E> list) {
            super(list);
            this.list = list;
        }

        public boolean equals(Object o) {
            if (this == o)
                return true;
            //这里使用同步，并将请求转发到底层容器
            synchronized (mutex) {return list.equals(o);}
        }
        
        public void add(int index, E element) {
            //这里使用同步，并将请求转发到底层容器
            synchronized (mutex) {list.add(index, element);}
        }

        public List<E> subList(int fromIndex, int toIndex) {
            //这里使用同步，并将请求转发到底层容器
            synchronized (mutex) {
                return new SynchronizedList<>(list.subList(fromIndex, toIndex),
                                            mutex);
            }
        }
        
        ...

    }
```

##### Java监视器模式 #####

从线程封闭原则及其逻辑推论可以得出<span style="color:red;">**Java监视器模式：**把对象的所有可变状态都封装起来，并由对象自己的内置锁来保护</span>。

在程序清单4-1的`Counter`中给出了这种模式的一个典型示例。

*Java监视器模式*仅仅是一种编写代码的约定，对于任何一种锁对象，只要自始至终都使用该锁对象，都可以用来保护对象的状态。程序清单4-3给出了如何使用私有锁来保护状态。

<div style="font-size: 12px; text-align: center;">程序清单4-3 通过一个私有锁来保护状态</div>

```java
public class PrivateLock {
    
    private final Object myLock = new Object();
    private Widget widget;
    
    void someMethod() {
        synchronized (myLock) {
            // 访问或修改Widget的状态
        }
    }
}
```

### **线程安全性委托** ###

当从头开始构建一个类，或者将多个非线程安全的类组合为一个类时，Java监视器模式是非常有用的。但是，如果类中各个组件都已经是线程安全的，我们是否需要增加一个额外的线程安全层？答案是“视情况而定”。在某些情况下，通过多个线程安全类组合而成的类是线程安全的（如程序清单4-7和程序清单4-9所示），而在某些情况下，这仅仅是一个好的开端（如程序清单4-10）。

##### 单个状态变量 #####

*如果某个类只包含一个状态变量，且该状态变量本身是线程安全的，则可以将线程安全性委托给这个状态变量*，即该类是线程安全的。

<div style="font-size: 12px; text-align: center;">程序清单4-7 将线程安全性委托给ConcurrentHashMap</div>

```java
@ThreadSafe
public class DelegatingVehicleTracker {
    
    private final ConcurrentMap<String, Point> locations;
    private final Map<String, Point> unmodifiableMap;

    public DelegatingVehicleTracker(Map<String, Point> points) {
        this.locations = new ConcurrentHashMap<>(points);
        this.unmodifiableMap = Collections.unmodifiableMap(locations);
    }

    public Map<String, Point> getLocations() {
        return unmodifiableMap;
    }
    
    public Point getLocation(String id) {
        return locations.get(id);
    }
    
    public void setLocation(String id, int x, int y) {
        if (locations.replace(id, new Point(x, y)) == null) {
            throw new IllegalArgumentException("invalid vehicle name: " + id);
        }
    }
}

@ThreadSafe
@Immutable
public class Point {

    public final int x, y;

    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }
}
```

##### 多个独立的状态变量 #####

<span style="color:red">如果某个类包含有多个线程安全的状态变量，且这些状态变量彼此独立，则可以将线程安全性委托给这些状态变量</span>，即该类是线程安全的。

<div style="font-size: 12px; text-align: center;">程序清单4-9 将线程安全性委托给多个状态变量</div>

```java
@ThreadSafe
public class VisualComponent {
    
    private final List<KeyListener> keyListeners = new CopyOnWriteArrayList<>();
    private final List<MouseListener> mouseListeners = new CopyOnWriteArrayList<>();
    
    public void addKeyListener(KeyListener listener) {
        keyListeners.add(listener);
    }
    
    public void addMouseListener(MouseListener listener) {
        mouseListeners.add(listener);
    }
    
    public void removeKeyListener(KeyListener listener) {
        keyListeners.remove(listener);
    }
    
    public void removeMouseListener(MouseListener listener) {
        mouseListeners.remove(listener);
    }
}
```

##### 多个状态变量之间存在着某些不变性条件 #####

*如果某个类包含有多个状态变量，且<u>*这些状态变量之间存在着不变性条件*</u>，则不能将线程安全性委托给这些状态变量，即使这些状态变量本身都是线程安全的，*即该类不是线程安全的。

程序清单4-10中的`NumberRange`使用了两个`AtomicInteger`来管理状态，并且存在一个*不变性条件*：**lower <= upper**。

`NumberRange`不是线程安全的，没有维持对下界和上界进行约束的不变性条件。假设取值范围为(0, 10)，如果一个线程调用`setLower(5)`，而另一个线程调用`setUpper(4)`，那么在一些错误的执行时序中，这两个调用都将通过检查，并且都能设置成功。结果得到的取值范围就是(5, 4)，那么这是一个无效的状态。因此，虽然`AtomicInteger`是线程安全的，但经过组合得到的类却不是线程安全的。由于状态变量`lower`和`upper`不是彼此独立的，因此`NumberRange`不能将线程安全性委托给它的线程安全状态变量。

`NumberRange`可以通过加锁机制来维护不变性条件以确保其线程安全性，例如使用同一个锁来保护`lower`和`upper`。此外，它还必须避免发布`lower`和`upper`，从而防止客户代码破坏其不变性条件。

<div style="font-size: 12px; text-align: center;">程序清单4-10 NumberRange类并不足以保护它的不变性条件（不要这么做）</div>

```java
@NotThreadSafe
public class NumberRange {

    // 不变性条件：lower <= upper
    private final AtomicInteger lower = new AtomicInteger(0);
    private final AtomicInteger upper = new AtomicInteger(0);

    public void setLower(int i) {
        // 注意——不安全的"先检查后执行"
        if (i > upper.get()) {
            throw new IllegalArgumentException("can't set lower to " + i + " > upper");
        }
        lower.set(i);
    }

    public void setUpper(int i) {
        // 注意——不安全的"先检查后执行"
        if (i < lower.get()) {
            throw new IllegalArgumentException("can't set upper to " + i + " < lower");
        }
        upper.set(i);
    }

    public boolean isInRange(int i) {
        return (i >= lower.get() && i <= upper.get());
    }
}
```

还有一种情况是，如果某个类含有复合操作，例如程序清单4-10中的`NumberRange`，那么紧靠委托不足以实现线程安全性。在这种情况下，这个类必须提供自己的加锁机制以保证这些复合操作都是原子操作，除非整个复合操作都可以委托给状态变量。

##### 发布底层的状态变量 #####

> 如果一个状态变量是线程安全的，并且没有任何不变性条件来约束它的值，在变量的操作上也不存在任何不允许的状态转换，那么就可以安全地发布这个变量。

### **在现有的线程安全类中添加功能** ###

有时候，某个现有的线程安全类能支持我们需要的所有操作，但更多时候，现有的类只能支持大部分的操作，此时就需要在不破坏线程安全性的情况下添加一个新的操作。

例如，假设需要一个线程安全的链表，它需要提供一个原子的“若没有则添加”的操作。

一种方法是修改原始的类，但这通常无法做到，因为你可能无法访问或修改该类的源代码。

另一种方法是扩展这个类，假定在设计这个类时考虑了扩展性。如程序清单4-13中的`BetterVector`对`Vector`进行了扩展。

```java
@ThreadSafe
public class BetterVector<E> extends Vector<E> {
    
    public synchronized boolean putIfAbsent(E x) {
        boolean absent = !contains(x);
        if (absent) {
            add(x);
        }
        return absent;
    }
}
```

##### 客户端加锁 #####

第三种方法是扩展类的功能，但不是扩展类本身，而是将扩展代码放入一个“辅助类”中。如程序清单4-14中的`ListHelper`，但这种方式不是线程安全的。必须使`List`在实现客户端加锁或外部加锁时使用同一个锁，如程序清单4-15中的`ListHelper`。

<div style="font-size: 12px; text-align: center;">程序清单4-14 非线程安全的“若没有则添加”（不要这么做）</div>

```java
@NotThreadSafe
public class ListHelper<E> {

    public List<E> list = Collections.synchronizedList(new ArrayList<>());
    
    ...

    // List使用的锁并不是ListHelper上的锁
    public synchronized boolean putIfAbsent(E x) {
        boolean absent = !list.contains(x);
        if (absent) {
            list.add(x);
        }
        return absent;
    }
}
```

<div style="font-size: 12px; text-align: center;">程序清单4-15 通过客户端加锁来实现“如没有则添加”</div>

```java
@ThreadSafe
public class ListHelper<E> {

    public List<E> list = Collections.synchronizedList(new ArrayList<>());

    ...
    
    // ListHelper使用的锁与List使用的是同一个锁
    public boolean putIfAbsent(E x) {
        synchronized (list) {
            boolean absent = !list.contains(x);
            if (absent) {
                list.add(x);
            }
            return absent;
        }
    }
}
```

##### 组合 #####

更好的方法是**组合**。如程序清单4-16中的`ImprovedList`

```java
@ThreadSafe
public class ImprovedList<T> implements List<T> {
    
    private final List<T> list;

    public ImprovedList(List<T> list) {
        this.list = list;
    }
    
    public synchronized boolean putIfAbsent(T x) {
        boolean contains = list.contains(x);
        if (!contains) {
            list.add(x);
        }
        return contains;
    }
    
    public synchronized void clear() {
        list.clear();
    }
    
    // ... 按照类似的方式委托List的其他方法
}
```

