#!/usr/bin/env python3
# 服务端（Service）最小示例：提供 /add_two_ints 服务，收到两个整数请求后返回它们的和。
# 用法：ros2 run py_srvcli service  （先启动服务端，再启动客户端调用它）
from example_interfaces.srv import AddTwoInts  # 服务的请求/响应消息类型
import rclpy  # ROS2 Python 客户端库
from rclpy.node import Node  # 节点基类

class MinimalService(Node):
    """服务端节点：注册一个加法服务并处理请求。"""
    def __init__(self):
        super().__init__('minimal_service')  # 节点名，可用 ros2 node list 看到
        # 创建服务：绑定服务类型 AddTwoInts、服务名 add_two_ints，并指定处理回调
        self.srv = self.create_service(AddTwoInts, 'add_two_ints', self.add_two_ints_callback)

    def add_two_ints_callback(self, request, response):
        """收到请求时被调用：计算并填充响应。
        request  / response 分别是 AddTwoInts 的 Request / Response 对象。"""
        response.sum = request.a + request.b  # 把两个整数相加，写入响应的 sum 字段
        # 打印收到的请求内容（%d 对应 request.a 和 request.b）
        self.get_logger().info('Incoming request\na: %d b: %d' % (request.a, request.b))

        return response  # 把填充好的响应返回给客户端

def main(args=None):
    rclpy.init(args=args)  # 初始化 rclpy

    minimal_service = MinimalService()  # 创建服务端节点（注册服务）

    # 进入事件循环：阻塞式 spin，一直监听并处理客户端请求
    rclpy.spin(minimal_service)

    rclpy.shutdown()  # 关闭 rclpy（一般 Ctrl+C 结束后走到这里）

if __name__ == '__main__':
    main()  # 直接运行本文件时执行 main()