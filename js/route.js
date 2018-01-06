/* Setup Rounting For All Pages */
MetronicApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/epg");

    $stateProvider
        .state('epg', {
            url: "/epg",
            templateUrl: "views/epg.html",
            controller: "EpgCtrl"
        })
        .state('favorites', {
            url: '/favorites',
            templateUrl: "views/favorites.html",
            controller: "FavoritesCtrl"
        })
        .state('tms', {
            url: "/tms",
            templateUrl: "views/tms.html",
            controller: "tmsCtrl"
        })
        ;
}]);
