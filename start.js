var https = require('https');
var http = require('http');
var url = require('url');
var regexp = require('node-regexp');
var fs = require('graceful-fs');

/*
    AUTHOR : SENTHIL KUMAR M
    EMAIL : m.senthil.000@gmail.com
*/


var category =  [];
var countX = 0;
var imgCounter = 0;
var startIndex = 201;
var maxResults = 50;
var categoryArray = [];
var folderArray = [];
//URL of site from which image is grabbed - CelebsNext
var urlX = 'https://www.blogger.com/feeds/7613699008692966649/posts/default?start-index='+ startIndex +'&max-results='+ maxResults +'&alt=json';


//URL of DP site - get categories
var dpURL = "https://www.blogger.com/feeds/7833828309523986982/posts/default?start-index=001&max-results=1&alt=json";

//get the categories from DP site
https.get(dpURL,function(res) {
  var body = '';

  res.on('data', function(chunk) {
    body += chunk;
});

  res.on('end', function() {
    var feedDP = JSON.parse(body);	
    categoryArray = feedDP.feed.category;
    categoryArray.forEach(function(value,index) {
       category.push(value.term);
        });


});
});

https.get(urlX, function(res) {
    var body = '';

    res.on('data', function(chunk) {
        body += chunk;
    });

    res.on('end', function() {
        var feedResponse = JSON.parse(body);	
        var entryArray = feedResponse.feed.entry;
        entryArray.forEach(function(value,index) {
        	getURL(value.content.$t);
        });
    });
}).on('error', function(e) {
  console.log("Got error: ", e);
});



var getURL = function(content)
{
	var patt = new RegExp(/src\s*=\s*"(.+?)"/ig);
    var thumbURL = patt.exec(content);
    var divContent = thumbURL.input;

    var tempX = divContent.match(/src\s*=\s*"(.+?)"/ig);

    
    if(tempX != null )
    {
      tempX.forEach(function(value,index) {
        var temp = value.match('src\s*=\s*"(.+?)"');
        saveImage(temp[1]);
    });
     console.log("Total Images : "+ imgCounter);

  }

}

var saveImage = function(imgURL)
{
    if( imgURL.indexOf('https') == -1)
    {
        // if URL is blogger image
        if(imgURL.indexOf("bp.blogspot") != -1)
          imgURL = imgURL.replace(imgURL.split("/")[7],"s1600");

        // UTD Servers
        if(imgURL.indexOf("2.bp.blogspot.com") != -1)
          imgURL = imgURL.replace('2.bp.blogspot.com','3.bp.blogspot.com');


      var fileName = url.parse(imgURL).pathname.split('/').pop();

    //create Image folder if doesn't exist
    if(!fs.existsSync("Images")){
       fs.mkdirSync("Images", 0766, function(err){
         if(err){ 
           console.log(err);
                         response.send("ERROR! Can't make the directory! \n");    // echo the result back
                     }
                 }); 
   };


   var folderName = "Images/"+ presentInCategory(fileName);

   var request = http.get(imgURL, function(response) {

    if(!fs.existsSync(folderName)){
       fs.mkdirSync(folderName, 0766, function(err){
         if(err){ 
           console.log(err);
                         response.send("ERROR! Can't make the directory! \n");    // echo the result back
                     }
                 }); 
   };
            // create file write stream               
            var file = fs.createWriteStream(folderName +"/"+fileName);
            response.pipe(file);

            countX++;
        });
}

else
{
    console.log('error here');
}
}

// If name is already present in category
var presentInCategory = function(fileName)
{
    fileName = removeNoise(fileName);
    fileName = removeStopWords(fileName);

    imgCounter++;
    var dirName = "";
    for(var i=0 ; i < category.length - 1; i++)
    {
        var name = category[i];
        var nameSplit = name.split(/\s/);
        if(nameSplit.length > 1)
        {
          if(fileName.indexOf(nameSplit[0]) != -1)
          {
             dirName = nameSplit[0];
             if(fileName.indexOf(nameSplit[1]) != -1)
             {
                dirName = name;
                break;
            }
        }
    }
    else
    {
       if(fileName.indexOf(name) != -1)
       {
        dirName = name;
    }
}
}


dirName = (dirName == "") ? fileName.replace(/\d/ig,'').replace(/\s+/g," ").trim() : dirName;


if(dirName.split(/\s/).length > 2)
{
    var dName = dirName.split(/\s/);
    dirName = dName[0] +" "+ dName[1];
}
console.log(dirName);

return dirName;
}



var removeNoise = function(tokenString)
{
    return tokenString.replace(/[^\w\s]/gi, ' ');
}

var removeStopWords = function(tokenString)
{
    var stopWords = ["model","telugu","tamil","cute","actress","hot","pictures","stills","saree","latest","wallpapers","jpg"," 2B","Gallery","Movie","Audio","launch","new","press","meet"];
    for(var word in stopWords)
    {

        tokenString = removeWords(tokenString, stopWords[word]);
    }
    return tokenString;
}

function removeWords( line, word )
{
   var regex = new RegExp( '(' + word + ')', 'gi' );
   return line.replace( regex, " " );
}

function contains(arr, x) {
    return arr.filter(function(elem) { return elem == x }).length > 0;
}

//returns Array of Tokens
var tokenizeString = function(tokenString)
{
    return tokenString.match(/\b\w+\b/g);
}