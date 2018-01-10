var request = require('request');
var fs = require('fs');

var headers = {
    'Authorization': 'OAuth A30C8sKL4ofzHS-z_JdLhIyiR2xYQaL312jqK8aTxOOw2C4zpO7mxEyy5MQmhD07s668l1rU3XerILe35EAmi2WMz32h7VGN_r06R_BYIHCQFFlFCkX2Px2rB68LKBc5vNTN7ingPXGr6Fe60toum2F_vyzgHsxfLM475CsOKdn4KrIUyaddqk1-58nXb1qReAY13JhSRwPMRpCCguT3zkk2CNgM0b6zXHoC_ffHJXljl0kJHCLyoi9p_pNW:feedlydev'
};

var options = {
    url: 'http://cloud.feedly.com/v3/search/contents?query=apple',
    headers: headers,
    method: 'GET'
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        body_json = JSON.parse(body)
        fs.writeFileSync('searchTopic.json', JSON.stringify(body_json, null, 2))
    }
    else {
      console.log(response.statusCode)
      console.log(error)
    }
}

request(options, callback);

/*
http://cloud.feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Fwww.readwriteweb.com%2Frss.xml&count=20
userID: b26d0114-b165-4328-b921-8bfda7fbc193
Feed Id
feed/:url example: feed/http://feeds.engadget.com/weblogsinc/engadget
Category Id
user/:userId/category/:label example: user/c805fcbf-3acf-4302-a97e-d82f9d7c897f/category/tech
Tag Id
user/:userId/tag/:label example: user/c805fcbf-3acf-4302-a97e-d82f9d7c897f/tag/inspiration

http://cloud.feedly.com/v3/mixes/contents?streamId=user%2Fb26d0114-b165-4328-b921-8bfda7fbc193%2Fcategory%2Fglobal.all
http://cloud.feedly.com/v3/streams/contents?streamId=user%2Fb26d0114-b165-4328-b921-8bfda7fbc193%2Fcategory%2Fglobal.all
http://cloud.feedly.com/v3/search/contents?query=apple
*/
