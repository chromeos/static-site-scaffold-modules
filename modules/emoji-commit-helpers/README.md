# Emoji Commit Helpers

This module assist users in using the Emoji-style git commit format `:emoji: (scope) Subject`. It currently makes sharing emoji and scope possible between [Commitizen](https://www.npmjs.com/package/commitizen) and [Commitlint](https://www.npmjs.com/package/@commitlint/cli) easy and can automatically generate package-based scopes for [Lerna](https://www.npmjs.com/package/lerna) projects.

## Configuring Commitizen and Commitlint

### Commitizen

In `package.json`, add the following:

```json
{
  "config": {
    "commitizen": {
      "path": "./node_modules/emoji-commit-helpers/commitizen.js"
    }
  }
}
```

### Commitlint

In `.commitlintrc.js`, do the following:

```js
const config = require('emoji-commit-helpers/commitlint');

module.exports = config;
```

This will set all the rules, patterns, and helpers you need correctly. The commitlint configuration supports either the actual emoji or the emoji code (`:code:`).

### Run Both on Code Commit

To run both Commitizen (to prepare your commit message) and Commitlint (to ensure your commit message is formatted correctly) automatically, first install `husky`, `@commitlint/cli`, and `@commitizen`, then add the following to your `package.json` file:

```json
{
  "husky": {
    "hooks": {
      "prepare-commit-msg": "exec < /dev/tty && git-cz --hook || true",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
```

## Configuring Emoji Commit Helpers

To configure Emoji Commit Helpers, first add one of the following files:

- `.commitrc`
- `.commitrc.yml`
- `.commitrc.json`
- `.commitrc.js`

Then, configure either the types to include and/or the scopes:

```yml
emoji:
  - style
  - perf
  - prune
  - fix
  - quickfix
  - docs
  - feature
scopes:
  - name: Root
    description: Root of my project
  - name: Modules
    description: Project Modules
```

## Available Emoji

| Type         | Emoji | Code                  | Description                                |
| :----------- | :---: | :-------------------- | :----------------------------------------- |
| style        |  🎨   | `:art:`               | Improving structure / format of the code.  |
| perf         |  🐎   | `:racehorse:`         | Improving performance.                     |
| prune        |  🔥   | `:fire:`              | Removing code or files.                    |
| fix          |  🐛   | `:bug:`               | Fixing a bug.                              |
| quickfix     |  🚑   | `:ambulance:`         | Critical hotfix.                           |
| feature      |  🆕   | `:new:`               | Introducing new features.                  |
| docs         |  📝   | `:memo:`              | Writing docs.                              |
| deploy       |  🚀   | `:rocket:`            | Deploying stuff.                           |
| ui           |  💎   | `:gem:`               | Updating the UI and style files.           |
| init         |  🎉   | `:tada:`              | Initial commit.                            |
| test         |  ✅   | `:white_check_mark:`  | Adding tests.                              |
| security     |  🔒   | `:lock:`              | Fixing security issues.                    |
| release      |  🔖   | `:bookmark:`          | Releasing / Version tags.                  |
| lint         |  👕   | `:shirt:`             | Removing linter warnings.                  |
| wip          |  🚧   | `:construction:`      | Work in progress.                          |
| fix-ci       |  💚   | `:green_heart:`       | Fixing CI Build.                           |
| downgrade    |  ⬇️   | `:arrow_down:`        | Downgrading dependencies.                  |
| upgrade      |  ⬆️   | `:arrow_up:`          | Upgrading dependencies.                    |
| pushpin      |  📌   | `:pushpin:`           | Pinning dependencies to specific versions. |
| refactoring  |  ♻️   | `:recycle:`           | Refactoring code.                          |
| dep-add      |  ➕   | `:heavy_plus_sign:`   | Adding a dependency.                       |
| dep-rm       |  ➖   | `:heavy_minus_sign:`  | Removing a dependency.                     |
| config       |  🔧   | `:wrench:`            | Changing configuration files.              |
| compat       |  👽   | `:alien:`             | Updating code due to external API changes. |
| mv           |  🚚   | `:truck:`             | Moving or renaming files.                  |
| breaking     |  💥   | `:boom:`              | Introducing breaking changes.              |
| docs-code    |  💡   | `:bulb:`              | Documenting source code.                   |
| ux           |  🚸   | `:children_crossing:` | Improving user experience / usability.     |
| see-no-evil  |  🙈   | `:see_no_evil:`       | Adding or updating a .gitignore file       |
| camera-flash |  📸   | `:camera_flash:`      | Adding or updating snapshots               |
| experiment   |  🔮   | `:crystal_ball:`      | Experimenting new things                   |
