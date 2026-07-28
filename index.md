---
layout: default
title: Home
---

# Welcome

This is my GitHub Pages blog powered by Jekyll.

## Latest Posts

{% assign posts_to_show = paginator.posts | default: site.posts %}
{% for post in posts_to_show %}
- [{{ post.title }}]({{ post.url }}) — {{ post.date | date: "%B %-d, %Y" }}
{% endfor %}

<nav>
  {% if paginator and paginator.previous_page %}
    <a href="{{ paginator.previous_page_path }}">← Newer posts</a>
  {% endif %}
  {% if paginator and paginator.next_page %}
    <a href="{{ paginator.next_page_path }}" style="float:right;">Older posts →</a>
  {% endif %}
</nav>
