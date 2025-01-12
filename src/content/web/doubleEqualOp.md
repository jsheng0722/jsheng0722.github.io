---
title: "=="操作符
author: Jihui
date: June 11, 2024
tags: [操作符]
---

# ==
## 面试题
```javascript
if (a == 1 && a == 2 && a == 3){
    console.log('不可能的等式成立了')
}
```
1. 两端存在NaN, 返回false
2. undefined和null只有与自身比较, 或者互相比较时, 才会返回true, 和其他原始类型比较返回false
3. 两端类型相同, 比较值
4. 两端都是原始类型, 转换成数字重新比较
5. 一端是原始类型, 一端是对象类型, 把对象转换成原始类型后重新比较
> 对象如何转原始类型？
1. 如过对象拥有[Symbol.toPrimitive]方法, 调用该方法. 若该方法能得到原始值, 使用该原始值; 若得不到原始值, 抛出异常
```javascript
const a = {
    [Symbol.toPrimitive](){
        console.log('to primitive');
        return 123;
    }
}
```
2. 调用对象的valueOf方法, 若该方法能得到原始值, 使用该原始值; 若得不到原始值, 进入下一步
3. 调用对象的toString方法, 若该方法能得到原始值, 使用该原始值; 若得不到原始值, 抛出异常
```javascript
const a = {
    valueOf(){
        console.log("value of");
        return {};
    },
    toString(){
        console.log("to string");
        return 123;
    }
}
```

**答案:**
```javascript
const a = {
    count: 1,
    valueOf(){
        console.log("count: " + this.count);
        return this.count++;
    }
    }
}
if (a == 1 && a == 2 && a == 3){
    console.log('不可能的等式成立了')
}
```