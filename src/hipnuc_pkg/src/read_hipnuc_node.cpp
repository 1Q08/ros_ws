/*
* Created on: 2026年7月13日
* Author: zy
* Version: 1.0.0
* Description: 检查并读取 HiPNUC 串口数据，输出为十六进制字符串
*/

#include <ros/ros.h>
#include <unistd.h>  // access() 检查文件是否存在
#include <string>
#include <fcntl.h>  // open()
#include <termios.h>  // 串口配置

int main(int argc, char *argv[])
{
    setlocale(LC_ALL, "");  // 设置中文显示
    ros::init(argc, argv, "read_hipnuc_node");  // 初始化一个节点
    
    // 从 ROS 参数服务器读取串口设备路径，默认为 /dev/HiPNUC
    ros::NodeHandle nh;
    std::string serial_port;
    nh.param<std::string>("serial_port", serial_port, "/dev/HiPNUC");

    /*************************************检查*************************************/
    // 检查 /dev/HiPNUC 设备在系统中是否存在
    if (access(serial_port.c_str(), F_OK | R_OK) != 0){
        ROS_ERROR("未找到 HiPNUC 设备端口: %s, 请检查设备是否已连接", serial_port.c_str());
        return -1;
    }
    else{
        ROS_INFO("已找到 HiPNUC 设备端口: %s", serial_port.c_str());
    }

    // 打开并配置串口
    int fd = open(serial_port.c_str(), O_RDONLY | O_NOCTTY);
    struct termios tty{};
    if (fd > 0){
        ROS_INFO("打开串口成功: %s", serial_port.c_str());
        if (tcgetattr(fd, &tty) != 0){
            ROS_ERROR("读取串口配置失败: %s", serial_port.c_str());
            close(fd);
            return -1;
        }
        cfsetispeed(&tty, B115200);  // 设置输入波特率
        cfsetospeed(&tty, B115200);  // 设置输出波特率
        tty.c_cflag = (tty.c_cflag & ~CSIZE) | CS8;  // 8 数据位
        tty.c_cflag |= (CLOCAL | CREAD);  // 本地连接，使能接收
        tty.c_cflag &= ~PARENB;  // 无校验位
        tty.c_cflag &= ~CSTOPB;  // 1 停止位
        tty.c_lflag &= ~(ICANON | ECHO | ECHOE | ISIG);
        tty.c_iflag &= ~(IXON | IXOFF | IXANY | INLCR | ICRNL);  // 禁用流控
        tty.c_oflag &= ~OPOST;  // 禁用流控
        tty.c_cc[VMIN] = 0;  // 读至少 0 个字节
        tty.c_cc[VTIME] = 1;  // 0.1s 读超时
        tcsetattr(fd, TCSANOW, &tty);  // 立即将修改后的配置写入串口设备
    }
    else if (fd < 0){
        ROS_ERROR("打开串口失败: %s", serial_port.c_str());
        return -1;
    }
    else{
    }
    /******************************************************************************/

    /******************************读取*************************************/
    // 每帧固定长度 82 字节，帧头为 5A A5，先对齐帧头再读取整帧
    const size_t FRAME_SIZE = 82;
    uint8_t frame[FRAME_SIZE];  // 单帧缓冲区
    while (ros::ok()){
        // 逐字节读取，直到对齐帧头 0x5A 0xA5
        uint8_t byte = 0;
        // 第一步：等待第一个帧头字节 0x5A
        ssize_t n = read(fd, &byte, 1);
        if (n <= 0){
            continue;  // 超时无数据或出错，继续等待
        }
        if (byte != 0x5A){
            continue;  // 不是帧头首字节，丢弃
        }

        // 第二步：读取第二个字节，判断是否为 0xA5
        n = read(fd, &byte, 1);
        if (n <= 0){
            continue;
        }
        if (byte != 0xA5){
            continue;  // 第二字节不匹配，重新寻找帧头
        }

        // 已对齐帧头，写入缓冲区
        frame[0] = 0x5A;
        frame[1] = 0xA5;

        // 第三步：累积读取剩余的 (FRAME_SIZE - 2) 字节
        size_t got = 2;
        bool read_error = false;
        while (got < FRAME_SIZE && ros::ok()){
            n = read(fd, frame + got, FRAME_SIZE - got);
            if (n > 0){
                got += static_cast<size_t>(n);
            }
            else if (n < 0){
                ROS_WARN("读取串口出错: %s", serial_port.c_str());
                read_error = true;
                break;
            }
            // n == 0 表示本次超时无数据，继续等待
        }

        // 未读满一整帧（出错或节点退出），跳过输出
        if (read_error || got < FRAME_SIZE){
            continue;
        }

        // 将整帧拼接成十六进制字符串并输出
        std::string hex_str;
        char tmp[4];
        for (size_t i = 0; i < FRAME_SIZE; ++i){
            snprintf(tmp, sizeof(tmp), "%02X ", frame[i]);
            hex_str += tmp;
        }
        ROS_INFO("读取到一帧 %zu 字节: %s", FRAME_SIZE, hex_str.c_str());

        ros::spinOnce();
    }
    /******************************************************************************/

    close(fd);  // 退出前关闭串口
    return 0;
}