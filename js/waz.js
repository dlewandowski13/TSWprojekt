// wyliczenie ilosc pol do gry w zaleznosci od rozdzieloczosc okna
// --->> "-1" zeby plansza gry nie wychodzila poza obszar ekranu bo trzeba zostawic miejsce na punktacje
var ilSzerokosc = parseInt(window.innerWidth / 20);
var ilWysokosc = parseInt(window.innerHeight / 20);	

// zmienne do okreslenia polozenia weza wzgledem gory i lewej strony ekranu
var wynikiX=0;
var wynikiY=0;

// tablica do przechowywania przeciwnikow
var gracze = new Array(10);
// ustawienie domyslnej wartosci dla pustego gracza
for(var i=0; i < gracze.length; i++)
	gracze[i] = 1;

// tworze obiekt canvas ze standardu HTML 5 do rysowania na nim gry
var canvas = document.createElement('canvas'),
context = canvas.getContext('2d');

var licznik = { kierunek: 'l', ilosc: 0 };

// stworzenie planszy o dwoch wymiarach 
var plansza = new Array(300);
for (var i = 0; i < plansza.length; i++)	
	plansza[i] = new Array(200);
		
// wymiary ramki do planszy
canvas.width = ilSzerokosc*20;				
canvas.height = ilWysokosc*20;	
	
// pobranie referencji do obiekty body ze strony HTML
// --->pobieram [0], zeby otrzymac jeden element, a nie cala liste,
// --->bo getElementsByTagName() zwraca zawsze liste
var body = document.getElementsByTagName('body')[0];	
// dodanie obiektu punktacji i planszy (canvas) do ciala strony		
body.appendChild(canvas);

// ustawienie widocznosci punktacji na domyslna
// --> dzieki temu wyswietli sie ramka z punktami
// --> bo w pliku html ustawilem tak: <div id="punktacja" style="display:none;"> przez co sie nie wystwiela przy ekranie logowania
document.getElementById("punktacja").style.display = "";

// pobranie loginu wprowadzonego do formularza
var login = document.getElementById('imie');
var imieGracza = login.value;
// stworzenie jeszcze prawie pustego obiektu gracza
var waz = new Waz(imieGracza);
waz.nr=1;

// nawiazanie polaczenia z serwerem
var socket = io.connect(document.location.hostname);

// wyslanie do serwera imienia gracza oraz jego poczatkowej wielkosci planszy
socket.emit("inicjalizacja", waz.imie, ilSzerokosc, ilWysokosc);

// zainicjowanie lokalnego gracza
socket.on('numerek', function (numerek, x, y) {	
	waz.nr = numerek;	
	waz.aktywnosc = true;	
	plansza = waz.stworz(plansza, 4, x, y); 
	rysowanie();
});

// odebranie z serwera informacji o polozeniu jedzenia
socket.on('jedzenie', function(wsp) {
	// wpisanie pozycji jedzenia na plansze
	plansza[wsp.x][wsp.y] = -1;	
	rysowanie();
});

// odebranie informacji o graczu zdalnym
socket.on('wezWeza', function (w) {
	console.log(w);
	gracze[w.nr] = new Waz("a");		
	gracze[w.nr].punkty = w.punkty;
	gracze[w.nr].imie = w.imie;
	gracze[w.nr].nr = w.nr;		
	gracze[w.nr].waz = w.waz;
	gracze[w.nr].kierunek = w.kierunek;		
	gracze[w.nr].aktywnosc = w.aktywnosc;
	gracze[w.nr].wpisz();
	rysowanie();
});

// dodanie punktu graczu zdalnemu
socket.on('dodajPunkt', function (nr) {			
	gracze[nr].punkty++;	
	gracze[nr].wydluz();
	rysowanie();
});				

// skracanie weza, na ktory wszedl inny waz
socket.on('skrocWeza', function (nr, tenCoZjadl) {	
	if(nr == waz.nr) 
	{	// jesli waz do skrocenia to lokalny gracz
		gracze[tenCoZjadl].punkty+=5;
		var ilosc = waz.waz.length/2;  // ilosc czlonow weza do skasowania
		for(var j=0; j<ilosc; j++)
		{
			plansza[waz.waz[waz.waz.length-1].x][waz.waz[waz.waz.length-1].y] = null; // oznaczenie pola planszy jako juz pustego
			waz.waz.pop(); // usuniecie ostatniego czlonu weza
		}
		if(waz.waz.length < 2) 
		{	// jesli dany waz ma mniej niz 2 czesci to przegral
			waz.aktywnosc = false;
			waz.skasuj();
			przegrana(waz.imie);
			socket.emit("przegralem", waz.nr);
			console.log("ZOSTALEM ZJEDZONY");
			alert(waz.imie+" przegrales!");
			window.location.reload(true); 					
		}
	} else 
	{	// dla kazdego innego weza
		gracze[tenCoZjadl].punkty+=5;
		console.log("mialem skrocic weza nr "+nr);
		var ilosc = gracze[nr].waz.length/2;
		for(var j=0; j<ilosc; j++)
		{   
			plansza[gracze[nr].waz[gracze[nr].waz.length-1].x][gracze[nr].waz[gracze[nr].waz.length-1].y] = null; 
			gracze[nr].waz.pop(); 
		}
		if(gracze[nr].waz.length < 2) 
		{	// jesli dany waz ma mniej niz 2 czesci to przegral
			gracze[i].aktywnosc = false;
			gracze[nr].skasuj();
			przegrana(gracze[nr].imie);
		}
	}
	rysowanie();
});		

// serwer pyta o odlaczenie szukaja gracza, ktory sie rozlaczyl
socket.on('odlaczenie', function () {			
	// kazdy gracz odpowiada swoim numerem, potwierdzajac, ze on gra dalej
	socket.emit("przekazNr", waz.nr);	
});

// serwer przekazuje numer weza, ktory przestal grac
socket.on('zatrzymajWeza', function (nr) {			
	gracze[nr].aktywnosc = false;		
	// skasowanie z ekranu weza, ktory rozlozyl sie z serwerem
	// -->>> mozna te ponizsze linijki skasowac i bedzie zostawiac weza po tym jak wylaczy przegladarke
	gracze[nr].skasuj();
	rysowanie();
});

// serwer przekazuje numer weza, ktory przestal grac
socket.on('przegral', function (nr) {			
	gracze[nr].aktywnosc = false;		
	// --> ponizej pokazuje jak przegral inny gracz niz my okienko, ale przez to zeby po kliknieciu ok grac dalej, trzeba myszka
	// --> kliknac na ekran planszy, zeby byl aktywny i dopiero wtedy znowu strzalki sa aktywne, dlatego wylaczylem jak cos to tutaj to mozna zmienic
	//alert("Gracz " + gracze[nr].imie + " przegral! ");
	gracze[nr].skasuj();
	rysowanie();
});

// odebranie z serwera ruchu przeciwnika i poruszenie go na lokalnej planszy
socket.on('zmien', function (w) {			
	gracze[w.nr].kierunek = w.kierunek;		
	gracze[w.nr].rysuj();
	rysowanie();
});

// nasluchiwanie wcisniecia przyciskow strzalek do sterowania wezem
window.addEventListener('keydown', function(event) {
	if(waz.aktywnosc == true)
	{
		if (event.keyCode === 38 && waz.kierunek !== 'd') {
			if(licznik.ilosc==5 || licznik.kierunek !=event.keyCode ) 
			{
				licznik.ilosc=0;
				licznik.kierunek=event.keyCode; // przypisanie aktualnego kierunku
				waz.kierunek = 'g';
				socket.emit("ruch", {kierunek: 'g', nr: waz.nr});
				waz.rysuj();
				rysowanie();
			}
			licznik.ilosc++;		
		} else if (event.keyCode === 40 && waz.kierunek !== 'g') {
			if(licznik.ilosc==5 || licznik.kierunek !=event.keyCode )
			{
				licznik.ilosc=0;	
				licznik.kierunek=event.keyCode;
				waz.kierunek = 'd';
				waz.rysuj();
				socket.emit("ruch", {kierunek: 'd', nr: waz.nr});
				rysowanie();
			}
			licznik.ilosc++;
		} else if (event.keyCode === 39 && waz.kierunek !== 'l') {
			if(licznik.ilosc==5 || licznik.kierunek !=event.keyCode)
			{
				licznik.ilosc=0;
				licznik.kierunek=event.keyCode;
				waz.kierunek = 'p';
				waz.rysuj();
				socket.emit("ruch", {kierunek: 'p', nr: waz.nr});		
				rysowanie();
			}
			licznik.ilosc++;
		} else if (event.keyCode === 37 && waz.kierunek !== 'p') {
			if(licznik.ilosc==5 || licznik.kierunek !=event.keyCode)
			{
				licznik.ilosc=0;
				licznik.kierunek=event.keyCode;
				waz.kierunek = 'l';
				waz.rysuj();
				socket.emit("ruch", {kierunek: 'l', nr: waz.nr});
				rysowanie();
			}
			licznik.ilosc++;
		}
	}
});		

// rysowanie kolejnych elementow gry
function rysowanie()
{
	if(waz.aktywnosc == true) // --> tylko jesli gracz lokalny zyje to na planszy zachodza zmiany
	{
		context.clearRect(0, 0, canvas.width, canvas.height); // wyczyszczenie planszy	
				
		// narysowanie ramki i wypisanie punktacji
		rysujRamke(); 
		
		// narysowanie wezy i jedzenia
		for (var x = 0; x < canvas.width/20; x++) {
			for (var y = 0; y < canvas.height/20; y++) {
				if (plansza[x][y] === -1) {
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
				} else if (plansza[x][y] == 4){
					context.fillStyle = 'DarkRed';
					context.fillRect(x * 20, y * 20, 20, 20);  							
				} else if (plansza[x][y] == 5){
					context.fillStyle = 'Indigo';
					context.fillRect(x * 20, y * 20, 20, 20);  							
				} else if (plansza[x][y] >= 6){
					context.fillStyle = 'RoyalBlue';
					context.fillRect(x * 20, y * 20, 20, 20);  							
				}
			}
		}
	}      
}

function rysujRamke() 
{		
	context.fillStyle = 'black';
	// narysowanie gornej lini 
	// -->> chociaz tak naprawde to prostokat o ponizszych wspolrzednych);
	context.fillRect(20,20, canvas.width, 3);
	context.fillRect(20,20, 3, canvas.height);
	// uaktualnienie ilosc punktow gracza
	var tekst = waz.imie + " zdobyl " + waz.punkty + " punkty/ow.  ";
	
	// stworzenie napisu ze statystykami graczy
	for(var i = 0; i < gracze.length; i++)
	{
		if(gracze[i] !=1 && gracze[i].aktywnosc == true) tekst += "    " + gracze[i].imie + " zdobyl " + gracze[i].punkty + " punkty/ow.   ";
	}
	// wyswietlenie wyniku na divie z html'a
	var string = "<h3>Wezyk Online Multiplayer</h3></br>";
	document.getElementById("punktacja").innerHTML = string+tekst;	
}	

function przegrana(imie)
{
	context.clearRect(0, 0, canvas.width, canvas.height); // wyczyszczenie ekranu gry
	context.fillStyle = 'red';
	context.font = '20px arial';		
	context.fillText(imie+ ' przegral !', 200  , 200);
}

// klasa weza
function Waz(imie)
{
	this.imie = imie;
	this.nr;
	this.waz;
	this.aktywnosc;
	this.punkty;

	this.wpisz = function()
	{
		// wpisanie weza na plansze zaczynajac od glowy
		for (var i = 0; i < this.waz.length; i++)
		{
			plansza[this.waz[i].x][this.waz[i].y] = this.nr;
		}		
	}
	
	// skasowanie weza z planszy
	this.skasuj = function()
	{		
		for (var i = 0; i < this.waz.length; i++)
		{
			plansza[this.waz[i].x][this.waz[i].y] = null;
		}		
	}	
	
	this.stworz = function(plansza, init, x, y) 
	{
		this.kierunek = 'p';
		this.punkty = 0;
		this.aktywnosc = true;
		this.waz = new Array(init);
		var wspolrzedne = [2];
		wspolrzedne[0]=x;
		wspolrzedne[1]=y;
				
		// wpisanie weza na plansze zaczynajac od glowy
		for (var i = 0; i < this.waz.length; i++)
		{
			this.waz[i] = { x: wspolrzedne[0] - i, y: wspolrzedne[1] };
			console.log(wspolrzedne[0]+ " "+ wspolrzedne[1]);
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
	
	this.rysuj = function() 
	{			
		// przejscie po kazdym elemencie weza, zaczynam od jego ostatniego czlonu
		for (var i = this.waz.length - 1; i >= 0; i--) 
		{			
			// przesuwam glowe weza zgodnie z jego kierunkiem poruszania sie
			if (i === 0) {
				switch(this.kierunek) {
					case 'p': // prawo
						this.waz[0] = { x: this.waz[0].x + 1, y: this.waz[0].y }
						if(this.nr === waz.nr) 
						{
							canvas.width+=20;
							window.scrollBy(20,0);
							if(ilSzerokosc-10 < (this.waz[0].x *20)) wynikiX+=20;
						}
						break;
					case 'l': // lewo
						this.waz[0] = { x: this.waz[0].x - 1, y: this.waz[0].y }
						if(this.nr === waz.nr) 
						{			
							//canvas.width-=20;
							window.scrollBy(-20,0);
							if(wynikiX>0) wynikiX-=20;
						}
						break;
					case 'g': // gora
						this.waz[0] = { x: this.waz[0].x, y: this.waz[0].y - 1 }
						if(this.nr === waz.nr) 
						{	
							//canvas.height-=20;
							window.scrollBy(0,-20);
							if(wynikiY > 0) wynikiY-=20;
						}
						break;
					case 'd': // dol
						this.waz[0] = { x: this.waz[0].x, y: this.waz[0].y + 1 }
						if(this.nr === waz.nr) 
						{	
							canvas.height+=20;
							window.scrollBy(0,20);	
							if(ilWysokosc-10 < (this.waz[0].y *20)) wynikiY+=20;
						}
						break;
				}	
				
				// jesli rysujemy weza lokalnego to sprawdzamy
				if(this.nr == waz.nr)
				{
					// sprawdzenie czy nie wyszlismy poza lewy gorny rog
					if (this.waz[0].x <= 0 || this.waz[0].y <= 0)
					{
						this.aktywnosc = false;
						przegrana(this.imie);	
						this.skasuj();
						socket.emit("przegralem", this.nr);
						alert("Przegrales !");
						window.location.reload(true);
					} else	// jesli waz wszedl na jedzenie to zwiekszam il. punktow
					if (plansza[this.waz[0].x][this.waz[0].y] === -1) 
					{
						this.punkty += 1;
						socket.emit("zjadlemJablko", this.nr);					
						// oraz dodaje nowy czlon weza							
						this.wydluz();							
						// wpisanie glowy weza na miejsce zjedzonego jablka
						//plansza[this.waz[0].x][this.waz[0].y] = this.nr;
						
					// sprawdzenie czy waz nie uderzyl sam w siebie
					} else if (plansza[this.waz[0].x][this.waz[0].y] === this.nr)
					{		
						this.aktywnosc = false;
						przegrana(this.imie);							
						socket.emit("przegralem", this.nr);
						alert("Przegrales, bo wszedles sam na siebie");
						window.location.reload(true);						
					} 
				
					// sprawdzenie czy nie uderzylismy w innego gracza
					for(var k=0; k< gracze.length; k++)
					{
						if((plansza[waz.waz[0].x][waz.waz[0].y] === k) && (k !=this.nr) && (gracze[k].aktywnosc == true))
						{
							this.punkty +=5;
							socket.emit("zjadlemWeza", k, this.nr);		
							var ilosc = gracze[k].waz.length/2;
							for(var j=0; j<ilosc; j++)
							{
								plansza[gracze[k].waz[gracze[k].waz.length-1].x][gracze[k].waz[gracze[k].waz.length-1].y] = null;
								gracze[k].waz.pop();
							}									
						}							
					}

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
		
	}
}			
					
					
