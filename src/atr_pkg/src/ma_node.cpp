#include <ros/ros.h>
#include <std_msgs/String.h>

void chao_callback(std_msgs::String msg)  // 订阅者的回调函数
{
    ROS_WARN("%s", msg.data.c_str());  // 打印接收到的消息
}

void yao_callback(std_msgs::String msg)  // 订阅者2的回调函数
{
    ROS_ERROR("%s", msg.data.c_str());  // 打印接收到的消息
}

int main(int argc, char *argv[])
{
    /* code */
    setlocale(LC_ALL, "");  // 设置中文显示
    ros::init(argc, argv, "ma_node");  // 初始化一个节点
    ros::NodeHandle nh;  // 创建话题
    ros::Subscriber sub = nh.subscribe("Topic", 10, chao_callback);  //创建订阅者
    ros::Subscriber sub_2 = nh.subscribe("Topic2", 10, yao_callback);  //创建订阅者2

    while (ros::ok())  // 可以使用 Ctrl + C
    {
        /* code */
        ros::spinOnce();  // 处理回调函数
    }
    return 0;
}
