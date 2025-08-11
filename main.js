// Bird Pokedex - Game Version
let vault = [];
let energy = 10;
let xp = 0;
let streak = 0;
let vaultLimit = 20;
let rareBoost = false;
let lastDay = null;

function $(id) {
  return document.getElementById(id);
}

function renderVault() {
  const v = $("vault");
  v.innerHTML = "";
  vault.forEach((bird, i) => {
    const d = document.createElement("div");
    d.className = "vault-bird";
    d.title = bird.name;
    if (bird.image) {
      const img = document.createElement("img");
      img.src = bird.image;
      img.alt = bird.name;
      d.appendChild(img);
    }
    const name = document.createElement("div");
    name.textContent = bird.name;
    d.appendChild(name);
    v.appendChild(d);
  });
}

function addToVault(bird) {
  if (vault.length >= vaultLimit) {
    alert("Vault full! Expand your vault in the shop.");
    return;
  }
  if (!vault.some((b) => b.name === bird.name)) {
    vault.push(bird);
    renderVault();
    localStorage.setItem("birdVault", JSON.stringify(vault));
  }
}

function loadVault() {
  const data = localStorage.getItem("birdVault");
  if (data) {
    vault = JSON.parse(data);
    renderVault();
  }
  const e = localStorage.getItem("energy");
  if (e !== null) energy = parseInt(e);
  const x = localStorage.getItem("xp");
  if (x !== null) xp = parseInt(x);
  const s = localStorage.getItem("streak");
  if (s !== null) streak = parseInt(s);
  const l = localStorage.getItem("vaultLimit");
  if (l !== null) vaultLimit = parseInt(l);
  updateStats();
}

function updateStats() {
  $("energyValue").textContent = energy;
  $("xpValue").textContent = xp;
  $("streakValue").textContent = streak;
}

function saveStats() {
  localStorage.setItem("energy", energy);
  localStorage.setItem("xp", xp);
  localStorage.setItem("streak", streak);
  localStorage.setItem("vaultLimit", vaultLimit);
}

// Bird sound recognition and info fetch
async function recognizeBird(audioBlob) {
  // Placeholder: In production, send audioBlob to BirdNET or similar API
  // For demo, randomly pick a bird
  const demoBirds = [
    { name: "Northern Cardinal" },
    { name: "American Robin" },
    { name: "Blue Jay" },
    { name: "House Sparrow" },
    { name: "European Starling" },
    { name: "Scarlet Tanager" },
    { name: "Baltimore Oriole" },
    { name: "Downy Woodpecker" },
    { name: "Mourning Dove" },
    { name: "Red-winged Blackbird" }
  ];
  let bird;
  if (rareBoost && Math.random() < 0.5) {
    bird = { name: "Mythical Phoenix" };
  } else {
    bird = demoBirds[Math.floor(Math.random() * demoBirds.length)];
  }
  const info = await fetchBirdInfo(bird.name);
  return info;
}

async function fetchBirdInfo(name) {
  // Use a free AI image API for consistent cartoon style (e.g., Replicate's Stable Diffusion)
  let image = "";
  let summary = "";
  let rarity = "Common";
  if (name === "Mythical Phoenix") {
    rarity = "Legendary";
    summary = "A legendary bird of fire and rebirth.";
  } else {
    try {
      // Use Replicate's free endpoint for demo (replace with your own key for production)
      // We'll use a placeholder cartoon bird image for demo
      image = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}&backgroundColor=ffd700,00b894`;
      // Optionally, fetch summary from Wikipedia
      const wikiTitle = name.replace(/ /g, "_");
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}`);
      const data = await res.json();
      summary = data.extract || "A beautiful bird.";
    } catch {
      summary = "A beautiful bird.";
    }
    // Assign rarity
    if (name.includes("Phoenix")) rarity = "Legendary";
    else if (name.includes("Tanager") || name.includes("Oriole")) rarity = "Rare";
    else if (name.includes("Woodpecker") || name.includes("Blackbird")) rarity = "Uncommon";
  }
  return { name, image, summary, rarity };
}

function showDetectedBird(bird) {
  $("bird-section").style.display = "block";
  $("birdName").textContent = bird.name;
  $("birdDetails").textContent = bird.summary;
  $("birdRarity").textContent = `Rarity: ${bird.rarity}`;
  if (bird.image) {
    $("birdImage").src = bird.image;
    $("birdImage").style.display = "block";
  } else {
    $("birdImage").style.display = "none";
  }
}

// Microphone recording
let mediaRecorder = null;
let audioChunks = [];

function startRecording() {
  if (energy <= 0) {
    alert("Out of energy! Buy more in the shop or wait for refill.");
    return;
  }
  $("recordStatus").textContent = "Listening...";
  $("recordBtn").disabled = true;
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
      mediaRecorder.onstop = async () => {
        $("recordStatus").textContent = "Processing...";
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const bird = await recognizeBird(audioBlob);
        showDetectedBird(bird);
        addToVault(bird);
        xp += 10;
        energy--;
        updateStats();
        saveStats();
        // Streak logic
        const today = new Date().toDateString();
        if (lastDay !== today) {
          streak++;
          lastDay = today;
          localStorage.setItem("lastDay", lastDay);
        }
        $("recordStatus").textContent = "";
        $("recordBtn").disabled = false;
      };
      mediaRecorder.start();
      setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
      }, 4000); // 4 seconds
    })
    .catch(() => {
      $("recordStatus").textContent = "Microphone access denied.";
      $("recordBtn").disabled = false;
    });
}

function buyEnergy() {
  energy += 10;
  updateStats();
  saveStats();
}

function buyBoost() {
  rareBoost = true;
  setTimeout(() => { rareBoost = false; }, 60000); // 1 min boost
  alert("Rare Boost activated for 1 minute!");
}

function expandVault() {
  vaultLimit += 10;
  updateStats();
  saveStats();
  alert("Vault expanded! You can now store more birds.");
}

function setupShop() {
  $("buyEnergy").onclick = buyEnergy;
  $("buyBoost").onclick = buyBoost;
  $("expandVault").onclick = expandVault;
}

window.onload = function () {
  lastDay = localStorage.getItem("lastDay") || null;
  loadVault();
  updateStats();
  $("recordBtn").onclick = startRecording;
  setupShop();
};
