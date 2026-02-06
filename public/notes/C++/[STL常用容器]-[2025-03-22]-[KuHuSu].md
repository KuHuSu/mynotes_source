### STL 常用容器与算法

首先，stl是什么玩意。全称Standard Template Library，stl是C++的**标准模板库**，提供了一套通用的、高效的、可复用的数据结构和算法。

下图2为所有的容器，以及对应支持的函数接口：

![image-20250417162311624](/notes_images/image-20250417162311624.png)

#### 顺序容器与关联容器

- 数据格式：
  - 顺序容器中的数据只包含数据本身；
  - 关联容器中的元素包含一个键和值，可以通过键来快速访问值；
- 存储方式：
  - 顺序容器的存储空间在内存上是连续的，元素按照其被添加到容器中的顺序来排列；
  - 关联容器中的数据在内存上一般是不连续的，元素分布在不同的存储位置；
- 顺序性：
  - 默认情况下，顺序容器中的元素是无序的，“顺序容器”中的“顺序”指的是内存上连续，而其中的元素通常是按照进入容器的时间排序的，并不会出现严格的由大到小或者由小到大的顺序；
  - 关联容器中的元素是有序的，通常按照键的顺序进行排序；
- 查找效率：
  - 在顺序容器中，由于元素在内存空间上是连续的，所以查找某个元素通常需要遍历整个容器，因此时间复杂度为O(n)；
  - 而在关联容器中，通常使用较为高效的数据结构存储元素(比如红黑树)，因此其时间复杂通常可以达到O(logn)；
- 具体类型：
  - 顺序容器：
    - **vector**
    - **list**
    - **deque**
    - **array**
    - **forward_list**
  - 关联容器
    - **map**
    - **multimap**
    - **set**
    - **multiset**
    - **unordered_map**、**unordered_multimap**、**unordered_set**、**unordered_multiset**

#### **vector**原理

​	vector是C++标准库中的一个序列容器，能够存储类型相同的元素，内存空间在物理上是连续的，允许随机访问容器中的任何元素。vector的底层实现是一个可变长度的数组，其长度可以根据内容的数量动态的增减。当内容数量超出容器容积后，vector会在内存中重新分配一块更大的内存空间，同时将vector中的所有元素复制到新的空间中，删除掉原本的内存空间。

vector作为容器，可以容纳多种元素，因此采用模板函数定义，**简化版vector可以如下定义**：

```c++
template<class T, class ALLocator = std::allocator<T>>
class vector{
public:
    typedef T value_type;  //内部使用的数据类型
    typedef value_type* iterator;//迭代器类型，其实就是类型指针
    typedef const value_type* const_iterator;//常量指针

protected:
    iterator start;
    iterator finish;
    iterator end_of_storage;
};
```

这里用到了3个指针，或者称为迭代器，实际上就是实现vector的关键。

- start：指向数组的头部；

- finish：指向数组中包含元素的尾部；

- end_of_storage：指向数组总长度的尾部；

![image-x3li0r87ql](/notes_images/x3li0r87ql.png)

创建一个vector容器的时候，vector类中的这三个指针相互协调就能完成很多操作：

- size：finish-start即可获得容器长度；
- operator[]：通过指针偏移即可访问指定位置的数据，时间复杂度O(1)；

##### vector类操作

1. 构造函数：

   ```c++
   std::vector<int> v1={1,2,3,4,5};  //拷贝初始化 
   std::vector<int> v2{1,2,3,4,5};	//直接初始化 explicit关键字声明
   std::vector<int> v3(v1.begin(),v1.end());//两个指针，从另外一个vector构造类
   std::vector<int> v4(6,9);//[9,9,9,9,9,9]第一个参数为长度，第二个参数为值
   std::vector<int> v5(v4);//从另外一个类构造
   std::vector<int> v6(7);//指定长度，但是不指定值，默认填充0，字符填充空字符
   ```

2. 析构函数：没啥好说的，自动调用；

3. assign函数：分配函数，将值分配给一个vector对象，相当于给vector初始化：

   ```c++
   std::vector<char> ch1,ch2,ch3;
   ch1.assign(5,'a'); //指定数量以及每个位置的值；
   ch2.assign(v6.begin(),v6.end()); //从另外一个vector对象分配值；
   ch3.assign({'b','b','b','b','b'}); //从一个可迭代列表分配
   ```

4. `get_allocator`()：获取对象的内存std::allocator对象；

##### vector元素访问

1. `at`：获取vector中指定索引位置的元素，<font color='red'>**附带边界检查**</font>。如果访问的位置越界了，会抛出错误；

2. `[]`：获取vector中指定索引位置的元素，<font color='red'>**不带边界检查**</font>，如果访问的位置越界了，不会抛出错误，而会返回一个错误的引用；

   ```c++
   std::vector<int> v1={1,2,3,4,5};
   std::cout << v1[5] <<std::endl;
   std::cout << v1.at(5) <<std::endl;
   ----------------------------------
   0   //使用[]索引，即使超出边界也会返回值，对不对就不敢保证了
   terminate called after throwing an instance of 'std::out_of_range'
     what():  vector::_M_range_check: __n (which is 5) >= this->size() (which is 5) //使用at索引附带边界检查，索引越界会抛出报错
   ```

3. `front`：获取vector的第一个数据；

4. `back`：获取vector的最后一个数据；

5. `data`：直接获取最底层的数组的元素，如果vector不为空返回的是数组首位的地址；

##### vector迭代器

1. `begin/cbegin`：获取vector的首位地址/地址常量。或称为迭代器，因为可以根据首位地址偏移直接获取数据；

2. `end/cend`：获取vector最后一个地址/地址常量

3. `rbegin/crbegin`：获取倒序的第一个元素的地址，也就是原顺序的end返回值；

4. `rend/crend`：获取倒序的最后一个元素的地址，也就是原顺序的begin返回值；

   注意：在正序迭代器中，想要遍历整个vector，只需要在begin的基础上使用++逐步偏移即可。在倒序迭代器中，想要遍历整个vector仍然是使用++运算符，但是由于函数内部将++运算符做了重载，实际上使用++，其逻辑为- -。在使用逻辑上做了统一。

   ```c++
   std::vector<int> v1={1,2,3,4,5};
   std::cout << "正序:" << std::endl;
   for(std::vector<int>::iterator ite = v1.begin();ite!=v1.end();++ite){
   	std::cout << *ite << std::endl;
   }
   std::cout << "倒序:" << std::endl;
   for(std::vector<int>::reverse_iterator ite = v1.rbegin();ite!=v1.rend();++ite){
   	std::cout << *ite << std::endl;
   }
   ```

##### vector容量

1. `empty`：布尔值，判断vector是否为空，如果为空返回true，否则为false；

2. `size`：获取vector中有数据的部分的长度，比如有5个元素就返回5；

3. `max_size`：获取vector可以容纳的最大的长度，受限于系统或者库；

4. `capacity`：获取系统分配给vector的内存大小，如果直接初始化的数组，其大小等于size，当新增数据后，vector再扩容；

5. `reserve`：修改系统分配给vector的内存大小，vector的自动扩容过程是不断开辟新内存，复制所有元素的过程，该过程会消耗不必要的算力。因此如果已知数组大小，可以先分配一个内存，再使用，省去不断开辟内存空间的消耗；

6. `shrink_to_fit`：如果系统分配给vector的内存大于数组实际使用的内存，可以使用该函数将多余的未使用的部分回收；

   ```c++
   std::vector<int> v1={1,2,3,4,5};
   if(!v1.empty()) std::cout << "v1 is not empty" << std::endl; //判断是否为空
   std::cout << v1.max_size() << std::endl; //获取由于系统或库限制，数组最多能存储的数据数量
   std::cout << v1.size() << std::endl;//获取数组实际使用的内存大小
   std::cout << v1.capacity() << std::endl;//获取系统分配给数组的内存大小
   v1.reserve(10); //将系统分配的内存大小修改为10
   std::cout << "After resever :" << std::endl;
   std::cout << v1.size() << std::endl; //修改内存大小后，实际使用的内存不变
   std::cout << v1.capacity() << std::endl; //系统分配的内存大小变为10
   v1.shrink_to_fit(); //调用函数，将多出来的5个内存单元回收
   std::cout << "After shrink to fit :" << std::endl;
   std::cout << v1.size() << std::endl;//不变
   std::cout << v1.capacity() << std::endl;//系统分配内存大小还原为5
   ```

   ```bash
   v1 is not empty
   4611686018427387903
   5
   5
   After resever :
   5
   10
   After shrink to fit :
   5
   5
   ```

   ##### vector元素修改

   1. `clear`：清空数组；
   2. `insert`：在指定**位置**插入一个或者多个元素；
   3. `emplace`：在指定**位置**前插入<font color='red'>**一个**</font>元素，该操作可以在数组上直接进行，不需要使用辅助变量
   4. `erease`：去除指定**位置**，或者指定范围内的元素；
   5. `push_back`：在数组的最后增加一个元素；
   6. `emplace_back`：同上；
   7. `pop_back`：从数组中取出最后一个元素；
   8. `resize`：变化数组的大小。注意，这里的变换大小与`reserve`原理不一样，`reserve`修改的是数组占用的内存空间，而`resize`修改的是数组中实际占用的内存空间。如果修改后的长度小于原长度，多余部分直接删除；修改后大于原长度，多余部分设置为默认值；
   9. `swap`：交换两个数组；

   注意：上述所说的**位置**指的都是指针，即迭代器，而不是python中那种由数字表征的索引。

#### deque原理

在上述的vector结构中，如果向vector中插入一个元素，其操作过程为将所选位置后边的数据全部复制，并向后移动一位，再将插入的元素放入指定位置。这样的操作对于头部插入，其必然要移动整个数组，数组长度越长，消耗的时间成本就越大。

相比于vector，deque这种数据结构其头部插入的时间消耗就较少，其 底层数据存储方式是连续的，但是是一种**伪装的内存连续**。deque是一种双端的队列，其可以实现在双端(**特指端头**)的快速插入和删除，其内部结构较复杂：

- 维护一个“中控器”，即一段连续的内存地址，该中控器中存储数据段的首地址；
- “中控器”中的每个地址指向一段**连续的，定长的存储单元**，其长度一般由标准库指定；
- 在每个存储单元中，连续的存放具体的数据

也就是说，**deque相当于是数据域为array对象的链表**，在此基础上，增加了一个中控器，来调控每个子array的地址；每个子array在堆上的地址空间不一定是连续的，其顺序由中控器维护。所以deque的存储地址，实际上并不是连续的，为了使用起来像是连续的，就需要设计特殊的迭代器以及重载一些遍历的操作符。

为了模拟出连续存储的假象，其内部的迭代器一般包含以下成员：

- T* first：指向子array单元的头部指针；
- T* last：指向子array单元的头部指针；
- T* cur：指向当前访问单元格的指针；
- T** map：中控器，指向保存子array列表指针的指针；

<img src="/notes_images/image-20250421201940677.png" alt="image-20250421201940677" style="zoom:50%;" />

##### deque成员

deque在功能上与前面的vector差不多，只是其实现原理上更为复杂一些，需要注意：

- `push_front/emplace_front`：这两个函数是vector所不具备的，向队列头部插入数据；

- `insert/emplace`：同vector中的函数，这两个函数也是向数组中插入元素，当插入位置在头部时，相当于调用上一个函数。但是当插入位置在中间时，deque会比较插入位置两端，选择移动长度较短的一段，复制，移动；
- deque的遍历，虽然外表看起来其遍历方法与vector一致，但是实现过程则需要从中控器开始遍历；
- 相比于vector，deque的首部插入非常快，其他位置的插入速度也有所改善，但是位置越靠近中心，两者的差距越小。为实现这些优化 ，deque的内部操作更加复杂，所以虽然两者都支持随机访问，但是vector速度更胜一筹。因此，**在不需要频繁插入的场景中，优先考虑vector**；
- deque也有特定的使用场景，比如某餐饮店的外卖订单，因为涉及到头部的频繁移除与尾部的频繁插入，这就非常契合deque的特点。

```c++
deque<int> de(10,1);
de.push_back(4);
// get first elem
cout << de[0] << " ";
cout << de.at(0) << " ";
cout << *de.begin() << " ";
cout << de.front() << " " << endl;
// get last elem
cout << de[de.size()-1] << " ";
cout << de.at(de.size()-1) << " ";
cout << *(de.end()-1) << " ";
cout << de.back() << " " << endl;
// insert elem to first pos
de.push_front(4);
cout << &de[0] << "  " << &de[1] <<endl;
de.insert(de.begin(),7);
de.emplace(de.begin(), 8);
de.emplace_front(9);
// insert elem to last pos
de.push_back(6);
cout << *(de.end()-1) << "  " << *(de.end()-2) <<endl;
de.insert(de.end(),9);
de.emplace(de.end(),9);
de.emplace_back(3);
for(auto n:de){
cout << n << " ";
};
cout << endl;
// pop bord elem
de.pop_front();
de.pop_back();
// erase
de.erase(de.begin(),de.begin()+3);
for(auto n:de){
cout << n << " ";
};
cout << endl;
```

```bash
1 1 1 1 
4 4 4 4
0x273268c  0x2732280 //这里就能看出如果在头部新增元素，其实际内存地址反而在当前内存空间的后边
6  4
9 8 7 4 1 1 1 1 1 1 1 1 1 1 4 6 9 9 3
1 1 1 1 1 1 1 1 1 1 4 6 9 9
```

#### array原理

array是一种固定长度的顺序存储容器，其在定义时需要指定长度，一旦指定，长度不可修改。其功能与C++内置的基本数组一致，即使用`type  arg[size]`来定义的数组。**两种数组的数据都是保存在内存上**。使用[]定义的数组是C++内置的功能，其只能实现简单的下标访问，其他操作，比如长度，遍历等都需要使用标准库中的其他函数来获取。array相当于在此基础上，封装了一些常用的数组功能，同样是保存定长的数据，array类中包含了长度，迭代器，以及有边界保护的索引等。

##### array成员

array成员函数并不包含vector中涉及长度变化的函数(**因为array是固定长度**)，因此不具备插入、删除、长度变化等功能，除此以外的size,data,empty,begin,end等都完全一致。所以没什么好说的。

#### string原理

在std源代码中的string由以下代码定义：

```c++
template<typename _CharT, typename _Traits = char_traits<_CharT>>
	using basic_string = std::basic_string<_CharT, _Traits, polymorphic_allocator<_CharT>>;
using string    = basic_string<char>;
```

所以实际上直接使用的string其原名应该是`basic_string<char>`，这个basic_string在源码中的定义主要涉及到3个成员：_

- __str*：字符存储指针，实际上就是string的数据存储位置，即其底层就是内置的char连续存储区；
- _size：字符串的长度，指的是字符串占用的长度；
- _capacity：字符串占用的内存长度，含义同vector；
- -1：特殊字符

可以看到其实际上可以看作是一个限定只能存char的vector容器，因此vector支持的函数在string中都支持，完全可以视作一个`vector<char>`来看待。但是因为其只能存char，也有一些特殊的操作。

##### string成员

- `front/back`：获取第一个字符/最后一个字符
- `c_str`：string属于是C++在内置基础C风格字符串的基础上封装的字符串，如果需要使用到C风格的字符串，则需要使用该函数转换；C风格的字符串其尾部会填充一个\0用于标志结束位，但是在string中则没有这个标志位；
- `append`：功能与python中对list的操作一致；
- `+=`：组合两个字符串；
- `replace`：替换掉string中的某个，或者某串子字符串，该操作非常灵活，支持使用迭代器定位，也支持使用pos加计数选中。被替换的字符串的长度与用于替换的字符串长度可以不一致；
- `copy`：拷贝现有的string对象；
- `find/rfind`：寻找**子字符串**首次出现/最后一次出现，其返回的是子字符在字符串中的位置，类型为`string::size_type`；
- `find_first_of/find_first_not_of`：查找**某个字符**在字符串中首次出现，或者首次非指定字符的位置，针对单个字符，但是其参数传入可以是字符串，在查找的时候，会依次去源字符串中查找给定字符串中的某一位字符；
- `find_last_of/find_last_not_of`：同上，只不过查找的是最后一次出现；
- `substr`：获取子字符串，给定截断的起始位置以及截断的长度，即可从源字符串中获取子字符串；