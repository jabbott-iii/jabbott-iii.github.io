---
layout: default
title: Home
---

# Welcome

This is my GitHub Pages blog powered by Jekyll and the **Midnight** theme.

## Latest Posts

{% for post in paginator.posts %}
- [{{ post.title }}]({{ post.url }}) — {{ post.date | date: "%B %-d, %Y" }}
{% endfor %}

<nav>
  {% if paginator.previous_page %}
    <a href="{{ paginator.previous_page_path }}">← Newer posts</a>
  {% endif %}
  {% if paginator.next_page %}
    <a href="{{ paginator.next_page_path }}" style="float:right;">Older posts →</a>
  {% endif %}
</nav>
