var http = require("http");
var url = require("url");

function start(route, handle, port) {
    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;
        //console.log("Request for pathname " + pathname + " received.");
        var postData = "";
        request.setEncoding("utf8");

        request.addListener("data", function (postDataChunk) {
            postData += postDataChunk;
            //console.log("Received POST data chunk '" +
            //postDataChunk + "'.");
        });

        request.addListener("end", function () {
            route(handle, pathname, request, response, postData);
        });


      
    }
    
    http.createServer(onRequest).listen(port);
    console.log("Server has started. Listening on port " + port);
}

exports.start = start;  