'use strict';

/*angular.module('MetronicApp', ['angular-lazy-load'])
  .config(function(lazyLoadProvider) {
    lazyLoadProvider.setUseIntersectionObserver(true);
  })
  .controller('EpgCtrl',
    ['$scope', function() {
        $scope.loadLower = function() {

        }
    }]
  );
*/

MetronicApp.controller('InsideCtrl', function ($scope, ngDialog) {

});


MetronicApp.controller('EpgCtrl', function($rootScope, $scope, $http, $q, ngDialog, hotkeys, pendingRequest, localStorageService) {

    var LINEUP = 3787;
    var CHANNELS_TO_QUERY = 5;
    var DAY = 0;
    var TIMEZONE = 'America/Toronto';

    moment().format();

    localStorageService.set('lineup', LINEUP);

        var component_epg = $('[data-component="epg"]');

        if (component_epg.length > 0)
        {
            /*
             * Initialize
             */

            var epg_start = component_epg.data('start');
            var epg_grid = $('.epg-grid', component_epg);
            var epg_grid_scroll = 0;

            if (typeof epg_start !== 'undefined' && epg_start !== '')
            {
                // Scroll the grid to the specified starting point
                scrollEPG(epg_start - 120);
            }

            /**
             * Controls
             */

            var action_prev = $('[data-action="prev"]', component_epg);
            var action_prev_icon = $('.icon', action_prev);
            var action_next = $('[data-action="next"]', component_epg);
            var action_next_icon = $('.icon', action_next);

            /* Previous */
            action_prev.on('click', function (e)
            {
                e.preventDefault();

                scrollEPG(-Math.abs(240));
            });

            /* Next */
            action_next.on('click', function (e)
            {
                e.preventDefault();

                scrollEPG(240);
            });

            var scroll_top = 0;
            var grid_height = epg_grid.height();

            $(window).on('scroll', function ()
            {
                scroll_top = $(window).scrollTop();

                //console.log(scroll_top);

                if (scroll_top >= grid_height)
                {
                    action_prev_icon.css('position', 'relative');
                    action_next_icon.css('position', 'relative');
                }
                else
                {
                    action_prev_icon.css('position', 'fixed');
                    action_next_icon.css('position', 'fixed');
                }
            });
        }

        /**
         * Scroll the EPG grid the specified distance
         */

        function scrollEPG(distance)
        {
            epg_grid_scroll = epg_grid.scrollLeft();

            epg_grid.stop(true, true).animate({
                scrollLeft: epg_grid_scroll + distance
            }, 500);
        }


    $scope.x = 0;
    $scope.y = 0;

     hotkeys.add({
    combo: 'down',
    description: '',
    callback: function() {
        if($scope.y+1<$scope.channels.length)
            $scope.y += 1;
        var y = $(window).scrollTop();  //your current y position on the page
        $(window).scrollTop(y+400);
    }
  });
    hotkeys.add({
      combo: 'up',
    description: '',
    callback: function() {
        if($scope.y-1>-1)
            $scope.y += -1;
        var y = $(window).scrollTop();  //your current y position on the page
        $(window).scrollTop(y-400);
    }
  });
        hotkeys.add({
      combo: 'left',
    description: '',
    callback: function() {
         if($scope.x-1>-1)
      $scope.x += -1;
    scrollEPG(-Math.abs(240));
    }
  });
        hotkeys.add({
      combo: 'right',
    description: '',
    callback: function() {
         if($scope.x+1<50)
             $scope.x += 1;
        scrollEPG(Math.abs(240));
    }
  });

    hotkeys.add({
      combo: 'enter',
    description: 'show program detail',
    callback: function() {
		$rootScope.detail = $scope.scheduled[$scope.y][$scope.x];
        var new_dialog = ngDialog.open({
            id: 'fromAService',
            template: 'firstDialogId',
            controller: 'InsideCtrl'
        });
    }
  });

    $scope.scheduled=[];

    $rootScope.detail = 'test';

    $scope.open = function(id) {
        $scope.x=id.x;
        $scope.y=id.y;
        $rootScope.detail = id;
        var new_dialog = ngDialog.open({
            id: 'fromAService',
            template: 'firstDialogId',
            controller: 'InsideCtrl'
        });

    };

    $scope.setDay = function(day, $event) {
        
        $('.epg-nav-dates .list-dates li.today').toggleClass('today');
        $($event.currentTarget).parent().toggleClass('today');
        DAY = day;
    
        pendingRequest.cancel();
        $scope.scheduled=[];
        getChannels();
    };

    function getChannels() {
        var channels = localStorageService.get('CHANNELS_' + LINEUP) ? JSON.parse(localStorageService.get('CHANNELS_' + LINEUP)) : null;
        var fChannels = localStorageService.cookie.get('favorites_channels');
        if (channels!=null && fChannels!=null){
	var chlen=channels.stations.length;
        var k=0;
        for (var i=0; i<chlen;i++){
             if (fChannels.indexOf(channels.stations[k].number)==-1)
             {
               channels.stations.splice(k,1);
             }
             else
             {
                k++;
             }
        }

        //console.log(channels);

        if (channels) {
             
            return parseChannels(channels);
        }
	}
        //console.log(channels);
        $http.get('http://139.59.250.200:5555/api/channels?lineup=' + LINEUP, {
            withCredentials: true
        }).success(function(data) {
            localStorageService.set('CHANNELS_' + LINEUP, JSON.stringify(data));
            return parseChannels(data);
        });
    };
    function parseChannels(data) {
        $scope.channels = data.stations;
        $scope.taille = data.stations.length;

        var channelsId = [];
        var channelsIdList = [];
        for(var i=0;i<$scope.channels.length;i++){
            channelsId.push($scope.channels[i].number);
        }

        for(var i=0;i< Math.ceil(channelsId.length / CHANNELS_TO_QUERY);i++){
            channelsIdList.push(channelsId.slice(i*CHANNELS_TO_QUERY, (i+1)*CHANNELS_TO_QUERY).join(','));
        }

        for(var i=0; i < channelsIdList.length; i++){
            getSheduled(channelsIdList[i], i*CHANNELS_TO_QUERY);
        }
    };

    function getSheduled(channels, offset) {
        var some_remote_resource = $q.defer();
        var cancel = $q.defer();
        var request;
        //console.log('Getting _http://139.59.250.200:5555/api/scheduled?lineup=' + LINEUP + '&channels=' + channels + '&day=' + DAY + '&timezone=' + TIMEZONE);

        document.getElementById('progressBar').setAttribute("style", "");

        $http.get('http://139.59.250.200:5555/api/scheduled?lineup=' + LINEUP + '&channels=' + channels + '&day=' + DAY + '&timezone=' + TIMEZONE, {
            timeout: cancel.promise,
            withCredentials: true
        }).success(function(data) {
            document.getElementById('progressBar').setAttribute("style", "display:none;");
            for(var i=0; i < data.length; i++){
                var r = data[i].listings;
                r.i=offset+i;
                for(var o=0;o<r.length;o++){
                    var absoluteDifference = r[o].duration;

                    r[o].l = absoluteDifference*220/60;
                    r[o].s = new Date(r[o].listDateTime).getTime();

                    if (o == 0) {
                        var startTime = moment(r[o].listDateTime);

                        var duration = moment.duration(startTime.diff(moment().startOf('day')));
                        var minutes = duration.asMinutes();

                        r[o].o = minutes*220/60;
                    }

                    if(r[o].l<60)
                        r[o].size=9;
                    else
                        r[o].size=13;
                    r[o].x=o;
                    r[o].y=i;
                }
                $scope.scheduled.push(r);
                $scope.scheduled.sort(compare);
                //console.log($scope.scheduled);
            }
            console.log($scope.scheduled);
        });
        request = {
            wait: function () {
                return some_remote_resource.promise;
            },
            cancel: function () {
                this.canceled = true;
                cancel.resolve();
            }
        };
        pendingRequest.add(request);
        return request;
    };

    function compare(a,b) {
      if (a.i < b.i)
         return -1;
      if (a.i > b.i)
        return 1;
      return 0;
    };

    getChannels();
    

});


