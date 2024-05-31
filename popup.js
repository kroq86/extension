document.getElementById('saveButton').addEventListener('click', () => {
  const tgid = document.getElementById('tgidInput').value;
  const hash = document.getElementById('hashInput').value;
  const lang = document.getElementById('langInput').value;

  const settings = { tgid, hash, lang };
  console.log("Saving settings:", settings);

  chrome.storage.local.set({ extensionSettings: settings }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error saving settings:", chrome.runtime.lastError);
    } else {
      console.log("Settings saved successfully.");
      document.getElementById('captureButton').disabled = false;
    }
  });
});

document.getElementById('captureButton').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: "capture-screenshot" });
});

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get("extensionSettings", (result) => {
    if (chrome.runtime.lastError) {
      console.error("Error loading settings:", chrome.runtime.lastError);
    } else {
      const settings = result.extensionSettings || {};
      console.log("Loaded settings:", settings);

      if (settings.tgid) document.getElementById('tgidInput').value = settings.tgid;
      if (settings.hash) document.getElementById('hashInput').value = settings.hash;
      if (settings.lang) document.getElementById('langInput').value = settings.lang;

      document.getElementById('captureButton').disabled = !settings.tgid || !settings.hash || !settings.lang;
    }
  });
});
