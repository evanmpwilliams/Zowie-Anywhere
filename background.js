
try {
  importScripts("shared.js");
} catch (e) {
  console.log(e);
}

//Background stuff here


chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  // Check if the tab update is complete.
  if (changeInfo.status === "complete") {
      // Ensure the URL starts with https://
      if (tab.url.startsWith('https://')) {
          try {
              // Retrieve widgetConfigs.
              const configData = await getConfigData();
              let widgetRunning = configData.widgetRunning;

              // If widgetRunning is empty or not present, use default value.
              if (typeof widgetRunning === 'undefined' || widgetRunning === null) {
                  widgetRunning = defaultWidgetConfig.widgetRunning;
              }

              // Check the widgetRunning status and execute the widget if it's true.
              if (widgetRunning) {
                  startWidget();
              }
          } catch (error) {
              console.error('Error:', error);
          }
      }
  }
});


chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // Get details of the activated tab
  chrome.tabs.get(activeInfo.tabId, (tab) => {
      // Check if the tab's URL starts with "https://"
      if (tab.url.startsWith("https://")) {
          getConfigData().then(config => {
              // Check if widgetRunning is defined and is not empty; otherwise, use the default value
              let isWidgetRunning = (config.widgetRunning !== undefined) ? config.widgetRunning : defaultWidgetConfig.widgetRunning;

              if (!isWidgetRunning) {
                  // If widgetRunning is false, stop the widget
                  stopWidget();
              }

          }).catch(err => {
              console.error('Error getting config data:', err);
          });
      }
  });
});


