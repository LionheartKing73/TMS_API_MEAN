var http = require('http');
var url = require('url');
var moment = require('moment');
// require the script 
//var iso8601 = require('node-iso8601');
var port = process.env.PORT || 5555;

var LINEUP = 3787;
var LINEDUP = 'GBR-1002101-DEFAULT';//'ZWE-0001172-DEFAULT';//'USA-TX42500-X';
var COUNTRY = 'GBR';
var POSTCODE = 'CF31';//78701;
var CHANNELS_TO_QUERY = 1;
var today = new Date();
var DAY = today.getDay();
var gmt = -today.getTimezoneOffset() / 60;


var API_KEY = 'b8e84466a40653da1d3f21924f829741';
var tms_API_KEY = '2x5xdpvmmpxar6sbyu43d8me';

http.createServer(function (req, res) {

    var origin = req.headers.origin;
    //res.setHeader('Access-Control-Allow-Origin', origin);

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    if (req.url === '/favicon.ico') {
        return;
    }

    var requestPath = url.parse(req.url).pathname;

    switch (requestPath) {
        case '/api/channels':
            var lineup = url.parse(req.url, true).query.lineup;

            //Started new api
            var country = url.parse(req.url, true).query.country;
            var postcode = url.parse(req.url, true).query.postalcode;

            GetChannelLineUps(lineup, country, postcode, function (data) {
                res.end(data);
            });
            /*
            getChannelTableApi(lineup,function(data) {
                res.end(data);
            });
             */
            break;
        case '/api/scheduled':
            var channels = url.parse(req.url, true).query.channels;
            var lineup = url.parse(req.url, true).query.lineup;
            var day = parseInt(url.parse(req.url, true).query.day);
            var gmt = parseInt(url.parse(req.url, true).query.gmt);

            /*
            getChannelListings(channels, lineup, day, gmt, function(data) {
                res.end(data);
            });*/

            retrieveChannelListings(channels, lineup, day, gmt, function (data) {
                res.end(data);
            });

            break;
        case '/api/details':
            var channels = url.parse(req.url, true).query.channels;
            var lineup = url.parse(req.url, true).query.lineup;
            var day = parseInt(url.parse(req.url, true).query.day);
            var gmt = parseInt(url.parse(req.url, true).query.gmt);


            //Started new api
            var country = url.parse(req.url, true).query.country;
            var postcode = url.parse(req.url, true).query.postalcode;
            /*
            getChannelListings(channels, lineup, day, gmt, function(data) {
                res.end(data);
            });*/
            //(lineup,country,postalcode, callback)
            GetChannelLineUps(lineup, channels, country, postcode, day, gmt, function (data) {
                res.end(data);
            });

            break;
        default:
            res.end('eroor pppp');
            break;
    }

}).listen(port);
console.log("Node Web server now running on port " + port)

var channellist = [];
var channelsToList = [];
var taille = [];
var schedule = [];
var datum = [];
var channelsIdList = [];
//channellist.push('channels:');
//taille.push('taille:');
//schedule.push('scheduled:');
var parseChannels = function parseChannels(data, day, gmt,callback) {
    //var data=GetChannelLineUps(lineup,country,postalcode, callback)
    channellist.push(data);
    channelsToList.push(JSON.parse(data));
    taille.push(data.length);
   //console.log(data);
    /*
    var channelsId = [];

    var mdo = channelsToList[0];
    //if (mdo === undefined) continue;
    for (var i = 0; i < mdo.length; i++) {
       var mor=mdo[i];
        channelsId.push(mor.stationId);
    }

    for (var i = 0; i < Math.ceil(channelsId.length / CHANNELS_TO_QUERY); i++) {
        channelsIdList.push(channelsId.slice(i * CHANNELS_TO_QUERY, (i + 1) * CHANNELS_TO_QUERY).join(','));
    }


    for (var i = 0; i < channelsIdList.length; i++) {
        if (channelsIdList[i].length <= 1) continue;
        getLineUpChannelListings(channelsIdList[i], i * CHANNELS_TO_QUERY, LINEDUP, day, gmt,callback,i+1);
        //getSheduled(channelsIdList[i], i*CHANNELS_TO_QUERY,day,gmt);
    }
   */
    
    //wait(36000);
};

//#region GetScheduled
var getSheduled = function getSheduled(values, offset,callback,point) {
    //console.log(values);
    //var some_remote_resource = $q.defer();
    //var cancel = $q.defer();
    var request;
    /*
    var data1 =[]
    try{
   data1.push(values);
}catch(e){
;
}
console.log();
console.log();
console.log(data1);
*/
//var data=JSON.parse(values);
var data=values;
    //console.log('Getting _http://139.59.250.200:5555/api/scheduled?lineup=' + LINEUP + '&channels=' + channels + '&day=' + DAY + '&timezone=' + TIMEZONE);
    //var channel=channels.split(',');
    //document.getElementById('progressBar').setAttribute("style", "");
    //for(var i=0; i < channel.length; i++){

    //var data= 
    /* 
  $http.get('http://localhost:5555/api/scheduled?lineup=' + LINEDUP + '&channels=' + channels + '&day=' + DAY + '&timezone=' + TIMEZONE+'&gmt='+gmt, {
      timeout: cancel.promise,
      withCredentials: true
  }).success(function(data) {
    */
    //document.getElementById('progressBar').setAttribute("style", "display:none;");
    for (var i = 0; i < data.length; i++) {
        if (data[i].airings === undefined) continue;
        var r = data[i].airings;
        r.i = offset + i;
        for (var o = 0; o < r.length; o++) {
            var absoluteDifference = r[o].duration;

            r[o].l = absoluteDifference * 220 / 60;
            r[o].s = new Date(r[o].startTime).getTime();

            if (o == 0) {
                var startTime = moment(r[o].startTime);

                var duration = moment.duration(startTime.diff(moment().startOf('day')));
                var minutes = duration.asMinutes() % 60 - 60;
                if (minutes == -60) {
                    r[o].o = 0;
                }
                else {
                    r[o].o = minutes * 220 / 60;
                }
            }
            else {
                r[o].o = 0;
            }

            if (r[o].l < 60)
                r[o].size = 9;
            else
                r[o].size = 13;
            r[o].x = o;
            r[o].y = i;
            r[o].s = r[o].s + gmt * 60000 * 60;
        }
        // r.push(r[0]);



        schedule.push(JSON.parse(r));
        schedule.sort(compare);

    }
    if(point>=channelsIdList.length-1){
    var output = {}
    
     output['channels'] = String(channellist[0]);
     output['taille'] = String(taille);
     output['scheduled'] = String(schedule);
     
     //console.log( JSON.stringify(output) );

    // if(schedule.length>0){
     
     callback(JSON.stringify(output));
    }
    /*
            request = {
                wait: function () {
                    return this.promise;
                },
                cancel: function () {
                    this.canceled = true;
                    cancel.resolve();
                }
            };
            pendingRequest.add(request);
            return request;
          */
};
//#endregion

function compare(a, b) {
    if (a.i < b.i)
        return -1;
    if (a.i > b.i)
        return 1;
    return 0;
};
function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
 }
function GetChannelLineUps(lineup, channels, country, postalcode, day, gmt, callback) {
    var options = {
        host: 'data.tmsapi.com',
        //path: '/v1.1/lineups?country='+country+'&postalCode='+postalcode+'&api_key='+tms_API_KEY
        path: '/v1.1/lineups/' + LINEDUP + '/channels?imageSize=Sm&enhancedCallSign=true&api_key=' + tms_API_KEY,
        timeout: 12000,
    };
    //http://data.tmsapi.com/v1.1/lineups/USA-TX42500-X/channels?imageSize=Sm&enhancedCallSign=true&api_key=2x5xdpvmmpxar6sbyu43d8me
    var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        var chunks = "";

        res.on('data', function (chunk) {
            chunks = chunks + chunk;
        });

        res.on('end', function () {
            parseChannels(chunks, day, gmt, callback);

            var output = {}
            
             output['channels'] = String(channellist[0]);
             output['taille'] = String(taille);
             output['scheduled'] = String(schedule);
              callback(JSON.stringify(output));


           
             //console.log( JSON.stringify(output) );
        
            // if(schedule.length>0){
             
            
           
            //await snooze(1000);
            /*
            var output = {}
           
            output['channels'] = String(channellist[0]);
            output['taille'] = String(taille);
            output['scheduled'] = String(schedule);
            
            //console.log( JSON.stringify(output) );

           // if(schedule.length>0){
            
            callback(JSON.stringify(output));
           */
        //}
            //parseChannels(data);
        });
        res.on('error', function (e) {
            console.log('Problem with request: ' + e.message);
            var output = {}
            
            output['channels'] = String(channellist[0]);
            output['taille'] = String(taille);
            output['scheduled'] = String(schedule);
            
            
            
            callback(JSON.stringify(output));
        });
    });
    req.end();
}

function retrieveChannelListings(channels,lineup,  day, gmt,callback) {
    var listingsCount = 0;
    var mergedListings = [];

    var start = new Date();
    var end = new Date();

    var add_day = day - start.getDay();
    if (add_day < 0) add_day += 7;
    var gmt = -start.getTimezoneOffset() / 60 - gmt;
    if (gmt > 0) {
        start.setHours(gmt, 0, 0, 0);
        end.setHours(gmt, 59, 59, 999);
        start.setDate(end.getDate() + add_day);
        end.setDate(end.getDate() + add_day + 1);
    }
    if (gmt < 0) {
        start.setHours(24 + gmt, 0, 0, 0);
        end.setHours(24 + gmt, 59, 59, 999);
        start.setDate(end.getDate() + add_day - 1);
        end.setDate(end.getDate() + add_day);
    }
    if (gmt == 0) {
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 59, 59, 999);
        start.setDate(end.getDate() + add_day);
        end.setDate(end.getDate() + add_day + 1);
    }

    var ISO_DATE_FORMAT = 'YYYY-MM-DD';

    //http://data.tmsapi.com/v1.1/stations/10359/airings?lineupId=USA-TX42500-X&startDateTime=2017-11-08T10%3A30Z&endDateTime=2017-11-09T10%3A30Z&imageSize=Sm&imageAspectTV=2x3&imageText=true&api_key=2x5xdpvmmpxar6sbyu43d8me
    var isostartDate = moment(start).format(ISO_DATE_FORMAT) + 'T00:00Z';
    var isoendDate = moment(start).format(ISO_DATE_FORMAT) + 'T23:59Z';

    var options = {
        host: 'data.tmsapi.com',
        path: '/v1.1/lineups/' + lineup + '/grid?stationId=' + encodeURI(channels) + '&' + encodeURI('startDateTime=' + isostartDate + '&endDateTime=' + isoendDate) + '&size=Detailed&imageSize=Sm&imageAspectTV=2x3&imageText=true&enhancedCallSign=true&api_key=' + tms_API_KEY,
      
    };
    //console.log('offset: '+ offset);
    //console.log(options);

    var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        var chunks = "";
        
        res.on('data', function (chunk) {
            chunks = chunks + chunk;
  
        });

        res.on('end', function () {
          
            callback(chunks);
            
            

        });
    });
    req.end();
};



function getLineUpChannelListings(channels,offset, lineup,  day, gmt,callback,point) {
    var listingsCount = 0;
    var mergedListings = [];

    var start = new Date();
    var end = new Date();

    var add_day = day - start.getDay();
    if (add_day < 0) add_day += 7;
    var gmt = -start.getTimezoneOffset() / 60 - gmt;
    if (gmt > 0) {
        start.setHours(gmt, 0, 0, 0);
        end.setHours(gmt, 59, 59, 999);
        start.setDate(end.getDate() + add_day);
        end.setDate(end.getDate() + add_day + 1);
    }
    if (gmt < 0) {
        start.setHours(24 + gmt, 0, 0, 0);
        end.setHours(24 + gmt, 59, 59, 999);
        start.setDate(end.getDate() + add_day - 1);
        end.setDate(end.getDate() + add_day);
    }
    if (gmt == 0) {
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 59, 59, 999);
        start.setDate(end.getDate() + add_day);
        end.setDate(end.getDate() + add_day + 1);
    }

    var ISO_DATE_FORMAT = 'YYYY-MM-DD';

    //http://data.tmsapi.com/v1.1/stations/10359/airings?lineupId=USA-TX42500-X&startDateTime=2017-11-08T10%3A30Z&endDateTime=2017-11-09T10%3A30Z&imageSize=Sm&imageAspectTV=2x3&imageText=true&api_key=2x5xdpvmmpxar6sbyu43d8me
    var isostartDate = moment(start).format(ISO_DATE_FORMAT) + 'T00:00Z';
    var isoendDate = moment(end).format(ISO_DATE_FORMAT) + 'T00:00Z';

    var options = {
        host: 'data.tmsapi.com',
        path: '/v1.1/lineups/' + LINEDUP + '/grid?stationId=' + encodeURI(channels) + '&' + encodeURI('startDateTime=' + isostartDate + '&endDateTime=' + isoendDate) + '&size=Detailed&imageSize=Sm&imageAspectTV=2x3&imageText=true&enhancedCallSign=true&api_key=' + tms_API_KEY,
      
    };
    //console.log('offset: '+ offset);
    //console.log(options);

    var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        var chunks = "";
        //let chunks = [];
        //let data=[];
        res.on('data', function (chunk) {
            chunks = chunks + chunk;
            //chunks.push(chunk);
        });

        res.on('end', function () {
            //console.log('chunks: '+chunks);
           // if(chunks!=="<h1>Developer Over Qps</h1>"){
            //data   = Buffer.concat(chunks);
            
            try{
                var buff=JSON.parse(chunks);
                getSheduled(buff, offset,callback,point)

                if(schedule.length>0){
                    var output = {}
                    
                     output['channels'] = String(channellist[0]);
                     output['taille'] = String(taille);
                     output['scheduled'] = String(schedule);
                      callback(JSON.stringify(output));
        
        
                    }
                
                
            }catch(e){
                //callback(JSON.stringify(output));
            }
        
                var output = {}
                
                output['channels'] = String(channellist[0]);
                output['taille'] = String(taille);
                output['scheduled'] = String(schedule);
                
                
                
                callback(JSON.stringify(output));
           
           
            //callback(chunks);
        //}
         /*   
        var output = {}
        
         output['channels'] = String(channellist[0]);
         output['taille'] = String(taille);
         output['scheduled'] = String(schedule);
         */
         //console.log( JSON.stringify(output) );

        // if(schedule.length>0){
         
         
        });
        res.on('error', function (e) {
            console.log('Problem with request: ' + e.message);
            var output = {}
            
            output['channels'] = String(channellist[0]);
            output['taille'] = String(taille);
            output['scheduled'] = String(schedule);
            
            
            
            callback(JSON.stringify(output));
        });
    });
    req.end();
};


function getChannelTableApi(lineup, callback) {
    var options = {
        host: 'api.tvmedia.ca',
        path: 'http://api.tvmedia.ca/tv/v4/lineups/' + lineup + '?api_key=' + API_KEY + '&detail=brief'
    };

    var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        var chunks = "";

        res.on('data', function (chunk) {
            chunks = chunks + chunk;
        });

        res.on('end', function () {
            callback(chunks);
        });
    });
    req.end();
}

function getChannelListings(channels, lineup, day, gmt, callback) {
    var listingsCount = 0;
    var mergedListings = [];

    var start = new Date();
    var end = new Date();

    var add_day = day - start.getDay();
    if (add_day < 0) add_day += 7;
    var gmt = -start.getTimezoneOffset() / 60 - gmt;
    if (gmt > 0) {
        start.setHours(gmt, 0, 0, 0);
        end.setHours(gmt, 59, 59, 999);
        start.setDate(end.getDate() + add_day);
        end.setDate(end.getDate() + add_day + 1);
    }
    if (gmt < 0) {
        start.setHours(24 + gmt, 0, 0, 0);
        end.setHours(24 + gmt, 59, 59, 999);
        start.setDate(end.getDate() + add_day - 1);
        end.setDate(end.getDate() + add_day);
    }
    if (gmt == 0) {
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 59, 59, 999);
        start.setDate(end.getDate() + add_day);
        end.setDate(end.getDate() + add_day + 1);
    }


    //  if (gmt>0){
    //     start.setHours(gmt, 0, 0, 0);
    //     end.setHours(gmt-1,59,59,999);
    //     start.setDate(end.getDate()+add_day);
    //     end.setDate(end.getDate() + add_day+1);
    // }
    // if (gmt<0){
    //     start.setHours(24+gmt, 0, 0, 0);
    //     end.setHours(23+gmt,59,59,999);
    //     start.setDate(end.getDate()+add_day-1);
    //     end.setDate(end.getDate() + add_day);
    // }
    // if (gmt==0){
    //     start.setHours(0, 0, 0, 0);
    //     end.setHours(23,59,59,999);
    //     start.setDate(end.getDate()+add_day);
    //     end.setDate(end.getDate() + add_day);
    // }


    //       if(day < 2){
    // 	//Process today tommorow
    //   	start.setDate(start.getDate() + day);
    //   	end.setDate(end.getDate() + day);

    // } else {
    // 	//Process week days in our system 2 = Monday, 3 = Tuesday etc
    // 	//we map to JS values getDay minus 2

    // 	var dayGetDay = day - 3;
    // 	var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    // 	//console.log(dayGetDay, days[dayGetDay]);
    // 	start = moment().day(dayGetDay);
    // 	end = moment().day(dayGetDay+1);

    // }

    var options = {
        host: 'api.tvmedia.ca',
        path: '/tv/v4/lineups/' + lineup + '/listings/grid?detail=brief&api_key=' + API_KEY + '&channel=' + channels
            + encodeURI("&start=" + start.toISOString() + "&end=" + end.toISOString())
    };
    //DEBUG: Look at API request
    //console.log(options.path);
    var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        var chunks = "";

        res.on('data', function (chunk) {
            chunks = chunks + chunk;

        });

        res.on('end', function () {

            callback(chunks);
        });
    });
    req.end();
};
