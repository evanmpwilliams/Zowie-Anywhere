const defaultConfig = {
    "widgetRunning": false,
    "instanceData": [
        {
            "instanceName": "Zowie Demo",
            "instanceId": "7a761b8ef2ea41369f7c8fe9bee9996e",
            "instanceActive": true
        }
    ],
    "brandData": [
        {
            "brandName": "Zowie",
            "primaryColor": "#FC4C02",
            "messageColor": "#FC4C02",
            "logoUrl": "https://i.imgur.com/Z39xsOW.png",
            "widgetTitle": "Zowie Demo",
            "widgetDescription": "Automated Virtual Assistant",
            "brandCtaHeader": "Hello!",
            "brandCtaText": "How can I help you?",
            "brandActive": true
        }
    ],
    "optionData": [
        {
            "optionKey": "firstName",
            "optionValue": "Andy",
            "optionType": "Metadata",
            "optionActive": true
        },
        {
            "optionKey": "lastName",
            "optionValue": "Zowie",
            "optionType": "Metadata",
            "optionActive": true
        },
        {
            "optionKey": "email",
            "optionValue": "andy@zowie.ai",
            "optionType": "Metadata",
            "optionActive": true
        },
        {
            "optionKey": "zowieAnywhereWidget",
            "optionValue": true,
            "optionType": "Extra Param",
            "optionActive": true
        }
    ],
    "proactiveChatData": [
        {
            "proactiveChatName": "Returning Customer",
            "proactiveChatCtaHeader": "Welcome back!",
            "proactiveChatCtaText": "It's nice to see you again.",
            "proactiveChatAutoOpen": "On Click",
            "proactiveChatOpenDelay": 0,
            "proactiveChatActive": false
        }, {
            "proactiveChatName": "Buying Intent",
            "proactiveChatCtaHeader": "Ready to make a purchase?",
            "proactiveChatCtaText": "I'm here to help.",
            "proactiveChatAutoOpen": "Automatically",
            "proactiveChatOpenDelay": 5,
            "proactiveChatActive": false
        }, {
            "proactiveChatName": "Email Automation",
            "proactiveChatCtaHeader": "We received your email.",
            "proactiveChatCtaText": "Click to resolve your issue ASAP.",
            "proactiveChatAutoOpen": "On Click",
            "proactiveChatOpenDelay": 5,
            "proactiveChatActive": false
        }
    ],
    "blacklistData": [
        {
            "blacklistDomain": "zowie.ai",
            "blacklistActive": true
        },
        {
            "blacklistDomain": "chatbotize.com",
            "blacklistActive": true
        }
    ],
    "removeElementData": [
        { "removeElementType": "Class", "removeElementText": "js-chat-buttons-container-genesys", "removeElementActive": true },
        { "removeElementType": "Class", "removeElementText": "chat-button", "removeElementActive": true },
        { "removeElementType": "ID", "removeElementText": "chat-button", "removeElementActive": true },
        { "removeElementType": "ID", "removeElementText": "fc_frame", "removeElementActive": true },
        { "removeElementType": "ID", "removeElementText": "launcher", "removeElementActive": true },
        { "removeElementType": "ID", "removeElementText": "ui-inin-chat-open", "removeElementActive": true },
        { "removeElementType": "ID", "removeElementText": "gorgias-chat-container", "removeElementActive": true },
        { "removeElementType": "ID", "removeElementText": "chat-widget-container", "removeElementActive": true },
        { "removeElementType": "Class", "removeElementText": "zhiCustomBtn", "removeElementActive": true },
        { "removeElementType": "Class", "removeElementText": "back-to-top", "removeElementActive": true },
        { "removeElementType": "ID", "removeElementText": "kustomer-ui-sdk-iframe", "removeElementActive": true },
        { "removeElementType": "Class", "removeElementText": "PreboardingModal_PreboardingBubble__XEMtd", "removeElementActive": true },
        { "removeElementType": "Class", "removeElementText": "dixa-messenger-namespace", "removeElementActive": true },
        { "removeElementType": "ID", "removeElementText": "solvvy-lazy-button", "removeElementActive": true },
        { "removeElementType": "ID", "removeElementText": "reamazejs-container", "removeElementActive": true },
        { "removeElementType": "Class", "removeElementText": "chat-start-btn", "removeElementActive": true },
        { "removeElementType": "Tag", "removeElementText": "access-widget-ui", "removeElementActive": true },
        { "removeElementType": "Class", "removeElementText": "scroll-to-top", "removeElementActive": true },
        { "removeElementType": "Class", "removeElementText": "general-feedback-button", "removeElementActive": true }
    ]
};

const tableDefinitions = [
    {
        tableId: "instances-table",
        tableTitle: "Instances",
        tableDescription: "Manage available instances of Zowie chatbot",
        tableControls: true,
        tableSearchPlaceholder: "Search instances",
        tableRender: true,
        tableEditable: true,
        tableStorageKey: "instanceData",
        tableColumns: [
            { columnKey: "instanceName", columnHeader: "Name", columnClass: "col-searchable-text" },
            { columnKey: "instanceId", columnHeader: "ID", columnClass: "col-searchable-text" },
            { columnKey: "instanceActive", columnHeader: "Active", columnClass: "col-active-flag col-not-content-editable col-not-active-editable" }
        ],
        defaultData: defaultConfig.instanceData
    },
    {
        tableId: "brands-table",
        tableTitle: "Brands",
        tableDescription: "Manage available brands",
        tableControls: true,
        tableSearchPlaceholder: "Search brands",
        tableRender: true,
        tableEditable: true,
        tableStorageKey: "brandData",
        tableColumns: [
            { columnKey: "brandName", columnHeader: "Brand Name", columnClass: "col-searchable-text" },
            { columnKey: "primaryColor", columnHeader: "Primary Color", columnClass: "col-color-select col-not-content-editable" },
            { columnKey: "messageColor", columnHeader: "Message Color", columnClass: "col-color-select col-not-content-editable" },
            { columnKey: "logoUrl", columnHeader: "Logo", columnClass: "col-image" },
            { columnKey: "widgetTitle", columnHeader: "Widget Title", columnClass: "col-searchable-text" },
            { columnKey: "widgetDescription", columnHeader: "Widget Description", columnClass: "col-searchable-text" },
            { columnKey: "brandCtaHeader", columnHeader: "CTA Header", columnClass: "col-searchable-text" },
            { columnKey: "brandCtaText", columnHeader: "CTA Text", columnClass: "col-searchable-text" },
            { columnKey: "brandActive", columnHeader: "Active", columnClass: "col-active-flag col-not-content-editable col-not-active-editable" }
        ],
        defaultData: defaultConfig.brandData
    },
    {
        tableId: "proactive-chat-table",
        tableTitle: "Proactive Chats",
        tableDescription: "Manage proactive chat configurations",
        tableControls: true,
        tableSearchPlaceholder: "Search proactive chats",
        tableRender: true,
        tableEditable: true,
        tableStorageKey: "proactiveChatData",
        tableColumns: [
            { columnKey: "proactiveChatName", columnHeader: "Name", columnClass: "col-searchable-text" },
            { columnKey: "proactiveChatCtaHeader", columnHeader: "CTA Header", columnClass: "col-searchable-text" },
            { columnKey: "proactiveChatCtaText", columnHeader: "CTA Text", columnClass: "col-searchable-text" },
            { columnKey: "proactiveChatAutoOpen", columnHeader: "Open Type", columnClass: "col-dropdown-select col-searchable-text col-not-content-editable" },
            { columnKey: "proactiveChatOpenDelay", columnHeader: "Open Delay", columnClass: "col-open-delay" },
            { columnKey: "proactiveChatActive", columnHeader: "Active", columnClass: "col-active-flag col-not-content-editable col-not-active-editable" }
        ],
        defaultData: defaultConfig.proactiveChatData
    },
    {
        tableId: "options-table",
        tableTitle: "Options",
        tableDescription: "Manage widget options",
        tableControls: true,
        tableSearchPlaceholder: "Search metadata",
        tableRender: true,
        tableEditable: true,
        tableStorageKey: "optionData",
        tableColumns: [
            { columnKey: "optionKey", columnHeader: "Key", columnClass: "col-searchable-text" },
            { columnKey: "optionValue", columnHeader: "Value", columnClass: "col-searchable-text" },
            { columnKey: "optionType", columnHeader: "Type", columnClass: "col-option-type col-dropdown-select col-not-content-editable col-searchable-text" },
            { columnKey: "optionActive", columnHeader: "Active", columnClass: "col-active-flag col-not-content-editable" }
        ],
        defaultData: defaultConfig.optionData
    },
    {
        tableId: "blacklist-table",
        tableTitle: "Domain Blacklist",
        tableDescription: "Manage blacklisted domains",
        tableControls: true,
        tableSearchPlaceholder: "Search domains",
        tableRender: true,
        tableEditable: true,
        tableStorageKey: "blacklistData",
        tableColumns: [
            { columnKey: "blacklistDomain", columnHeader: "Domain", columnClass: "col-searchable-text" },
            { columnKey: "blacklistActive", columnHeader: "Active", columnClass: "col-active-flag col-not-content-editable" }
        ],
        defaultData: defaultConfig.blacklistData
    },
    {
        tableId: "remove-elements-table",
        tableTitle: "Remove Elements",
        tableDescription: "Manage elements to be removed",
        tableControls: true,
        tableSearchPlaceholder: "Search elements",
        tableRender: true,
        tableEditable: true,
        tableStorageKey: "removeElementData",
        tableColumns: [
            { columnKey: "removeElementType", columnHeader: "Type", columnClass: "col-element-type col-dropdown-select col-not-content-editable col-searchable-text" },
            { columnKey: "removeElementText", columnHeader: "Text", columnClass: "col-searchable-text" },
            { columnKey: "removeElementActive", columnHeader: "Active", columnClass: "col-active-flag col-not-content-editable" }
        ],
        defaultData: defaultConfig.removeElementData
    }
];

const actionsButtons = `
<i class="row-icon edit-icon fa-regular fa-pen-to-square fa-xl"></i>
<i class="row-icon save-icon fa-regular fa-floppy-disk fa-xl" style="display:none;"></i>
<i class="row-icon delete-icon fa-regular fa-trash-can fa-xl"></i>
<i class="row-icon cancel-icon fa-regular fa-ban fa-xl" style="display:none;"></i>
`;

const select2Options = [{
    columnKey: "removeElementType",
    columnOptions: ["ID", "Tag", "Class"]
},
{
    columnKey: "optionType",
    columnOptions: ["Metadata", "Extra Param","Init Option"]
},
{
    columnKey: "proactiveChatAutoOpen",
    columnOptions: ["On Click", "Automatically"]
}
]




