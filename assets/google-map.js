class GoogleMapComponent extends HTMLElement {
  constructor() {
    super();
    this.apiKey = this.getAttribute('api-key');
    this.latitude = Number(this.getAttribute('location-latitude'));
    this.longitude = Number(this.getAttribute('location-longitude'));
    this.zoomLevel = Number(this.getAttribute('zoom-level'));
    this.mapStyles = [
      {
        elementType: 'geometry',
        stylers: [
          {
            color: '#f5f5f5',
          },
        ],
      },
      {
        elementType: 'labels.icon',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#616161',
          },
        ],
      },
      {
        elementType: 'labels.text.stroke',
        stylers: [
          {
            color: '#f5f5f5',
          },
        ],
      },
      {
        featureType: 'administrative.land_parcel',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#bdbdbd',
          },
        ],
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [
          {
            color: '#eeeeee',
          },
        ],
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#757575',
          },
        ],
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [
          {
            color: '#e5e5e5',
          },
        ],
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#9e9e9e',
          },
        ],
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [
          {
            color: '#ffffff',
          },
        ],
      },
      {
        featureType: 'road.arterial',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#757575',
          },
        ],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [
          {
            color: '#dadada',
          },
        ],
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#616161',
          },
        ],
      },
      {
        featureType: 'road.local',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#9e9e9e',
          },
        ],
      },
      {
        featureType: 'transit.line',
        elementType: 'geometry',
        stylers: [
          {
            color: '#e5e5e5',
          },
        ],
      },
      {
        featureType: 'transit.station',
        elementType: 'geometry',
        stylers: [
          {
            color: '#eeeeee',
          },
        ],
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [
          {
            color: '#c9c9c9',
          },
        ],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#9e9e9e',
          },
        ],
      },
    ];
  }

  connectedCallback() {
    // Create the script tag, set the appropriate attributes
    const script = document.createElement('script');

    // console.log('x',this.apiKey, this.latitude, this.longitude, this.zoomLevel);

    script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&callback=initMap`;
    script.async = true;

    // Attach your callback function to the `window` object
    window.initMap = () => {
      const storeLocation = { lat: this.latitude, lng: this.longitude };
      const map = new google.maps.Map(document.getElementById('map'), {
        center: storeLocation,
        zoom: this.zoomLevel,
        styles: this.mapStyles,
      });

      // This event listener calls addMarker() when the map is clicked.
      google.maps.event.addListener(map, 'click', (event) => {
        addMarker(event.latLng, map);
      });
      // Add a marker at the center of the map.
      addMarker(storeLocation, map);
    };

    // Adds a marker to the map.
    function addMarker(location, map) {
      new google.maps.Marker({
        position: location,
        map: map,
      });
    }

    // Append the 'script' element to 'head'
    document.head.appendChild(script);
  }
}

customElements.define('google-map', GoogleMapComponent);
