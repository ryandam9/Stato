/**
 * This is invoked with the result of the API call. If the 'status' is not success, it renders the error message.
 * Otherwise, it shows current time.
 *
 * @param result - Result of API Call
 * @param messageId - HTML Element where the message should be rendered.
 */
function checkReturnStatus(result, messageId) {
    let message = document.getElementById(messageId);

    if (result.status !== 'success') {
        message.innerText = result.data;
        message.className = 'alert alert-danger alert-dismissible fade show font-italic';
        return;
    }

    let currentDate = new Date();

    let datetime = currentDate.getDate() + "/"
        + (currentDate.getMonth() + 1) + "/"
        + currentDate.getFullYear() + " @ "
        + currentDate.getHours() + ":"
        + currentDate.getMinutes() + ":"
        + currentDate.getSeconds();

    message.innerText = 'Last Refreshed: ' + datetime;
    message.className = 'alert alert-primary alert-dismissible fade show font-italic';
}

/**
 * Long Running Queries
 * @param result
 */
function longRunningQueriesRefresh(result) {
    let tableId = 'long-running-queries-table';
    let parentId = 'long-running-queries-section';
    checkReturnStatus(result, 'long-running-queries-message');

    if (result.status === 'success')
        longRunningQueriesDataTable = makeDataTable(longRunningQueriesDataTable, result, tableId, parentId);
}

/**
 * Query Resource Usage
 * @param result
 */
function queryResourceUsageRefresh(result) {
    let tableId = 'query-resource-usage-table';
    let parentId = 'query-resource-usage-section';

    // Check the API result status
    checkReturnStatus(result, 'resource-usage-message');

    if (result.status === 'success')
        queryResourceUsageDataTable = makeDataTable(queryResourceUsageDataTable, result, tableId, parentId);
}

/**
 * Retrieve Catalog tables list
 * @param data
 */
function createCatalogTable(data) {
    let cols = data.data.columns;
    let records = data.data.records;

    let tableId = 'catalog-tables-table';
    let parentId = 'catalog-tables-section';

    if (catalogDataTable === undefined || catalogDataTable === null) {
        let table = createTable(cols, [], tableId);
        document.getElementById(parentId).appendChild(table);

        catalogDataTable = $(`#${tableId}`).DataTable({
            responsive: true,
            pageLength: 25,
            pagingType: "simple",
            columnDefs: [
                {width: "500px", targets: [0]},
            ],
            "dom": "<'row'<'col-sm-12 col-md-4'l><'col-sm-12 col-md-8'f>>" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row'<'col-sm-12 col-md-12'i>>" +
                "<'row'<'col-sm-12 col-md-12'p>>",
        });
    } else {
        // Data table is already defined. Remove existing Data.
        catalogDataTable.clear().draw();
    }

    let htmlRows = [];

    // Create Table Data rows
    records.forEach(record => {
        let tr = document.createElement('tr');

        record.forEach(cell => {
            let td = document.createElement('td');

            let anchor = document.createElement('a');
            anchor.innerText = cell;
            anchor.style.cursor = 'pointer';

            anchor.addEventListener('click', fetchCatalogTable);
            td.appendChild(anchor);

            tr.appendChild(td);
        });
        htmlRows.push(tr);
    });

    catalogDataTable.rows.add(htmlRows).draw(false);
}

/**
 * Refresh Catalog table Data.
 * @param result
 */
function refreshCatalogTableData(result) {
    let tableId = 'catalog-tables-data-html-table';
    let parentId = 'catalog-tables-data-section';

    checkReturnStatus(result, 'catalog-table-message');

    if (result.status === 'success') {
        // Structure of each catalog table is different. So, every time, a new Data table should
        // be created.
        catalogTableDataTable = null;
        catalogTableDataTable = makeDataTable(catalogTableDataTable, result, tableId, parentId);
    }

    removeSpinner('catalog-table-spinner');
}

/**
 * Long Running Query for an SQLID
 * @param result
 */
function refreshLongRunningQuery(result) {
    let tableId = 'long-running-query-table';
    let parentId = 'long-running-query-sqlid';

    // Check the API result status
    checkReturnStatus(result, 'query-progress-message');

    if (result.status === 'success')
        longRunningQueryDataTable = makeDataTable(longRunningQueryDataTable, result, tableId, parentId);
}

/**
 * Resource Usage of an SQLID
 * @param result
 */
function refreshQueryResourceUsage(result) {
    let tableId = 'query-resource-usage-table-sqlid';
    let parentId = 'query-resource-usage-sqlid';

    // Check the API result status
    checkReturnStatus(result, 'query-progress-message');

    if (result.status === 'success')
        singleQueryResourceUsageDataTable = makeDataTable(singleQueryResourceUsageDataTable, result, tableId, parentId);
}

/**
 * Refresh SQL Text of an SQLID
 * @param result
 */
function refreshSQLText(result) {
    let tableId = 'sqlid-sqltext-table';
    let parentId = 'sqlid-sqltext';

    // Check the API result status
    checkReturnStatus(result, 'query-progress-message');

    if (result.status === 'success')
        sqlTextDataTable = makeDataTable(sqlTextDataTable, result, tableId, parentId);
}

/**
 *
 * @param result
 */
function refreshQueryProgress(result) {
    let tableId = 'sqlid-progress-vs-plan-table';
    let parentId = 'sqlid-progress-vs-plan';

    // Check the API result status
    checkReturnStatus(result, 'query-progress-message');

    if (result.status === 'success')
        queryProgressDataTable = makeDataTable(queryProgressDataTable, result, tableId, parentId);
}

/**
 *
 * @param result
 */
function refreshTempSpaceUsaQuery(result) {
    let tableId = 'sqlid-temp-space-table';
    let parentId = 'sqlid-temp-space';

    // Check the API result status
    checkReturnStatus(result, 'query-progress-message');

    if (result.status === 'success')
        queryTempSpaceUseDataTable = makeDataTable(queryTempSpaceUseDataTable, result, tableId, parentId);
}

/**
 *
 * @param result
 */
function refreshDBHistData1(result) {
    let tableId = 'sqlid-dba-hist-1-table';
    let parentId = 'sqlid-dba-hist-1';

    // Check the API result status
    checkReturnStatus(result, 'query-progress-message');

    if (result.status === 'success')
        queryDBAHist1DataTable = makeDataTable(queryDBAHist1DataTable, result, tableId, parentId);
}
