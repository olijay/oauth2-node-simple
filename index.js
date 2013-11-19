var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
//client
handle["/"] = requestHandlers.index;
handle["/index"] = requestHandlers.index;
handle["/authRedirect"] = requestHandlers.authRedirect;

// resource server
handle["/requestResource"] = requestHandlers.requestResource;

// auth server
handle["/issueToken"] = requestHandlers.issueToken;
handle["/authenticate"] = requestHandlers.authenticate;
handle["/openLogin"] = requestHandlers.openLogin;



server.start(router.route, handle, process.argv[2]);