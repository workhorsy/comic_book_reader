<?php

// Copyright (c) 2015 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under AGPL v3 or later
// http://github.com/workhorsy/comic_book_reader

header("Access-Control-Allow-Origin: *");

// Make sure it is a HTTP Get request
if ($_SERVER['REQUEST_METHOD'] !== "GET") {
    header("HTTP/1.1 405 Method Not Allowed");
    return;
}

// Make sure the ID is a number, if it exists
$id = null;
if (array_key_exists("id", $_GET)) {
    if (! is_numeric($_GET["id"])) {
        header("HTTP/1.1 406 Not Acceptable");
        return;
    }
    $id = intval($_GET["id"]);
}

// Get all the parameters
$file_name = "user_count.txt";
$now = time();
$cut_off_time = $now - (60 * 10); // 10 minutes ago

// Read the db from file
$db = array();
if (file_exists($file_name)) {
    $fd = fopen($file_name, "r");
    $string_db = fread($fd, filesize($file_name));
    $db = unserialize($string_db);
    //print_r($db);
    fclose($fd);
}

// Save this user's time
if ($id !== null) {
    $db[$id] = $now;
}

// Remove users that have not visited in 10 minutes
foreach ($db as $db_id => $db_time) {
//    echo "<p>" . $db_id . ":" . $db_time . ", " . ($db_time - $cut_off_time) . "</p>";
    if ($db_time < $cut_off_time) {
        unset($db[$db_id]);
    }
}

// Print everything
/*
echo "<p>now: " . $now . "</p>";
echo "<p>id: " . $id . "</p>";
echo "<p>user db: ";
print_r($db);
echo "</p>";
*/
// Write the db to file
$string_db = serialize($db);
$fd = fopen($file_name, "w");
fwrite($fd, $string_db);
fclose($fd);

header('Content-Type: application/json');
echo(count($db));
?>
