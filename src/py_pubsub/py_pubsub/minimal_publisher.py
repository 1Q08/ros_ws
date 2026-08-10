import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class MinimalPublisher(Node):
    """最小发布者节点：每 0.5 秒向话题 /chatter 发布一条递增的字符串消息。"""

    def __init__(self):
        super().__init__('minimal_publisher')
        # 创建发布者：String 类型、话题 chatter、队列深度 10（缓存 10 条待发消息）
        self.publisher_ = self.create_publisher(String, 'chatter', 10)
        # 每 0.5 秒触发一次 timer_callback
        self.timer = self.create_timer(0.5, self.timer_callback)
        self.i = 0  # 计数器：让每条消息的序号递增

    def timer_callback(self):
        """定时回调：构造消息、发布，并打印日志。"""
        msg = String()
        msg.data = f'Hello World: {self.i}'            # 填充消息内容
        self.publisher_.publish(msg)                   # 发布
        self.get_logger().info(f'Publishing: "{msg.data}"')
        self.i += 1

def main(args=None):
    rclpy.init(args=args)        # 1. 初始化 rclpy
    node = MinimalPublisher()    # 2. 实例化节点
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