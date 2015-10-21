/*
 * DEPRECATED, old file 
 *
 * Project: Neighbour map
 * Course: Udacity Front-end nanodegree
 * Author: Tomas Chudjak
 * Created: 2.9.2015
 * Version: 1.0.0
 *
 * define globals for jshint */
 /* global google, document, jQuery */

/*
 * Configuration class with predefined variables
 */
var Config = function(){
    "use strict";
    this.CANVAS = document.getElementById('map_canvas');
    this.LAT = 49.224775;
    this.LNG = 18.7370859;
    this.mapOptions = {
        center : {
            lat : this.LAT,
            lng : this.LNG
        },
        cscrollwheel : false,
        zoom : 17
    };
    this.beerImageGray = 'images/beer-gray.png';
    this.beerImageYellow = 'images/beer-yellow.png';
    this.data = {
        "pubs" : [{
            "id" : 1,
            "title" : "Guiness pub",
            "description" : "Taste of famous ireland dark beer",
            "type" : "pub",
            "beers" : [
                { "name" : "staropramen", "quality" : "10", "price" : "1"},
                { "name" : "staropramen", "quality" : "12", "price" : "1.20"},
                { "name" : "guiness", "quality" : "12", "price" : "3.50"}
            ],
            "latitude" : 49.223199,
            "longitude" : 18.740010
        },
        {
            "id" : 2,
            "title" : "Meštianská piváreň",
            "description" : "Old times pub",
            "type" : "pub",
            "beers" : [
                { "name" : "krkos", "quality" : "10", "price" : "0.90" },
                { "name" : "jaros", "quality" : "11", "price" : "1.10" },
                { "name" : "makos", "quality" : "12", "price" : "1.50" }
            ],
            "latitude" : 49.223892,
            "longitude" : 18.739520
        }]
    };
};

/*
 * User class
 * TODO user modification form
 */
var User = function(){
    "use strict";
    var CONFIG = new Config();
    this.data = {
        "Tomas" : {
            "id" : 1,
            "name" : "Tomas Chudjak",
            "description" : "This is my current position",
            "type" : "person",
            "latitude" : CONFIG.LAT,
            "longitude" : CONFIG.LNG
        }
    };
};

/**
 * Foursquare integration
 * Class stores info about clientId, clientSecret, latitude and longitude of Zilina
 * query function is used as a seach parameters
 * dataUrl returns quite complicated set of objects
 * dataUrl.response.venues contains array of entries
 */
var Foursquare = function(){
    "use strict";
    var param = "bar";
    this.clientId = '2TC0GHMY3FTKAY5Y3WSXWTYUT3EY0CL11DOTPSD5BELKYDVU';
    this.clientSecret = 'ISIT3PFVCZORCQA0J3YGFOJOQ1C3GUZPUDFUKL3LKGRR4O5N';
    this.zilinaLat = 49.22;
    this.zilinaLng = 18.74;
    //TODO generate dynamic query parameter
    this.query = function(param){
        return param;
    };
    this.dataUrl = "https://api.foursquare.com/v2/venues/search?client_id="+this.clientId+"&client_secret="+this.clientSecret+"&v=20130815&ll="+this.zilinaLat+","+this.zilinaLng+"&query="+this.query(param);
};

/*
 * Main functions
 */
var Neighbour = function(){
    "use strict";

    // set of basic variables
    var NEIGBR = {},
        CONFIG = new Config(),
        USER = new User(),
        FOURSQUARE = new Foursquare(),
        map = new google.maps.Map(CONFIG.CANVAS, CONFIG.mapOptions);

    /**
     * Add markers to the map from json data
     * Knowledge of structure of the json data is critical here !
     */
    NEIGBR.addMarkers = function(data){
        console.log('addmarkers');
        var i = 0,
            //pubs = CONFIG.data.pubs,
            len = data.length,
            marker;
        for(i, len; i < len; i++){
            marker = NEIGBR.createMarker(data[i]);
        }
    };

    /**
     * Create info window for giver marker
     */
    NEIGBR.createInfoWindow = function(marker, data){
        // TODO same solution as in NEIGBR.createMarker function
        var content, infoWindow;
        console.log('createInfoWindow');
        console.log(data);
        // this statement can indicate if we use foursquare object structure or not
        if(data.hasOwnProperty('hereNow')){
            content = '<h2>'+data.name+'</h2><p>'+data.categories[0].name+'</p>';
        }
        else{
            content = '<h2>'+data.name+'</h2><p>'+data.description+'</p>';
        }
        infoWindow = new google.maps.InfoWindow({
            content: content
        });
        marker.addListener('click', function(){
            infoWindow.open(map, marker);
        });
    };

    /**
     * Create map function
     * Adds marker to center position
     */
    NEIGBR.createMap = function(){
        // set marker to center position
        NEIGBR.createMarker(USER.data.Tomas);

    };

    /**
     * Marker function
     * Adds marker to defined latlng parameters in map
     * Return marker object
     */
    NEIGBR.createMarker = function(data){
        var marker;
        // TODO find solution how to use data from foursquare and my own objects
        // 1. formate my json objects to foursquare structure?
        // 2. better filter mechanism?

        console.log('createMarker');
        // this statement can indicate if we use foursquare object structure or not
        if( data.hasOwnProperty('hereNow') && (data.categories[0].name.indexOf("Bar") > -1 || data.categories[0].name.indexOf("Casino") > -1 || data.categories[0].name.indexOf("Pub") > -1)){
            marker = new google.maps.Marker({
                map : map,
                position : {
                    lat : data.location.lat,
                    lng : data.location.lng
                },
                icon : CONFIG.beerImageGray
            });
        }
        else if(data.hasOwnProperty('description')){
            marker = new google.maps.Marker({
                map : map,
                position : {
                    lat : data.latitude,
                    lng : data.longitude
                },
                icon : CONFIG.beerImageYellow
            });
        }
        else {
            return false;
        }
        NEIGBR.createInfoWindow(marker, data);
        return marker;
    };

    /**
     * Gathering datas via jQuery Ajax method
     * Function must return array of entries
     */
    NEIGBR.getJsonData = function(dataUrl){
        // verify foursquare url
        console.log(dataUrl);
        jQuery.ajax({
            url : dataUrl,
            context : document.body,
            dataType : 'json',
            success : function(){
                jQuery.getJSON(dataUrl, function (data) {
                    // array of all entries is stored under response.venues
                    return data;
                });
            },
            error : function(err){
                console.log('shit: ' + err);
            }
        })
        .done(function(data){
            // just check what data goes from the ajax if something goes wrong
            // console.table(data);
            NEIGBR.addMarkers(data.response.venues);
        });
    };

    /**
     * Initialize function - draws map
     */
    NEIGBR.init = function(){
        NEIGBR.createMap();
        NEIGBR.getJsonData(FOURSQUARE.dataUrl);
    };

    return NEIGBR;

}(Neighbour);