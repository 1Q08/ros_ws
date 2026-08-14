# 导入 rclpy 客户端库（ROS2 的 Python 接口）
import rclpy
# 导入 rclpy.node，用于创建节点基类 Node
import rclpy.node


class MinimalParam(rclpy.node.Node):
    """最小参数节点：演示 ROS2 参数的声明、读取与设置"""

    def __init__(self):
        # 调用父类构造函数，注册节点名称为 'minimal_param_node'
        super().__init__('minimal_param_node')

        # 定时器周期：2 秒（即每 2 秒触发一次回调）
        timer_period = 2  # seconds

        # 创建一个定时器，周期性地调用 self.timer_callback
        self.timer = self.create_timer(timer_period, self.timer_callback)

        # 声明一个参数 'my_parameter'，默认值为字符串 'world'
        # 注意：使用参数前必须先 declare_parameter 声明
        self.declare_parameter('my_parameter', 'world')

    def timer_callback(self):
        # 读取参数 'my_parameter' 的值，并取其中的字符串字段
        # get_parameter() 返回 Parameter 对象，get_parameter_value() 拿到值，
        # .string_value 取出字符串内容
        my_param = self.get_parameter('my_parameter').get_parameter_value().string_value

        # 打印日志：向 'world' 问好（参数值就是问候对象）
        self.get_logger().info('Hello %s!' % my_param)

        # 构造一个新的 Parameter 对象，把 'my_parameter' 重新设为 'world'
        # （此示例中是"自我重置"，实际应用里常把参数改为运行时的新值）
        my_new_param = rclpy.parameter.Parameter(
            'my_parameter',            # 参数名
            rclpy.Parameter.Type.STRING,  # 参数类型：字符串
            'world'                    # 参数值
        )

        # set_parameters 接收一个参数列表，因此先包成列表
        all_new_parameters = [my_new_param]

        # 一次性写入全部参数（这里只有 1 个）
        self.set_parameters(all_new_parameters)


def main():
    # 1. 初始化 rclpy（每个 ROS2 Python 进程必须调用一次）
    rclpy.init()
    # 2. 创建节点实例
    node = MinimalParam()
    # 3. 阻塞运行节点，持续处理定时器回调
    rclpy.spin(node)


if __name__ == '__main__':
    main()