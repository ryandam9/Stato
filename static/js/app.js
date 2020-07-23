// Server links
let webServer = 'http://localhost:5000';
let queryExecutionLink = webServer + '/query_execution/';

// On Page loading, execute this
window.addEventListener('DOMContentLoaded', setup);

function setup() {
    initialize();
    buildPages();
}

function initialize() {
    document.getElementById('storage-page').style.display = 'none';
    document.getElementById('in-progress-queries-page').style.display = 'none';
    document.getElementById('waits-page').style.display = 'none';
    document.getElementById('catalog-page').style.display = 'none';
    document.getElementById('others-page').style.display = 'none';
    document.getElementById('query-execution-page').style.display = 'none';

    document.getElementById('home-tab').addEventListener('click', tabHandler);
    document.getElementById('storage-tab').addEventListener('click', tabHandler);
    document.getElementById('in-progress-queries-tab').addEventListener('click', tabHandler);
    document.getElementById('waits-tab').addEventListener('click', tabHandler);
    document.getElementById('catalog-tab').addEventListener('click', tabHandler);
    document.getElementById('others-tab').addEventListener('click', tabHandler);
    document.getElementById('query-execution-tab').addEventListener('click', tabHandler);
}

function buildPages() {
    // Query Execution Section
    let queryExecutionSection = createAccordion('query-execution-section');
    document.getElementById('query-execution-page').appendChild(queryExecutionSection);

    accordionCard('query-execution-section', 'card1');
    accordionCard('query-execution-section', 'card2');
    accordionCard('query-execution-section', 'card3');
    accordionCard('query-execution-section', 'card4');
    accordionCard('query-execution-section', 'card5');
}

function tabHandler(e) {
    let targetId = e.target.id;

    if (targetId.length === 0)
        return;

    let pageId = targetId.replace('-tab', '-page');

    hideAllPages();
    document.getElementById(pageId).style.display = 'block';
}

function hideAllPages() {
    document.querySelectorAll('.tool-page').forEach(node => node.style.display = 'none');
}

function createAccordion(id) {
    let accordion = document.createElement('div');
    accordion.id = id;
    return accordion;
}

function accordionCard(accordionId, cardId) {
    let headerId = `${cardId}-header`;
    let bodyId = `${cardId}-body`;

    let card = document.createElement('div');
    card.className = 'card rounded-lg';

    let cardHeader = document.createElement('div');
    cardHeader.className = 'card-header';
    cardHeader.id = headerId;

    let header = document.createElement('h5');
    header.className = 'mb-0';

    let link = document.createElement('button');
    link.className = 'btn btn-link';
    link.setAttribute('data-toggle', 'collapse');
    link.setAttribute('data-target', `#${bodyId}`);
    link.setAttribute('aria-expanded', 'true');
    link.setAttribute('aria-controls', bodyId);
    link.innerText = 'Collapsible Group Item #1';

    header.appendChild(link);
    cardHeader.appendChild(header);

    let body = document.createElement('div');
    body.id = bodyId;
    body.className = 'collapse show';
    body.setAttribute('aria-labelledby', headerId);
    body.setAttribute('data-parent', `#${accordionId}`);

    let cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    body.appendChild(cardBody);

    card.append(cardHeader, body);

    document.getElementById(accordionId).appendChild(card);
}

async function invokeRemoteEndpoint(link, payload, callback) {
    let worker = new Worker('/static/js/query-execution-worker.js');

    worker.addEventListener('message', function (event) {
        let result = event.data;
        callback(result);
    }, false);

    worker.postMessage(payload);
}

document.getElementById('remote-btn').addEventListener('click', (e) => {
    let payload = {
        'end-point': 'http://localhost:5000/query_execution/schemas',
    };

    invokeRemoteEndpoint(null, payload);
});
