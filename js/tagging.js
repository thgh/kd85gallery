'use strict';


// Declare app level module which depends on filters, and services
angular.module('Tagging', ['Tagging.controllers']);

/* Controllers */
angular.module('Tagging.controllers', [])
.controller('GalleryCtrl', function($scope, $rootScope) {
  $scope.editing=false;
  $scope.saving=false;
  $scope.prevIndex=1;

  Alertify.log.delay=10000;
  Alertify.log.info('Notifications here!');

  $scope.$watch('a', function() {
    if($scope.prevIndex==$scope.i){
      if(!$scope.editing)
        Alertify.log.info('Editing');
      $scope.editing=true;
    }
    $scope.prevIndex=$scope.i;
  },true);
      
  $.getJSON('f_scan.php')
  .done(function (d) {
    $scope.filedata = d.filedata;
    $scope.taglist = d.taglist;
    $scope.dirs = d.dirs;
    $scope.localRefresh();
    $scope.setAct(0);
  });

  $scope.localRefresh = function() {

    var galleries = $('.ad-gallery').adGallery();
    galleries[0].settings.effect = "none";
    galleries[0].slideshow.disable();
    galleries[0].settings.callbacks.afterImageVisible = function (new_image, old_image) {
      $scope.setAct(galleries[0].current_index); 
      console.log("Image " + $scope.i + " is now active");
    };

    angular.forEach($scope.filedata, function(v,k) {
      if (v.basename && !$scope.tagged || $.inArray($scope.tagged,$scope.taglist)) {
        galleries[0].addImage('thumb.php?src=kd85/public/upload/' + v.path , 'public/upload/' + v.path, 'img' + k,!v.tags[2]);
      }
    });
    galleries[0].showImage(0);

    Alertify.log.info('Gallery refreshed');
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
    $scope.editing=true;
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
      $scope.editing=false;
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
    $scope.editing=false;
    $scope.saving=true;
    var a=$scope.a;

    if(!a.tags[1])
      a.tags[1]="000000";

    var oldn = $scope.filedata[$scope.i].path;
    var newn = a.tags[0] + '-' + a.tags[1];

    newn = a.dirname+'/'+newn;

    $.each($('.tags .btn-primary'), function (k, v) {
      newn += '-' + $(v).data('tag');
      Alertify.log.info('Tag '+$(v).data('tag'));
    });
    newn += '.' + a.extension;

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
              $scope.editing=false;
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
