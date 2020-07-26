function checkReturnStatus(result, messageId) {
    let message = document.getElementById(messageId);

    if (result.status !== 'success') {
        message.innerText = result.data;
        message.className = 'alert alert-danger alert-dismissible fade show font-italic';
        return;
    }

    let currentDate = new Date();

    let datetime = currentDate.getDate() + "/"
        + (currentDate.getMonth()+1)  + "/"
        + currentDate.getFullYear() + " @ "
        + currentDate.getHours() + ":"
        + currentDate.getMinutes() + ":"
        + currentDate.getSeconds();

    message.innerText = 'Last Refreshed: ' + datetime;
    message.className = 'alert alert-primary alert-dismissible fade show font-italic';
}

function longRunningQueriesRefresh(result) {
    let tableId = 'long-running-queries-table';
    let parentId = 'long-running-queries-section';
    checkReturnStatus(result, 'long-running-queries-message');

    if (result.status === 'success')
        longRunningQueriesDataTable = makeDataTable(longRunningQueriesDataTable, result, tableId, parentId);
}

function queryResourceUsageRefresh(data) {
    let tableId = 'query-resource-usage-table';
    let parentId = 'query-resource-usage-section';
    let lastRefreshTimeEntry = 'resource-usage-auto-last-refresh';
    document.getElementById(lastRefreshTimeEntry).innerText = new Date().toString();

    queryResourceUsageDataTable = makeDataTable(queryResourceUsageDataTable, data, tableId, parentId);
}

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

function refreshLongRunningQuery(data) {
    let tableId = 'long-running-query-table';
    let parentId = 'long-running-query-sqlid';

    longRunningQueryDataTable = makeDataTable(longRunningQueryDataTable, data, tableId, parentId);
}

function refreshQueryResourceUsage(data) {
    console.log(data);
    let tableId = 'query-resource-usage-table-sqlid';
    let parentId = 'query-resource-usage-sqlid';
    singleQueryResourceUsageDataTable = makeDataTable(singleQueryResourceUsageDataTable, data, tableId, parentId);
}

function refreshCatalogTableData(result) {
    let tableId = 'catalog-tables-data-html-table';
    let parentId = 'catalog-tables-data-section';

    checkReturnStatus(result, 'catalog-table-message');

    if (result.status === 'success') {
        catalogTableDataTable = null;
        catalogTableDataTable = makeDataTable(catalogTableDataTable, result, tableId, parentId);
    }

    removeSpinner('catalog-table-spinner');
}

function refreshSQLText(data) {
    let tableId = 'sqlid-sqltext-table';
    let parentId = 'sqlid-sqltext';
    sqlTextDataTable = makeDataTable(sqlTextDataTable, data, tableId, parentId);
}

function makeDataTable(dt, data, tableId, parentId) {
    let cols = data.data.columns;
    let records = data.data.records;

    if (dt === undefined || dt === null) {
        dt = createEmptyDataTable(cols, tableId, parentId);
    } else {
        // Data table is already defined. Remove existing Data.
        dt.clear().draw();
    }

    let tableData = getHTMLRows(records);
    dt.rows.add(tableData).draw(false);

    return dt;
}
