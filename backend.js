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

var plansza;
var ilGraczy = 0;
var ilSzerokosc;
var ilWysokosc;
var jedzenie;

// uruchomienie serwera http
app.listen(port);

// nasluchawianie za pomoca socket.io podlaczenia sie nowego gracza
io.sockets.on('connection', function (socket) {
	
	// wywowylane przez klienta po polaczeniu sie z serwerem
	socket.on('inicjalizacja', function (imie, ilSzer, ilWys) {
		// jesli jeszcze nie gral zadne gracz, tworze plansze do gry
		if(ilGraczy==0) 
		{
			stworzPlansze(ilSzer, ilWys);
			jedzenie = losowanieJedzenia();
			socket.emit('jedzenie', { x: jedzenie[0], y: jedzenie[1] } );
		}
		else {
			socket.emit('jedzenie', { x: jedzenie[0], y: jedzenie[1] } );
			for(var i=0; i< gracze.length; i++)
			{ // wyslanie obecnie grajacych wezy
				if(gracze[i] !=1) socket.emit('wezWeza', gracze[i]);
			}		
		}
		// dodanie obecnie inicjalizowanego gracza do planszy
		dodajGracza(imie, ilSzer, ilWys);				
  	});	
	
	socket.on('zjadlemJablko', function (nr) {
		gracze[nr].punkty++;
		socket.broadcast.emit('dodajPunkt', nr);
		jedzenie = losowanieJedzenia();
		// wyslanie pozycji nowego jablka do wszystkich graczy
		io.sockets.emit('jedzenie', { x: jedzenie[0], y: jedzenie[1] } );
  	});	

	socket.on('zjadlemWeza', function (nr) {
		console.log("Zjadlem weza" );
		socket.broadcast.emit('skrocWeza', nr);
		
		gracze[nr].punkty+=5;
		var ilosc = gracze[nr].waz.length/2;
		for(var j=0; j<ilosc; j++)
		{
			gracze[nr].waz.pop();
		}

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
        socket.broadcast.emit('zmien', data);
		gracze[data.nr].kierunek = data.kierunek;
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
	
	function stworzPlansze(ilSzer, ilWys)
	{
		ilSzerokosc = ilSzer;
		ilWysokosc = ilWys;
		plansza = new Array(ilSzer);
		for (var i = 0; i < plansza.length; i++)	
			plansza[i] = new Array(ilWys);	

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
			waz.stworz(4, ilSzer, ilWys);
		}
		
		// przekazanie parametrow weza do gracza wlasnie podlaczajacego sie
		//console.log("  !!!! "+waz.waz[0].x+" "+waz.waz[0].y);
		socket.emit('numerek', ilGraczy, waz.waz[0].x, waz.waz[0].y);	
		// zapisanie gracza w pamieci serwera
		gracze[ilGraczy] = waz;
		aktywnosc[ilGraczy] = 1;
		rysowanieGraczy();
		// wyslanie innym graczom klasy stworzonego weza
		socket.broadcast.emit('wezWeza', waz);
	}

	function losowanieJedzenia()
	{
		// wylosowanie wspolrzednych dla jedzenia
		var wspolrzedne = new Array(2);
		wspolrzedne[0] = Math.round(Math.random() * ilSzerokosc);
		wspolrzedne[1] = Math.round(Math.random() * ilWysokosc);
		console.log(wspolrzedne[0]+" "+ wspolrzedne[1]);
	
		return wspolrzedne;	
	}

// koniec polaczenia
});


function losowanieX()
{
	return Math.round(Math.random() * ilSzerokosc);
}

function losowanieWspolrzednych()
{
	var tab = [2];
	tab[0] = Math.round(Math.random() * ilSzerokosc);
	tab[1] = Math.round(Math.random() * ilWysokosc);
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

	this.wpisz = function()
	{
		// wpisanie weza na plansze zaczynajac od glowy
		for (var i = 0; i < this.waz.length; i++)
		{
			plansza[this.waz[i].x][this.waz[i].y] = this.nr;
		}		
	}

	this.stworz = function(init) 
	{
		//console.log("szerokosc: "+plansza.length+" wys: " +plansza[0].length);
		this.kierunek = 'p';
		this.punkty = 0;
		this.aktywnosc = true;
		this.predkosc = 400;	
		this.waz = new Array(init);
		
		var wspolrzedne = losowanieWspolrzednych();
		
		// stworzenie czlonow weza 
		for (var i = 0; i < this.waz.length; i++)
		{
			this.waz[i] = { x: wspolrzedne[0] - i, y: wspolrzedne[1] };
		}	 
		//return plansza;
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
				
				//plansza[this.waz[0].x][this.waz[0].y] = this.nr;
			} else  // dla wszystkich czlonow weza oprocz glowy
			{
				// przypisanie miejsca wczesniejszego czlonu weza do czlonu i
				this.waz[i] = { x: this.waz[i - 1].x, y: this.waz[i - 1].y };				
			}			
		//return plansza;		
		}
	}
}	

function rysowanieGraczy()
{
	for(var i = 0; i < gracze.length; i++)
	{
		// jesli gracz istnieje)
		if(gracze[i] != 1 && gracze[i].aktywnosc == true) gracze[i].ruszaj();
	}
	setTimeout(rysowanieGraczy, 400);
}