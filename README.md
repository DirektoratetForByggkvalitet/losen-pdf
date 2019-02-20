Wizard PDF generator
===

PDF generator based on headless Chrome and puppeteer for making good looking PDFs for wizards. Compatible with [losen](https://npmjs.com/losen).

## How it works
Expects a `POST` request to `/pdf` with a JSON body with the following properties in the body:

- `url` - The url to generate a PDF of. Type: string. **Required**
- `localStorageKey` - The local storage key to set data for in the browser before printing. Must be set in combination with. `localStorageData`. Type: object from local storage.
- `localStorageData` – The data to set in local storage before printing. Must be set in combination with `localStorageKey`. Type: string.

## Example

### Payload
```js
{
  "url": "https://dibk-prodok.firebaseapp.com",
  "localStorageKey": "reduxPersist:@WIZARD_STATE",
  "localStorageData: {
    "page": "page1",
    "competence": {
      "experience": 5,
      "education": 4
    },
    "companytype": "norwegian",
    "orgnr": {
      "orgid": "916898908",
      "status": "",
      "validApprovalAreas": "",
      "dataSG": false,
      "name": "NETLIFE DESIGN AS",
      "postcode": "0184",
      "postplace": "OSLO",
      "address": "Stenersgata 8",
      "dataOrg": true,
      "invalidOrg": false
    },
    "sgdata": false,
    "contactperson": {
      "name": "Kristoffer Brabrand",
      "email": "kristoffer.brabrand@netlife.com",
      "phone": "98765432"
    }
  }
}
```

### Request
```
POST /pdf HTTP/1.1
Host: dibk-pdf-lt0crv82h.now.sh
Content-Type: application/json
Accept: */*
Content-Length: 105
{
  "url": "https://dibk.no/apekatt",
  "localStorageKey": "hei",
  "localStorageData": {
    "blah": 123
  }
}
```

### Response
The response is a binary blob with content type `application/pdf`.

## Deployment
The PDF generator can be hosted as a serverless function in order for you to pay only for the time it's actually generating PDFs. We recommend [now](https://https://zeit.co/now) as it's one of the easiest platforms to get started with.

### Before deploying
👮‍ You want to fork this repo and edit the `now.json` file to give the app a name and set the environment variable `ALLOWED_DOMAINS` to a comma separated list of domains that you want to allow generating PDFs from.

If you want to, you can use `.*` as a wildcard in the urls, like this: `.*.ngrok.io`.

### The process
1. Install now by running `npm i -g now` (only first time)
2. Issue the command `now` when standing in the project folder. Now will ask you to sign in if it's the first time
3. You should get a response similar to this when you deploy:

```sh
➜ now
> Deploying ~/development/netlife/dibk/pdf/losen-pdf under kbrabrand
> Using project dibk-pdf
> Synced 1 file (1.17KB) [1s]
> https://dibk-pdf-lt0crv82h.now.sh [v2] [in clipboard] [9s]
┌ pdf.js        Ready               [37s]
└── λ pdf.js (35.15MB) [bru1]
> Success! Deployment ready [47s]
```
## Integrating with losen
In order to have a wizard use the pdf service you need to add the print service url to the meta portion of your schema, like this:

```js
{
  "meta": {
    ...
    "pdfGeneratorUrl": "https://dibk-pdf-lt0crv82h.now.sh",
    "localStorageKey": "reduxPersist:@WIZARD_STATE"
  },
  "schema": [
    ...
  ]
}
```

With this in place, losen will use the print service to generate PDFs instead of triggering a regular print command in the browser.
