var fs = require('fs');
var exec = require("child_process").exec;
var url = require("url");
var path = require("path");

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

function authorizeImplicit(request, response, postData) {
    console.log("authorizeImplicit hit!");
    var authorizeImplicitRequest = querystring.parse(postData);
    // verify that we have a valid request
    if (authorizeImplicitRequest.response_type === "token" &&
        authorizeImplicitRequest.client_id) {

        if (authorizeImplicitRequest.redirect_uri) {
            if (authorizeImplicitRequest.redirect_uri != "http://localhost:8889") {
                response.end(); // redirect_uri was incorrect
            }
        }
        // what follows is the authorization logic (only two client_id's are valid)
        if (authorizeImplicitRequest.client_id === "olafurj") {
            // TODO generate a token
            var access_token = "asdfjkl";
        }
        else if (authorizeImplicitRequest.client_id === "gertl") {
            // TODO generate a token
            var access_token = "qwerty";

        }
        // TODO register token with 8889

        response.writeHead(302, { 'Content-Type': 'application/x-www-form-urlencoded', 
                'Location' : 'http://localhost:8889/requestResource#access_token=' + access_token + 'token_type=bearer&expires_in=3600' });

    }
    else { // response_type and client_id were incorrect
        
    }
    response.end()
    
}

function registerToken(request,response,postData) {
    // TODO add token to array with a lifetime of 3600 seconds
}

function requestResource(request, response, postData) {
    // TODO return the given clientID's full name
}

exports.index = index;
exports.authorizeImplicit = authorizeImplicit;
exports.requestResource = requestResource;
exports.registerToken = registerToken;