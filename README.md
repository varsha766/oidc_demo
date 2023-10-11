# OpenID Connect App

## Project requirements

The project has been developed and tested in the following environment:

```
$ node -v
v18.17.1
```

## Getting started

**Install dependencies** Open a terminal and run the following command to install the project dependencies:
 - demoOidc_server

    ```
    cd demoOidc_server
    npm install
    npm run start:oidc
    ```
- oidc_client
   ```
   cd oidc_client
   npm install
   npm run start:client
   ```
- resource_server
  ```
   cd resource_server
   npm install
   npm run start:resource
  ```
You can see the front end by navigating to [http://localhost:5001](http://localhost:5001) with your browser.