function route(handle, pathname, request, response, postData) {
    
    if (typeof handle[pathname] === 'function') {
        handle[pathname](request, response, postData);
    } else if (pathname.indexOf("img/") !== -1) {
        handle["img"](request, response);
    }
    else {
        console.log("No request handler found for " + pathname);
        response.writeHead(404, { 'Content-Type': 'text/html' });
        response.write("<h1>404 Not Found</h1>");
        response.end("The page you were looking for: " + pathname + " can not be found");
    }
}

exports.route = route;