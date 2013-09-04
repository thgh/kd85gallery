<?php

header('Content-type: application/json');
$fldr="public/upload/";

/* Get values */
if(isset($_REQUEST['oldn']) && !empty($_REQUEST['oldn'])){$oldn=$_REQUEST['oldn'];}
if(isset($_REQUEST['newn']) && !empty($_REQUEST['newn'])){$newn=$_REQUEST['newn'];}

/* Rename */
if(empty($oldn)||empty($newn)) {
  $r['info'][]=array("type"=>"error","text"=>"Need parameters");
}
elseif(rename($fldr.$oldn,$fldr.$newn)) {
  $r['info'][]=array("type"=>"success","text"=>"Filename changed");
}
else {
  $r['info'][]=array("type"=>"error","text"=>"Failed to change filename");
}

sleep(1);

echo json_encode($r);
?>