var request = require('request');
var fs = require('fs');
var json2csv = require('json2csv');
var keyword_extractor = require("keyword-extractor");

var headers = {
    'Authorization': 'OAuth A30C8sKL4ofzHS-z_JdLhIyiR2xYQaL312jqK8aTxOOw2C4zpO7mxEyy5MQmhD07s668l1rU3XerILe35EAmi2WMz32h7VGN_r06R_BYIHCQFFlFCkX2Px2rB68LKBc5vNTN7ingPXGr6Fe60toum2F_vyzgHsxfLM475CsOKdn4KrIUyaddqk1-58nXb1qReAY13JhSRwPMRpCCguT3zkk2CNgM0b6zXHoC_ffHJXljl0kJHCLyoi9p_pNW:feedlydev'
};
var request_url = 'http://cloud.feedly.com/v3/subscriptions';
var request_method = 'GET';
var request_body = null;

//MAKE THE REQUEST
// makeTheRequest();
function makeTheRequest() {
    var options = {
        url: request_url,
        headers: headers,
        method: request_method,
        body: request_body
    };

    request(options, callback);

    function callback(error, response, body) {
        console.log(response.statusCode)
        if (!error && response.statusCode == 200) {
            body_json = JSON.parse(body)
            // return(body_json);
            fs.writeFileSync('subscriptions.json', JSON.stringify(body_json, null, 2))
        } else {
            console.log(error)
        }
    }
}

//FIND MOST ACTIVE SOURCES
// findMostActiveSources();
function findMostActiveSources() {
    var file_data = JSON.parse(fs.readFileSync('subscriptions.json'));
    var allvelocities = {};
    for (var i = 0; i < file_data.length; i++) {
        // if (file_data[i].topics) {
            // for (var j = 0; j < file_data[i].topics.length; j++) {
                // if (file_data[i].topics[j].toLowerCase() == 'news' || file_data[i].topics[j].toLowerCase() == 'politics') {
                    allvelocities[file_data[i].title] = file_data[i].velocity;
                // }
            // }
        // }
    }
    fs.writeFileSync('allVelocities.json', JSON.stringify(sortObject(allvelocities), null, 2));
}

//FIND ALL TOPICS
// findalltopics();
function findalltopics() {
    var file_data = JSON.parse(fs.readFileSync('subscriptions.json'));
    var allTopics = {};
    for (var i = 0; i < file_data.length; i++) {
        if (file_data[i].topics) {
            for (var j = 0; j < file_data[i].topics.length; j++) {
                if (allTopics[file_data[i].topics[j]]) {
                    allTopics[file_data[i].topics[j]] += 1;
                } else {
                    allTopics[file_data[i].topics[j]] = 1;
                }
            }
        } else {
            console.log(file_data[i].title);
        }
    }
    fs.writeFileSync('allTopics.json', JSON.stringify(sortObject(allTopics), null, 2));
}

//FIND SOURCES BY TOPIC
// findSourcesByTopic('news');
function findSourcesByTopic(topic_id) {
    var file_data = JSON.parse(fs.readFileSync('subscriptions.json'));
    var sources = [];
    for (var i = 0; i < file_data.length; i++) {
        if (file_data[i].topics) {
            for (var j = 0; j < file_data[i].topics.length; j++) {
                if (file_data[i].topics[j] == topic_id) {
                    sources.push(file_data[i].title)
                }
            }
        }
    }
    fs.writeFileSync('sourcesByTopic.json', JSON.stringify(sources, null, 2));
}

function sortObject(obj) {
    var sortable = [];
    for (var item in obj) {
        sortable.push([item, obj[item]])
    }
    sortable.sort(function(a, b) {
        return b[1] - a[1];
    })
    return sortable;
}

//HEADLINE EXTRACTOR
// headlineExtractor('allArticles_fox.json');
function headlineExtractor(file_name) {
    var file_data = JSON.parse(fs.readFileSync(file_name));
    var headlines = [];
    for (var i = 0; i < file_data.items.length; i++) {
        headlines.push(file_data.items[i].title);
    }
    fs.writeFileSync('headlines_fox.json', JSON.stringify(headlines, null, 2));
}

// jsonToCSV();
function jsonToCSV() {
    var fields = ['publication', 'velocity']
    var allVelocitiesArray = JSON.parse(fs.readFileSync('allVelocities.json'))
    var allVelocities = [];
    for (var i = 0; i < allVelocitiesArray.length; i++) {
        var key_val_pair = {}
        key_val_pair['publication'] = allVelocitiesArray[i][0];
        key_val_pair['velocity'] = allVelocitiesArray[i][1];
        allVelocities.push(key_val_pair);
    }
    var csv = json2csv({data: allVelocities, fields: fields});
    fs.writeFile('allVelocities.csv', csv, function(err) {
        if (err)
            throw err;
        console.log('file saved');
    });
}

//KEYWORD EXTRACTOR
// keywords('headlines_fox.json')
function keywords(file_name) {
    var headlinesArray = JSON.parse(fs.readFileSync(file_name));
    pub_keywords = {}
    for (var i = 0; i < headlinesArray.length; i++) {
        var sentence = headlinesArray[i];
        var extraction_result = keyword_extractor.extract(sentence, {
            language: "english",
            remove_digits: true,
            return_changed_case: true,
            remove_duplicates: false

        });
        for(var j = 0 ; j < extraction_result.length; j++) {
          if(pub_keywords[extraction_result[j]]) {
            pub_keywords[extraction_result[j]] += 1;
          }
          else {
            pub_keywords[extraction_result[j]] = 1;
          }
        }
    }
    fs.writeFileSync('keywords_fox.json', JSON.stringify(sortObject(pub_keywords), null, 2))
}

//   if(file_data[i].state){
//     feedIDs.push(file_data[i].id);
//     console.log(file_data[i].title);
//   }
// if(i == file_data.length-1) {
//   var headers = {
//       'Authorization': 'OAuth A30C8sKL4ofzHS-z_JdLhIyiR2xYQaL312jqK8aTxOOw2C4zpO7mxEyy5MQmhD07s668l1rU3XerILe35EAmi2WMz32h7VGN_r06R_BYIHCQFFlFCkX2Px2rB68LKBc5vNTN7ingPXGr6Fe60toum2F_vyzgHsxfLM475CsOKdn4KrIUyaddqk1-58nXb1qReAY13JhSRwPMRpCCguT3zkk2CNgM0b6zXHoC_ffHJXljl0kJHCLyoi9p_pNW:feedlydev'
//   };
//
//   var options = {
//       url: 'http://cloud.feedly.com/v3/subscriptions/.mdelete',
//       headers: headers,
//       method: 'DELETE',
//       body: feedIDs,
//       json: true
//   };
//
//   request(options, callback);
// }

/*
OTHER REQUESTS

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
