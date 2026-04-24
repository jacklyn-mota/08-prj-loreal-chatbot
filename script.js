/* =========================
   DOM ELEMENTS
========================= */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

/* =========================
   APP STATE
========================= */
const workerEndpoint =
  "https://gca-worker.motajacklyn00.workers.dev/";

const conversationHistory = [];
let userName = "";

/* =========================
   INIT CHAT
========================= */
initializeChat();

/* =========================
   FORM SUBMIT
========================= */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  captureUserName(message);

  addMessage("user", message);

  conversationHistory.push({
    role: "user",
    content: message,
  });

  userInput.value = "";

  const loadingBubble = addMessage("assistant", "Thinking...");

  scrollToNewestMessage();

  try {
    const response = await fetch(workerEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: buildMessagesForRequest(),
      }),
    });

    const data = await response.json();

    const reply =
      data?.reply?.trim() ||
      "Sorry, I couldn't generate a response.";

    loadingBubble.textContent = reply;

    conversationHistory.push({
      role: "assistant",
      content: reply,
    });

    scrollToNewestMessage();
  } catch (error) {
    loadingBubble.textContent =
      "Sorry, something went wrong. Please try again.";
  }
});

/* =========================
   CHAT UI
========================= */
function initializeChat() {
  addMessage(
    "assistant",
    "Hello! I’m your L’Oréal beauty assistant. How can I help you today?"
  );

  scrollToNewestMessage();
}

function addMessage(role, text) {
  const bubble = document.createElement("div");
  bubble.classList.add("message", role);
  bubble.textContent = text;

  chatWindow.appendChild(bubble);

  return bubble;
}

/* =========================
   SCROLL: NEWEST MESSAGE TOP
========================= */
function scrollToNewestMessage() {
  requestAnimationFrame(() => {
    const messages = chatWindow.querySelectorAll(".message");
    const newestMessage = messages[messages.length - 1];

    if (newestMessage) {
      newestMessage.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
}

/* =========================
   NAME DETECTION
========================= */
function captureUserName(text) {
  const match = text.match(
    /(?:my name is|i am|i'm)\s+([a-zA-Z'-]{2,30})/i
  );

  if (!match) return;

  userName =
    match[1].charAt(0).toUpperCase() +
    match[1].slice(1).toLowerCase();
}

/* =========================
   MESSAGE BUILDER
========================= */
function buildMessagesForRequest() {
  if (!userName) return conversationHistory;

  return [
    {
      role: "system",
      content: `The user's first name is ${userName}. Use it naturally when helpful.`,
    },
    ...conversationHistory,
  ];
}