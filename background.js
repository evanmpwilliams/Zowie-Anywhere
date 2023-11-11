// Try to import necessary scripts. If there's an error, log it to the console.
try {
  importScripts("defaultconfig.js");  // Importing default configuration settings
  importScripts("shared.js");         // Importing shared utilities or functions
} catch (e) {
  console.log(e); // Log any errors during the import
}

// Add listener for tab updates.
chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  // Check if the update status is 'complete' and the tab's URL is defined
  if (changeInfo.status === "complete" && tab.url) {
    // Proceed only if the URL starts with 'https://'
    if (tab.url.startsWith('https://')) {
      try {
        // Retrieve the widget running status from storage or use the default value
        let widgetRunning = await getFromStorage('widgetRunning', defaultConfig.widgetRunning);

        // Use a default value if widgetRunning is undefined or null
        if (typeof widgetRunning === 'undefined' || widgetRunning === null) {
          widgetRunning = defaultConfig.widgetRunning;
        }

        // Start the widget if it is set to run
        if (widgetRunning) {
          startWidget();
        }
      } catch (error) {
        // Log any errors encountered
        console.error('Error:', error);
      }
    }
  }
});

// Add listener for when a tab is activated.
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // Retrieve details of the activated tab
  chrome.tabs.get(activeInfo.tabId, async (tab) => {
    // Proceed only if the tab's URL is defined and starts with 'https://'
    if (tab.url && tab.url.startsWith("https://")) {
      // Retrieve the widget running status from storage
      let widgetRunning = await getFromStorage('widgetRunning', defaultConfig.widgetRunning);
      
      // Stop the widget if it is not set to run
      if (!widgetRunning) {
        stopWidget();
      }
    }
  });
});