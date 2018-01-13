var final_pubs = ['cnn', 'fox', 'nyt', 'vox', 'dnow', 'intercept', 'slate', 'mojo', 'propublica', 'politico'];

$(document).ready(function(){
  $.getJSON('data/watson_keywords_withcolorArray.json', function(data){
    for(var i = 0 ; i < final_pubs.length ; i++) {
      var pub = final_pubs[i];
      console.log(pub);
      $('#container').append('<div class="publicationKeywords" id="'+pub+'"></div>');
      $('#'+pub).append('<p class=pub_title>'+getPubName(pub)+'</p>');
      var pub_keywords = data[pub];
      for(var j = 0 ; j < pub_keywords.length ; j++){
        var id = pub + "_keyword_" + j;
        if(data[pub][j][2] != null) {
          $('#'+pub).append('<a href='+data[pub][j][2]+'><p class=pub_keyword id='+id+'>'+pub_keywords[j][0]+'</p></a>');
        }
        else{
          $('#'+pub).append('<p class=pub_keyword id='+id+'>'+pub_keywords[j][0]+'</p>');
        }

        if(data[pub][j][1]){
          // var color = data[pub][j][1];
          var color = '#212121';
        }
        else if(data[pub][j][0] == pub){
          var color = '#e0e0e0';
        }
        else {
          var color = '#717171';
        }
        $('#'+pub+ ' #'+id).css('color', color);
      }
    }
  });
})

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
