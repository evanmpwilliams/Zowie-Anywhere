function removeChatWidgetElement(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => element.remove());
}

function removeChatWidgetElementById(id) {
    const element = document.getElementById(id);
    if (element) element.remove();
}

removeChatWidgetElement(".js-chat-buttons-container-genesys");
removeChatWidgetElement(".chat-button");
removeChatWidgetElementById("chat-button");
removeChatWidgetElementById("fc_frame");
removeChatWidgetElementById("launcher");
removeChatWidgetElementById("ui-inin-chat-open");
removeChatWidgetElementById("gorgias-chat-container");
removeChatWidgetElementById("chat-widget-container");
removeChatWidgetElement(".zhiCustomBtn");
removeChatWidgetElement(".back-to-top");
removeChatWidgetElementById("kustomer-ui-sdk-iframe");
removeChatWidgetElement(".PreboardingModal_PreboardingBubble__XEMtd");
removeChatWidgetElement(".dixa-messenger-namespace");
removeChatWidgetElementById("solvvy-lazy-button");
removeChatWidgetElementById("reamazejs-container");
removeChatWidgetElement(".chat-start-btn");
removeChatWidgetElement("access-widget-ui");
removeChatWidgetElement(".scroll-to-top");
removeChatWidgetElement(".general-feedback-button");
removeChatWidgetElement(".intercom-launcher");
removeChatWidgetElementById("ast-scroll-top");
removeChatWidgetElement(".zopim");
removeChatWidgetElementById("solvvy-widget-iframe");
removeChatWidgetElement(".richpanel-micro");
removeChatWidgetElementById("richpanel_messenger_iframe");




var chatbotizeInstanceId = document.getElementById("chatbotize-load-script").getAttribute("instanceid");
var headerColor = document.getElementById("chatbotize-load-script").getAttribute("headerColor");
var logoUrl = document.getElementById("chatbotize-load-script").getAttribute("logoUrl");
var chatName = document.getElementById("chatbotize-load-script").getAttribute("chatName");
var chatDesc = document.getElementById("chatbotize-load-script").getAttribute("chatDesc");
var textBgColor = document.getElementById("chatbotize-load-script").getAttribute("textBgColor");
var ctaHeader = document.getElementById("chatbotize-load-script").getAttribute("ctaHeader");
var ctaText = document.getElementById("chatbotize-load-script").getAttribute("ctaText");
var brandName = document.getElementById("chatbotize-load-script").getAttribute("brandName");
var returningUser = document.getElementById("chatbotize-load-script").getAttribute("returningUser");
var buyingIntent = document.getElementById("chatbotize-load-script").getAttribute("buyingIntent");
var returningUserCtaHeader = document.getElementById("chatbotize-load-script").getAttribute("returningUserCtaHeader");
var returningUserCtaText = document.getElementById("chatbotize-load-script").getAttribute("returningUserCtaText");
var buyingIntentCtaHeader = document.getElementById("chatbotize-load-script").getAttribute("buyingIntentCtaHeader");
var buyingIntentCtaText = document.getElementById("chatbotize-load-script").getAttribute("buyingIntentCtaText");
var userFirstName = document.getElementById("chatbotize-load-script").getAttribute("userFirstName");
var userLastName = document.getElementById("chatbotize-load-script").getAttribute("userLastName");
var userEmail = document.getElementById("chatbotize-load-script").getAttribute("userEmail");





if (buyingIntent == "true") {
    ctaHeader = buyingIntentCtaHeader;
    ctaText = buyingIntentCtaText;
   
}

if (returningUser == "true") {
    ctaHeader = returningUserCtaHeader;
    ctaText = returningUserCtaText;
}

// Use 'var' to declare variables that may be redeclared
var currentUrl = window.location.href;
var url = new URL(currentUrl);
var emailAutomation = url.searchParams.get('emailAutomation');


if (emailAutomation == "true"){
    ctaHeader = "Welcome back, Evan!";
    ctaText = "Let's get your issue resolved ASAP."
    returningUser = "false";
    buyingIntent = "false";
}

console.log(returningUser);

Chatbotize.init({
    instanceId: chatbotizeInstanceId,
    startOnOpen: true,
    headerMode: "white",
    primaryColor: headerColor,
    secondaryColor: textBgColor,
    logoUrl: logoUrl,
    name: chatName,
    description: chatDesc,
    desktopCta: {
        mode: "VISIBLE",
        header: ctaHeader,
        text: ctaText,
        showDelay: 0
    },
    metadata: {
        firstName: userFirstName,
        lastName: userLastName,
        email: userEmail,
        extraParams: {
            brandName: brandName,
            returningUser: returningUser,
            buyingIntent: buyingIntent,
            emailAutomation: emailAutomation
        }
    },
    onLoaded: function() {
        if (buyingIntent == "true") {
            setTimeout(function() {
                Chatbotize.start();
            }, 8000);
        }

        if (emailAutomation == "true") {
            setTimeout(function() {
                Chatbotize.start();
            }, 8000);
        }
    }
});