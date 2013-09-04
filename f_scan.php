<?php

header('Content-type: application/json');

// Read public/upload folder
if ($handle = opendir('public/upload/')) {
  while (false !== ($name = readdir($handle))) {
    // Save all foldernames
    if(strpos($name,".")===false){
      $dirs[$name]=$name;
    }
    // Save all filenames
    elseif(strpos($name,".")>2){
      $r[]['path']=$name;
    }
  }
  closedir($handle);

  // Check each folder for more files, only 1 level up
  if(isset($dirs)){
    foreach($dirs as $foldername){
      if ($handle = opendir("public/upload/$foldername/")) {
        while (false !== ($name = readdir($handle))) {
          // Save all filenames
          if(strpos($name,".")>2){
            $r['filedata'][]['path']=$foldername."/".$name;
          }
        }
        closedir($handle);
      }
    }
  }

  foreach($r['filedata'] as $k => $q){
    $p = pathinfo($q['path']);

    // Export php pathinfo
    $r['filedata'][$k]['dirname']=strlen($p['dirname'])>1?$p['dirname']:'.';
    $r['filedata'][$k]['basename']=$p['basename'];
    $r['filedata'][$k]['extension']=$p['extension'];
    $r['filedata'][$k]['filename']=$p['filename'];

    // Parse and export tags
    foreach(explode("-", $p['filename']) as $key => $tag){
      $r['filedata'][$k]['tags'][]=$tag;
      if($key>2&&strlen($tag)>0){
        $r['taglist'][$tag]=$tag;
      }
    }

    // Retrieve and export date
    $datetime="00000000000000000000";
    $exif= read_exif_data("public/upload/".$q['path'], 0, true);

    // Try multiple sources
    if(isset($exif['EXIF']['DateTimeOriginal'])){
      $datetime=$exif['EXIF']['DateTimeOriginal'];
      $r['filedata'][$k]['dtfrom']="dtorig";
    }
    elseif(isset($exif['IFD0']['DateTime'])){
      $datetime=$exif['IFD0']['DateTime'];
      $r['filedata'][$k]['dtfrom']="dt";
    }
    elseif(isset($exif['FILE']['FileDateTime'])){
      $datetime=$exif['FILE']['FileDateTime'];
      $r['filedata'][$k]['dtfrom']="filedt";
    }
    $yy = substr($datetime,0,4);
    $mm = substr($datetime,5,2);
    $dd = substr($datetime,8,2);
    $h =  substr($datetime,11,2);
    $m =  substr($datetime,14,2);
    $s =  substr($datetime,17,2);
    $r['filedata'][$k]['datetime']= $yy.'-'.$mm.'-'.$dd.' '.$h.':'.$m.':'.$s;
    $r['filedata'][$k]['date']= $yy.$mm.$dd;
    $r['filedata'][$k]['time']= $h.$m.$s;
  }
}
$r['dirs']=$dirs;
$r['taglist'][]="x";
sort($r['taglist']);
echo json_encode($r);
file_put_contents('public/items.json', json_encode($r));
?>