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
 * 
 * Animation functions use tweenlite js - http://greensock.com/docs/#/HTML5/GSAP/TweenLite/
 */
/* globals document, console, localStorage, location, setTimeout, window, google, ko, Config, Navigation, Map, Foursquare, TweenLite, TimelineLite, Power1, jQuery, Sammy */
/* exported App */
var App = function() {

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
    self.DATA = ko.observableArray();
    self.PHOTOS = ko.observableArray();
    self.PHOTOS_ALBUM = ko.observableArray();

    /** MARKERS stores selecter users markers */
    self.MARKERS = ko.observableArray();
    self.ACTIVE_MARKERS = ko.observableArray();
    self.VISIBLE_MARKERS = ko.observableArray();

    /** PAGER stores current routing value */
    self.ROUTE = ko.observable('login');

    /** Information about subpages, in this moment they are more like components */
    self.SUBPAGES = [NAV.MENU_SUBPAGE, NAV.MAP_SUBPAGE, NAV.SEARCH_SUBPAGE];
    self.SUBPAGE = ko.observable(NAV.MAP_SUBPAGE);

    /** chosenPlace stores info about clicked place */
    self.chosenPlace = ko.observable();

    /** search is actived in search place input field */
    self.search = ko.observable('');

    /** Error message observable */
    self.error = ko.observable();

    /** custom binding to invoke google map after map template is rendered
     *  there have been issues to invoke google maps:
     *  #map-canvas dom node must be present before google scripts are called
     *  Solution is to add attribute data-bind='map' to #map-canvas node  */
    ko.bindingHandlers.map = {
        init: function() {
            self.initMap();
        }
    };

    /** similar solution to the pointers animation at the login page,
     *  when the login page is ready, data-bind will trigger pointersAnimation function */
    ko.bindingHandlers.pointers = {
        init: function() {
            self.pointersAnimation();
        }
    };

    /**
     * self.DATA is original object from JSON response
     * this object is getting filtered when the self.search method is called
     * We use arrayFilter to filter self.DATA by the given string stored in self.search()
     * #Fixed ko.computable bug. Read and write options has been missing
     */
    self.filteredData = ko.computed({
        read: function() {
            var filter = self.search();
            if (!filter) {
                // show all markers
                MAP.markerShowAll(self.MARKERS());
                return self.DATA();
            } else {
                //hide all markers first    
                MAP.markerHideAll(self.MARKERS());

                return ko.utils.arrayFilter(self.DATA(), function(item) {
                    // remove Uppercase and diacritics from the item names and search string
                    var place = item.name,
                        loweredPlace = place.toLowerCase(),
                        loweredFilter = filter.toLowerCase(),
                        rawPlace = self.removeDiacritics(loweredPlace),
                        rawFilter = self.removeDiacritics(loweredFilter);

                    if (rawPlace.indexOf(rawFilter) > -1) {
                        var i = 0,
                            len = self.MARKERS().length;

                        // show only searched marker
                        for (i, len; i < len; i++) {
                            if (self.MARKERS()[i].id === item.id) {
                                MAP.markerShow(self.MARKERS()[i]);
                            }
                        }

                        // return searched item
                        return item;
                    }
                });
            }
        },
        write: function() {},
        owner: this
    });



    /**
     * When the DATA are updated from given JSON response, 
     * each entry creates the map marker
     */
    self.DATA.subscribe(function(newDATA) {
        var i = 0,
            len = newDATA.length,
            category;

        for (i, len; i < len; ++i) {
            // create marker
            // self.logger(newDATA[i].categories[0].shortName);
            category = newDATA[i].categories[0].shortName;

            // get marker object and store it to self.MARKERS observable via helper function
            var marker = MAP.createMarker(GOOGLEMAP, newDATA[i], self.defineIcon(category));
            self.storeMarker(marker);
        }
        self.filteredData(newDATA);
    });

    /**
     * When PHOTOS are updated from given JSON response,
     * each entry creates PHOTOS_ALBUM observable with array of foursquare photos
     */
    self.PHOTOS.subscribe(function(newPhotos) {
        var album = FOURSQUARE.parseAllPhotos(newPhotos);
        self.PHOTOS_ALBUM(album);
    });

    /**
     * When the ACTIVE_MARKERS observable array is updated
     * Animation of all markers is set to null
     * Only markers from ACIVE_MARKERS observable array are bounced 
     */
    self.ACTIVE_MARKERS.subscribe(function(activeMarkers) {
        // set animation to null for all markers
        MAP.markersStopBounce(self.MARKERS());
        // center marker
        if (activeMarkers.length > 0) {
            MAP.centerMarker(GOOGLEMAP, activeMarkers[0]);
        }
        // bounce only active markers
        MAP.markersStartBounce(self.ACTIVE_MARKERS());
    });

    /**
     * Knockout method used as a router
     * Multiple instances can call this method, save place object to it
     * Then the other instance can update itself by this place object data
     * openWidget function creates the animation
     * add place's marker id to ACTIVE_MARKERS observable array
     */
    self.goToPlace = function(place) {
        self.chosenPlace(place);
        var photosUrl = FOURSQUARE.photosUrl(place.id);
        self.logger('Photos url: ' + photosUrl);
        self.getJSON(photosUrl);
        self.openWidget('.widget-single-place');
        self.addActiveMarker(place.id);
    };

    /**
     * Function used by the Sammy js to change location has value 
     */
    self.goToPage = function(page) {
        location.hash = page;
    };

    /**
     * Subpages are not handled by the Sammy js (maybe in the future)
     * At this moment, I only need to save some info about currently used subpage
     */
    self.gotToSubpage = function(subpage) {
        self.SUBPAGE(subpage);
    };

    /**
     * Add marker to ACTIVE_MARKERS observable array
     * Bit complex, but offers a possibility to add marker directly as a object
     * or add marker via it's id. Function checks the MARKERS observable array
     * and finds the marker via it's id value
     * @param marker - marker object reference or marker id value
     */
    self.addActiveMarker = function(markerId) {
        var i = 0,
            len = self.MARKERS().length;

        if (typeof(markerId) === "string") {
            for (i, len; i < len; i++) {
                if (self.MARKERS()[i].id === markerId) {
                    self.ACTIVE_MARKERS.push(self.MARKERS()[i]);
                }
            }
        } else {
            // failed results, do nothing
        }
    };

    /**
     * Remove marker from ACTIVE_MARKERS observable array
     * @param marker - marker object reference 
     */
    self.removeActiveMarker = function(marker) {
        // knockout js way		
        self.ACTIVE_MARKERS.remove(marker);
        // javascript way
        // var i = self.ACTIVE_MARKERS.indexOf(marker);
        // if( i !== -1 ){self.ACTIVE_MARKERS.splice(i, 1);}
    };

    /**
     * Remove all markers from ACTIVE_MARKERS observable array 
     */
    self.removeAllActiveMarkers = function() {
        self.ACTIVE_MARKERS.removeAll();
    };

    ////////////////////////////////
    //                            //
    //   App specific functions   //
    //                            //
    ////////////////////////////////

    /**
     * Check User session key in local storage.
     * If the value is empty, shows the login-panel
     * if the value is occupied, show directly application-panel
     */
    self.checkUserSessionKey = function() {
        var userSessionKey = self.localStorageGet(CONFIG.SESSION_KEY);
        if (!userSessionKey) {
            self.logger('User session key NOT found');
            return false;
        } else {
            self.logger('User session key found');
            return true;
        }
    };

    /**
     * Render google map function
     * @param latitude, longitude
     */
    self.createMap = function(latitude, longitude) {
        GOOGLEMAP = new google.maps.Map(document.getElementById(CONFIG.MAPCANVAS_ID), CONFIG.MAPOPTIONS(latitude, longitude));
        GOOGLEMAP.setOptions({
            styles: CONFIG.MAPSTYLES
        });
        return GOOGLEMAP;
    };

    /**
     * Define icon for different category
     * Default icon is BEER_ICON
     * TODO make more appropriate icons selection
     */
    self.defineIcon = function(type) {
        if (type.indexOf('Bar') > -1 || type.indexOf('Cocktail') > -1) {
            return CONFIG.DRINK_ICON;
        } else if (type.indexOf('Café') > -1) {
            return CONFIG.COFFEE_ICON;
        } else {
            return CONFIG.BEER_ICON;
        }
    };

    /**
     * Login page drop pointer animation
     * @param selector - pointer's selector
     * @param positionX - X axis where pointer should drop
     */
    self.dropPointer = function(selector, positionX) {
        self.logger('selector is jumping down ' + selector);
        var posX = positionX;
        var animation = new TimelineLite();
        animation
            .to(selector, 0.45, {
                top: posX
            })
            .to(selector, 0.15, {
                y: -15
            })
            .to(selector, 0.25, {
                y: 0
            });
    };

    /**
     * Full pointers animation
     * Pointers are dropping one by one
     * At the end they put shadow 
     */
    self.pointersAnimation = function() {
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
     * Error message function
     * Fills error observable
     * @param text - string 
     */
    self.errorMessage = function(text) {
        self.error(text);
        self.openMessage(text);
        self.logger('error: ' + text);
    };

    /**
     * TODO message management
     * Open message function
     * @param text - string 
     */
    self.openMessage = function(text) {
        jQuery('.error-text').text(text);
        jQuery('.error-message').css('display', 'block');
    };

    /**
     * Close message function
     * @param text - string 
     */
    self.closeMessage = function() {
        jQuery('.error-message').hide();
    };

    /**
     * Toggle function for sidebars
     * TODO early draft idea, create better UX
     * if user clicks the map nav item, all sidebars should disappear
     * if user clicks the menu nav item, .menu sidebar should appear
     * if user clicks the search nav item, .search sidebar should appear
     * if user clicks the single place on the map or via search panel, .single-item sidebar should appear and .search should disappear 
     *
     * ToggleSidebar function
     * Bottom navigation panel action and sidebars reaction behavior
     * */
    self.toggleSidebar = function(data) {
        self.logger('nav item ' + data + ' clicked');
        // if we click menu nav item, sidebar left should toggle, sidebar right should hide
        if (data === NAV.MENU_SUBPAGE) {
            self.toggleElement('.sidebar-left', "-100%");
            self.hideElement('.sidebar-right', "100%");
        }
        // if we click map nav item, both sidebars should hide
        else if (data === NAV.MAP_SUBPAGE) {
            self.hideElement('.sidebar-left', "-100%");
            self.hideElement('.sidebar-right', "100%");
        }
        // if we click search nav item, sidebar left should hide, sidebar right should toggle
        else if (data === NAV.SEARCH_SUBPAGE) {
            self.hideElement('.sidebar-left', "-100%");
            self.toggleElement('.sidebar-right', "100%");
        }
    };

    /**
     * Right sidebar contains 2 widgets
     * The Search Widget and The Single Place Widget
     * The Search Widget should hide to the left side
     * The Single Place Widget should hide to the right side
     * Each of them contains data-position attribute with values 100%|-100%
     * Values are used as a X axis parameter where the widget will hide
     * Basic X position is 0%
     * @param widget - widget's selector 
     */
    self.openWidget = function(widget) {
        self.showElement('.sidebar-right', "0%");
        self.hideElement('.sidebar-left', "-100%");
        if (jQuery(widget).hasClass('toggled')) {
            var position, sibling;
            sibling = jQuery(widget).siblings();
            position = jQuery(sibling).attr('data-position');
            self.showElement(widget, "0%");
            self.hideElement(sibling, position);
        }
    };

    /**
     * Back to search widget function
     * Closes all opened infowindows
     * Removes all active markers from ACTIVE_MARKERS observable array
     * @param data - data parsed via knockout js
     * @param event - event info parsed via knockout js 
     */
    self.backToTheList = function() {
        self.removeAllActiveMarkers();
        MAP.closeInfoWindows();
        self.openWidget('.widget-search-places');
    };

    /**
     * Toggle element function
     * If the element is toggled, it contains same named class
     * Basix X position is 0%
     * @param element - selector
     * @param xValue - X axis value where elements will hide (100% right|-100% left) 
     */
    self.toggleElement = function(element, xValue) {
        if (jQuery(element).hasClass('toggled')) {
            self.showElement(element, "0%");
        } else {
            self.hideElement(element, xValue);
        }
    };

    /**
     * Animation function
     * @param element - selector
     * @param xValue - X axis value where elements will animate (100% right|-100% left)
     */
    self.animateElement = function(element, xValue) {
        TweenLite.to(element, 0.35, {
            x: xValue,
            ease: Power1.easeOut
        });
    };

    /**
     * Hide function
     * @param element - selector
     * @param xValue - X axis value where elements will hide (100% right|-100% left)
     */
    self.hideElement = function(element, xValue) {
        jQuery(element).addClass('toggled');
        self.animateElement(element, xValue);
    };

    /**
     * Show function
     * @param element - selector
     * @param xValue - X axis value where elements will show (100% right|-100% left)
     */
    self.showElement = function(element, xValue) {
        jQuery(element).removeClass('toggled');
        self.animateElement(element, xValue);
    };

    /**
     * Ajax function to get JSON data from Foursquare api
     * FOURSQUARE.dataUrl(lat, lng) is function used for creating proper dataUrl pattern
     * JSON object is stored to self.DATA which is observable with knockout js
     * @param url what returns JSON object
     */
    self.getJSON = function(dataUrl) {
        self.logger(dataUrl);

        return jQuery.getJSON(dataUrl, function() {

            })
            .done(function(data) {
                self.logger('success: ' + dataUrl);
                self.saveData(data);
            })
            .fail(function() {
                self.errorMessage(CONFIG.ERROR_MSG);
            });
    };

    self.saveData = function(data) {
        // check if we save photos
        if (data.response.hasOwnProperty('photos')) {
            var photos = data.response.photos;
            self.PHOTOS(photos);
            self.logger(self.PHOTOS);
        }
        // check if we save places
        else if (data.response.hasOwnProperty('venues')) {
            var places = data.response.venues;
            self.DATA(places);
            self.logger(self.DATA);
        } else {
            self.errorMessage(CONFIG.ERROR_MSG);
        }
    };

    /**
     * Function initializes application page
     * Saves user session TODO create functionality to parse user's positions
     * Save App page to the routing scope
     */
    self.initApplication = function() {
        self.saveSession(CONFIG.ZA_LAT, CONFIG.ZA_LNG);
        self.goToPage(NAV.APP_PAGE);
    };

    /**
     * Function initializes map
     * Creates GOOGLEMAP object
     * Requests foursquare json object for current lat lng parameters
     */
    self.initMap = function() {
        // TODO create functionality to parse user's position
        // navigator.geolocation.getCurrentPosition(self.parsePosition);        

        // get data from Foursquare
        self.getJSON(FOURSQUARE.dataUrl(CONFIG.ZA_LAT, CONFIG.ZA_LNG));

        // if DOM and google scripts is ready, create google map
        if (jQuery('#map-canvas').length && typeof window.google !== "undefined") {
            GOOGLEMAP = self.createMap(CONFIG.ZA_LAT, CONFIG.ZA_LNG);
        }
    };

    /**
     * Save data to HTML5 localStorage 
     * Key is the name of the stored data and will be used as a search parameter
     */
    self.localStorageSet = function(key, data) {
        try {
            self.logger('key: ' + key + ' data: ' + JSON.stringify(data));
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            self.logger('Error in setting data to localStorage: ' + e);
        }
    };

    /**
     * Get item from HTML5 localStorage 
     * Key is used as a search parameter
     */
    self.localStorageGet = function(key) {
        var val;
        try {
            self.logger('key: ' + key);
            val = localStorage.getItem(key);
        } catch (e) {
            self.logger('Error in getting data from localStorage: ' + e);
        }
        return val;
    };

    /**
     * Remove item from HTML5 localStorage
     * Key param is the key used in localStorage.setItem(key, value);
     */
    self.localStorageRemove = function(key) {
        try {
            self.logger('key: ' + key);
            localStorage.removeItem(key);
        } catch (e) {
            self.logger('Error in removing data from localStorage: ' + e);
        }
    };

    /**
     * CONFIG.DEBUG logging
     * set CONFIG.DEBUG var true or false to show console log outputs
     * @param message what will be the output of console.log();
     */
    self.logger = function(message) {
        if (CONFIG.DEBUG === true && typeof console === "object") {
            console.log(message);
        }
    };

    /**
     * Logout function
     * Removes session key from the localStorage
     * User must visit login page first 
     */
    self.logout = function() {
        self.localStorageRemove(CONFIG.SESSION_KEY);
        self.goToPage(NAV.LOGIN_PAGE);
    };

    /**
     * DEPRECATED
     * Helper function to parse getCurrentPosition()
     * TODO create get current user position functionality
     */
    self.parsePosition = function(position) {
        var data = {};
        // simple logging
        self.logger('lat: ' + position.coords.latitude);
        self.logger('lng: ' + position.coords.longitude);
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
    self.removeDiacritics = function(str) {
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
    self.saveSession = function(lat, lng) {
        var data = {};
        data.latitude = lat;
        data.longitude = lng;
        jQuery('#userLatitude').val(data.latitude);
        jQuery('#userLongitude').val(data.longitude);
        self.localStorageSet(CONFIG.SESSION_KEY, data);
    };

    /**
     * Store created marker to self.MARKERS observable array
     * Store created marker to self.VISIBLE_MARKERS observable array
     * this will help to manage marker actions
     * @param marker - marker object reference 
     */
    self.storeMarker = function(marker) {
        self.MARKERS.push(marker);
        self.VISIBLE_MARKERS.push(marker);
    };

    /**
     * Only test function
     */
    self.test = function() {
        self.logger('App script works');
    };

    ////////////////////////////////////
    //                           	  //
    //   Sammy js routing functions   //
    //                           	  //
    ////////////////////////////////////

    /**
     * Requires Sammy js
     * Must be placed down after all other required functions are described
     * #login is the first page user must visit 
     */
    new Sammy(function() {
        this.get('#login', function() {
            self.ROUTE(NAV.LOGIN_PAGE);
        });
        this.get('#application', function() {
            // check the user session key stored in local storage
            var userSessionKey = self.checkUserSessionKey();
            // if session key not found, go to login page
            if (!userSessionKey) {
                self.goToPage(NAV.LOGIN_PAGE);
            }
            // otherwise, stay in application page
            else {
                self.ROUTE(NAV.APP_PAGE);
            }
        });
    }).run('#login');

};