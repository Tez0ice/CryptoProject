// --- STATE ---
let currentStep = 1;
let globalCipher = "";
let savedHash = null;
let score = 0;
let persona = "tutor";
let inputStarted = false; // Tracks if user has started Module 1

// --- STARTUP ---
function bootSystem() {
  document.getElementById("homeOverlay").classList.add("hidden");
  document.getElementById("mainInterface").classList.remove("hidden");
  setTimeout(() => {
    postAiMsg(
      "System Online. Please input a message to begin the encryption process.",
      "tutor",
    );
  }, 500);
}

// --- NEW: MODULE 1 WORKFLOW ---
function checkInputStage() {
  const text = document.getElementById("plainInput").value;

  if (text.length > 0 && !inputStarted) {
    inputStarted = true;

    // Reveal Step 2 (Slider & Grid)
    const stage2 = document.getElementById("m1-stage2");
    stage2.style.opacity = "1";
    stage2.style.pointerEvents = "all";

    postAiMsg(
      "Input received. Now, adjust the Grid Key (Slider) to scramble the message.",
      "tutor",
    );
    updateScytale();
  }

  if (text.length > 0) {
    updateScytale();
  }
}

// --- NAV ---
function changeStep(dir) {
  // Only allow Next if input is present (for step 1)
  if (currentStep === 1 && dir === 1 && !inputStarted) {
    postAiMsg("You must input a message before proceeding.", "tutor");
    return;
  }

  document.getElementById(`module${currentStep}`).classList.add("hidden");
  currentStep += dir;
  document.getElementById(`module${currentStep}`).classList.remove("hidden");

  updateNavUI();

  // Context Switch logic
  if (currentStep === 1) {
    setPersona("tutor");
    document.getElementById("modTitle").innerText = "MODULE 1: TRANSPOSITION";
    document.getElementById("modDesc").innerText =
      "The Scytale Cipher wraps a message around a rod. The diameter of the rod acts as the 'Key' to scramble the letters.";
  } else if (currentStep === 2) {
    setPersona("antagonist");
    document.getElementById("integrityDisplay").innerText = globalCipher;
    document.getElementById("modTitle").innerText = "MODULE 2: INTEGRITY";
    document.getElementById("modDesc").innerText =
      "A Hash Function creates a unique 'Digital Seal'. If even one character is altered, the seal will break.";
    postAiMsg(
      "I've intercepted your connection. Let's see if you can secure this data.",
      "antagonist",
    );
  } else if (currentStep === 3) {
    setPersona("tutor");
    document.getElementById("modTitle").innerText = "MODULE 3: EXAM";
    document.getElementById("modDesc").innerText =
      "Final Certification: Verify your understanding of Transposition and Hashing.";
    loadQuiz();
    postAiMsg(
      "Back to safety. Complete this exam to verify your agent status.",
      "tutor",
    );
  }
}

function updateNavUI() {
  document
    .getElementById("btnPrev")
    .classList.toggle("invisible", currentStep === 1);
  document
    .getElementById("btnNext")
    .classList.toggle("invisible", currentStep === 3);
}

// --- MODULE 1 LOGIC ---
function updateScytale() {
  const text = document
    .getElementById("plainInput")
    .value.toUpperCase()
    .replace(/[^A-Z]/g, "_");
  const width = parseInt(document.getElementById("gridSlider").value);

  document.getElementById("keyVal").innerText = width;

  const container = document.getElementById("gridContainer");
  container.innerHTML = "";
  container.style.gridTemplateColumns = `repeat(${width}, 40px)`;

  for (let char of text) {
    let div = document.createElement("div");
    div.className = "grid-cell";
    div.innerText = char;
    container.appendChild(div);
  }

  let cipher = "";
  for (let c = 0; c < width; c++) {
    for (let i = c; i < text.length; i += width) cipher += text[i];
  }
  globalCipher = cipher;
  document.getElementById("cipherOutput").innerText = cipher;

  // Highlight Next Button if user has interacted
  if (text.length > 0) {
    const nextBtn = document.getElementById("btnNext");
    nextBtn.classList.remove("dimmed");
    nextBtn.classList.add("highlight-btn");
  }
}

// --- MODULE 2 LOGIC ---
function generateHash() {
  let hash = 0;
  for (let i = 0; i < globalCipher.length; i++)
    hash += globalCipher.charCodeAt(i);
  savedHash = hash;

  const box = document.getElementById("statusBox");
  box.classList.remove("hidden");
  box.innerHTML = `<span style="color:var(--green)">SEAL GENERATED: ${hash}</span>`;
  postAiMsg(`Seal ${hash} created. I am tracking this checksum.`, "tutor");
}

function triggerAttack() {
  if (!savedHash) {
    postAiMsg("You cannot attack unsealed data.", "tutor");
    return;
  }

  let arr = globalCipher.split("");
  let idx = Math.floor(Math.random() * arr.length);
  let oldChar = arr[idx];
  let newChar = oldChar === "X" ? "Y" : "X";
  arr[idx] = newChar;
  globalCipher = arr.join("");

  const display = document.getElementById("integrityDisplay");
  let html = "";
  for (let i = 0; i < globalCipher.length; i++) {
    if (i === idx) html += `<span class="tampered">${globalCipher[i]}</span>`;
    else html += globalCipher[i];
  }
  display.innerHTML = html;
  postAiMsg(`Hehehe... I changed '${oldChar}' to '${newChar}'.`, "antagonist");
}

function verifyHash() {
  if (!savedHash) return;
  let currentHash = 0;
  for (let i = 0; i < globalCipher.length; i++)
    currentHash += globalCipher.charCodeAt(i);

  const box = document.getElementById("statusBox");
  if (currentHash === savedHash) {
    box.innerHTML = "✅ INTEGRITY CONFIRMED";
    postAiMsg("Analysis confirmed. Data is authentic.", "tutor");
  } else {
    box.innerHTML = `❌ COMPROMISED (Old: ${savedHash} | New: ${currentHash})`;
    postAiMsg("Mismatch detected! The integrity seal is broken.", "tutor");
  }
}

// --- AI BRAIN ---
function setPersona(p) {
  persona = p;
  const avatar = document.getElementById("aiAvatar");
  const name = document.getElementById("aiName");

  avatar.className = "ai-avatar";
  if (p === "tutor") {
    avatar.classList.add("tutor");
    name.innerText = "Lab Tutor";
    name.style.color = "var(--cyan)";
  } else {
    avatar.classList.add("antagonist");
    name.innerText = "Antagonist";
    name.style.color = "var(--red)";
  }
}

function handleUserChat(e) {
  if (e.key === "Enter") sendUserChat();
}

function sendUserChat() {
  const input = document.getElementById("userQuery");
  const text = input.value.trim().toLowerCase();
  if (!text) return;

  const chatBox = document.getElementById("chatBox");
  chatBox.innerHTML += `<div class="chat-msg user">${input.value}</div>`;
  input.value = "";

  requestAnimationFrame(() => (chatBox.scrollTop = chatBox.scrollHeight));

  setTimeout(() => {
    let reply = "";

    if (text.includes("hello") || text.includes("hi")) {
      reply = persona === "tutor" ? "Greetings, Agent." : "You're still here?";
    } else if (text.includes("help") || text.includes("hint")) {
      if (currentStep === 1)
        reply =
          "HINT: Move the Grid Slider. If the width changes, the columns align differently.";
      else if (currentStep === 2)
        reply =
          "HINT: First, click 'Generate Seal' to lock the data. Then, let the Antagonist attack.";
      else
        reply =
          "HINT: Read the questions carefully. The answers depend on what you just practiced.";
    } else if (text.includes("key")) {
      reply = "The Key is the width of the grid.";
    } else if (text.includes("hash") || text.includes("seal")) {
      reply =
        "The Hash is a digital fingerprint. If data changes, the hash changes.";
    } else {
      reply =
        persona === "tutor"
          ? "I am analyzing your query... Try asking for a 'hint'."
          : "I don't care what you say. I will corrupt your data.";
    }

    postAiMsg(reply, persona);
  }, 600);
}

function postAiMsg(text, role) {
  const chatBox = document.getElementById("chatBox");
  chatBox.innerHTML += `<div class="chat-msg ai ${role}">${text}</div>`;
  requestAnimationFrame(() => (chatBox.scrollTop = chatBox.scrollHeight));
}

// --- QUIZ ---
function loadQuiz() {
  const qData = [
    {
      q: "What acts as the 'Key' in a Scytale Cipher?",
      opt: ["Ink Color", "Rod Thickness (Width)", "Paper Type"],
      corr: 1,
    },
    {
      q: "What does Hashing ensure?",
      opt: ["Confidentiality", "Data Integrity", "Speed"],
      corr: 1,
    },
    {
      q: "If one letter changes, the Hash value...",
      opt: ["Stays same", "Changes completely", "Deletes"],
      corr: 1,
    },
  ];

  const cont = document.querySelector(".quiz-container");
  cont.innerHTML = "";

  qData.forEach((item, i) => {
    let div = document.createElement("div");
    div.className = "quiz-card";
    let html = `<strong>Q${i + 1}: ${item.q}</strong><br>`;
    item.opt.forEach((o, idx) => {
      html += `<button class="quiz-opt" onclick="checkQ(this, ${idx === item.corr})">${o}</button>`;
    });
    div.innerHTML = html;
    cont.appendChild(div);
  });
}

function checkQ(btn, isCorrect) {
  if (isCorrect) {
    btn.classList.add("correct");
    score += 100;
    document.getElementById("scoreVal").innerText = score;
    postAiMsg("Correct analysis.", "tutor");
  } else {
    btn.classList.add("wrong");
    postAiMsg("Incorrect. Review the module.", "tutor");
  }

  if (score >= 300)
    document.getElementById("finishBtn").classList.remove("hidden");
}

function finishGame() {
  document.getElementById("mainInterface").classList.add("hidden");
  document.getElementById("endOverlay").classList.remove("hidden");
  confetti();
}
