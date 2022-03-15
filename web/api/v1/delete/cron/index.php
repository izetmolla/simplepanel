
<?php
// Init
error_reporting(NULL);
ob_start();
session_start();
header('Content-Type: application/json');
include($_SERVER['DOCUMENT_ROOT']."/inc/main.php");

if (($_SESSION['user'] == 'admin') && (!empty($_GET['user']))) {
    $user=$_GET['user'];
}

// Check token
if ((!isset($_GET['token'])) || ($_SESSION['token'] != $_GET['token'])) {
    exit();
}

if (!empty($_GET['job'])) {
    $v_username = escapeshellarg($user);
    $v_job = escapeshellarg($_GET['job']);
    exec (SFPANEL_CMD."v-delete-cron-job ".$v_username." ".$v_job, $output, $return_var);
}
check_return_code($return_var,$output);
unset($output);

$result = array(
    'error' => $_SESSION['error_msg'],
    'ok_msg' => $_SESSION['ok_msg']
  );
  
echo json_encode($result);
unset($_SESSION['error_msg']);
unset($_SESSION['ok_msg']);
