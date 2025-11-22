const DEFAULT_PROMPT = "";
const PROVIDER_KEY_FIELDS = {
  groq: { key: "groqApiKey", label: "Groq API Key", placeholder: "gsk_..." },
  openai: { key: "openaiApiKey", label: "OpenAI API Key", placeholder: "sk-..." },
  gemini: { key: "geminiApiKey", label: "Gemini API Key", placeholder: "AIza..." },
};

function $(id) {
  return document.getElementById(id);
}

function showStatus(message, isError = false) {
  const status = $("status");
  status.textContent = message;
  status.style.color = isError ? "#f45d22" : "#1da1f2";
}

function loadSettings() {
  chrome.storage.sync.get(["provider", "groqApiKey", "openaiApiKey", "geminiApiKey", "replyPrompt"], (data) => {
    const provider = data.provider || "groq";
    $("provider").value = provider;
    const meta = PROVIDER_KEY_FIELDS[provider];
    $("apiKey").value = data[meta.key] || "";
    $("prompt").value = data.replyPrompt ?? DEFAULT_PROMPT;
    updateKeyLabel(provider);
  });
}

function saveSettings() {
  const provider = $("provider").value;
  const apiKey = $("apiKey").value.trim();
  const replyPrompt = $("prompt").value.trim();

  chrome.storage.sync.get(["groqApiKey", "openaiApiKey", "geminiApiKey"], (data) => {
    const payload = {
      provider,
      replyPrompt,
      groqApiKey: data.groqApiKey || "",
      openaiApiKey: data.openaiApiKey || "",
      geminiApiKey: data.geminiApiKey || "",
    };
    const meta = PROVIDER_KEY_FIELDS[provider];
    payload[meta.key] = apiKey;

    chrome.storage.sync.set(payload, () => {
      showStatus("Saved.");
    });
  });
}

function openOptions() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else if (chrome.runtime.id) {
    window.open(`chrome-extension://${chrome.runtime.id}/options.html`);
  } else {
    showStatus("Could not open options page", true);
  }
}

function updateKeyLabel(provider) {
  const meta = PROVIDER_KEY_FIELDS[provider];
  $("apiKey").placeholder = meta.placeholder;
  $("apiKey").previousElementSibling.textContent = meta.label;
  $("keyHint").textContent = `Stored locally via chrome.storage for ${meta.label.split(" ")[0]}.`;
}

document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  $("save").addEventListener("click", saveSettings);
  $("open-options").addEventListener("click", openOptions);
  $("provider").addEventListener("change", () => {
    const provider = $("provider").value;
    updateKeyLabel(provider);
    chrome.storage.sync.get(Object.values(PROVIDER_KEY_FIELDS).map((m) => m.key), (data) => {
      const meta = PROVIDER_KEY_FIELDS[provider];
      $("apiKey").value = data[meta.key] || "";
    });
  });
});
