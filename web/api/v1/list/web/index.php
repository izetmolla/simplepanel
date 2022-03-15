<?php
error_reporting(NULL);
$TAB = 'WEB';

header('Content-Type: application/json');

// Main include
include($_SERVER['DOCUMENT_ROOT']."/inc/main.php");

// Data
exec (SFPANEL_CMD."v-list-web-domains $user json", $output, $return_var);
$data = json_decode(implode('', $output), true);
$data = array_reverse($data,true);
$ips = json_decode(shell_exec(SFPANEL_CMD.'v-list-sys-ips json'), true);

// Render page
top_panel(empty($_SESSION['look']) ? $_SESSION['user'] : $_SESSION['look'], $TAB);
// render_page($user, $TAB, 'list_web');

// Back uri
$_SESSION['back'] = $_SERVER['REQUEST_URI'];

foreach ($data as $key => $value) {
  ++$i;

  $data[$key]['U_BANDWIDTH_PERCENT'] = get_percentage($data[$key]['U_BANDWIDTH'],$panel[$user]['BANDWIDTH']);
  $data[$key]['U_DISK_PERCENT'] = get_percentage($data[$key]['U_DISK'],$data[$key]['DISK_QUOTA']);

  if ($data[$key]['SUSPENDED'] == 'yes') {
    $data[$key]['status'] = 'suspended';
    $data[$key]['spnd_action'] = 'unsuspend' ;
    $data[$key]['spnd_confirmation'] = __('UNSUSPEND_DOMAIN_CONFIRMATION', $key);
  } else {
    $data[$key]['status'] = 'active';
    $data[$key]['spnd_action'] = 'suspend' ;
    $data[$key]['spnd_confirmation'] = __('SUSPEND_DOMAIN_CONFIRMATION', $key);
  }

  if (!empty($data[$key]['SSL_HOME'])) {
    if ($data[$key]['SSL_HOME'] == 'same') {
      $data[$key]['SSL_HOME'] = 'public_html';
    } else {
      $data[$key]['SSL_HOME'] = 'public_shtml';
    }
  } else {
    $data[$key]['SSL_HOME'] = '';
  }

  $ftp_user='no';
  if (!empty($data[$key]['FTP_USER'])) {
    $ftp_user=$data[$key]['FTP_USER'];
  }

  $data[$key]['FTP_USER'] = str_replace(':', ', ', $ftp_user);

  if (strlen($data[$key]['PROXY_EXT']) > 24 ) {
    $data[$key]['PROXY_EXT'] = str_replace(',', ', ', $data[$key]['PROXY_EXT']);
    $data[$key]['PROXY_EXT'] = substr($data[$key]['PROXY_EXT'], 0, 24);
    $data[$key]['PROXY_EXT'] = trim($proxy_ext, ",");
    $data[$key]['PROXY_EXT'] = str_replace(',', ', ', $proxy_ext);
    $data[$key]['PROXY_EXT'] = $proxy_ext.", ...";
  } else {
    $data[$key]['PROXY_EXT'] = '';
    $data[$key]['PROXY_EXT'] = str_replace(',', ', ', $data[$key]['PROXY_EXT']);
  }

  $data[$key]['WEB_STATS'] = 'no';
  if (!empty($data[$key]['STATS'])) {
    $data[$key]['WEB_STATS'] = $data[$key]['STATS'];
  }

  $data[$key]['FTP'] = 'no';
  if (!empty($data[$key]['FTP_USER'])) {
    $data[$key]['FTP'] = $data[$key]['FTP_USER'];
  }

  $data[$key]['PROXY_SYSTEM'] = !empty($_SESSION['PROXY_SYSTEM']);
  $data[$key]['PROXY_SUPPORT'] = 'no';
  if (!empty($data[$key]['PROXY'])) {
    $data[$key]['PROXY_SUPPORT'] = 'yes';
  }

  $data[$key]['WEB_BACKEND'] = !empty($_SESSION['WEB_BACKEND']);
  $data[$key]['BACKEND_SUPPORT'] = 'no';
  if (!empty($data[$key]['BACKEND'])) {
    $data[$key]['BACKEND_SUPPORT'] = 'yes';
  }

  $data[$key]['U_BANDWIDTH_SIZE'] = humanize_usage_size($data[$key]['U_BANDWIDTH']);
  $data[$key]['U_BANDWIDTH_MEASURE'] = humanize_usage_measure($data[$key]['U_BANDWIDTH']);

  $data[$key]['U_DISK_SIZE'] = humanize_usage_size($data[$key]['U_DISK']);
  $data[$key]['U_DISK_MEASURE'] = humanize_usage_measure($data[$key]['U_DISK']);

  $data[$key]['delete_confirmation'] = __('DELETE_DOMAIN_CONFIRMATION', $key);

  if ( $i == 1) {
    $total_amount = __('1 domain');
  } else {
    $total_amount = __('%s domains',$i);
  }
}

$object = (object)[];
$object->data = $data;
$object->user = $user;
$object->panel = $panel;
$object->totalAmount = $total_amount;
$object->webFav = $_SESSION['favourites']['WEB'];

print json_encode($object);
?>

