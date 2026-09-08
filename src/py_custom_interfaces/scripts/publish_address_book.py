#!/usr/bin/env python3
# =====================================================================
# publish_address_book.py —— msg 案例:发布者
# 每秒向话题 /address_book 发布一条 AddressBook 消息。
# 运行:ros2 run custom_interfaces publish_address_book.py
# =====================================================================

import rclpy
from rclpy.node import Node

# 由 msg/AddressBook.msg 生成的 Python 消息类
from custom_interfaces.msg import AddressBook


class AddressBookPublisher(Node):
    """发布者节点"""

    def __init__(self):
        super().__init__("address_book_publisher")  # 节点名

        # 创建发布者:类型 AddressBook,话题名 address_book,队列 10
        self.pub = self.create_publisher(AddressBook, "address_book", 10)

        # 每 1 秒触发一次回调
        self.timer = self.create_timer(1.0, self.publish_msg)

    def publish_msg(self):
        """定时回调:构造并发布消息"""
        msg = AddressBook()
        msg.first_name = "John"
        msg.last_name = "Doe"
        msg.phone_number = "1234567890"
        msg.phone_type = AddressBook.PHONE_TYPE_MOBILE  # 用接口内常量

        self.get_logger().info(
            f"Publishing Contact\nFirst:{msg.first_name}  Last:{msg.last_name}")
        self.pub.publish(msg)


def main(args=None):
    rclpy.init(args=args)
    node = AddressBookPublisher()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()