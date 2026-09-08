#!/usr/bin/env python3
# =====================================================================
# add_two_ints_client.py —— srv 案例:客户端
# 向服务 /add_two_ints 发请求(a、b 从命令行读),打印 sum。
# 运行:ros2 run custom_interfaces add_two_ints_client.py 2 3
# =====================================================================

import sys

import rclpy
from rclpy.node import Node

# 由 srv/AddTwoInts.srv 生成的 Python 服务类型(与服务端导入一致)
from custom_interfaces.srv import AddTwoInts


class AddTwoIntsClient(Node):
    """客户端节点"""

    def __init__(self):
        super().__init__("add_two_ints_client")  # 节点名

        # 创建客户端:类型 AddTwoInts,服务名 add_two_ints(须与服务端一致)
        self.cli = self.create_client(AddTwoInts, "add_two_ints")

        # 等待服务端上线(每 1 秒探测一次)
        while not self.cli.wait_for_service(timeout_sec=1.0):
            self.get_logger().info("service not available, waiting again...")

        self.req = AddTwoInts.Request()  # 预构造一个请求对象

    def send_request(self, a, b):
        """填请求字段并异步发送"""
        self.req.a = a
        self.req.b = b
        self.future = self.cli.call_async(self.req)  # 异步调用,返回 future
        return self.future


def main(args=None):
    rclpy.init(args=args)

    client = AddTwoIntsClient()

    # 从命令行读 a、b(默认 2 和 3)
    a = int(sys.argv[1]) if len(sys.argv) > 1 else 2
    b = int(sys.argv[2]) if len(sys.argv) > 2 else 3

    future = client.send_request(a, b)

    # 轮询等待服务端返回结果
    while rclpy.ok():
        rclpy.spin_once(client)          # 处理一次回调(接收响应)
        if future.done():                # 服务端已回结果?
            try:
                response = future.result()
                client.get_logger().info(
                    f"Result of add_two_ints: {a} + {b} = {response.sum}")
            except Exception as e:
                client.get_logger().error(f"Service call failed: {e}")
            break

    client.destroy_node()
    rclpy.shutdown()


if __name__ == "__main__":
    main()