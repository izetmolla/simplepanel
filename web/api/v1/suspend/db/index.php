<?php
// Init
error_reporting(NULL);
ob_start();
session_start();
header('Content-Type: application/json');
include($_SERVER['DOCUMENT_ROOT']."/inc/main.php");

// Check token
if ((!isset($_GET['token'])) || ($_SESSION['token'] != $_GET['token'])) {
    exit();
}

// Check user
if ($_SESSION['user'] != 'admin') {
    exit;
}

if (!empty($_GET['user'])) {
    $user=$_GET['user'];
}

if (!empty($_GET['database'])) {
    $v_username = escapeshellarg($user);
    $v_database = escapeshellarg($_GET['database']);
    exec (SFPANEL_CMD."v-suspend-database ".$v_username." ".$v_database, $output, $return_var);
}
check_return_code($return_var,$output);
unset($output);

echo json_encode(array('error' => $_SESSION['error_msg']));
unset($_SESSION['error_msg']);
