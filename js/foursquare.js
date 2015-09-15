/**
 * Foursquare integration
 * Class stores info about clientId, clientSecret
 * query function is used as a seach parameters
 * dataUrl returns quite complicated set of objects
 * dataUrl.response.venues contains array of entries
 */

/* exported Foursquare */

var Foursquare = function(){
    "use strict";

    /** Basic variables */
    this.foursquareUrl = 'https://api.foursquare.com/v2/venues/';
    this.clientId = '&client_id=2TC0GHMY3FTKAY5Y3WSXWTYUT3EY0CL11DOTPSD5BELKYDVU';
    this.clientSecret = '&client_secret=ISIT3PFVCZORCQA0J3YGFOJOQ1C3GUZPUDFUKL3LKGRR4O5N';
    this.radius = "&radius=1000";

    /**
     * Foursquare category ids
     * https://developer.foursquare.com/docs/explore#req=venues/categories
     * url pattern f.e. &categoryId=4d4b7105d754a06376d81259
     */
    this.NIGHTSPOT_ID = '4d4b7105d754a06376d81259';

    /**
     * change url pattern for given category id
     * TODO create multiple category ids
     */
    this.searchCategory = function(id){
        return '&categoryId='+id;
    };

    /**
     * additional search functionality
     * TODO configure filters
     */
    this.searchQuery = function(param){
        var query;
        if(typeof param === "undefined"){
            query = "";
        }
        else{
            query = '&query='+param;
        }
        return query;
    };

    /**
     * lat and lng parameters need to be modified
     * Foursquare ll url parameter must be of the form XX.XX,YY.YY
     */
    this.numberFix = function(str){
        if(typeof str === "string"){
            str = Number(str);
        }
        return str.toFixed(2);
    };

    /**
     * url returns JSON object of all places inside latlng dimmensions
     * result can be modified by additional search parameter
     * TODO make dynamic searchCategory url parameter
     */
    this.dataUrl = function(lat, lng, param){
        var searchQuery = this.searchQuery(param);
        lat = this.numberFix(lat);
        lng = this.numberFix(lng);
        return this.foursquareUrl + "search?"+this.searchCategory(this.NIGHTSPOT_ID)+this.radius+this.clientId+this.clientSecret+"&v=20130815&ll="+lat+","+lng+searchQuery;
    };

    /**
     * returns JSON object of all photos in current place
     * place is defined via it's unique Foursquare id
     */
    this.photosUrl = function(id){
        return this.foursquareUrl + id+"/photos?"+this.clientId+this.clientSecret+"&v=20130815";
    };

    this.parseAllPhotos = function(photos){
        var album = [],
            i = 0,
            len = photos.count,
            photoUrl;

        for(i, len; i < len; i++){
            photoUrl = this.parsePhotoUrl(photos.items[i]);
            album[i] = photoUrl;
        }

        return album;

    };

    /** https://developer.foursquare.com/docs/responses/photo */
    this.parsePhotoUrl = function(photo){
        var photoUrl = photo.prefix + "300x200" + photo.suffix;
        return photoUrl;
    };

};

