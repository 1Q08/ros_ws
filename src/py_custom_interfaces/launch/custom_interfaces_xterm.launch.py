from launch import LaunchDescription
from launch.actions import ExecuteProcess


def generate_launch_description():
    """弹出 4 个独立 xterm 终端窗口,分别运行:
    —— msg 案例:发布者 + 订阅者
    —— srv 案例:服务端 + 客户端(客户端传参 2 3)
    """
    # 新终端是全新的 shell,需要先加载 ROS 2 环境再运行节点
    # 本机(多播被阻断)必须设置 ROS_AUTOMATIC_DISCOVERY_RANGE=LOCALHOST
    env_setup = ('source /opt/ros/jazzy/setup.bash && '
                 'source $HOME/ros_ws/install/setup.bash && '
                 'export ROS_AUTOMATIC_DISCOVERY_RANGE=LOCALHOST')

    # xterm 用 -hold 保持窗口:即使节点 Ctrl+C 退出,窗口也不会关闭,
    # 方便查看运行日志
    def make_terminal(name, cmd):
        return ExecuteProcess(
            cmd=['xterm', '-hold', '-T', name, '-e', 'bash', '-c',
                 f'{env_setup} && ros2 run custom_interfaces {cmd}'],
            output='screen',
        )

    return LaunchDescription([
        make_terminal('address_book_publisher',
                      'publish_address_book.py'),
        make_terminal('address_book_subscriber',
                      'subscribe_address_book.py'),
        make_terminal('add_two_ints_server',
                      'add_two_ints_server.py'),
        make_terminal('add_two_ints_client',
                      'add_two_ints_client.py 2 3'),
    ])