var request = require('request');
var fs = require('fs');
var json2csv = require('json2csv');
var keyword_extractor = require("keyword-extractor");
var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
var natural_language_understanding = new NaturalLanguageUnderstandingV1({
  'username': '130c8514-618f-417b-94dd-036c5621eb3e',
  'password': 'o7w2aV4dS3yP',
  'version_date': '2017-02-27'
});
var stringSimilarity = require('string-similarity');
var randomColor = require('randomcolor');


var headers = {
    'Authorization': 'OAuth A30C8sKL4ofzHS-z_JdLhIyiR2xYQaL312jqK8aTxOOw2C4zpO7mxEyy5MQmhD07s668l1rU3XerILe35EAmi2WMz32h7VGN_r06R_BYIHCQFFlFCkX2Px2rB68LKBc5vNTN7ingPXGr6Fe60toum2F_vyzgHsxfLM475CsOKdn4KrIUyaddqk1-58nXb1qReAY13JhSRwPMRpCCguT3zkk2CNgM0b6zXHoC_ffHJXljl0kJHCLyoi9p_pNW:feedlydev'
};
var request_url = 'http://cloud.feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Fwww.hrw.org%2Fen%2Frss%2Fnews&count=100';
var request_method = 'GET';
var request_body = null;
var pub = 'wire';
var final_pubs = ['cnn', 'fox', 'nyt', 'vox', 'dnow', 'intercept', 'slate', 'mojo', 'propublica', 'politico'];

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
            fs.writeFileSync('allArticles_' + pub + '.json', JSON.stringify(body_json, null, 2))
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
// headlineExtractor('allArticles_'+ pub +'.json');
function headlineExtractor(file_name) {
    var file_data = JSON.parse(fs.readFileSync(file_name));
    var headlines = [];
    for (var i = 0; i < file_data.items.length; i++) {
        headlines.push(file_data.items[i].title);
    }
    fs.writeFileSync('headlines_'+ pub +'.json', JSON.stringify(headlines, null, 2));
}

// jsonToCSV();
function jsonToCSV() {
    var fields = ['publication', 'velocity']
    var allVelocitiesArray = JSON.parse(fs.readFileSync('trump_frequency.json'))
    var allVelocities = [];
    for (var i = 0; i < allVelocitiesArray.length; i++) {
        var key_val_pair = {}
        key_val_pair['publication'] = allVelocitiesArray[i][0];
        key_val_pair['velocity'] = allVelocitiesArray[i][1];
        allVelocities.push(key_val_pair);
    }
    var csv = json2csv({data: allVelocities, fields: fields});
    fs.writeFile('trump_frequency.csv', csv, function(err) {
        if (err)
            throw err;
        console.log('file saved');
    });
}

//KEYWORD EXTRACTOR
// keywords('headlines_'+ pub +'.json')
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
    fs.writeFileSync('keywords_'+ pub +'.json', JSON.stringify(sortObject(pub_keywords), null, 2))
}





//WATSON STUFF
// watson_extractor('headlines_'+ pub +'.json');
function watson_extractor(file_name){
  var headlinesArray = JSON.parse(fs.readFileSync(file_name));
  var headlinesString = "";
  for(var i = 0 ; i < headlinesArray.length ; i++) {
    headlinesString += ". " + headlinesArray[i];
  }
  var parameters = {
  'text': headlinesString,
  'features': {
    'concepts': {
      'limit': 10
    },
    'entities': {
      'emotion': true,
      'sentiment': true,
      'limit': 2
    },
    'keywords': {
      'emotion': true,
      'sentiment': true
    },
    'sentiment': {},
  }
}

natural_language_understanding.analyze(parameters, function(err, response) {
    if (err)
      console.log('error:', err);
      else
      // console.log(JSON.stringify(response, null, 2));
      fs.writeFileSync('watson_' + pub + ".json", JSON.stringify(response, null, 2))
  });
}


//FIND SIMILARITY
var addressbook = [];
// findsimilarity();
function findsimilarity(){
  for (var i = 0 ; i < final_pubs.length ; i++) {
    var pub1 = final_pubs[i];
    console.log('pub1 = ' + pub1);
    for(var j = i; j < final_pubs.length ; j++) {
      var pub2 = final_pubs[j];
      console.log('pub1 = ' + pub1);
      var file1 = JSON.parse(fs.readFileSync('headlines_'+ pub1 +'.json'));
      var file2 = JSON.parse(fs.readFileSync('headlines_'+ pub2 +'.json'));
      for (var k = 0 ; k < file1.length ; k++) {
        var heading1 = file1[k];
        console.log('heading1 = ' + heading1);
        for (var l = 0 ; l < file2.length ; l++) {
          var heading2 = file2[l];
          console.log('heading2 = ' + heading2);
          if(heading1 != heading2) {
            var score = stringSimilarity.compareTwoStrings(heading1, heading2);
            console.log('score = ' + score);
            if(score > 0.5){
              var heading1_address = findAddress(heading1, pub1);
              var heading2_address = findAddress(heading2, pub2);
              if(heading1_address != null && heading2_address == null) {
                if(!addressbook[heading1_address][pub2]){
                  addressbook[heading1_address][pub2] = new Array();
                }
                addressbook[heading1_address][pub2].push(heading2);
              }
              else if(heading1_address == null && heading2_address != null) {
                if(!addressbook[heading2_address][pub1]){
                  addressbook[heading2_address][pub1] = new Array();
                }
                addressbook[heading2_address][pub1].push(heading1);
              }
              else if(heading1_address == null && heading2_address == null) {
                addToAddressBook(heading1, pub1, heading2, pub2);
              }
            }
          }
        }
      }
    }
  }
  fs.writeFileSync('similarity.json', JSON.stringify(addressbook, null, 2));
}

function findAddress(heading, publication) {
  console.log('inside findAddress with heading: ' + heading + ', and publication: ' + publication);
  console.log('addressbook: ', addressbook);
  for (var i = 0 ; i < addressbook.length ; i++) {
    if(addressbook[i][publication]) {
      for (var j = 0 ; j < addressbook[i][publication].length ; j++){
        if(heading == addressbook[i][publication][j]) {
          console.log('found heading at i = ' + i);
          return i;
        }
      }
    }
  }
  return null;
}

function addToAddressBook(heading1, pub1, heading2, pub2) {
  console.log("Inside addToAddressBook");
  var newEntry = {};
  newEntry[pub1] = [];
  newEntry[pub2] = [];
  newEntry[pub1].push(heading1);
  newEntry[pub2].push(heading2);
  addressbook.push(newEntry);
}


// tFrequency();
function tFrequency(){
  var trump_frequency = {}
  for(var i = 0 ; i < final_pubs.length ; i++){
    var keywords = JSON.parse(fs.readFileSync('keywords_' + final_pubs[i] + '.json'));
    for(var j = 0 ; j < keywords.length ; j++){
      if(keywords[j][0].toLowerCase() == 'trump') {
        trump_frequency[getPubName(final_pubs[i])] = keywords[j][1];
        break;
      }
    }
  }
  fs.writeFileSync('trump_frequency.json', JSON.stringify(sortObject(trump_frequency), null, 2));
}

function getPubName(pub_id){
  switch (pub_id){
    case 'cnn':
      return 'CNN'
    break;
    case 'dnow':
      return 'Democracy Now!'
    break;
    case 'fox':
      return 'FOX news'
    break;
    case 'intercept':
      return 'The Intercept'
    break;
    case 'mojo':
      return 'Mother Jones'
    break;
    case 'nyt':
      return 'The New York Times'
    break;
    case 'politico':
      return 'Politico'
    break;
    case 'propublica':
      return 'ProPublica'
    break;
    case 'slate':
      return 'Slate'
    break;
    case 'vox':
      return 'Vox'
    break;
  }
}

// watsonKeywords('wire');
function watsonKeywords(filename){
  var file_data = JSON.parse(fs.readFileSync('watson_' + filename + '.json'));
  var keywordsArray = file_data.keywords;
  var keywords = [];
  for(var i = 0 ; i < keywordsArray.length ; i++) {
    keywords.push(keywordsArray[i].text)
    // keywords[keywordsArray[i].text] = keywordsArray[i].relevance;
  }
  fs.writeFileSync('watson_keywords_' + filename + '.json', JSON.stringify(keywords, null, 2))
}

// giveRandomColor();
function giveRandomColor(){
  var file_data = JSON.parse(fs.readFileSync('similarity.json'));
  for (var i = 0 ; i < file_data.length ; i++) {
    file_data[i]["color"] = randomColor();
  }
  fs.writeFileSync('similarity.json', JSON.stringify(file_data, null, 2))
}

// giveRandomColorKeywords();
function giveRandomColorKeywords(){
  var similarity_data = JSON.parse(fs.readFileSync('similarity.json'));
  var publication_keyword_color_data = {};
  var color_found = false;
  for(var i = 0 ; i < final_pubs.length ; i++) {
    var keyword_color_data = {};
    publication = final_pubs[i];
    var keyword_data = JSON.parse(fs.readFileSync('watson_keywords_' + publication + '.json'));
    for(var m = 0 ; m < keyword_data.length ; m++) {
      var keyword = keyword_data[m];
      for(var n = 0 ; n < similarity_data.length ; n++) {
        var headlinesArray = similarity_data[n][publication];
        if(headlinesArray) {
          for (var p = 0 ; p < headlinesArray.length ; p++) {
            if (headlinesArray[p].indexOf(keyword) != -1) {
              keyword_color_data[keyword] = similarity_data[n].color;
              color_found = true;
              p = headlinesArray.length;
            }
          }
        }
        if(color_found) {
          n = similarity_data.length;
        }
      }
      if(color_found) {
        color_found = false;
      }
      else {
        keyword_color_data[keyword] = null;
      }
    }
    publication_keyword_color_data[publication] = keyword_color_data;
  }
  fs.writeFileSync('watson_keywords_withcolor.json', JSON.stringify(publication_keyword_color_data, null, 2))
}










// var file_data = JSON.parse(fs.readFileSync('similarity.json'))
// console.log(file_data.length)



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
