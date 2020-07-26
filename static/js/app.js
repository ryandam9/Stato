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

    document.getElementById('resource-usage-auto-refresh-btn').addEventListener('click', (e) => {
        let t = document.getElementById('resource-usage-auto-refresh-time').value;
        let autoRefreshTime = parseInt(t) * 1000;
        window.setInterval(() => showQueryResourceUsage(), autoRefreshTime);
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

async function invokeRemoteEndpoint(payload, callback, options) {
    let worker = new Worker('/static/js/query-execution-worker.js');

    worker.addEventListener('message', function (event) {
        let result = event.data;

        if (result.status === 'network-failure') {
            document.getElementById('application-error-message').innerText = result.data;
            $('#applicationModal').modal('show')
        }

        callback(result, options);
    }, false);

    worker.postMessage(payload);
}

