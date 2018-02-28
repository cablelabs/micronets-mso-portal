# MSO-Portal

> MSO Portal backend API&#39;s

## About

This project uses [Feathers](http://feathersjs.com). An open source web framework for building modern real-time applications.

## Technology Choices

### Languages:

 1. JavaScript
 2. HTML

### Frameworks:

 1. Feathers - (http://feathersjs.com)

### Data Management:

 1. MongoDB - https://www.mongodb.com/
 2. Mongoose - http://mongoosejs.com/

## API

### 1. Registration Token

The mso-portal needs to manage the device registration process from the time the device has been selected for onboarding until the required certs have been returned to the registration server (and passed thru to the device).It is used to manage a registration context (session information). The registration context is needed to associate the token with the selected device, the client (registration server), the subscriber, and the certificate request.

#### url: POST `/portal/registration/token`

Header Fields:

    content-type: "application/json"

    POST data:

        {
          "clientID": "<clientID>", // Unique identifier for the registration server.
          "deviceID": "<deviceID>", // Unique identifier for the device.
          "vendor": "<vendor>",		// Device manufacturer/vendor
          "type": "<type>",			// Device type - friendly name, eg. "Heartrate Monitor"
          "model": "<model>",		// Device model - eg. "Accu-Pulse"
          "serial": "<serial>,"		// Device serial (manufacturer's serial, NOT deviceID)
          "macAddress": "<MAC>"		// Device MAC address
        }

#### response:

    {
        "accessToken": "SYABZ"
    }


### 2. Request CSR Template

The CSR "template" is just metadata that the client (device) needs when generating a CSR. For now, it is just the encryption type. In addition to the registration token (used to identify the registration context) we also provide the subscriberID, as at this point the subscriber has been authenticated and we know the subscriberID.

#### url: POST `/ca/csrt`

Header Fields:

    content-type: "application/json"
    Authorization: "Bearer <JWT token>"

POST data:

    {
      "id": "<subscriberID>"
    }

The `id` identifies a subscriber account. The Registration Server obtains this when the subscriber authenticates using the clinic browser (eg. scanning QR Code)

#### response:
(optional debug: contents of the registration context)

	{
	  "csrTemplate": {
	    "keyType": "RSA:2048"
	  },
	  "debug": {
	    "context": {
	      "token": "EXPZF",
	      "clientID": "www.happyclinic.com",
	      "deviceID": "730c8aa0a2e535c8caa3e1398c6fdbb476223088551d45315fc4c9941cf55f9e",
	      "timestamp": 1510077436128,
	      "subscriber": {
	        "id": 1,
	        "name": "Grandma",
	        "ssid": "Grandma's WiFi"
	      }
	    }
	  }
	}


### 3. Submit CSR:

The CSR is submitted to the CA. A wifi certificate is created and signed. The wifi certificate, CA certificate are base64 encoded and returned as JSON along with subscriber metadata.

#### url: POST `/ca/cert/`

Header Fields:

    content-type: "application/json"
    Authorization: "Bearer <JWT token>"

POST data:

    {

      "id": "<subscriberID>",
      "csr": "<base64 encoded CSR>"
    }

**NOTE:** The CSR, wifiCert and caCert are base64 encoded to preserve line endings. **REQUIRED!**

#### response:
The response is ultimately returned to the device.

    {
	  "subscriber": {
		"id": 1,
		"name": "Grandma",
		"ssid": "Grandma's WiFi"
	  },
	  "wifiCert": "<base64 encoded WiFi Certificate>",
	  "caCert": "<base64 encoded CA Certificate>"
    }

## Private REST Interface

### 4. Subscribers

The required subscriber information is returned. For now, all we really need is the SSID but we return Subscriber Name for display purposes.

#### url: GET `/portal/subscribers/<id>`
- id:  Unique identifier for subscriber (obtained by the registration server when subscriber is authenticated)

Header Fields:

    content-type: "application/json"
    Authorization: "Bearer <JWT token>"

#### response:

    {
        "id": 1,
        "name": "Grandma",
        "ssid": "Grandma's WiFi"
      }


## Getting Started

Getting up and running is as easy as 1, 2, 3.

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install your dependencies

    ```
    cd path/to/mso-portal; npm install
    ```

3. Start your app

    ```
    npm start
    ```

## Testing

Simply run `npm test` and all your tests in the `test/` directory will be run.

## Scaffolding

Feathers has a powerful command line interface. Here are a few things it can do:

```
$ npm install -g feathers-cli             # Install Feathers CLI

$ feathers generate service               # Generate a new Service
$ feathers generate hook                  # Generate a new Hook
$ feathers generate model                 # Generate a new Model
$ feathers help                           # Show all commands
```

## Help

For more information on all the things you can do with Feathers visit [docs.feathersjs.com](http://docs.feathersjs.com).

## Changelog

__0.1.0__

- Initial release

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
