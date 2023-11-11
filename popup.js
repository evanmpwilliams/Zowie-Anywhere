// In-memory configuration data
let widgetRunning = null;
let instanceData = null;
let brandData = null;
let proactiveChatData = null;

// DOM references
const instancesDropdown = document.getElementById("instances-dropdown");
const brandsDropdown = document.getElementById("brands-dropdown");
const proactiveChatsDropdown = document.getElementById("proactive-chats-dropdown");
const widgetSwitch = document.getElementById("widget-switch");
const btnSubmit = document.getElementById("btn-submit");
const btnOptions = document.getElementById("btn-options");


/**
 * Adds a default option to the dropdown.
 * @param {HTMLElement} dropdownElement - The dropdown element to modify.
 * @param {string} value - The value for the default option.
 * @param {string} text - The text for the default option.
 * @param {boolean} isActive - Indicates if the default option should be active.
 */
function addDefaultOption(dropdownElement, value, text, isActive) {
    const defaultOption = document.createElement("option");
    defaultOption.value = value;
    defaultOption.text = text;
    defaultOption.selected = isActive;
    dropdownElement.prepend(defaultOption);
}

/**
 * Populates a dropdown with options based on provided data.
 * @param {HTMLElement} dropdownElement - The dropdown element to populate.
 * @param {Array} data - The data to populate the dropdown with.
 * @param {Function} isActive - Function to determine if the item is active.
 * @param {Function} getValue - Function to get the value for the option.
 * @param {Function} getText - Function to get the text for the option.
 * @param {string} [defaultOptionValue] - Value for the default option (if applicable).
 * @param {string} [defaultOptionText] - Text for the default option (if applicable).
 */
function populateDropdown(dropdownElement, data, isActive, getValue, getText, defaultOptionValue = '', defaultOptionText = '') {
    // Clear existing options
    dropdownElement.innerHTML = "";

    let activeFound = false;

    // Sort by active status and add options to dropdown
    data.sort((a, b) => isActive(b) - isActive(a)).forEach(item => {
        const option = document.createElement("option");
        option.value = getValue(item);
        option.text = getText(item);
        if (isActive(item)) {
            option.selected = true;
            activeFound = true;
        }
        dropdownElement.add(option);
    });

    // Add default option if no active option found or at the top of the list
    if (defaultOptionValue && defaultOptionText) {
        addDefaultOption(dropdownElement, defaultOptionValue, defaultOptionText, !activeFound);
    }
}

/**
 * Sets up the initial state of the popup based on the stored configuration.
 */
async function loadPopupFromConfig() {
    try {
        widgetRunning = await getFromStorage('widgetRunning', defaultConfig.widgetRunning);
        brandData = await getFromStorage('brandData', defaultConfig.brandData);
        instanceData = await getFromStorage('instanceData', defaultConfig.instanceData);
        proactiveChatData = await getFromStorage('proactiveChatData', defaultConfig.proactiveChatData);

        // Use the generic populateDropdown function to populate each dropdown
        populateDropdown(
            instancesDropdown, 
            instanceData, 
            item => item.instanceActive, 
            item => item.instanceId, 
            item => item.instanceName
        );
        populateDropdown(
            brandsDropdown, 
            brandData, 
            item => item.brandActive, 
            item => item.brandName, 
            item => item.brandName,
            'Default', 
            '-Default-'
        );
        populateDropdown(
            proactiveChatsDropdown, 
            proactiveChatData, 
            item => item.proactiveChatActive, 
            item => item.proactiveChatName, 
            item => item.proactiveChatName,
            'None', 
            '-None-'
        );

        widgetSwitch.checked = widgetRunning;
   
    } catch (error) {
        console.error("Failed to fetch config data:", error);
    }
}


/**
 * Sets the selected instance and brand to active in the in-memory configuration.
 */
function updateActiveConfigFromDropdowns() {
    // Get the selected values from the dropdowns
    const selectedInstanceId = instancesDropdown.value;
    const selectedBrandName = brandsDropdown.value;
    const selectedProactiveChatName = proactiveChatsDropdown.value;

    // Update the active instance
    instanceData.forEach(instance => {
        instance.instanceActive = instance.instanceId === selectedInstanceId;
    });

    // Update the active brand
    if (selectedBrandName === "Default") {
        brandData.forEach(brand => brand.brandActive = false);
    } else {
        brandData.forEach(brand => {
            brand.brandActive = brand.brandName === selectedBrandName;
        });
    }

    // Update the active proactive chat
    if (selectedProactiveChatName === "None") {
        proactiveChatData.forEach(chat => chat.proactiveChatActive = false);
    } else {
        proactiveChatData.forEach(chat => {
            chat.proactiveChatActive = chat.proactiveChatName === selectedProactiveChatName;
        });
    }

    return { instanceData, brandData, proactiveChatData };
}




// Event listener to update widget configuration when the switch is toggled
widgetSwitch.addEventListener("change", async function() {

    try{
    widgetRunning = widgetSwitch.checked;
    await setToStorage('widgetRunning', widgetRunning);
    }
    catch(error){
    console.error('Error updating widget status:', error);
    }
   if (widgetSwitch.checked) {
        startWidget();
    } else {
        stopWidget();
    }
});


btnSubmit.addEventListener("click", async function() {
    try {
        const { instanceData, brandData, proactiveChatData } = await updateActiveConfigFromDropdowns();

        // Save each type of data using setToStorage
        await setToStorage('instanceData', instanceData);
        await setToStorage('brandData', brandData);
        await setToStorage('proactiveChatData', proactiveChatData);

        console.log('Data updated and saved to storage');
        
        // Existing logic for widgetConfigData
        if(widgetRunning){
            console.log(widgetRunning);
            stopWidget();
            startWidget();
        }
    } catch (error) {
        console.error('Error updating and saving data:', error);
    }
});

btnOptions.addEventListener("click", function() {
    chrome.runtime.openOptionsPage();
});

// Initial setup once DOM is ready
document.addEventListener("DOMContentLoaded", async() => {
    $('#instances-dropdown').select2();  // Note: Using jQuery for select2
    $('#brands-dropdown').select2();
    $('#proactive-chats-dropdown').select2();
    loadPopupFromConfig();
    try {
        const url = await getActiveTabUrl();
        if (url.startsWith("https://")) {
            document.querySelector('.allowed-content').style.display = 'block';
            document.querySelector('.denied-content').style.display = 'none';
        } else {
            document.querySelector('.allowed-content').style.display = 'none';
            document.querySelector('.denied-content').style.display = 'block';
        }
    } catch (error) {
        console.error("Error fetching active tab's URL:", error);
    }
});