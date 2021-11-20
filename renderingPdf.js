var currentUrl = "";
var pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';

let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let completed = false;
const scale = 1.3;
const canvas = document.getElementById('the-canvas');
const spinner = document.getElementById('spinner');
const ctx = canvas.getContext('2d');

async function renderPage(num) {
    pageRendering = true;
    canvas.classList.remove('onAnimation');

    pdfDoc.getPage(num).then(function(page) {
        var viewport = page.getViewport({scale: scale});
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        var renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        var renderTask = page.render(renderContext);

        renderTask.promise.then(function() {
            pageRendering = false;
            spinner.style.display = 'none';
            canvas.classList.add('onAnimation');
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });
    // document.getElementById('page_num').textContent = num;
}

async function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
        return;
    }
    await renderPage(num);
}

async function onNextPage() {
    if (pdfDoc === null) return;
    if (pageNum >= pdfDoc.numPages) {
        completed = true;
        return;
    }
    pageNum++;
    console.log(`next page -> ${pageNum}`);
    await queueRenderPage(pageNum);
}

// const CORS_PROXY = "https://cors.bridged.cc/";
const CORS_PROXY = "https://naki-cors.herokuapp.com/";

async function loadingPdf() {
    console.log(`loading... ${currentUrl}`);
    spinner.style.display = 'block';
    pageNum = 1;
    const url = CORS_PROXY + currentUrl;
    await pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
        pdfDoc = pdfDoc_;
        // document.getElementById('page_count').textContent = pdfDoc.numPages;
        renderPage(pageNum);
    });;
}
let counter = 0;
const rendering = (urls, slideInterval) => {
    let currentCount = 0;
    currentUrl = urls[currentCount];
    loadingPdf();

    setInterval(_ => {
        const urlCount = urls.length;
        if (completed) {
            counter++;
            console.log(`slide completed for ${counter} -> ${currentUrl}`);
            currentCount++;
            if (currentCount >= urlCount) {
                currentCount = 0;
            }
            currentUrl = urls[currentCount];
            completed = false;
            loadingPdf();
        } else {
            onNextPage();
        }
    }, slideInterval);
}

export default rendering;