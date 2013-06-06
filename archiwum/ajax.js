							$.ajax({
									type: "post",
								  url: 'http://localhost/logowanie.php',
								  data: "login:adam&haslo:mojehaslo",
									done: function(msg){
										// dodanie kodu weza do ciala strony
										var head= document.getElementsByTagName('head')[0];
										var script= document.createElement('script');
										script.type= 'text/javascript';
										script.src= 'http://localhost/js/waz.js';
										head.appendChild(script);
									}