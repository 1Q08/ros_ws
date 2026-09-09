#include <pluginlib/class_loader.hpp>              // 插件加载器：负责在运行时动态加载插件库
#include <polygon_base/regular_polygon.hpp>        // 基类定义：多边形的通用接口

int main(int argc, char** argv)
{
  // 忽略命令行参数，避免产生未使用参数的编译警告
  (void) argc;
  (void) argv;

  // 创建插件加载器：第一个参数是包名，第二个参数是基类的完整限定名
  // 加载器会在 polygon_base 包中查找所有以 polygon_base::RegularPolygon 为基类的插件
  pluginlib::ClassLoader<polygon_base::RegularPolygon> poly_loader("polygon_base", "polygon_base::RegularPolygon");

  try
  {
    // 通过插件的 类名/别名 动态创建实例（不 link 具体实现，运行时才解析）
    std::shared_ptr<polygon_base::RegularPolygon> triangle = poly_loader.createSharedInstance("awesome_triangle");
    triangle->initialize(10.0);   // 设置三角形边长

    std::shared_ptr<polygon_base::RegularPolygon> square = poly_loader.createSharedInstance("polygon_plugins::Square");
    square->initialize(10.0);     // 设置正方形边长

    // 调用基类接口计算并打印面积
    printf("Triangle area: %.2f\n", triangle->area());
    printf("Square area: %.2f\n", square->area());
  }
  catch(pluginlib::PluginlibException& ex)
  {
    // 插件加载失败时捕获异常并打印
    printf("The plugin failed to load for some reason. Error: %s\n", ex.what());
  }

  return 0;
}
