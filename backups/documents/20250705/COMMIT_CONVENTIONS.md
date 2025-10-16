# Commit Message Conventions

## Overview

This project adheres to the **Conventional Commits specification** for writing commit messages. This leads to more readable and consistent commit histories, enables easier automation (e.g., generating changelogs), and clearly communicates the nature of changes.

**All contributors, including AI assistants, are required to follow these conventions.**

**Reference**: [Conventional Commits Specification v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)

---

## Structure of a Commit Message

A commit message consists of a header, an optional body, and an optional footer.

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 1. Header

The header is mandatory and includes:

- **`type`**: Indicates the kind of change being committed. See "Common Types" below.
- **`optional scope`** (lowercase, enclosed in parentheses): A noun describing a section of the codebase affected by the change (e.g., `auth`, `dashboard`, `api`, `deps`). Using a scope is highly recommended for clarity.
- **`description`**: A concise, imperative mood, lowercase description of the change. It should not be capitalized and should not end with a period.
  - Example: `feat(auth): add google oauth2 login`
  - Example: `fix: correct typo in user model`

### 2. Body (Optional)

- Provides additional contextual information about the code changes.
- Written in the imperative mood (e.g., "Fixes issue..." rather than "Fixed issue...").
- Used to explain _what_ and _why_ vs. _how_.
- Separate from the header with a blank line.

### 3. Footer (Optional)

- Used for referencing issue tracker IDs or indicating breaking changes.
- **Breaking Changes**: Start with `BREAKING CHANGE:` (or `BREAKING-CHANGE:`) followed by a description of the breaking change. A breaking change can be part of any `type`.

  - Example:

    ```
    feat: allow provided config object to extend other configs

    BREAKING CHANGE: `extends` key in config file is now used for extending other config files
    ```

- **Issue Tracking**: Reference issues by their numbers.
  - Example: `Fixes #123`, `Closes #456`, `Resolves: PROJ-789`

---

## Common Types

While the specification allows for any type, we primarily use the following (based on Angular conventions):

- **`feat`**: A new feature for the user.
- **`fix`**: A bug fix for the user.
- **`docs`**: Documentation only changes (e.g., to `README.md`, `*.md` files in `/docs`).
- **`style`**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.). Not to be confused with CSS style changes.
- **`refactor`**: A code change that neither fixes a bug nor adds a feature (e.g., renaming a variable, improving code structure without changing behavior).
- **`perf`**: A code change that improves performance.
- **`test`**: Adding missing tests or correcting existing tests.
- **`build`**: Changes that affect the build system or external dependencies (e.g., scopes: gulp, broccoli, npm, Jenkins).
- **`ci`**: Changes to our CI configuration files and scripts (e.g., Jenkinsfile, GitHub Actions workflows).
- **`chore`**: Other changes that don't modify `src` or `test` files (e.g., updating build tasks, package manager configs).
- **`revert`**: Reverts a previous commit.

---

## Examples

**Simple fix with no scope:**

```
fix: correct minor typo in welcome message
```

**New feature with a scope:**

```
feat(profile): allow users to upload avatar image
```

**Refactor with scope and body:**

```
refactor(api): simplify user data fetching logic

Removed redundant calls and streamlined the data transformation process
for better performance and readability.
```

**Fix with scope, body, and issue reference:**

```
fix(auth): prevent login with expired token

The previous implementation did not correctly validate the token expiry.
This change adds a check and returns an appropriate error.

Resolves: #231
```

**New feature with breaking change:**

```
feat(api): change user ID from int to uuid

BREAKING CHANGE: The user ID format in the API response for `/users/:id`
has changed from an integer to a UUID string. Consumers of this API
must update their data models accordingly.
```

---

## Enforcement

These commit message conventions are enforced automatically:

- **Pre-commit Hook**: Using **`commitlint`** (configured with Husky), commit messages are validated locally before a commit is allowed.
- **CI/CD Pipeline**: Commits pushed to the repository may also be validated by `commitlint` in the CI pipeline.

If a commit message does not meet the conventions, the commit will be rejected, and a message will indicate what needs to be fixed.

---

Adherence to these conventions is vital for a clean, understandable, and maintainable project history.
