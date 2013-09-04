'use strict';

var galleries;

// Declare app level module which depends on filters, and services
angular.module('Tagging', ['Tagging.controllers']);

/* Controllers */
angular.module('Tagging.controllers', [])
.controller('GalleryCtrl', function($scope, $timeout) {
  $scope.saving=false;
  $scope.prevIndex=1;
  $scope.cExif=true;
  $scope.i=0;

  Alertify.log.delay=10000;
  Alertify.log.info('Notifications here!');

      
  $.getJSON('f_scan.php')
  .success(function (d) {
    $scope.filedata = d.filedata;
    $scope.taglist = d.taglist;
    $scope.dirs = d.dirs;

  });

  $timeout(function() {
    $scope.init(); 
    $scope.localRefresh();       
  }, 500)

  $scope.init = function() {
    galleries = $('.ad-gallery').adGallery({slideshow: {enable: false},effect:"none",animation_speed:1});
    galleries[0].settings.callbacks.afterImageVisible = function (new_image, old_image) {
      $scope.setAct(galleries[0].current_index); 
      console.log("Image " + $scope.i + " is now active");
    };
  }

  $scope.localRefresh = function(i) {
    galleries[0].removeAllImages();
    angular.forEach($scope.filedata, function(v,k) {
      if (v.basename && !$scope.tagged || $.inArray($scope.tagged,$scope.taglist)) {
        galleries[0].addImage('thumb.php?src=public/upload/' + v.path , 'public/upload/' + v.path, 'img' + k,!v.tags[2]);
      }
    });
    galleries[0].showImage(i||0);

    Alertify.log.info('Gallery refreshed');
  }

  $scope.fetch = function() {
    var i=$scope.i;
    $.getJSON('f_scan.php')
    .success(function (d) {
      $scope.filedata = d.filedata;
      $scope.taglist = d.taglist;
      $scope.dirs = d.dirs;
    })
    .then(function (){
      $scope.localRefresh(i);
    });
  }

  $scope.pathgen = function() {
    if(!$scope.a)return "Loading";
    var a = $scope.a;
    var newn = a.tags[0];

    if($scope.cExif){
      newn += "-"+a.date+"-"+a.time;
    }
    newn = a.dirname+'/'+newn;
    $.each($('.tags .btn-primary'), function (k, v) {
      newn += '-' + $(v).data('tag');
    });
    return newn + '.' + a.extension;
  }

  $scope.addTag = function(tag) {
    if(!tag)return;
    if($scope.taglist.indexOf(tag) == -1){
      Alertify.log.success('New tag: '+tag);
      $scope.taglist.push(tag);
    }
    $scope.taggle(tag);
    $scope.itag="";
  }
  $scope.taggle = function(tag,on) {
    //jquery!
    $('.tag'+tag).toggleClass('btn-primary');
    Alertify.log.info('Taggle: '+tag);
  }

  /*$scope.fillTag = function() {
    $scope.taglist=taglist;
  }
  $scope.setData = function(index) {
    $scope.filedata=$scope.filedata;
  }*/
  $scope.setAct = function(i) {
    if(isNaN(i)) return;
    Alertify.log.info('Select image '+i);
    $scope.$apply(function(){
      $scope.a=angular.copy($scope.filedata[i]);
      $scope.i=i;
      //jquery!
      $('.tags button').removeClass('btn-primary');
      angular.forEach($scope.a.tags,function(v,k){
        $('.tag'+v).addClass('btn-primary');
      })
    });
  }

  $scope.grabExif = function() {
    $scope.a.tags[0]=$scope.a.date;
    $scope.a.tags[1]=$scope.a.time;
  }

  $scope.saveFile = function(){
    $scope.saving=true;
    var a=$scope.a;

    var oldn = $scope.filedata[$scope.i].path;
    var newn = $scope.pathgen();

    Alertify.log.info('Old '+oldn);
    Alertify.log.info('New '+newn);

    $.ajax({
      type: 'get',
      url: 'f_rename.php',
      data: 'oldn=' + oldn + '&newn=' + newn,
      success: function (d) {
        if(d.info){
          angular.forEach(d.info, function(v,k) {Alertify.log.create(v.type, v.text);});
        }

        $.getJSON('f_scan_one.php?q=' + newn).then(function (data) {
          if (data.success) {
            Alertify.log.success('Filename change confirmed.');
            $scope.$apply(function(){
              $scope.filedata[$scope.i] = data;
              $scope.a = data;
              $('#img' + $scope.i).attr('alt', 'true');
              $('#img' + $scope.i).attr('href', 'public/upload/' + newn);
              $('#img' + $scope.i + ' img').attr('src', 'thumb.php?src=public/upload/' + newn);
            })
          }
          else{
            Alertify.log.error('No success');
          }
        });
      }
    });
  }
});
