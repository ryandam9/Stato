function showLongRunningQueries() {
    let payload = {
        'end-point': queryExecutionLink + '/long-running-queries',
    };

    invokeRemoteEndpoint(payload, longRunningQueriesRefresh, {});
}

function showQueryResourceUsage() {
    let payload = {
        'end-point': queryExecutionLink + '/queries-resource-usage',
    };

    invokeRemoteEndpoint(payload, queryResourceUsageRefresh, {});
}

function refreshCatalogTables() {
    let payload = {
        'end-point': queryExecutionLink + '/data-dictionary-views',
    };

    invokeRemoteEndpoint(payload, createCatalogTable, {});
}

function refreshSchemaTables() {
    let schema_name = document.getElementById('schema-name').value;

    if (schema_name.trim().length === 0) {
        return;
    }

    let payload = {
        'end-point': queryExecutionLink + '/get-tables-in-a-schema?schema_name=' + schema_name,
    };

    invokeRemoteEndpoint(payload, createSchemaTable, {});
}

/**
 * Calls related to a SQLID
 */
function showLongRunningQuerySqlId(sqlid) {
    let payload = {
        'end-point': queryExecutionLink + '/long-running-query?sql_id=' + sqlid,
    };

    invokeRemoteEndpoint(payload, refreshLongRunningQuery, {});
}

function showQueryResourceUsageSqlId(sqlid) {
    let payload = {
        'end-point': queryExecutionLink + '/query-resource-usage?sql_id=' + sqlid,
    };

    invokeRemoteEndpoint(payload, refreshQueryResourceUsage , {});
}

function getSQLTextSqlId(sqlid) {
    let payload = {
        'end-point': queryExecutionLink + '/sql_text?sql_id=' + sqlid,
    };

    invokeRemoteEndpoint(payload, refreshSQLText, {});
}

/**
 * Progress of a Query against Plan
 * @param sqlid
 */
function getQueryProgress(sqlid) {
    let payload = {
        'end-point': queryExecutionLink + '/query-progress-against-plan?sql_id=' + sqlid,
    };

    invokeRemoteEndpoint(payload, refreshQueryProgress, {});
}

/**
 *
 * @param sqlid
 */
function getTempSpaceUseQuery(sqlid) {
    let payload = {
        'end-point': queryExecutionLink + '/temp-space-use-sqlid?sql_id=' + sqlid,
    };

    invokeRemoteEndpoint(payload, refreshTempSpaceUsaQuery, {});
}


function getDBHistData1(sqlid) {
    let payload = {
        'end-point': queryExecutionLink + '/dba-hist-1?sql_id=' + sqlid,
    };

    invokeRemoteEndpoint(payload, refreshDBHistData1, {});
}

/**
 * Fetch Catalog Table Data
 */
function fetchCatalogTable(e) {
    let tableName = e.target.innerText;
    document.getElementById('catalog-table-name').innerText = tableName;

    // Delete existing Data table.
    document.getElementById('catalog-tables-data-section')
        .childNodes
        .forEach(node => node.remove());

    let payload = {
        'end-point': fetchTableDataLink + '/' + tableName,
    };

    showSpinner('catalog-table-spinner');

    invokeRemoteEndpoint(payload, refreshCatalogTableData, {});
}

/**
 * Fetch Table Data
 */
function fetchSchemaTable(e) {
    let tableName = e.target.innerText;
    document.getElementById('schema-table-name').innerText = tableName;

    let schema_name = document.getElementById('schema-name').value;

    // Delete existing Data table.
    document.getElementById('schema-tables-data-section')
        .childNodes
        .forEach(node => node.remove());

    let payload = {
        'end-point': fetchTableDataLink + '/' + schema_name + '.' + tableName,
    };

    showSpinner('schema-table-spinner');

    invokeRemoteEndpoint(payload, refreshSchemaTableData, {});
}
