// Wezyk w JavaScript
// Autor: Dawid Lewandowski
 
// funkcja wykona sie po wczytaniu strony 
window.onload = function()
{
    // klasa weza
    function Waz(imie, nr)
    {
        this.imie = imie;
        this.nr = nr;
        this.waz;
         
        this.stworz = function(plansza, init) 
        {
            this.kierunek = 'p';
            this.punkty = 0;
            this.predkosc = 100;    
            this.waz = new Array(init);
             
            // wyloowanie pozycji dla glowy weza
            var wspolrzedne = losowanieWspolrzednych();
             
            // --> plansza[x][y] == 5 oznacza jedzenie, 1 lub 2 i kolejne to oznacza, ze waz sie tam znajduje
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
                // ---> roznica miedzy porownaniem ===, a == jest taka, ze === nie konwertuje typow
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
                    if (this.waz[0].x < 0 || this.waz[0].x >= ilSzerokosc ||  this.waz[0].y < 0 || this.waz[0].y >= ilWysokosc)
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
                        waz1.punkty+=5;
                        var ilosc = waz2.waz.length/2;
                        for(var i=0; i<ilosc; i++)
                        {
                            plansza[waz2.waz[waz2.waz.length-1].x][waz2.waz[waz2.waz.length-1].y] = null;
                            waz2.waz.pop();
                        }
                        break;                                      
                    } else if (plansza[this.waz[0].x][this.waz[0].y] === 1)
                    {               
                        // wygral dawid
                        waz2.punkty+=5;
                        var ilosc = waz1.waz.length/2;
                        for(var i=0; i<ilosc; i++)
                        {
                            plansza[waz1.waz[waz1.waz.length-1].x][waz1.waz[waz1.waz.length-1].y] = null;
                            waz1.waz.pop();
                        }
                        break;              
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
     
    // tworze obiekt canvas ze standardu HTML 5 do rysowania na nim gry
    var canvas = document.createElement('canvas'),
        context = canvas.getContext('2d'),
        ilWezy = 0,
        predkosc = 100,
        gra = false; // czy gra jest aktywna    
     
    // wyliczenie ilosc pol do gry w zaleznosci od rozdzieloczosc okna
    // --->> "-1" zeby plansza gry nie wychodzila poza obszar ekranu
    var ilSzerokosc = parseInt(window.innerWidth / 20) - 1;
    var ilWysokosc = parseInt(window.innerHeight / 20) - 2 ;    
             
    // wymiary ramki do planszy
    canvas.width = ilSzerokosc*20;              
    canvas.height = ilWysokosc*20;
     
    // stworzenie planszy o dwoch wymiarach 
    var plansza = new Array(ilSzerokosc);
    for (var i = 0; i < plansza.length; i++) 
        plansza[i] = new Array(ilWysokosc);
     
     
    // dodanie dwoch graczy lokalnych
    ilWezy++;
    var waz1 = new Waz("Adam", ilWezy);
    plansza = waz1.stworz(plansza, 8);  
    ilWezy++;
    var waz2 = new Waz("Dawid", ilWezy);
    plansza = waz2.stworz(plansza, 8); 
    gra = true;
     
    // wygenerowanie pozycji pierwszego punktu
    plansza = losowanieJedzenia(plansza);
     
    /* cos nie chce zadzialac
    // stworzenie zmiennej do przechowania stylow css
    var css = 'punktacja { font-size:30px;}';
    var style = document.createElement('style');
    style.type = 'text/css';
    if (style.styleSheet){
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    document.getElementsByTagName('head')[0].appendChild(style); */
         
    // pobranie referencji do obiekty body ze strony HTML
    // --->pobieram [0], zeby otrzymac jeden element, a nie cala liste,
    // --->bo getElementsBtTagName() zwraca zawsze liste
    var body = document.getElementsByTagName('body')[0];    
    var punktacja = document.createTextNode("Punkty: " + waz1.punkty);
    // dodanie obiektu punktacji i planszy (canvas) do ciala strony 
    body.appendChild(punktacja);    
    body.appendChild(canvas);
     
    // wywolanie f. odpowiedzialnej za rysowanie gry
    rysowanie(plansza);
     
    // nasluchiwanie wcisniecia przyciskow strzalek do sterowania wezem
    window.addEventListener('keydown', function(event) {
        if (event.keyCode === 38 && waz1.kierunek !== 'd') {
            waz1.kierunek = 'g'; // Up
        } else if (event.keyCode === 40 && waz1.kierunek !== 'g') {
            waz1.kierunek = 'd'; // Down
        } else if (event.keyCode === 39 && waz1.kierunek !== 'l') {
            waz1.kierunek = 'p'; // Right
        } else if (event.keyCode === 37 && waz1.kierunek !== 'p') {
            waz1.kierunek = 'l'; // Left
        } else if (event.keyCode === 87 && waz2.kierunek !== 'g') {
            waz2.kierunek = 'g'; // Up
        } else if (event.keyCode === 83 && waz2.kierunek !== 'g') {
            waz2.kierunek = 'd'; // Down
        } else if (event.keyCode === 68 && waz2.kierunek !== 'l') {
            waz2.kierunek = 'p'; // Right
        } else if (event.keyCode === 65 && waz2.kierunek !== 'p') {
            waz2.kierunek = 'l'; // Left
        }
    }); 
     
    // rysowanie kolejnych elementow gry
    function rysowanie()
    {
        context.clearRect(0, 0, canvas.width, canvas.height); // wyczyszczenie planszy
        rysujRamke(); // narysowanie ramki i wypisanie punktacji            
         
        plansza = waz1.rysuj(plansza);
        plansza = waz2.rysuj(plansza);
         
        // narysowanie wezy i jedzenia
        for (var x = 0; x < ilSzerokosc ; x++) {
            for (var y = 0; y < ilWysokosc; y++) {
                if (plansza[x][y] == 5) {
                    context.fillStyle = 'red';
                    context.fillRect(x * 20, y * 20, 20, 20);
                } else if (plansza[x][y] === 1) {
                    context.fillStyle = 'green';
                    context.fillRect(x * 20, y * 20, 20, 20);          
                } else if (plansza[x][y] === 2) {
                    context.fillStyle = 'blue';
                    context.fillRect(x * 20, y * 20, 20, 20);          
                }
            }
        }
         
        // wywolanie funkcji rysowania z opoznieniem w ms okreslonym zmienna prekosc
        if(gra) setTimeout(rysowanie, 200);        
    }
     
    function rysujRamke() 
    {       
        context.fillStyle = 'black'; // okresla kolor ramki
        context.lineWidth = 5; // okresla szerekosc ramki
        //narysowanie ramki planszy
        context.strokeRect(0, 0, canvas.width, canvas.height);
         
        // uaktualnienie ilosc punktow gracza
        var tekst = waz1.imie+ " zdobyl " + waz1.punkty + " punkty/ow.  "
                  + waz2.imie+ " zdobyl " + waz2.punkty + " punkty/ow";
        punktacja.nodeValue = tekst;
        punktacja.fontsize=20;  
        // --> aleternatywne wypisanie punktow
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
        return Math.round(Math.random() * (ilSzerokosc-1));
    }
 
    function losowanieWspolrzednych()
    {
        var tab = [];
        tab[0] = losowanieX();
        tab[1] = Math.round(Math.random() * ilWysokosc-3);
        return tab;
    }   
 
};
