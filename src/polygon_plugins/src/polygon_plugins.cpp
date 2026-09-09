#include <polygon_base/regular_polygon.hpp>   // 基类接口
#include <cmath>                              // 数学库，用于 sqrt 开平方

namespace polygon_plugins
{
  // ========== 正方形插件 ==========
  class Square : public polygon_base::RegularPolygon
  {
    public:
      // 实现基类的初始化接口：记录边长
      void initialize(double side_length) override
      {
        side_length_ = side_length;
      }

      // 实现基类的面积接口：正方形面积 = 边长 × 边长
      double area() override
      {
        return side_length_ * side_length_;
      }

    protected:
      double side_length_;   // 边长
  };

  // ========== 三角形插件 ==========
  class Triangle : public polygon_base::RegularPolygon
  {
    public:
      // 实现基类的初始化接口：记录边长
      void initialize(double side_length) override
      {
        side_length_ = side_length;
      }

      // 实现基类的面积接口：三角形面积 = 底 × 高 / 2
      double area() override
      {
        return 0.5 * side_length_ * getHeight();
      }

      // 根据边长用勾股定理计算等边三角形的高
      double getHeight()
      {
        // 高 = √(边长² - (边长/2)²)
        return sqrt((side_length_ * side_length_) - ((side_length_ / 2) * (side_length_ / 2)));
      }

    protected:
      double side_length_;   // 边长
  };
}

#include <pluginlib/class_list_macros.hpp>   // 提供 PLUGINLIB_EXPORT_CLASS 宏

// 将两个插件类导出为插件，声明其基类为 polygon_base::RegularPolygon
// pluginlib 才能通过 area_node.cpp 中的 ClassLoader 在运行时找到并加载它们
PLUGINLIB_EXPORT_CLASS(polygon_plugins::Square, polygon_base::RegularPolygon)
PLUGINLIB_EXPORT_CLASS(polygon_plugins::Triangle, polygon_base::RegularPolygon)
