let configWidgetRunning = false;
let configWidgetMd = {};

document.addEventListener('DOMContentLoaded', function () {

    loadTables();


    var restoreButton = document.getElementById('restoreConfig');
    restoreButton.addEventListener('click', function () {
        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';

        fileInput.addEventListener('change', function () {
            var file = fileInput.files[0];
            if (file) {
                var reader = new FileReader();

                reader.onload = function () {
                    try {
                        var widgetConfigs = JSON.parse(reader.result);

                        chrome.storage.sync.set({ widgetConfigs: widgetConfigs }, function () {
                            if (chrome.runtime.lastError) {
                                console.error('Error saving widgetConfigs:', chrome.runtime.lastError);
                            } else {
                                console.log('Configuration restored successfully!');
                                clearTables();
                                loadTables();
                            }
                        });

                    } catch (error) {
                        console.error('Error parsing JSON:', error);
                    }
                };

                reader.onerror = function () {
                    console.error('Error reading file:', reader.error);
                };

                reader.readAsText(file);
            }
        }, false);

        fileInput.click();
    }, false);


    var backupButton = document.getElementById('backupConfig');
    backupButton.addEventListener('click', async function () {
        try {
            const widgetConfigs = await getConfigData();

            const blob = new Blob([JSON.stringify(widgetConfigs, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'widgetConfigs.json';
            a.click();

            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error fetching widgetConfigs:', error);
        }
    }, false);



    document.getElementById('addInstance').addEventListener('click', function () {
        addInstanceRowToTable('', '', false);  // Added 'active' parameter
        let lastRow = document.querySelector('#widgetInstancesTable tbody tr:last-child');
        makeRowEditable(lastRow);
        let activeCheckbox = lastRow.querySelector('.active input[type="checkbox"]');
        if (activeCheckbox) {
            activeCheckbox.disabled = false;
        }
    });

    document.getElementById('addBrand').addEventListener('click', function () {
        addBrandRowToTable('', '#000000', '#000000', '', '', '', '', '', false);  // Added 'active' parameter
        let lastRow = document.querySelector('#widgetBrandsTable tbody tr:last-child');
        makeRowEditable(lastRow);
        let activeCheckbox = lastRow.querySelector('.active input[type="checkbox"]');
        if (activeCheckbox) {
            activeCheckbox.disabled = false;
        }
    });
});
let colorFields = ['headerColor', 'textBackgroundColor'];

function clearTables() {
    const tableIds = ['widgetInstancesTable', 'widgetBrandsTable', 'widgetExtrasTable'];

    for (const tableId of tableIds) {
        const table = document.getElementById(tableId);
        if (table) {
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => row.remove());
        } else {
            console.error(`Table with ID ${tableId} not found.`);
        }
    }
}

async function loadTables() {
    let result = await getConfigData();
    console.log(result);
    console.log(result.widgetRunning);
    configWidgetRunning = result.widgetRunning;

    if (result.widgetInstances && result.widgetInstances.length) {
        result.widgetInstances.forEach(instance => {
            addInstanceRowToTable(instance.id, instance.text, instance.active);
        });
    } else {
        let defaultInstance = defaultWidgetConfig.widgetInstances[0];
        addInstanceRowToTable(defaultInstance.id, defaultInstance.text, defaultInstance.active);
    }

    if (result.widgetBrands && result.widgetBrands.length) {
        result.widgetBrands.forEach(brand => {
            addBrandRowToTable(brand.name, brand.headerColor, brand.textBackgroundColor, brand.logoUrl, brand.headerTitle, brand.headerSubtitle, brand.ctaHeader, brand.ctaText, brand.active);
        });
    } else {
        let defaultBrand = defaultWidgetConfig.widgetBrands[0];
        addBrandRowToTable(defaultBrand.name, defaultBrand.headerColor, defaultBrand.textBackgroundColor, defaultBrand.logoUrl, defaultBrand.headerTitle, defaultBrand.headerSubtitle, defaultBrand.ctaHeader, defaultBrand.ctaText, defaultBrand.active);
    }

    if (result.widgetMetadata && Object.keys(result.widgetMetadata).length !== 0) {
        populateExtrasTable(
            result.widgetMetadata.returningUserCtaHeader,
            result.widgetMetadata.returningUserCtaText,
            result.widgetMetadata.buyingIntentCtaHeader,
            result.widgetMetadata.buyingIntentCtaText,
            result.widgetMetadata.userFirstName,
            result.widgetMetadata.userLastName,
            result.widgetMetadata.userEmail
        );
    } else {
        let defaultMetadata = defaultWidgetConfig.widgetMetadata;
        populateExtrasTable(
            defaultMetadata.returningUserCtaHeader,
            defaultMetadata.returningUserCtaText,
            defaultMetadata.buyingIntentCtaHeader,
            defaultMetadata.buyingIntentCtaText,
            defaultMetadata.userFirstName,
            defaultMetadata.userLastName,
            defaultMetadata.userEmail
        );
    }

   
}



function populateExtrasTable(returningUserCtaHeader, returningUserCtaText, buyingIntentCtaHeader, buyingIntentCtaText, userFirstName, userLastName, userEmail) {
    let table = document.getElementById('widgetExtrasTable').querySelector('tbody');
    let tr = document.createElement('tr');
    tr.innerHTML = `
    <td class="returningUserCtaHeader">${returningUserCtaHeader}</td>
    <td class="returningUserCtaText">${returningUserCtaText}</td>
    <td class="buyingIntentCtaHeader">${buyingIntentCtaHeader}</td>
    <td class="buyingIntentCtaText">${buyingIntentCtaText}</td>
    <td class="userFirstName">${userFirstName}</td>
    <td class="userLastName">${userLastName}</td>
    <td class="userEmail">${userEmail}</td>
    <td class="actions">
        <button class="edit">Edit</button>
        <button class="save" style="display:none;">Save</button>
        <button class="delete">Delete</button>
    </td>
`;

    table.appendChild(tr);

    attachRowListeners(tr);
}


function addInstanceRowToTable(id, text, active) {
    let table = document.getElementById('widgetInstancesTable').querySelector('tbody');
    let tr = document.createElement('tr');
    tr.innerHTML = `
        <td class="text">${text}</td>
        <td class="id">${id}</td>
        <td class="active"><input type="checkbox" ${active ? 'checked' : ''} disabled></td>
        <td class="actions">
            <button class="edit">Edit</button>
            <button class="save" style="display:none;">Save</button>
            <button class="delete">Delete</button>
            
        </td>
    `;
    let activeCheckbox = tr.querySelector('.active input[type="checkbox"]');
    activeCheckbox.addEventListener('change', function () {
        if (this.checked) {
            uncheckAllActiveCheckboxes(this, table.parentElement); // Using table.parentElement to get the whole table
        }
    });
    table.appendChild(tr);
    

    attachRowListeners(tr);
}

function addBrandRowToTable(name, headerColor, textBackgroundColor, logoUrl, headerTitle, headerSubtitle, ctaHeader, ctaText, active) {
    let table = document.getElementById('widgetBrandsTable').querySelector('tbody');
    let tr = document.createElement('tr');
    tr.innerHTML = `
        <td class="name">${name}</td>
        <td class="headerColor">
                <input type="text" data-jscolor="{}" class="color-picker disabled"  value="${headerColor}">
        </td>
        <td class="textBackgroundColor">
                <input type="text" data-jscolor="{}" class="color-picker disabled"  value="${textBackgroundColor}">
        </td>
        <td class="logoUrl"><img src="${logoUrl}" alt="Logo Preview" class="logo-preview"></td>
        <td class="headerTitle">${headerTitle}</td>
        <td class="headerSubtitle">${headerSubtitle}</td>
        <td class="ctaHeader">${ctaHeader}</td>
        <td class="ctaText">${ctaText}</td>
        <td class="active"><input type="checkbox" ${active ? 'checked' : ''} disabled></td>
        <td class="actions">
            <button class="edit">Edit</button>
            <button class="save" style="display:none;">Save</button>
            <button class="delete">Delete</button>
        </td>
    `;
    let activeCheckbox = tr.querySelector('.active input[type="checkbox"]');
    activeCheckbox.addEventListener('change', function () {
        if (this.checked) {
            uncheckAllActiveCheckboxes(this, table.parentElement); // Using table.parentElement to get the whole table
        }
    });
    table.appendChild(tr);
    jscolor.install();

    attachRowListeners(tr);
}

function makeRowEditable(tr) {
    let tds = tr.querySelectorAll('td:not(:last-child)');
    tds.forEach(td => {
        td.setAttribute('contentEditable', true);
        td.classList.add('editable');
    });

    let editButton = tr.querySelector('.edit');
    if (editButton) {
        editButton.style.display = 'none';
    }

    let deleteButton = tr.querySelector('.delete');
    if (deleteButton) {
        deleteButton.style.display = 'inline-block';
    }

    let saveButton = tr.querySelector('.save');
    if (saveButton) {
        saveButton.style.display = 'inline-block';
    }

    let logoTd = tr.querySelector('.logoUrl');
    if (logoTd) {
        let logoImg = logoTd.querySelector('img');
        console.log(logoImg);
        let logoSrc = logoImg ? logoImg.getAttribute('src') : '';
        console.log(logoSrc);
        logoTd.innerHTML = `<div contenteditable="false"><input type="text" value="${logoSrc}" style="width:100%"></div>`;
        logoTd.setAttribute('contentEditable', 'false');
    }

    colorFields.forEach(field => {
        let td = tr.querySelector(`.${field}`);
        if (td) {
            // Find input elements with class 'coloris-picker' inside the td
            let colorPickers = td.querySelectorAll('.color-picker');
            // Remove 'coloris-disabled' class from each color picker
            colorPickers.forEach(colorPicker => {
                colorPicker.classList.remove('disabled');
            });

            // Set the contentEditable attribute of the td to false
            td.setAttribute('contentEditable', 'false');
        }
    });


    let activeCheckbox = tr.querySelector('.active input[type="checkbox"]');
    if (activeCheckbox) {
        activeCheckbox.disabled = false;  // Enable checkbox when editing
    }
}


function attachRowListeners(tr) {
    let editButton = tr.querySelector('.edit');
    let deleteButton = tr.querySelector('.delete');
    let saveButton = tr.querySelector('.save');

    if (editButton) {
        editButton.addEventListener('click', function () {
            makeRowEditable(tr);
        });
    }

    if (deleteButton) {
        deleteButton.addEventListener('click', function () {
            let parentTable = tr.closest('tbody');
            let rowCountBeforeDelete = parentTable.querySelectorAll('tr').length;
            tr.remove();

            // Only if there was more than one row before deletion
            if (rowCountBeforeDelete === 2) {
                parentTable.querySelector('tr .active input[type="checkbox"]').checked = true;
            }

            updateStorage();
        });
    }

    if (saveButton) {
        saveButton.addEventListener('click', function () {
            let tds = tr.querySelectorAll('.editable');
            tds.forEach(td => {
                td.removeAttribute('contentEditable');
                td.classList.remove('editable');
            });

            colorFields.forEach(field => {
                let td = tr.querySelector(`.${field}`);
                if (td) {
                    // Find input elements with class 'coloris-picker' inside the td
                    let colorPickers = td.querySelectorAll('.color-picker');
                    // Remove 'coloris-disabled' class from each color picker
                    colorPickers.forEach(colorPicker => {
                        colorPicker.classList.add('disabled');
                    });


                }
            });

            let logoTd = tr.querySelector('.logoUrl');
            if (logoTd && logoTd.querySelector('input')) {
                let logoUrl = logoTd.querySelector('input').value;
                if (logoUrl) {
                    logoTd.innerHTML = `<img src="${logoUrl}" alt="Logo Preview" class="logo-preview">`;
                } else {
                    logoTd.innerHTML = '';
                }
            }

            this.style.display = 'none';
            if (editButton) {
                editButton.style.display = 'inline-block';
            }
            if (deleteButton) {
                deleteButton.style.display = 'inline-block';
            }

            let activeCheckbox = tr.querySelector('.active input[type="checkbox"]');
            if (activeCheckbox) {
                activeCheckbox.disabled = true;
            }

            let parentTable = tr.closest('tbody');
            if (parentTable.querySelectorAll('tr').length === 1) {
                const checkbox = tr.querySelector('.active input[type="checkbox"]');
                if (checkbox) {
                    checkbox.checked = true;
                } else {
                    console.error('Checkbox not found');
                }
            }

            updateStorage();
        });
    }
}


function updateStorage() {
    let instanceRows = document.querySelectorAll('#widgetInstancesTable tbody tr');
    let brandRows = document.querySelectorAll('#widgetBrandsTable tbody tr');
    let extrasRow = document.querySelector('#widgetExtrasTable tbody tr');

    let widgetInstances = [];
    instanceRows.forEach(row => {
        let id = row.querySelector('.id').innerText;
        let text = row.querySelector('.text').innerText;
        let active = row.querySelector('.active input[type="checkbox"]').checked;
        widgetInstances.push({ id, text, active });
    });

    let widgetBrands = [];
    brandRows.forEach(row => {
        let name = row.querySelector('.name').innerText;

        // Retrieving the color values directly from the input elements
        let headerColorInput = row.querySelector('.headerColor .color-picker');
        let headerColor = headerColorInput ? headerColorInput.value : '';

        let textBackgroundColorInput = row.querySelector('.textBackgroundColor .color-picker');
        let textBackgroundColor = textBackgroundColorInput ? textBackgroundColorInput.value : '';

        let logoUrl;
        let logoImg = row.querySelector('.logoUrl img');
        if (logoImg) {
            logoUrl = logoImg.src;
        } else {
            let logoInput = row.querySelector('.logoUrl input');
            if (logoInput) {
                logoUrl = logoInput.value;
            }
        }
        let headerTitle = row.querySelector('.headerTitle').innerText;
        let headerSubtitle = row.querySelector('.headerSubtitle').innerText;
        let ctaHeader = row.querySelector('.ctaHeader').innerText;
        let ctaText = row.querySelector('.ctaText').innerText;
        let active = row.querySelector('.active input[type="checkbox"]').checked;
        widgetBrands.push({ name, headerColor, textBackgroundColor, logoUrl, headerTitle, headerSubtitle, ctaHeader, ctaText, active });
    });

    let widgetMetadata = {};
    if (extrasRow) {
        widgetMetadata.returningUserCtaHeader = extrasRow.querySelector('.returningUserCtaHeader').innerText;
        widgetMetadata.returningUserCtaText = extrasRow.querySelector('.returningUserCtaText').innerText;
        widgetMetadata.buyingIntentCtaHeader = extrasRow.querySelector('.buyingIntentCtaHeader').innerText;
        widgetMetadata.buyingIntentCtaText = extrasRow.querySelector('.buyingIntentCtaText').innerText;
        widgetMetadata.userFirstName = extrasRow.querySelector('.userFirstName').innerText;
        widgetMetadata.userLastName = extrasRow.querySelector('.userLastName').innerText;
        widgetMetadata.userEmail = extrasRow.querySelector('.userEmail').innerText;
    }

    chrome.storage.sync.set({
        widgetConfigs: {
            widgetRunning: configWidgetRunning,
            widgetInstances,
            widgetBrands,
            widgetMetadata
        }
    });
}


function uncheckAllActiveCheckboxes(exceptCheckbox, tableElement) {
    let allActiveCheckboxes = tableElement.querySelectorAll('.active input[type="checkbox"]');
    allActiveCheckboxes.forEach(checkbox => {
        if (checkbox !== exceptCheckbox) {
            checkbox.checked = false;
        }
    });
}


