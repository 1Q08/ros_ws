#include <ros/ros.h>
#include <geometry_msgs/Twist.h>

int main(int argc, char *argv[])
{
    /* code */
    ros::init(argc, argv, "vel_node");  // 初始化一个节点

    ros::NodeHandle n;  // 创建话题
    ros::Publisher vel_pub = n.advertise<geometry_msgs::Twist>("/cmd_vel", 10);  // 创建发布者

    geometry_msgs::Twist vel_msg;
    vel_msg.linear.x = 0;
    vel_msg.linear.y = 0;
    vel_msg.linear.z = 0;
    vel_msg.angular.x = 0;
    vel_msg.angular.y = 0;
    vel_msg.angular.z = 0.1;

    ros::Rate r(30);
    while (ros::ok())
    {
        /* code */
        vel_pub.publish(vel_msg);
        r.sleep();
    }
    
    return 0;
}