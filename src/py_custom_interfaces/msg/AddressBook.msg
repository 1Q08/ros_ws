# ============================================================
# AddressBook.msg —— 自定义消息接口定义(msg)
# rosidl 会根据本文件生成 Python/C++ 等语言的消息类。
# 语法:字段(类型 名字) + 可选常量(类型 名字=值)
# ============================================================

# 常量:电话类型(属于消息"类",代码中用类名引用)
uint8 PHONE_TYPE_HOME=0      # 家庭电话
uint8 PHONE_TYPE_WORK=1      # 工作电话
uint8 PHONE_TYPE_MOBILE=2    # 手机

# 字段:每条消息的具体数据
string first_name            # 名字
string last_name             # 姓氏
string phone_number          # 电话号码
uint8 phone_type             # 电话类型(PHONE_TYPE_* 之一)