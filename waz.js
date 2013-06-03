// klasa weza
function Waz(imie)
{
	this.imie = imie;
	this.nr;
	this.waz;
	
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
					przegrana(this.imie);
					return;					
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