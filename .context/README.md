# Context Libraries

This directory contains git subtrees of library documentation and examples for reference when working with this codebase.

## Subtree Repositories

The following repositories are included as git subtrees:

- **Effect** (`.context/effect/`)
  - Repository: https://github.com/Effect-TS/effect
  - Branch: main
  - Purpose: Effect-TS functional programming library documentation and examples

- **Effect Atom** (`.context/effect-atom/`)
  - Repository: https://github.com/tim-smart/effect-atom
  - Branch: main
  - Purpose: Effect Atom state management library documentation and examples

- **TanStack DB** (`.context/tanstack-db/`)
  - Repository: https://github.com/TanStack/db
  - Branch: main
  - Purpose: TanStack DB query and collection management library documentation and examples

## Updating Subtrees

To update all subtrees to their latest versions, run:

```bash
# Update Effect
git subtree pull --prefix=.context/effect effect-subtree main --squash

# Update Effect Atom
git subtree pull --prefix=.context/effect-atom effect-atom-subtree main --squash

# Update TanStack DB
git subtree pull --prefix=.context/tanstack-db tanstack-db-subtree main --squash
```

Note: The git remotes should already be configured. If not, add them first:

```bash
git remote add effect-subtree https://github.com/Effect-TS/effect
git remote add effect-atom-subtree https://github.com/tim-smart/effect-atom
git remote add tanstack-db-subtree https://github.com/TanStack/db
```

## Usage

These libraries are referenced in the main CLAUDE.md file. Always check the `.context/` directory for library-specific documentation and example code before implementing features with these libraries.
