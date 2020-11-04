# mapineda-react

Some personal scripts for nodejs development

## Installation

`$ yarn add mapineda-react`

**Install peer dependencies**

## Usage

## react-scripts

Minimal overwrite react-scripts config without eject.

Before use it you should do bootstrapping with [Create React App](https://github.com/facebook/create-react-app).

### Configurations

set on `package.json`

```json
{
  "react-scripts": {
    "entry": "my/custom/path/entry.js",
    "output": "my/custom/path/build.js",
    "url": "my/custom/url"
  }
}
```

### start

configuration entry

```shell
yarn mapineda start
```

argument entry

```shell
yarn mapineda start my/path/entry.js
```

### build

configuration entry

```shell
yarn mapineda build
```

argument entry and argument build

```shell
yarn mapineda build --entry my/entry.jsx --output my/build
```

## pack or publish

**Warning this is experimental**

### Configurations

set on `publish.json`

```json
{
  "package": {},
  "files": ["files/should/be/add.js"],
  "trashs": ["files/should/be/remove.js"]
}
```

```shell
yarn mapineda pack
```

```shell
yarn mapineda publish
```

## Environment development

- Debian GNU/Linux 10 (buster)
- Nodejs v12.18.3
- yarn v1.22.5
- VSCode v1.48.2

## License

MIT

**Free Software, Hell Yeah!**

## Disclaimer

- This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
