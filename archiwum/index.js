// handler odpowiedzialny za wyswietlenie strony o nazwie page.html
var handler = function(req, res) {
	fs.readFile('./page.html', function (err, data) {
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

var gracze = new Array(4);
var licznik = [];
//var gra = require('./waz.js');
var mapa;

// uruchomienie serwera http
app.listen(port);

// nasluchawianie za pomoca socket.io podlaczenia sie nowego gracza
io.sockets.on('connection', function (socket) {
	
	var ilGraczy = 1;
	socket.on('inicjalizacja', function () {
		licznik.push(ilGraczy);
		socket.emit("dodaj", licznik.length);
		
  	});	
	
	// po wylaczeniu przegladarki wykona sie ta funkcja
	socket.on('disconnect', function () {
		ilGraczy--;
  	});

	
	socket.on('ruch', function (data) {
        socket.emit('zmien', data);
    });

	
	
});
