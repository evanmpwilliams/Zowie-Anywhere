/**
 * Asynchronously retrieves a value from chrome.storage.sync.
 * If the key is missing or empty, sets it to the default value.
 * @param {string} key - The key of the data to retrieve.
 * @param {any} defaultValue - The default value to return and set if the key doesn't exist or the value is empty.
 * @returns {Promise<any>} A promise that resolves to the retrieved data or the default value.
 */
async function getFromStorage(key, defaultValue) {


  return new Promise(resolve => {
    chrome.storage.sync.get(key, async items => {
      const value = items[key];
      if ((value !== undefined && value !== null) && (!Array.isArray(value) || value.length > 0)) {

        resolve(value);
      } else {
        await setToStorage(key, defaultValue);
        resolve(defaultValue);
      }
    });
  });
}

/**
 * Asynchronously sets a value in chrome.storage.sync.
 * @param {string} key - The key under which to store the data.
 * @param {any} value - The data to store.
 * @returns {Promise<void>} A promise that resolves when the data is successfully stored.
 */
async function setToStorage(key, value) {
  // Return a new promise
  return new Promise((resolve, reject) => {
    // Attempt to set the value in chrome.storage.sync
    chrome.storage.sync.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

async function getActiveTabUrl() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        resolve(tabs[0].url);
      } else {
        reject(new Error("No active tab found."));
      }
    });
  });
}

async function getActiveTabId() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        resolve(tabs[0].id);
      } else {
        reject(new Error("No active tab found."));
      }
    });
  });
}

async function executeFunctionOnActiveTab(func, data = null) {
  try {
    const tabId = await getActiveTabId();

    if (data) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: func,
        args: [data]
      });
    } else {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: func
      });
    }

  } catch (error) {
    console.error("Error executing function on active tab:", error);
  }
}

async function startWidget() {
  let tablesData = {};
  let initConfig = {
    startOnOpen: true,
    headerMode: "white",
    desktopCta: {
      mode: "VISIBLE",
      showDelay: 0
    },
    metadata: {
      extraParams: {}
    }
  };
  for (const tableDef of tableDefinitions) {
    tablesData[tableDef.tableStorageKey] = await getFromStorage(tableDef.tableStorageKey, tableDef.defaultData);
  }

  const activeTabUrl = await getActiveTabUrl();


  // Access the blacklistData from tablesData
  const blacklistData = tablesData.blacklistData;

  // Check if activeTabUrl is in the blacklist and blacklist is active
  const isBlacklisted = blacklistData.some(entry =>
    entry.blacklistActive && activeTabUrl.includes(entry.blacklistDomain)
  );

  if (isBlacklisted) {
    // If a matching domain is found and blacklist is active, do not proceed further
    console.log('Active tab URL is blacklisted. Widget will not start.');
    return;
  }

  console.log('Active tab URL is allowed. widget will start');
  //set instance ID
  const activeInstance = tablesData.instanceData.find(instance => instance.instanceActive === true)
  initConfig.instanceId = activeInstance.instanceId

  //set brand info
  const activeBrand = tablesData.brandData.find(brand => brand.brandActive === true);
  if (activeBrand) {
    initConfig.primaryColor = activeBrand.primaryColor;
    initConfig.secondaryColor = activeBrand.messageColor;
    initConfig.logoUrl = activeBrand.logoUrl;
    initConfig.name = activeBrand.widgetTitle;
    initConfig.description = activeBrand.widgetDescription;
    initConfig.desktopCta.header = activeBrand.brandCtaHeader;
    initConfig.desktopCta.text = activeBrand.brandCtaText;
    initConfig.metadata.extraParams.brandName = activeBrand.brandName
  }

  //apply active options
  const activeOptions = tablesData.optionData.filter(option => option.optionActive === true);
  activeOptions.forEach(option => {
    const key = option.optionKey;
    const value = option.optionValue;
    switch (option.optionType) {
      case 'Init Option':
        // If the option type is 'Init Option', add it directly to initConfig.
        initConfig[key] = value;
        break;
      case 'Metadata':
        // If the option type is 'Metadata', add it to initConfig.metadata.
        initConfig.metadata[key] = value;
        break;
      case 'Extra Param':
        // If the option type is 'Extra Param', add it to initConfig.metadata.extraParams.
        initConfig.metadata.extraParams[key] = value;
        break;
      // You can add more cases here if there are other option types.
      default:
        // Handle any option types that are not recognized
        console.warn(`Unknown option type: ${option.optionType}`);
    }
  });

  //apply proactive chats

  // Parse the URL to get search parameters
  const url = new URL(activeTabUrl);
  const params = new URLSearchParams(url.search);

  // Check if proactiveChat parameter exists and assign its value
  let urlProactiveChat = null;
  if (params.has('proactiveChat')) {
    urlProactiveChat = decodeURIComponent(params.get('proactiveChat'));
  }

  let activeProactiveChat = null;

  // Check if urlProactiveChat exists in proactiveChatData
  if (urlProactiveChat) {
    const matchedProactiveChat = tablesData.proactiveChatData.find(
      proactiveChat => proactiveChat.proactiveChatName === urlProactiveChat
    );
    if (matchedProactiveChat) {
      activeProactiveChat = matchedProactiveChat;
    }
  }

  // If urlProactiveChat doesn't exist or wasn't found in proactiveChatData
  if (!activeProactiveChat) {
    const defaultActiveProactiveChat = tablesData.proactiveChatData.find(
      proactiveChat => proactiveChat.proactiveChatActive === true
    );
    if (defaultActiveProactiveChat) {
      activeProactiveChat = defaultActiveProactiveChat;
    }
  }

  if (activeProactiveChat) {
    initConfig.desktopCta.header = activeProactiveChat.proactiveChatCtaHeader;
    initConfig.desktopCta.text = activeProactiveChat.proactiveChatCtaText;
    initConfig.metadata.extraParams.proactiveChat = activeProactiveChat.proactiveChatName;
    if (activeProactiveChat.proactiveChatAutoOpen == 'Automatically') {
      initConfig.metadata.extraParams.proactiveChatAutoOpen = true;
      initConfig.metadata.extraParams.proactiveChatOpenDelay = activeProactiveChat.proactiveChatOpenDelay;
    }
  }



  const removeElements = tablesData.removeElementData.filter(item => item.removeElementActive === true);

  if (!activeBrand && !activeProactiveChat) {
    delete initConfig.desktopCta;
  }
  console.log(initConfig);
  executeFunctionOnActiveTab(injectStart, { initConfig, removeElements });

}

function injectStart(data) {

  const initConfigString = JSON.stringify(data.initConfig);
  const removeElementString = JSON.stringify(data.removeElements);
  const src = chrome.runtime.getURL('/widget_start.js');
  const script = document.createElement("script");
  script.src = src;
  script.id = "chatbotize-load-script";
  script.setAttribute('initConfigString', initConfigString);
  script.setAttribute('removeElementString', removeElementString);


  script.onload = function () {
    console.log("Widget Started");
    this.remove();
  };

  let element = document.documentElement;
  element.appendChild(script);
}


function injectStop() {
  const src = chrome.runtime.getURL('/widget_stop.js');
  const script = document.createElement("script");
  script.src = src;
  script.id = "chatbotize-stop-script";
  script.onload = function () {
    console.log("Widget Stopped");
    this.remove();
  };
  let element = document.documentElement;
  element.appendChild(script);
}

function stopWidget() {
  executeFunctionOnActiveTab(injectStop);
}
