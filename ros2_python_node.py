import rclpy
from rclpy.node import Node

def main():
    rclpy.init()  # 初始化工作，分配资源
    node = Node("python_node")  # 创建一个名为 "python_node" 的节点
    node.get_logger().info("Hello, ROS2 from Python!")  # 打印日志信息
    node.get_logger().warn("Hello, ROS2 from Python!")  # 打印警告信息
    node.get_logger().error("Hello, ROS2 from Python!")  # 打印错误信息
    rclpy.spin(node)  # 进入循环，等待回调函数的触发
    rclpy.shutdown()  # 清理工作，释放资源

if __name__ == "__main__":
    main()