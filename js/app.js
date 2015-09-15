/**
 * Name: App class
 * Description: Default and knockout js functions used for the project
 * Project: Neighbour map
 * Course: Udacity Front-end nanodegree
 * Author: Tomas Chudjak
 * Created: 10.9.2015
 * Version: 1.0.0
 */

/* globals document, console, localStorage, google, ko, Config, Map, Foursquare, TweenLite, Power1, jQuery */
/* exported App */

var App = function(){

    "use strict";

    // Simple dependency injection
    var self = this,
        CONFIG = new Config(),
        FOURSQUARE = new Foursquare(),
        MAP = new Map(),
        GOOGLEMAP;

    ///////////////////////////////
    //                           //
    //   Knockout js functions   //
    //                           //
    ///////////////////////////////

    /** DATA contains returned JSON object from Foursquare */
    self.DATA = ko.observableArray([]);
    self.PHOTOS = ko.observableArray([]);
    self.PHOTOS_ALBUM = ko.observableArray([]);

    /** chosenPlace stores info about clicked place */
    self.chosenPlace = ko.observable();

    /** search is actived in search place input field */
    self.search = ko.observable('');

    /**
     * self.DATA is original object from JSON response
     * this object is getting filtered when the self.search method is called
     * We use arrayFilter to filter self.DATA by the given string stored in self.search()
     */
    self.filteredData = ko.computed(function () {
        var filter = self.search();
        if (!filter) {
            return self.DATA();
        } else {
          return ko.utils.arrayFilter(self.DATA(), function (item) {
                // remove Uppercase and diacritics from the item names and search string
                var place = item.name,
                    loweredPlace = place.toLowerCase(),
                    loweredFilter = filter.toLowerCase(),
                    rawPlace = self.removeDiacritics(loweredPlace),
                    rawFilter = self.removeDiacritics(loweredFilter);

                if(rawPlace.indexOf(rawFilter) > -1){
                    return item;
                }
            });
        }
    });


    /**
     * When the DATA are update from given JSON response, each entry creates the map marker
     */
    self.DATA.subscribe(function(newDATA){
        var i = 0,
            len = newDATA.length;
        for (i, len; i < len; ++i){
            MAP.createMarker(GOOGLEMAP, newDATA[i]);
        }
        self.filteredData(newDATA);
    });

    self.PHOTOS.subscribe(function(newPhotos){
        var album = FOURSQUARE.parseAllPhotos(newPhotos);
        self.PHOTOS_ALBUM(album);
    });

    /**
     * Knockout method used as a router
     * Multiple instances can call this method, save place object to it
     * Then the other instance can update itself by this place object data
     */
    self.goToPlace = function(place){
        self.chosenPlace(place);
        var photosUrl = FOURSQUARE.photosUrl(place.id);
        self.logger('Photos url: '+photosUrl);
        self.getJSON(photosUrl);
    };

    ////////////////////////////////
    //                            //
    //   App specific functions   //
    //                            //
    ////////////////////////////////

    /**
     * Render google map function
     * @param latitude, longitude
     */
    self.createMap = function(latitude, longitude){
        GOOGLEMAP = new google.maps.Map(document.getElementById(CONFIG.MAPCANVAS_ID), CONFIG.MAPOPTIONS(latitude,longitude));
        return GOOGLEMAP;
    };

    /**
     * Ajax function to get JSON data from Foursquare api
     * FOURSQUARE.dataUrl(lat, lng) is function used for creating proper dataUrl pattern
     * JSON object is stored to self.DATA which is observable with knockout js
     * @param url what returns JSON object
     */
    self.getJSON = function(dataUrl){
        jQuery.getJSON(dataUrl, function(data){
            var places, photos;

            /** check for places */
            if(data.response.hasOwnProperty('venues')){
                places = data.response.venues;
                self.DATA(places);
                self.logger(self.DATA);
            }
            /** check for photos */
            else if(data.response.hasOwnProperty('photos')){
                photos = data.response.photos;
                self.PHOTOS(photos);
                self.logger(self.PHOTOS);
            }
            else{
                self.logger('error, nothing has returned');
            }
        });
    };

    /**
     * Animation functions
     * Uses tweenlite js - http://greensock.com/docs/#/HTML5/GSAP/TweenLite/
     */
    self.fadeOut = function(selector){
        self.logger('selector fades out: '+ selector);
        TweenLite.to(
            selector,
            0.35,
            {"scale":"0.4","opacity":"0","display":"none",ease:Power1.easeOut}
        );
    };

    self.fadeIn = function(selector){
        self.logger('selector fades in: '+ selector);
        TweenLite.to(
            selector,
            0.35,
            {"scale":"1","opacity":"1","display":"block",ease:Power1.easeOut,delay:0.35}
        );
    };

    /**
     * This function initializes page
     */
    self.initMap = function(){
        GOOGLEMAP = self.createMap(CONFIG.ZA_LAT,CONFIG.ZA_LNG);
        self.savePosition(CONFIG.ZA_LAT, CONFIG.ZA_LNG);
        // TODO create functionality to parse user's position
        // navigator.geolocation.getCurrentPosition(self.parsePosition);
        self.getJSON(FOURSQUARE.dataUrl(49.22, 18.74));
        self.fadeOut(document.getElementById(CONFIG.LOGIN_ID));
    };

    /**
     * Save data to HTML5 Storage
     * Key is the name of the stored data and will be used as a search parameter
     */
    self.localStorageSet = function(key, data){
        try{
            self.logger('key: ' + key + ' data: ' + JSON.stringify(data));
            localStorage.setItem(key, JSON.stringify(data));
        }catch(e){
            self.logger('Error in setting data to localStorage: ' + e);
        }
    };

    /**
     * Get item from HTML5 Storage
     * Key is used as a search parameter
     */
    self.localStorageGet = function(key){
        var val;
        try{
            self.logger('key: '+ key);
            val = localStorage.getItem(key);
        }catch(e){
            self.logger('Error in getting data from localStorage: ' + e);
        }
        return val;
    };

    /**
     * CONFIG.DEBUG logging
     * set CONFIG.DEBUG var true or false to show console log outputs
     * @param message what will be the output of console.log();
     */
    self.logger = function(message){
        if(CONFIG.DEBUG === true && typeof console === "object" ){
            console.log(message);
        }
    };

    /**
     * DEPRECATED
     * Helper function to parse getCurrentPosition()
     * TODO create get current user position functionality
     */
    self.parsePosition = function(position){
        var data = {};
        // simple logging
        self.logger('lat: '+position.coords.latitude);
        self.logger('lng: '+position.coords.longitude);
        // define lat and lng
        data.latitude = position.coords.latitude;
        data.longitude = position.coords.longitude;
        // save lat and lng to localStorage and hidden inputs
        self.savePosition(data);
        // Render map
        GOOGLEMAP = self.createMap(data.latitude, data.longitude);
        // Get data from foursquare API
        self.getData(data.latitude, data.longitude);
    };

    /**
     * Helper function to remove diacritis
     * It's useful during the search activity
     */
    self.removeDiacritics = function(str){
        str = str.replace(new RegExp('č'), 'c');
        str = str.replace(new RegExp('ď'), 'd');
        str = str.replace(new RegExp('ť'), 't');
        str = str.replace(new RegExp('ň'), 'n');
        str = str.replace(new RegExp('ž'), 'z');
        str = str.replace(new RegExp('š'), 's');
        str = str.replace(new RegExp('[ľĺ]', 'g'), 'l');
        str = str.replace(new RegExp('[áä]', 'g'), 'a');
        str = str.replace(new RegExp('[éě]', 'g'), 'e');
        str = str.replace(new RegExp('í'), 'i');
        str = str.replace(new RegExp('[óô]', 'g'), 'o');
        str = str.replace(new RegExp('ú'), 'u');
        str = str.replace(new RegExp('ý'), 'y');
        return str;
    };

    /**
     * Save position data to localStorage and to hidden inputs
     * @param Object 'User' with predefined latitude and longitude values
     */
    self.savePosition = function(lat, lng){
        var data = {};
        data.latitude = lat;
        data.longitude = lng;
        jQuery('#userLatitude').val(data.latitude);
        jQuery('#userLongitude').val(data.longitude);
        self.localStorageSet('User',data);
    };

    /**
     * Checking User value in local storage.
     * If the value is empty, shows the login-panel
     * if the value is occupied, show directly application-panel
     */
    self.showPage = function(){
        var user = self.localStorageGet('User');
        if(!user){
            self.logger('User key not found');
            self.fadeIn(document.getElementById(CONFIG.LOGIN_ID));
        }
        else{
            self.logger('User key founded');
            self.initMap();
            //self.fadeIn(document.getElementById(CONFIG.APP_ID));
        }
    };

    /**
     * Only test function
     */
    self.test = function(){
        self.logger('App script works');
    };

};