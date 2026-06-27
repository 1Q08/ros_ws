#include <ros/ros.h>
#include <sensor_msgs/LaserScan.h>
#include <geometry_msgs/Twist.h>
#include <signal.h>

ros::Publisher vel_pub;
int nCount = 0;

void LidarCallback(const sensor_msgs::LaserScan msg)
{
    float fMidDist = msg.ranges[180];
    ROS_INFO("前方测距 ranges[180] = %f 米", fMidDist);

    if(nCount > 0)
    {
        nCount --;
        return;
    }

    geometry_msgs::Twist vel_cmd;
    if(fMidDist < 1.5)
    {
        vel_cmd.angular.z = 0.3;
        nCount = 50;
    }
    else
    {
        vel_cmd.linear.x = 0.05;
    }
    vel_pub.publish(vel_cmd);
}

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
    setlocale(LC_ALL, "");
    ros::init(argc, argv, "lidar_node");

    ros::NodeHandle n;
    ros::Subscriber lidar_sub = n.subscribe("/scan", 10, &LidarCallback);
    vel_pub = n.advertise<geometry_msgs::Twist>("/cmd_vel", 10);

    signal(SIGINT, mySigintHandler);

    ros::spin();
    return 0;

}