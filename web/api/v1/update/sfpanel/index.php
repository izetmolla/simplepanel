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

if ($_SESSION['user'] == 'admin') {
    if (!empty($_GET['pkg'])) {
        $v_pkg = escapeshellarg($_GET['pkg']);
        exec (SFPANEL_CMD."v-update-sys-sfpanel ".$v_pkg, $output, $return_var);
    }

    if ($return_var != 0) {
        $error = implode('<br>', $output);
        if (empty($error)) $error = 'Error: '.$v_pkg.' update failed';
            $_SESSION['error_msg'] = $error;
    }
    unset($output);
}

echo json_encode(array('error' => $_SESSION['error_msg']));
unset($_SESSION['error_msg']);
