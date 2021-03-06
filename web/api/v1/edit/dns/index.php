<?php
error_reporting(NULL);
ob_start();
$TAB = 'DNS';

header('Content-Type: application/json');

// Main include
include($_SERVER['DOCUMENT_ROOT']."/inc/main.php");

// Check domain name
if (empty($_GET['domain'])) {
    exit;
}

// Edit as someone else?
if (($_SESSION['user'] == 'admin') && (!empty($_GET['user']))) {
    $user=escapeshellarg($_GET['user']);
}

// List dns domain
if ((!empty($_GET['domain'])) && (empty($_GET['record_id'])))  {
    $v_domain = escapeshellarg($_GET['domain']);
    exec (SFPANEL_CMD."v-list-dns-domain ".$user." ".$v_domain." json", $output, $return_var);
    check_return_code($return_var,$output);
    $data = json_decode(implode('', $output), true);
    unset($output);

    // Parse dns domain
    $v_username = $user;
    $v_domain = $_GET['domain'];
    $v_ip = $data[$v_domain]['IP'];
    $v_template = $data[$v_domain]['TPL'];
    $v_ttl = $data[$v_domain]['TTL'];
    $v_exp = $data[$v_domain]['EXP'];
    $v_soa = $data[$v_domain]['SOA'];
    $v_date = $data[$v_domain]['DATE'];
    $v_time = $data[$v_domain]['TIME'];
    $v_suspended = $data[$v_domain]['SUSPENDED'];
    if ( $v_suspended == 'yes' ) {
        $v_status =  'suspended';
    } else {
        $v_status =  'active';
    }

    // List dns templates
    exec (SFPANEL_CMD."v-list-dns-templates json", $output, $return_var);
    $templates = json_decode(implode('', $output), true);
    unset($output);
}

// List dns record
if ((!empty($_GET['domain'])) && (!empty($_GET['record_id'])))  {
    $v_domain = escapeshellarg($_GET['domain']);
    $v_record_id = escapeshellarg($_GET['record_id']);
    exec (SFPANEL_CMD."v-list-dns-records ".$user." ".$v_domain." json", $output, $return_var);
    check_return_code($return_var,$output);
    $data = json_decode(implode('', $output), true);
    unset($output);

    // Parse dns record
    $v_username = $user;
    $v_domain = $_GET['domain'];
    $v_record_id = $_GET['record_id'];
    $v_rec = $data[$v_record_id]['RECORD'];
    $v_type = $data[$v_record_id]['TYPE'];
    $v_val = $data[$v_record_id]['VALUE'];
    $v_priority = $data[$v_record_id]['PRIORITY'];
    $v_suspended = $data[$v_record_id]['SUSPENDED'];
    if ( $v_suspended == 'yes' ) {
        $v_status =  'suspended';
    } else {
        $v_status =  'active';
    }
    $v_date = $data[$v_record_id]['DATE'];
    $v_time = $data[$v_record_id]['TIME'];
}

// Check POST request for dns domain
if ((!empty($_POST['save'])) && (!empty($_GET['domain'])) && (empty($_GET['record_id']))) {
    $v_domain = escapeshellarg($_POST['v_domain']);

    // Check token
    if ((!isset($_POST['token'])) || ($_SESSION['token'] != $_POST['token'])) {
        exit();
    }

    // Change domain IP
    if (($v_ip != $_POST['v_ip']) && (empty($_SESSION['error_msg']))) {
        $v_ip = escapeshellarg($_POST['v_ip']);
        exec (SFPANEL_CMD."v-change-dns-domain-ip ".$v_username." ".$v_domain." ".$v_ip." no", $output, $return_var);
        check_return_code($return_var,$output);
        $restart_dns = 'yes';
        unset($output);
    }

    // Change domain template
    if (($v_template != $_POST['v_template']) && (empty($_SESSION['error_msg']))) {
        $v_template = escapeshellarg($_POST['v_template']);
        exec (SFPANEL_CMD."v-change-dns-domain-tpl ".$v_username." ".$v_domain." ".$v_template." no", $output, $return_var);
        check_return_code($return_var,$output);
        unset($output);
        $restart_dns = 'yes';
    }

    // Change SOA record
    if (($v_soa != $_POST['v_soa']) && (empty($_SESSION['error_msg']))) {
        $v_soa = escapeshellarg($_POST['v_soa']);
        exec (SFPANEL_CMD."v-change-dns-domain-soa ".$v_username." ".$v_domain." ".$v_soa." no", $output, $return_var);
        check_return_code($return_var,$output);
        unset($output);
        $restart_dns = 'yes';
    }

    // Change expiriation date
    if (($v_exp != $_POST['v_exp']) && (empty($_SESSION['error_msg']))) {
        $v_exp = escapeshellarg($_POST['v_exp']);
        exec (SFPANEL_CMD."v-change-dns-domain-exp ".$v_username." ".$v_domain." ".$v_exp." no", $output, $return_var);
        check_return_code($return_var,$output);
        unset($output);
    }

    // Change domain ttl
    if (($v_ttl != $_POST['v_ttl']) && (empty($_SESSION['error_msg']))) {
        $v_ttl = escapeshellarg($_POST['v_ttl']);
        exec (SFPANEL_CMD."v-change-dns-domain-ttl ".$v_username." ".$v_domain." ".$v_ttl." no", $output, $return_var);
        check_return_code($return_var,$output);
        unset($output);
        $restart_dns = 'yes';
    }

    // Restart dns server
    if (!empty($restart_dns) && (empty($_SESSION['error_msg']))) {
        exec (SFPANEL_CMD."v-restart-dns", $output, $return_var);
        check_return_code($return_var,$output);
        unset($output);
    }

    // Set success message
    if (empty($_SESSION['error_msg'])) {
        $_SESSION['ok_msg'] = __('Changes has been saved.');
    }
}

// Check POST request for dns record
if ((!empty($_POST['save'])) && (!empty($_GET['domain'])) && (!empty($_GET['record_id']))) {

    // Check token
    if ((!isset($_POST['token'])) || ($_SESSION['token'] != $_POST['token'])) {
        exit();
    }

    // Protect input
    $v_domain = escapeshellarg($_POST['v_domain']);
    $v_record_id = escapeshellarg($_POST['v_record_id']);

    // Change dns record
    if (($v_val != $_POST['v_val']) || ($v_priority != $_POST['v_priority']) && (empty($_SESSION['error_msg']))) {
        $v_val = escapeshellarg($_POST['v_val']);
        $v_priority = escapeshellarg($_POST['v_priority']);
        exec (SFPANEL_CMD."v-change-dns-record ".$v_username." ".$v_domain." ".$v_record_id." ".$v_val." ".$v_priority, $output, $return_var);
        check_return_code($return_var,$output);
        $v_val = $_POST['v_val'];
        unset($output);
        $restart_dns = 'yes';
    }

    // Change dns record id
    if (($_GET['record_id'] != $_POST['v_record_id']) && (empty($_SESSION['error_msg']))) {
        $v_old_record_id = escapeshellarg($_GET['record_id']);
        exec (SFPANEL_CMD."v-change-dns-record-id ".$v_username." ".$v_domain." ".$v_old_record_id." ".$v_record_id, $output, $return_var);
        check_return_code($return_var,$output);
        unset($output);
        $restart_dns = 'yes';
    }

    // Restart dns server
    if (!empty($restart_dns) && (empty($_SESSION['error_msg']))) {
        exec (SFPANEL_CMD."v-restart-dns", $output, $return_var);
        check_return_code($return_var,$output);
        unset($output);
    }

    // Set success message
    if (empty($_SESSION['error_msg'])) {
        $_SESSION['ok_msg'] = __('Changes has been saved.');
    }

    // Change url if record id was changed
    if ((empty($_SESSION['error_msg'])) && ($_GET['record_id'] != $_POST['v_record_id'])) {
        header("Location: /edit/dns/?domain=".$_GET['domain']."&record_id=".$_POST['v_record_id']);
        exit;
    }
}

$result = array(
	'username' => $user,
	'domain' => $v_domain,
    'domain' => $_GET['domain'],
    'ip' => $data[$v_domain]['IP'],
    'record_id' => $v_record_id,
    'rec' => $v_rec,
    'type' => $v_type,
    'val' => $v_val,
    'priority' => $v_priority,
    'template' => $data[$v_domain]['TPL'],
    'ttl' => $data[$v_domain]['TTL'],
    'exp' => $data[$v_domain]['EXP'],
    'soa' => $data[$v_domain]['SOA'],
    'date' => $v_date,
    'time' => $v_time,
    'suspended' => $v_suspended,
    'error_msg' => $_SESSION['error_msg'],
    'ok_msg' => $_SESSION['ok_msg'],
    'status' => $v_status,
    'dns_system' => $_SESSION['DNS_SYSTEM'],
    'YYYY-MM-DD' => __('YYYY-MM-DD'),
    'templates' => $templates
);

echo json_encode($result);

// Flush session messages
unset($_SESSION['error_msg']);
unset($_SESSION['ok_msg']);
