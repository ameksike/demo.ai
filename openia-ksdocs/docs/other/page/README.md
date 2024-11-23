# KsDoc library 
KsDoc is a versatile library within the Ksike ecosystem, designed to streamline and simplify the documentation process for various application types, including CLI, web, and API development. This library integrates seamlessly with Swagger and JSDoc, harnessing their combined power to provide comprehensive and intuitive documentation.

- **Unified Documentation:** KsDoc unifies the documentation process, catering to the diverse needs of CLI, web, and API applications.

- **Intuitive Documentation Generation:** The library simplifies the generation of documentation, making it an intuitive process for developers.

- **Swagger Integration:** Seamless integration with Swagger ensures that APIs are well-documented, conforming to industry standards.

- **JSDoc Integration:** By leveraging JSDoc, KsDoc enhances code documentation, ensuring clarity and consistency in the codebase.

- **Multi-Area Support:** KsDoc supports documentation across various areas, providing a holistic solution for different application domains.

This library belong to the Ksike ecosystem:
- [KsMf](https://www.npmjs.com/package/ksmf) - Microframework (WEB, REST API, CLI, Proxy, etc)
- [Ksdp](https://www.npmjs.com/package/ksdp) - Design Patterns Library (GoF, GRASP, IoC, DI, etc)
- [KsCryp](https://www.npmjs.com/package/kscryp) - Cryptographic Library (RSA, JWT, x509, HEX, Base64, Hash, etc) 
- [KsHook](https://www.npmjs.com/package/kshook) - Event Driven Library
- [KsEval](https://www.npmjs.com/package/kseval) - Expression Evaluator Library 
- [KsWC](https://www.npmjs.com/package/kswc) - Web API deployment Library
- [KsTpl](https://www.npmjs.com/package/kstpl) - Template Engine
- [KsDoc](https://www.npmjs.com/package/ksdocs) - Document Engine

KsDoc stands out as a valuable addition to the Ksike ecosystem, offering developers an efficient and unified solution for documentation needs across diverse application types. With support for CLI, web, and API documentation, seamless integration with Swagger and JSDoc, and an emphasis on intuitive processes, KsDoc empowers developers to create well-documented and user-friendly applications.


## Quick overview

- Server file:
```Js
const express = require("express");
const ksdocs = require("ksdocs");

const app = express();

ksdocs.configure({
    path: {
        root: __dirname + "/docs"
    }
}).init(app, express.static)

app.listen(5555);
```

Through the configuration file it is possible to redefine all the behavior of the library as: 
- **Paths:** The hierarchical path system to use, allowing to have access to the lib resource, local resource and schema resources.
- **Templates:** The template list to be used. 
- **Routes:** Public URLs to be used.
- **Scope:** It is only rendered public scope, by default it is public.
- Services and Controllers:
    * **languageService:** Defines how to get the language data to support multilanguage. 
    * **dataService:** Defines how to get the data content to fill the templates.
    * **menuService:** Defines how to load the main menu.
    * **tplService:** Defines the demplate engine management. By default it is an KsTpl instance.
    * **logger:** Log managements
    * **sessionService:** Defines how to maintain and store the user session required for authentication and security, if set to null there is no security
    * **authService:** Defines how to check the user which is trying to login and generate access token.
    * **apiController:** By default it use Swagger integration 


### Optional Config file in JSON format

File: ```<PATH_DOC>/<SCHEME_NAME>/_/config.json ```
```Json
{
  "cfg": {
    "scope": "public",
    "menu": [
      { "name": "Introduction", "url": "{root}/{scheme}/{page}" },
      { "name": "Onboarding" }
    ]
  },
  "path": {
    "api": "{root}/{scheme}/api",
    "page": "{root}/{scheme}/page",
    "lang": "{root}/{scheme}/lang",
    "config": "{root}/{scheme}/config",
    "resource": "{root}/{scheme}/resource",
    "core": "{root}/{scheme}/_",
    "cache": "{core}/cache"
  },
  "route": {
    "resource": "/resource",
    "login": "{root}/auth/login",
    "logout": "{root}/auth/logout",
    "access": "{root}/auth/access",
    "unauthorized": "{root}/auth/access",
    "public": "{resource}/{scheme}",
    "home": "{root}/{scheme}",
    "pag": "{root}/{scheme}/{page}",
    "api": "{root}/{scheme}/api",
    "src": "{root}/{scheme}/src"
  },
  "template": {
	  "layout": "{lib}/template/page.layout.html"
  },
  "apiController": null
}
```


### Optional Config file in JavaScript format:

File: ```<PATH_DOC>/<SCHEME_NAME>/_/config.js ```
```Js
module.exports = {
  "cfg": {
    "scope": "public"
  },
  "path": {
    "api": "{root}/{scheme}/api",
    "page": "{root}/{scheme}/page",
    "lang": "{root}/{scheme}/lang",
    "config": "{root}/{scheme}/config",
    "resource": "{root}/{scheme}/resource",
    "core": "{root}/{scheme}/_",
    "cache": "{core}/cache"
  },
  "route": {
    "resource": "/resource",
    "login": "{root}/auth/login",
    "logout": "{root}/auth/logout",
    "access": "{root}/auth/access",
    "unauthorized": "{root}/auth/access",
    "public": "{resource}/{scheme}",
    "home": "{root}/{scheme}",
    "pag": "{root}/{scheme}/{page}",
    "api": "{root}/{scheme}/api",
    "src": "{root}/{scheme}/src"
  },
  "template": {
	 "layout": "{core}/template/page.layout.html"
  },
  apiController: null,
  languageService: {
    load: ({ path, idiom = "en" }) => Promise.resolve(require(path + "/" + idiom + ".json"))
  },
  logger: console
}
```
