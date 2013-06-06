			$(function() {  
				  $(".logowanie").click(function() {  
					// validate and process form here  
					// setup some local variables
					var $form = $currentForm;
					// let's select and cache all the fields
					var $inputs = $form.find("input, select, button, textarea");
					// serialize the data in the form
					var serializedData = $form.serialize();

					// let's disable the inputs for the duration of the ajax request
					$inputs.prop("disabled", true);
					
					
					$logowanie = $form_wrapper.find('.button');
					var name = $("Zaloguj#login").val();  
				//	console.log($logowanie);
					// fire off the request to /form.php
					var request = $.ajax({
						url: "http://localhost/logowanie.php",
						type: "post",
						data: serializedData  //{ login: "2adam", haslo: "mojehaslo" }
					});

					// callback handler that will be called on success
					request.done(function (response, textStatus, jqXHR){
						// log a message to the console
						if(response != "Blad") 
						{
							// schowanie fomularzy								
							$(".wrapper").hide();
							var head= document.getElementsByTagName('head')[0];
							var script= document.createElement('script');
							script.type= 'text/javascript';
							script.src= 'http://localhost/js/waz.js';
							head.appendChild(script);

						} else alert ("Wprowadziles bledny login i/lub haslo");
						console.log(response);
					});

					// callback handler that will be called on failure
					request.fail(function (jqXHR, textStatus, errorThrown){
						// log the error to the console
						console.error(
							"The following error occured: "+
							textStatus, errorThrown
						);
					});

					// callback handler that will be called regardless
					// if the request failed or succeeded
					request.always(function () {
						// reenable the inputs
						$inputs.prop("disabled", false);
					});	
				  });  
				}); 

				// po kliknieciu rejestracji
				$(function() {  
				  $(".rejestracja").click(function() {  
					// validate and process form here  
					// setup some local variables
					var $form = $currentForm;
					// let's select and cache all the fields
					var $inputs = $form.find("input, select, button, textarea");
					// serialize the data in the form
					var serializedData = $form.serialize();

					// let's disable the inputs for the duration of the ajax request
					$inputs.prop("disabled", true);
					
					
					$logowanie = $form_wrapper.find('.button');
					var name = $("Zaloguj#login").val();  
				//	console.log($logowanie);
					// fire off the request to /form.php
					var request = $.ajax({
						url: "http://localhost/logowanie.php",
						type: "post",
						data: serializedData  //{ login: "2adam", haslo: "mojehaslo" }
					});

					// callback handler that will be called on success
					request.done(function (response, textStatus, jqXHR){
						// log a message to the console
						if(response != "Blad") 
						{
							// schowanie fomularzy								
							$(".wrapper").hide();
							var head= document.getElementsByTagName('head')[0];
							var script= document.createElement('script');
							script.type= 'text/javascript';
							script.src= 'http://localhost/js/waz.js';
							head.appendChild(script);

						} else alert ("Wprowadziles bledny login i/lub haslo");
						console.log(response);
					});

					// callback handler that will be called on failure
					request.fail(function (jqXHR, textStatus, errorThrown){
						// log the error to the console
						console.error(
							"The following error occured: "+
							textStatus, errorThrown
						);
					});

					// callback handler that will be called regardless
					// if the request failed or succeeded
					request.always(function () {
						// reenable the inputs
						$inputs.prop("disabled", false);
					});
	
				  });  
				}); 	