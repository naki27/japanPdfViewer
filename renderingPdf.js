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
    document.getElementById('page_num').textContent = num;
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

async function loadingPdf() {
    console.log(`loading... ${currentUrl}`);
    spinner.style.display = 'block';
    pageNum = 1;
    const corsUrl = "https://cors-anywhere.herokuapp.com/" + currentUrl;
    await pdfjsLib.getDocument(corsUrl).promise.then(function(pdfDoc_) {
        pdfDoc = pdfDoc_;
        document.getElementById('page_count').textContent = pdfDoc.numPages;
        renderPage(pageNum);
    });;
}

const rendering = (urls, slideInterval) => {
    let currentCount = 0;
    currentUrl = urls[currentCount];
    loadingPdf();

    setInterval(_ => {
        const urlCount = urls.length;
        if (completed) {
            console.log(`slide completed -> ${currentUrl}`);
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