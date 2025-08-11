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
    { name: "Red-winged Blackbird" },
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
      image = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
        name
      )}&backgroundColor=ffd700,00b894`;
      // Optionally, fetch summary from Wikipedia
      const wikiTitle = name.replace(/ /g, "_");
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}`
      );
      const data = await res.json();
      summary = data.extract || "A beautiful bird.";
    } catch {
      summary = "A beautiful bird.";
    }
    // Assign rarity
    if (name.includes("Phoenix")) rarity = "Legendary";
    else if (name.includes("Tanager") || name.includes("Oriole"))
      rarity = "Rare";
    else if (name.includes("Woodpecker") || name.includes("Blackbird"))
      rarity = "Uncommon";
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

// Birdemon: The Ultimate Bird Battler
// All logic in one file for demo. No backend required.

// --- Data ---
const BIRDEMON_TYPES = [
  "Flying",
  "Electric",
  "Grass",
  "Fire",
  "Water",
  "Normal",
  "Dark",
  "Fairy",
  "Legendary",
];
const TYPE_WEAKNESS = {
  Flying: ["Electric"],
  Electric: ["Grass"],
  Grass: ["Fire"],
  Fire: ["Water"],
  Water: ["Electric"],
  Normal: ["Dark"],
  Dark: ["Fairy"],
  Fairy: ["Dark"],
  Legendary: [],
};
const BIRDEMON_POOL = [
  { name: "Cardinowl", type: "Flying", base: 50 },
  { name: "Sparkrill", type: "Electric", base: 48 },
  { name: "Leafowl", type: "Grass", base: 46 },
  { name: "Pyreagle", type: "Fire", base: 52 },
  { name: "Aqualoon", type: "Water", base: 47 },
  { name: "Dovetail", type: "Normal", base: 44 },
  { name: "Noctowl", type: "Dark", base: 53 },
  { name: "Pixieparrot", type: "Fairy", base: 45 },
  { name: "Zeuswren", type: "Legendary", base: 60 },
];

// --- State ---
let coins = 0;
let team = [];
let discovered = [];
let lastRewardDay = "";

// --- Utility ---
function $(id) {
  return document.getElementById(id);
}
function save() {
  localStorage.setItem("birdemon_coins", coins);
  localStorage.setItem("birdemon_energy", energy);
  localStorage.setItem("birdemon_streak", streak);
  localStorage.setItem("birdemon_team", JSON.stringify(team));
  localStorage.setItem("birdemon_discovered", JSON.stringify(discovered));
  localStorage.setItem("birdemon_lastRewardDay", lastRewardDay);
}
function load() {
  coins = parseInt(localStorage.getItem("birdemon_coins")) || 0;
  energy = parseInt(localStorage.getItem("birdemon_energy")) || 10;
  streak = parseInt(localStorage.getItem("birdemon_streak")) || 0;
  team = JSON.parse(localStorage.getItem("birdemon_team") || "[]");
  discovered = JSON.parse(localStorage.getItem("birdemon_discovered") || "[]");
  lastRewardDay = localStorage.getItem("birdemon_lastRewardDay") || "";
}
function updateStats() {
  $("coins").textContent = `🪙 ${coins}`;
  $("energy").textContent = `⚡ ${energy}`;
  $("streak").textContent = `🔥 ${streak}`;
}

// --- Birdemon Generation ---
function randomBirdemon() {
  const b = BIRDEMON_POOL[Math.floor(Math.random() * BIRDEMON_POOL.length)];
  // Generate stats
  const level = 1;
  const hp = b.base + Math.floor(Math.random() * 10);
  const atk = b.base + Math.floor(Math.random() * 8);
  const def = b.base + Math.floor(Math.random() * 6);
  const xp = 0;
  const id = `${b.name}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  return {
    id,
    name: b.name,
    type: b.type,
    level,
    hp,
    atk,
    def,
    xp,
    img: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
      b.name
    )}&backgroundColor=ffd700,00b894`,
  };
}

// --- UI Rendering ---
function renderBirdemonCard(b, showStats = true) {
  return `<div class='birdemon-card'>
    <img src='${b.img}' alt='${b.name}'>
    <div><b>${b.name}</b></div>
    <span class='birdemon-type ${b.type}'>${b.type}</span>
    ${
      showStats
        ? `<div class='birdemon-stats'>Lv.${b.level} | HP:${b.hp} | ATK:${b.atk} | DEF:${b.def}</div>`
        : ""
    }
  </div>`;
}
function renderTeam() {
  $("team").innerHTML = team.map((b) => renderBirdemonCard(b)).join("");
}
function renderDiscovered() {
  // Not shown in UI, but could be used for a Pokedex
}
function showBirdemon(b) {
  $("birdemonCard").innerHTML = renderBirdemonCard(b);
  $("birdemon-section").style.display = "block";
}
function hideBirdemon() {
  $("birdemon-section").style.display = "none";
}
function showBattle(result, yourB, wildB) {
  $("battle").innerHTML = `
    <div style='display:flex;gap:1em;justify-content:center;'>
      <div>${renderBirdemonCard(yourB)}</div>
      <div style='align-self:center;font-size:2em;'>⚔️</div>
      <div>${renderBirdemonCard(wildB)}</div>
    </div>
    <div style='text-align:center;font-size:1.2em;margin-top:0.5em;'>${result}</div>
  `;
}

// --- Game Logic ---
let currentWild = null;
$("recordBtn").onclick = () => {
  if (energy <= 0) {
    alert("Out of energy!");
    return;
  }
  energy--;
  updateStats();
  const b = randomBirdemon();
  currentWild = b;
  showBirdemon(b);
};
$("addToTeamBtn").onclick = () => {
  if (!currentWild) return;
  if (team.length >= 6) {
    alert("Team full! Remove a Birdemon first.");
    return;
  }
  team.push(currentWild);
  discovered.push(currentWild);
  coins += 5;
  updateStats();
  renderTeam();
  hideBirdemon();
  save();
};
function pickRandomTeamBird() {
  if (team.length === 0) return null;
  return team[Math.floor(Math.random() * team.length)];
}
$("findBattleBtn").onclick = () => {
  if (team.length === 0) {
    alert("No Birdemon in your team!");
    return;
  }
  if (energy <= 0) {
    alert("Out of energy!");
    return;
  }
  energy--;
  updateStats();
  const yourB = pickRandomTeamBird();
  const wildB = randomBirdemon();
  // Battle logic
  let yourPower = yourB.atk + yourB.def + Math.random() * 10;
  let wildPower = wildB.atk + wildB.def + Math.random() * 10;
  // Type advantage
  if (
    TYPE_WEAKNESS[wildB.type] &&
    TYPE_WEAKNESS[wildB.type].includes(yourB.type)
  )
    wildPower *= 1.2;
  if (
    TYPE_WEAKNESS[yourB.type] &&
    TYPE_WEAKNESS[yourB.type].includes(wildB.type)
  )
    yourPower *= 1.2;
  let result;
  if (yourPower > wildPower) {
    result = "You Win! +10🪙 +10XP";
    coins += 10;
    yourB.xp += 10;
    if (yourB.xp >= 30) {
      yourB.level++;
      yourB.xp = 0;
      yourB.hp += 5;
      yourB.atk += 2;
      yourB.def += 2;
      result += " Birdemon leveled up!";
    }
  } else {
    result = "You Lose! +2XP";
    yourB.xp += 2;
  }
  updateStats();
  renderTeam();
  showBattle(result, yourB, wildB);
  save();
};
$("buyEnergy").onclick = () => {
  if (coins < 10) {
    alert("Not enough coins!");
    return;
  }
  coins -= 10;
  energy += 5;
  updateStats();
  save();
};
$("buyEgg").onclick = () => {
  if (coins < 50) {
    alert("Not enough coins!");
    return;
  }
  coins -= 50;
  // Add a random legendary
  const leg = BIRDEMON_POOL.find((b) => b.type === "Legendary");
  const b = {
    ...leg,
    id: `egg-${Date.now()}`,
    level: 1,
    hp: leg.base + 10,
    atk: leg.base + 8,
    def: leg.base + 6,
    xp: 0,
    img: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
      leg.name
    )}&backgroundColor=ffd700,00b894`,
  };
  team.push(b);
  discovered.push(b);
  updateStats();
  renderTeam();
  save();
  alert("You hatched a Legendary Birdemon!");
};
$("claimRewardBtn").onclick = () => {
  const today = new Date().toDateString();
  if (lastRewardDay === today) {
    $("rewardStatus").textContent = "Already claimed today!";
    return;
  }
  coins += 15;
  energy += 3;
  streak++;
  lastRewardDay = today;
  updateStats();
  save();
  $("rewardStatus").textContent = "Reward claimed! +15🪙 +3⚡";
};
// --- Init ---
window.onload = function () {
  load();
  updateStats();
  renderTeam();
  hideBirdemon();
  $("battle").innerHTML = "";
  $("rewardStatus").textContent = "";
};
