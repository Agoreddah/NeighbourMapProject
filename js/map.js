/**
 * Name: Map class
 * Description: Set of functions to manipulate with google map object
 * Project: Neighbour map
 * Course: Udacity Front-end nanodegree
 * Author: Tomas Chudjak
 * Created: 10.9.2015
 * Version: 1.0.0
 */

/* globals google, Application */
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
        // this statement can indicate if we use foursquare object structure or not
        // TODO Remove Foursquare dependency and create own object data structures
        marker = new google.maps.Marker({
            map : googlemap,
            position : {
                lat : data.location.lat,
                lng : data.location.lng
            },
            animation: google.maps.Animation.DROP,
            icon : category
        });

        this.createInfoWindow(googlemap, marker, data);
        return marker;
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
            /** call the goToPlace function and push this data object to it */
            Application.goToPlace(data);

            /**
             * INFOWINDOW is created as a global object
             * Everytime the click event is called, INFOWINDOW object is getting closed
             * Then the new INFOWINDOW object is created
             */
            INFOWINDOW.close();
            INFOWINDOW = new google.maps.InfoWindow({
                content: MAP.createInfoWindowContent(data)
            });
            INFOWINDOW.open(googlemap, this);
        });
    };

    /**
     * Helper function
     * Data shown in info window are parsed as a HTML elements
     * Then the knockout click binding works properly
     */
    MAP.createInfoWindowContent = function(data){
        var content;
        content ='<div class="info-marker">';
        content +='<h2>'+data.name+'</h2>';
        content +='<p>'+data.categories[0].name+'</p>';
        content +='</div>';
        return content;
    };

    return MAP;

};