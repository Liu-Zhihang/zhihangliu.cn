# Blog 更新流程（Markdown → 站点文章）

## 1. 写 Markdown

在 `blog_sources/` 下新建或编辑 `.md` 文件，**必须**在文件开头写 YAML front matter，例如：

```yaml
---
title: "文章标题"
slug: url-用的英文标识"       # 可选，默认用文件名
date: Oct 1, 2024
description: "简短描述，用于 SEO 和首页摘要"
reading_time_min: 5
year: "2024"
# 可选：自定义 BibTeX（不写则脚本按 title/year/url 自动生成，不含 publisher）
# bibtex: |
#   @misc{key2024,
#     author = {Liu, Zhihang},
#     title = {文章标题},
#     year = {2024},
#     url = {https://zhihangliu.cn/posts/slug/}
#   }
---
```

正文用标准 Markdown（标题、列表、代码块、公式等均可）。

## 2. 生成 / 更新文章

在**项目根目录**执行：

```bash
# 单篇
python scripts/md2blog.py blog_sources/your_post.md

# 或处理 blog_sources 下所有 .md
python scripts/md2blog.py blog_sources/
```

- **首次**：会从 `posts/percolation` 复制整站（含 assets）到 `posts/<slug>/`，再替换标题、正文、底部 BibTeX。
- **已有文章**：只替换同一篇的标题、正文和 Citation 区块，不覆盖其它文件。

## 3. 依赖

- Python 3
- `PyYAML`：`pip install pyyaml`
- 可选：`markdown`（带 extra/codehilite）：`pip install markdown`，没有则用简易转换

## 4. 主页 Blog 列表

当前主页的 Blog 列表在 `index.html` 里手写。若希望「新加一篇就自动出现在列表」，可以：

- 在 `blog_sources/` 的 front matter 里加 `list_description`，再由脚本扫一遍 `blog_sources/*.md` 生成一段 HTML 或 JSON，你粘贴进 `index.html` 的 Blog 区块；或
- 维护一份 `blog_list.json`，脚本在生成文章时追加/更新该 JSON，再写一个脚本根据 JSON 生成 `index.html` 中的 Blog 列表。

需要的话可以再帮你把「自动更新主页列表」做进当前脚本。

## 5. 小结

| 步骤 | 操作 |
|------|------|
| 写文 | 在 `blog_sources/xxx.md` 写 front matter + Markdown 正文 |
| 生成 | `python scripts/md2blog.py blog_sources/xxx.md` |
| 结果 | `posts/xxx/index.html` 被创建或更新，底部为 Citation (BibTeX)，无个人简介 |

每篇文底部是 **Citation (BibTeX)** 框，不含 publisher；BibTeX 可在 front matter 里自定义，不写则自动生成。
