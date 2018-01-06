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
if (localStorage.getItem('started')==null) localStorage.setItem('started', '0');
MetronicApp.controller('InsideCtrl', function ($scope, ngDialog) {

});


MetronicApp.controller('EpgCtrl', function($rootScope, $scope, $http, $q, ngDialog, hotkeys, pendingRequest, localStorageService) {
var started=0;        
    
    
    var LINEUP = 3787;
    var LINEDUP='GBR-1002101-DEFAULT';//'ZWE-0001172-DEFAULT';//'USA-TX42500-X';
    var COUNTRY='GBR';
    var POSTCODE='CF31';//78701;
    var CHANNELS_TO_QUERY = 5;
    var today = new Date();
    var DAY = today.getDay();
    var gmt = -today.getTimezoneOffset( ) / 60;
    //alert(gmt);

    var TIMEZONE = 'America/Toronto';

    moment().format();

	
    localStorageService.set('lineup', LINEDUP);

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
	
	$scope.full_width;
	$scope.my_row;
	
    $scope.fixWidth = function(row,width) {
		if(row !==  $scope.my_row){
			$scope.full_width = 0;	
		}

		$scope.full_width = $scope.full_width + width;
		$scope.my_row = row;
		
		if($scope.full_width > 5875 ){
			return 'display:none';
		}
			
		return 'width:'+ width + 'px;';
	}	
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
        var init_channel=['17153','17154','17468','17155','17157','20630','20684','24305','47657','21494','52335','48020','21257','53059','25117','33882','65160','98366','75804']; //,'16235'
        var channels = localStorageService.get('CHANNELS_' + LINEDUP) ? JSON.parse(localStorageService.get('CHANNELS_' + LINEDUP)) : null;
        var fChannels = localStorageService.cookie.get('favorites')!==null?localStorageService.cookie.get('favorites').toString().split(','):init_channel;    
        var init_fav="17153,17154,17468,17155,17157,20630,20684,24305,47657,21494,52335,48020,21257,53059,25117,33882,65160,98366,75804";
        if (localStorageService.cookie.get('favorites')==null) localStorageService.cookie.set('favorites',init_fav);
        
        started=parseInt(localStorage.getItem('started'))+1;
        localStorage.setItem('started', started);
         
        console.log(fChannels);
        var toChannels=[];
        //Favourite Channels
        if (channels!=null && fChannels!=null){
        var chlen=channels.length;
        var channelsToCheck=JSON.parse(channels);
     
        var k=0;
        for (var i=0; i<chlen;i++){
            var station=channelsToCheck[i];
            if(station===null)continue;
            if(station.stationId===null||station.stationId===undefined)continue;          
             if (fChannels.indexOf(station.stationId)>-1)
             {
               //channels.splice(k,1);
               toChannels.push(station);
               if(toChannels.length>=fChannels.length)break;
             }
             else
             {
                k++;
             }
        }
        
        

        if (channels.length>0) {
            console.log(toChannels);
            return parseChannels(toChannels);
        }
    }
    //Favourite Channels ends
        //console.log(channels);
        document.getElementById('progressBar').setAttribute("style", "");
        $http.get('http://localhost:5555/api/details?lineup=' + LINEDUP+'&country='+COUNTRY+'&postalcode='+POSTCODE+ '&day=' + DAY + '&timezone=' + TIMEZONE+'&gmt='+gmt, {
            withCredentials: true
        }).success(function(data) {
            
            
            //$scope.channels=JSON.parse(data.channels);
            //$scope.taille=JSON.parse(data.taille); 
                      
            //$scope.scheduled=JSON.parse(data.scheduled);
            localStorageService.set('CHANNELS_' + LINEDUP, JSON.stringify(data.channels));
            document.getElementById('progressBar').setAttribute("style", "display:none;");
            //getShows();
            return parseChannels(JSON.parse(data.channels));
             //return  getShows();
        });
    };
    function move(array, oldIndex, newIndex) {
        if (newIndex >= array.length) {
            newIndex = array.length - 1;
        }
        array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
        return array;
    }
   
    function getShows() {
        document.getElementById('progressBar').setAttribute("style", "");
        var channelsId = [];
        var channelsIdList = [];
        var lengthto=$scope.channels.length>=50?50:$scope.channels.length;
        for(var i=0;i<lengthto;i++){
            var mdo=$scope.channels[i];
            if(mdo===undefined)continue;           
            channelsId.push(mdo.stationId);
        }

        for(var i=0;i< Math.ceil(channelsId.length / CHANNELS_TO_QUERY);i++){
            channelsIdList.push(channelsId.slice(i*CHANNELS_TO_QUERY, (i+1)*CHANNELS_TO_QUERY).join(','));
        }

         
        for(var i=0; i < channelsIdList.length; i++){
            if (channelsIdList[i].length <= 1) continue;
            getSheduled(channelsIdList[i], i*CHANNELS_TO_QUERY);
        }
    }
    function parseChannels(data) {
        $scope.channels = data;
        $scope.taille = data.length;
        
         
        var channelsId = [];
        var channelsIdList = [];
        var lengthto=$scope.channels.length;
        
        if (lengthto>19 && localStorage.getItem('started')=='1') lengthto=19;
        console.log(lengthto);
        for(var i=0;i<lengthto;i++){
            var mdo=$scope.channels[i];
            if(mdo===undefined)continue;           
            channelsId.push(mdo.stationId);
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
        //var channel=channels.split(',');
        document.getElementById('progressBar').setAttribute("style", "");
        //for(var i=0; i < channel.length; i++){
           
        $http.get('http://localhost:5555/api/scheduled?lineup=' + LINEDUP + '&channels=' + channels + '&day=' + DAY + '&timezone=' + TIMEZONE+'&gmt='+gmt, {
            timeout: cancel.promise,
            withCredentials: true
        }).success(function(data) {
            
            document.getElementById('progressBar').setAttribute("style", "display:none;");
            for(var i=0; i < data.length; i++){
                if(data[i].airings===undefined)continue;
                var r = data[i].airings;
                r.i=offset+i;
                for(var o=0;o<r.length;o++){
                    var absoluteDifference = r[o].duration;

                    r[o].l = absoluteDifference*220/60;
                    r[o].s = new Date(r[o].startTime).getTime();

                    if (o == 0) {
                        var startTime = moment(r[o].startTime);

                        var duration = moment.duration(startTime.diff(moment().startOf('day')));
                        var minutes = duration.asMinutes()%60-60;
                        if (minutes==-60){
                            r[o].o=0;    
                        } 
                        else{
                            r[o].o = minutes*220/60;
                        }
                    }
                    else{
                        r[o].o = 0;   
                    }

                    if(r[o].l<60)
                        r[o].size=9;
                    else
                    r[o].size=13;
                    r[o].x=o;
                    r[o].y=i;
                    r[o].s=r[o].s+gmt*60000*60;
                    r[o].stime=moment(r[o].startTime).format("HH:mm");
                    r[o].etime=moment(r[o].endTime).format("HH:mm");
                }
               // r.push(r[0]);
                
                //if(r.length>0){
                
                $scope.scheduled.push(r);
                $scope.scheduled.sort(compare);
           // }
            }
            //console.log($scope.scheduled);

        });
   // }
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


