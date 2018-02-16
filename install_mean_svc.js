  var Service = require('node-service-linux').Service;
 
  // Create a new service object 
  var svc = new Service({
    name:'MEAN Server',
    description: 'MEAN Server',
    script: './server/www'
  });
 
  // Listen for the "install" event, which indicates the 
  // process is available as a service. 
  svc.on('install',function(){
    svc.start();
  });
 
  svc.install();