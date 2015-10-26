/**
 * Name: Config class
 * Description: Config class to store default variables
 * Project: Neighbour map
 * Course: Udacity Front-end nanodegree
 * Author: Tomas Chudjak
 * Created: 2.9.2015
 * Version: 1.0.0
 *
 */

/* exported Config */

var Config = function(){
    "use strict";

    // console logging true|false
    this.DEBUG = true;
    
    // user session key
    this.SESSION_KEY = 'PifkoSessionKey';

    // general ids
    this.LOGIN_ID = 'login';
    this.APP_ID = 'application';
    this.MAPCANVAS_ID = 'map-canvas';

    // LatLng of Zilina
    this.ZA_LAT = 49.2234;
    this.ZA_LNG = 18.7394;

    // Icons
    this.iconFolder = 'images/icons';
    this.beerImageGray = this.iconFolder + '/beer-gray.png';
    this.beerImageYellow = this.iconFolder + '/beer-yellow.png';
    this.BEER_ICON = this.iconFolder + '/beer-icon-normal.png';
    this.COFFEE_ICON = this.iconFolder + '/coffee-icon-normal.png';
    this.DRINK_ICON = this.iconFolder + '/drink-icon-normal.png';

    // Default google map options
    this.MAPOPTIONS = function(lat, lng){
        var options = {};

        options.center = {};
        options.center.lat = lat;
        options.center.lng = lng;
        options.cscrollwheel = false;
        options.zoom = 18;

        return options;
    };

};
