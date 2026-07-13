#include <ros/ros.h>
#include <sensor_msgs/Imu.h>  // sensor_msgs/Imu 消息类型
#include <unistd.h>           // access() 检查文件是否存在
#include <fcntl.h>            // open()
#include <termios.h>          // 串口配置
#include <string>
#include <vector>
#include <cstdint>

/*
 * CRC16-CCITT (多项式 0x1021) 计算
 * crc:           输入/输出的 CRC 值，首段调用时应传入 0
 * src:           参与计算的数据
 * lengthInBytes: 数据长度
 */
static void crc16_update(uint16_t &crc, const uint8_t *src, uint32_t lengthInBytes)
{
    for (uint32_t j = 0; j < lengthInBytes; ++j)
    {
        crc ^= static_cast<uint16_t>(src[j]) << 8;
        for (uint32_t i = 0; i < 8; ++i)
        {
            uint16_t temp = crc << 1;
            if (crc & 0x8000)
            {
                temp ^= 0x1021;
            }
            crc = temp;
        }
    }
}

/*
 * 对一帧完整数据做 CRC 校验并打印结果
 * 帧格式: 5A A5 | LEN(2B,小端) | CRC(2B,小端) | payload
 * 返回 true 表示校验通过
 */
static bool verify_frame(const uint8_t *buf, size_t buf_size, bool print_log)
{
    if (buf_size < 6)
    {
        return false;
    }

    int16_t payload_len = buf[2] + (buf[3] << 8);
    if (static_cast<size_t>(6 + payload_len) > buf_size)
    {
        return false;
    }

    // 帧中携带的 CRC (小端)
    uint16_t crc_in_frame = buf[4] + (buf[5] << 8);

    // 计算 CRC: 5A A5 与 LEN 字段(前 4 字节) + payload(跳过 CRC 字段)
    uint16_t crc_calc = 0;
    crc16_update(crc_calc, buf, 4);
    crc16_update(crc_calc, buf + 6, payload_len);

    if (print_log)
    {
        ROS_INFO("计算得到的 CRC = 0x%04X, 帧中携带的 CRC = 0x%04X", crc_calc, crc_in_frame);
        if (crc_calc == crc_in_frame)
        {
            ROS_INFO("CRC 校验：正确");
        }
        else
        {
            ROS_WARN("CRC 校验：错误");
        }
    }

    return crc_calc == crc_in_frame;
}

int main(int argc, char *argv[])
{
    setlocale(LC_ALL, "");  // 设置中文显示
    ros::init(argc, argv, "Hipnuc_node");  // 初始化一个节点
    ros::NodeHandle nh;

    // 从参数服务器读取串口设备路径，默认为 /dev/HiPNUC
    std::string serial_port;
    nh.param<std::string>("serial_port", serial_port, "/dev/HiPNUC");

    // 检查串口设备是否存在
    if (access(serial_port.c_str(), F_OK) != 0)
    {
        ROS_ERROR("未找到 HiPNUC 设备端口: %s，请检查设备是否已连接。", serial_port.c_str());
        return -1;
    }

    ROS_INFO("已找到 HiPNUC 设备端口: %s", serial_port.c_str());

    // 打开并配置串口
    int fd = open(serial_port.c_str(), O_RDONLY | O_NOCTTY);
    if (fd < 0)
    {
        ROS_ERROR("打开串口失败: %s", serial_port.c_str());
        return -1;
    }

    struct termios tty{};
    if (tcgetattr(fd, &tty) != 0)
    {
        ROS_ERROR("读取串口配置失败: %s", serial_port.c_str());
        close(fd);
        return -1;
    }
    cfsetispeed(&tty, B115200);
    cfsetospeed(&tty, B115200);
    tty.c_cflag = (tty.c_cflag & ~CSIZE) | CS8;   // 8 数据位
    tty.c_cflag |= (CLOCAL | CREAD);              // 本地连接，使能接收
    tty.c_cflag &= ~PARENB;                       // 无校验位
    tty.c_cflag &= ~CSTOPB;                       // 1 停止位
    tty.c_lflag &= ~(ICANON | ECHO | ECHOE | ISIG);
    tty.c_iflag &= ~(IXON | IXOFF | IXANY | INLCR | ICRNL);
    tty.c_oflag &= ~OPOST;
    tty.c_cc[VMIN] = 0;
    tty.c_cc[VTIME] = 1;                          // 0.1s 读超时
    tcsetattr(fd, TCSANOW, &tty);

    // 帧解析状态机与帧率统计
    std::vector<uint8_t> frame;
    frame.reserve(256);
    uint8_t byte = 0;
    int state = 0;              // 0:等待 5A, 1:等待 A5, 2:读 LEN 与 CRC, 3:读 payload
    int payload_len = 0;

    uint32_t valid_frame_count = 0;
    ros::Time stat_start = ros::Time::now();

    while (ros::ok())
    {
        ssize_t n = read(fd, &byte, 1);
        if (n <= 0)
        {
            continue;
        }

        switch (state)
        {
        case 0:
            if (byte == 0x5A)
            {
                frame.clear();
                frame.push_back(byte);
                state = 1;
            }
            break;
        case 1:
            if (byte == 0xA5)
            {
                frame.push_back(byte);
                state = 2;
            }
            else
            {
                state = 0;
            }
            break;
        case 2:
            frame.push_back(byte);
            // 收齐 LEN(2) 与 CRC(2)，即 buf[2..5]
            if (frame.size() == 6)
            {
                payload_len = frame[2] + (frame[3] << 8);
                state = 3;
            }
            break;
        case 3:
            frame.push_back(byte);
            if (static_cast<int>(frame.size()) == 6 + payload_len)
            {
                // 收到一整帧，做 CRC 校验并打印
                if (verify_frame(frame.data(), frame.size(), true))
                {
                    valid_frame_count++;
                }
                state = 0;

                // 每统计满 1 秒，计算并输出帧率
                ros::Time now = ros::Time::now();
                double elapsed = (now - stat_start).toSec();
                if (elapsed >= 1.0)
                {
                    double fps = valid_frame_count / elapsed;
                    ROS_INFO("数据帧发送帧率: %.1f 帧/秒 (%u 帧 / %.2fs)",
                             fps, valid_frame_count, elapsed);
                    valid_frame_count = 0;
                    stat_start = now;
                }
          }
            break;
        }

        ros::spinOnce();
    }

    close(fd);
    return 0;
}