cmake_minimum_required(VERSION 3.8)   # 要求的最低 CMake 版本
project(polygon_plugins)              # 项目名 = 包名

# 开启常见编译警告（适用于 GCC 与 Clang）
if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# ===== 查找依赖包 =====
find_package(ament_cmake REQUIRED)         # ament 构建系统
find_package(ament_cmake_ros REQUIRED)     # ROS 相关构建宏
find_package(polygon_base REQUIRED)        # 基类接口库（本包要实现的抽象基类）
find_package(pluginlib REQUIRED)           # 插件框架

# ===== 导出插件描述文件（关键！） =====
# 把 plugins.xml 里的插件信息交给 ROS 工具链，使其能被 ros2 plugin list 发现
# 参数1：基类所在包名 polygon_base；参数2：插件描述文件 plugins.xml
pluginlib_export_plugin_description_file(polygon_base plugins.xml)

# ===== 编译插件动态库 =====
# 源文件里定义了 Square / Triangle 类并用 PLUGINLIB_EXPORT_CLASS 导出为插件
add_library(polygon_plugins src/polygon_plugins.cpp)
add_library(polygon_plugins::polygon_plugins ALIAS polygon_plugins)
target_compile_features(polygon_plugins PUBLIC c_std_99 cxx_std_17)  # 要求 C99/C++17
target_include_directories(polygon_plugins PUBLIC
  # 构建时指向源码 include/，安装后指向安装目录 include/polygon_plugins
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
  $<INSTALL_INTERFACE:include/${PROJECT_NAME}>)
ament_target_dependencies(
  polygon_plugins
  "polygon_base"   # 提供基类头文件
  "pluginlib"      # 提供导出宏
)

# 定义私有编译宏：构建本动态库时用 dllexport 导出符号，而非消费时的 dllimport
#（Windows 平台需要；Linux 上无实际影响）
target_compile_definitions(polygon_plugins PRIVATE "POLYGON_PLUGINS_BUILDING_LIBRARY")

# ===== 安装 =====
# 安装头文件
install(
  DIRECTORY include/
  DESTINATION include/${PROJECT_NAME}
)
# 安装插件动态库并导出目标
install(
  TARGETS polygon_plugins
  EXPORT export_${PROJECT_NAME}
  ARCHIVE DESTINATION lib     # 静态库位置
  LIBRARY DESTINATION lib     # 动态库位置
  RUNTIME DESTINATION bin     # 可执行文件位置
)

# ===== 测试相关（默认 BUILD_TESTING=ON） =====
if(BUILD_TESTING)
  find_package(ament_lint_auto REQUIRED)
  # 临时跳过 copyright / cpplint 检查（补版权头后删掉下面两行）
  set(ament_cmake_copyright_FOUND TRUE)
  set(ament_cmake_cpplint_FOUND TRUE)
  ament_lint_auto_find_test_dependencies()
endif()

# ===== 导出（注意：必须在 ament_package() 之前调用！） =====
# 导出头文件目录，供下游 find_package 后使用
ament_export_include_directories(
  "include/${PROJECT_NAME}"
)
# 导出库文件，供下游链接
ament_export_libraries(
  polygon_plugins
)
# 导出新式 CMake 目标，供下游链接 polygon_plugins::polygon_plugins
ament_export_targets(
  export_${PROJECT_NAME}
)

# 生成包的 CMake 配置（必须在所有 export 之后）
ament_package()
