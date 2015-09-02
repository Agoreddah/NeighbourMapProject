/*
 * Project: Neighbour map
 * Course: Udacity Front-end nanodegree
 * Author: Tomas Chudjak
 * Created: 2.9.2015
 * Version: 1.0.0
 *
 * define globals for jshint */
 /* global google, document */

/*
 * Configuration function with predefined variables
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
    this.beerImage = 'images/beer-yellow.png';
    this.data = {
        "pubs" : [{
            "id" : 1,
            "title" : "Guiness pub",
            "description" : "Taste of famous ireland dark beer",
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
 * Main function
 */
var Neighbour = function(){
    "use strict";

    // set of basic variables
    var NEIGBR = {},
        CONFIG = new Config(),
        map = new google.maps.Map(CONFIG.CANVAS, CONFIG.mapOptions),
        data;

    /**
     * Add markers to the map from json data
     * Knowledge of structure of the json data is critical here !
     */
    NEIGBR.addMarkers = function(){
        var i = 0,
            pubs = CONFIG.data.pubs,
            len = pubs.length,
            marker;
        for(i, len; i < len; i++){
            marker = NEIGBR.createMarker(pubs[i].title, pubs[i].description, pubs[i].latitude, pubs[i].longitude);
        }
    };

    /**
     * Create info window for giver marker
     */
    NEIGBR.createInfoWindow = function(marker, title, description){
        var content = '<h2>'+title+'</h2><p>'+description+'</p>',
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
        NEIGBR.createMarker('Tomas','it is me here',CONFIG.LAT, CONFIG.LNG);

    };

    /**
     * Marker function
     * Adds marker to defined latlng parameters in map
     * Return marker object
     */
    NEIGBR.createMarker = function(title, description, latitude, longitude){
        var marker = new google.maps.Marker({
            map : map,
            position : {
                lat : latitude,
                lng : longitude
            },
            icon : CONFIG.beerImage
        });
        NEIGBR.createInfoWindow(marker, title, description);
        return marker;
    };

    /**
     * Gathering datas
     */
    NEIGBR.getData = function(){
        data = CONFIG.data;
        return data;
    };

    /**
     * Initialize function - draws map
     */
    NEIGBR.init = function(){
        NEIGBR.createMap();
        NEIGBR.addMarkers();
    };

    return NEIGBR;

}(Neighbour);