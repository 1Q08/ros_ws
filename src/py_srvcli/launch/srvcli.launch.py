from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    client_node = Node(
        package='py_srvcli',
        executable='client',
        output='both',
        arguments=['2', '3']  # 传入命令行参数 2 和 3
    )
    service_node = Node(
        package='py_srvcli',
        executable='service',
        output='both',
    )
    return LaunchDescription([
        client_node,
        service_node
    ])