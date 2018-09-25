---
title: Java 线程线程池初探
tags:
  - 线程池
  - 转发
---

> <span style="color:rgb(61, 170, 214)">作者：</span>疼蛋之丸
>
> <span style="color:rgb(61, 170, 214)">来源：</span>https://www.jianshu.com/p/5d5198b434a2

### 一、线程池初探

所谓线程池，就是将多个线程放在一个池子里面（所谓池化技术），然后需要线程的时候不是创建一个线程，而是从线程池里面获取一个可用的线程，然后执行我们的任务。线程池的关键在于它为我们管理了多个线程，我们不需要关心如何创建线程，我们只需要关系我们的核心业务，然后需要线程来执行任务的时候从线程池中获取线程。任务执行完之后线程不会被销毁，而是会被重新放到池子里面，等待机会去执行任务。

我们为什么需要线程池呢？首先一点是线程池为我们提高了一种简易的多线程编程方案，我们不需要投入太多的精力去管理多个线程，线程池会自动帮我们管理好，它知道什么时候该做什么事情，我们只要在需要的时候去获取就可以了。其次，我们使用线程池很大程度上归咎于创建和销毁线程的代价是非常昂贵的，甚至我们创建和销毁线程的资源要比我们实际执行的任务所花费的时间还要长，这显然是不科学也是不合理的，而且如果没有一个合理的管理者，可能会出现创建了过多的线程的情况，也就是在JVM中存活的线程过多，而存活着的线程也是需要销毁资源的，另外一点，过多的线程可能会造成线程过度切换的尴尬境地。

对线程池有了一个初步的认识之后，我们来看看如何使用线程池。

（1）创建一个线程池

```java
ExecutorService executorService = Executors.newFixedThreadPool(1);
```

（2）提交任务

```java
executorService.submit(() -> System.out.println("run"));
Future<String> stringFuture = executorService.submit(() -> "run");
```

（3）创建一个调度线程池

```java
ScheduledExecutorService scheduledExecutorService = Executors.newScheduledThreadPool(1);
```

（4）提交一个周期性执行的任务

```java
scheduledExecutorService
        .scheduleAtFixedRate(() -> System.out.println("schedule"), 0, 1, TimeUnit.SECONDS);
```

（5）shutdown

```java
        executorService.shutdownNow();
        scheduledExecutorService.shutdownNow();
```

可以发现使用线程池非常简单，只需要极少的代码就可以创建出我们需要的线程池，然后将我们的任务提交到线程池中去。我们只需要在结束之时记得关闭线程池就可以了。本文的重点并非在于如何使用线程池，而是试图剖析线程池的实现，比如一个调度线程池是怎么实现的？是靠什么实现的？为什么能这样实现等等问题。

### 二、Java线程池实现架构

Java中与线程池相关的类有下面一些：

- Executor
- ExecutorService
- ScheduledExecutorService
- ThreadPoolExecutor
- ScheduledThreadPoolExecutor
- Executors

通过上面一节中的使用示例，可以发现Executors类是一个创建线程池的有用的类，事实上，Executors类的角色也就是创建线程池，它是一个工厂类，可以产生不同类型的线程池，而Executor是线程池的鼻祖类，它有两个子类是ExecutorService和ScheduledExecutorService，而ThreadPoolExecutor和ScheduledThreadPoolExecutor则是真正的线程池，我们的任务将被这两个类交由其所管理者的线程池运行，可以发现，ScheduledThreadPoolExecutor是一个集大成者类，下面我们可以看看它的类关系图：

![img](https://ws3.sinaimg.cn/large/006tNbRwgy1fve2haufbbj30jg0bvmz6.jpg)

<div style="text-align:center;font-size:12px;">ScheduledThreadPoolExecutor的类关系图</div>

ScheduledThreadPoolExecutor继承了ThreadPoolExecutor，ThreadPoolExecutor实现了一般的线程池，没有调度功能，而ScheduledThreadPoolExecutor继承了ThreadPoolExecutor的实现，然后增加了调度功能。

最为原始的Executor只有一个方法execute，它接受一个Runnable类型的参数，意思是使用线程池来执行这个Runnable，可以发现Executor不提供有返回值的任务。ExecutorService继承了Executor，并且极大的增强了Executor的功能，不仅支持有返回值的任务执行，而且还有很多十分有用的方法来为你提供服务，下面展示了ExecutorService提供的方法：

![img](https://ws1.sinaimg.cn/large/006tNbRwgy1fve2nxawjpj30tu0e2n0n.jpg)

<div style="text-align:center;font-size:12px;">ExecutorService提供的方法</div>

ScheduledExecutorService继承了ExecutorService，并且增加了特有的调度（schedule）功能。关于Executor、ExecutorService和ScheduledExecutorService的关系，可以见下图：

![img](https://ws3.sinaimg.cn/large/006tNbRwgy1fve2pyci8fj30hg0hz0vn.jpg)

<div style="text-align:center;font-size:12px;">Executor、ExecutorService和ScheduledExecutorService的关系</div>

总结一下，经过我们的调研，可以发现其实对于我们编写多线程代码来说，最为核心的是Executors类，根据我们是需要ExecutorService类型的线程池还是ScheduledExecutorService类型的线程池调用相应的工厂方法就可以了，而ExecutorService的实现表现在ThreadPoolExecutor上，ScheduledExecutorService的实现则表现在ScheduledThreadPoolExecutor上，下文将分别剖析这两者，尝试弄清楚线程池的原理。

### 三、ThreadPoolExecutor解析

上文中描述了Java中线程池相关的架构，了解了这些内容其实我们就可以使用java的线程池为我们工作了，使用其提供的线程池我们可以很方便的写出高质量的多线程代码，本节将分析ThreadPoolExecutor的实现，来探索线程池的运行原理。下面的图片展示了ThreadPoolExecutor的类图：

![img](https://ws4.sinaimg.cn/large/006tNbRwgy1fve2rkk2btj30j40iiad3.jpg)

<div style="text-align:center;font-size:12px;">ThreadPoolExecutor的类图</div>

下面是几个比较关键的类成员：

```java
  private final BlockingQueue<Runnable> workQueue;  // 任务队列，我们的任务会添加到该队列里面，线程将从该队列获取任务来执行

  private final HashSet<Worker> workers = new HashSet<Worker>();//任务的执行值集合，来消费workQueue里面的任务

  private volatile ThreadFactory threadFactory;//线程工厂

  private volatile RejectedExecutionHandler handler;//拒绝策略，默认会抛出异异常，还要其他几种拒绝策略如下：

   //1、CallerRunsPolicy：在调用者线程里面运行该任务
   //2、DiscardPolicy：丢弃任务
   //3、DiscardOldestPolicy：丢弃workQueue的头部任务

  private volatile int corePoolSize;//最下保活work数量

  private volatile int maximumPoolSize;//work上限
```

我们尝试执行submit方法，下面是执行的关键路径，总结起来就是：如果Worker数量还没达到上限则继续创建，否则提交任务到workQueue，然后让worker来调度运行任务。

```java
//step 1: <ExecutorService>
Future<?> submit(Runnable task);  

//step 2:<AbstractExecutorService>
public Future<?> submit(Runnable task) {
    if (task == null) throw new NullPointerException();
    RunnableFuture<Void> ftask = newTaskFor(task, null);
    execute(ftask);
    return ftask;
}

//step 3:<Executor>
void execute(Runnable command);

//step 4:<ThreadPoolExecutor>
public void execute(Runnable command) {
    if (command == null)
        throw new NullPointerException();
    /*
     * Proceed in 3 steps:
     *
     * 1. If fewer than corePoolSize threads are running, try to
     * start a new thread with the given command as its first
     * task.  The call to addWorker atomically checks runState and
     * workerCount, and so prevents false alarms that would add
     * threads when it shouldn't, by returning false.
     *
     * 2. If a task can be successfully queued, then we still need
     * to double-check whether we should have added a thread
     * (because existing ones died since last checking) or that
     * the pool shut down since entry into this method. So we
     * recheck state and if necessary roll back the enqueuing if
     * stopped, or start a new thread if there are none.
     *
     * 3. If we cannot queue task, then we try to add a new
     * thread.  If it fails, we know we are shut down or saturated
     * and so reject the task.
     */
    int c = ctl.get();
    if (workerCountOf(c) < corePoolSize) {
        if (addWorker(command, true))
            return;
        c = ctl.get();
    }
    if (isRunning(c) && workQueue.offer(command)) { //提交我们的额任务到workQueue
        int recheck = ctl.get();
        if (! isRunning(recheck) && remove(command))
            reject(command);
        else if (workerCountOf(recheck) == 0)
            addWorker(null, false);
    }
    else if (!addWorker(command, false)) //使用maximumPoolSize作为边界
        reject(command); //还不行？拒绝提交的任务
}

//step 5:<ThreadPoolExecutor>
private boolean addWorker(Runnable firstTask, boolean core) 


//step 6:<ThreadPoolExecutor>
w = new Worker(firstTask); //包装任务
final Thread t = w.thread; //获取线程（包含任务）
workers.add(w);   // 任务被放到works中
t.start(); //执行任务
```

上面的流程是高度概括的，实际情况远比这复杂得多，但是我们关心的是怎么打通整个流程，所以这样分析问题是没有太大的问题的。观察上面的流程，我们发现其实关键的地方在于Worker，如果弄明白它是如何工作的，那么我们也就大概明白了线程池是怎么工作的了。下面分析一下Worker类。

![img](https://ws2.sinaimg.cn/large/006tNbRwgy1fve2vitg1zj30hs099tad.jpg)

<div style="text-align:center;font-size:12px;">worker类图</div>

上面的图片展示了Worker的类关系图，关键在于他实现了Runnable接口，所以问题的关键就在于run方法上。在这之前，我们来看一下Worker类里面的关键成员：

```java
 final Thread thread; 

 Runnable firstTask; //我们提交的任务，可能被立刻执行，也可能被放到队列里面
```

thread是Worker的工作线程，上面的分析我们也发现了在addWorker中会获取worker里面的thread然后start，也就是这个线程的执行，而Worker实现了Runnable接口，所以在构造thread的时候Worker将自己传递给了构造函数，thread.start执行的其实就是Worker的run方法。下面是run方法的内容：

```java
    public void run() {
        runWorker(this);
    }

    final void runWorker(Worker w) {
    Thread wt = Thread.currentThread();
    Runnable task = w.firstTask;
    w.firstTask = null;
    w.unlock(); // allow interrupts
    boolean completedAbruptly = true;
    try {
        while (task != null || (task = getTask()) != null) {
            w.lock();
            // If pool is stopping, ensure thread is interrupted;
            // if not, ensure thread is not interrupted.  This
            // requires a recheck in second case to deal with
            // shutdownNow race while clearing interrupt
            if ((runStateAtLeast(ctl.get(), STOP) ||
                 (Thread.interrupted() &&
                  runStateAtLeast(ctl.get(), STOP))) &&
                !wt.isInterrupted())
                wt.interrupt();
            try {
                beforeExecute(wt, task);
                Throwable thrown = null;
                try {
                    task.run();
                } catch (RuntimeException x) {
                    thrown = x; throw x;
                } catch (Error x) {
                    thrown = x; throw x;
                } catch (Throwable x) {
                    thrown = x; throw new Error(x);
                } finally {
                    afterExecute(task, thrown);
                }
            } finally {
                task = null;
                w.completedTasks++;
                w.unlock();
            }
        }
        completedAbruptly = false;
    } finally {
        processWorkerExit(w, completedAbruptly);
    }
}
```

我们来分析一下runWorker这个方法，这就是整个线程池的核心。首先获取到了我们刚提交的任务firstTask，然后会循环从workQueue里面获取任务来执行，获取任务的方法如下：

```java
 private Runnable getTask() {
        boolean timedOut = false; // Did the last poll() time out?

        for (;;) {
            int c = ctl.get();
            int rs = runStateOf(c);

            // Check if queue empty only if necessary.
            if (rs >= SHUTDOWN && (rs >= STOP || workQueue.isEmpty())) {
                decrementWorkerCount();
                return null;
            }

            int wc = workerCountOf(c);

            // Are workers subject to culling?
            boolean timed = allowCoreThreadTimeOut || wc > corePoolSize;

            if ((wc > maximumPoolSize || (timed && timedOut))
                && (wc > 1 || workQueue.isEmpty())) {
                if (compareAndDecrementWorkerCount(c))
                    return null;
                continue;
            }

            try {
                Runnable r = timed ?
                    workQueue.poll(keepAliveTime, TimeUnit.NANOSECONDS) :
                    workQueue.take();
                if (r != null)
                    return r;
                timedOut = true;
            } catch (InterruptedException retry) {
                timedOut = false;
            }
        }
    }
```

其实核心也就一句：

```java
 Runnable r = timed ?
            workQueue.poll(keepAliveTime, TimeUnit.NANOSECONDS) :
            workQueue.take();
```

我们再回头看一下execute，其实我们上面只走了一条逻辑，在execute的时候，我们的worker的数量还没有到达我们设定的corePoolSize的时候，会走上面我们分析的逻辑，而如果达到了我们设定的阈值之后，execute中会尝试去提交任务，如果提交成功了就结束，否则会拒绝任务的提交。我们上面还提到一个成员：maximumPoolSize，其实线程池的最大的Worker数量应该是maximumPoolSize，但是我们上面的分析是corePoolSize，这是因为我们的private boolean addWorker(Runnable firstTask, boolean core)的参数core的值来控制的，core为true则使用corePoolSize来设定边界，否则使用maximumPoolSize来设定边界。直观的解释一下，当线程池里面的Worker数量还没有到corePoolSize，那么新添加的任务会伴随着产生一个新的worker，如果Worker的数量达到了corePoolSize，那么就将任务存放在阻塞队列中等待Worker来获取执行，如果没有办法再向阻塞队列放任务了，那么这个时候maximumPoolSize就变得有用了，新的任务将会伴随着产生一个新的Worker，如果线程池里面的Worker已经达到了maximumPoolSize，那么接下来提交的任务只能被拒绝策略拒绝了。可以参考下面的描述来理解：

```basic
 * When a new task is submitted in method {@link #execute(Runnable)},
 * and fewer than corePoolSize threads are running, a new thread is
 * created to handle the request, even if other worker threads are
 * idle.  If there are more than corePoolSize but less than
 * maximumPoolSize threads running, a new thread will be created only
 * if the queue is full.  By setting corePoolSize and maximumPoolSize
 * the same, you create a fixed-size thread pool. By setting
 * maximumPoolSize to an essentially unbounded value such as {@code
 * Integer.MAX_VALUE}, you allow the pool to accommodate an arbitrary
 * number of concurrent tasks. Most typically, core and maximum pool
 * sizes are set only upon construction, but they may also be changed
 * dynamically using {@link #setCorePoolSize} and {@link
 * #setMaximumPoolSize}.
```

在此需要说明一点，有一个重要的成员：keepAliveTime，当线程池里面的线程数量超过corePoolSize了，那么超出的线程将会在空闲keepAliveTime之后被terminated。可以参考下面的文档：

```basic
 * If the pool currently has more than corePoolSize threads,
 * excess threads will be terminated if they have been idle for more
 * than the keepAliveTime (see {@link #getKeepAliveTime(TimeUnit)}).
```



**更多精彩见下节：《Java线程池深入分析》**