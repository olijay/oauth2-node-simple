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
    console.log("requesting token");
    var tokenRequest = url.parse(request.url, true).query;
    http.get("http://localhost:8889/issueToken?grant_type=authorization_code&code=" + tokenRequest.code 
        + "&redirect_uri=" + tokenRequest.redirect_uri
        + "&client_id=idp2013" // the client maintains its own client_id, it is considered public information since the user agent will see it
        + "&secret=asdf", //  this would normally be in a secure store
        function(res) {
            if (res.statusCode == "200") { // successfully got back a token
                token = res.headers.access_token;               
               console.log("token obtained");
                returnfile(response,"./loggedin.html");
            }
  
    }).on('error', function(e) {
      console.log("requestToken Got error: " + e.message);
      response.writeHead(500, e.message);
      response.end();
    });
   
}

function getFullName(request,response) {

    var getFullNameRequest = url.parse(request.url, true).query;
    if (token && token != "") {// just making sure we have the token before calling requestResource
          http.get("http://localhost:8889/requestResource?client_id=idp2013&username=" + getFullNameRequest.username + "&token=" + token, 
        function(res) {
                var fullname = "";
                res.on('data', function(data) {
                    fullname += data;
                    
                });

                res.on('end', function() {
                    console.log("getFullName response obtained, name is " + fullname);
                     response.writeHead(200);
                    response.write(fullname);                   
                    response.end();
                });
                
                
            
  
    }).on('error', function(e) {
      console.log("getFullName Got error: " + e.message);
     
    });
    }
    else {
        response.writeHead(500, "token has disappeared!");
        response.end();
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
    console.log("authenticate  user " + authenticateRequest.username 
        + " pass " + authenticateRequest.password 
        + " redirect_uri" + authenticateRequest.redirect_uri 
        + " client_id " + authenticateRequest.client_id); 
    if (authenticateRequest.username == "olafur" &&
        authenticateRequest.password == "jens" && 
        authenticateRequest.redirect_uri == "http://localhost:8888/requestToken" &&// the redirect_uri on the client the user will be pointed to after auth
        authenticateRequest.client_id == "idp2013") { 

        // user authenticated
        // register code, bound to client and redirect_uri
        var auth_code = {};
        auth_code.code = 'qwerty'; // hardcoded auth code
        auth_code.client_id = authenticateRequest.client_id;
        auth_code.redirect_uri = authenticateRequest.redirect_uri
        auth_code.expires_on = Date.now() + 360*1000; // 10 minutes from now
        auth_codes.push(auth_code);

      response.writeHead(302, { 
        'URI' : authenticateRequest.redirect_uri + '?code=qwerty&client_id='+authenticateRequest.client_id+'&redirect_uri=' + authenticateRequest.redirect_uri });
        response.end()  
        console.log("authenticate success.");  
        // hardcoded auth code
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
        issueTokenRequest.client_id == "idp2013" && // the auth server allows only one client
        issueTokenRequest.secret == "asdf" && // hardcoded secret validation, this would normally be in a secure store
        issueTokenRequest.redirect_uri == "http://localhost:8888/requestToken")  {
        
        var isCodeValid = false;
        console.log("issueToken: auth_codes count " + auth_codes.length);
        for (var i = 0; i < auth_codes.length; i++) {
            if (auth_codes[i].client_id == issueTokenRequest.client_id) {
                console.log("issueToken: client_id OK");
                var currentTimeVal = Date.now();
                // check for validity of authorization code
                if (issueTokenRequest.code == auth_codes[i].code) {
                    console.log("issueToken: auth code OK"); 
                    console.log("issueToken expires_on:" + auth_codes[i].expires_on);
                    console.log("issueToken currentTimeVal:" + currentTimeVal);
                    if (auth_codes[i].expires_on > currentTimeVal ) { 
                        console.log("issueToken code is valid");
                        isCodeValid = true;
                        break;
                    }
                }
            }
                
        }
        if (isCodeValid) {
            // respond with a token
            // register token (auth server and resource server are the same, so they share state)
            var token = {};
             token.client_id = issueTokenRequest.client_id;
             token.access_token = "2YotnFZFEjr1zCsicMWpAA"; // hardcoded token
             token.token_type = "bearer";
             token.expires_on = Date.now() + 3600*1000;
             token_array.push(token);
              response.writeHead(200, { // TODO this probably shouldn't be in a header
        'access_token' : token.access_token, 'token_type': token.token_type, 'expires_in': '3600'  });
              response.end();
              console.log("token issued successfully.")
       

        } else {
            console.log("auth code invalid");
            response.writeHead(500, "Auth code invalid");            
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
      console.log("requestResource: token_array length" + token_array.length);

    var fullNameRequest = url.parse(request.url, true).query;
    console.log("requestResource: client_id param " + fullNameRequest.client_id);
     console.log("requestResource: client_id token_array " + token_array[0].client_id);   
    
    console.log("requestResource: username param " + fullNameRequest.username);
    console.log("requestResource: token param " + fullNameRequest.token);
    console.log("requestResource: token token_array " + token_array[0].token);

    // validate token
    var isTokenValid = false;
  

    for (var i = 0; i < token_array.length; i++) {
        if (token_array[i].client_id == fullNameRequest.client_id) {
            console.log("requestResource: client_id OK");
            

            if (token_array[i].access_token == fullNameRequest.token) {
                var currentTimeVal = Date.now();
                 console.log("requestResource: auth code OK"); 
                    console.log("requestResource expires_on:" + token_array[i].expires_on);
                    console.log("requestResource currentTimeVal:" + currentTimeVal);
                if (token_array[i].expires_on > currentTimeVal) {
                console.log("requestResource token is valid!");
                isTokenValid = true;
                break;
            }
        }
        }
    };


    if (isTokenValid) {
    
        if (fullNameRequest.username == "olafur") {
            var fullname =  'Ólafur Jens Ólafsson';
            //console.log("requestResource response_data: " + response_data); 
            
            response.writeHead(200, { 'Content-Type': 'application/json', 'Content-Length' :fullname.length});
            response.write(fullname);
            response.end();
        }
    }
    else {
           console.log("requestResource token is INVALID");
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
