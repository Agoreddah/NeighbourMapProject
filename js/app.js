/**
 * Name: App class
 * Description: Default and knockout js functions used for the project
 * Project: Neighbour map
 * Course: Udacity Front-end nanodegree
 * Author: Tomas Chudjak
 * Version: 1.0.0
 * 
 * Contains:
 * 	- Knockout js functions and observables
 *  - App specific functions
 *  - Sammy js routing functions
 */

/* globals document, console, localStorage, location, setTimeout, google, ko, Config, Navigation, Map, Foursquare, TweenLite, TimelineLite, Power1, jQuery, Sammy */
/* exported App */

var App = function(){

    "use strict";

    // Simple dependency injection
    var self = this,
        CONFIG = new Config(),
        NAV = new Navigation(),
        FOURSQUARE = new Foursquare(),
        MAP = new Map(),
        GOOGLEMAP;

    ///////////////////////////////////////////////
    //                           				 //
    //   Knockout js functions and observables   //
    //                                           //
    ///////////////////////////////////////////////

    /** DATA contains returned JSON object from Foursquare */
    self.DATA = ko.observableArray([]);
    self.PHOTOS = ko.observableArray([]);
    self.PHOTOS_ALBUM = ko.observableArray([]);
    
    /** PAGER stores current routing value */
    self.ROUTE = ko.observable('login');
    
    /** Information about subpages, in this moment they are more like components */
    self.SUBPAGES = [NAV.SEARCH_SUBPAGE, NAV.MAP_SUBPAGE, NAV.MENU_SUBPAGE];
    self.SUBPAGE = ko.observable(NAV.MAP_SUBPAGE);

    /** chosenPlace stores info about clicked place */
    self.chosenPlace = ko.observable();

    /** search is actived in search place input field */
    self.search = ko.observable('');
    
    /** custom binding to invoke google map after map template is rendered
     *  there have been issues to invoke google maps:
     *  #map-canvas dom node must be present before google scripts are called
     *  Solution is to add attribute data-bind='map' to #map-canvas node  */
    ko.bindingHandlers.map = {
    	init: function () {
    		self.initMap();
    	}
    };
    
    /** similar solution to the pointers animation at the login page,
     *  when the login page is ready, data-bind will trigger pointersAnimation function */
    ko.bindingHandlers.pointers = {
    	init: function(){
    		self.pointersAnimation();
    	}
    };

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
            len = newDATA.length,
            category;
        for (i, len; i < len; ++i){
        	// create marker
        	// self.logger(newDATA[i].categories[0].shortName);
        	category = newDATA[i].categories[0].shortName;
            MAP.createMarker(GOOGLEMAP, newDATA[i], self.defineIcon(category));
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
    
	/**
	 * Function used by the Sammy js to change location has value 
	 */
	self.goToPage = function(page){
    	location.hash = page;
    };
    
    /**
     * Subpages are not handled by the Sammy js (maybe in future)
     * At this moment, I only need to save some info about currently used subpage
     */
    self.gotToSubpage = function(subpage){
    	self.SUBPAGE(subpage);
    };

    ////////////////////////////////
    //                            //
    //   App specific functions   //
    //                            //
    ////////////////////////////////
    
    /**
     *  Not yet defined
     */
    self.activateSubpage = function(data){
    	
    };

	/**
     * Check User session key in local storage.
     * TODO
     * If the value is empty, shows the login-panel
     * if the value is occupied, show directly application-panel
     */
    self.checkUserSessionKey = function(){
        var userSessionKey = self.localStorageGet(CONFIG.SESSION_KEY);
        if(!userSessionKey){
            self.logger('User session key NOT found');
            return false;
        }
        else{
            self.logger('User session key found');
            return true;
            //self.initMap();
        }
    };
    
    /**
     * Render google map function
     * @param latitude, longitude
     */
    self.createMap = function(latitude, longitude){
        GOOGLEMAP = new google.maps.Map(document.getElementById(CONFIG.MAPCANVAS_ID), CONFIG.MAPOPTIONS(latitude,longitude));
        return GOOGLEMAP;
    };
    
    /**
     * Define icon for different category
     * Default icon is BEER_ICON
     * TODO make more appropriate icons selection
     */
    self.defineIcon = function(type){
    	if(type.indexOf('Bar') > -1 || type.indexOf('Cocktail') > -1){
    		return CONFIG.DRINK_ICON;
    	}
    	else if(type.indexOf('Café') > -1){
    		return CONFIG.COFFEE_ICON;
    	}
    	else{
    		return CONFIG.BEER_ICON;
    	}
    };

    /**
     * Animation functions
     * Uses tweenlite js - http://greensock.com/docs/#/HTML5/GSAP/TweenLite/
     */
    self.dropPointer = function(selector, position){
    	self.logger('selector is jumping down ' + selector);
    	var pos = position;
    	var animation = new TimelineLite();
	    animation
	    	.to(selector, 0.45, {top:pos})
	    	.to(selector, 0.15, {y:-15})
	    	.to(selector,0.25, {y:0});
    };
    
    self.pointersAnimation = function(){
    	setTimeout(function() {
			self.dropPointer('.pointer1', "50%");
		}, 1000);
		setTimeout(function() {
			self.dropPointer('.pointer2', "27%");
		}, 1500);
		setTimeout(function() {
			self.dropPointer('.pointer3', "17%");
		}, 2000);
		setTimeout(function() {
			TweenLite.to('.pointer-shadow', 0.35, {
				x: 18,
				y: 8,
				skewX: -46
			});
		}, 2800);
    };
    
    /**
     * Toggle function for sidebars
     * TODO
     * if user clicks the map nav item, all sidebars should disappear
     * if user clicks the menu nav item, .menu sidebar should appear
     * if user clicks the search nav item, .search sidebar should appear
     * if user clicks the single place on the map or via search panel, .single-item sidebar should appear and .search should disappear 
     */
	self.toggleSidebar = function(data, event){
		self.logger('nav item ' + data + ' clicked');
		if(data === NAV.MENU_SUBPAGE){
			self.toggleElement('.'+data, "-100%");
		}
	};
	
	self.toggleElement = function(element, xValue){
		if(jQuery(element).hasClass('toggled')){
			jQuery(element).removeClass('toggled');
			TweenMax.to(element, 0.35, {x:"0%"});
		}
		else{
			TweenMax.to(element, 0.35, {x: xValue});
			jQuery(element).addClass('toggled');
		}
	};
    
    /**
     * Ajax function to get JSON data from Foursquare api
     * FOURSQUARE.dataUrl(lat, lng) is function used for creating proper dataUrl pattern
     * JSON object is stored to self.DATA which is observable with knockout js
     * @param url what returns JSON object
     */
    self.getJSON = function(dataUrl){
    	self.logger(dataUrl);
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
     * Function initializes application page
     * Saves user session TODO create functionality to parse user's positions
     * Save App page to the routing scope
     */
    self.initApplication = function(){
    	self.saveSession(CONFIG.ZA_LAT, CONFIG.ZA_LNG);
    	self.goToPage(NAV.APP_PAGE);
    };

    /**
     * Function initializes map
     * Creates GOOGLEMAP object
     * Requests foursquare json object for current lat lng parameters
     */
    self.initMap = function(){
        // TODO create functionality to parse user's position
        // navigator.geolocation.getCurrentPosition(self.parsePosition);
        self.getJSON(FOURSQUARE.dataUrl(CONFIG.ZA_LAT, CONFIG.ZA_LNG));
        GOOGLEMAP = self.createMap(CONFIG.ZA_LAT,CONFIG.ZA_LNG);
    };

    /**
     * Save data to HTML5 localStorage 
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
     * Get item from HTML5 localStorage 
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
     * Remove item from HTML5 localStorage
     * Key param is the key used in localStorage.setItem(key, value);
     */
    self.localStorageRemove = function(key){
    	var val;
    	try{
    		self.logger('key: ' + key);
    		localStorage.removeItem(key);
    	}catch(e){
    		self.logger('Error in removing data from localStorage: ' + e);	
    	}    	
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
     * Logout function
     * Removes session key from the localStorage
     * User must visit login page first 
     */
    self.logout = function(){
    	self.localStorageRemove(CONFIG.SESSION_KEY);
    	self.goToPage(NAV.LOGIN_PAGE);
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
     * Helper function to remove slovak diacritis
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
     * @param latitude and longitude values
     */
    self.saveSession = function(lat, lng){
        var data = {};
        data.latitude = lat;
        data.longitude = lng;
        jQuery('#userLatitude').val(data.latitude);
        jQuery('#userLongitude').val(data.longitude);
        self.localStorageSet(CONFIG.SESSION_KEY, data);
    };

    /**
     * Only test function
     */
    self.test = function(){
        self.logger('App script works');
    };
    
     ////////////////////////////////////
    //                           	  //
    //   Sammy js routing functions   //
    //                           	  //
    ////////////////////////////////////
    
	new Sammy(function() {
        this.get('#login', function(){
        	self.ROUTE(NAV.LOGIN_PAGE);
        });
        this.get('#application', function(){
        	// check the user session key stored in local storage
        	var userSessionKey = self.checkUserSessionKey();
        	// if session key not found, go to login page
        	if(!userSessionKey){
        		self.goToPage(NAV.LOGIN_PAGE);
        	}
        	// otherwise, stay in application page
        	else{
        		self.ROUTE(NAV.APP_PAGE);
        	}
        });
    }).run('#login');

};