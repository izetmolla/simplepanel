<?php
// Init
error_reporting(NULL);
ob_start();
session_start();
header('Content-Type: application/json');
include($_SERVER['DOCUMENT_ROOT']."/inc/main.php");

// Delete as someone else?
if (($_SESSION['user'] == 'admin') && (!empty($_GET['user']))) {
    $user=$_GET['user'];
}

// Check token
if ((!isset($_GET['token'])) || ($_SESSION['token'] != $_GET['token'])) {
    exit();
}

// DNS domain
if ((!empty($_GET['domain'])) && (empty($_GET['record_id'])))  {
    $v_username = escapeshellarg($user);
    $v_domain = escapeshellarg($_GET['domain']);
    exec (SFPANEL_CMD."v-delete-dns-domain ".$v_username." ".$v_domain, $output, $return_var);
    check_return_code($return_var,$output);
    unset($output);
}

// DNS record
if ((!empty($_GET['domain'])) && (!empty($_GET['record_id'])))  {
    $v_username = escapeshellarg($user);
    $v_domain = escapeshellarg($_GET['domain']);
    $v_record_id = escapeshellarg($_GET['record_id']);
    exec (SFPANEL_CMD."v-delete-dns-record ".$v_username." ".$v_domain." ".$v_record_id, $output, $return_var);
    check_return_code($return_var,$output);
    unset($output);
}

$result = array(
    'error' => $_SESSION['error_msg'],
    'ok_msg' => $_SESSION['ok_msg']
  );
  
echo json_encode($result);
unset($_SESSION['error_msg']);
unset($_SESSION['ok_msg']);
