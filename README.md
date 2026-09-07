<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a>
</p>

# README

A workspace repository that stores **ROS1** and **ROS2** development artifacts, including:

- 📚 **ROS Command Reference docs site** (GitHub Pages)
- 🌏 **ROS2 official documentation Chinese translation site** (standalone site)
- 🛠️ **Jetson platform utility scripts**
- 🤖 **ROS1 / ROS2 project source code** (across multiple branches)

---

## 📚 Docs site (`docs/`)

An open-source **ROS1 / ROS2 command-line reference tool** built with Jekyll + GitHub Pages, featuring an interactive command browser.

### Local development

```bash
# 1. Enter the docs site directory
cd docs

# 2. Install dependencies
bundle install

# 3. Start the dev server (auto-rebuilds on file changes)
bundle exec jekyll serve --baseurl=""

# 4. Open in browser
# http://127.0.0.1:4000
```

See [`docs/README.md`](docs/README.md) for more details.

---

## 🛠️ Utility scripts (`tools/`)

Common scripts for **NVIDIA Jetson**:

| Script                | Purpose                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------ |
| `sysinfo.sh`         | Shows system info, with software installation options, system update and cleanup           |
| `set_fan_profile.sh` | Switches the fan cooling mode (`cool` for performance / `quiet` for silence) |

**Usage**:

```bash
# System info + software install assistant
./tools/sysinfo.sh

# Switch the fan profile (pass an argument to switch directly; no argument enters interactive mode)
./tools/set_fan_profile.sh cool
./tools/set_fan_profile.sh
```

See [`tools/README.md`](tools/README.md) for more details.

---

## 📄 License

Licensed under MIT. See [LICENSE](LICENSE).
