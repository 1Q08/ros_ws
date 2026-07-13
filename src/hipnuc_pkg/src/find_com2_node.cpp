/*
* Created on: 2026年7月13日
* Author: zy
* Version: 1.0.0
* Description: 直接检查该路径是否存在
*/

#include <ros/ros.h>

int main(int argc, char *argv[])
{
    setlocale(LC_ALL, "");                    // 设置中文显示
    ros::init(argc, argv, "find_com2_node");     // 初始化 ROS 节点

    ros::NodeHandle nh;
    std::string port_path = "/dev/HiPNUC";
    // 直接检查 /dev/HiPNUC 路径是否存在
    if (access(port_path.c_str(), F_OK) == 0) {
        ROS_INFO("已找到 HiPNUC 设备端口: %s", port_path.c_str());
    } else {
        ROS_ERROR("未找到 HiPNUC 设备端口: %s, 请检查设备是否已连接", port_path.c_str());
    }

    return 0;
}