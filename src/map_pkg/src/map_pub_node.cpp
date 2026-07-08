#include <ros/ros.h>
#include <nav_msgs/OccupancyGrid.h>

int main(int argc, char *argv[])
{
    /* code */
    ros::init(argc, argv, "map_pub_node");  // 初始化一个节点
    ros::NodeHandle n;  // 创建话题
    ros::Publisher pub = n.advertise<nav_msgs::OccupancyGrid>("/map", 10);  // 创建发布者
    ros::Rate r(30);  // 创建频率对象
    
    while (ros::ok())
    {
        /* code */
        nav_msgs::OccupancyGrid msg;  // 创建消息对象
        msg.header.frame_id = "map";  // 设置消息的坐标系
        msg.header.stamp = ros::Time::now();  // 设置消息的时间戳
        msg.info.origin.position.x = 0;  // 设置地图原点的x坐标
        msg.info.origin.position.y = 0;  // 设置地图原点的y坐
        msg.info.resolution = 1.0;  // 设置地图分辨率
        msg.info.width = 4;  // 设置地图宽度
        msg.info.height = 2;  // 设置地图高度

        msg.data.resize(4*2);  // 设置地图数据的大小
        msg.data[0] = 100;  // 设置地图数据
        msg.data[1] = 100;
        msg.data[2] = 0;
        msg.data[3] = -1;
        pub.publish(msg);  // 发布消息
        r.sleep();  // 按照设定的频率休眠
    }
    return 0;
}