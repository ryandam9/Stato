// Server links
let webServer = 'http://localhost:5000';
let queryExecutionLink = webServer + '/query_execution';
let catalogTableLink = webServer + '/get-table';

// On Page loading, execute this
window.addEventListener('DOMContentLoaded', setup);

// Data table IDs
let queryResourceUsageDataTable,
    longRunningQueriesDataTable,
    catalogDataTable,
    longRunningQueryDataTable,
    singleQueryResourceUsageDataTable,
    sqlTextDataTable,
    catalogTableDataTable;

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

    document.getElementById('catalog-refresh-btn').addEventListener('click', refreshCatalogTables);
    document.getElementById('sqlid-monitor-btn').addEventListener('click', monitorSQLId);

    document.getElementById('sqlid-show-all').addEventListener('click', (e) => {
        document.querySelectorAll('.sqlid-collapse')
            .forEach(node => node.className = 'collapse show sqlid-collapse');
    });

    document.getElementById('sqlid-hide-all').addEventListener('click', (e) => {
        document.querySelectorAll('.sqlid-collapse')
            .forEach(node => node.className = 'collapse sqlid-collapse');
    });

    document.getElementById('enterprise-manager-report-btn').addEventListener('click', (e) => {
        e.preventDefault();

        let sqlId = document.getElementById('sqlid').value.trim();
        let link = `${webServer}/report_sql_monitor_active/${sqlId}`;

        window.open(link);
    });
}

function buildPages() {
    showLongRunningQueries();
    showQueryResourceUsage();
}

function monitorSQLId() {
    let sqlid = document.getElementById('sqlid').value;

    if (sqlid.trim().length > 0) {
        showLongRunningQuerySqlId(sqlid);
        showQueryResourceUsageSqlId(sqlid);
        getSQLTextSqlId(sqlid);
    }
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

async function invokeRemoteEndpoint(payload, callback, options) {
    let worker = new Worker('/static/js/query-execution-worker.js');

    worker.addEventListener('message', function (event) {
        let result = event.data;
        callback(result, options);
    }, false);

    worker.postMessage(payload);
}

function createNavBar(tabs) {
    let navBar = document.createElement('ul');
    navBar.className = 'nav nav-tabs';

    let index = 0;

    tabs.forEach(tab => {

        let li = document.createElement('li');
        li.className = 'nav-item mr-2';

        let anchor = document.createElement('a');

        if (index === 0) {
            anchor.className = 'nav-link active';
            index++;
        } else {
            anchor.className = 'nav-link';
        }

        anchor.href = '#';
        anchor.innerText = tab;

        li.appendChild(anchor);
        navBar.appendChild(li);
    });

    return navBar;
}
