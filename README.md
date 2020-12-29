# mapineda-react

some personal tools.

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
    "main": {
      "entry": "my/custom/path/entry.js",
      "output": "my/custom/path/build.js",
      "url": "my/custom/url"
    },
    "default": "main"
  }
}
```

### start

configuration default entry

```shell
yarn mapineda start
```

argument entry

```shell
yarn mapineda start my/path/entry.js
```

argument entry alias

```shell
yarn mapineda start main
```

### build

configuration default entry

```shell
yarn mapineda build
```

argument alias

```shell
yarn mapineda build main
```

argument entry and argument build

```shell
yarn mapineda build --entry my/entry.jsx --output my/build
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
