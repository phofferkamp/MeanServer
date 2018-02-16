# MeanServer

## Description

An ExpressJS server exposing an awards ceremony game API that communicates with a MongoDB, including a web monitor service and email notifications.

Thanks to https://github.com/didinj/mean-angular4-chat-app for help.

Support EFF at https://supporters.eff.org/donate/support-work-on-certbot !

## Install Frameworks

Node.js: https://nodejs.org/en/download/package-manager/

MongoDB: https://docs.mongodb.com/manual/administration/install-community/

## Obtain SSL Certificate

https://certbot.eff.org/

## Install Node.js Packages

```bash
$ npm install
```

## Register Services

```bash
$ node install_mean_svc.js
$ node install_monitor_svc.js
```

## Start Services

```bash
$ sudo service mongod start
$ sudo service meanserver start
$ sudo service webmonitor start
```

## License

MIT © [Paul Hofferkamp](mailto:phofferkamp@gmail.com)
