---
layout: default
title: Home
---

# Welcome

This is my GitHub Pages blog powered by Jekyll and the **Midnight** theme.

## Latest Posts

{% for post in site.posts %}
- [{{ post.title }}]({{ post.url }}) — {{ post.date | date: "%B %-d, %Y" }}
{% endfor %}
