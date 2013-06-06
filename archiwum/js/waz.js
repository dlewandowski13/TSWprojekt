var gra = false; // czy gra jest aktywna	
// wyliczenie ilosc pol do gry w zaleznosci od rozdzieloczosc okna
// --->> "-1" zeby plansza gry nie wychodzila poza obszar ekranu
var ilSzerokosc = parseInt(window.innerWidth / 20) - 1;
var ilWysokosc = parseInt(window.innerHeight / 20) - 3;	
var jedzenieX=0;
var jedzenieY=0;
var gracze = new Array(5);
for(var i=0; i < 6; i++)
	gracze[i] = 1;

// tworze obiekt canvas ze standardu HTML 5 do rysowania na nim gry
var canvas = document.createElement('canvas'),
context = canvas.getContext('2d'),
ilWezy = 0,
predkosc = 600;
// stworzenie planszy o dwoch wymiarach 
var plansza = new Array(ilSzerokosc);
for (var i = 0; i < plansza.length; i++)	
	plansza[i] = new Array(ilWysokosc);



var bolek = false;
		
// wymiary ramki do planszy
canvas.width = ilSzerokosc*20;				
canvas.height = ilWysokosc*20;	
	
// pobranie referencji do obiekty body ze strony HTML
// --->pobieram [0], zeby otrzymac jeden element, a nie cala liste,
// --->bo getElementsBtTagName() zwraca zawsze liste
var body = document.getElementsByTagName('body')[0];	
var punktacja = document.createTextNode("Punkty: ");
// dodanie obiektu punktacji i planszy (canvas) do ciala strony	
body.appendChild(punktacja);	
body.appendChild(canvas);


var login = document.getElementById('imie');	
var imieGracza = login.value;
var waz = new Waz(imieGracza);
waz.nr=1;
// nawiazanie polaczenia z serwerem
var socket = io.connect('http://localhost:3250');

// inicjacja lokalnego gracza	
socket.emit("inicjalizacja", waz.imie, ilSzerokosc, ilWysokosc);

// zainicjowanie lokalnego gracza
socket.on('numerek', function (numerek, x, y) {	
	waz.nr = numerek;
	waz.aktywnosc = true;
	gra = true;				
	plansza = waz.stworz(plansza, 4, x, y); 
	rysowanie(plansza);		
});

socket.on('jedzenie', function(wsp) {
	// wpisanie jedzenia na plansze
	plansza[jedzenieX][jedzenieY] = 0;	
	plansza[wsp.x][wsp.y] = 5;	
	jedzenieX = wsp.x;
	jedzenieY= wsp.y;
});

socket.on('wezWeza', function (w) {
	console.log(w);
	// new Waz zeby wiedzial, ze to jest klasa weza
	gracze[w.nr] = new Waz("m");					
	gracze[w.nr].waz = w.waz;
	gracze[w.nr].punkty = w.punkty;
	gracze[w.nr].imie = w.imie;
	gracze[w.nr].predkosc = w.predkosc;
	gracze[w.nr].nr = w.nr;		
	plansza = gracze[w.nr].stworz(plansza, 4, w.waz[0].x, w.waz[0].y);	
	// stworzenie przypisuje kierunek na domyslny, wiec ustawiam recznie pozniej
	gracze[w.nr].kierunek = w.kierunek;		
	gracze[w.nr].aktywnosc = w.aktywnosc;
});

socket.on('dodajPunkt', function (nr) {			
	gracze[nr].punkty++;	
	gracze[nr].wydluz();
	plansza[jedzenieX][jedzenieY] = 0;
});				

socket.on('odlaczenie', function () {			
	socket.emit("przekazNr", waz.nr);			
});

socket.on('zatrzymajWeza', function (nr) {			
	gracze[nr].aktywnosc = false;		
});

socket.on('zmien', function (w) {			
	gracze[w.nr].kierunek = w.kierunek;				
});

// nasluchiwanie wcisniecia przyciskow strzalek do sterowania wezem
window.addEventListener('keydown', function(event) {
	if (event.keyCode === 38 && waz.kierunek !== 'd') {
		waz.kierunek = 'g'; 
		socket.emit("ruch", {kierunek: 'g', nr: waz.nr});
	} else if (event.keyCode === 40 && waz.kierunek !== 'g') {
		waz.kierunek = 'd';
		socket.emit("ruch", {kierunek: 'd', nr: waz.nr});
	} else if (event.keyCode === 39 && waz.kierunek !== 'l') {
		waz.kierunek = 'p';
		socket.emit("ruch", {kierunek: 'p', nr: waz.nr});
	} else if (event.keyCode === 37 && waz.kierunek !== 'p') {
		waz.kierunek = 'l';
		socket.emit("ruch", {kierunek: 'l', nr: waz.nr});
	}
});		

function rysowanieGraczy()
{
	for(var i = 0; i<6; i++)
	{
		// jesli gracz istnieje)
		if(gracze[i] != 1 && gracze[i].aktywnosc == true) plansza = gracze[i].rysuj(plansza);
	}
}

// rysowanie kolejnych elementow gry
function rysowanie()
{
	context.clearRect(0, 0, canvas.width, canvas.height); // wyczyszczenie planszy
	rysujRamke(); // narysowanie ramki i wypisanie punktacji			
	
	// narysowanie lokalnego gracza					
	plansza = waz.rysuj(plansza);
	// rysowanie innych graczy
	rysowanieGraczy();		
	
	// narysowanie wezy i jedzenia
	for (var x = 0; x < plansza.length; x++) {
		for (var y = 0; y < plansza[0].length; y++) {
			if (plansza[x][y] === 5) {
				context.fillStyle = 'red';
				context.fillRect(x * 20, y * 20, 20, 20);
			} else if (plansza[x][y] === 1) {
				context.fillStyle = 'green';
				context.fillRect(x * 20, y * 20, 20, 20);          
			} else if (plansza[x][y] === 2) {
				context.fillStyle = 'blue';
				context.fillRect(x * 20, y * 20, 20, 20);           							
			} else if (plansza[x][y] === 3){
				context.fillStyle = 'purple';
				context.fillRect(x * 20, y * 20, 20, 20);  							
			} else if (plansza[x][y] === 4){
				context.fillStyle = 'yellow';
				context.fillRect(x * 20, y * 20, 20, 20);  							
			}
		}
	}
	
	// wywolanie funkcji rysowania z opoznieniem w ms okreslonym zmienna prekosc
	if(waz.aktywnosc == true) setTimeout(rysowanie, predkosc);        
}

function rysujRamke() 
{		
	context.fillStyle = 'black'; // okresla kolor ramki
	context.lineWidth = 5; // okresla szerekosc ramki
	//narysowanie ramki planszy
	context.strokeRect(0, 0, canvas.width, canvas.height);
	
	// uaktualnienie ilosc punktow gracza
	var tekst = waz.imie + " zdobyl " + waz.punkty + " punkty/ow.      ";
	
	// stworzenie napisu ze statystykami graczy
	for(var i = 0; i < 6; i++)
	{
		if(gracze[i] !=1) tekst += "    " + gracze[i].imie + " zdobyl " + gracze[i].punkty + " punkty/ow.      ";
	}		

	punktacja.nodeValue = tekst;
	punktacja.fontsize=20;	
}	

function przegrana(imie)
{
	gra = false;
	context.clearRect(0, 0, canvas.width, canvas.height); // wyczyszczenie ekranu gry
	context.fillStyle = 'red';
	context.font = '20px arial';		
	context.fillText(imie+ ' przegral !', canvas.width / 2 , 50);
}

function losowanieX()
{
	return Math.round(Math.random() * ilSzerokosc);
}

function losowanieWspolrzednych()
{
	var tab = [];
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

	this.wpisz = function(xx, yy)
	{
		// wpisanie weza na plansze zaczynajac od glowy
		for (var i = 0; i < this.waz.length; i++)
		{
			plansza[xx - i][yy] = this.nr;
		}		
	}
	
	this.stworz = function(plansza, init, x, y) 
	{
		this.kierunek = 'p';
		this.punkty = 0;
		this.predkosc = 100;	
		this.aktywnosc = true;
		this.waz = new Array(init);
		var wspolrzedne = [2];
		wspolrzedne[0]=x;
		wspolrzedne[1]=y;
		
		// wpisanie weza na plansze zaczynajac od glowy
		for (var i = 0; i < this.waz.length; i++)
		{
			this.waz[i] = { x: wspolrzedne[0] - i, y: wspolrzedne[1] };
			console.log(this.nr);
			plansza[wspolrzedne[0] - i][wspolrzedne[1]] = this.nr;
		}	 
		return plansza;
	}

	// funkcja wydluza tulow weza o 1
	this.wydluz = function()
	{
		this.waz.push({ x: this.waz[this.waz.length - 1].x, y: this.waz[this.waz.length - 1].y });
		plansza[this.waz[this.waz.length - 1].x][this.waz[this.waz.length - 1].y] = this.nr;
	}
	
	this.rysuj = function(plansza) 
	{			
		// przejscie po kazdym elemencie weza, zaczynam od jego ostatniego czlonu
		for (var i = this.waz.length - 1; i >= 0; i--) 
		{			
			// ---> roznica miedzy porownaniem ===, a == jest taka, ze === nie konwertuje typow
			// przesuwam glowe weza zgodnie z jego kierunkiem poruszania sie
			if (i === 0) {
				switch(this.kierunek) {
					case 'p': // prawo
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
	 
				// sprawdzenie czy glowa weza nie wyszla poza zakres planszy gry
				if (this.waz[0].x < 0 || this.waz[0].x >= ilSzerokosc || 	this.waz[0].y < 0 ||	this.waz[0].y >= ilWysokosc)
				{				
					//przegrana(this.imie);
					plansza.push(this.nr);
					plansza[this.waz[0].y].push(this.nr);
					plansza[this.waz[0].x][this.waz[0].y] = this.nr;
					//return;					
				}
				// jesli waz wszedl na jedzenie to zwiekszam il. punktow
				if (plansza[this.waz[0].x][this.waz[0].y] === 5) 
				{
					this.punkty += 1;
					socket.emit("zjadlemJablko", this.nr);					
					// oraz dodaje nowy czlon weza					
					this.wydluz();
									
				// sprawdzenie czy waz nie uderzyl sam w siebie
				} else if (plansza[this.waz[0].x][this.waz[0].y] === this.nr)
				{	
					console.log("Wpadlem tutaj, sam w siebie lolo");
					przegrana(this.imie);
					return;					
				} else if (plansza[this.waz[0].x][this.waz[0].y] === 2)
				{				
					// wygral adam
				
											
				} else if (plansza[this.waz[0].x][this.waz[0].y] === 1)
				{				
			
				}						
				// wpisanie nowej pozycji glowy weza do planszy
				plansza[this.waz[0].x][this.waz[0].y] = this.nr;
			} else  // dla wszystkich czlonow weza oprocz glowy
			{
				// zwolnienie ostatniego czlonu weza
				if (i === (this.waz.length - 1))
					plansza[this.waz[i].x][this.waz[i].y] = null;				
	 
				// przypisanie miejsca wczesniejszego czlonu weza do czlonu i
				this.waz[i] = { x: this.waz[i - 1].x, y: this.waz[i - 1].y };
				plansza[this.waz[i].x][this.waz[i].y] = this.nr;
			}
		}
		return plansza;		
	}
}			
					
					
