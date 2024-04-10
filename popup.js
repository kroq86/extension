document.addEventListener("DOMContentLoaded", () => {
  const captureButton = document.getElementById("captureButton");
  const saveButton = document.getElementById("saveButton");
  const tgidInput = document.getElementById("tgidInput");
  const hashInput = document.getElementById("hashInput");
  const langInput = document.getElementById("langInput");

  // Load saved settings from local storage
  const savedSettings = JSON.parse(localStorage.getItem("extensionSettings")) || {};
  tgidInput.value = savedSettings.tgid || "";
  hashInput.value = savedSettings.hash || "";
  langInput.value = savedSettings.lang || "";

  // Enable/disable capture button based on input values
  function updateCaptureButtonState() {
    captureButton.disabled = !(tgidInput.value && hashInput.value && langInput.value);
  }

  // Update button state when inputs change
  tgidInput.addEventListener("input", updateCaptureButtonState);
  hashInput.addEventListener("input", updateCaptureButtonState);
  langInput.addEventListener("input", updateCaptureButtonState);

  // Save button click event
  saveButton.addEventListener("click", () => {
    // Save user input to local storage
    const newSettings = {
      tgid: tgidInput.value,
      hash: hashInput.value,
      lang: langInput.value,
    };
    localStorage.setItem("extensionSettings", JSON.stringify(newSettings));

    // Optionally hide input fields after saving
    tgidInput.style.display = "none";
    hashInput.style.display = "none";
    langInput.style.display = "none";

    // Enable capture button after saving
    captureButton.disabled = false;
  });

  // Capture button click event
  captureButton.addEventListener("click", () => {
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
          formData.append("tgid", tgidInput.value);
          formData.append("hash", hashInput.value);
          formData.append("lang", langInput.value);
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
  });

  // Initial button state setup
  updateCaptureButtonState();
});

