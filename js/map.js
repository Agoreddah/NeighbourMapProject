/**
 * Name: Map class
 * Description: Set of functions to manipulate with google map object
 * Project: Neighbour map
 * Course: Udacity Front-end nanodegree
 * Author: Tomas Chudjak
 * Created: 10.9.2015
 * Version: 1.0.0
 */

/* globals google, setTimeout, Application */
/* exported Map, google */

var Map = function(){
    "use strict";

    var MAP = {},
        INFOWINDOW = new google.maps.InfoWindow({});

    /**
     * Create google map marker
     * @param googlemap - google map object
     * @param data - data object we want to display in google map
     * @param category - url value to specific category icon
     */
    MAP.createMarker = function(googlemap, data, category){
        var marker;

        marker = new google.maps.Marker({
            map : googlemap,
            id : data.id,
            position : {
                lat : data.location.lat,
                lng : data.location.lng
            },
            animation: google.maps.Animation.DROP,
            icon : category
        });

		// let's create marker animation
		this.createMarkerAnimation(googlemap, marker);
		// let's create info window
        this.createInfoWindow(googlemap, marker, data);
        return marker;
    };
    
    /**
     * Create marker animation
     * @param googlemap - google map object
     * @param marker - marker object reference 
     */
    MAP.createMarkerAnimation = function(googlemap, marker){
    	google.maps.event.addListener(marker, 'click', function(){    		
    		// remove all active markers from the ACTIVE_MARKERS observable array
    		Application.removeAllActiveMarkers();
    		
    		// set marker to the center of the screen
    		MAP.centerMarker(googlemap, marker);
    		
    		setTimeout(function(){
    			// single bounce animation
    			MAP.markerBounceStart(marker);
    		}, 350);
    	});
    };
    
    /**
     * Center screen to marker position
     * @param google map - google map object
     * @param marker - marker object reference 
     */
    MAP.centerMarker = function(googlemap, marker){
    	var position = {
    		lat : marker.position.lat(),
    		lng : marker.position.lng()
    	};
    	googlemap.panTo(position);
    };
    
    /**
     * Single bounce animation
     * Add bouncing effect to the marker
     * @param marker - marker object reference 
     */
    MAP.markerBounceStart = function(marker){
    	marker.setAnimation(google.maps.Animation.BOUNCE);
    };
    
    /**
     * Remove bouncing effect from the marker
     * @param marker - marker object reference 
     */
    MAP.markerBounceStop = function(marker){
    	marker.setAnimation(null);
    };
    
    /**
     * Show marker on the map
     * @param marker - marker object reference 
     */
    MAP.markerShow = function(marker){
    	marker.setVisible(true);
    };

    /**
     * Hide all markers on the map
     * @param markersArr - observable array with all markers 
     */
    MAP.markerShowAll = function(markersArr){
    	var i = 0, 
    		len = markersArr.length;
    	for(i, len; i < len; i++){
    		MAP.markerShow(markersArr[i]);
    	}
    };
    
    /**
     * Hide marker on the map
     * @param marker - marker object reference 
     */
    MAP.markerHide = function(marker){
    	marker.setVisible(false);
    };
    
    /**
     * Hide all markers on the map
     * @param markersArr - observable array with all markers 
     */
    MAP.markerHideAll = function(markersArr){
    	var i = 0, 
    		len = markersArr.length;
    	for(i, len; i < len; i++){
    		MAP.markerHide(markersArr[i]);
    	}
    };
    
    /**
     * Multiple bounce animation
     * All markers from the given array object will START bouncing
     * @param markers - array of the markers 
     */
    MAP.markersStartBounce = function(markers){
    	var i = 0,
    		len = markers.length;
    	for( i; i < len ; i++){
    		this.markerBounceStart(markers[i]);
    	}
    };
    
    /**
     * All markers from the given array object will STOP bouncing
     * @param markers - array of the markers 
     */
    MAP.markersStopBounce = function(markers){
    	var i = 0,
    		len = markers.length;
    	for( i; i < len ; i++){
    		this.markerBounceStop(markers[i]);
    	}
    };

    /**
     * Create info window on google map
     * TODO remove click listener from the function
     * @param googlemap - google map object
     * @param marker - marker which is linked with info window
     * @param data - data object we want to display in google map
     */
    MAP.createInfoWindow = function(googlemap, marker, data){
        marker.addListener('click', function(){
            // call the goToPlace function and push this data object to it
            Application.goToPlace(data);
            
            // INFOWINDOW is created as a global object
            // Everytime the click event is called, INFOWINDOW object is getting closed
           	// Then the new INFOWINDOW object is created            
            MAP.closeInfoWindows();
            
            INFOWINDOW = new google.maps.InfoWindow({
                content: MAP.createInfoWindowContent(data)
            });
            INFOWINDOW.open(googlemap, this);
        });
    };
    
    /**
     * Close all info windows on the map
     * Single function to access this action from outside 
     */
    MAP.closeInfoWindows = function(){
    	INFOWINDOW.close();
    };

    /**
     * Helper function
     * Data shown in info window are parsed as a HTML elements
     * Then the knockout click binding works properly
     */
    MAP.createInfoWindowContent = function(data){
        var content;
        content ='<div class="info-marker">';
        content +='<h3 class="marker-title">'+data.name+'</h3>';
        content +='<p class="marker-description">'+data.categories[0].name+'</p>';
        content +='</div>';
        return content;
    };

    return MAP;

};