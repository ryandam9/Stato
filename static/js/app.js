// Server links
let webServer = 'http://localhost:5000';
let queryExecutionLink = webServer + '/query_execution';

// To fetch Catalog table data
let catalogTableLink = webServer + '/get-table';

// On Page loading, execute this
window.addEventListener('DOMContentLoaded', setup);

// Each table is wrapped with Data tables. These are various Data table IDs.
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
    setupAutoRefreshCallbacks();
}

function initialize() {
    // Hide all pages except "Home" Page
    document.getElementById('storage-page').style.display = 'none';
    document.getElementById('in-progress-queries-page').style.display = 'none';
    document.getElementById('waits-page').style.display = 'none';
    document.getElementById('catalog-page').style.display = 'none';
    document.getElementById('others-page').style.display = 'none';
    document.getElementById('query-execution-page').style.display = 'none';

    // When any tab is clicked, Hide all other pages.
    // Only show the clicked tab page.
    document.getElementById('home-tab').addEventListener('click', tabHandler);
    document.getElementById('storage-tab').addEventListener('click', tabHandler);
    document.getElementById('in-progress-queries-tab').addEventListener('click', tabHandler);
    document.getElementById('waits-tab').addEventListener('click', tabHandler);
    document.getElementById('catalog-tab').addEventListener('click', tabHandler);
    document.getElementById('others-tab').addEventListener('click', tabHandler);
    document.getElementById('query-execution-tab').addEventListener('click', tabHandler);

    document.getElementById('catalog-refresh-btn').addEventListener('click', refreshCatalogTables);
    document.getElementById('sqlid-monitor-btn').addEventListener('click', monitorSQLId);

    // Expand all entries
    document.getElementById('sqlid-show-all').addEventListener('click', (e) => {
        document.querySelectorAll('.sqlid-collapse')
            .forEach(node => node.className = 'collapse show sqlid-collapse');
    });

    // Collapse all entries
    document.getElementById('sqlid-hide-all').addEventListener('click', (e) => {
        document.querySelectorAll('.sqlid-collapse')
            .forEach(node => node.className = 'collapse sqlid-collapse');
    });

    // Fetch OEM Report for a given SQL ID
    document.getElementById('enterprise-manager-report-btn').addEventListener('click', (e) => {
        e.preventDefault();

        let sqlId = document.getElementById('sqlid').value.trim();

        if (sqlId.length > 0) {
            let link = `${webServer}/report_sql_monitor_active/${sqlId}`;
            window.open(link);
        }
    });
}

function setupAutoRefreshCallbacks() {
    // Setup Auto Refresh for Resource Usage Queries
    document.getElementById('resource-usage-auto-refresh-btn').addEventListener('click', (e) => {
        let t = document.getElementById('resource-usage-auto-refresh-time').value;
        let autoRefreshTime = parseInt(t) * 1000;
        window.setInterval(() => showQueryResourceUsage(), autoRefreshTime);
    });

    document.getElementById('long-running-queries-auto-refresh-btn').addEventListener('click', (e) => {
        let t = document.getElementById('long-running-queries-auto-refresh-time').value;
        let autoRefreshTime = parseInt(t) * 1000;
        window.setInterval(() => showLongRunningQueries(), autoRefreshTime);
    });
}

// Show all pages and show only the relevant page.
function tabHandler(e) {
    let targetId = e.target.id;

    if (targetId.length === 0)
        return;

    let pageId = targetId.replace('-tab', '-page');

    hideAllPages();
    document.getElementById(pageId).style.display = 'block';
}

// Hide all pages.
function hideAllPages() {
    document.querySelectorAll('.tool-page')
        .forEach(node => node.style.display = 'none');
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

/**
 * This function executes a worker script in the background. The core of this application is to execute queries on a
 * remote DB and render the results. Query execution may take a while, and network latency adds additional delay.
 * To avoid this, the API is called in the worker thread and the result is handled asynchronously.
 *
 * @param payload - Data to be sent to the API
 * @param callback - This function is called once worker thread's execution is completed
 * @param options  - An Object (Not used at the moment)
 * @returns {Promise<void>}
 */
async function invokeRemoteEndpoint(payload, callback, options) {
    let worker = new Worker('/static/js/query-execution-worker.js');

    // The function is called after thread's execution is completed.
    worker.addEventListener('message', function (event) {
        let result = event.data;

        // If the thread failed with network error, show the error message in a modal
        // An example could be, the API does not allow 'POST', but it is invoked with 'POST'.
        // In such a case, http status code 405 is returned.
        if (result.status === 'network-failure') {
            document.getElementById('application-error-message').innerText = result.data;
            $('#applicationModal').modal('show')
        }

        // Invoke the callback function with the result
        callback(result, options);
    }, false);

    // Pass the payload to worker thread.
    worker.postMessage(payload);
}
