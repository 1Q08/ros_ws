import rclpy
from rclpy.node import Node

def main():
    rclpy.init()  # 初始化工作，分配资源
    node = Node("python_node")
    node.get_logger().info("Hello, ROS2 from Python!")
    node.get_logger().warn("Hello, ROS2 from Python!")
    node.get_logger().error("Hello, ROS2 from Python!")
    rclpy.spin(node)
    rclpy.shutdown()  # 清理工作，释放资源

if __name__ == "__main__":
    main()