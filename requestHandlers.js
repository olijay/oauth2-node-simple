var fs = require('fs');
var exec = require("child_process").exec;
var url = require("url");
var path = require("path");
var http = require('http');
var querystring = require('querystring');
var token_array = [];

function index(request, response) {
    fs.readFile("./index.html", function (err, data) {
        if (err) {
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.write("404 File not found. Sorry.");
            response.end();
            //console.log('index.html requested, file not found');

        }
        else {
            console.log("Sending index.html to client");
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.write(data);
            response.end();
            //console.log('index.html requested and delivered');

        }
    });
}

function authorizeImplicit(request, response) {
    console.log("authorizeImplicit hit! request.url: " + request.url);

    //var authorizeImplicitRequest = querystring.parse(postData);
    

    var authorizeImplicitRequest = url.parse(request.url, true).query;
    //console.log("authorizeImplicitRequest: " + authorizeImplicitRequest.response_type 
    //    + " " + authorizeImplicitRequest.client_id 
    //    + " " + authorizeImplicitRequest.redirect_uri);
    // verify that we have a valid request
    // skip all of this and end the response if response_type and client_id were incorrect
    if (authorizeImplicitRequest.response_type == "token" &&
        authorizeImplicitRequest.client_id) {

        if (authorizeImplicitRequest.redirect_uri) {
            if (authorizeImplicitRequest.redirect_uri != "http://localhost:8889") {
                console.log("redirect_uri was incorrect");
                response.end(); // redirect_uri was incorrect
            }
        }
        console.log("user is " + authorizeImplicitRequest.client_id);
        // what follows is the authorization logic (only two client_id's are valid)
        if (authorizeImplicitRequest.client_id === "olafurj") {
            // TODO generate a token
            var access_token = "asdfjkl";
        }
        else if (authorizeImplicitRequest.client_id === "gertl") {
            // TODO generate a token
            var access_token = "qwerty";

        }

        console.log("access_token is:" + access_token);
        // register token with 8889
         // Build the post string from an object
         console.log("about to register token. client_id: " + authorizeImplicitRequest.client_id + " access_token: " + access_token);
          var post_data = querystring.stringify({
              'client_id' : authorizeImplicitRequest.client_id,
              'access_token': access_token
          });

          // An object of options to indicate where to post to
          var post_options = {
              host: 'localhost',
              port: '8889',
              path: '/registerToken',
              method: 'POST',
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Content-Length': post_data.length
              }
          };

          // Set up the request
          var registerToken_request = http.request(post_options, function(res) {
              res.setEncoding('utf8');
              res.on('data', function (chunk) {
                  console.log('Response: ' + chunk);
              });
          });

        registerToken_request.on('response', function(res) {
            console.log('status code: ' + res.statusCode);            
        });

          // register the token
          registerToken_request.write(post_data);
          registerToken_request.end();

          // respond to the auth request
        response.writeHead(302, { 'Content-Type': 'application/x-www-form-urlencoded', 
                'Location' : 'http://localhost:8889/requestResource?access_token=' + access_token + '&token_type=bearer&expires_in=3600' });
    
    }    
    response.end()
    
}
// auth server running on 8888 calles this function on the resource server running on port 8889
function registerToken(request,response,postData) {
    // add token to array with a lifetime of an hour
    var token_data = querystring.parse(postData);
    console.log("registerToken hit!");
    console.log("token_data.access_token: " + token_data.access_token + " client_id: " +token_data.client_id);
    token_data.expires_on = new Date() + 3600*1000; // one hour from now in millisecs
    token_array.push(token_data);
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end();

}

// the client calles this on the resource server running on port 8889
function requestResource(request, response) {
    // return the given clientID's full name
    //var request_data = querystring.parse(postData);
    console.log("requestResource hit!");
    console.log("request.url: " + request.url);



    var response_data = JSON.stringify({
             'fullname' : 'Gert L Mikkelsen',
             'client_id' : 'gertl'
         });
    console.log("requestResource response_data: " + response_data);
    response.write(response_data);
    response.writeHead(200, { 'Content-Type': 'application/json', 'Content-Length' :response_data.length});
    response.end();

}

exports.index = index;
exports.authorizeImplicit = authorizeImplicit;
exports.requestResource = requestResource;
exports.registerToken = registerToken;