#include <ros/ros.h>
#include <sensor_msgs/Imu.h>
#include <tf/tf.h>
#include <geometry_msgs/Twist.h>

ros::Publisher vel_pub;  // 创建全局速度发布者对象

void IMUCallback(sensor_msgs::Imu msg)
{
    if(msg.orientation_covariance[0] < 0)  // 检查IMU数据是否有效
        return;

    // 将IMU四元数转换为欧拉角
    tf::Quaternion quaternion(
        msg.orientation.x,
        msg.orientation.y,
        msg.orientation.z,
        msg.orientation.w
    );

    double roll, pitch, yaw;
    tf::Matrix3x3(quaternion).getRPY(roll, pitch, yaw);  // 获取滚转、俯仰和朝向角度
    roll = roll * 180 / M_PI;
    pitch = pitch * 180 / M_PI;
    yaw = yaw * 180 / M_PI;

    ROS_INFO("滚转 = %.0f  俯仰 = %.0f  朝向 = %.0f", roll, pitch, yaw);

    // 简单朝向控制：朝向目标角度移动
    double target_yaw = 90;
    double diff_angle = target_yaw - yaw;
    geometry_msgs::Twist vel_cmd;
    vel_cmd.angular.z = diff_angle * 0.01;
    vel_cmd.linear.x = 0.1;
    vel_pub.publish(vel_cmd);
}

int main(int argc, char *argv[])
{
    setlocale(LC_ALL, "");  // 设置中文显示
    ros::init(argc, argv, "imu_node");  // 初始化一个节点
    ros::NodeHandle n;  // 创建话题
    ros::Subscriber imu_sub = n.subscribe("/imu/data", 10, &IMUCallback);  // 订阅 IMU 数据
    vel_pub = n.advertise<geometry_msgs::Twist>("/cmd_vel", 10);  // 发布速度命令

    ros::spin();  // 循环等待回调函数

    return 0;
}