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
        'end-point': queryExecutionLink + '/get_sql_text?sql_id=' + sqlid,
    };

    invokeRemoteEndpoint(payload, refreshSQLText, {});
}
