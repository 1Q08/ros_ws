#include <ros/ros.h>
#include <sensor_msgs/LaserScan.h>
#include <geometry_msgs/Twist.h>
#include <signal.h>

ros::Publisher vel_pub;  // 创建全局发布者对象
int nCount = 0;

// 激光雷达回调函数
void LidarCallback(const sensor_msgs::LaserScan msg)
{
    float fMidDist = msg.ranges[180];  // 获取前方距离，假设激光雷达有360个点，180点为正前方
    geometry_msgs::Twist vel_cmd;  // 创建速度消息对象

    ROS_INFO("前方测距 ranges[180] = %f 米", fMidDist);

    // 如果前方距离小于1.5米，机器人向左转，持续50次
    if(fMidDist < 1.5)
    {
        vel_cmd.angular.z = 0.3;
        nCount = 50;
    }
    else if(nCount > 0)
    {
        nCount --;
        return;
    }
    else
    {
        vel_cmd.linear.x = 0.05;
    }

    vel_pub.publish(vel_cmd);  // 向/cmd_vel话题发布速度消息
}

// Ctrl+C信号处理函数
// 在接收到Ctrl+C信号时，停止机器人运动并关闭节点，避免机器人一直运动
void mySigintHandler(int sig)
{
    ROS_INFO("Ctrl+C caught, stopping robot...");
    geometry_msgs::Twist stop_cmd;
    stop_cmd.linear.x = 0.0;
    stop_cmd.angular.z = 0.0;
    vel_pub.publish(stop_cmd);
    ros::Duration(0.1).sleep();  // 等待消息发送
    ros::shutdown();             // 关闭节点
}

int main(int argc, char *argv[])
{
    /* code */
    setlocale(LC_ALL, "");  // 设置中文显示
    ros::init(argc, argv, "lidar_node");  // 初始化一个节点
    ros::NodeHandle n;  // 创建话题
    // 订阅/scan激光雷达话题，队列长度为10，回调函数为LidarCallback
    ros::Subscriber lidar_sub = n.subscribe("/scan", 10, &LidarCallback);  // 创建订阅者
    // 发布/cmd_vel速度话题，消息类型为geometry_msgs::Twist，队列长度为10
    vel_pub = n.advertise<geometry_msgs::Twist>("/cmd_vel", 10);  // 创建发布者

    signal(SIGINT, mySigintHandler);  // 注册Ctrl+C信号处理函数
    ros::spin();  // 循环等待回调函数

    return 0;
}