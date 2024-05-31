chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "capture-screenshot") {
      console.log("Message action: capture-screenshot received");
      loadSettingsFromChromeStorage()
        .then(localSettings => mergeWithServerSettings(localSettings))
        .then(mergedData => {
          captureScreenshot(mergedData);
        })
        .catch(error => {
          console.error("Error loading settings or capturing screenshot:", error);
        });
    }
  });
  
  chrome.commands.onCommand.addListener((command) => {
    console.log("Command received:", command);
    if (command === "capture-screenshot") {
      console.log("Keybinding triggered: capture-screenshot");
      loadSettingsFromChromeStorage()
        .then(localSettings => mergeWithServerSettings(localSettings))
        .then(mergedData => {
          captureScreenshot(mergedData);
        })
        .catch(error => {
          console.error("Error loading settings or capturing screenshot:", error);
        });
    }
  });
  
  function loadSettingsFromChromeStorage() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get("extensionSettings", (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          console.log("Loaded settings from Chrome storage:", result.extensionSettings);
          resolve(result.extensionSettings || {});
        }
      });
    });
  }
  
  function mergeWithServerSettings(userSettings) {
    return fetch(chrome.runtime.getURL('server-settings.json'))
      .then(response => response.json())
      .then(serverSettings => {
        const mergedSettings = {
          tgid: userSettings.tgid || serverSettings.tgid,
          hash: userSettings.hash || serverSettings.hash,
          lang: userSettings.lang || serverSettings.lang
        };
        console.log("Merged settings:", mergedSettings);
        return mergedSettings;
      });
  }
  
  function captureScreenshot(mergedData) {
    console.log("Capturing screenshot with data:", mergedData);
  
    chrome.tabs.captureVisibleTab({ format: "png" }, (screenshotUrl) => {
      if (chrome.runtime.lastError) {
        console.error("Error capturing screenshot:", chrome.runtime.lastError);
        return;
      }
  
      console.log("Screenshot URL:", screenshotUrl);
      fetch(screenshotUrl)
        .then(response => response.blob())
        .then(blob => {
          const formData = new FormData();
          formData.append("tgid", mergedData.tgid);
          formData.append("hash", mergedData.hash);
          formData.append("lang", mergedData.lang);
          formData.append("image", blob, "screenshot.png");
  
          return fetch("https://interviewhelpers.com:8443", {
            method: "POST",
            body: formData,
          });
        })
        .then(response => {
          if (!response.ok) {
            throw new Error("Failed to send data to the server");
          }
          console.log("Successfully sent data to the server");
        })
        .catch(error => {
          console.error("Error sending data to the server:", error);
        });
    });
  }
  
