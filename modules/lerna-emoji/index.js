const scopes = require('./lib/scopes');

scopes().then(packages => console.log(packages));
