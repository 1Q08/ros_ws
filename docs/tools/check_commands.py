#!/usr/bin/env python3
"""ros_ws/docs 命令数据一致性校验脚本。

校验项：
  1. commands.json / commands.en.json 均可被 JSON 解析；
  2. 两份 JSON 结构一致（同样的版本、类别、命令顺序与 cmd）；
  3. 每条命令 7 字段齐全（display/title/cmd/desc/example/options/notes）；
  4. 命令计数与 _data/stats.yml 一致；
  5. 命令计数与 README.md / README.zh-CN.md 的统计表格一致。

用法：
    python3 tools/check_commands.py
退出码 0 表示全部通过，非 0 表示存在不一致。
"""

import json
import re
import sys
from pathlib import Path

DOCS = Path(__file__).resolve().parent.parent
DATA = DOCS / "_data"
ASSETS_DATA = DOCS / "assets" / "data"

REQUIRED_FIELDS = ["display", "title", "cmd", "desc", "example", "options", "notes"]
VERSIONS = ["ros1", "ros2"]

errors = []


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def flatten(data):
    """返回 {version: {category_key: [cmd,...]}} 中每类命令 cmd 的有序列表。"""
    result = {}
    for version in VERSIONS:
        categories = data.get(version, {})
        result[version] = {
            key: [c.get("cmd") for c in cat.get("commands", [])]
            for key, cat in categories.items()
        }
    return result


def main():
    zh_path = ASSETS_DATA / "commands.json"
    en_path = ASSETS_DATA / "commands.en.json"
    stats_path = DATA / "stats.yml"

    # 1. JSON 解析
    zh = load_json(zh_path)
    en = load_json(en_path)
    print(f"解析 OK: {zh_path.name} / {en_path.name}")

    # 2. 结构一致性
    zh_flat = flatten(zh)
    en_flat = flatten(en)
    if zh_flat != en_flat:
        errors.append("commands.json 与 commands.en.json 的版本/类别/命令 cmd 序列不一致")
    else:
        print("结构一致: 两份 JSON 版本、类别、命令 cmd 序列相同")

    # 3. 7 字段齐全
    missing = []
    for label, data in (("zh", zh), ("en", en)):
        for version in VERSIONS:
            for key, cat in data.get(version, {}).items():
                for idx, cmd in enumerate(cat.get("commands", [])):
                    for field in REQUIRED_FIELDS:
                        if field not in cmd:
                            missing.append(
                                f"{label}:{version}:{key}[{idx}] 缺少字段 {field}"
                            )
    if missing:
        errors.extend(missing)
    else:
        print(f"字段齐全: 每条命令均含 {len(REQUIRED_FIELDS)} 字段")

    # 统计计数
    stats = {
        "commands": {"ros1": 0, "ros2": 0},
        "categories": {"ros1": 0, "ros2": 0},
    }
    for version in VERSIONS:
        categories = zh.get(version, {})
        stats["categories"][version] = len(categories)
        stats["commands"][version] = sum(
            len(cat.get("commands", [])) for cat in categories.values()
        )
    total_commands = stats["commands"]["ros1"] + stats["commands"]["ros2"]
    total_categories = stats["categories"]["ros1"] + stats["categories"]["ros2"]

    # 4. 与 stats.yml 一致
    stats_yaml = stats_path.read_text(encoding="utf-8")
    expected = {
        "commands": int(re.search(r"^commands:\s*(\d+)", stats_yaml, re.M).group(1)),
        "categories": int(re.search(r"^categories:\s*(\d+)", stats_yaml, re.M).group(1)),
        "versions": int(re.search(r"^versions:\s*(\d+)", stats_yaml, re.M).group(1)),
        "ros1_commands": int(
            re.search(r"ros1:\s*\n\s+commands:\s*(\d+)", stats_yaml).group(1)
        ),
        "ros1_categories": int(
            re.search(r"ros1:\s*\n\s+commands:\s*\d+\s*\n\s+categories:\s*(\d+)", stats_yaml).group(1)
        ),
        "ros2_commands": int(
            re.search(r"ros2:\s*\n\s+commands:\s*(\d+)", stats_yaml).group(1)
        ),
        "ros2_categories": int(
            re.search(r"ros2:\s*\n\s+commands:\s*\d+\s*\n\s+categories:\s*(\d+)", stats_yaml).group(1)
        ),
    }

    checks = {
        "命令总数": (total_commands, expected["commands"]),
        "分类总数": (total_categories, expected["categories"]),
        "支持版本": (len(VERSIONS), expected["versions"]),
        "ROS 1 命令数": (stats["commands"]["ros1"], expected["ros1_commands"]),
        "ROS 1 分类数": (stats["categories"]["ros1"], expected["ros1_categories"]),
        "ROS 2 命令数": (stats["commands"]["ros2"], expected["ros2_commands"]),
        "ROS 2 分类数": (stats["categories"]["ros2"], expected["ros2_categories"]),
    }
    for label, (actual, exp) in checks.items():
        if actual != exp:
            errors.append(f"stats.yml 不一致: {label} 实际 {actual} != 声明 {exp}")
        else:
            print(f"stats.yml 一致: {label} = {actual}")

    # 5. 与 README 统计表格一致
    readme_checks = [
        (DOCS / "README.md", re.compile(r"\|\s*\*{0,2}(\d+)\*{0,2}\s*\|\s*\*{0,2}(\d+)\*{0,2}\s*\|")),
        (DOCS / "README.zh-CN.md", re.compile(r"\|\s*\*{0,2}(\d+)\*{0,2}\s*\|\s*\*{0,2}(\d+)\*{0,2}\s*\|")),
    ]
    for readme_path, pat in readme_checks:
        if not readme_path.exists():
            errors.append(f"未找到 {readme_path.name}")
            continue
        text = readme_path.read_text(encoding="utf-8")
        # 截取命令统计表格后的段落
        marker_en = "**Command counts**"
        marker_zh = "**命令统计**"
        marker = marker_en if marker_en in text else marker_zh
        section = text[text.index(marker):] if marker in text else text
        rows = pat.findall(section)
        # 期望顺序: ROS 1 行, ROS 2 行, Total 行
        if len(rows) < 3:
            errors.append(f"{readme_path.name} 统计表格行数不足")
            continue
        expected_rows = [
            (stats["categories"]["ros1"], stats["commands"]["ros1"]),
            (stats["categories"]["ros2"], stats["commands"]["ros2"]),
            (total_categories, total_commands),
        ]
        for i, (ec, en_) in enumerate(expected_rows):
            if i >= len(rows):
                break
            got_c, got_n = int(rows[i][0]), int(rows[i][1])
            if got_c != ec or got_n != en_:
                errors.append(
                    f"{readme_path.name} 表格第{i+1}行 ({got_c},{got_n}) "
                    f"!= 期望 ({ec},{en_})"
                )
        print(f"README 一致: {readme_path.name} 表格 = "
              f"{[(int(c), int(n)) for c, n in rows[:3]]}")

    if errors:
        print("\n[FAIL] 发现不一致:")
        for e in errors:
            print(f"  - {e}")
        return 1

    print(f"\n[PASS] 全部校验通过: {total_commands} 条命令 / "
          f"{total_categories} 类 / {len(VERSIONS)} 版本")
    return 0


if __name__ == "__main__":
    sys.exit(main())