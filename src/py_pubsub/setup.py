from setuptools import find_packages, setup
from glob import glob
import os

package_name = 'py_pubsub'

setup(
    name=package_name,
    version='1.1.0',
    packages=find_packages(exclude=['test']),
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
        (os.path.join('share', package_name, 'launch'), glob('launch/*.launch.py')),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='nvidia',
    maintainer_email='example@163.com',
    description='最小的 ROS2 发布/订阅示例',
    license='Apache License 2.0',
    extras_require={
        'test': [
            'pytest',
        ],
    },
    entry_points={
        'console_scripts': [
            'minimal_publisher = py_pubsub.minimal_publisher:main',
            'minimal_subscriber = py_pubsub.minimal_subscriber:main',
        ],
    },
)
