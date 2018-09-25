---
title: 脚本测试
tags:
  - 脚本
---


```java
    //添加拦截器
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        //接口签名认证拦截器，该签名认证比较简单，实际项目中可以使用Json Web Token或其他更好的方式替代。
        if (!"dev".equals(env)) { //开发环境忽略签名认证
            registry.addInterceptor(new HandlerInterceptorAdapter() {
                @Override
                public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
                    //验证签名
                    boolean pass = validateSign(request);
                    if (pass) {
                        return true;
                    } else {
                        logger.warn("签名认证失败，请求接口：{}，请求IP：{}，请求参数：{}",
                                request.getRequestURI(), getIpAddress(request), JSON.toJSONString(request.getParameterMap()));

                        Result result = new Result();
                        result.setCode(ResultCode.UNAUTHORIZED).setMessage("签名认证失败");
                        responseResult(response, result);
                        return false;
                    }
                }
            });
        }
    }
```

```html
<script src="https://unpkg.com/vue/dist/vue.js"></script>
<script src="https://unpkg.com/vue-router/dist/vue-router.js"></script>

<div id="app">
  <h1>Hello App!</h1>
  <p>
    <!-- 使用 router-link 组件来导航. -->
    <!-- 通过传入 `to` 属性指定链接. -->
    <!-- <router-link> 默认会被渲染成一个 `<a>` 标签 -->
    <router-link to="/foo">Go to Foo</router-link>
    <router-link to="/bar">Go to Bar</router-link>
  </p>
  <!-- 路由出口 -->
  <!-- 路由匹配到的组件将渲染在这里 -->
  <router-view></router-view>
</div>
```

```sql
-- 创建秒杀库存表
CREATE TABLE seckill (
	seckill_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '商品库存id',
	NAME VARCHAR (120) NOT NULL COMMENT '商品名称',
	number INT NOT NULL COMMENT '库存数量',
	start_time TIMESTAMP NOT NULL COMMENT '秒杀开启时间',
	end_time TIMESTAMP NOT NULL COMMENT '秒杀结束时间',
	create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
	PRIMARY KEY (seckill_id),
	KEY idx_start_time (start_time),
	KEY idx_end_time (end_time),
	KEY idx_create_time (create_time)
) ENGINE = INNODB AUTO_INCREMENT = 1000 DEFAULT CHARSET = utf8 COMMENT = '秒杀库存表';

-- 初始化数据
INSERT INTO seckill (
	NAME,
	number,
	start_time,
	end_time
)
VALUES
	(
		'1000元秒杀iphone6',
		100,
		'2018-06-06 00:00:00',
		'2018-08-10 23:59:59'
	),
	(
		'1000元秒杀ipad2',
		100,
		'2018-07-07 00:00:00',
		'2018-08-12 23:59:59'
	),
	(
		'1000元秒杀小米4',
		100,
		'2018-08-08 00:00:00',
		'2018-08-14 23:59:59'
	),
	(
		'1000元秒杀红米note',
		100,
		'2018-07-09 00:00:00',
		'2018-08-15 23:59:59'
	);
```

```javascript
// 0. 如果使用模块化机制编程，导入Vue和VueRouter，要调用 Vue.use(VueRouter)

// 1. 定义 (路由) 组件。
// 可以从其他文件 import 进来
const Foo = { template: '<div>foo</div>' }
const Bar = { template: '<div>bar</div>' }

// 2. 定义路由
// 每个路由应该映射一个组件。 其中"component" 可以是
// 通过 Vue.extend() 创建的组件构造器，
// 或者，只是一个组件配置对象。
// 我们晚点再讨论嵌套路由。
const routes = [
  { path: '/foo', component: Foo },
  { path: '/bar', component: Bar }
]

// 3. 创建 router 实例，然后传 `routes` 配置
// 你还可以传别的配置参数, 不过先这么简单着吧。
const router = new VueRouter({
  routes // (缩写) 相当于 routes: routes
})

// 4. 创建和挂载根实例。
// 记得要通过 router 配置参数注入路由，
// 从而让整个应用都有路由功能
const app = new Vue({
  router
}).$mount('#app')

// 现在，应用已经启动了！
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
  <script type="text/javascript">
      // Say hello world until the user starts questioning
      // the meaningfulness of their existence.
      function helloWorld(world) {
          for (var i = 42; --i >= 0;) {
              alert('Hello ' + String(world));
          }
      }
  </script>
  <style>
      p { color: pink }
      b { color: blue }
      u { color: "umber" }
  </style>
</body>
</html>
```

```bash
$ sudo mkdir folder
```

# 2.2.2 横切技术

## 2.2.2 横切技术

### 2.2.2 横切技术

#### 2.2.2 横切技术

##### 2.2.2 横切技术

###### 2.2.2 横切技术





# 技能清单

1、Java基础知识扎实，对设计模式、算法、多线程、高并发有一定的理解并在实际工作中有运用

2、熟悉http/https等常用通讯协议、对常用加密、签名算法有过实际开发经验，熟悉网络信息安全。

3、精通J2EE相关技术，精通springmvc、springboot、mybatis、spring等开源技术框架并深入了解其原理

4、掌握Postgre数据库的开发、配置、管理、调试，熟练掌握SQL查询优化

---

2、熟悉 Ajax 开发，熟练掌握JSP、Servlet、XML、JDBC 等 J2EE 关键技术；

3、熟悉 Spring + Hibernate(或Mybatis) 框架；

4、熟悉 TOMCAT、WebLogic 等服务软件；

5、熟悉 MySQL, Oracle等数据库大型数据库；

6、熟悉 jquery,extjs等脚本框架。

---

3、熟练使用多线程、IO、集合、反射等，掌握常用的设计模式； 4、熟练使用spring, springMVC, springBoot ,mybatis等开源框架（框架提供的特性及其实现原理）； 5、熟练使用关系型数据库（mysql, postgresSQL），非关系型数据库（redis, mongodb）等数据库； 6、熟练使用分布式框架dubbo、zookeeper、spring-cloud开发经验者优先，深刻理解OOD，OOP相关理念； 7、熟练使用版本管理工具git，了解项目管理工具maven或gradle； 8、有大规模高并发访问的Web应用架构设计、及相关高性能调优的开发经验者优先； 9、熟悉Internet基本协议（如TCP/IP, HTTP等）内容及相关应用，熟悉Linux/Unix环境开发。

---

 1、 三年以上工作经验  

2、 熟练掌握Java基础，熟悉开发  

3、 了解springMVC,mybatis，redis，dubbo等基础框架  

4、 熟悉 js，ajax，xml，jquery等前端技术；  5、熟练掌握mysql等数据库开发，具有一定的调优能力。

---

2.精通 JAVA 和 SQL 及常用数据结构与算法, 熟练掌握 Servlet/JSP/HTML/JavaScript/JDBC/XML/HTTP/RESTful； 

3.精通 J2EE 常用框架，Spring/Hibernate/iBatis/CXF/MySQL/Dubbo； 

4.熟悉 Linux、Tomcat 常用命令和配置； 

---

\2. 熟悉掌握Java基本库的使用，了解JDBC，多线程，通信相关知识及相关库。

\3. 熟悉常用Java EE开发相关技术，熟练使用Spring, Spring MVC，Hibernate、MyBatis/iBatis或其他开发框架,熟练使用redis等缓存技术，熟练使用html+javaScript+css前端技术。

\4. 必须熟练使用MySQL数据库，熟悉SQL优化方法，有集群经验更佳。

\5. 熟悉Linux日常工作环境，熟练掌握常用命令和调优监控手段，有Linux自动化部署经验更佳

\6. 对系统的可靠性设计和异常设计有较深了解，精通事务，异常系等逻辑模块的编码。

---

2、Java基础扎实，了解面向对象和设计模式； 

3、熟悉MVC构架模式，精通Spring，ibatis等常用框架；

 4、熟练掌握Tomcat,Apache,Nginx等WEB应用服务器，熟练使用Linux 

5、熟练至少一种关系型数据库使用, 掌握redis、Mongo等NOSQL数据库使用及应用开发经验者优

---

1、3年以上实际JAVA开发工作经验； 

2、熟练使用Java、、Html等开发语言；

3、熟悉J2EE架构,使用MyBatis,Hibernate,Spring,Struts2等框架开发项目； 

4、熟练SqlServer/mysql数据库，能熟练使用SQL语言和优化。 

5、熟悉nginx,apache服务器搭建和配置,熟悉web开发流程规范； 

6、了解分布式系统的相关技术或者微服务技术，如zookeeper/redis/dubbo/Spring cloud



