function injectCode(src) {
    const script = document.createElement('script');
    const wrapper = document.createElement("div");
    wrapper.id = "chatbotize";

    // This is why it works!
    script.src = src;
    script.onload = function() {
        console.log("Zowie Widget script has been successfully injected");
        this.remove();
    };

    let element = document.documentElement;    
    element.appendChild(script);
    element.append(wrapper);
    console.log("Empty DIV for Zowie Widget has been created successfully");

}

injectCode(chrome.runtime.getURL('/widget_source.js'));