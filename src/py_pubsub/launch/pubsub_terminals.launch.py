from launch import LaunchDescription
from launch.actions import ExecuteProcess


def generate_launch_description():
    """启动后弹出两个独立终端窗口，分别运行发布者与订阅者。"""
    # 新终端是全新的 shell，需要先加载 ROS 2 环境再运行节点
    env_setup = ('source /opt/ros/jazzy/setup.bash && '
                 'source $HOME/ros_ws/install/setup.bash')

    publisher_terminal = ExecuteProcess(
        cmd=['xterm', '-hold', '-e', 'bash', '-c',
             f'{env_setup} && ros2 run py_pubsub minimal_publisher'],
        output='screen',
    )
    subscriber_terminal = ExecuteProcess(
        cmd=['xterm', '-hold', '-e', 'bash', '-c',
             f'{env_setup} && ros2 run py_pubsub minimal_subscriber'],
        output='screen',
    )

    return LaunchDescription([
        publisher_terminal,
        subscriber_terminal,
    ])
