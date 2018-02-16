  var Service = require('node-service-linux').Service;
 
  // Create a new service object 
  var svc = new Service({
    name:'Web Monitor',
    description: 'Web Monitor',
    script: './monitor.js'
  });
 
  // Listen for the "install" event, which indicates the 
  // process is available as a service. 
  svc.on('install',function(){
    svc.start();
  });
 
  svc.install();