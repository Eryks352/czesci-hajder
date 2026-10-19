/* ============================================================
   app.js — logika strony
   ------------------------------------------------------------
   Strona działa jako jedna aplikacja: zamiast przechodzić między
   plikami HTML, podmieniamy zawartość <main id="app">.

   Zawartość:
     1. Stan aplikacji
     2. Nawigacja i renderowanie
     3. Filtrowanie sklepu
     4. Koszyk i nakładki
     5. Obsługa zdarzeń (kliknięcia, zmiany, wpisywanie, formularze)
     6. Start
   ============================================================ */

"use strict";


/* ---------- 1. Stan aplikacji ---------- */

/** Domyślne ustawienia filtrów sklepu. */
function defaultFilters() {
  return {
    query: "",               // wyszukiwany tekst
    categories: new Set(),   // zaznaczone kategorie
    makes: new Set(),        // zaznaczone marki
    model: "",               // wybrany model
    grades: new Set(),       // klasy stanu A / B / C
    maxPrice: "",            // cena maksymalna
    sort: "new",             // "new" | "asc" | "desc"
  };
}

const state = {
  view: "home",              // aktualny widok
  finderTab: "vin",          // zakładka wyszukiwarki na stronie głównej
  vin: "",                   // ostatnio sprawdzany numer VIN
  cart: [],                  // kody części w koszyku
  orderNumber: null,         // numer złożonego zamówienia
  filters: defaultFilters(),
};

/** Widoki dostępne w menu i funkcje, które je budują. */
const VIEWS = {
  home: () => homeView(state),
  shop: () => shopView(state, filterParts()),
  vin: () => vinView(state),
  kasacja: () => scrapView(),
  kontakt: () => contactView(),
  checkout: () => checkoutView(state),
};

/** Skrót do querySelector. */
const $ = (selector) => document.querySelector(selector);


/* ---------- 2. Nawigacja i renderowanie ---------- */

/** Rysuje aktualny widok i odświeża nagłówek. */
function render() {
  const buildView = VIEWS[state.view] || VIEWS.home;
  $("#app").innerHTML = buildView();

  // Podświetlenie aktywnej pozycji menu
  document.querySelectorAll(".main-nav button").forEach((button) => {
    if (button.dataset.go === state.view) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  $("#cartCount").textContent = state.cart.length;
}

/**
 * Przechodzi do widoku, przewija na górę i zamyka menu mobilne.
 * @param {string} view klucz z VIEWS
 */
function goTo(view) {
  state.view = view;
  closeOverlay();
  render();
  window.scrollTo({ top: 0 });

  $("#mainNav").classList.remove("is-open");
  $("#menuToggle").setAttribute("aria-expanded", "false");

  // Zapamiętanie widoku w adresie (np. index.html#shop)
  try {
    history.replaceState(null, "", "#" + view);
  } catch (error) {
    /* przy otwieraniu z dysku niektóre przeglądarki tego nie pozwalają */
  }
}

/**
 * Po ponownym narysowaniu widoku przywraca kursor w polu tekstowym,
 * żeby można było pisać dalej bez klikania.
 */
function refocus(selector, caretPosition) {
  const field = $(selector);
  if (!field) return;
  field.focus();
  const position = caretPosition ?? field.value.length;
  field.setSelectionRange(position, position);
}


/* ---------- 3. Filtrowanie sklepu ---------- */

/** Zwraca części spełniające aktualne filtry, posortowane. */
function filterParts() {
  const filters = state.filters;
  const query = filters.query.trim().toLowerCase();

  const matches = PARTS.filter((part) => {
    if (filters.categories.size && !filters.categories.has(part.category)) return false;
    if (filters.makes.size && !filters.makes.has(part.donor.make)) return false;
    if (filters.model && part.donor.model !== filters.model) return false;
    if (filters.grades.size && !filters.grades.has(part.grade)) return false;
    if (filters.maxPrice && part.price > Number(filters.maxPrice)) return false;

    if (query) {
      // Szukamy w nazwie, numerze OE, kodzie, marce, modelu i kodzie silnika
      const haystack = [
        part.name, part.oe, part.code,
        part.donor.make, part.donor.model, part.donor.engine,
      ].join(" ").toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });

  if (filters.sort === "asc") return matches.sort((a, b) => a.price - b.price);
  if (filters.sort === "desc") return matches.sort((a, b) => b.price - a.price);
  return matches.reverse(); // „Najnowsze” — ostatnio dodane na górze
}

/** Przełącza wartość w zbiorze (zaznacz / odznacz checkbox). */
function toggleInSet(set, value, isOn) {
  if (isOn) {
    set.add(value);
  } else {
    set.delete(value);
  }
}


/* ---------- 4. Koszyk i nakładki ---------- */

/** Pokazuje krótki komunikat na dole ekranu. */
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  $("#toastHost").replaceChildren(toast);

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.remove(), 2600);
}

/** Dodaje część do koszyka (każda część jest w jednym egzemplarzu). */
function addToCart(code) {
  if (state.cart.includes(code)) {
    showToast("Ta część jest już w koszyku – mamy ją w jednym egzemplarzu.");
    return;
  }
  state.cart.push(code);
  const part = PARTS.find((item) => item.code === code);
  showToast("Dodano do koszyka: " + part.name);
}

function removeFromCart(code) {
  state.cart = state.cart.filter((item) => item !== code);
}

function openCart() {
  $("#overlay").innerHTML = cartDrawer(state);
}

function openPart(code) {
  const part = PARTS.find((item) => item.code === code);
  $("#overlay").innerHTML = partModal(part, state.cart.includes(code));
}

function closeOverlay() {
  $("#overlay").innerHTML = "";
}

/** Kopiuje tekst do schowka; jeśli się nie da, pokazuje go na przycisku. */
function copyToClipboard(button, text) {
  const showText = () => { button.textContent = text; };
  try {
    navigator.clipboard.writeText(text).then(
      () => { button.textContent = "Skopiowano"; },
      showText
    );
  } catch (error) {
    showText();
  }
}


/* ---------- 5. Obsługa zdarzeń ---------- */

/* 5a. Kliknięcia — jedna obsługa dla całej strony (delegacja zdarzeń) */
document.addEventListener("click", (event) => {
  // Kliknięcie w przyciemnione tło zamyka nakładkę
  if (event.target.matches(".scrim")) {
    closeOverlay();
    return;
  }

  // Reagujemy na przyciski, linki i tytuły kart (mają data-open)
  const target = event.target.closest("button, a, [data-open]");
  if (!target) return;
  const data = target.dataset;

  // Przejście do widoku
  if (data.go) {
    goTo(data.go);
    return;
  }

  // Kafelek kategorii → sklep z tą kategorią
  if (data.cat) {
    state.filters = defaultFilters();
    state.filters.categories.add(data.cat);
    goTo("shop");
    return;
  }

  // Karta auta-dawcy → sklep z częściami z tego auta
  if (data.donor) {
    const donor = DONORS.find((item) => item.id === data.donor);
    state.filters = defaultFilters();
    state.filters.makes.add(donor.make);
    state.filters.model = donor.model;
    goTo("shop");
    return;
  }

  // Zakładki wyszukiwarki na stronie głównej
  if (data.tab) {
    state.finderTab = data.tab;
    $("#finderHost").innerHTML = finderBox(state.finderTab, state.vin);
    return;
  }

  // Przykładowy VIN
  if (data.exampleVin) {
    state.vin = data.exampleVin;
    goTo("vin");
    return;
  }

  // Dodanie do koszyka (z karty lub z okna szczegółów)
  if (data.add) {
    addToCart(data.add);
    render();
    if ("keepOpen" in data) openPart(data.add);
    return;
  }

  // Szczegóły części
  if (data.open) {
    openPart(data.open);
    return;
  }

  // Zamknięcie nakładki
  if ("close" in data) {
    closeOverlay();
    return;
  }

  // Usunięcie z koszyka
  if (data.remove) {
    removeFromCart(data.remove);
    render();
    openCart();
    return;
  }

  // Przejście do zamówienia
  if ("checkout" in data) {
    state.orderNumber = null;
    goTo("checkout");
    return;
  }

  // Wyczyszczenie filtrów
  if ("resetFilters" in data) {
    state.filters = defaultFilters();
    render();
    return;
  }

  // Usunięcie pojedynczego filtra (chip)
  if (data.removeFilter) {
    const filters = state.filters;
    const value = data.value;
    switch (data.removeFilter) {
      case "category": filters.categories.delete(value); break;
      case "make":     filters.makes.delete(value); filters.model = ""; break;
      case "model":    filters.model = ""; break;
      case "grade":    filters.grades.delete(value); break;
      case "query":    filters.query = ""; break;
    }
    render();
    return;
  }

  // Kopiowanie numeru telefonu
  if (data.copy) {
    copyToClipboard(target, data.copy);
  }
});

/* Przycisk koszyka i menu mobilne */
$("#cartBtn").addEventListener("click", openCart);

$("#menuToggle").addEventListener("click", (event) => {
  const nav = $("#mainNav");
  nav.classList.toggle("is-open");
  event.currentTarget.setAttribute("aria-expanded", nav.classList.contains("is-open"));
});

/* Klawisz Esc zamyka koszyk i okno szczegółów */
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeOverlay();
});


/* 5b. Zmiany w polach wyboru (checkboxy, listy, opcje dostawy) */
document.addEventListener("change", (event) => {
  const field = event.target;
  const filters = state.filters;

  if (field.dataset.filterCategory) {
    toggleInSet(filters.categories, field.dataset.filterCategory, field.checked);
    render();
  } else if (field.dataset.filterMake) {
    toggleInSet(filters.makes, field.dataset.filterMake, field.checked);
    filters.model = "";
    render();
  } else if (field.dataset.filterGrade) {
    toggleInSet(filters.grades, field.dataset.filterGrade, field.checked);
    render();
  } else if (field.id === "filterModel") {
    filters.model = field.value;
    render();
  } else if (field.id === "filterSort") {
    filters.sort = field.value;
    render();
  } else if (field.id === "homeMake") {
    // Wybór marki na stronie głównej uzupełnia listę modeli
    const modelSelect = $("#homeModel");
    const models = [...new Set(
      DONORS.filter((donor) => donor.make === field.value).map((donor) => donor.model)
    )];
    modelSelect.disabled = !field.value;
    modelSelect.innerHTML = field.value
      ? `<option value="">Wszystkie modele</option>` + models.map((model) => `<option>${model}</option>`).join("")
      : `<option value="">Najpierw marka</option>`;
  } else if (field.name === "shipping") {
    // Zmiana sposobu dostawy przelicza sumę
    const shippingCost = Number(field.value);
    const totalEl = $("#orderTotal");
    const subtotal = Number(totalEl.dataset.subtotal);
    $("#shippingCost").textContent = formatPrice(shippingCost);
    totalEl.textContent = formatPrice(subtotal + shippingCost);
  }
});


/* 5c. Wpisywanie tekstu (z opóźnieniem, żeby nie rysować przy każdej literze) */
let typingTimer;

document.addEventListener("input", (event) => {
  const field = event.target;

  // Licznik znaków pod polem VIN
  if (field.id === "vinHome") {
    $("#vinCountHome").innerHTML = vinCounter(cleanVin(field.value));
  }

  // Wyszukiwanie w sklepie
  if (field.id === "filterQuery") {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      const caret = field.selectionStart;
      state.filters.query = field.value;
      render();
      refocus("#filterQuery", caret);
    }, 250);
  }

  // Cena maksymalna
  if (field.id === "filterMaxPrice") {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      state.filters.maxPrice = field.value.replace(/\D/g, "");
      render();
      refocus("#filterMaxPrice");
    }, 400);
  }
});


/* 5d. Formularze
   W projekcie formularze niczego nie wysyłają — pokazują tylko potwierdzenie.
   W gotowej stronie w tym miejscu będzie wysyłka do serwera. */
document.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;

  switch (form.id) {
    // Wyszukiwarka VIN na stronie głównej
    case "homeVinForm":
      state.vin = cleanVin($("#vinHome").value);
      goTo("vin");
      break;

    // Wyszukiwarka VIN na podstronie
    case "vinForm":
      state.vin = cleanVin($("#vinMain").value);
      render();
      break;

    // Wyszukiwarka po marce i modelu
    case "homeCarForm": {
      const make = $("#homeMake").value;
      const category = $("#homeCategory").value;
      state.filters = defaultFilters();
      if (make) state.filters.makes.add(make);
      if (category) state.filters.categories.add(category);
      state.filters.model = $("#homeModel").value;
      goTo("shop");
      break;
    }

    // Zapytanie o część
    case "askForm":
      $("#askResult").innerHTML = `
        <div class="notice">
          Zapytanie przyjęte. W gotowej stronie trafi do skrzynki sklepu razem z numerem VIN
          <span class="mono">${escapeHtml(state.vin)}</span>.
        </div>`;
      form.reset();
      break;

    // Wycena kasacji
    case "scrapForm":
      $("#scrapResult").innerHTML = `
        <div class="notice">
          Prośba o wycenę przyjęta. W gotowej stronie trafi do działu kasacji, który oddzwoni z ceną.
        </div>`;
      break;

    // Zamówienie
    case "checkoutForm":
      state.orderNumber = `HJ/${new Date().getFullYear()}/${1000 + Math.floor(Math.random() * 9000)}`;
      state.cart = [];
      render();
      window.scrollTo({ top: 0 });
      break;
  }
});


/* ---------- 6. Start ---------- */

// Otwarcie od razu konkretnego widoku, np. index.html#vin
const startView = location.hash.slice(1);
if (["shop", "vin", "kasacja", "kontakt"].includes(startView)) {
  state.view = startView;
}

render();
