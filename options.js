const DEFAULT_PROMPT = "Act as a human user on Twitter. Reply to the tweet using American slang (bahasa gaul amerika). Your reply MUST be directly relevant to the tweet's content. Do NOT explain or summarize. React naturally. Keep it concise and chill. Use proper capitalization. Do NOT use emojis.";
const PROVIDER_KEY_FIELDS = {
  groq: { key: "groqApiKey", label: "Groq API Key", placeholder: "gsk_..." },
  openai: { key: "openaiApiKey", label: "OpenAI API Key", placeholder: "sk-..." },
  gemini: { key: "geminiApiKey", label: "Gemini API Key", placeholder: "AIza..." },
};

function $(id) {
  return document.getElementById(id);
}

function showStatus(message) {
  const status = $("status");
  status.textContent = message;
  status.style.visibility = "visible";
  setTimeout(() => (status.style.visibility = "hidden"), 2000);
}

function loadSettings() {
  chrome.storage.sync.get(["provider", "groqApiKey", "openaiApiKey", "geminiApiKey", "replyPrompt"], (data) => {
    const provider = data.provider || "groq";
    $("provider").value = provider;
    const keyField = PROVIDER_KEY_FIELDS[provider];
    $("apiKey").value = data[keyField.key] || "";
    $("prompt").value = data.replyPrompt || DEFAULT_PROMPT;
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

function resetPrompt() {
  $("prompt").value = DEFAULT_PROMPT;
  showStatus("Prompt reset.");
}

function updateKeyLabel(provider) {
  const meta = PROVIDER_KEY_FIELDS[provider];
  $("apiKey").placeholder = meta.placeholder;
  $("apiKey").previousElementSibling.textContent = meta.label;
  $("keyHint").textContent = `Stored locally via chrome.storage for ${meta.label.split(" ")[0]}.`;
}

document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  $("provider").addEventListener("change", () => {
    const provider = $("provider").value;
    updateKeyLabel(provider);
    chrome.storage.sync.get(Object.values(PROVIDER_KEY_FIELDS).map((m) => m.key), (data) => {
      const meta = PROVIDER_KEY_FIELDS[provider];
      $("apiKey").value = data[meta.key] || "";
    });
  });
  $("save").addEventListener("click", saveSettings);
  $("reset").addEventListener("click", resetPrompt);
});
