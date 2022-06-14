# cookie-click-sync

## What's this

There simple scripts sync your Cookie Clicker's save data between multiple browser sessions!

## Requirements

- Has a Google account
- Nodejs environment
- Your browser has been installed a user script extention

## How to use

1. Deploy `gas-api` using clasp
    1. Install clasp globaly and login on google account. See detail [here](https://github.com/google/clasp).
    1. Init `gas-api` as a clasp project.
        ```bash
        $ cd gas-api && clasp create # choose 'api'
        ```
    1. Push code to remote env.
        ```bash
        $ clasp push
        ```
    1. Deploy code as a Web Application. And memorize created URL.
1. Build user script and install it into extention
    1. Build user script
        ```bash
        $ cd user-script && npm run build
        ```
    1. Copy built `*.js` file content and paste it into browser's user script file.
    1. Insert `gas-api` URL you've gotten into user script's variable `apiUrl`, and save it.
       ```js
       const apiUrl = '{insert your URL here}';
       ```
    1. Activete user script which you have saved and reload Cookie Clicker game page.
