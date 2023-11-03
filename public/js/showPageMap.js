mapboxgl.accessToken = mapToken;
const camp = JSON.parse(campground);
const coordinates = camp.geometry.coordinates;

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: coordinates, // starting position [lng, lat]
    zoom: 12 // starting zoom
});

new mapboxgl.Marker()
    .setLngLat(coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(`<h3>${camp.title}</h3><p>${camp.location}</p>`)
    )
    .addTo(map)