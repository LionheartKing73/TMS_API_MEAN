'use strict';

MetronicApp.factory('EpgService',function($resource){
    
    
    var service = {};
		
    service.GetAllChannel=GetAllChannel;
    service.GetScheduled=GetScheduled;
   
    return service;
    
    function GetAllChannel(){
        return $resource('http://localhost\\:5555/api/channels?lineup=:lineup',
            {lineup: '@lineup'});
    }
    
    function GetScheduled(){
        return $resource('http://localhost\\:5555/api/scheduled?lineup=:lineup&channels=:channels',
            {lineup: '@lineup', channels: '@channels'});
    }
});
