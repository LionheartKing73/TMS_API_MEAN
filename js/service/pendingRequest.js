'use strict';

MetronicApp.factory('pendingRequest',function(){

    var requests = [];
    return {
        add: function (request) {
            requests.push(request);
        },
        cancel: function () {
            requests.filter(function (request) {
                return !request.canceled;
            }).forEach(function (request) {
                request.cancel();
            });
        }
    };

});
