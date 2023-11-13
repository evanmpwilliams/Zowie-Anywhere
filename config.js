function generateTables(tableDefinitions, containerId) {
  // Select the container using the container ID.
  var $container = $('#' + containerId);

  // Check if the container exists. If not, log an error and return.
  if ($container.length === 0) {
    console.error('Container not found');
    return;
  }

  // Iterate over each table definition.
  tableDefinitions.forEach(function (table) {
    // Skip the iteration if the table should not be rendered.
    if (!table.tableRender) return;

    // Create the table header wrapper and its contents.
    var $tableHeaderWrapper = $('<div/>', { class: 'table-header-wrapper' })
      .append($('<div/>', { class: 'table-header' })
        // Append the table title.
        .append($('<h2/>', { class: 'table-title', text: table.tableTitle }))
        // Append the table description.
        .append($('<p/>', { class: 'table-description', text: table.tableDescription })));

    // Check if table controls are to be added.
    if (table.tableControls) {
      // Create the table control group container.
      var $tableControlGroup = $('<div/>', { class: 'table-control-group' });

      // Create and append the search input and button.
      var $searchContainer = $('<div/>', { class: 'table-button table-control search-button-container' })
        .append($('<input/>', { class: 'table-search-input', type: 'search', placeholder: 'Search...', 'table-id': table.tableId }))
        .append($('<button/>', { class: 'config-button search-button search-event', 'table-id': table.tableId })
          .append($('<i/>', { class: 'config-icon search-icon search-event fa-regular fa-search fa-xl' })));

      // Create and append other control buttons: add, reset, backup, restore.
      var $addButtonContainer = createButtonContainer('add', table.tableId);
      var $resetButtonContainer = createButtonContainer('reset', table.tableId);
      var $backupButtonContainer = createButtonContainer('backup', table.tableId);
      var $restoreButtonContainer = createButtonContainer('restore', table.tableId);

      // Append all button containers to the control group.
      $tableControlGroup.append($searchContainer, $addButtonContainer, $resetButtonContainer, $backupButtonContainer, $restoreButtonContainer);

      // Append the control group to the table header wrapper.
      $tableHeaderWrapper.append($tableControlGroup);
    }

    // Create the table container and append the header wrapper and table.
    var $tableContainer = $('<div/>', { class: 'table-container' })
      .append($tableHeaderWrapper)
      .append($('<table/>', { id: table.tableId }));

    // Append the complete table container to the main container.
    $container.append($tableContainer);
  });

  // Helper function to create a button container with a specific type.
  function createButtonContainer(type, tableId) {
    return $('<div/>', { class: 'table-button table-control ' + type + '-button-container' })
      .append($('<button/>', { class: 'config-button ' + type + '-button ' + type + '-event', 'table-id': tableId })
        .append($('<i/>', { class: 'config-icon ' + type + '-icon ' + type + '-event fa-regular fa-' + iconType(type) + ' fa-xl' })));
  }

  // Helper function to determine the icon class based on the button type.
  function iconType(type) {
    switch (type) {
      case 'add': return 'plus';
      case 'reset': return 'rotate-left';
      case 'backup': return 'download';
      case 'restore': return 'upload';
      default: return '';
    }
  }
}


function loadTables(tableDefinitions) {
  // Iterate over each table definition in the array.
  tableDefinitions.forEach(tableDef => {
    // Check if the current table definition has 'tableRender' set to true.
    // This condition ensures that only tables intended to be rendered are processed.
    if (tableDef.tableRender) {
      // Call 'getDataAndPopulateTable' function for the current table definition.
      // This function is responsible for fetching the data and populating the table.
      getDataAndPopulateTable(tableDef);
    }
  });
}


/**
 * Asynchronously retrieves data from Chrome's storage.sync and populates a table.
 * @param {Object} tableDef - An object containing all table definitions including storageKey, tableId, defaultData, and tableColumns.
 */
async function getDataAndPopulateTable(tableDef) {
  try {

    // Attempt to retrieve data from Chrome Storage, falling back to tableDef.defaultData if necessary.
    const data = await getFromStorage(tableDef.tableStorageKey, tableDef.defaultData);

    // Populate the specified table with the retrieved (or default) data using table definitions.
    populateTable(tableDef, data);
  } catch (error) {
    console.error('Error retrieving data from Chrome Storage:', error);
  }
}

/**
 * Populates an HTML table with provided data and custom column classes.
 * @param {string} tableId - The ID of the table to populate.
 * @param {Object[]} jsonData - An array of objects representing the data to populate the table with.
 * @param {Object[]} tableColumns - An array representing column configurations, including classes.
 * @param {string} storageKey - The storage key to set as a data attribute on the table.
 */
function populateTable(tableDef, jsonData) {
  const tableId = tableDef.tableId;
  const storageKey = tableDef.tableStorageKey;

  if (!jsonData || jsonData.length === 0 || !document.getElementById(tableId)) {
    console.error(`Invalid input or Table with ID '${tableId}' not found.`);
    return;
  }

  const table = document.getElementById(tableId);
  table.setAttribute('data-source', storageKey);

  // Create and append the table header
  const thead = document.createElement('thead');
  table.appendChild(thead);
  addRowToTable(thead, tableDef, {}, 'th'); // Pass tableDef here

  // Create and append the table body
  const tbody = document.createElement('tbody');
  table.appendChild(tbody);
  jsonData.forEach(dataItem => {
    addRowToTable(tbody, tableDef, dataItem); // Pass tableDef here
  });



  // Add event listener for buttons in the table
  table.addEventListener('click', function (event) {
    const row = event.target.closest('tr');
    if (!row) return;

    // Handle delete button click
    if (event.target.classList.contains('delete-icon')) {
      tbody.removeChild(row);
      saveTableToStorage(tableId).then(() => {
        console.log('Table data saved successfully');
      }).catch(error => {
        console.error('Failed to save table data:', error);
      });
    }
    // Handle edit button click
    else if (event.target.classList.contains('edit-icon')) {
      makeRowEditable(row);
    }
    // Handle save button click
    else if (event.target.classList.contains('save-icon')) {
      row.dataset.newlyCreated = false;
      makeRowNotEditable(row);
      saveTableToStorage(tableId);

    }

    // Handle cancel button click
    else if (event.target.classList.contains('cancel-icon')) {
      console.log(row.dataset.newlyCreated);
      // Check if the row was newly created
      if (row.dataset.newlyCreated === 'true') {
        // The row was newly added and not yet saved, so remove it
        row.parentNode.removeChild(row);
      } else if (row.dataset.originalData) {
        // Retrieve the original data
        const originalData = JSON.parse(row.dataset.originalData);
        console.log(originalData);

        // Revert the cell contents to the original data
        Array.from(row.cells).forEach((cell, index) => {
          // Reset cells to their original content
          if (cell.classList.contains('col-actions')) {
            // Restore action cells with their original HTML
            cell.innerHTML = originalData[index];
          }

          else if (cell.classList.contains('col-color-select')) {
            cell.innerHTML = '';
            // Restore action cells with their original HTML
            const input = document.createElement('input');
            input.type = 'text';
            // Set the data-jscolor attribute to an empty string to initialize jscolor
            input.setAttribute('data-jscolor', '{}');
            input.className = "color-select disabled";
            input.value = originalData[index] || ''; // Set the initial color if available
            cell.appendChild(input);
          }

          else if (cell.classList.contains('col-active-flag')) {
            // Restore 'col-active-flag' cells with the original checkbox state
            const isChecked = originalData[index];
            // Retrieve rowIndex and columnKey
            const rowIndex = row.rowIndex || row.getAttribute('data-row-index');
            const columnKey = cell.getAttribute('columnKey');
            // Use the utility function to create the checkbox element
            const checkboxContainer = createActiveFlagCheckbox(isChecked, rowIndex, columnKey);
            // Clear the cell and append the rebuilt checkbox container
            cell.innerHTML = '';
            cell.appendChild(checkboxContainer);
          } else {
            // Restore text for all other cells
            cell.textContent = originalData[index];
          }
        });

        // Make the row not editable
        jscolor.install();
        makeRowNotEditable(row);

        // Remove the stored original data
        delete row.dataset.originalData;
      }
      // If the row was not newly created and there's no originalData,
      // here you may handle the case as appropriate for your application
    }


  });




  // Remove the 'hidden-table' class after the table has been fully populated
  table.classList.remove('hidden-table');
}

function createActiveFlagCheckbox(isChecked, rowIndex, columnKey) {
  const checkboxContainer = document.createElement('div');
  checkboxContainer.className = 'checkbox-container';

  const checkboxRound = document.createElement('div');
  checkboxRound.className = 'checkbox-round';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = isChecked;
  checkbox.style.pointerEvents = 'none'; // Ensuring the checkbox is not clickable by default

  // Generate a unique ID if rowIndex and columnKey are provided
  if (rowIndex !== undefined && columnKey !== undefined) {
    checkbox.id = `checkbox-${rowIndex}-${columnKey}`;
  }

  const label = document.createElement('label');
  // Set the 'for' attribute to the checkbox ID if it exists
  if (checkbox.id) {
    label.htmlFor = checkbox.id;
  }

  checkboxRound.appendChild(checkbox);
  checkboxRound.appendChild(label);
  checkboxContainer.appendChild(checkboxRound);

  return checkboxContainer;
}


function addRowToTable(tableSection, tableDef, rowData, cellType = 'td', position = 'end') {
  const rowIndex = tableSection.childNodes.length; // This will serve as a unique identifier for each row
  const row = document.createElement('tr');

  tableDef.tableColumns.forEach(({ columnKey, columnClass = '', columnHeader = '' }) => {
    const cell = document.createElement(cellType);
    cell.setAttribute('columnKey', columnKey); // Set columnKey attribute for all cells
    cell.className = columnClass; // Set class for all cells

    // Custom checkbox creation for 'col-active-flag' class
    if (cell.classList.contains('col-active-flag') && cellType === 'td') {
      const checkboxContainer = createActiveFlagCheckbox(rowData[columnKey] === true, rowIndex, columnKey);
      cell.appendChild(checkboxContainer);
    }
    // Handle 'col-image' cells
    else if (cell.classList.contains('col-image') && cellType === 'td') {
      const image = document.createElement('img');
      if (typeof rowData[columnKey] === 'string' && rowData[columnKey].trim() !== '') {
        image.src = rowData[columnKey];
      }
      image.alt = 'Image not available'; // Alternative text in case the image cannot be displayed
      image.className = "img-logo-preview";
      cell.appendChild(image);
    } // Handle 'col-color-select' cells
    else if (cell.classList.contains('col-color-select') && cellType === 'td') {
      const input = document.createElement('input');
      input.type = 'text';
      // Set the data-jscolor attribute to an empty string to initialize jscolor
      input.setAttribute('data-jscolor', '{}');
      input.className = "color-select disabled";
      input.value = rowData[columnKey] || ''; // Set the initial color if available
      cell.appendChild(input);

      // After appending the input to the cell, you no longer need to call jscolor.installByClassName
      // jscolor will automatically initialize elements with the data-jscolor attribute

    }

    else if (columnKey === 'proactiveChatOpenDelay') {
      if (cellType === 'td') {
        cell.setAttribute('data-open-delay', rowData[columnKey] !== null && rowData[columnKey] !== undefined ? rowData[columnKey] : ''); // Store the value in a data attribute for td elements
        if (rowData['proactiveChatAutoOpen'] !== 'Automatically') {
          cell.style.visibility = 'hidden'; // Hide the text content for td elements
        }
      }
      cell.textContent = cellType === 'th' ? columnHeader : (rowData[columnKey] !== null && rowData[columnKey] !== undefined ? rowData[columnKey] : '');
    }


    else {
      // Handle other cells
      cell.textContent = cellType === 'th' ? columnHeader : rowData[columnKey] || '';
    }

    row.appendChild(cell);
  });

  // Add the actions cell only if tableEditable is true
  if (tableDef.tableEditable) {
    const actionsCell = document.createElement(cellType);
    actionsCell.innerHTML = cellType === 'td' ? actionsButtons : 'Actions';
    actionsCell.className = 'col-actions col-not-content-editable';
    actionsCell.setAttribute('columnKey', 'actions');
    row.appendChild(actionsCell);
  }

  // Determine where to add the new row based on the position argument
  if (position === 'start' && tableSection.firstChild) {
    // Insert the new row at the start of the tableSection
    tableSection.insertBefore(row, tableSection.firstChild);
  } else if (typeof position === 'number' && tableSection.children[position]) {
    // Insert the new row at the specified index (if it exists)
    tableSection.insertBefore(row, tableSection.children[position]);
  } else {
    // By default, append the new row at the end
    tableSection.appendChild(row);
  }
  jscolor.install();

  return row;
}



function createSelect2ForCell(cell, currentValue) {
  // Retrieve the columnKey directly from the cell's attributes
  const columnKey = cell.getAttribute('columnkey');

  // Find the corresponding columnOptions from select2Options
  const columnOptions = select2Options.find(option => option.columnKey === columnKey)?.columnOptions || [];

  // Build the select element with the appropriate options
  let selectHTML = `<select class="option-type-select">`;
  for (const option of columnOptions) {
    selectHTML += `<option value="${option}"${currentValue === option ? ' selected' : ''}>${option}</option>`;
  }
  selectHTML += `</select>`;
  cell.innerHTML = selectHTML;

  // Initialize the Select2 plugin on the new <select> element
  $(cell).find('.option-type-select').select2({
    minimumResultsForSearch: Infinity, // to hide the search box
    width: '140px' // Set the width of the select2
  });

  // You can add more Select2 options here as needed
}


function makeRowEditable(row) {
  if (!row) return console.error('Provided row is null or undefined');

  // Store the current data for later, in case we need to cancel the edit
  row.dataset.originalData = JSON.stringify(Array.from(row.cells).map(cell => {
    if (cell.classList.contains('col-actions')) {
      return cell.innerHTML;
    } else if (cell.classList.contains('col-active-flag')) {
      const checkbox = cell.querySelector('input[type="checkbox"]');
      return checkbox ? checkbox.checked : false;
    }
    else if (cell.classList.contains('col-image')) {
      const image = cell.querySelector('img');
      return image ? image.src : '';
    }
    else if (cell.classList.contains('col-color-select')) {
      const colorSelect = cell.querySelector('input[type="text"]');
      return colorSelect ? colorSelect.value : null;
    }
    else {
      return cell.textContent;
    }
  }));

  // Make cells editable
  Array.from(row.cells).forEach(cell => {
    if (cell.classList.contains('col-image')) {
      // Get the image element
      const image = cell.querySelector('img');

      // Use getAttribute to accurately check if src is set and not empty
      const srcValue = image ? image.getAttribute('src') : null;

      if (srcValue && srcValue.trim() !== '') {
        // If src attribute exists and is not just whitespace
        cell.textContent = srcValue;
      } else {
        // If src attribute is not set, is null, empty, or just whitespace
        cell.textContent = '';
      }

      cell.contentEditable = 'true';
    } else if (cell.classList.contains('col-dropdown-select')) {
      const currentValue = cell.textContent.trim();
      createSelect2ForCell(cell, currentValue);

    } else if (cell.classList.contains('col-color-select')) {
      const colorSelectInput = cell.querySelector('input[type="text"]');
      colorSelectInput.classList.remove('disabled');

    }



    else if (!cell.classList.contains('col-not-content-editable')) {
      cell.contentEditable = 'true';
    }
  });

  // Handle checkboxes to make them clickable
  Array.from(row.querySelectorAll('.checkbox-round label')).forEach(checkbox => {
    // Check if the parent `td` of this checkbox does not have the class 'col-not-active-editable'
    if (!checkbox.closest('td.col-not-active-editable')) {
      checkbox.classList.add('clickable');
    }
  });


  // Find the icons in the row
  const icons = {
    editIcon: row.querySelector('.edit-icon'),
    saveIcon: row.querySelector('.save-icon'),
    deleteIcon: row.querySelector('.delete-icon'),
    cancelIcon: row.querySelector('.cancel-icon')
  };

  // Validate the existence of action icons
  if (!icons.editIcon || !icons.saveIcon || !icons.deleteIcon || !icons.cancelIcon) {
    return console.error('One or more action icons not found in the row');
  }

  // Hide edit and delete icons, show save and cancel icons
  icons.editIcon.style.display = 'none';
  icons.saveIcon.style.display = '';
  icons.deleteIcon.style.display = 'none';
  icons.cancelIcon.style.display = '';
}



function makeRowNotEditable(row) {
  if (!row) {
    console.error('Provided row is null or undefined');
    return;
  }

  let autoOpenValue;

  // Make cells not editable and handle special cases
  Array.from(row.cells).forEach(cell => {
    // Reset contentEditable attribute
    cell.contentEditable = 'false';

    // Handle cells with select2
    if (cell.classList.contains('col-dropdown-select')) {
      // Find the select element within the cell
      const selectElement = cell.querySelector('select');
      if (selectElement) {
        // Get the selected value
        const selectedValue = $(selectElement).select2('data')[0].text;

        // Destroy the select2 instance
        $(selectElement).select2('destroy');

        // Replace the cell's HTML with the selected value text
        cell.textContent = selectedValue;
      }
    }

    if (cell.classList.contains('col-image')) {
      const imageUrl = cell.textContent.trim();
      console.log("Current image url is " + imageUrl);
      // Clear the current text content
      cell.textContent = '';
      // Create an image element and set its src attribute
      const image = document.createElement('img');
      image.src = imageUrl;
      image.className = 'img-logo-preview';
      // Append the image to the cell
      cell.appendChild(image);
    }

    if (cell.classList.contains('col-color-select')) {

      const inputElement = cell.querySelector('input');
      inputElement.classList.add('disabled');

    }

    if (cell.getAttribute('columnKey') === 'proactiveChatAutoOpen') {
      const openTypeValue = cell.textContent.trim();
      const openDelayCell = row.querySelector('td[columnKey="proactiveChatOpenDelay"]');

      if (openDelayCell) {
        openDelayCell.style.visibility = openTypeValue === 'Automatically' ? '' : 'hidden';
      }
    }



    // Handle checkboxes to make them clickable
    Array.from(row.querySelectorAll('.checkbox-round label')).forEach(checkbox => {
      // Check if the parent `td` of this checkbox does not have the class 'col-not-active-editable'
      if (!checkbox.closest('td.col-not-active-editable')) {
        checkbox.classList.remove('clickable');
      }
    });


  });




  // Find and update the state of action icons
  const actionCell = row.querySelector('.col-actions');
  if (actionCell) {
    const icons = {
      editIcon: actionCell.querySelector('.edit-icon'),
      saveIcon: actionCell.querySelector('.save-icon'),
      deleteIcon: actionCell.querySelector('.delete-icon'),
      cancelIcon: actionCell.querySelector('.cancel-icon')
    };

    // Validate the existence of action icons
    if (!icons.editIcon || !icons.saveIcon || !icons.deleteIcon || !icons.cancelIcon) {
      return console.error('One or more action icons not found in the row');
    }

    // Show edit and delete icons, hide save and cancel icons
    icons.editIcon.style.display = '';
    icons.saveIcon.style.display = 'none';
    icons.deleteIcon.style.display = '';
    icons.cancelIcon.style.display = 'none';
  } else {
    console.error('Actions cell not found in the row');
  }
}



async function saveTableToStorage(tableId) {
  const table = document.getElementById(tableId);
  if (!table) {
    return console.error(`Table with ID '${tableId}' not found.`);
  }

  const dataSourceKey = table.getAttribute('data-source');
  if (!dataSourceKey) {
    return console.error(`The 'data-source' attribute is not set for table with ID '${tableId}'.`);
  }

  const data = getTableData(tableId);
  if (!data) {
    return; // Data is null, meaning the table was not found, so we exit the function.
  }

  try {
    await setToStorage(dataSourceKey, data);
    console.log(`Table data saved to storage with key '${dataSourceKey}'.`);
  } catch (error) {
    console.error('Failed to save table data to storage:', error);
  }
}



function getTableData(tableId) {
  const table = document.getElementById(tableId);
  if (!table) {
    console.error(`Table with ID '${tableId}' not found.`);
    return null; // Return null to indicate that the table was not found.
  }

  return Array.from(table.querySelectorAll('tbody tr')).map(row => {
    const rowData = {};
    Array.from(row.children).forEach(cell => {
      const columnKey = cell.getAttribute('columnKey');
      if (columnKey) {
        if (cell.classList.contains('col-active-flag')) {
          const checkbox = cell.querySelector('input[type="checkbox"]');
          rowData[columnKey] = checkbox ? checkbox.checked : false;
        } else if (cell.classList.contains('col-image')) {
          const image = cell.querySelector('img');
          rowData[columnKey] = image ? image.src : null;
        }
        else if (cell.classList.contains('col-color-select')) {
          const colorSelect = cell.querySelector('input[type="text"]');
          rowData[columnKey] = colorSelect ? colorSelect.value : null;
        }
        else if (columnKey !== 'actions') {
          rowData[columnKey] = cell.textContent.trim();
        }
      }
    });
    return rowData;
  });
}


// Utility function to find a table definition by tableId
function findTableDefinitionById(tableId) {
  return tableDefinitions.find(def => def.tableId === tableId);
}

document.addEventListener('DOMContentLoaded', () => {



  generateTables(tableDefinitions, "config-content");
  loadTables(tableDefinitions);
  setupEventListeners();
  setUpTableSearch();

  // Initial setup, only done once
  const proceedButton = document.getElementById('proceed-button');
  proceedButton.addEventListener('click', proceedButtonHandler);

  const cancelButton = document.getElementById('cancel-button');
  cancelButton.addEventListener('click', cancelButtonHandler);


  $('#proactive-chat-table').on('select2:select select2:unselect', 'select', function (event) {
    // This function will be called when a select2 element changes
    const newValue = $(this).val();
    console.log("dropdown changed to:", newValue); // For debugging

    const row = $(this).closest('tr');
    const openDelayCell = row.find('td[columnKey="proactiveChatOpenDelay"]');

    if (openDelayCell.length) {
      openDelayCell.css('visibility', newValue === 'Automatically' ? '' : 'hidden');
    }
  });




});

function setupEventListeners() {
  document.addEventListener('click', function (event) {

    // Handle search button click
    if (event.target.matches('.search-event') || event.target.closest('.search-button')) {
      animateIconInButton(event, '.search-button', 'i.search-icon', 'zoom-animation');
      event.target.closest('.search-button').classList.toggle('search-button-open');
      // Get the table-id attribute from the button
      var tableId = event.target.closest('.search-button').getAttribute('table-id');
      if (tableId) {
        // Find the search input with the same table-id
        var searchInput = document.querySelector('.table-search-input[table-id="' + tableId + '"]');

        if (searchInput) {
          // Toggle the visibility class on the search input
          searchInput.classList.toggle('show-search-input');
          if (searchInput.classList.contains('show-search-input')) {
            searchInput.style.width = ""; // Reset width to default if needed
            setTimeout(function () { // Delay focus to ensure visibility
              searchInput.focus();
            }, 500); // Adjust time to match your CSS transition
          } else {
            searchInput.style.width = "0"; // Hide the input
          }
        }
      }
    }



    // Add event listener for blur event on all .table-search-input elements
    document.querySelectorAll('.table-search-input').forEach(function (input) {
      input.addEventListener('blur', function (event) {
        // Remove the .show-search-input class when the input loses focus
        event.target.classList.remove('show-search-input');
        event.target.style.width = "0"; // Hide the input

        // Clear the content of the search input
        event.target.value = "";


        // Manually dispatch an 'input' event
        var inputEvent = new Event('input', { bubbles: true, cancelable: true });
        event.target.dispatchEvent(inputEvent);

        // Find the sibling .search-button and remove the 'search-button-open' class
        var searchButton = event.target.nextElementSibling;
        if (searchButton && searchButton.classList.contains('search-button')) {
          searchButton.classList.remove('search-button-open');
        }
      });
    });




    if (event.target.matches('.add-event')) {
      animateIconInButton(event, '.add-button', 'i.add-icon', 'spin-animation');
      var tableId = event.target.closest('.add-button').getAttribute('table-id');
      const tableDef = findTableDefinitionById(tableId);

      if (!tableDef) {
        console.error('Table definition not found for tableId:', tableId);
        return;
      }

      const table = document.getElementById(tableId);
      const tableSection = table.querySelector('tbody') || table; // Fallback to table if no tbody

      // Call your addRowToTable function with the necessary parameters
      const newRow = addRowToTable(tableSection, tableDef, {}, 'td', 'start');

      // Make sure newRow is not undefined or null before making it editable
      if (newRow) {
        newRow.dataset.newlyCreated = true;
        makeRowEditable(newRow);
      } else {
        console.error('New row was not created.');
      }
    }

    // Handle reset button click
    if (event.target.matches('.reset-event')) {
      animateIconInButton(event, '.reset-button', 'i.reset-icon', 'spin-animation');
      var tableId = event.target.closest('.reset-button').getAttribute('table-id');
      const tableDef = findTableDefinitionById(tableId);

      // Make the warning-container visible
      const tableName = tableDef.tableTitle.toLowerCase();
      const tableData = tableDef.tableStorageKey;
      document.getElementById('warning-text').textContent = `
      Resetting the ${tableName} table will replace the existing data in the table with the default ${tableData}.
      None of the data currently saved in the table will be retained.
      Please only proceed if you are ok with losing your existing data and resetting the ${tableName} table with the default ${tableData}.
      `;
      const warningContainer = document.querySelector('#warning-container');
      const overlay = document.querySelector('#overlay');

      // For reset event
      document.getElementById('proceed-button').setAttribute('data-table-id', tableId);
      document.getElementById('proceed-button').setAttribute('data-action-type', 'reset');
      setTimeout(function () {
        overlay.style.display = 'block';
        warningContainer.style.display = 'block';

      }, 500);


    }


    if (event.target.matches('.backup-event')) {
      animateIconInButton(event, '.backup-button', 'i.backup-icon', 'bounce-animation');
      var tableId = event.target.closest('.backup-button').getAttribute('table-id');
      backupTable(tableId);
    }

    if (event.target.matches('.restore-event')) {
      animateIconInButton(event, '.restore-button', 'i.restore-icon', 'bounce-animation');
      var tableId = event.target.closest('.restore-button').getAttribute('table-id');
      const tableDef = findTableDefinitionById(tableId);
      // Make the warning-container visible
      const tableName = tableDef.tableTitle.toLowerCase();
      const tableData = tableDef.tableStorageKey;
      document.getElementById('warning-text').textContent = `
      Restoring a backup of the ${tableName} table will replace the existing data in the table with data from a backup file.
      None of the data currently saved in the table will be retained.
      Please only proceed if you are ok with losing your existing data and restoring a backup of the ${tableName} table .
      `;
      const warningContainer = document.querySelector('#warning-container');
      const overlay = document.querySelector('#overlay');
      // For restore event
      document.getElementById('proceed-button').setAttribute('data-table-id', tableId);
      document.getElementById('proceed-button').setAttribute('data-action-type', 'restore');

      setTimeout(function () {
        overlay.style.display = 'block';
        warningContainer.style.display = 'block';

      }, 500);
    }




  });
}

function setUpTableSearch() {
  // Function to escape RegExp special characters
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Function to highlight the matching text
  function highlightText(text, term) {
    const escapedTerm = escapeRegExp(term);
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  // Function to handle the search
  function handleSearchEvent() {
    const searchTerm = this.value.toLowerCase();
    const tableId = this.getAttribute('table-id');
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');

    if (!tbody) return;

    // Iterate over rows in the tbody
    Array.from(tbody.getElementsByTagName('tr')).forEach(row => {
      // Search only within cells that have the 'col-searchable-text' class
      let searchableCells = Array.from(row.getElementsByClassName('col-searchable-text'));
      let rowTextContent = searchableCells.map(cell => cell.textContent.toLowerCase()).join(' ');
      let matched = searchTerm === '' || rowTextContent.includes(searchTerm);
      row.style.display = matched ? '' : 'none'; // Hide or show the row

      if (matched && searchTerm !== '') {
        // Highlight matches in searchable cells
        searchableCells.forEach(cell => {
          cell.innerHTML = highlightText(cell.textContent, searchTerm);
        });
      } else {
        // Remove highlighting if searchTerm is cleared or not matched
        searchableCells.forEach(cell => {
          cell.innerHTML = cell.textContent;
        });
      }
    });
  }

  // Add an event listener to all search inputs
  const searchInputs = document.querySelectorAll('.table-search-input');

  searchInputs.forEach(input => {
    input.removeEventListener('input', handleSearchEvent); // Remove previous listener if any
    input.addEventListener('input', handleSearchEvent);
  });
}


function clearTable(table) {
  // Clear the table body (tbody)
  const tbody = table.querySelector('tbody');
  if (tbody) {
    tbody.remove(); // This will remove the tbody element itself
  }

  // Clear the table header (thead)
  const thead = table.querySelector('thead');
  if (thead) {
    thead.remove(); // This will remove the thead element itself
  }

  // If your table has a <tfoot>, you would clear it here in a similar way.
}

function animateIconInButton(event, buttonSelector, iconSelector, animationClassName) {
  // Use the buttonSelector to find the button and then the iconSelector to find the icon within it
  const button = event.target.closest(buttonSelector);
  if (button) {
    const icon = button.querySelector(iconSelector);
    if (icon) {
      // Add the animation class to the icon
      icon.classList.add(animationClassName);

      // Remove the animation class after the animation completes
      icon.addEventListener('animationend', function () {
        icon.classList.remove(animationClassName);
      }, { once: true });
    }
  }
}

function backupTable(tableId) {
  const table = document.getElementById(tableId);
  if (!table) {
    console.error(`Table with ID '${tableId}' not found.`);
    return;
  }

  const dataSourceKey = table.getAttribute('data-source');
  if (!dataSourceKey) {
    console.error(`The 'data-source' attribute is not set for table with ID '${tableId}'.`);
    return;
  }

  const data = getTableData(tableId);
  if (!data) {
    console.error('No data to backup for table:', tableId);
    return;
  }

  // Convert data to JSON string
  const json = JSON.stringify(data, null, 2); // The '2' argument for pretty-printing

  // Create a Blob with the JSON data
  const blob = new Blob([json], { type: 'application/json' });

  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

// Format the datetime stamp for the filename
const date = new Date();
const dateStamp = date.toISOString().split('T')[0].replace(/-/g, '');
const timePart = date.toISOString().split('T')[1];
const timeStamp = timePart.split(':')[0] + timePart.split(':')[1] + timePart.split(':')[2].substring(0, 2);
const datetimeStamp = `${dateStamp}-${timeStamp}`;


  // Create an anchor element and set properties for download
  const a = document.createElement('a');
  a.href = url;
  a.download = `${dataSourceKey}-backup-${datetimeStamp}.json`; // The file name for the download

  // Append the anchor to the body temporarily to make it clickable
  document.body.appendChild(a);

  // Programmatically click the anchor to trigger the download
  a.click();

  // Clean-up: revoke the object URL and remove the anchor element
  setTimeout(() => { // Timeout to ensure revoking URL doesn't happen before saving
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 100);
}

// This function needs to be called with a valid tableId which has a 'data-source' attribute.
// Example usage: backupTable('myTableId');

function restoreData(tableId) {
  console.log(tableId);
  // Create a file input element
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json'; // Accept only .json files

  // Listen for file selection
  fileInput.onchange = async (event) => {
    // Get the selected file
    const file = event.target.files[0];
    if (!file) {
      return console.error('No file selected.');
    }

    // Read the file as text
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // Parse the file content as JSON
        const jsonData = JSON.parse(e.target.result);

        // Find the table definition by tableId
        const tableDef = await findTableDefinitionById(tableId);
        if (!tableDef) {
          return console.error(`Table definition not found for ID '${tableId}'.`);
        }
        var tableObject = document.getElementById(tableId);
        clearTable(tableObject);
        // Call the populateTable function with the table definition and JSON data
        await populateTable(tableDef, jsonData);
        console.log('Table data has been restored.');
        saveTableToStorage(tableId);
      } catch (error) {
        console.error('Failed to parse JSON file or populate table:', error);
      }
    };
    reader.onerror = () => console.error('Failed to read the file.');
    reader.readAsText(file); // Read the file content
  };

  // Programmatically click the file input to open the file dialog
  fileInput.click();

}




// Named function for proceed button click event
function proceedButtonHandler() {
  const overlay = document.querySelector('#overlay');
  const warningContainer = document.querySelector('#warning-container');
  overlay.style.display = 'none';
  warningContainer.style.display = 'none';

  const tableId = this.getAttribute('data-table-id'); // 'this' refers to the button that was clicked
  const actionType = this.getAttribute('data-action-type');
  const tableDef = findTableDefinitionById(tableId);

  if (!tableDef) {
    console.error('Table definition not found for tableId:', tableId);
    return;
  }

  // Perform the action depending on the current action type
  if (actionType === 'restore') {
    restoreData(tableId);
  } else if (actionType === 'reset') {
    // Find the corresponding table and clear it
    const table = document.getElementById(tableId);
    clearTable(table);

    // Now repopulate the table with the default data
    populateTable(tableDef, tableDef.defaultData);

    // Since data is reset to default, it could be a good idea to update the storage
    saveTableToStorage(tableId).then(() => {
      console.log('Table data reset and saved successfully');
    }).catch(error => {
      console.error('Failed to reset and save table data:', error);
    });
  }

  // No need to remove the event listener as it will be reused
}


// Named function for cancel button click event
function cancelButtonHandler(event) {
  const overlay = document.querySelector('#overlay');
  const warningContainer = document.querySelector('#warning-container');
  overlay.style.display = 'none';
  warningContainer.style.display = 'none';

  // Get the proceed button and remove its event listener
  //const proceedButton = document.getElementById('proceed-button');
  //proceedButton.removeEventListener('click', proceedButtonHandler);
}


