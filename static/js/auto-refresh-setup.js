document.getElementById('resource-usage-auto-refresh-btn').addEventListener('click', (e) => {
    let t = document.getElementById('resource-usage-auto-refresh-time').value;
    let autoRefreshTime = parseInt(t) * 1000;
    window.setInterval(() => showQueryResourceUsage(), autoRefreshTime);
});

function queryResourceUsageRefresh(data) {
    let tableId = 'query-resource-usage-table';
    let parentId = 'query-resource-usage-section';
    let lastRefreshTimeEntry = 'resource-usage-auto-last-refresh';

    let cols = data.data.columns;
    let records = data.data.records;

    if (queryResourceUsageDataTable === undefined || queryResourceUsageDataTable === null) {
        queryResourceUsageDataTable = createEmptyDataTable(cols, tableId, parentId);
    } else {
        // Data table is already defined. Remove existing Data.
        queryResourceUsageDataTable.clear().draw();
    }

    document.getElementById(lastRefreshTimeEntry).innerText = new Date().toString();
    let tableData = getHTMLRows(records);
    queryResourceUsageDataTable.rows.add(tableData).draw(false);
}

function longRunningQueriesRefresh(data) {
    let tableId = 'long-running-queries-table';
    let parentId = 'long-running-queries-section';
    let lastRefreshTimeEntry = 'long-running-queries-last-refresh';

    let cols = data.data.columns;
    let records = data.data.records;

    if (longRunningQueriesDataTable === undefined || longRunningQueriesDataTable === null) {
        longRunningQueriesDataTable = createEmptyDataTable(cols, tableId, parentId);
    } else {
        // Data table is already defined. Remove existing Data.
        longRunningQueriesDataTable.clear().draw();
    }

    document.getElementById(lastRefreshTimeEntry).innerText = new Date().toString();
    let tableData = getHTMLRows(records);
    longRunningQueriesDataTable.rows.add(tableData).draw(false);
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

    let tableData = getHTMLRows(records);
    catalogDataTable.rows.add(tableData).draw(false);
}

function refreshLongRunningQuery(data) {
    let tableId = 'long-running-query-table';
    let parentId = 'long-running-query-sqlid';

    let cols = data.data.columns;
    let records = data.data.records;

    if (longRunningQueryDataTable === undefined || longRunningQueryDataTable === null) {
        longRunningQueryDataTable = createEmptyDataTable(cols, tableId, parentId);
    } else {
        // Data table is already defined. Remove existing Data.
        longRunningQueryDataTable.clear().draw();
    }

    let tableData = getHTMLRows(records);
    longRunningQueryDataTable.rows.add(tableData).draw(false);
}

function refreshQueryResourceUsage(data) {
    console.log(data);
    let tableId = 'query-resource-usage-table-sqlid';
    let parentId = 'query-resource-usage-sqlid';

    let cols = data.data.columns;
    let records = data.data.records;

    if (singleQueryResourceUsageDataTable === undefined || singleQueryResourceUsageDataTable === null) {
        singleQueryResourceUsageDataTable = createEmptyDataTable(cols, tableId, parentId);
    } else {
        // Data table is already defined. Remove existing Data.
        singleQueryResourceUsageDataTable.clear().draw();
    }

    let tableData = getHTMLRows(records);
    singleQueryResourceUsageDataTable.rows.add(tableData).draw(false);
}

function refreshSQLText(data) {

}
