cmake_minimum_required(VERSION 3.8)
project(custom_interfaces)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# find dependencies
find_package(ament_cmake REQUIRED)
# rosidl 代码生成器:把 .msg / .srv 生成各语言代码
find_package(rosidl_default_generators REQUIRED)

# ---------- 声明要生成的接口 ----------
# 把 msg 和 srv 一起加入生成列表
set(interface_files
  "msg/AddressBook.msg"
  "srv/AddTwoInts.srv"
)
# 生成接口(Python/C++ 等所有语言代码)
rosidl_generate_interfaces(${PROJECT_NAME} ${interface_files})

# ---------- 导出依赖 ----------
ament_export_dependencies(rosidl_default_runtime)

# ---------- 安装 Python 节点脚本 ----------
# 4 个脚本安装到 lib/custom_interfaces/,
# 供 ros2 run custom_interfaces <脚本名>.py 调用
install(PROGRAMS
  scripts/publish_address_book.py
  scripts/subscribe_address_book.py
  scripts/add_two_ints_server.py
  scripts/add_two_ints_client.py
  DESTINATION lib/${PROJECT_NAME})

# ---------- 安装 launch 文件 ----------
# 安装到 share/custom_interfaces/launch/,
# 供 ros2 launch custom_interfaces custom_interfaces_xterm.launch.py 调用
install(DIRECTORY launch
  DESTINATION share/${PROJECT_NAME})

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

ament_package()
