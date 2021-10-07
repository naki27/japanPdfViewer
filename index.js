import leageUrls from '/leageUrls.js'
import tournamentUrls from '/tournamentUrls.js'
import rendering from '/renderingPdf.js'

var urls = leageUrls();
let slideInterval = 3000;

// query strings
// ?target={leage or tournament}&interval={int value}
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

if (params.target === "tournament") {
    console.log("i am tournament viewer.");
    urls = tournamentUrls();
} else {
    console.log("i am leage viewer.");
}

if (params.interval) {
    slideInterval = params.interval;
}

rendering(urls, slideInterval);
