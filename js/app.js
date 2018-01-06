/***
Metronic AngularJS App Main Script
***/

/* Metronic App */
var MetronicApp = angular.module("MetronicApp", [
    "ui.router",
    "ngDialog",
    "cfp.hotkeys",
    'pascalprecht.translate',
    "LocalStorageModule",
    "sticky"
]);

MetronicApp.config(['$translateProvider', function ($translateProvider) {
  $translateProvider.translations('en', {
    'Direct': 'Live',
    'Configuration': 'Configuration',
    'Demain':'Tomorrow',
    'RechercheC':'Search by channel',
    'RechercheP':'Search by program',
    'Aujourd':'Today',
    'config':'Configuration Parameter',
    'langage':'Language'
  });
 
  $translateProvider.translations('fr', {
    'Direct': 'Direct',
    'Configuration': 'Configuration',
    'Demain':'Demain',
    'RechercheC':'Rechercher selon la chaine',
    'RechercheP':'Rechercher selon le programe',
    'Aujourd':'Aujourd hui',
    'config':'Paramètre de Configuration',
    'langage':'Langage'  
  });
 
  $translateProvider.preferredLanguage('en');

  function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    var day = today.getDate();
    var month=today.getMonth()+1;
    var year=today.getFullYear();
    // add a zero in front of numbers<10
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('clockbox').innerHTML =year+' / '+month+' / '+day+' - '+ h + ":" + m + ":" + s;
    var t = setTimeout(function () {
      startTime()
    }, 500);
  }
  startTime();
  function checkTime(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }
}]);

