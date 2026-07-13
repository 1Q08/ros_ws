/*
* Created on: 2026年7月13日
* Author: zy
* Version: 1.0.0
* Description: 
*/

#include <ros/ros.h>
#include <unistd.h>  // access() 检查文件是否存在
#include <string>

int main(int argc, char *argv[])
{
    setlocale(LC_ALL, "");  // 设置中文显示
    ros::init(argc, argv, "hipnuc_node");  // 初始化一个节点
    
    // 从 ROS 参数服务器读取串口设备路径，默认为 /dev/HiPNUC
    ros::NodeHandle nh;
    std::string serial_port;
    nh.param<std::string>("serial_port", serial_port, "/dev/HiPNUC");

    // 检查 /dev/HiPNUC 设备在系统中是否存在
    if (access(serial_port.c_str(), F_OK | R_OK) != 0)
    {
        ROS_ERROR("未找到 HiPNUC 设备端口: %s, 请检查设备是否已连接", serial_port.c_str());
        return -1;
    }

    ROS_INFO("已找到 HiPNUC 设备端口: %s", serial_port.c_str());

    return 0;
}