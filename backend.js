// handler odpowiedzialny za wyswietlenie strony o nazwie page.html
var handler = function(req, res) {
	fs.readFile('./frontend.html', function (err, data) {
	    if(err) throw err;
	    res.writeHead(200);
		res.end(data);
	});
}

// definicja glownych zmiennych aplikacji
var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var port = 3250;

var gracze = [];
var gra = require('./waz.js');
var mapa;
var ilAktywnychGraczy= 0;
var ilGraczy = 0;

// uruchomienie serwera http
app.listen(port);

// nasluchawianie za pomoca socket.io podlaczenia sie nowego gracza
io.sockets.on('connection', function (socket) {
	
	// wywowylane przez klienta po polaczeniu sie z serwerem
	socket.on('inicjalizacja', function (imie) {
		ilAktywnychGraczy++;
		ilGraczy++;
		socket.emit('numerek', ilGraczy);
  	});	
	
	// wysyla weza, ktory dolaczyl do gry innym graczom
	socket.on('przekazWeza', function (waz) {
		console.log("TUTAJ" +waz);
		gracze.push(waz);
		
		socket.broadcast.emit('wezWeza', waz);
   	});	
	
	// po wylaczeniu przegladarki wykona sie ta funkcja
	socket.on('disconnect', function () {
		ilAktywnychGraczy--;
  	});
	
	socket.on('ruch', function (data) {
        socket.broadcast.emit('zmien', data);
    });

	
	
});
