from launch import LaunchDescription
from launch.actions import ExecuteProcess


def generate_launch_description():
    """启动后弹出两个独立 xterm 终端窗口，分别运行发布者与订阅者；
    发布者的发送消息、订阅者的接收消息会同时打印到
    xterm 终端窗口和 ROS 2 自动生成的 ~/.ros/log/<时间戳>/launch.log"""
    # 新终端是全新的 shell，需要先加载 ROS 2 环境再运行节点
    env_setup = ('source /opt/ros/jazzy/setup.bash && '
                 'source $HOME/ros_ws/install/setup.bash')

    # 日志文件：写入 ROS 2 launch 运行时自动生成的 launch.log（每次运行
    # 在 ~/.ros/log/<时间戳>/ 下新建一份），用 latest 符号链接访问当前会话
    # 追加写入（-a）。用 $HOME 而不是绝对路径，bash 会在运行时自动展开
    log_file = '$HOME/.ros/log/latest/launch.log'

    # 关键点：节点日志默认输出到 stderr，
    # 先用 2>&1 把 stderr 合并进 stdout，再交给 tee：
    #   tee 一份输出到 xterm 终端，另一份追加写入 launch.log
    # xterm 用 -hold 保持窗口，方便查看运行日志
    def make_cmd(node):
        return ['xterm', '-hold', '-e', 'bash', '-c',
                f'{env_setup} && '
                f'mkdir -p $HOME/.ros/log && '
                f'ros2 run py_pubsub {node} 2>&1 | tee -a {log_file}']

    publisher_terminal = ExecuteProcess(
        cmd=make_cmd('minimal_publisher'),
        output='screen',
    )
    subscriber_terminal = ExecuteProcess(
        cmd=make_cmd('minimal_subscriber'),
        output='screen',
    )

    return LaunchDescription([
        publisher_terminal,
        subscriber_terminal,
    ])
