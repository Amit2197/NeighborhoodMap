"use strict";
let map;
let Markers = [];

// Foursquare Api Client_id and Client_Secret
const CLIENT_ID = "3W304TLIFAEP22EEWEPH2MMOAO23EVRXHZV3YC03L2T223II";
const CLIENT_SECRET = "YZN1IPH5RFDI5QU3XHFGNWM454KFFM4V35M0PM3B0DO5IFJE";

// List of locations
const locations = [
    {title: "Gandhi Maidan", location: {lat: 25.61687950677165, lng: 85.14579687308226}},
    {title: "Eden Garden", location: {lat: 22.564541597977065, lng: 88.34329605102539}},
    {title: "City Palace, Jaipur", location: {lat: 26.925489271497494, lng: 75.82434552309178}},
    {title: "Badrinath Temple", location: {lat: 30.53988935917844, lng: 79.5290612332611}},
    {title: "Qutb Minar", location: {lat: 28.525265048263833, lng: 77.18659304744011}},
    {title: "Dr. B.C. Roy Engineering College, Durgapur", location: {lat: 23.542869953024006, lng: 87.34426239748105}}
];

//Initialized Map
function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: 26.285822456, lng: 82.228892521},
        zoom: 6.2
    });
    ko.applyBindings(new AppViewModel());
}

// google error handling
const errMap = function () {
    alert('sorry,\n Check Your Internet Connection or Come back later.');
};

// Initialize data
function Location(data) {
    let self = this;
    self.title = data.title;
    self.position = data.location;
    this.marker = ko.observable();
}

// AppViewModel
function AppViewModel() {
    let self = this;
    self.filter = ko.observable('');

    // Style the markers a bit. This will be our listing marker icon.
    const defaultIcon = makeMarkerIcon('0091ff');

    // Create a "highlighted location" marker color for when the user
    // mouses over the marker
    const highlightedIcon = makeMarkerIcon('FFFF24');

    const largeInfowindow = new google.maps.InfoWindow();

    // The following fetch location array to create an array of data on initialize.
    locations.forEach(function (i) {
        let location = new Location(i);

        // Create a marker per location, and put into locationlist.
        let marker = new google.maps.Marker({
            position: i.location,
            map: map,
            title: i.title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i
        });

        // Create an onclick event to open the large infowindow at each marker.
        marker.addListener('click', function () {
            populateInfoWindow(marker, location.title, location.position, largeInfowindow, defaultIcon, highlightedIcon);
        });
        location.marker = marker;

        // Push the location to our array of locationlist.
        Markers.push(location);
    });

    // text input field filters the map markers and list items to locations matching.
    self.places = ko.computed(function () {
        let filter = self.filter().toLowerCase();
        if (!filter) {
            ko.utils.arrayForEach(Markers, function (item) {
                item.marker.setVisible(true);
            });
            return Markers;
        } else {
            return ko.utils.arrayFilter(Markers, function (item) {
                let result = (item.title.toLowerCase().search(filter) >= 0);
                // close all infowindow when open
                largeInfowindow.close();
                item.marker.setVisible(result);
                return result;
            });
        }
    });

    // Clickable event on list to open the large Infowindow at each marker.
    self.showplace = function (clickedLoc) {
        populateInfoWindow(clickedLoc.marker, clickedLoc.title, clickedLoc.position, largeInfowindow, defaultIcon, highlightedIcon);
    };
}

// populated infowindow
function populateInfoWindow(marker, title, position, infowindow, defaultIcon, highlightedIcon) {
    map.setCenter(position);

    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {

        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('');
        infowindow.marker = marker;

        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {
            marker.setIcon(defaultIcon);
            infowindow.marker = null;
        });

        // Foursquare Api url
        let searchurl = 'https://api.foursquare.com/v2/venues/';
        let searchendpoint = 'search?client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&ll=' + position.lat + ',' + position.lng + '&query=' + title + '&v=20181204';

        // Wikipedia Api to load content.
        $.ajax({
            url: 'https://en.wikipedia.org/w/api.php',
            data: {
                action: 'query',
                prop: 'extracts',
                titles: title,
                format: 'json',
                exsentences: 1,
                formatversion: 2
            },
            dataType: 'jsonp',

            // success handling
            success: function (x) {
                let url = x['query']['pages'][0];
                let description = url['extract'];

                // FourSquare Api Search for Venues
                $.ajax({
                    url: searchurl + searchendpoint,
                    dataType: 'jsonp',
                    cache: false,
                    success: function (data) {
                        let currentVenue = data["response"]["venues"][0];
                        let name = currentVenue['name'];
                        let formattedAddress = currentVenue['location']['formattedAddress'];
                        infowindow.setContent('<div class="gm-in-cn"><h3>' + name + '</h3><hr>' +
                            '<p><span><b>Description:</b></span><br>' + description + '</p><hr><p><span><b>Address:</b></span><br>&emsp;' + formattedAddress + '</p></div>');
                    },

                    // error handling if foursquare not load.
                    error: function () {
                        alert('Fail to connect to Foursquare: ');
                    }
                });
            },

            // error handling if wikipedia not load.
            error: function () {
                alert('Fail to connect to Wikipedia: ');
            }
        });

        // check marker and make default
        Markers.forEach(function (checkMarker) {
            checkMarker['marker'].setIcon(defaultIcon);
        });

        // make marker highlight
        marker.setIcon(highlightedIcon);

        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
    }
}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
    const markerImage = new google.maps.MarkerImage(
        'https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}