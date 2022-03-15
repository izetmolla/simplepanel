<?php
error_reporting(NULL);
$TAB = 'USER';
header("Content-Type: application/json");

// Main include
include($_SERVER['DOCUMENT_ROOT']."/inc/main.php");

// Data
if ($user == 'admin') {
    exec (SFPANEL_CMD . "v-list-users json", $output, $return_var);
} else {
    exec (SFPANEL_CMD . "v-list-user ".$user." json", $output, $return_var);
}
$data = json_decode(implode('', $output), true);
$data = array_reverse($data,true);
// Render page
top_panel(empty($_SESSION['look']) ? $_SESSION['user'] : $_SESSION['look'], $TAB);
// render_page($user, $TAB, 'list_user');

$_SESSION['back'] = $_SERVER['REQUEST_URI'];

foreach ($data as $key => $value) {
  ++$i;
  if ( $i == 1) {
    $total_amount = __('1 account');
  } else {
    $total_amount = __('%s accounts', $i);
  }

  $data[$key]['U_BANDWIDTH_PERCENT'] = get_percentage($data[$key]['U_BANDWIDTH'],$data[$key]['BANDWIDTH']);
  $data[$key]['U_DISK_PERCENT'] = get_percentage($data[$key]['U_DISK'],$data[$key]['DISK_QUOTA']);

  $data[$key]['U_BANDWIDTH_MEASURE'] = humanize_usage_measure($data[$key]['U_BANDWIDTH']);
  $data[$key]['U_BANDWIDTH'] = humanize_usage_size($data[$key]['U_BANDWIDTH']);

  $data[$key]['U_DISK_MEASURE'] = humanize_usage_measure($data[$key]['U_DISK']);
  $data[$key]['U_DISK'] = humanize_usage_size($data[$key]['U_DISK']);

  $data[$key]['U_DISK_WEB_MEASURE'] = humanize_usage_measure($data[$key]['U_DISK_WEB']);
  $data[$key]['U_DISK_WEB'] = humanize_usage_size($data[$key]['U_DISK_WEB']);

  $data[$key]['U_DISK_DB_MEASURE'] = humanize_usage_measure($data[$key]['U_DISK_DB']);
  $data[$key]['U_DISK_DB'] = humanize_usage_size($data[$key]['U_DISK_DB']);

  $data[$key]['U_DISK_MAIL_MEASURE'] = humanize_usage_measure($data[$key]['U_DISK_MAIL']);
  $data[$key]['U_DISK_MAIL'] = humanize_usage_size($data[$key]['U_DISK_MAIL']);

  $data[$key]['U_DISK_DIRS_MEASURE'] = humanize_usage_measure($data[$key]['U_DISK_DIRS']);
  $data[$key]['U_DISK_DIRS'] = humanize_usage_size($data[$key]['U_DISK_DIRS']);
  
  if ($data[$key]['SUSPENDED'] == 'yes') {
    $spnd_action = 'unsuspend' ;
    $spnd_confirmation = 'UNSUSPEND_USER_CONFIRMATION';
    $data[$key]['spnd_action'] = __($spnd_action);
    $data[$key]['spnd_conf'] = __($spnd_confirmation, $key);
  } else {
    $spnd_action = 'suspend' ;
    $spnd_confirmation = 'SUSPEND_USER_CONFIRMATION';
    $data[$key]['spnd_action'] = __($spnd_action);
    $data[$key]['spnd_conf'] = __($spnd_confirmation, $key);
  }

  $data[$key]['isChecked'] = false;
  $data[$key]['delete_conf'] = __('DELETE_USER_CONFIRMATION', $key);
}

$result = array(
  'data' => $data,
  'user' => $user,
  'panel' => $panel,
  'token' => $_SESSION['token'],
  'totalAmount' => $total_amount,
  'userFav' => $_SESSION['favourites']['USER'],
);

echo json_encode($result);
