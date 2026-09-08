#!/usr/bin/env python3
# =====================================================================
# add_two_ints_server.py —— srv 案例:服务端
# 提供服务 /add_two_ints,收到 a、b 返回 sum = a + b。
# 运行:ros2 run custom_interfaces add_two_ints_server.py
# =====================================================================

import rclpy
from rclpy.node import Node

# 由 srv/AddTwoInts.srv 生成的 Python 服务类型
from custom_interfaces.srv import AddTwoInts


class AddTwoIntsServer(Node):
    """服务端节点"""

    def __init__(self):
        super().__init__("add_two_ints_server")  # 节点名

        # 创建服务:类型 AddTwoInts,服务名 add_two_ints,回调 add_two_ints_callback
        self.srv = self.create_service(
            AddTwoInts, "add_two_ints", self.add_two_ints_callback)

    def add_two_ints_callback(self, request, response):
        """收到请求:计算 sum 并返回"""
        response.sum = request.a + request.b
        self.get_logger().info(
            f"Incoming request\na: {request.a}  b: {request.b}")
        return response


def main(args=None):
    rclpy.init(args=args)
    node = AddTwoIntsServer()
    try:
        rclpy.spin(node)  # 阻塞监听服务请求
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()