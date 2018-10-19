/* async test caller
* test caller & cache access object
* @public
* call to api/service.cache && return object
* (c) Nacho
*/
const request = require('request');
let startTime = Date.now();
let payload = {
	url: 'http://localhost:3000/api/service.cache'
};
request.get(payload, function (err, response, body) {
	if (err) {
		console.error('>>> Application error: ' + err);
		callback(err);
		
	} else {
		console.log('call:' + payload.url, ' ok!');
		console.log('read object length:'+JSON.parse(body).length)
		console.log('elapsed time:'+ (Date.now() - startTime) / 1000);
	}
});
