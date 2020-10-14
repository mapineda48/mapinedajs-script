# mapineda-script

Some personal scripts for nodejs development

## Installation

Before installing, make sure to authenticate with GitHub Package Registry or using a `.npmrc` file. See "[Configuring npm for use with GitHub Package Registry](https://help.github.com/en/articles/configuring-npm-for-use-with-github-package-registry#authenticating-to-github-package-registry)."

`$ npm install mapineda-script`

**Install peer dependencies**

## Configurations

create `mapineda.json` in project root

```json
{
  "react-scripts": {
    "entry": "my/custom/path/entry.js",
    "build": "my/custom/path/build.js",
    "apps": [
      {
        "entry": "my/custom/path/entry.js",
        "build": "my/custom/path/build.js"
      }
    ]
  },

  "publish": {
    "package": {},
    "files": ["files/should/be/add.js"],
    "trashs": ["files/should/be/remove.js"]
  }
}
```

## Usage

## react-scripts

Before use it you should do bootstrapping with [Create React App](https://github.com/facebook/create-react-app).

### start

configuration entry

```shell
yarn mapineda-script --react-scripts start
```

argument entry

```shell
yarn mapineda-script --react-scripts start my/path/entry.js
```

### build

configuration entry

```shell
yarn mapineda-script --react-scripts build
```

argument entry and argument build

```shell
yarn mapineda-script --react-scripts build --entry my/entry.jsx --build my/build
```

configuration apps

```shell
yarn mapineda-script --react-scripts build --apps
```

### pack

**Warning this is experimental**

try with configurations create a final distribution package

```shell
yarn mapineda-script --pack
```

### publish

**Warning this is experimental**

try with configurations publish a final distribution package on github

```shell
yarn mapineda-script --publish
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
