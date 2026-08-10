from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    publisher_node = Node(
        package='py_pubsub',
        executable='minimal_publisher',
        output='screen',
    )
    subscriber_node = Node(
        package='py_pubsub',
        executable='minimal_subscriber',
        output='screen',
    )
    return LaunchDescription([
        publisher_node,
        subscriber_node
    ])