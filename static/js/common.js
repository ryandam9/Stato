function createRow(item) {
    let section = document.createElement('section');

    let containerFluid = document.createElement('div');
    containerFluid.className = 'container-fluid';

    let jumbotron = document.createElement('div');
    jumbotron.className = 'jumbotron';

    // For tables with fewer number of columns, it's better to keep both table and graph in the
    // same row.
    if (item['table-bootstrap-class'] === 'col-6' &&
        item['graph-required'] === 'Y' &&
        item['graph-bootstrap-class'] === 'col-6') {

        let row = document.createElement('div');
        row.className = 'row clearfix';

        let tableCard = createCard('table', item);
        row.appendChild(tableCard);

        let graphCard = createCard('graph', item);
        row.appendChild(graphCard);

        jumbotron.appendChild(row);
        containerFluid.appendChild(jumbotron);
        section.appendChild(containerFluid);

        return section;
    }

    // Create a place holder for Table Data
    let tableRow = document.createElement('div');
    tableRow.className = 'row clearfix';

    let tableCard = createCard('table', item);
    tableRow.appendChild(tableCard);
    jumbotron.appendChild(tableRow);

    if (item['graph-required'] === 'Y') {
        let graphRow = document.createElement('div');
        graphRow.className = 'row clearfix my-5';

        let graphCard = createCard('graph', item);
        graphRow.appendChild(graphCard);
        jumbotron.appendChild(graphRow);
    }

    containerFluid.appendChild(jumbotron);
    section.appendChild(containerFluid);

    return section;
}

/**
 * Creates a Bootstrap Card element to place Table data. It is also used to create a Card
 * for Graphs too. The 'type' parameter determines this.
 *
 * @param queryId - Unique ID of the query that will be executed. This comes from
 *                  backend.
 * @param type - Either 'table' or 'graph'
 * @param heading - Heading of the table.
 * @param captionText - Any Caption to be displayed.
 * @param cardWidth - This controls width of the table (This is Bootstrap class name like COL-6, COL-12, etc).
 */
function createCard(type, item) {
    let queryId = item['queryId'];
    let heading = item['heading'];
    let captionText = item['caption'];

    let cardWidth = '';

    if (type === 'table')
        cardWidth = item['table-bootstrap-class'];
    else
        cardWidth = item['graph-bootstrap-class'];

    let cardWrapper = document.createElement('div');
    cardWrapper.className = cardWidth;

    let card = document.createElement('div');
    card.className = 'card rounded-lg';

    // Card header
    let cardHeader = document.createElement('div');
    cardHeader.className = 'card-header';
    cardHeader.id = `${queryId}-card-header`;

    let icons = document.createElement('div');
    icons.className = 'icons';

    let h3 = document.createElement('h3');
    h3.innerText = heading;
    icons.appendChild(h3);

    // Only tables have this option. Graphs need not have.
    if (type === 'table') {
        let form = document.createElement('form');
        form.className = 'form-inline ml-auto';

        // Create a text box to let the user enter Filter conditions.
        item['filters'].forEach(filter => {
            let inputBox = createInputBox(`${queryId}-${formatText(filter)}-filter-value`, camelCase(filter));
            form.appendChild(inputBox);
        });

        if (item['filters'].length > 0) {
            // Create a Button
            let button = createButton(`${queryId}-set-filters-btn`, 'Set Filters', [{
                'key': 'query-id',
                'value': queryId
            }]);
            button.addEventListener('click', manualInvocation);
            form.appendChild(button);

            let margin = document.createElement('span');
            margin.className = 'mr-2';
            form.appendChild(margin);
        }

        // Create a Refresh button
        createRefreshButton(form, queryId, `${queryId}-refresh-value`, `${queryId}-refresh-btn`);
        icons.appendChild(form);
    }

    cardHeader.appendChild(icons);

    // Card body
    let cardBody = document.createElement('div');
    cardBody.className = 'card-body scroll-y';

    let caption = document.createElement('p');
    caption.className = 'card-text';
    caption.innerText = captionText;

    let table = document.createElement('div');
    table.id = `${queryId}-${type}`;

    if (type === 'table')
        table.className = 'table-data';

    cardBody.append(caption, table);

    // Card footer
    let cardFooter = document.createElement('div');
    cardFooter.className = 'card-footer';
    cardFooter.id = `${queryId}-${type}-footer`;

    let footerText = document.createElement('span');
    footerText.id = `${queryId}-${type}-footer-text`;

    cardFooter.appendChild(footerText);

    card.append(cardHeader, cardBody, cardFooter);
    cardWrapper.append(card);

    return cardWrapper;
}


async function executeQueries(queries) {
    let uniqueQueryIds = Object.keys(queries);

    for (let i = 0; i < uniqueQueryIds.length; i++) {
        await executeQuery(uniqueQueryIds[i], null);
    }
}

function manualInvocation(e) {
    let queryId = e.target.getAttribute('query-id');
    executeQuery(queryId, null);
}

async function executeQuery(queryId, parameters, link = null, dataTableDisplayFlag = true) {
    console.log(`Executing Query for ${queryId} @ ${new Date()}`);
    let emptyValue = false;

    console.log(`Link: ${link}`);
    console.log(`Parameters: ${parameters}`);


    if (link === null && parameters === null) {
        parameters = '';

        if (queries[queryId]['filters'].length > 0) {
            queries[queryId]['filters'].forEach((filter, index) => {
                let value = document.getElementById(`${queryId}-${filter}-filter-value`).value;

                if (value.trim().length === 0)
                    emptyValue = true;

                if (index > 0)
                    parameters = parameters + "&";

                parameters = parameters + filter + "=" + value;
            });
        }
    }

    if (emptyValue) {
        console.log('Empty value present, not going to fetch data !!');
        return;
    }

    if (parameters === null)
        link = queryExecutionLink + queryId;
    else
        link = queryExecutionLink + queryId + '?' + parameters;

    console.log(link);

    // Target Table ID
    let tableId = queryId + '-table';
    let tableFooter = `${queryId}-table-footer`;
    let tableFooterText = `${queryId}-table-footer-text`;

    try {
        let jsonData = await fetchRemoteData(link);

        if (jsonData.status !== 'success') {
            // If there is any problem with the Query, show the error message.
            let errorMessage = `There is a problem executing Query ID: ${queryId}.\n`
            document.getElementById(tableFooterText).innerText = errorMessage + jsonData.data;
            document.getElementById(tableFooter).className = 'card-footer alert alert-danger alert-dismissible';
            return;
        }

        // Remove existing Data in the table
        while (document.getElementById(`${tableId}`).children.length > 0)
            document.getElementById(`${tableId}`).firstChild.remove();

        let table = createTable(jsonData.data.columns, jsonData.data.records, tableId + '-temp');
        document.getElementById(`${tableId}`).appendChild(table);

        // Make it a Data table based on the flag. Default is True.
        if (dataTableDisplayFlag) {
            $(`#${tableId}-temp`).DataTable({
                responsive: true,
                "pageLength": 10,
                pagingType: "simple",
                scrollX: false,
                scrollCollapse: false,
                fixedColumns: false
            });
        }

        // Update Dashboard tile
        document.getElementById(`${queryId}-tile-value`).innerText = jsonData.data.records.length;

        let currentdate = new Date();
        let datetime = currentdate.getDate() + "/"
            + (currentdate.getMonth()+1)  + "/"
            + currentdate.getFullYear() + " @ "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes();

        document.getElementById(`${queryId}-tile-footer-text`).innerText = `Last Updated: ${datetime}`;

        if (queries[queryId]['graph-required'] === 'Y') {
            // Prepare Data to render chart
            let graphData = prepareGraphData(queries[queryId]['graph-data-fields'], jsonData.data.columns, jsonData.data.records);

            if (graphData.length > 0)
                generateGraph(queryId, graphData);
        }

        document.getElementById(tableFooterText).innerText = `${jsonData.data.records.length} records fetched`;
        document.getElementById(tableFooter).className = 'card-footer alert alert-success alert-dismissible';

    } catch (e) {
        document.getElementById(tableFooterText).innerText = e;
        document.getElementById(tableFooter).className = 'card-footer alert alert-danger alert-dismissible';
    }

    clearFooter(tableFooter, tableFooterText);
}

function generateGraph(queryId, graphData) {
    let graphId = queryId + '-graph';

    switch (queries[queryId]['graph-type']) {
        case 'pie-chart':
            drawPieChart(graphId, queries[queryId]['heading'], null, queries[queryId]['graph-data-fields'], graphData);
            break;

        case 'bar-graph':
            drawBarGraph(graphId, queries[queryId]['heading'], null, queries[queryId]['graph-data-fields'], graphData);
            break;

        case 'column-graph':
            drawColumnGraph(graphId, queries[queryId]['heading'], null, queries[queryId]['graph-data-fields'], graphData);
            break;
    }
}

function createTable(columns, data, id) {
    let table = document.createElement('table');
    table.id = id;
    table.className = 'table table-hover table-striped table-bordered table-responsive';

    // Create table Header
    let thead = document.createElement('thead');
    let header = document.createElement('tr');

    columns.forEach(col => {
        let th = document.createElement('th');
        th.innerText = col;
        header.appendChild(th);
    });

    let usePreTag = false;

    // If there is only one record present, and in the record there is only one column present,
    // Write using 'pre' tags, so that blank spaces are preserved.
    if (data.length === 1 && data[0].length === 1)
        usePreTag = true;

    thead.appendChild(header);
    table.appendChild(thead);

    let tbody = document.createElement('tbody');
    table.appendChild(tbody);

    // Create Table Data rows
    data.forEach(record => {
        let tr = document.createElement('tr');

        record.forEach(cell => {
            let td = document.createElement('td');
            td.innerText = cell;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    return table;
}

function clearFooter(footerId, footerTextId) {
    // Remove the Alert, Error Message after five seconds.
    setTimeout(() => {
        document.getElementById(footerId).className = 'card-footer';
        document.getElementById(footerTextId).innerText = '';
        document.getElementById(footerId).style.marginLeft = '0px';
        document.getElementById(footerId).style.marginRight = '0px';
    }, 5000);
}


function prepareGraphData(graphRequiredAttributes, dataColumns, dataRecords) {
    let indices = [];
    console.log(graphRequiredAttributes);
    console.log(dataColumns);

    graphRequiredAttributes.forEach(attribute => {
        dataColumns.forEach((column, index) => {
            if (attribute.toLowerCase() === column.toLowerCase())
                indices.push(index);
        });
    });

    let data = [];

    dataRecords.forEach(list => {
        row = [];
        indices.forEach(index => row.push(list[index]));
        data.push(row);
    });

    return data;
}

/**
 * Fetch JSON Data from server.
 *
 * @param link
 * @returns {Promise<any>}
 */
async function fetchRemoteData(link) {
    let response = await fetch(link);
    let data = await response.json();
    return data;
}


function createTiles(all_queries) {
    let cardDeck = document.getElementById('dashboard-tiles');
    let tileCount = 0;

    let keys = Object.keys(queries);

    keys.forEach(key => {
        let query = queries[key];
        let tile = createDashboardTile(key, query);
        cardDeck.appendChild(tile);

        tileCount++;

        if (tileCount % 6 === 0) {
            let w100 = document.createElement('div');
            w100.className = 'w-100 my-2';
            cardDeck.appendChild(w100);
        }
    });
}

/**
 * Creates Dashboard Tile
 * @param key - Unique ID for a Query
 * @param query - Query object
 * @returns {HTMLDivElement}
 */
function createDashboardTile(key, query) {
    let card = document.createElement('div');
    card.className = 'card dashboard-title rounded-lg';

    // Tile Header
    let cardHeader = document.createElement('div');
    cardHeader.className = 'card-header';

    let headerIcon = document.createElement('i');
    let fontAwesomeIcon = icons[getRandomInt(icons.length)]
    headerIcon.className = `fas fa-2x mb-2 ${fontAwesomeIcon}`;
    cardHeader.appendChild(headerIcon);

    // Tile Body
    let cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    // Heading
    let bodyTitle = document.createElement('h5');
    bodyTitle.className = 'card-title';
    bodyTitle.innerText = query['heading'];

    // Caption
    let bodyText = document.createElement('p');
    bodyText.className = 'card-text';
    bodyText.innerText = query['caption'];

    // Count or Value
    let count = document.createElement('div');
    count.className = 'text-center';
    let span = document.createElement('span');
    span.className = 'lg-number';                   // Custom Class
    span.id = `${key}-tile-value`;
    span.style.color = getRandomColor();

    count.appendChild(span);

    cardBody.append(bodyTitle, bodyText, count);

    // Tile Footer
    let cardFooter = document.createElement('div');
    cardFooter.className = 'card-footer';

    // Create Status indicator
    let statusIndicator = document.createElement('button');
    statusIndicator.type = 'button';
    statusIndicator.className = 'btn btn-success btn-circle btn-sm';
    statusIndicator.id = `${key}-title-status-indicator`;

    let footerText = document.createElement('small');
    footerText.className = 'text-muted ml-2';
    footerText.innerText = '';
    footerText.id = `${key}-tile-footer-text`;
    cardFooter.append(statusIndicator, footerText);

    card.append(cardHeader, cardBody, cardFooter);

    // When mouse enters, add a Shadow
    card.addEventListener('mouseenter', (e) => {
        e.target.style.boxShadow = '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)';
    });

    // When mouse leaves, remove the Shadow
    card.addEventListener('mouseleave', (e) => {
        e.target.style.boxShadow = '';
    });

    // When clicked, Scroll to the corresponding table.
    card.addEventListener('click', (e) => {
        let tableId = `${key}-table`;
        document.getElementById(tableId)
            .scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                    inline: "start"
                }
            );
    });

    return card;
}

function formatText(text) {
    return text
        .replace(/\s/g, '-')
        .replace('(', '')
        .replace(')', '')
        .toLowerCase();
}

function camelCase(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function showSpinner(targetId) {
    let button = document.createElement('button');
    button.className = 'd-none d-sm-inline-block btn btn-sm btn-outline-light';
    button.id = 'spinner-button';

    let spinner = document.createElement('div');
    spinner.className = 'spinner-border text-success';
    spinner.setAttribute('role', 'status');

    let span = document.createElement('span');
    span.className = 'sr-only';
    spinner.appendChild(span);

    button.append(spinner);

    document.getElementById(targetId).append(button);
}

function removeSpinner(targetId) {
    document.getElementById(targetId).remove();
}


function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}


function createRefreshButton(form, queryId, autoRefreshTimeId, autoRefreshButtonId) {
    let input = document.createElement('input');
    input.type = 'number';
    input.className = 'form-control mr-2';
    input.placeholder = 'Refresh time in secs';
    input.id = autoRefreshTimeId;

    let button = document.createElement('btn');
    button.className = 'btn btn-primary';
    button.id = autoRefreshButtonId;
    button.setAttribute('query-id', queryId);

    let icon = document.createElement("i");
    icon.className = 'fas fa-redo';
    icon.setAttribute('query-id', queryId);
    button.append(icon);

    button.addEventListener('click', enableAutoRefreshOption);
    form.append(input, button);
    // return form;
}


/**
 * Creates a Text Box
 * @param id
 * @param message
 * @returns {HTMLInputElement}
 */
function createInputBox(id, message) {
    let input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control mr-2';
    input.placeholder = message;
    input.id = id;

    return input;
}

/**
 *
 * @param id
 * @param message
 * @param attributes
 */
function createButton(id, message, attributes) {
    let button = document.createElement('btn');
    button.className = 'btn btn-primary';
    button.id = id;
    button.innerText = message;
    attributes.forEach(att => button.setAttribute(att['key'], att['value']));

    return button;
}


function enableAutoRefreshOption(e) {
    console.log(e.target);
    let queryId = e.target.getAttribute('query-id');
    console.log(queryId);

    // Fetch Auto Refresh time from Input Box
    let autoRefreshTime = document.getElementById(`${queryId}-refresh-value`).value;

    // If no value is entered, return.
    if (autoRefreshTime === "")
        return;

    autoRefreshTime = parseInt(autoRefreshTime);

    // Set minimum 1 minute
    if (autoRefreshTime < 60) {
        autoRefreshTime = 20;
    }

    autoRefreshTime = autoRefreshTime * 1000;      // 1 sec = 1000 ms

    console.log(`Setting Auto Refrehs for ${queryId} to ${autoRefreshTime} milli secs`);
    window.setInterval(() => executeQuery(queryId, null), autoRefreshTime);
}

function getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
