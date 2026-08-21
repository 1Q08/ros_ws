#!/usr/bin/env python3
# 服务客户端（Client）最小示例：调用 /add_two_ints 服务，计算两个整数之和
# 用法：ros2 run py_srvcli client 2 3   （把命令行里的 2 和 3 传进去相加）
import sys  # 用于读取命令行参数（sys.argv）
from example_interfaces.srv import AddTwoInts  # 服务的请求/响应消息类型
import rclpy  # ROS2 Python 客户端库
from rclpy.node import Node  # 节点基类

class MinimalClientAsync(Node):
    """异步服务客户端节点"""
    def __init__(self):
        super().__init__('minimal_client_async')  # 节点名，可用 ros2 node list 看到
        # 创建服务客户端：绑定服务类型 AddTwoInts 和服务名 add_two_ints
        self.cli = self.create_client(AddTwoInts, 'add_two_ints')
        # 等待服务端上线：每 1 秒检查一次，没等到就一直等
        while not self.cli.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('service not available, waiting again...')
        # 构造一个请求对象，稍后填充 a 和 b 两个整数
        self.req = AddTwoInts.Request()

    def send_request(self):
        """把命令行参数装进请求，并异步发出"""
        # sys.argv[1] / sys.argv[2] 即运行时的第 1、2 个参数（如 "2" "3"），转成 int
        self.req.a = int(sys.argv[1])
        self.req.b = int(sys.argv[2])
        # 异步发起调用：不阻塞等待，返回一个 future，之后轮询它是否完成
        self.future = self.cli.call_async(self.req)

def main(args=None):
    rclpy.init(args=args)  # 初始化 rclpy
    minimal_client = MinimalClientAsync()  # 创建客户端节点（内部已等待服务就绪）
    minimal_client.send_request()  # 发送请求，拿到 future
    # 主循环：spin_once 处理一次回调，然后检查 future 是否已完成
    while rclpy.ok():
        rclpy.spin_once(minimal_client)
        if minimal_client.future.done():  # 服务端已返回结果
            try:
                response = minimal_client.future.result()  # 取出响应
            except Exception as e:
                # 调用失败（如服务端报错/异常）
                minimal_client.get_logger().info(
                    'Service call failed %r' % (e,))
            else:
                # 调用成功，打印结果：a + b = sum
                minimal_client.get_logger().info(
                    'Result of add_two_ints: for %d + %d = %d' %
                    (minimal_client.req.a, minimal_client.req.b, response.sum))
            break  # 拿到结果后退出循环

    minimal_client.destroy_node()  # 销毁节点
    rclpy.shutdown()  # 关闭 rclpy

if __name__ == '__main__':
    main()  # 直接运行本文件时执行 main()