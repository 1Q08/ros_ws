#!/usr/bin/env python3
# =====================================================================
# scripts/publish_address_book.py —— 可执行入口脚本
# 作用:薄薄一层"命令行入口",真正逻辑在库模块里。
# 它负责:
#   1. 把 more_interfaces_py 的库目录加入 sys.path(在未 source 时也能找到)
#   2. 调用库模块中的 main()
# 这样既保证了库可被 import 复用,又保留了 ros2 run 直连入口。
# =====================================================================

import os
import sys

# 将本文件所在目录的上一级(包源码根目录)加入模块搜索路径,
# 使 import addr_book_lib 在未脱离源码树时也能工作。
sys.path.insert(
    0,
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
)

# 从库模块导入 main 函数
from addr_book_lib.publish_address_book import main  # noqa: E402

if __name__ == "__main__":
    main()