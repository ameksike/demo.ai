## Legacy Login
Legacy Auth refers to a group of endpoints that facilitate authentication in a manner similar to OAuth, albeit with an older implementation that does not fully comply with the standard. This codebase has been in use for a long time and has been widely adopted across MyCom applications.

It's important to note that Legacy Auth is being maintained to ensure compatibility with older products that rely on this authentication method. However, it is **deprecated** and **will eventually be removed** from the Auth Server API. Instead, we recommend transitioning to more modern authentication methods such as Resource Owner Password Credentials (ROPC) for basic user authentication or OAuth Client Credentials for system-to-system integration. This shift aligns with industry best practices and ensures better security and scalability for your applications.

### Login

**REQUEST:** ```POST: https://auth-dev.qa.ewas.aero/v1/login```
```json
{
    "username": "user1@example.com",
    "password": "user1_passwoed_",
    "grant_type": "authorizationCode",
    "deviceName": "Chrome - 110.0.0.0 / Windows - windows-10",
    "deviceUid": "UUIDE49283ED-12EA-D64D-6DDE-DDC26B30F948_USER.1",
    "productId": 3
}
```

**RESPONSE:** 
```json
{
    "success": true,
    "msg": "OK_REQUEST",
    "data": {
        "userId": 187721,
        "statusId": 1,
        "enterpriseId": 369,
        "userNick": "user1_1698446892887",
        "userPassword": "2ce773371d0a86b0185c064cf517ee8e",
        "mail": "user1@example.com",
        "pilotId": null,
        "apiKeyId": null
    },

    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...ipMOeWofk-d8ss",
    "refreshToken": "eytJhbGciOiJIUzI1NiInR5cCI6IkpXVCgsdfgssI...L7dPoWOKBNAc",
    "tokenType": "Bearer",
    "expiresIn": 5,

    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...ipMOeWofk-d8ss",
    "refresh_token": "eytJhbGciOiJIUzI1NiInR5cCI6IkpXVCgsdfgssI...L7dPoWOKBNAc",
    "token_type": "Bearer",
    "expires_in": 5,
    "scope": ""
}
```
### Login Error

**RESPONSE:** 
```json
{
    "success": false,
    "msg": "E_INCORRECT_CREDENTIALS",
    "data": null
}
```

### Login without Refresh Token

**REQUEST:** ```POST: https://auth-dev.qa.ewas.aero/v1/login```
```json
{
    "username": "user1@example.com",
    "password": "user1_passwoed_",
    "grant_type": "password",
    "deviceName": "Chrome - 110.0.0.0 / Windows - windows-10",
    "deviceUid": "UUIDE49283ED-12EA-D64D-6DDE-DDC26B30F948_USER.1",
    "productId": 3
}
```

**RESPONSE:** 
```json
{
    "success": true,
    "msg": "OK_REQUEST",
    "data": {
        "userId": 187721,
        "statusId": 1,
        "enterpriseId": 369,
        "userNick": "user1_1698446892887",
        "userPassword": "2ce773371d0a86b0185c064cf517ee8e",
        "mail": "user1@example.com",
        "pilotId": null,
        "apiKeyId": null
    },

    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXbW5N30.csg...NF7CxZzjaeYp4",
    "tokenType": "Bearer",
    "expiresIn": 5,

    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXbW5N30.csg...NF7CxZzjaeYp4",
    "refresh_token": "",
    "token_type": "Bearer",
    "expires_in": 5,
    "scope": ""
}
```


### Refrech Token

**REQUEST:** ```POST: https://auth-dev.qa.ewas.aero/v1/token```
```json
{
    "refresh_token": "eytJhbGciOiJIUzI1NiInR5cCI6IkpXVCgsdfgssI...L7dPoWOKBNAc",
    "grant_type": "refresh_token",
}
```

**RESPONSE:** 
```json
{
    "success": true,
    "msg": "OK_REQUEST",
    "data": {
        "userId": 187721,
        "statusId": 1,
        "enterpriseId": 369,
        "userNick": "user1_1698446892887",
        "userPassword": "2ce773371d0a86b0185c064cf517ee8e",
        "mail": "user1@example.com",
        "pilotId": null,
        "apiKeyId": null
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWF...1w8iVLWKOeRiS2w908Q",
    "tokenType": "Bearer",
    "expiresIn": 5,

    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWF...1w8iVLWKOeRiS2w908Q",
    "refresh_token": "",
    "token_type": "Bearer",
    "expires_in": 5,
    "scope": "",

}
```


### You may be interested in viewing the following topics:
- [Login](./Login.html)
- [Logout](./Logout.html)
- [Refresh](./Refresh.html)
- [Introspection](./Account.html)