var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
//client
handle["/"] = requestHandlers.index;
handle["/index"] = requestHandlers.index;
handle["/authRedirect"] = requestHandlers.authRedirect;
handle["/getFullName"] = requestHandlers.getFullName;
handle["/requestToken"] = requestHandlers.requestToken;


// resource server
handle["/requestResource"] = requestHandlers.requestResource;

// auth server
handle["/issueToken"] = requestHandlers.issueToken;
handle["/authenticate"] = requestHandlers.authenticate;
handle["/openLogin"] = requestHandlers.openLogin;


var port = 8888;
if (process.argv[2]) {
    port = process.argv[2];
    }
server.start(router.route, handle, port);