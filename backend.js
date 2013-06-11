// handler odpowiedzialny za wyswietlenie strony o nazwie page.html
var handler = function(req, res) {
	fs.readFile('./index.html', function (err, data) {
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

// tablica przechowuje obiekty wezy
var gracze = new Array(10);	
var aktywnosc = new Array(10);
for(var i=0; i < gracze.length; i++)
{ // wpisanie 1 jako puste miejsce dla gracza
	gracze[i] = 1;
	// tablica pomocnicza do okreslenia, ktory gracz sie rozlaczyl
	aktywnosc[i] = 0; 
}

// zmienne serwera
var ilSzerokosc=0;
var ilWysokosc=0;
var ilGraczy = 0;
var jedzenie;

// uruchomienie serwera http
app.listen(port);

// nasluchawianie za pomoca socket.io podlaczenia sie nowego gracza
io.sockets.on('connection', function (socket) {
	
	// wywowylane przez klienta po polaczeniu sie z serwerem
	socket.on('inicjalizacja', function (imie, ilSzer, ilWys) {
		// jesli jeszcze nie gral zadne gracz
		if(ilGraczy==0) 
		{
			ilSzerokosc = ilSzer;
			ilWysokosc = ilWys;
			jedzenie = losowanieWspolrzednych();
			socket.emit('jedzenie', { x: jedzenie[0], y: jedzenie[1] } );
		}
		else {
			// jesli nowa podlaczony gracz ma mniejsza ekran niz obecnie ustawiony to zmniejszamy 

			if(ilWysokosc > ilWys || ilSzerokosc > ilSzer ) 
			{
				ilWysokosc = ilWys;
				ilSzerokosc = ilSzer;
			}
			socket.emit('jedzenie', { x: jedzenie[0], y: jedzenie[1] } );
			for(var i=0; i< gracze.length; i++)
			{ // wyslanie obecnie grajacych wezy
				if(gracze[i] !=1) if(gracze[i].aktywnosc ==true) socket.emit('wezWeza', gracze[i]);
			}		
		}
		// dodanie obecnie inicjalizowanego gracza do planszy
		dodajGracza(imie, ilSzer, ilWys);				
  	});	
	
	// funckja wykonuje sie w odpowiedzi na informacje od klienta o tym, ze zjadl jablko	
	socket.on('zjadlemJablko', function (nr) {
		gracze[nr].punkty++;
		gracze[nr].wydluz();
		// wyslanie innym klientom rozkazu zwiekszenia il punktow 
		// --> broadcast czyli wszystkim oprocz tego klienta ktory odpalil ta funkcje w ktorej jestesmy 
		socket.broadcast.emit('dodajPunkt', nr);
		jedzenie = losowanieWspolrzednych();
		// wyslanie pozycji nowego jablka do wszystkich graczy
		io.sockets.emit('jedzenie', { x: jedzenie[0], y: jedzenie[1] } );
  	});	

	socket.on('zjadlemWeza', function (nr, tenCoZjadl) {
		console.log("Zjadlem weza" );
		if( gracze[nr] != 1)
		{
			// wyslanie informacji do wszystkich oprocz tego co zjadl
			socket.broadcast.emit('skrocWeza', nr, tenCoZjadl);			
			gracze[tenCoZjadl].punkty+=5;
			var ilosc = gracze[nr].waz.length/2;
			for(var j=0; j<ilosc; j++)
			{
				gracze[nr].waz.pop();
			}
		}
  	});
	
	socket.on('przegralem', function (nr) {
		gracze[nr] = 1; // oznaczenie jako brak gracza --> tak jak inicjalnie wypelniam tablice graczy "1" 
		socket.broadcast.emit('przegral', nr);
  	});
	
	// po wylaczeniu przegladarki wykona sie ta funkcja
	socket.on('disconnect', function () {		
		io.sockets.emit('odlaczenie');
		// czekam na odpowiedz od innych graczy przez 400ms
		setTimeout(odlacz, 400); 
  	});
	
	socket.on('przekazNr', function (nr) {
		// ustawia flage aktywnosci na 2 czyli dany gracz odpowiedzial, ze gra
		aktywnosc[nr] = 2;
	});	
	
	// aktualizacja zmiany kierunku jednego z wezy u reszty graczy
	socket.on('ruch', function (data) {
	if(gracze[data.nr] != 1)
	{
        socket.broadcast.emit('zmien', data);
		gracze[data.nr].kierunek = data.kierunek;
		gracze[data.nr].ruszaj();
	}
});	
	
	// funkcja sprawdzajaca, ktory gracz sie odlaczyl
	function odlacz()
	{	
		for(var i=0; i < gracze.length; i++)
			if(aktywnosc[i] == 1) 
			{
				console.log("odlaczyl sie gracz o nazwie: " + gracze[i].imie);
				gracze[i].aktywnosc=false;
				aktywnosc[i] = 0;
				socket.broadcast.emit('zatrzymajWeza', i);
			}
		for(var i=0; i < aktywnosc.length; i++) if(aktywnosc[i] == 2) aktywnosc[i] == 1;
	}

	function dodajGracza(imie, ilSzer, ilWys)
	{
		var flaga = true;
		var waz;
		for(var i =0; i< gracze.length; i++)
		{	
			if(gracze[i].imie == imie)
			{
				flaga = false;		
				waz = gracze[i];
				break;
			}
		}
		
		if(flaga == true)
		{
			// stworzenie klasy dodawanego gracza
			waz = new Waz(imie);
			ilGraczy++;
			waz.nr = ilGraczy;
			waz.stworz(4);
		}
		
		// przekazanie parametrow weza do gracza wlasnie podlaczajacego sie
		socket.emit('numerek', ilGraczy, waz.waz[0].x, waz.waz[0].y);	
		// zapisanie gracza w pamieci serwera
		gracze[waz.nr] = waz;
		aktywnosc[ilGraczy] = 1;
		// wyslanie innym graczom klasy stworzonego weza
		socket.broadcast.emit('wezWeza', waz);
	}

// koniec polaczenia
});

function losowanieWspolrzednych()
{
	var tab = [2];
	do {
		tab[0] = Math.round(Math.random() * ilSzerokosc);
		tab[1] = Math.round(Math.random() * ilWysokosc);
	} while (tab[0] <= 12 || tab[1]  <=10); // --> ograniczam losowanie, zeby waz lub jablko nie wylosowalo sie za blisko gornego lewego rogu
	return tab;
}	

// klasa weza
function Waz(imie)
{
	this.imie = imie;
	this.nr;
	this.waz;
	this.aktywnosc;
	this.ilSzerokosc;
	this.ilWysokosc;
	this.punkty;

	// funkcja wydluza tulow weza o 1
	this.wydluz = function()
	{
		this.waz.push({ x: this.waz[this.waz.length - 1].x, y: this.waz[this.waz.length - 1].y });
	}

	this.stworz = function(init) 
	{
		this.kierunek = 'p';
		this.punkty = 0;
		this.aktywnosc = true;
		this.waz = new Array(init);
		
		var wspolrzedne = losowanieWspolrzednych();
		
		// stworzenie czlonow weza 
		for (var i = 0; i < this.waz.length; i++)
		{
			this.waz[i] = { x: wspolrzedne[0] - i, y: wspolrzedne[1] };
		}	 
	}

	this.ruszaj = function() 
	{			
		// przejscie po kazdym elemencie weza, zaczynam od jego ostatniego czlonu
		for (var i = this.waz.length - 1; i >= 0; i--) 
		{			
			// ---> roznica miedzy porownaniem ===, a == jest taka, ze === nie konwertuje typow
			// przesuwam glowe weza zgodnie z jego kierunkiem poruszania sie
			if (i === 0) {
				switch(this.kierunek) {
				case 'p': // gora
					this.waz[0] = { x: this.waz[0].x + 1, y: this.waz[0].y }
					break;
				case 'l': // lewo
					this.waz[0] = { x: this.waz[0].x - 1, y: this.waz[0].y }
					break;
				case 'g': // gora
					this.waz[0] = { x: this.waz[0].x, y: this.waz[0].y - 1 }
					break;
				case 'd': // dol
					this.waz[0] = { x: this.waz[0].x, y: this.waz[0].y + 1 }
					break;
				}
				
			} else  // dla wszystkich czlonow weza oprocz glowy
			{
				// przypisanie miejsca wczesniejszego czlonu weza do czlonu i
				this.waz[i] = { x: this.waz[i - 1].x, y: this.waz[i - 1].y };				
			}				
		}
	}
}
