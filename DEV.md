
## Install
```bash
yarn add ts-node --dev
yarn tsc -w
#./bin/index.js 
node --experimental-specifier-resolution=node ./bin/index.js deploy prod
```
## Jest Testing Framework
```bash
yarn add jest @types/jest ts-jest --dev
yarn add @types/archiver --dev
```
jest.config.ts
```bash
export default {
  preset: "ts-jest", 
  testEnvironment: "node",
}
```
package.json
```bash
{
  "scripts": {
    "test": "jest"
  }
}
```
```bash
yarn test
```

## index.ts
```bash
const pkgs = new Map([ ['lodash', ''] ]);

(async function init() {
  await AppHelper.checkPkgs(pkgs);
})();
```
