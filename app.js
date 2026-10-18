
const $ = selector => document.querySelector(selector);

const messagesEl = $("#messages");
const welcomeEl = $("#welcome");
const form = $("#chat-form");
const input = $("#message-input");
const sendButton = $("#send-button");
const historyEl = $("#chat-history");

const CHATS_KEY = "pixa.chats.v1";
const ACTIVE_KEY = "pixa.active.v1";
const THEME_KEY = "pixa.theme.v1";

let chats = loadChats();
let activeId = localStorage.getItem(ACTIVE_KEY);
let busy = false;

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function loadChats() {
  try {
    const saved = JSON.parse(localStorage.getItem(CHATS_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveChats() {
  try {
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
    localStorage.setItem(ACTIVE_KEY, activeId || "");
  } catch {
    setStatus("Storage full");
  }
}

function setStatus(text) {
  const status = $("#model-status");
  if (status) status.textContent = text;
}

function getChat() {
  return chats.find(chat => chat.id === activeId);
}

function createChat() {
  const chat = {
    id: makeId(),
    title: "New chat",
    messages: [],
    createdAt: Date.now()
  };

  chats.unshift(chat);
  activeId = chat.id;
  saveChats();
  renderHistory();
  renderChat();
  input.focus();
}

function renderHistory() {
  historyEl.replaceChildren();

  chats.forEach(chat => {
    const button = document.createElement("button");
    button.className = "history-item" +
      (chat.id === activeId ? " active" : "");
    button.textContent = chat.title || "New chat";

    button.addEventListener("click", () => {
      activeId = chat.id;
      saveChats();
      renderHistory();
      renderChat();
      if (innerWidth <= 700) {
        $("#sidebar").classList.remove("open");
      }
    });

    historyEl.append(button);
  });
}

function addMessage(role, content) {
  const row = document.createElement("article");
  row.className = "message";

  const avatar = document.createElement("div");
  avatar.className = "avatar" +
    (role === "assistant" ? " assistant" : "");
  avatar.textContent = role === "assistant" ? "P" : "Y";

  const wrapper = document.createElement("div");
  wrapper.className = "message-content";

  const label = document.createElement("div");
  label.className = "message-role";
  label.textContent = role === "assistant" ? "Pixa" : "You";

  const body = document.createElement("div");
  body.className = "message-text";
  body.textContent = content;

  wrapper.append(label, body);
  row.append(avatar, wrapper);
  messagesEl.append(row);

  return body;
}

function renderChat() {
  messagesEl.replaceChildren();

  const chat = getChat();

  if (!chat || chat.messages.length === 0) {
    messagesEl.append(welcomeEl);
    welcomeEl.hidden = false;
    return;
  }

  welcomeEl.hidden = true;

  chat.messages.forEach(message => {
    addMessage(message.role, message.content);
  });

  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function containsAny(text, words) {
  return words.some(word => text.includes(word));
}

function ruleBasedReply(message) {
  const text = message.toLowerCase().trim();
  const words = text.split(/\s+/);

  if (/^(hi|hello|hey|hiya|yo|sup)\b/.test(text)) {
    return "Hey! 👋 I'm Pixa, your rule-based assistant. What would you like to talk about?";
  }

  if (containsAny(text, ["your name", "who are you", "what are you"])) {
    return "I'm Pixa! I'm a rule-based AI assistant. I use programmed rules and patterns to respond, rather than a large language model.";
  }

  if (containsAny(text, ["what can you do", "help me", "your features"])) {
    return [
      "Here's what I can help with:",
      "",
      "• Answer common questions",
      "• Explain basic science and maths",
      "• Give simple coding examples",
      "• Suggest ideas and activities",
      "• Respond to greetings and everyday messages",
      "",
      "I use built-in rules, so I may not understand every message."
    ].join("\n");
  }

  if (containsAny(text, ["what time", "what date", "today's date", "current date"])) {
    return `Your device date and time is ${new Date().toLocaleString()}.`;
  }

  if (containsAny(text, ["thank you", "thanks", "cheers"])) {
    return "You're welcome! 😊 Is there anything else I can help with?";
  }

  if (containsAny(text, ["how are you", "how's it going"])) {
    return "I'm running smoothly and ready to help! What would you like to know?";
  }

  if (containsAny(text, ["joke", "make me laugh", "tell me something funny"])) {
    const jokes = [
      "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
      "Why did the computer get cold? It left its Windows open!",
      "What do you call a computer that sings? A Dell!",
      "Why was the maths book sad? It had too many problems."
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  if (containsAny(text, ["capital of france", "capital city of france"])) {
    return "The capital of France is Paris.";
  }

  if (containsAny(text, ["capital of england", "capital of the uk", "capital of united kingdom"])) {
    return "London is the capital of the United Kingdom and England.";
  }

  if (containsAny(text, ["largest planet", "biggest planet"])) {
    return "Jupiter is the largest planet in our Solar System.";
  }

  if (containsAny(text, ["planet", "solar system", "space"])) {
    return "Our Solar System has eight recognised planets orbiting the Sun. Mercury, Venus, Earth and Mars are rocky planets. Jupiter and Saturn are gas giants, while Uranus and Neptune are ice giants.";
  }

  if (containsAny(text, ["photosynthesis", "how do plants make food"])) {
    return "Photosynthesis is how plants use sunlight to turn water and carbon dioxide into sugars. It takes place mainly in their leaves and releases oxygen.";
  }

  if (containsAny(text, ["what is gravity", "explain gravity"])) {
    return "Gravity is the attraction between objects that have mass. Earth's gravity pulls objects toward its centre and keeps us on the ground.";
  }

  if (containsAny(text, ["what is an atom", "explain atoms"])) {
    return "An atom is a basic unit of matter. It has a nucleus containing protons and usually neutrons, with electrons occupying regions around the nucleus.";
  }

  if (containsAny(text, ["javascript", "write code", "coding", "programming"])) {
    return [
      "Here's a simple JavaScript example:",
      "",
      "const greet = name => `Hello, ${name}!`;",
      "console.log(greet('Pixa'));",
      "",
      "This defines a function that returns a greeting. Tell me what you want your program to do and I'll try to help."
    ].join("\n");
  }

  if (containsAny(text, ["maths", "mathematics", "calculate", "what is"])) {
    const arithmetic = text.match(
      /(-?\d+(?:\.\d+)?)\s*([+*/])\s*(-?\d+(?:\.\d+)?)/
    );

    if (arithmetic) {
      const a = Number(arithmetic[1]);
      const operator = arithmetic[2];
      const b = Number(arithmetic[3]);

      if (operator === "+") return `${a} + ${b} = ${a + b}`;
      if (operator === "*") return `${a} × ${b} = ${a * b}`;
      if (operator === "/") {
        return b === 0
          ? "You cannot divide by zero."
          : `${a} ÷ ${b} = ${a / b}`;
      }
      if (operator === "-") return `${a} - ${b} = ${a - b}`;
    }
  }

  if (containsAny(text, ["idea", "creative", "project"])) {
    return "Here's an idea: build a mini quiz app with different categories, a score counter, and a streak bonus. You could make it part of Pixa!";
  }

  if (containsAny(text, ["sad", "upset", "bad day", "stressed"])) {
    return "I'm sorry things feel difficult right now. You don't have to solve everything at once. Would it help to talk through what's bothering you or think of one small next step?";
  }

  if (containsAny(text, ["bye", "goodbye", "see you"])) {
    return "See you later! 👋 You can come back to Pixa whenever you need a hand.";
  }

  if (words.length < 3) {
    return "Could you tell me a little more? I'll try to find a rule that matches what you mean.";
  }

  return "I haven't got a rule for that question yet. Try asking about space, science, coding, maths, or general knowledge. You can also add more rules to my ruleBasedReply function in app.js.";
}

async function submitMessage(value) {
  const prompt = value.trim();
  if (!prompt || busy) return;

  if (!getChat()) createChat();

  const chat = getChat();
  chat.messages.push({ role: "user", content: prompt });

  if (chat.messages.length === 1) {
    chat.title = prompt.slice(0, 42);
  }

  saveChats();
  renderHistory();
  renderChat();

  input.value = "";
  input.style.height = "auto";
  busy = true;
  sendButton.disabled = true;
  setStatus("Thinking");

  const pending = addMessage("assistant", "Thinking...");

  await new Promise(resolve => setTimeout(resolve, 250));

  const reply = ruleBasedReply(prompt);
  pending.textContent = reply;

  chat.messages.push({ role: "assistant", content: reply });
  saveChats();
  renderHistory();

  busy = false;
  sendButton.disabled = false;
  setStatus("Rule-based mode");
  messagesEl.scrollTop = messagesEl.scrollHeight;
  input.focus();
}

form.addEventListener("submit", event => {
  event.preventDefault();
  submitMessage(input.value);
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 180)}px`;
});

input.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

$("#new-chat").addEventListener("click", createChat);

document.querySelectorAll("[data-prompt]").forEach(button => {
  button.addEventListener("click", () => {
    input.value = button.dataset.prompt;
    form.requestSubmit();
  });
});

$("#menu-toggle").addEventListener("click", () => {
  $("#sidebar").classList.toggle("open");
});

$("#theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("light");
  localStorage.setItem(
    THEME_KEY,
    document.body.classList.contains("light") ? "light" : "dark"
  );
});

$("#settings-button").addEventListener("click", () => {
  const dialog = $("#settings-dialog");
  if (dialog.open) dialog.close();
  else dialog.showModal();
});

$("#close-settings").addEventListener("click", () => {
  $("#settings-dialog").close();
});

const installButton = $("#install-button");
let installPrompt = null;

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener("click", async () => {
  if (!installPrompt) return;
  await installPrompt.prompt();
  installPrompt = null;
  installButton.hidden = true;
});

if (localStorage.getItem(THEME_KEY) === "light") {
  document.body.classList.add("light");
}

if (!chats.length) {
  createChat();
} else {
  if (!chats.some(chat => chat.id === activeId)) {
    activeId = chats[0].id;
  }
  renderHistory();
  renderChat();
  saveChats();
}

setStatus("Rule-based mode");

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      setStatus("Rule-based mode");
    });
  });
}
