# README

一个同时保存 **ROS1** 与 **ROS2** 开发成果的工作空间仓库，包含：

- 📚 **ROS 命令速查文档站**（GitHub Pages）
- 🌏 **ROS2 官方文档汉化站**（独立站点）
- 🛠️ **Jetson 平台常用工具脚本**
- 🤖 **ROS1 / ROS2 项目源码**（分布在多个分支）

---

## 🔗 网站导航

| 站点               | 地址                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| ROS 命令速查    | [https://1q08.github.io/ros_ws/](https://1q08.github.io/ros_ws/)                                                         |
| ROS2 文档汉化站 | [https://1q08.github.io/ROS2_documentation/jazzy/index.html](https://1q08.github.io/ROS2_documentation/jazzy/index.html) |

---

## 📚 文档站（`docs/`）

一个开源的 **ROS1 / ROS2 命令行参考工具**，基于 Jekyll + GitHub Pages 构建，提供交互式命令浏览器。

### 本地开发

```bash
# 1. 进入文档站目录
cd docs

# 2. 安装依赖
bundle install

# 3. 启动开发服务器（监听文件变化自动重建）
bundle exec jekyll serve --baseurl=""

# 4. 浏览器访问
# http://127.0.0.1:4000
```

更多详情见 [`docs/README.md`](docs/README.md)。

---

## 🛠️ 工具脚本（`tools/`）

面向 **NVIDIA Jetson** 平台的常用脚本：

| 脚本                   | 功能                                                       |
| ---------------------- | ---------------------------------------------------------- |
| `sysinfo.sh`         | 显示系统信息，并提供常用软件安装选项、系统更新与清理       |
| `set_fan_profile.sh` | 切换风扇散热模式（`cool` 散热优先 / `quiet` 静音优先） |

**使用方式**：

```bash
# 系统信息查询 + 软件安装助手
./tools/sysinfo.sh

# 切换风扇配置（带参数直接切换，不带参数进入交互式选择）
./tools/set_fan_profile.sh cool
./tools/set_fan_profile.sh
```

更多详情见 [`tools/README.md`](tools/README.md)。

---

## 📄 许可

本项目基于 MIT 许可开源，详见 [LICENSE](LICENSE)。
