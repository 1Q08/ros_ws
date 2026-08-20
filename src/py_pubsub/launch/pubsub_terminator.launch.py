from launch import LaunchDescription
from launch.actions import ExecuteProcess


def generate_launch_description():
    """启动后弹出两个独立 terminator 窗口，分别运行发布者与订阅者"""
    # 新终端是全新的 shell，需要先加载 ROS 2 环境再运行节点
    env_setup = ('source /opt/ros/jazzy/setup.bash && '
                 'source $HOME/ros_ws/install/setup.bash')

    # 关键点：-u / --no-dbus 禁用 terminator 的 DBus 单实例机制
    # 否则第二个 terminator 会尝试连接已运行的实例并静默退出
    # 导致第二个节点的命令根本不会执行
    #
    # terminator 没有 xterm 的 -hold 选项，命令退出后窗口会关闭
    # 因此用 '; exec bash' 在节点结束后再开一个 shell，方便查看日志
    def make_cmd(node):
        return ['terminator', '-u', '-T', node, '-x', 'bash', '-c',
                f'{env_setup} && ros2 run py_pubsub {node}; exec bash']

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
