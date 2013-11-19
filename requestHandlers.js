var fs = require('fs');
var exec = require("child_process").exec;
var url = require("url");
var path = require("path");
var http = require('http');
var querystring = require('querystring');
var token_array = [];
var auth_codes = [];
var token = "";

function returnfile(response,filename) {
 fs.readFile(filename, function (err, data) {
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
//
// client functions
//
function index(request, response) {
    returnfile(response,"./index.html");
}

// return a redirect to 8889 login
function authRedirect(request,response) {
 console.log("authorizeUsingCode hit!");    

              
       
        response.writeHead(302, { 
        'URI' : 'http://localhost:8889/openLogin?response_type=code&client_id=idp2013&redirect_uri=http://localhost:8888/requestToken' });
        response.end()  
        console.log("authorizeUsingCode response ended.");  
    
    
}


function requestToken(request,response) {
    var tokenRequest = url.parse(request.url, true).query;
    http.get("http://localhost:8889/issueToken?grant_type=authorization_code&code=" + tokenRequest.code 
        + "&redirect_uri=" + tokenRequest.redirect_uri
        + "&client_id=idp2013"
        + "&secret=asdf", 
        function(res) {
            if (res.statusCode == "200") { // successfully got back a token
                token = res.getHeader("access_token");               
               
                returnfile(response,"./loggedin.html");
            }
  
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
      response.writeHead(500, e.message);
      response.end();
    });
   
}

function getFullName(request,response) {
    var getFullNameRequest = url.parse(request.url, true).query;
    if (token && token != "") {// just making sure we have the token before calling requestResource
          http.get("http://localhost:8889/requestResource?client_id=idp2013&username=" + getFullNameRequest.username + "&access_token=" + token, 
        function(res) {
           
                response.writeHead(200);
                response.write(res.);
                response.end();
            
  
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
      response.writeHead(500, e.message);
      response.end();
    });
    }
}

//
// auth server functions
//
function openLogin(request, response) {
    var loginRequest = url.parse(request.url, true).query;

    // verify that we have a valid request
    // skip all of this and end the response if response_type and client_id were incorrect
    if (loginRequest.response_type == "code" &&
        loginRequest.client_id == "idp2013" && // only one client allowed
        loginRequest.redirect_uri == "http://localhost:8888/requestToken") { // the redirect_uri the user will be pointed to after auth


      returnfile(response,"./login.html");
    }    
    else {
        var err = "wrong auth type OR wrong redirect_uri OR client_id not specified.";
        console.log(err);
        response.writeHead(401, err);
        response.end();
    }
}

function authenticate(request,response) {
     var authenticateRequest = url.parse(request.url, true).query;

    if (authenticateRequest.username == "olafur" &&
        authenticateRequest.password == "jens" && 
        authenticateRequest.redirect_uri == "http://localhost:8888/requestToken" &&// the redirect_uri on the client the user will be pointed to after auth
        authenticateRequest.client_id == "idp2013") { 

        // user authenticated
        // register code, bound to client and redirect_uri
        var auth_code = {};
        auth_code.code = 'qwerty';
        auth_code.client_id = client_id;
        auth_code.redirect_uri = redirect_uri
        auth_code.expires_on = new Date() + 360*1000; // 10 minutes from now
        auth_codes.push(auth_code);

      response.writeHead(302, { 
        'URI' : authenticateRequest.redirect_uri + '?code=qwerty&client_id=idp2013&redirect_uri=http://localhost:8888/requestToken' });
        response.end()  
        console.log("authenticate success.");  
    }
    else {
         // user authenticated
      response.writeHead(401, "Login unsuccessful");
        response.end()  
    }


}

function issueToken(request, response) {
    var issueTokenRequest = url.parse(request.url, true).query;
     if (issueTokenRequest.grant_type == "authorization_code" &&
        issueTokenRequest.client_id == "idp2013" && // only one client allowed
        issueTokenRequest.secret = "asdf" && // hardcoded secret
        issueTokenRequest.redirect_uri == "http://localhost:8888/requestToken")  {
        
        var isCodeValid = false;
        for (var i = 0; i < auth_codes.length; i++) {
            if (auth_codes[i].client_id == issueTokenRequest.client_id) {
                var currentTimeVal = new Date();
                // check for validity of authorization code
                if (issueTokenRequest.code == auth_codes[i].code 
                    && auth_codes[i].expires_on > currentTimeVal ) {                   
                    isCodeValid = true;
                    break;
                }
            }
                
        }
        if (isCodeValid) {
            // respond with a token
            // register token (auth server and resource server are the same, so they share state)
            var token = {};
             token.access_token = "2YotnFZFEjr1zCsicMWpAA";
             token.token_type = "bearer";
             token.expires_on = new Date() + 3600*1000;
             token_array.push(token);
              response.writeHead(200, { 
        'access_token' : token.access_token, 'token_type': token.token_type, 'expires_in': '3600'  });
              response.end();
       

        } else {
            response.writeHead(401, "Auth code invalid");
            response.end() 
        }

    }

}

//
// resource server functions
//




// the client calles this on the resource server running on port 8889
function requestResource(request, response) {
    // return the given clientID's full name
    //var request_data = querystring.parse(postData);
    console.log("requestResource hit!");
    console.log("request.url: " + request.url);

    var fullNameRequest = url.parse(request.url, true).query;
    // validate token
    var isTokenValid = false;
    for (var i = 0; i < token_array.length; i++) {
        if (token_array[i].client_id == fullNameRequest.client_id) {

            var currentTimeVal = new Date();
            if (token_array[i].token == fullNameRequest.token 
                && token_array[i].expires_on > currentTimeVal) {
                // token is valid!
                isTokenValid = true;
                break;
            }
        }
    };


    if (isTokenValid) {
    
        if (fullNameRequest.username == "olafur") {
            var response_data = JSON.stringify({
                 'fullname' : 'Ólafur Jens Ólafsson'
             });
            console.log("requestResource response_data: " + response_data); 
            
            response.writeHead(200, { 'Content-Type': 'application/json', 'Content-Length' :response_data.length});
            response.write(response_data);
            response.end();
        }
    }
    else {
        response.writeHead(401);
        response.end();
    }

    

}


// client
exports.index = index;
exports.authRedirect = authRedirect;
exports.requestToken = requestToken;
exports.getFullName = getFullName;

// auth server
exports.openLogin = openLogin;
exports.authenticate = authenticate;
exports.issueToken = issueToken;

// resource server
exports.requestResource = requestResource;
