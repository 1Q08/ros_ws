#ifndef POLYGON_BASE_REGULAR_POLYGON_HPP
#define POLYGON_BASE_REGULAR_POLYGON_HPP

namespace polygon_base
{
  // 抽象基类：定义所有多边形插件必须实现的接口
  class RegularPolygon
  {
    public:
      // 纯虚函数：用给定的边长初始化多边形（在派生类中实现）
      virtual void initialize(double side_length) = 0;
      // 纯虚函数：计算并返回多边形的面积（在派生类中实现）
      virtual double area() = 0;
      // 虚析构函数：确保通过基类指针删除派生对象时能正确调用派生类的析构
      virtual ~RegularPolygon(){}

    protected:
      // 保护构造函数：防止直接实例化抽象基类，只能作为基类被继承
      RegularPolygon(){}
  };
}  // namespace polygon_base

#endif  // POLYGON_BASE_REGULAR_POLYGON_HPP
