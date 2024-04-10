chrome.commands.onCommand.addListener((command) => {
  if (command === "capture-screenshot") {
    // Load the JSON data from the server-settings.json file
    fetch(chrome.runtime.getURL('server-settings.json'))
      .then(response => response.json())
      .then(data => {
        // Get user input from local storage
        const userSettings = JSON.parse(localStorage.getItem("extensionSettings")) || {};

        // Merge user input with server settings
        const { tgid: userTgid, hash: userHash, lang: userLang } = userSettings;
        const { tgid: serverTgid, hash: serverHash, lang: serverLang } = data;
        const mergedData = {
          tgid: userTgid || serverTgid,
          hash: userHash || serverHash,
          lang: userLang || serverLang,
        };

        // Capture visible tab as a PNG image
        chrome.tabs.captureVisibleTab({ format: "png" }, (screenshotUrl) => {
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
      })
      .catch(error => {
        console.error('Error loading server settings:', error);
      });
  }
});

