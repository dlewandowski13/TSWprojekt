var gra = false; // czy gra jest aktywna	
var waz= new Waz("Adam");
// wyliczenie ilosc pol do gry w zaleznosci od rozdzieloczosc okna
// "-1" zeby plansza gry nie wychodzila poza obszar ekranu

// stworzenie planszy o dwoch wymiarach 
var plansza = new Array(ilSzerokosc);
for (var i = 0; i < plansza.length; i++)	
	plansza[i] = new Array(ilWysokosc);



	var bolek = false;
			
	// wymiary ramki do planszy
	canvas.width = ilSzerokosc*20;				
	canvas.height = ilWysokosc*20;
	

	
	
	waz.nr=1;
	var waz2 = new Waz("Adam");
	
	//plansza = waz2.stworz(plansza, 8);
//		cze.push(waz);
	// dodanie dwoch graczy lokalnych
	//ilWezy++;
	//var waz = new Waz("Adam", ilWezy);
	//plansza = waz.stworz(plansza, 8);				

	//gra = true;
	
	// wygenerowanie pozycji pierwszego punktu
	plansza = losowanieJedzenia(plansza);
		
	// pobranie referencji do obiekty body ze strony HTML
	// pobieram [0], zeby otrzymac jeden element, a nie cala liste,
	// bo getElementsBtTagName() zwraca zawsze liste
	var body = document.getElementsByTagName('body')[0];	
	var punktacja = document.createTextNode("Punkty: ");
	// dodanie obiektu punktacji i planszy (canvas) do ciala strony	
	body.appendChild(punktacja);	
	body.appendChild(canvas);

	// nawiazanie polaczenia z serwerem
	var socket = io.connect('localhost:3250');
				
	socket.emit("inicjalizacja", waz.imie);
	
	socket.on('numerek', function (numerek) {	
		waz.nr = numerek;
		waz.aktywnosc = true;
		gra = true;
		plansza = waz.stworz(plansza, 4);
		rysowanie(plansza);
		//console.log("SIEMKA");
		socket.emit('przekazWeza', waz);
	});
	
	socket.on('wezWeza', function (w) {
		gracze.push(w);
		gracze[gracze.length-1] = new Waz("adam");					
		gracze[gracze.length-1].waz = w.waz;
		gracze[gracze.length-1].punkty = w.punkty;
		gracze[gracze.length-1].imie = w.imie;
		gracze[gracze.length-1].kierunek = w.kierunek;
		gracze[gracze.length-1].predkosc = w.predkosc;
		gracze[gracze.length-1].nr = w.nr;
		//console.log("SIEMKA" + w);
		///ilGraczy++;
	});
	
	socket.on('dodajGraczy', function (g) {
		gracze = g;
		console.log("JAK TO" + gracze);
		///ilGraczy++;
	});				
	
	socket.on('zmien', function (w) {
		if(w.kierunek) {
			//console.log(w);
			gracze[0].kierunek = w.kierunek;
			//waz.kierunek=data.kierunek;						
		} else console.log("Blad");					
	});
	
	// wywolanie f. odpowiedzialnej za rysowanie gry
	//rysowanie(plansza);
	
	// nasluchiwanie wcisniecia przyciskow strzalek do sterowania wezem
	window.addEventListener('keydown', function(event) {
		if (event.keyCode === 38 && waz.kierunek !== 'd') {
			waz.kierunek = 'g';
			socket.emit("ruch", {kierunek: 'g', nr: waz.nr});
		} else if (event.keyCode === 40 && waz.kierunek !== 'g') {
			waz.kierunek = 'd';
			socket.emit("ruch", {kierunek: 'd'});
		} else if (event.keyCode === 39 && waz.kierunek !== 'l') {
			waz.kierunek = 'p';
			socket.emit("ruch", {kierunek: 'p'});
		} else if (event.keyCode === 37 && waz.kierunek !== 'p') {
			waz.kierunek = 'l';
			socket.emit("ruch", {kierunek: 'l'});
		}
	});	
		
	
	function rysowanieGraczy()
	{
		if(gracze.length > 0) {
			console.log(gracze[0]);
			plansza = gracze[0].rysuj(plansza);
		
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
		
		// if(bolek) plansza = gracze[1].rysuj(plansza);
		
		//for(i=1; i<gracze.length-1; i++)
		//{
		//	plansza=gracze[0].rysuj(plansza);
		//	if(gracze[0]) plansza=gracze[1].rysuj(plansza);
	//	}
		
	//	plansza = waz2.rysuj(plansza);
		
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
				} else if (plansza[x][y] != null){
					context.fillStyle = 'blue';
					context.fillRect(x * 20, y * 20, 20, 20);  							
				}
			}
		}
		
		// wywolanie funkcji rysowania z opoznieniem w ms okreslonym zmienna prekosc
		if(gra) setTimeout(rysowanie, predkosc);        
	}
	
	function rysujRamke() 
	{		
		context.fillStyle = 'black'; // okresla kolor ramki
		context.lineWidth = 5; // okresla szerekosc ramki
		//narysowanie ramki planszy
		context.strokeRect(0, 0, canvas.width, canvas.height);
		
		// uaktualnienie ilosc punktow gracza
		if(bolek) { 
				var tekst = waz.imie+waz.nr+ " zdobyl " + waz.punkty + " punkty/ow.  " + waz2.imie+ " zdobyl " + waz2.punkty + " punkty/ow";
		} else var tekst = waz.imie+waz.nr+ " zdobyl " + waz.punkty + " punkty/ow.  ";
				 // + waz2.imie+ " zdobyl " + waz2.punkty + " punkty/ow";
		punktacja.nodeValue = tekst;
		punktacja.fontsize=20;	
		//aleternatywne wypisanie punktow
		//context.font = '20px arial';
		//context.fillText(imie, 10, 30);
		//context.fillText("Punktacja:      " + punkty, 300, 30);	
	}	
	


function losowanieJedzenia(plansza)
{
// wylosowanie wspolrzednych dla jedzenia
var wspolrzedne = losowanieWspolrzednych();

// sprwadzenie czy wylosowana pozycja jedzenia nie naklada sie z cialem weza
while (plansza[wspolrzedne[0]][wspolrzedne[1]] === 1 || plansza[wspolrzedne[0]][wspolrzedne[1]] === 2) 
	wspolrzedne = losowanieWspolrzednych();
		
// wpisanie jedzenia do planszy
plansza[wspolrzedne[0]][wspolrzedne[1]] = 5; 
return plansza;	
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

this.stworz = function(plansza, init) 
{
	this.kierunek = 'p';
	this.punkty = 0;
	this.predkosc = 100;	
	this.waz = new Array(init);
	
	// wyloowanie pozycji dla glowy weza
	var wspolrzedne = losowanieWspolrzednych();
	
	// sprawdzenie czy wylosowana pozycja glowy pozwoli na zmieszczenie reszty czlonow weza
	while (((wspolrzedne[0] - this.waz.length) < 0) || ( plansza[wspolrzedne[0]][wspolrzedne[1]] == this.nr)
			|| ( plansza[wspolrzedne[0]][wspolrzedne[1]] ==5)) 
		wspolrzedne[0] = losowanieX();
	
	// wpisanie weza na plansze zaczynajac od glowy
	for (var i = 0; i < this.waz.length; i++)
	{
		this.waz[i] = { x: wspolrzedne[0] - i, y: wspolrzedne[1] };
		//console.log(this.waz[0].x);
		plansza[wspolrzedne[0] - i][wspolrzedne[1]] = this.nr;
	}	 
	return plansza;
}

this.rysuj = function(plansza) 
{			
	// przejscie po kazdym elemencie weza, zaczynam od jego ostatniego czlonu
	for (var i = this.waz.length - 1; i >= 0; i--) 
	{			
		// przesuwam glowe weza zgodnie z jego kierunkiem poruszania sie
		if (i === 0) {
			switch(this.kierunek) {
				case 'p': // Right
					this.waz[0] = { x: this.waz[0].x + 1, y: this.waz[0].y }
					break;
				case 'l': // Left
					this.waz[0] = { x: this.waz[0].x - 1, y: this.waz[0].y }
					break;
				case 'g': // Up
					this.waz[0] = { x: this.waz[0].x, y: this.waz[0].y - 1 }
					break;
				case 'd': // Down
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
				plansza = losowanieJedzenia(plansza); // wylosowanie nowego miejsca dla jedzenia	 
				// oraz dodaje nowy czlon weza
				this.waz.push({ x: this.waz[this.waz.length - 1].x, y: this.waz[this.waz.length - 1].y });
				plansza[this.waz[this.waz.length - 1].x][this.waz[this.waz.length - 1].y] = this.nr;	 
								
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
					
					
