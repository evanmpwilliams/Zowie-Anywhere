// Default configuration for the widget
const defaultWidgetConfig = {
    widgetRunning: false,
    widgetInstances: [{
        "id": "7a761b8ef2ea41369f7c8fe9bee9996e",
        "text": "Zowie Demo",
        "active": true
    }],
    widgetBrands: [{
        "active": true,
        "name": "Zowie",
        "headerColor": "#fc4c02",
        "textBackgroundColor": "#fc4c02",
        "logoUrl": "https://assets-global.website-files.com/630c8ef57ce71766d5e3bc07/630e1d9a7743cabfbe8c7173_logo-zowie.svg",
        "headerTitle": "Personal Assistant",
        "headerSubtitle": "CX Automation For All",
        "ctaHeader": "Welcome!",
        "ctaText": "How can I help?"
    }],
    widgetMetadata: {
        "returningUser": false,
        "returningUserCtaHeader": "Welcome back!",
        "returningUserCtaText": "It's great to see you again.",
        "buyingIntent": false,
        "buyingIntentCtaHeader": "Nice looking cart!",
        "buyingIntentCtaText": "I've got an offer just for you...",
        "userFirstName": "Andy",
        "userLastName": "Zowie",
        "userEmail": "andy@zowie.ai"
    }
};

/**
 * Retrieves the widget configuration from chrome storage.
 * Defaults to defaultWidgetConfig if not found.
 * @returns {Promise<Object>}
 */
async function getConfigData() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get({ widgetConfigs: defaultWidgetConfig }, (items) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError));
            } else {
                resolve(items.widgetConfigs);
            }
        });
    });
}

/**
 * Saves the in-memory widget configuration to chrome storage.
 * @param {Function} [callback] - Optional callback to run after save
 */
function setConfigData(callback) {
    chrome.storage.sync.set({ widgetConfigs: widgetConfigData }, () => {
        console.log("WidgetConfigs updated in chrome storage!");
        if (callback) callback();
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


async function executeFunctionOnActiveTab(func) {
    try {
        const tabId = await getActiveTabId();
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: func
        });
    } catch (error) {
        console.error("Error executing function on active tab:", error);
    }
}


async function startWidget() {
    try {

        const currentUrl = await getActiveTabUrl();
        if (currentUrl.includes("zowie.ai")) {
            console.log("Widget start prevented due to URL containing 'zowie.ai'");
            return; // Exit the function if the URL contains "zowie.ai"
        }

        const configData = await getConfigData();

        // Fetch the active instance ID
        const activeInstanceId = configData.widgetInstances.find(instance => instance.active).id;

        // Fetch the active headerColor
        const activeHeaderColor = configData.widgetBrands.find(brand => brand.active).headerColor;

        // Fetch the active logo URL
        const activeLogoUrl = configData.widgetBrands.find(brand => brand.active).logoUrl;

        // Fetch the active chat Name / header
        const activeChatName = configData.widgetBrands.find(brand => brand.active).headerTitle;

        // Fetch the active chat Name / header
        const activeChatDesc = configData.widgetBrands.find(brand => brand.active).headerSubtitle;

        // Fetch the active text background color
        const activeTextBgColor = configData.widgetBrands.find(brand => brand.active).textBackgroundColor;

        // Fetch the active text background color
        const activeCtaHeader = configData.widgetBrands.find(brand => brand.active).ctaHeader;

        const activeCtaText = configData.widgetBrands.find(brand => brand.active).ctaText;

        const activeBrandName = configData.widgetBrands.find(brand => brand.active).name;

        const returningUser = configData.widgetMetadata.returningUser;

        const buyingIntent = configData.widgetMetadata.buyingIntent;

        const returningUserCtaHeader = configData.widgetMetadata.returningUserCtaHeader;
        const returningUserCtaText = configData.widgetMetadata.returningUserCtaText;
        const buyingIntentCtaHeader = configData.widgetMetadata.buyingIntentCtaHeader;
        const buyingIntentCtaText = configData.widgetMetadata.buyingIntentCtaText;
        const userFirstName = configData.widgetMetadata.userFirstName;
        const userLastName = configData.widgetMetadata.userLastName;
        const userEmail = configData.widgetMetadata.userEmail;




        // Execute the function on the active tab and pass the necessary data
        executeFunctionOnActiveTab(injectStart, {
            instanceId: activeInstanceId,
            headerColor: activeHeaderColor,
            logoUrl: activeLogoUrl,
            chatName: activeChatName,
            chatDesc: activeChatDesc,
            textBgColor: activeTextBgColor,
            ctaHeader: activeCtaHeader,
            ctaText: activeCtaText,
            returningUser: returningUser,
            buyingIntent: buyingIntent,
            brandName: activeBrandName,
            returningUserCtaHeader: returningUserCtaHeader,
            returningUserCtaText: returningUserCtaText,
            buyingIntentCtaHeader: buyingIntentCtaHeader,
            buyingIntentCtaText: buyingIntentCtaText,
            userFirstName: userFirstName,
            userLastName: userLastName,
            userEmail: userEmail
        });
    } catch (error) {
        console.error("Failed to fetch config data:", error);
    }
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

function injectStart(data) {
    const instanceId = data.instanceId;
    const headerColor = data.headerColor;
    const logoUrl = data.logoUrl;
    const chatName = data.chatName;
    const chatDesc = data.chatDesc;
    const textBgColor = data.textBgColor;
    const ctaHeader = data.ctaHeader;
    const ctaText = data.ctaText;
    const brandName = data.brandName;
    const returningUser = data.returningUser;
    const buyingIntent = data.buyingIntent;
    const returningUserCtaHeader = data.returningUserCtaHeader;
    const returningUserCtaText = data.returningUserCtaText;
    const buyingIntentCtaHeader = data.buyingIntentCtaHeader;
    const buyingIntentCtaText = data.buyingIntentCtaText;
    const userFirstName = data.userFirstName;
    const userLastName = data.userLastName;
    const userEmail = data.userEmail;
    const src = chrome.runtime.getURL('/widget_start.js');
    const script = document.createElement("script");
    script.src = src;
    script.id = "chatbotize-load-script";
    script.setAttribute('instanceid', instanceId);
    script.setAttribute('headerColor', headerColor);
    script.setAttribute('logoUrl', logoUrl);
    script.setAttribute('chatName', chatName);
    script.setAttribute('chatDesc', chatDesc);
    script.setAttribute('textBgColor', textBgColor);
    script.setAttribute('ctaHeader', ctaHeader);
    script.setAttribute('ctaText', ctaText);
    script.setAttribute('brandName', brandName);
    script.setAttribute('returningUser', returningUser);
    script.setAttribute('buyingIntent', buyingIntent);
    script.setAttribute('returningUserCtaHeader', returningUserCtaHeader);
    script.setAttribute('returningUserCtaText', returningUserCtaText);
    script.setAttribute('buyingIntentCtaHeader', buyingIntentCtaHeader);
    script.setAttribute('buyingIntentCtaText', buyingIntentCtaText);
    script.setAttribute('userFirstName', userFirstName);
    script.setAttribute('userLastName', userLastName);
    script.setAttribute('userEmail', userEmail);

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