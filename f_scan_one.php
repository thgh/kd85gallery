<?php

header('Content-type: application/json');

// Check for filename
if(!isset($_REQUEST['q']) || empty($_REQUEST['q'])){
  $r['success']=false;
  $r['error']="No filename given";
  echo json_encode($r);
  exit();
}
$q=$_REQUEST['q'];

// Assume public/upload folder
if(strpos($q,"public/upload")>0&&strpos($q,"public/upload")<4){
  $q=substr($q, 14+strpos($q,"public/upload"));
}

$p = pathinfo($q);

// Check if file exists
if(!file_exists("public/upload/".$q)){
  $r['success']=false;
  $r['error']="File not found";
  echo json_encode($r);
  exit();
}

// Export php pathinfo
$r['path']=$q;
$r['dirname']=strlen($p['dirname'])>1?$p['dirname']:'.';
$r['basename']=$p['basename'];
$r['extension']=$p['extension'];
$r['filename']=$p['filename'];

// Parse and export tags
foreach(explode("-", $p['filename']) as $tag){
  $r['tags'][]=$tag;
}

// Retrieve and export date
$datetime="00000000000000000000";
$exif= read_exif_data("public/upload/".$q, 0, true);

// Try multiple datetime sources
if(isset($exif['EXIF']['DateTimeOriginal'])){
  $datetime=$exif['EXIF']['DateTimeOriginal'];
  $r['dtfrom']="dtorig";
}
elseif(isset($exif['IFD0']['DateTime'])){
  $datetime=$exif['IFD0']['DateTime'];
  $r['dtfrom']="dt";
}
elseif(isset($exif['FILE']['FileDateTime'])){
  $datetime=$exif['FILE']['FileDateTime'];
  $r['dtfrom']="filedt";
}
$yy = substr($datetime,0,4);
$mm = substr($datetime,5,2);
$dd = substr($datetime,8,2);
$h =  substr($datetime,11,2);
$m =  substr($datetime,14,2);
$s =  substr($datetime,17,2);
$r['datetime']= $yy.'-'.$mm.'-'.$dd.' '.$h.':'.$m.':'.$s;
$r['date']= $yy.$mm.$dd;
$r['time']= $h.$m.$s;

$r['success']=true;
echo json_encode($r);
?>