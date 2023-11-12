var initConfigString = document.getElementById("chatbotize-load-script").getAttribute("initConfigString");
var removeElementString = document.getElementById("chatbotize-load-script").getAttribute("removeElementString");
var initConfigObject = JSON.parse(initConfigString);
var removeElements = JSON.parse(removeElementString);


if (initConfigObject.metadata.extraParams.proactiveChatAutoOpen == true) {
    console.log("proactive chat auto open to be set");

    const proactiveChatOpenDelay = initConfigObject.metadata.extraParams.proactiveChatOpenDelay * 1000;
    console.log("open delay is equal to " + proactiveChatOpenDelay);
    initConfigObject.onLoaded = function () {
        setTimeout(function () {
            Chatbotize.start();
        }, proactiveChatOpenDelay);
    };
    delete initConfigObject.metadata.extraParams.proactiveChatOpenDelay;
    delete initConfigObject.metadata.extraParams.proactiveChatAutoOpen;

}

function removeElementsFromPage(removeElements) {
    removeElements.forEach(element => {
        let elementsToRemove = [];
        switch (element.removeElementType) {
            case 'Class':
                elementsToRemove = document.getElementsByClassName(element.removeElementText);
                break;
            case 'ID':
                const idElement = document.getElementById(element.removeElementText);
                if (idElement) elementsToRemove = [idElement];
                break;
            case 'Tag':
                elementsToRemove = document.getElementsByTagName(element.removeElementText);
                break;
            default:
                console.log(`Unknown type: ${element.removeElementType}`);
                break;
        }

        // Convert HTMLCollection to an array to avoid live collection issues
        elementsToRemove = Array.from(elementsToRemove);

        elementsToRemove.forEach(el => el.parentNode.removeChild(el));
    });
}

// Call the function with your removeElements array
removeElementsFromPage(removeElements);


console.log(initConfigObject);
Chatbotize.init(initConfigObject);





