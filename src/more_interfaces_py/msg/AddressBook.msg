# ============================================================
# AddressBook.msg —— 自定义消息接口定义
# 本文件是"接口定义"的源头,rosidl 生成器会根据它
# 自动生成 C++ / Python 等语言的代码。
# 语法规则:每行一条 "字段名 类型" 或 "常量名 = 值"
# ============================================================

# 常量定义:电话类型(常量属于消息类,可在代码中用)
uint8 PHONE_TYPE_HOME=0      # 家庭电话
uint8 PHONE_TYPE_WORK=1      # 工作电话
uint8 PHONE_TYPE_MOBILE=2    # 手机

# 字段定义:联系人信息
string first_name            # 名字
string last_name             # 姓氏
string phone_number          # 电话号码
uint8 phone_type             # 电话类型(PHONE_TYPE_* 常量之一)