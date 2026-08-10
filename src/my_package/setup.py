# ============================================================
# 文件作用：setup.py 是 ROS 2 Python 功能包（ament_python）的
# 构建配置文件，用于向 setuptools/colcon 声明包的元信息、依赖、
# 数据文件以及可执行入口（console_scripts）。
#   - colcon build 时据此生成可安装的 Python 包
#   - console_scripts 决定 ros2 run <包名> <节点名> 能运行哪些节点
#   - 与 package.xml 一起构成 Python 功能包的必要文件
# ============================================================
from setuptools import find_packages, setup
import os  # 拼接文件路径
from glob import glob  # 用通配符匹配 launch 文件

package_name = 'my_package'  # 包名：须与 src 目录名、package.xml 中的 <name> 一致

setup(
    name=package_name,                         # 包的安装名称（对应包名）
    version='1.1.0',                           # 版本号：遵循语义化版本（major.minor.patch）
    packages=find_packages(exclude=['test']),  # 自动发现要打包的 Python 子包，排除 test 目录
    data_files=[
        # 安装 ament 资源索引文件，用于 ros2 pkg 识别该包
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        # 安装 package.xml 到共享目录，供构建系统读取包元信息
        ('share/' + package_name, ['package.xml']),
        # 安装 launch 目录下的所有 launch 文件到 share/<包名>/launch/
        # 使 ros2 launch <包名> <launch文件名> 能通过包名找到 launch 文件
        (os.path.join('share', package_name, 'launch'), glob('launch/*.launch.py')),
    ],
    install_requires=['setuptools'],         # 运行时依赖的 Python 包
    zip_safe=True,                           # 允许以 zip 形式打包（纯 Python 包可设为 True）
    maintainer='nvidia',                     # 维护者姓名
    maintainer_email='example@163.com',      # 维护者邮箱
    description='最小的 ROS 2 Python 功能包',  # 包的功能用途描述
    license='Apache License 2.0',            # 开源协议声明
    extras_require={                         # 额外依赖：仅安装 test 扩展时才装 pytest
        'test': [
            'pytest',
        ],
    },
    entry_points={
        'console_scripts': [
            # '可执行命令名' = '包名.脚本文件名:主函数名'
            'my_node = my_package.my_node:main'
        ],
    },
)
