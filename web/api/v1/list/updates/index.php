<?php
error_reporting(NULL);
$TAB = 'UPDATES';

// Main include
include($_SERVER['DOCUMENT_ROOT']."/inc/main.php");
top_panel(empty($_SESSION['look']) ? $_SESSION['user'] : $_SESSION['look'], $TAB);
header('Content-Type: application/json');

// Check user
if ($_SESSION['user'] != 'admin') {
    header('Location: /list/user');
    exit;
}

// Data
exec (SFPANEL_CMD."v-list-sys-sfpanel-updates json", $output, $return_var);
$data = json_decode(implode('', $output), true);
unset($output);
exec (SFPANEL_CMD."v-list-sys-sfpanel-autoupdate plain", $output, $return_var);
$autoupdate = $output[0];
unset($output);

// Render page
// render_page($user, $TAB, 'list_updates');

// Back uri
$_SESSION['back'] = $_SERVER['REQUEST_URI'];

$object = (object)[];
$object->data = $data;
$object->user = $user;
$object->autoUpdate = $autoupdate;
$object->panel = $panel;

print json_encode($object);