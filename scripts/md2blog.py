#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Markdown 转 Blog 自动化脚本
用法: python scripts/md2blog.py blog_sources/your_post.md
或:   python scripts/md2blog.py blog_sources/  # 处理目录下所有 .md
将 Markdown（含 YAML front matter）转为站点 blog 文章，并可选更新主页 Blog 列表。
"""

import os
import re
import shutil
import sys
from pathlib import Path

# 项目根目录（脚本在 scripts/ 下）
ROOT = Path(__file__).resolve().parent.parent
POSTS_DIR = ROOT / "posts"
BLOG_SOURCES = ROOT / "blog_sources"
# 以哪一篇为模板复制（需已有完整 assets）
TEMPLATE_SLUG = "percolation"
BASE_URL = "https://zhihangliu.cn"


def parse_front_matter(content: str) -> tuple[dict, str]:
    """解析 YAML front matter，返回 (meta, body)。"""
    if not content.strip().startswith("---"):
        return {}, content
    parts = content.split("---", 2)
    if len(parts) < 3:
        return {}, content
    import yaml
    try:
        meta = yaml.safe_load(parts[1]) or {}
    except Exception:
        meta = {}
    return meta, parts[2].lstrip("\n")


def md_to_html(md: str) -> str:
    """将 Markdown 转为 HTML（支持常用扩展）。"""
    try:
        import markdown
        return markdown.markdown(
            md,
            extensions=["extra", "codehilite", "toc", "tables"],
            extension_configs={"codehilite": {"css_class": "highlight"}},
        )
    except ImportError:
        # 无 markdown 时做最简转换
        import html
        lines = []
        for line in md.split("\n"):
            line = html.escape(line)
            if line.startswith("### "):
                lines.append(f"<h3>{line[4:]}</h3>")
            elif line.startswith("## "):
                lines.append(f"<h2>{line[3:]}</h2>")
            elif line.startswith("# "):
                lines.append(f"<h1>{line[2:]}</h1>")
            else:
                lines.append(f"<p>{line}</p>" if line.strip() else "")
        return "\n".join(lines)


def escape_bibtex_for_html(bibtex: str) -> str:
    return bibtex.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def build_bibtex_block(bibtex: str) -> str:
    """生成底部 Citation (BibTeX) 区块 HTML。"""
    escaped = escape_bibtex_for_html(bibtex.strip())
    return (
        '<div class="blog-citation content-widget-hr">\n'
        '            <h5 class="card-title">Citation (BibTeX)</h5>\n'
        '            <pre class="blog-bibtex-content bg-light p-3 rounded border"><code>'
        + escaped +
        "</code></pre>\n"
        "          </div>"
    )


def process_one_md(md_path: Path, meta: dict, body_html: str, bibtex: str, slug: str) -> None:
    """根据模板生成或更新一篇 post。"""
    out_dir = POSTS_DIR / slug
    index_file = out_dir / "index.html"

    # 若不存在则从模板复制整站
    if not index_file.exists():
        template_dir = POSTS_DIR / TEMPLATE_SLUG
        if not template_dir.exists():
            print(f"  [错误] 模板目录不存在: {template_dir}")
            return
        shutil.copytree(template_dir, out_dir, dirs_exist_ok=False)
        print(f"  已从模板复制并创建: {out_dir}")

    if not index_file.exists():
        print(f"  [错误] 未找到 {index_file}")
        return

    title = meta.get("title", slug)
    description = meta.get("description", title)
    date_str = meta.get("date", "")
    reading_time = str(meta.get("reading_time_min", 5)) + " min read"
    canonical = f"{BASE_URL}/posts/{slug}/"

    with open(index_file, "r", encoding="utf-8") as f:
        html = f.read()

    # 替换 head 内 meta
    def escape_title(s):
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    html = re.sub(
        r"<title>[^<]*</title>",
        f"<title>{escape_title(title)}</title>",
        html,
        count=1,
    )
    html = re.sub(
        r'<meta name="description" content="[^"]*">',
        f'<meta name="description" content="{description[:200]}">',
        html,
        count=1,
    )
    html = re.sub(
        r'<link rel="canonical" href="[^"]*">',
        f'<link rel="canonical" href="{canonical}">',
        html,
        count=1,
    )
    html = re.sub(
        r'<meta property="og:url" content="[^"]*">',
        f'<meta property="og:url" content="{canonical}">',
        html,
        count=1,
    )
    html = re.sub(
        r'<meta property="og:title" content="[^"]*">',
        f'<meta property="og:title" content="{title}">',
        html,
        count=1,
    )
    html = re.sub(
        r'<meta property="og:description" content="[^"]*">',
        f'<meta property="og:description" content="{description[:200]}">',
        html,
        count=1,
    )

    # 替换正文标题与日期
    html = re.sub(
        r"<h1>[\s\S]*?</h1>\s*<div class=\"article-metadata\">[\s\S]*?<span class=\"article-reading-time\">[^<]*</span>",
        (
            f"<h1>{title}</h1>\n"
            f"        <div class=\"article-metadata\"><span class=\"article-date\">Last updated on\n            {date_str}</span>\n"
            f"          <span class=\"middot-divider\"></span>\n"
            f"          <span class=\"article-reading-time\">{reading_time}</span>\n"
            "        </div>"
        ),
        html,
        count=1,
    )

    # 替换 article-style 正文：从 <div class="article-style"> 到 <div class="blog-citation"> 之间的内容
    marker_start = '<div class="article-style">'
    marker_end = '<div class="blog-citation'  # match with or without space before content-widget-hr
    i = html.find(marker_start)
    j = html.find(marker_end, i)
    if i != -1 and j != -1:
        # 保留 start 标签后的换行与缩进，替换中间为正文
        after_start = i + len(marker_start)
        inner = html[after_start:j]
        # 只替换正文部分（去掉原有首尾空白）
        new_inner = "\n\n          " + body_html.strip() + "\n\n          "
        html = html[: after_start] + new_inner + html[j:]

    # 替换 Citation 区块
    citation_block = build_bibtex_block(bibtex)
    html = re.sub(
        r'<div class="blog-citation content-widget-hr">[\s\S]*?</pre>\s*</div>',
        citation_block,
        html,
        count=1,
    )

    with open(index_file, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"  已更新: {index_file}")


def main():
    if len(sys.argv) < 2:
        print("用法: python scripts/md2blog.py blog_sources/your_post.md 或 blog_sources/")
        sys.exit(1)

    try:
        import yaml
    except ImportError:
        print("请安装 PyYAML: pip install pyyaml")
        sys.exit(1)

    path = Path(sys.argv[1]).resolve()
    if not path.exists():
        print(f"文件或目录不存在: {path}")
        sys.exit(1)

    if path.is_file():
        md_files = [path] if path.suffix.lower() == ".md" else []
    else:
        md_files = sorted(path.glob("*.md"))

    if not md_files:
        print("未找到 .md 文件")
        sys.exit(0)

    for md_path in md_files:
        print(f"处理: {md_path}")
        raw = md_path.read_text(encoding="utf-8")
        meta, body = parse_front_matter(raw)
        slug = meta.get("slug") or md_path.stem
        slug = re.sub(r"[^a-z0-9_-]", "", slug.lower()) or "post"
        bibtex = meta.get("bibtex", "").strip()
        if not bibtex:
            title = meta.get("title", slug)
            raw_key = slug.replace("-", "") + str(meta.get("year", "2024"))
            key = raw_key[:30]
            url = f"{BASE_URL}/posts/{slug}/"
            bibtex = f"@misc{{{key},\n  author = {{Liu, Zhihang}},\n  title = {{{title}}},\n  year = {{{meta.get('year', '2024')}}},\n  url = {{{url}}}\n}}"
        body_html = md_to_html(body)
        process_one_md(md_path, meta, body_html, bibtex, slug)

    print("完成。")


if __name__ == "__main__":
    main()
