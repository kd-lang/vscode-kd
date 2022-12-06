# vscode-kd

`Kd-Lang` support for Visual Studio Code.

## Features

 - syntax highlighting
 - basic compiler linting
 - automatic formatting

## Automatic Formatting

To enable automatic formatting add the `kd` command to your `PATH`, or
modify the `Kd Path` setting to point to the `kd` binary.

## Creating .vsix extension file

```
npm install
npm run compile
npx vsce package
```