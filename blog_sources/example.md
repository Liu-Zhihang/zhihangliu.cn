---
title: "Example Blog Title"
slug: example
date: Oct 1, 2024
description: "Short description for SEO and preview."
reading_time_min: 5
year: "2024"
# 可选：自定义 BibTeX（不填则自动生成，不含 publisher）
# bibtex: |
#   @misc{example2024,
#     author = {Liu, Zhihang},
#     title = {Example Blog Title},
#     year = {2024},
#     url = {https://zhihangliu.cn/posts/example/}
#   }
---

正文使用 **Markdown** 书写，支持标题、列表、公式（若模板页含 MathJax）、代码块等。

## 小节标题

- 列表项一
- 列表项二

```python
def hello():
    print("Hello, Blog.")
```

写完后在项目根目录执行：

```bash
python scripts/md2blog.py blog_sources/example.md
```

会在 `posts/example/` 生成或更新文章（首次会从 `posts/percolation` 复制模板与资源）。
