var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.index;
handle["/index"] = requestHandlers.index;
handle["/loginImplicit"] = requestHandlers.loginImplicit;
handle["/requestClientInformation"] = requestHandlers.requestClientInformation;

server.start(router.route, handle);