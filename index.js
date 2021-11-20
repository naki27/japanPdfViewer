import leagueUrls from '/leagueUrls.js'
import tournamentUrls from '/tournamentUrls.js'
import rendering from '/renderingPdf.js'

var urls = leagueUrls();
let slideInterval = 3000;

// query strings
// ?target={league or tournament}&interval={int value}
// TODO location={int value}
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

if (params.target === "tournament") {
    console.log("i am tournament viewer.");
    urls = tournamentUrls();
} else {
    console.log("i am league viewer.");
}

if (params.interval) {
    slideInterval = params.interval;
}

rendering(urls, slideInterval);
