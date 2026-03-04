# Nocturne Minimal Analytics (idea-01)

This folder is a portable design bucket for reuse in external projects.

## Files

- `bucket.json`: Full machine-readable design bucket
- `tokens.css`: Theme-scoped CSS variables under `.theme-idea-01`
- `agent-context.md`: Prompting instructions for project agents

## Use in a project

1. Import `tokens.css`.
2. Wrap your app root with class ``.theme-idea-01``.
3. Feed `bucket.json` + `agent-context.md` to your implementation agent.
