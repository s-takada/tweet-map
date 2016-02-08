const http     = require('http');
const socketio = require('socket.io');
const fs       = require('fs');
const twitter  = require('twitter');
const path     = require('path');
const client   = new twitter({
  consumer_key: '',
  consumer_secret: '',
  access_token_key: '',
  access_token_secret: ''
});

var stream = null;

var server = http.createServer(requestListener);
server.listen((process.env.PORT || 3000), function() {
  console.log('Server Starting !!! ' + (process.env.PORT || 3000));
});

function requestListener(req, res) {

    var requestURL = req.url;
    var extensionName = path.extname(requestURL);

    switch(extensionName)
    {
        case ".html":
            readFileHandler(requestURL, "text/html", res);
            break;
        case ".css":
            readFileHandler(requestURL, "text/css", res);
            break;
        case ".js":
            readFileHandler(requestURL, "text/javascript", res);
            break;
        default:
            readFileHandler("/index.html", "text/html", res);
            break;
    }
}

function readFileHandler(fileName, contentType, response) {

    var filePath = __dirname + fileName;

    fs.exists(filePath, function(exits) {
        if(exits) {
          fs.readFile(filePath, {encoding: 'utf8'}, function (error, data) {
            if (error) {
              response.statusCode = 500;
              response.end("Internal Server Error");
            } else {
              response.statusCode = 200;
              response.setHeader("Content-Type", contentType);
              response.end(data);
            }
          });
        } else {
            response.statusCode = 400;
            response.end("400 Error");
        }
    });
}

var io = socketio.listen(server);

io.sockets.on('connection', function(socket) {

  if(stream === null) {
    client.stream( 'statuses/filter', {　locations : '132.2,29.9,146.2,39.0,138.4,33.5,146.1,46.20' }, function(s) {
      stream = s;
      s.on('data', function( data ) {
        if (data.coordinates) {
          if (data.coordinates !== null) {
            var outputPoint = {"lat": data.coordinates.coordinates[0], "lng": data.coordinates.coordinates[1]};
            console.log(outputPoint);
            io.sockets.emit('tw_map', outputPoint);
            io.sockets.emit('tw_data', data);
          }
        }
      });
    });
  }

});
