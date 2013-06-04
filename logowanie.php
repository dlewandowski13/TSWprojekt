<?php 
header('Access-Control-Allow-Origin: *');
$db_name="wezyk"; // nazwa bazy danych
$tbl_name="gracze"; // nazwa tabeli z bazy danych
//echo "test";
$link = mysql_connect('localhost','root',''); 
if (!$link) { 
	die('Blad polaczenia z MySQL: ' . mysql_error()); 
} 
mysql_select_db("$db_name");
//echo 'Connection OK'; 
$login=mysql_real_escape_string($_POST['login']);
$haslo=mysql_real_escape_string($_POST['haslo']);

$zapytanie="SELECT * FROM $tbl_name WHERE login='$login' and haslo='$haslo'";
$doesFieldExist = false;
$result=mysql_query($zapytanie);
if ($result && mysql_num_rows($result) > 0) {
    $doesFieldExist = true;
	session_register("login");
	session_register("haslo");
	//header("location:index.html");
	echo "ok";
} else {
  echo "Blad";
  return false;
}

mysql_close($link); 

?> 