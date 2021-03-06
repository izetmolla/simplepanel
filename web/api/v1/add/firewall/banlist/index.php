<?php
error_reporting(NULL);
ob_start();
$TAB = 'FIREWALL';

header('Content-Type: application/json');

// Main include
include($_SERVER['DOCUMENT_ROOT']."/inc/main.php");

// Check user
if ($_SESSION['user'] != 'admin') {
    header("Location: /list/user");
    exit;
}

// Check POST request
if (!empty($_POST['ok'])) {

    // Check token
    if ((!isset($_POST['token'])) || ($_SESSION['token'] != $_POST['token'])) {
        exit();
    }

    // Check empty fields
    if (empty($_POST['v_chain'])) $errors[] = __('banlist');
    if (empty($_POST['v_ip'])) $errors[] = __('ip address');
    if (!empty($errors[0])) {
        foreach ($errors as $i => $error) {
            if ( $i == 0 ) {
                $error_msg = $error;
            } else {
                $error_msg = $error_msg.", ".$error;
            }
        }
        $_SESSION['error_msg'] = __('Field "%s" can not be blank.',$error_msg);
    }

    // Protect input
    $v_chain = escapeshellarg($_POST['v_chain']);
    $v_ip = escapeshellarg($_POST['v_ip']);

    // Add firewall ban
    if (empty($_SESSION['error_msg'])) {
        exec (SFPANEL_CMD."v-add-firewall-ban ".$v_ip." ".$v_chain, $output, $return_var);
        check_return_code($return_var,$output);
        unset($output);
    }

    // Flush field values on success
    if (empty($_SESSION['error_msg'])) {
        $_SESSION['ok_msg'] = __('BANLIST_CREATED_OK');
        unset($v_ip);
    }
}

$result = array(
    'ip' => $v_ip,
    'chain' => $v_chain,
    'error_msg' => $_SESSION['error_msg'],
    'ok_msg' => $_SESSION['ok_msg']
);

echo json_encode($result);

// Flush session messages
unset($_SESSION['error_msg']);
unset($_SESSION['ok_msg']);
