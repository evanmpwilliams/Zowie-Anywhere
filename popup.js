// In-memory configuration data
let widgetConfigData = null;

// DOM references
const instancesDropdown = document.getElementById("instances-dropdown");
const brandsDropdown = document.getElementById("brands-dropdown");
const widgetSwitch = document.getElementById("widget-switch");
const userSwitch = document.getElementById("returning-user-switch");
const buyerSwitch = document.getElementById("buying-intent-switch");
const btnSubmit = document.getElementById("btn-submit");
const btnOptions = document.getElementById("btn-options");



/**
 * Populates the instance dropdown based on widget configuration.
 */
function populateInstanceDropdown() {
    const instances = widgetConfigData?.widgetInstances || defaultWidgetConfig.widgetInstances;
    
    
    // Clear existing options
    instancesDropdown.innerHTML = "";
    
    // Add options to dropdown
    instances.sort((a, b) => b.active - a.active).forEach(instance => {
        const option = document.createElement("option");
        option.value = instance.id;
        option.text = instance.text;
        instancesDropdown.add(option);
    });
}

/**
 * Populates the brand dropdown based on widget configuration.
 */
function populateBrandDropdown() {
    const brands = widgetConfigData?.widgetBrands || defaultWidgetConfig.widgetBrands;
    
    // Clear existing options
    brandsDropdown.innerHTML = "";
    
    // Add options to dropdown
    brands.sort((a, b) => b.active - a.active).forEach(brand => {
        const option = document.createElement("option");
        option.value = brand.name;
        option.text = brand.name;
        brandsDropdown.add(option);
    });
}

/**
 * Sets up the initial state of the popup based on the stored configuration.
 */
async function loadPopupFromConfig() {
    try {
        widgetConfigData = await getConfigData();
        populateInstanceDropdown();
        populateBrandDropdown();
        widgetSwitch.checked = widgetConfigData.widgetRunning;
        userSwitch.checked = widgetConfigData.widgetMetadata.returningUser;
        buyerSwitch.checked = widgetConfigData.widgetMetadata.buyingIntent;
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

    // Update the active instance
    for (const instance of widgetConfigData.widgetInstances) {
        if (instance.id === selectedInstanceId) {
            instance.active = true;
            instance.text = instancesDropdown.options[instancesDropdown.selectedIndex].text;
        } else {
            instance.active = false;
        }
    }

    // Update the active brand
    for (const brand of widgetConfigData.widgetBrands) {
        brand.active = brand.name === selectedBrandName;
    }
}



// Event listener to update widget configuration when the switch is toggled
widgetSwitch.addEventListener("change", () => {
    widgetConfigData.widgetRunning = widgetSwitch.checked;
    setConfigData();
    if (widgetSwitch.checked) {
        startWidget();
    } else {
        stopWidget();
    }
});

// Event listener to update widget configuration when the switch is toggled
userSwitch.addEventListener("change", () => {
    widgetConfigData.widgetMetadata.returningUser = userSwitch.checked;
    if (userSwitch.checked) {
        widgetConfigData.widgetMetadata.buyingIntent = false;
        buyerSwitch.checked = false;
    } 
});

buyerSwitch.addEventListener("change", () => {
    widgetConfigData.widgetMetadata.buyingIntent = buyerSwitch.checked;
    if (buyerSwitch.checked) {
        widgetConfigData.widgetMetadata.returningUser = false;
        userSwitch.checked = false;
    } 
});




btnSubmit.addEventListener("click", function() {
    updateActiveConfigFromDropdowns();
    setConfigData();
 if(widgetConfigData.widgetRunning){
    console.log(widgetConfigData.widgetRunning);
    stopWidget();
    startWidget();
 }
});

btnOptions.addEventListener("click", function() {
    chrome.runtime.openOptionsPage();
});





// Initial setup once DOM is ready
document.addEventListener("DOMContentLoaded", async() => {
    $('#instances-dropdown').select2();  // Note: Using jQuery for select2
    $('#brands-dropdown').select2();
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