#include <ros/ros.h>
#include <std_msgs/String.h>

void chao_callback(std_msgs::String msg)  // 订阅者的回调函数
{
    ROS_INFO(msg.data.c_str());
}

void yao_callback(std_msgs::String msg)  // 订阅者2的回调函数
{
    ROS_WARN(msg.data.c_str());
}


int main(int argc, char *argv[])
{
    /* code */
    setlocale(LC_ALL, "");
    ros::init(argc, argv, "ma_node");  // 初始化一个节点

    ros::NodeHandle nh;  // 创建话题
    ros::Subscriber sub = nh.subscribe("Topic", 10, chao_callback);  //创建订阅者
    ros::Subscriber sub_2 = nh.subscribe("Topic2", 10, yao_callback);  //创建订阅者2


    while (ros::ok())  // 可以使用Ctrl+C
    {
        /* code */
        ros::spinOnce();
        
    }
    return 0;
}
