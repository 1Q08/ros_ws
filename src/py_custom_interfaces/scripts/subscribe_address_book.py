#!/usr/bin/env python3
# =====================================================================
# subscribe_address_book.py —— msg 案例:订阅者
# 订阅话题 /address_book,收到就打印消息内容。
# 运行:ros2 run custom_interfaces subscribe_address_book.py
# =====================================================================

import rclpy
from rclpy.node import Node

# 由 msg/AddressBook.msg 生成的 Python 消息类(与发布者导入一致)
from custom_interfaces.msg import AddressBook


class AddressBookSubscriber(Node):
    """订阅者节点"""

    def __init__(self):
        super().__init__("address_book_subscriber")  # 节点名

        # 创建订阅:类型 AddressBook,话题名 address_book,队列 10
        # 收到消息就调用 listener_callback 回调
        self.sub = self.create_subscription(
            AddressBook, "address_book", self.listener_callback, 10)

    def listener_callback(self, msg):
        """收到消息的回调:打印联系人信息"""
        self.get_logger().info(
            f"I heard:\n"
            f"  First:{msg.first_name}  Last:{msg.last_name}\n"
            f"  Phone:{msg.phone_number}  Type:{msg.phone_type}")


def main(args=None):
    rclpy.init(args=args)
    node = AddressBookSubscriber()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()