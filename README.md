# Webdeveloper nanodegree P5
Welcome at my P5 code example named **Pifko**. 

This single page application shows the bars, pubs and coffee places in the city of Zilina. It's combination of Google Maps Api and Foursquare data layer based on the ajax communication.

1. Installation
2. Application
3. Routing


## Installation
Clone project
```
git clone https://github.com/Agoreddah/NeighbourMapProject.git
```

Install npm
```
npm install
```

Build project via Grunt task runner. *some plugins might be downloaded manually*
```
grunt build-project
```

Move **dist** directory to your hosting or /www server directory

## Application
Project currently shows only predefined area - city of Zilina in Slovak Republic. Hit the button **explore zilina** and see how many bar, pubs and coffee places are located around center.

**Main navigation item**
Shows basic information about the application and the *logout* button

**Map navigation item**
Shows the map of the Zilina

**Search navigation item**
Shows the list of the places with the category name

Items from the list of the places and the google map markers opens the single place information, with heading, contacts and photos.

## Routing
Every first-time user must go directly to #login page. After **explore zilina** button, the user session key is stored to HTML5 localStorage. If the key is stored succesfully, user is able to go directly to #application page. **logout** button removes the user session key from the localStorage and navigate user to the #login page