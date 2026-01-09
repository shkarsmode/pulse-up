export const environment = {
    production: false,
    apiUrl: 'https://app-pulseapi-dev-fvdbe3fwhsghczfn.eastus2-01.azurewebsites.net',
    geocodingApiUrl: 'https://api.mapbox.com/geocoding/v5',
    mapboxToken:
        'pk.eyJ1IjoibmF2ZWVuZ29wdWxzZSIsImEiOiJjbTFxb2YyYzIwMjc3MmtvbXRob20yNGY2In0.7Eyobg6zrbOwPXMmW6BAMA',
    mapStyleUrl:
        'mapbox://styles/naveengopulse/cm8g9wn7000zl01qra3en7f7v?optimize=true',
    mapWithBackgroundStyleUrl:
        'mapbox://styles/naveengopulse/cmafp4osk00vy01r40rhx06yk?optimize=true',
    firebaseConfig: {
        apiKey: "AIzaSyD2qwEcQb9H_R5rohjC78H5CQGdaIvtaOI",
        authDomain: "pulseapp-d9cea.firebaseapp.com",
        projectId: "pulseapp-d9cea",
        storageBucket: "pulseapp-d9cea.firebasestorage.app",
        messagingSenderId: "301057533103",
        appId: "1:301057533103:web:388935743e165e31bf205a",
        measurementId: "G-W6FV6E25JL"
    },
    ipInfoApiToken: "7781b0329f5236",
    markerSizing: {
        globe: { min: 18, base: 18, scale: 12.0, max: 110 },
        mercator: { min: 28, base: 24, scale: 14.0, max: 160 },
    },
};
