import rclpy  # ROS2 Python 客户端库
from rclpy.node import Node  # 节点基类
from std_msgs.msg import String  # ROS2 内置的 String 消息类型

class MinimalPublisher(Node):
    """最小发布者节点：每 0.5 秒向话题 /chatter 发布一条递增的字符串消息"""

    def __init__(self):
        super().__init__('minimal_publisher')
        # 创建发布者：消息类型 String、话题名称 chatter、队列深度 10（缓存 10 条待发消息）
        self.publisher_ = self.create_publisher(String, 'chatter', 10)
        # 创建一个定时器，每 0.5 秒触发一次 timer_callback
        self.timer = self.create_timer(0.5, self.timer_callback)
        self.i = 0  # 计数器：让每条消息的序号递增

    def timer_callback(self):
        """定时回调：每 0.5 秒被触发，构造一条带序号的字符串并发布"""
        msg = String()
        # f-string 把序号拼进内容：序号让每条消息内容都不同、可追踪
        msg.data = f'Hello World: {self.i}'
        # 消息只有通过 publish 写入话题，订阅者才能收到（数据进入 ROS 图）
        self.publisher_.publish(msg)
        # 打印日志：在终端直观看到发布节奏，确认节点在正常工作
        self.get_logger().info(f'Publishing: "{msg.data}"')
        self.i += 1  # 序号 +1：保证下一条消息序号递增，便于对比观察

def main(args=None):
    rclpy.init(args=args)        # 1. 初始化 rclpy
    node = MinimalPublisher()    # 2. 实例化节点
    try:
        rclpy.spin(node)         # 3. 阻塞运行，持续处理回调
    except KeyboardInterrupt:
        # 按 Ctrl+C（SIGINT）时静默退出，避免打印异常栈
        pass
    finally:                     # 4. 无论正常结束还是被中断，都释放节点并关闭 rclpy
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()