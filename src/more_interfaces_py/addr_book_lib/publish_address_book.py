#!/usr/bin/env python3
# =====================================================================
# more_interfaces_py/publish_address_book.py —— 发布者节点(库模块)
# 这个文件是 Python 库模块,可以被其他代码 import 后重用。
# 安装方式:CMake 中调用 ament_python_install_package(more_interfaces_py)
#          将其安装到 site-packages,供 import 使用。
# 同时也提供 main() 函数,可被入口脚本调用。
# =====================================================================

import rclpy
from rclpy.node import Node

# 由 msg/AddressBook.msg 自动生成的消息类
# rosidl 生成的消息代码以项目名(CMake project name)命名空间:
#   more_interfaces_py.msg.AddressBook
# 与 Python 库模块目录名(addr_book_lib)是两回事,互不冲突
from more_interfaces_py.msg import AddressBook


class AddressBookPublisher(Node):
    """发布者节点类:每 1 秒向 /address_book 发布一条联系人消息"""

    def __init__(self):
        # 节点名(与 C++ 版保持一致)
        super().__init__("address_book_publisher")

        # 创建发布者:消息类型 AddressBook,话题名 "address_book",队列深度 10
        self.address_book_publisher_ = self.create_publisher(
            AddressBook, "address_book", 10)

        # 创建 1 秒周期定时器,每秒调用一次 publish_msg 回调
        self.timer_ = self.create_timer(1.0, self.publish_msg)

    def publish_msg(self):
        """定时器回调:构造消息并发布"""
        msg = AddressBook()

        # 填充消息字段(值对应教程预期输出)
        msg.first_name = "John"           # 名字
        msg.last_name = "Doe"             # 姓氏
        msg.phone_number = "1234567890"   # 电话
        # 使用消息内自带的常量 PHONE_TYPE_MOBILE(=2)
        # 体现"用接口包内常量"的用法(与 C++ 版一致)
        msg.phone_type = AddressBook.PHONE_TYPE_MOBILE

        # 终端打印,方便确认发布内容
        self.get_logger().info(
            f"Publishing Contact\nFirst:{msg.first_name}  Last:{msg.last_name}")

        # 真正把消息发布到话题上
        self.address_book_publisher_.publish(msg)


def main(args=None):
    """可被入口脚本直接调用的主函数"""
    rclpy.init(args=args)  # 初始化 ROS2

    node = AddressBookPublisher()
    try:
        rclpy.spin(node)   # 进入事件循环(阻塞,Ctrl+C 退出)
    except KeyboardInterrupt:
        pass  # 收到 Ctrl+C 时正常退出
    finally:
        node.destroy_node()  # 销毁节点,释放资源
        rclpy.shutdown()     # 关闭 ROS2


if __name__ == "__main__":
    main()