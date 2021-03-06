---
to: <%= h.changeCase.param(name) %>/tsconfig.json
---
{
    "compilerOptions": {
      "jsx": "react",
      "module": "commonjs",
      "noImplicitAny": true,
      "outDir": "./build/",
      "preserveConstEnums": true,
      "removeComments": true,
      "sourceMap": true,
      "target": "es5",
      "baseUrl": "./client",
      "esModuleInterop": true,
      "declaration": false
    },
    "exclude": ["__tests__", "build", "server"]
  }
