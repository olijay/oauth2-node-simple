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

function loginImplicit(request, response, postData) {
    console.log("loginImplicit hit!");
    var implicitData = querystring.parse(postData);
}

function requestClientInformation(request, response, postData) {
    
}

exports.index = index;
exports.loginImplicit = loginImplicit;
exports.requestClientInformation = requestClientInformation;