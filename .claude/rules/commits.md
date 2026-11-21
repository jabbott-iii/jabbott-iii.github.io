# Commits

## When to commit

- When you finish a task that changed files in this repository, commit the changes before
  ending your turn. Don't wait to be asked, and don't leave finished work uncommitted.
- Commit only once the work is complete and checked as described in the "Before finishing" list
  in `writing-and-frontend.md`. Don't commit work that is half done or knowingly broken.
- Commit on the current branch; this repository works directly on `main`.
- Never push, force-push, amend or rebase a commit that has been pushed, or rewrite history
  unless the user asks. Pushing to `main` publishes the site.
- Stage files by path (`git add <path> …`), not with `git add -A` or `git add .`. Commit only
  what the task changed, and leave unrelated changes in the working tree alone.
- Never commit secrets, credentials, `_site/`, `.jekyll-cache/`, or anything else in
  `.gitignore`.

## One change per commit

- Each commit holds one logical change that can be described in one subject line. Split
  unrelated work into separate commits: for example, a new post, a CSS fix, and a rule change
  are three commits.
- Keep a change and the things it requires together: a post and the `_data/projects.yml` entry
  it needs belong in the same commit.

## Message format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<scope>): <summary>

<body>

<trailers>
```

### Type

| Type | Use it for |
| --- | --- |
| `feat` | A new page, section, or site feature (a filter, the carousel, a new include) |
| `fix` | Something broken: a layout bug, a broken link, a script error, a wrong fact in a post |
| `docs` | Written content: new or revised posts, page copy, `README.md`, `_data/` text |
| `refactor` | Restructured templates, CSS, or JavaScript with no visible change |
| `perf` | Faster loading or rendering |
| `style` | Formatting only (whitespace, indentation). Not for visual design, which is `feat` or `fix` |
| `build` | `Gemfile`, `_config.yml` build settings, and GitHub Pages configuration |
| `ci` | GitHub Actions workflows |
| `chore` | Repository upkeep: `.gitignore`, `.claude/` rules and settings |
| `revert` | Undoing an earlier commit; the body names the commit's hash |

### Scope

The scope is optional and names the area changed, in lowercase: `posts`, `log`, `home`,
`resume`, `deployments`, `layout`, `seo`, `css`, `js`, `data`, `readme`, `claude`. Leave it out
when a change spans several areas.

### Summary line

- Use the imperative mood, as if completing "This commit will …": "add", "fix", "rewrite",
  "remove". Not "added", "adds", or "adding".
- Start with a lowercase letter, and don't end with a period.
- Keep the whole line, prefix included, to 72 characters or fewer; aim for 50.
- Say specifically what changed: "docs(posts): add Nadir architecture deep dive", not "chore:
  added post". Never use vague summaries such as "update", "modified text", "changes",
  "misc fixes", "wip", or "stuff".
- Name things the way readers know them: the post's subject or title, the page, the component.

### Body

- Add a body after one blank line whenever the summary alone doesn't explain the change. Leave
  it out only for small, self-explanatory changes.
- Explain what changed and why, not how; the diff shows how. Mention anything a reviewer would
  otherwise miss: a URL that changed, a deliberate trade-off, something left for later.
- Wrap lines at 72 characters. Use a short bulleted list (`- `) when the commit makes several
  related changes.
- Follow the writing rules in `writing-and-frontend.md`: American spelling, plain language,
  correct grammar, and code formatting with backticks for file names and commands.

### Trailers

- Put trailers after one blank line at the end: `Closes #12` or `Refs #12` for GitHub issues,
  and `BREAKING CHANGE: …` if a change breaks existing URLs or behavior.
- Keep any attribution trailer (such as `Co-Authored-By:`) that Claude Code adds.

## Examples

```text
docs(posts): add Nadir architecture deep dive

Walk through Nadir's layers from the OS bindings to the release
pipeline, with the performance budgets and what ships in 0.2.0.
```

```text
fix(css): stop long code lines from widening post pages

Wide code blocks pushed the page wider than the viewport on phones.
Scroll them inside the block instead.
```

```text
chore(claude): add commit message rules
```
