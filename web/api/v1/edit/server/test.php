<?php
error_reporting(NULL);
$TAB = 'SERVER';

header('Content-Type: application/json');

// Main include
include($_SERVER['DOCUMENT_ROOT']."/inc/main.php");

// Change port
exec (SFPANEL_CMD."v-change-sfpanel-port ".escapeshellarg('8087'), $output, $return_var);
check_return_code($return_var,$output);
unset($output);

header('Location: '
    . ($_SERVER['HTTPS'] ? 'https' : 'http')
    . '://' . $_SERVER['HTTP_HOST'] . ':' . '8087');
exit;
