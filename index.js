var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.index;
handle["/index"] = requestHandlers.index;
handle["/authorizeImplicit"] = requestHandlers.authorizeImplicit;
handle["/requestResource"] = requestHandlers.requestResource;
handle["/registerToken"] = requestHandlers.registerToken;
handle["/getStuff"] = requestHandlers.getStuff;


server.start(router.route, handle, process.argv[2]);