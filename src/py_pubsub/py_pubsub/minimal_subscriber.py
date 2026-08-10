import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class MinimalSubscriber(Node):
    """最小订阅者节点：订阅话题 /chatter，每收到一条消息就打印出来。"""

    def __init__(self):
        super().__init__('minimal_subscriber')
        # 创建订阅者：String 类型、话题 chatter、队列深度 10，
        # 收到消息时回调 listener_callback
        self.subscription = self.create_subscription(
            String, 'chatter', self.listener_callback, 10)

    def listener_callback(self, msg):
        """消息回调：把收到的消息内容打印到日志。"""
        self.get_logger().info(f'I heard: "{msg.data}"')

def main(args=None):
    rclpy.init(args=args)        # 1. 初始化 rclpy
    node = MinimalSubscriber()   # 2. 实例化节点
    try:
        rclpy.spin(node)         # 3. 阻塞运行，持续处理回调
    except KeyboardInterrupt:
        # 按 Ctrl+C（SIGINT）时静默退出，避免打印异常栈
        pass
    finally:
        # 4. 无论正常结束还是被中断，都释放节点并关闭 rclpy
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()