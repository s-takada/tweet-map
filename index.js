const http = require('http');
const socketio = require('socket.io');
const fs = require('fs');
const twitter = require('twitter');
const client = new twitter({
    consumer_key: '',
    consumer_secret: '',
    access_token_key: '',
    access_token_secret: ''
});
var stream = null;

var server = http.createServer(function(req, res) {
  res.writeHead(200, {'Content-Type':'text/html'});
  res.end(fs.readFileSync('./index.html', 'utf-8'));
}).listen(3000);

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
