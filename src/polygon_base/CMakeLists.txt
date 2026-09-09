cmake_minimum_required(VERSION 3.8)   # 要求的最低 CMake 版本
project(polygon_base)                  # 项目名 = 包名

# 开启常见编译警告（适用于 GCC 与 Clang）
if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# ===== 查找依赖包 =====
find_package(ament_cmake REQUIRED)    # ament 构建系统（ROS2 默认）
find_package(pluginlib REQUIRED)      # 插件加载框架

# ===== 库定义：本包是【接口库】(INTERFACE) =====
# 只提供头文件接口，不编译任何 .so；作为插件基类的“抽象层”
add_library(${PROJECT_NAME} INTERFACE)
# 起别名 polygon_base::polygon_base，方便其他包用带命名空间的目标名链接
add_library(${PROJECT_NAME}::${PROJECT_NAME} ALIAS ${PROJECT_NAME})
# 要求链接本库的使用方按 C99 / C++17 标准编译
target_compile_features(${PROJECT_NAME} INTERFACE c_std_99 cxx_std_17)
target_include_directories(${PROJECT_NAME} INTERFACE
  # 构建时指向源码 include/，安装后指向安装目录 include/polygon_base
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
  $<INSTALL_INTERFACE:include/${PROJECT_NAME}>
)
# 把 pluginlib 提供的 CMake 目标也传递地链接给使用者
target_link_libraries(${PROJECT_NAME} INTERFACE ${pluginlib_TARGETS})

# ===== 安装头文件到 include/polygon_base =====
install(DIRECTORY include/
  DESTINATION include/${PROJECT_NAME}
)

# ===== 安装库并导出目标（生成 export_polygon_base） =====
install(TARGETS ${PROJECT_NAME}
  EXPORT export_${PROJECT_NAME}
  ARCHIVE DESTINATION lib     # 静态库位置
  LIBRARY DESTINATION lib     # 动态库位置
  RUNTIME DESTINATION bin     # 可执行文件位置
)
# 把 CMake 导出文件装到 share/polygon_base/cmake，供下游 find_package 使用
install(EXPORT export_${PROJECT_NAME}
  NAMESPACE ${PROJECT_NAME}::
  DESTINATION share/${PROJECT_NAME}/cmake
)

# ===== 演示节点 area_node（按教程放在基类所在包中） =====
# 该节点在运行时用 ClassLoader 动态加载 polygon_plugins 里的插件
add_executable(area_node src/area_node.cpp)
ament_target_dependencies(area_node pluginlib)   # 按 ament 方式传递 pluginlib 依赖
target_link_libraries(area_node ${PROJECT_NAME}::${PROJECT_NAME})   # 链接基类接口库
target_compile_features(area_node PUBLIC c_std_99 cxx_std_17)

# 安装可执行文件到 lib/polygon_base
install(TARGETS area_node
  DESTINATION lib/${PROJECT_NAME}
)

# ===== 测试相关（默认 BUILD_TESTING=ON） =====
if(BUILD_TESTING)
  find_package(ament_lint_auto REQUIRED)
  # 临时跳过 copyright 检查：若源码补上了版权头，可删掉下面这行
  set(ament_cmake_copyright_FOUND TRUE)
  # 临时跳过 cpplint 检查：cpplint 仅适用于 git 仓库内且需版权头
  set(ament_cmake_cpplint_FOUND TRUE)
  ament_lint_auto_find_test_dependencies()
endif()

# ===== 导出（注意：必须在 ament_package() 之前调用！） =====
# 导出旧式 CMake 变量（头文件目录），供 find_package 后使用 ${polygon_base_INCLUDE_DIRS}
ament_export_include_directories(
  include
)

# 导出新式 CMake 目标，供下游链接 polygon_base::polygon_base
ament_export_targets(
  export_${PROJECT_NAME}
)

# 生成包的 CMake 配置（必须在所有 export 之后）
ament_package()
