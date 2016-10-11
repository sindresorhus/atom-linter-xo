# linter-xo

> [Linter](https://github.com/atom-community/linter) for [XO](https://github.com/sindresorhus/xo)

![](https://github.com/sindresorhus/atom-linter-xo/raw/master/screenshot.png)


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


## Fix

Automagically fix many of the linter issues by running `XO: Fix` in the Command Palette.


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
