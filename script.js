// ------------------------------
// BURGER
// ------------------------------
const burger = document.querySelector(".burger-btn");
const nav = document.querySelector(".main-nav");
const navLinks = document.querySelectorAll(".main-nav a");

burger.addEventListener("click", (e) => {
  e.stopPropagation();
  nav.classList.toggle("active");
});

nav.addEventListener("click", (e) => {
  if (e.target === nav) {
    nav.classList.remove("active");
  }
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("active");
  });
});

// ------------------------------
// ELEMENTE AUSWÄHLEN UND DRAG & DROP
// ------------------------------
const items = document.querySelectorAll(".item");
const hoverInfo = document.getElementById("hover-info");
const hoverTitle = document.getElementById("hover-title");
const hoverDesc = document.getElementById("hover-desc");
const hoverPrice = document.getElementById("hover-price");
const hoverImage = document.getElementById("hover-image");
const summaryList = document.getElementById("summary-list");
const deineBox = document.getElementById("deine-box"); // Container für Drag & Drop
const totalEl = document.getElementById("total-price");
const orderBtn = document.getElementById("order-btn");
const resetBtn = document.getElementById("reset-btn");

const categories = ["brot", "sweet", "protein", "drink"];
const selected = {};
let confirmationActive = false; // true, wenn die Bestätigung angezeigt wird

// ------------------------------
// CATEGORY CARD TOGGLE
// ------------------------------
const categoryCards = document.querySelectorAll(".category-card");
const toggleArrows = document.querySelectorAll(".toggle-arrow");

toggleArrows.forEach((arrow) => {
  arrow.addEventListener("click", (e) => {
    e.stopPropagation();
    const card = arrow.closest(".category-card");
    const isActive = card.classList.contains("active");

    categoryCards.forEach((c) => c.classList.remove("active"));

    if (!isActive) card.classList.add("active");
  });
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".category-card")) {
    categoryCards.forEach((c) => c.classList.remove("active"));
  }
});

// ------------------------------
// HOVER ANZEIGEN
// ------------------------------
function showHover(item) {
  hoverTitle.textContent = item.textContent;
  hoverDesc.textContent = item.dataset.desc;
  hoverPrice.textContent = parseFloat(item.dataset.price).toFixed(2) + " €";
  hoverImage.src = item.dataset.image;
  hoverImage.style.display = "block";
  hoverInfo.classList.add("active");
}

// ------------------------------
// ITEM AUSWÄHLEN (NORMAL + DRAG & DROP)
// ------------------------------
function selectItem(item) {
  let cat = item.dataset.category;

  // Brot & Gebäck exklusiv
  if (cat === "brot" || cat === "gebäck") {
    document.querySelectorAll(
      `.item[data-category="brot"], .item[data-category="gebäck"]`
    ).forEach((i) => i.classList.remove("active"));

    delete selected["brot"];
    delete selected["gebäck"];

    cat = item.dataset.category; // echte Kategorie behalten für Emoji
  }

  // Andere Items derselben Kategorie deaktivieren
  document.querySelectorAll(`.item[data-category="${cat}"]`).forEach((i) => {
    i.classList.remove("active");
  });

  item.classList.add("active");

  selected[cat] = {
    name: item.textContent,
    price: parseFloat(item.dataset.price),
  };

  updateSummary();
}

// ------------------------------
// EVENTS FÜR ITEMS (HOVER + CLICK + DRAG)
// ------------------------------
items.forEach((item) => {
  item.setAttribute("draggable", true);

  // Hover anzeigen
  item.addEventListener("mouseenter", () => {
    if (!confirmationActive) showHover(item);
  });
  item.addEventListener("mouseleave", () => {
    if (!confirmationActive) hoverInfo.classList.remove("active");
  });

  // Click
  item.addEventListener("click", () => {
    if (!confirmationActive) {
      showHover(item);
      selectItem(item);
    }
  });

  // Drag starten
  item.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        name: item.textContent,
        category: item.dataset.category,
        price: item.dataset.price,
      })
    );
  });
});

// ------------------------------
// DEINE BOX DRAG & DROP
// ------------------------------
deineBox.addEventListener("dragover", (e) => {
  e.preventDefault(); // notwendig für Drop
  deineBox.classList.add("dragover");
});

deineBox.addEventListener("dragleave", () => {
  deineBox.classList.remove("dragover");
});

deineBox.addEventListener("drop", (e) => {
  e.preventDefault();
  deineBox.classList.remove("dragover");

  const data = JSON.parse(e.dataTransfer.getData("text/plain"));

  // Brot & Gebäck exklusiv
  if (data.category === "brot" || data.category === "gebäck") {
    ["brot", "gebäck"].forEach((cat) => delete selected[cat]);
  }

  selected[data.category] = {
    name: data.name,
    price: parseFloat(data.price),
  };

  updateSummary();
});

// ------------------------------
// ZUSAMMENFASSUNG UND GESAMTPREIS
// ------------------------------
function updateSummary() {
  summaryList.innerHTML = "";

  // ------------------------------
  // Gesamtpreis berechnen
  // ------------------------------
  const selectedItems = Object.values(selected);
  let total = 0;

  // Wenn genau 1 Produkt pro Gruppe ausgewählt → fester Preis 8,50 €
  const groups = [
    ["gemüse", "obst", "beeren"],       // Rohkost
    ["brot", "gebäck"],                  // Brot & Gebäck
    ["wurst", "aufstrich", "süße"],     // Brotbelag / Aufstrich
    ["joghurt", "quetschbeutel", "snacks"] // Joghurt & Snacks
  ];

  const isExactCombo = groups.every(group =>
    group.filter(cat => selected[cat]).length === 1
  );

  if (isExactCombo) {
    total = 8.50;
  } else {
    total = selectedItems.reduce((sum, p) => sum + p.price, 0);
  }


  // ------------------------------
  // Zusammenfassungsliste anzeigen
  Object.entries(selected).forEach(([cat, p]) => {
    const li = document.createElement("li");

    // Emoji pro Kategorie
    let emoji = "";
    if (cat === "gemüse") emoji = "🥕";
    else if (cat === "obst") emoji = "🍎";
    else if (cat === "beeren") emoji = "🍓";
    else if (cat === "brot") emoji = "🥖";
    else if (cat === "gebäck") emoji = "🥐";
    else if (cat === "wurst") emoji = "🍗";
    else if (cat === "aufstrich") emoji = "🧈";
    else if (cat === "süße") emoji = "🍯";
    else if (cat === "joghurt") emoji = "🥤";
    else if (cat === "quetschbeutel") emoji = "🧃";
    else if (cat === "snacks") emoji = "🍪";

    li.textContent = `${emoji} ${p.name} `;

    const removeBtn = document.createElement("span");
    removeBtn.textContent = "❌";
    removeBtn.classList.add("remove-item");
    removeBtn.style.cursor = "pointer";
    removeBtn.style.marginLeft = "0.5rem";
    removeBtn.addEventListener("click", () => {
      delete selected[cat];
      updateSummary();
    });

    li.appendChild(removeBtn);
    summaryList.appendChild(li);
  });


  // ------------------------------
  // Gesamtpreis anzeigen
  // ------------------------------
  totalEl.textContent = total.toFixed(2).replace(".", ",") + " €";

  // ------------------------------
  // Bestell-Button aktivieren/deaktivieren
  // nur aktiv, wenn jede Gruppe mindestens 1 Produkt ausgewählt ist
  // ------------------------------
  const isValid = groups.every(group =>
    group.some(cat => selected[cat])
  );

  orderBtn.disabled = !isValid;
}
// ------------------------------
// BESTELLUNG DURCHFÜHREN
// ------------------------------
// ------------------------------
// BESTELLUNG DURCHFÜHREN
// ------------------------------
orderBtn.addEventListener("click", () => {


  const groups = [
    ["gemüse", "obst", "beeren"],
    ["brot", "gebäck"],
    ["wurst", "aufstrich", "süße"],
    ["joghurt", "quetschbeutel", "snacks"]
  ];

  const isValid = groups.every(group =>
    group.some(cat => selected[cat])
  );


  if (!isValid) {
    hoverTitle.textContent = "⚠️ Auswahl unvollständig";
    hoverDesc.innerHTML = `
      <p>Bitte wählen Sie <strong>1 Produkt aus jeder Kategorie</strong>, um Ihre Frühstücksbox zu bestellen.</p>
      <span id="close-warning" style="display:inline-block; margin-top:1rem; cursor:pointer; color:red; border:1px solid red; padding:0.4rem 0.9rem; border-radius:999px; font-size:1rem;">
        Schließen
      </span>
    `;
    hoverPrice.textContent = "";
    hoverImage.style.display = "none";
    hoverInfo.classList.add("active");

    document.getElementById("close-warning").addEventListener("click", () => {
      hoverInfo.classList.remove("active");
    });

    return; 
  }

  confirmationActive = true;

  orderBtn.disabled = true;
  resetBtn.disabled = true;
  orderBtn.style.opacity = 0.5;
  resetBtn.style.opacity = 0.5;
  orderBtn.style.cursor = "not-allowed";
  resetBtn.style.cursor = "not-allowed";

  hoverTitle.textContent = "🧾 Bestellung bestätigen";
  hoverDesc.innerHTML = `
    <p>Möchtest du deine Frühstücksbox jetzt bestellen?</p>
    <div style="display:flex; gap:0.6rem; margin-top:1rem;">
      <button id="confirm-order" style="flex:1; background:green; color:white; padding:0.6rem; border-radius:999px; border:none; font-weight:700;">
        ✅ Bestätigen
      </button>
      <button id="cancel-order" style="flex:1; background:transparent; border:2px solid red; color:red; padding:0.6rem; border-radius:999px; font-weight:700;">
        ❌ Abbrechen
      </button>
    </div>
  `;
  hoverPrice.textContent = "";
  hoverImage.style.display = "none";
  hoverInfo.classList.add("active");

  document.getElementById("cancel-order").addEventListener("click", () => {
    hoverInfo.classList.remove("active");
    confirmationActive = false;

    orderBtn.disabled = false;
    resetBtn.disabled = false;
    orderBtn.style.opacity = 1;
    resetBtn.style.opacity = 1;
    orderBtn.style.cursor = "pointer";
    resetBtn.style.cursor = "pointer";
  });

  document.getElementById("confirm-order").addEventListener("click", finalizeOrder);
});



// ------------------------------
// FINALISIERUNG DER BESTELLUNG
// ------------------------------
function finalizeOrder() {
  const code =
    String.fromCharCode((65 + Math.random() * 26) | 0) +
    ((1000 + Math.random() * 9000) | 0);

  // ------------------------------
  // Calculer le total comme dans updateSummary
  const groups = [
    ["gemüse", "obst", "beeren"],
    ["brot", "gebäck"],
    ["wurst", "aufstrich", "süße"],
    ["joghurt", "quetschbeutel", "snacks"]
  ];

  const selectedItems = Object.values(selected);

  const isExactCombo = groups.every(group =>
    group.filter(cat => selected[cat]).length === 1
  );

  let total;
  if (isExactCombo) {
    total = 8.50;
  } else {
    total = selectedItems.reduce((sum, p) => sum + p.price, 0);
  }

  total = total.toFixed(2).replace(".", ",");

  // ------------------------------
  hoverTitle.textContent = "Bestellung erfolgreich!";
  hoverDesc.innerHTML = `
    🎉 Dein Bestellcode lautet <br>
    <strong style="font-size:2.5rem; font-weight:bold; letter-spacing:0.2rem; text-transform:uppercase; padding:0 0.5rem 0.5rem 0;">${code}</strong>.<br>
    Gesamt : <strong style="font-size:1rem; font-weight:bold; color:var(--green-dark);">${total} €</strong><br>
    <strong>Zahlung bei Lieferung ! ✅</strong><br><br>
    <span id="close-msg" style="align-self:center; cursor:pointer; color:red; border:1px solid red; padding:0.4rem 0.9rem; border-radius:999px; font-size:1rem;">Schließen</span>
  `;
  hoverPrice.textContent = "";
  hoverImage.src = "img/box_code.png";
  hoverImage.style.display = "block";
  hoverInfo.classList.add("active");
  orderBtn.disabled = true;

  document.getElementById("close-msg").addEventListener("click", () => {
  hoverInfo.classList.remove("active");
  confirmationActive = false;

  resetBtn.disabled = false;
  orderBtn.disabled = false;

  orderBtn.style.opacity = 1;
  resetBtn.style.opacity = 1;
  orderBtn.style.cursor = "pointer";
  resetBtn.style.cursor = "pointer";

  updateSummary();
});

}


// ------------------------------
// RESET BUTTON
// ------------------------------
resetBtn.addEventListener("click", () => {
  Object.keys(selected).forEach((k) => delete selected[k]);
  items.forEach((i) => i.classList.remove("active"));
  summaryList.innerHTML = "";
  totalEl.textContent = "0,00 €";
  orderBtn.disabled = true;
  confirmationActive = false;
  hoverInfo.classList.remove("active");
});

// ------------------------------
// SUBKATEGORIEN TOGGLE (Brot & Gebäck)
// ------------------------------
const subcatBtns = document.querySelectorAll(".subcat-btn");

subcatBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const parentCard = btn.closest(".category-card");

    parentCard.querySelectorAll(".subcat-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const subcat = btn.dataset.subcat;
    parentCard.querySelectorAll(".items").forEach((itemsDiv) => {
      if (itemsDiv.classList.contains(subcat)) {
        itemsDiv.style.display = "flex";
      } else {
        itemsDiv.style.display = "none";
      }
    });
  });
});

// ------------------------------
// SCROLL TO TOP BUTTON
// ------------------------------
const scrollBtn = document.getElementById("scrollToTopBtn");


window.addEventListener("scroll", () => {
  if (window.scrollY > 300) { 
    scrollBtn.style.display = "flex";
  } else {
    scrollBtn.style.display = "none";
  }
});


scrollBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});
