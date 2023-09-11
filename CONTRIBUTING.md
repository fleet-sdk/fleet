# Fleet SDK Contributing Guide

Hi! We're really excited that you're interested in contributing to Fleet SDK! Before submitting your contribution, please read through the following guide.

## Repo Setup

The Fleet SDK repo is a monorepo using pnpm workspaces. The package manager used to install and link dependencies must be [pnpm](https://pnpm.io/).

In `fleet`'s root directory, run the following commands:

1. `pnpm install` to install dependencies.

2. `pnpm -r build` to build all packages.

3. `pnpm watch:unit core` to run unit tests in watch mode.

> 💡 If you use VS Code, you can hit `⇧ ⌘ B` or `Ctrl + Shift + B` to launch all the necessary dev tasks.

We recommend installing [ni](https://github.com/antfu/ni) to help switching between repos using different package managers, but that's totally optional. `ni` also provides the handy `nr` command which running npm scripts easier:

- `ni` is equivalent to `pnpm install`.
- `nr test` is equivalent to `pnpm test`.

## Pull Request Guidelines

- Checkout a topic branch from a base branch, e.g. `master`, and merge back against that branch.

- If adding a new feature:

  - Add accompanying test case.
  - Provide a convincing reason to add this feature. Ideally, you should open a suggestion issue first and have it approved before working on it.

- If fixing a bug:

  - Provide a detailed description of the bug in the PR.
  - Add appropriate test coverage if applicable.

- It's OK to have multiple small commits as you work on the PR - GitHub can automatically squash them before merging.

- Make sure tests pass!

- Use `pnpm fix` to format files according to the project guidelines.

### Dependencies

Fleet SDK aims to be lightweight, which involves being conscious of the number of npm dependencies and their size.

- Avoid dependencies with large transitive dependencies that result in bloated size in comparison to their provided functionality.

### Coverage

Fleet SDK is a security-critical tool. Therefore, it is essential to ensure everything is working as expected. Besides a conservative development approach and careful implementations, Fleet SDK aims to ensure that 100% of the code is covered by unit tests.