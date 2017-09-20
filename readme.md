# linter-xo [![Build Status](https://travis-ci.org/sindresorhus/atom-linter-xo.svg?branch=master)](https://travis-ci.org/sindresorhus/atom-linter-xo)

> [Linter](https://github.com/atom-community/linter) for [XO](https://github.com/sindresorhus/xo)

![](screenshot.png)


## Install

```
$ apm install linter-xo
```

Or, Settings → Install → Search for `linter-xo`.


## Usage

Just write some code.

Settings can be found in the `Linter` package settings. XO [config](https://github.com/sindresorhus/xo#config) should be defined in package.json.

**Note that it will only lint when XO is a dependency/devDependency in package.json.**<br>
This is to ensure it doesn't activate and conflict on projects using another linter, like ESLint.<br>
[We're considering a way to manually enable XO.](https://github.com/sindresorhus/atom-linter-xo/issues/21)

### Fix

Automagically fix many of the linter issues by running `XO: Fix` in the Command Palette.

#### Fix on save

You can also have it fix the code when you save the file. *(Only when XO is used in the project)*

Enable it by going to; Settings → Packages → linter-xo → Settings, and then checking `Fix On Save`.


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
