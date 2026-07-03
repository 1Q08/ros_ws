#include <ros/ros.h>
#include <std_msgs/String.h>
#include <qq_msgs/Carry.h>

int main(int argc, char *argv[])
{
    /* code */
    ros::init(argc, argv, "chao_node");  // 初始化一个节点
    ros::NodeHandle nh;  // 创建话题
    // ros::Publisher pub = nh.advertise<std_msgs::String>("Topic", 10);  // 创建发布者
    ros::Publisher pub = nh.advertise<qq_msgs::Carry>("Topic", 10);  // 创建发布者
    ros::Rate loop_rate(10);  // 创建频率对象

    while (ros::ok())  // 可以使用 Ctrl + C
    {
        /* code */
        printf("\033[33mWaitting......\033[0m\n");
        // std_msgs::String msg;  // 创建消息对象
        // msg.data = "我在Talking......";  // 设置消息内容
        qq_msgs::Carry msg;  // 创建消息对象
        msg.grade = "A";  // 设置消息内容
        msg.star = 5;
        msg.date = "我在Talking......";
        pub.publish(msg);  // 发布消息
        loop_rate.sleep();  // 按照设定的频率休眠
    }
    return 0;
}
