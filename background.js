// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message from popup.js:", message);

  // Check if the message contains settings
  if (message.settings) {
      console.log("Settings received:", message.settings);
      
      mergeWithServerSettings(message.settings)
          .then(mergedData => {
              console.log("Merged data:", mergedData);
              captureScreenshot(mergedData);
          })
          .catch(error => {
              console.error("Error merging settings with server settings:", error);
          });
  }
});

function mergeWithServerSettings(userSettings) {
  // Fetch server settings and merge with user settings
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

  // Capture visible tab as a PNG image
  chrome.tabs.captureVisibleTab({ format: "png" }, (screenshotUrl) => {
      console.log("Screenshot URL:", screenshotUrl);

      if (chrome.runtime.lastError) {
          console.error("Error capturing screenshot:", chrome.runtime.lastError);
          return;
      }

      fetch(screenshotUrl)
          .then((response) => response.blob())
          .then((blob) => {
              // Prepare the request body as FormData
              const formData = new FormData();
              formData.append("tgid", mergedData.tgid);
              formData.append("hash", mergedData.hash);
              formData.append("lang", mergedData.lang);
              formData.append("image", blob, "screenshot.png");

              // Make the HTTP POST request to the server
              fetch("https://interviewhelpers.com:8443", {
                  method: "POST",
                  body: formData,
              })
                  .then((response) => {
                      if (!response.ok) {
                          throw new Error("Network response was not ok");
                      }
                      // Handle the API response if needed
                  })
                  .catch((error) => {
                      console.error("Error sending data to the server:", error);
                  });
          });
  });
}
