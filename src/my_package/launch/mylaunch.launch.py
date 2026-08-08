from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    # 在这里定义你的动作 (Actions)
    return LaunchDescription([
        # 动作列表，例如启动一个节点
        # --- 最小示例：只指定 package + executable ---
        Node(
            # ---- 必须的字段 ----
            package='my_package',          # 节点所在的功能包名
            executable='my_node',  # 可执行文件名（CMakeLists.txt 中 add_executable 的名字）
        )
    ])