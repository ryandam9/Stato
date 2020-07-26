document.getElementById('resource-usage-auto-refresh-btn').addEventListener('click', (e) => {
    let t = document.getElementById('resource-usage-auto-refresh-time').value;
    let autoRefreshTime = parseInt(t) * 1000;
    window.setInterval(() => showQueryResourceUsage(), autoRefreshTime);
});

function queryResourceUsageRefresh(data) {
    let tableId = 'query-resource-usage-table';
    let parentId = 'query-resource-usage-section';
    let lastRefreshTimeEntry = 'resource-usage-auto-last-refresh';
    document.getElementById(lastRefreshTimeEntry).innerText = new Date().toString();

    queryResourceUsageDataTable = makeDataTable(queryResourceUsageDataTable, data, tableId, parentId);

    // let cols = data.data.columns;
    // let records = data.data.records;
    //
    // if (queryResourceUsageDataTable === undefined || queryResourceUsageDataTable === null) {
    //     queryResourceUsageDataTable = createEmptyDataTable(cols, tableId, parentId);
    // } else {
    //     // Data table is already defined. Remove existing Data.
    //     queryResourceUsageDataTable.clear().draw();
    // }
    //
    // let tableData = getHTMLRows(records);
    // queryResourceUsageDataTable.rows.add(tableData).draw(false);
}

function longRunningQueriesRefresh(data) {
    let tableId = 'long-running-queries-table';
    let parentId = 'long-running-queries-section';
    let lastRefreshTimeEntry = 'long-running-queries-last-refresh';
    document.getElementById(lastRefreshTimeEntry).innerText = new Date().toString();

    longRunningQueriesDataTable = makeDataTable(longRunningQueriesDataTable, data, tableId, parentId);

    // let cols = data.data.columns;
    // let records = data.data.records;
    //
    // if (longRunningQueriesDataTable === undefined || longRunningQueriesDataTable === null) {
    //     longRunningQueriesDataTable = createEmptyDataTable(cols, tableId, parentId);
    // } else {
    //     // Data table is already defined. Remove existing Data.
    //     longRunningQueriesDataTable.clear().draw();
    // }
    //
    // let tableData = getHTMLRows(records);
    // longRunningQueriesDataTable.rows.add(tableData).draw(false);
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

    // let cols = data.data.columns;
    // let records = data.data.records;
    //
    // if (longRunningQueryDataTable === undefined || longRunningQueryDataTable === null) {
    //     longRunningQueryDataTable = createEmptyDataTable(cols, tableId, parentId);
    // } else {
    //     // Data table is already defined. Remove existing Data.
    //     longRunningQueryDataTable.clear().draw();
    // }
    //
    // let tableData = getHTMLRows(records);
    // longRunningQueryDataTable.rows.add(tableData).draw(false);
}

function refreshQueryResourceUsage(data) {
    console.log(data);
    let tableId = 'query-resource-usage-table-sqlid';
    let parentId = 'query-resource-usage-sqlid';
    singleQueryResourceUsageDataTable = makeDataTable(singleQueryResourceUsageDataTable, data, tableId, parentId);
}

function refreshCatalogTableData(data) {
    let tableId = 'catalog-tables-data-html-table';
    let parentId = 'catalog-tables-data-section';

    catalogTableDataTable = null;
    catalogTableDataTable = makeDataTable(catalogTableDataTable, data, tableId, parentId);

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
