'use strict';

MetronicApp.controller('FavoritesCtrl', function($rootScope, $scope, $http, $state, $translate, $location, localStorageService) {
 
   
    $scope.true=true;
    if (localStorageService.get('CHANNELS_' + localStorageService.get('lineup')) == null) {
        $location.path( "/epg" );
    }

    $scope.favoritesChannels = localStorageService.cookie.get('favorites')!==null ? localStorageService.cookie.get('favorites').toString().split(',') : [];
    var channels = localStorageService.get('CHANNELS_' + localStorageService.get('lineup')) ? JSON.parse(localStorageService.get('CHANNELS_' + localStorageService.get('lineup'))) : null;
    if (channels) {
        $scope.channels = JSON.parse(channels);
        $scope.taille = channels.length;
    }
    console.log( $scope.favoritesChannels);

    $scope.favorites = function() {
          
        $scope.favoritesChannels=[];
        $("input[name='fav[]']:checked").each(function() {
            $scope.favoritesChannels.push(this.value);
            //$(this).toggleClass("checked");
            //$(this).prop('checked', $(this).prop('checked'));
        });
        localStorageService.cookie.set('favorites', $scope.favoritesChannels.join(','));
        
    };
   
});


