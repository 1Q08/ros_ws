# =====================================================================
# more_interfaces_py —— CMake 构建配置
# 本文件演示使用 ament_cmake_python 扩展:
#   同一 ament_cmake 包内,既用 rosidl 生成 .msg 接口,
#   又通过 ament_python_install_package 安装 Python 库模块(可 import),
#   再用 install(PROGRAMS) 装一个可执行入口脚本。
# 注意:ament_cmake_python 是 CMake 扩展包(不是构建类型),
#      需要在 package.xml 中用 <buildtool_depend> 声明。
# =====================================================================

cmake_minimum_required(VERSION 3.8)
project(more_interfaces_py)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)   # 开启编译警告(C++ 文件有效)
endif()

# ---------- 查找依赖包 ----------
# ament_cmake: ROS2 的 CMake 扩展,提供 ament_* 系列命令
find_package(ament_cmake REQUIRED)
# rosidl_default_generators: 负责把 .msg/.srv 生成各语言源码
find_package(rosidl_default_generators REQUIRED)
# ament_cmake_python: 提供 ament_python_install_package(),把 Python 模块装进 site-packages
find_package(ament_cmake_python REQUIRED)

# ---------- 声明要生成的接口 ----------
set(msg_files
  "msg/AddressBook.msg"
)
# 生成接口(含 Python/C++ 等所有语言代码)
rosidl_generate_interfaces(${PROJECT_NAME}
  ${msg_files}
)

# ---------- 安装 Python 库模块 ----------
# 关键命令:把 addr_book_lib/ 这个 Python 包整个安装到
#   install/more_interfaces_py/lib/python3.x/site-packages/addr_book_lib/
# 这样其他 Python 代码都能 `import addr_book_lib`
# 注意:目录名不能与项目名相同,否则与 rosidl 生成的 egg 目标冲突
ament_python_install_package(addr_book_lib)

# ---------- 导出依赖 ----------
ament_export_dependencies(rosidl_default_runtime)

# ---------- 安装可执行入口脚本 ----------
# scripts/publish_address_book.py 安装到 lib/more_interfaces_py/
# 供 `ros2 run more_interfaces_py publish_address_book.py` 调用
install(PROGRAMS
    scripts/publish_address_book.py
  DESTINATION lib/${PROJECT_NAME})

# ---------- 测试(可跳过) ----------
if(BUILD_TESTING)
  find_package(ament_lint_auto REQUIRED)
  # the following line skips the linter which checks for copyrights
  # comment the line when a copyright and license is added to all source files
  set(ament_cmake_copyright_FOUND TRUE)
  # the following line skips cpplint (only works in a git repo)
  # comment the line when this package is in a git repo and when
  # a copyright and license is added to all source files
  set(ament_cmake_cpplint_FOUND TRUE)
  ament_lint_auto_find_test_dependencies()
endif()

ament_package()   # 结束包定义,生成包元数据