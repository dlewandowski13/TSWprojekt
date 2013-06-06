<?php 
header('Access-Control-Allow-Origin: *'); // umozliwia laczenie z kazdej domeny
$db_name="wezyk"; // nazwa bazy danych
$tbl_name="gracze"; // nazwa tabeli z bazy danych
//echo "test";
$link = mysql_connect('localhost','root',''); 
if (!$link) { 
	die('Blad polaczenia z MySQL: ' . mysql_error()); 
} 
mysql_select_db("$db_name", $link);
//echo 'Polaczenie OK'; 

// wyciagniecie z zadania post pol wpisanych do formularza rejestracji
$login=mysql_real_escape_string($_POST['login']);
$email=mysql_real_escape_string($_POST['email']);
$haslo=mysql_real_escape_string($_POST['haslo']);
$hash = md5($haslo); 

$qry=mysql_query("INSERT INTO $db_name.$tbl_name (`login`, `haslo`, `email`) VALUES('$login','$haslo','$email')");

if(!$qry)
{
    die("Blad: ". mysql_error());
}
else
{
    echo true;
}

mysql_close($link); 

?> 
