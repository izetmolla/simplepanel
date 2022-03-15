<?php
error_reporting(NULL);
$TAB = 'STATS';

// Main include
include($_SERVER['DOCUMENT_ROOT']."/inc/main.php");
top_panel(empty($_SESSION['look']) ? $_SESSION['user'] : $_SESSION['look'], $TAB);
header('Content-Type: application/json');

// Data
if ($user == 'admin') {
    if (empty($_GET['user'])) {
        exec (SFPANEL_CMD."v-list-users-stats json", $output, $return_var);
        $data = json_decode(implode('', $output), true);
        $data = array_reverse($data, true);
        unset($output);
    } else {
        $v_user = escapeshellarg($_GET['user']);
        exec (SFPANEL_CMD."v-list-user-stats $v_user json", $output, $return_var);
        $data = json_decode(implode('', $output), true);
        $data = array_reverse($data, true);
        unset($output);
    }

    exec (SFPANEL_CMD."v-list-sys-users 'json'", $output, $return_var);
    $users = json_decode(implode('', $output), true);
    unset($output);
} else {
    exec (SFPANEL_CMD."v-list-user-stats $user json", $output, $return_var);
    $data = json_decode(implode('', $output), true);
    $data = array_reverse($data, true);
    unset($output);
}

foreach ($data as $key => $value) {
  ++$i;

  $data[$key]['U_BANDWIDTH_PERCENT'] = get_percentage($data[$key]['U_BANDWIDTH'],$data[$key]['BANDWIDTH']);
  $data[$key]['U_DISK_PERCENT'] = get_percentage($data[$key]['U_DISK'],$data[$key]['DISK_QUOTA']);

  if ( $i == 1) {
    $total_amount = __('1 month');
  } else {
    $total_amount = __('%s months',$i);
  }
}

// Render page
// render_page($user, $TAB, 'list_stats');

// Back uri
$_SESSION['back'] = $_SERVER['REQUEST_URI'];

$object = (object)[];
$object->data = $data;
$object->user = $user;
$object->panel = $panel;
$object->users = $users;
$object->totalAmount = $total_amount;

print json_encode($object);