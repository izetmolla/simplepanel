<?php
// Init
error_reporting(NULL);
ob_start();
session_start();
header('Content-Type: application/json');

include($_SERVER['DOCUMENT_ROOT']."/inc/main.php");

$backup = $_POST['system'];
$action = $_POST['action'];

switch ($action) {
    case 'delete': $cmd='v-delete-user-backup-exclusions';
        break;
    default: exit;
}

foreach ($backup as $value) {
    $value = escapeshellarg($value);
    exec (SFPANEL_CMD.$cmd." ".$user." ".$value, $output, $return_var);
}

$result = array(
    'error' => $_SESSION['error_msg'],
    'ok_msg' => $_SESSION['ok_msg']
  );
  
echo json_encode($result);
unset($_SESSION['error_msg']);
unset($_SESSION['ok_msg']);
