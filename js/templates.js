/* ============================================================
   templates.js — szablony HTML
   ------------------------------------------------------------
   Każda funkcja zwraca gotowy fragment HTML jako tekst.
   Funkcje nie zmieniają stanu — dostają go jako parametr,
   a app.js wstawia wynik do strony.

   Zawartość:
     Pomocnicze:  escapeHtml, formatPrice
     Elementy:    gradeTag, partCard, donorCard, vinCounter, finderBox
     Widoki:      homeView, shopView, vinView, scrapView, contactView, checkoutView
     Nakładki:    cartDrawer, partModal
   ============================================================ */

"use strict";


/* ============================================================
   Pomocnicze
   ============================================================ */

/** Zabezpiecza tekst przed wstawieniem jako HTML. */
function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  }[char]));
}

/** 3400 → „3 400 zł” */
function formatPrice(value) {
  return value.toLocaleString("pl-PL") + " zł";
}

/** Ikony w pasku zalet (SVG wstawiane bezpośrednio). */
const PERK_ICONS = {
  shield: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M16 3l11 4v8c0 7-5 12-11 14C10 27 5 22 5 15V7z"/><path d="M11 16l4 4 7-8"/></svg>`,
  barcode: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 9V4h5M24 4h5v5M29 23v5h-5M8 28H3v-5M8 10v12M12 10v12M16 10v12M21 10v12M25 10v12"/></svg>`,
  truck: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M2 8h17v14H2zM19 13h6l5 5v4H19z"/><circle cx="8" cy="24" r="3"/><circle cx="24" cy="24" r="3"/></svg>`,
  invoice: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M7 3h12l6 6v20H7z"/><path d="M19 3v6h6M11 16h10M11 21h10"/></svg>`,
};


/* ============================================================
   Elementy wielokrotnego użytku
   ============================================================ */

/** Etykieta klasy stanu: „Klasa A”. */
function gradeTag(grade) {
  return `<span class="tag grade grade--${grade.toLowerCase()}" title="Stan: ${GRADES[grade]}">Klasa ${grade}</span>`;
}

/**
 * Karta części na liście.
 * @param {object}  part
 * @param {boolean} inCart czy część jest już w koszyku
 */
function partCard(part, inCart) {
  return `
    <article class="card">
      <button class="card__photo" data-open="${part.code}" aria-label="Szczegóły: ${escapeHtml(part.name)}">
        <img loading="lazy" src="${photoUrl(part.photoId, 480, 360)}" alt="${escapeHtml(part.name)} – zdjęcie przykładowe">
        ${gradeTag(part.grade)}
        <span class="photo-note">Zdjęcie przykładowe</span>
      </button>

      <div class="card__body">
        <span class="card__cat">${part.category} · <span class="mono">${part.code}</span></span>
        <h3 class="card__title" data-open="${part.code}">${escapeHtml(part.name)}</h3>
        <div class="card__fit">${part.donor.make} ${part.donor.model}, ${part.donor.version}, ${part.donor.year}</div>
        <div class="card__oe mono">OE ${part.oe}</div>
      </div>

      <div class="card__foot">
        <span class="price">${formatPrice(part.price)}<small>brutto</small></span>
        <button class="add ${inCart ? "is-in" : ""}" data-add="${part.code}">
          ${inCart ? "W koszyku" : "Do koszyka"}
        </button>
      </div>
    </article>`;
}

/** Lista kart części. */
function partGrid(parts, cart) {
  return `<div class="products">${parts.map((part) => partCard(part, cart.includes(part.code))).join("")}</div>`;
}

/**
 * Karta auta-dawcy (kliknięcie filtruje sklep po tym aucie).
 * @param {object}  donor
 * @param {boolean} isNew czy oznaczyć jako „Nowe na placu”
 */
function donorCard(donor, isNew) {
  const partsCount = PARTS.filter((part) => part.donorId === donor.id).length;

  return `
    <button class="donor" data-donor="${donor.id}">
      <div class="donor__top">
        <span class="mono">${donor.id}</span>
        ${isNew ? `<span class="donor__new">Nowe na placu</span>` : `<span>${donor.added}</span>`}
      </div>
      <h3>${donor.make} ${donor.model}</h3>
      <dl>
        <dt>Wersja</dt>   <dd>${donor.version}</dd>
        <dt>Silnik</dt>   <dd class="mono">${donor.engine}</dd>
        <dt>Rocznik</dt>  <dd>${donor.year}</dd>
        <dt>Przebieg</dt> <dd>${donor.mileage} km</dd>
        <dt>Lakier</dt>   <dd>${donor.color}</dd>
      </dl>
      <span class="donor__link">${partsCount} części w sklepie →</span>
    </button>`;
}

/** Licznik znaków pod polem VIN. */
function vinCounter(vin) {
  const hasForbidden = /[IOQ]/.test(vin);
  const message = hasForbidden
    ? `<b class="is-bad">Litery I, O, Q nie występują w VIN</b>`
    : "Pole E w dowodzie rejestracyjnym";

  return `
    <span>${message}</span>
    <span><b class="${vin.length > 17 ? "is-bad" : ""}">${vin.length}</b> / 17</span>`;
}

/**
 * Wyszukiwarka na stronie głównej z dwiema zakładkami.
 * @param {"vin"|"car"} activeTab
 * @param {string}      vin  ostatnio wpisany numer
 */
function finderBox(activeTab, vin) {
  const vinTab = `
    <form class="stack" id="homeVinForm">
      <div class="field">
        <label for="vinHome">Numer VIN</label>
        <input class="input vin-input" id="vinHome" maxlength="20" autocomplete="off" spellcheck="false"
               placeholder="WVWZZZ1KZ8W000000" value="${escapeHtml(vin)}">
        <div class="vin-count" id="vinCountHome">${vinCounter(vin)}</div>
      </div>
      <button class="btn btn--red" type="submit">Pokaż pasujące części</button>
      <div class="hint">
        Przykład:
        <button type="button" data-example-vin="WVWZZZ1KZ8W123456">VW Golf V 2008</button> ·
        <button type="button" data-example-vin="WAUZZZ8K9BA045821">Audi A4 B8 2011</button>
      </div>
    </form>`;

  const carTab = `
    <form class="stack" id="homeCarForm">
      <div class="grid-3">
        <div class="field">
          <label for="homeMake">Marka</label>
          <select class="input" id="homeMake">
            <option value="">Wybierz</option>
            ${MAKES.map((make) => `<option>${make}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="homeModel">Model</label>
          <select class="input" id="homeModel" disabled>
            <option value="">Najpierw marka</option>
          </select>
        </div>
        <div class="field">
          <label for="homeCategory">Część</label>
          <select class="input" id="homeCategory">
            <option value="">Wszystkie</option>
            ${CATEGORIES.map((category) => `<option>${category}</option>`).join("")}
          </select>
        </div>
      </div>
      <button class="btn btn--red" type="submit">Sprawdź dostępne</button>
    </form>`;

  return `
    <div class="finder">
      <div class="finder__tabs" role="tablist">
        <button role="tab" aria-selected="${activeTab === "vin"}" data-tab="vin">Po numerze VIN</button>
        <button role="tab" aria-selected="${activeTab === "car"}" data-tab="car">Po marce i modelu</button>
      </div>
      <div class="finder__body">
        ${activeTab === "vin" ? vinTab : carTab}
      </div>
    </div>`;
}

/** Baner ze zdjęciem na górze podstrony. */
function pageHero(photoId, eyebrow, title, text) {
  return `
    <section class="page-hero" style="background-image: url('${photoUrl(photoId, 1800, 600)}')">
      <div class="wrap">
        <span class="eyebrow">${eyebrow}</span>
        <h1>${title}</h1>
        ${text ? `<p>${text}</p>` : ""}
      </div>
    </section>`;
}


/* ============================================================
   Widok: strona główna
   ============================================================ */

function homeView(state) {
  const newestParts = PARTS.slice(-8).reverse();

  return `
    <!-- Hero z wyszukiwarką -->
    <section class="hero" style="background-image: url('${photoUrl(PHOTOS.engines, 1800, 900)}')">
      <div class="wrap">
        <div>
          <span class="eyebrow hero__eyebrow">Stacja demontażu pojazdów · Podkarpacie</span>
          <h1>Używane części <b>Hajder</b></h1>
          <p class="hero__lead">
            Części z aut rozbieranych na miejscu w Wólce Sokołowskiej. Każdą sprawdzamy,
            opisujemy numerem OE i wysyłamy kurierem w całej Polsce.
          </p>
          <div class="hero__actions">
            <button class="btn btn--white" data-go="shop">Przejdź do sklepu</button>
            <button class="btn btn--line-white" data-go="kontakt">Zadzwoń: 666 285 795</button>
          </div>
        </div>
        <div id="finderHost">${finderBox(state.finderTab, state.vin)}</div>
      </div>
    </section>

    <!-- Zalety -->
    <div class="perks">
      <div class="wrap">
        <div class="perk">${PERK_ICONS.shield}<span><b>14 dni gwarancji</b><span>rozruchowej na każdą część</span></span></div>
        <div class="perk">${PERK_ICONS.barcode}<span><b>Numery OE</b><span>przy każdej ofercie</span></span></div>
        <div class="perk">${PERK_ICONS.truck}<span><b>Wysyłka 24 h</b><span>kurier, paczkomat lub paleta</span></span></div>
        <div class="perk">${PERK_ICONS.invoice}<span><b>Faktura VAT</b><span>dla firm i warsztatów</span></span></div>
      </div>
    </div>

    <!-- Kategorie -->
    <section class="section">
      <div class="wrap">
        <div class="sec-head">
          <div><span class="eyebrow">Sklep z częściami</span><h2>Kategorie części</h2></div>
          <button class="more" data-go="shop">Cały sklep</button>
        </div>
        <div class="cats">
          ${CATEGORIES.map((category) => `
            <button class="cat" data-cat="${category}">
              <img loading="lazy" src="${photoUrl(CATEGORY_PHOTO[category], 560, 420)}" alt="">
              <span class="cat__label">
                <b>${category}</b>
                <small>${PARTS.filter((part) => part.category === category).length} ofert</small>
              </span>
            </button>`).join("")}
        </div>
      </div>
    </section>

    <!-- Nowe części -->
    <section class="section section--white">
      <div class="wrap">
        <div class="sec-head">
          <div><span class="eyebrow">Świeżo zdjęte z aut</span><h2>Nowe w sklepie</h2></div>
          <button class="more" data-go="shop">Zobacz wszystkie</button>
        </div>
        ${partGrid(newestParts, state.cart)}
      </div>
    </section>

    <!-- Jak sprawdzamy części -->
    <section class="section">
      <div class="wrap about">
        <img loading="lazy" src="${photoUrl(PHOTOS.mechanic, 900, 675)}" alt="Mechanik przy pracy – zdjęcie przykładowe">
        <div>
          <span class="eyebrow">Nasza praca od środka</span>
          <h2>Jak sprawdzamy części</h2>
          <ol class="steps">
            <li><b>01</b><div><h3>Przed demontażem</h3><p>Uruchamiamy auto, odczytujemy błędy, słuchamy silnika i skrzyni.</p></div></li>
            <li><b>02</b><div><h3>Demontaż</h3><p>Zdejmujemy części ręcznie, bez cięcia wiązek i przewodów.</p></div></li>
            <li><b>03</b><div><h3>Testy</h3><p>Alternatory, rozruszniki i wtryski sprawdzamy na stole probierczym.</p></div></li>
            <li><b>04</b><div><h3>Opis i magazyn</h3><p>Nadajemy kod, spisujemy numer OE i klasę stanu, odkładamy na regał.</p></div></li>
          </ol>
        </div>
      </div>
    </section>

    <!-- Auta do rozbiórki -->
    <section class="section section--white">
      <div class="wrap">
        <div class="sec-head">
          <div><span class="eyebrow">Ostatnio na placu</span><h2>Auta do rozbiórki</h2></div>
          <button class="more" data-go="shop">Wszystkie części</button>
        </div>
        <div class="donors">
          ${DONORS.slice(0, 4).map((donor, index) => donorCard(donor, index < 2)).join("")}
        </div>
      </div>
    </section>

    <!-- Kasacja -->
    <section class="band" style="background-image: url('${photoUrl(PHOTOS.yard, 1800, 700)}')">
      <div class="wrap">
        <div>
          <span class="eyebrow">Kasacja pojazdów Hajder</span>
          <h2>Masz auto do kasacji?</h2>
          <p>
            Odbieramy samochody osobowe, ciężarówki, autobusy i maszyny rolnicze z całego Podkarpacia.
            Zajmujemy się formalnościami i wystawiamy zaświadczenie o demontażu.
          </p>
        </div>
        <button class="btn btn--white" data-go="kasacja">Bezpłatna wycena</button>
      </div>
    </section>`;
}


/* ============================================================
   Widok: sklep
   ============================================================ */

/**
 * @param {object}   state
 * @param {object[]} results  części po filtrowaniu (z app.js)
 */
function shopView(state, results) {
  const filters = state.filters;

  // Modele dostępne dla zaznaczonych marek
  const models = [...new Set(
    DONORS
      .filter((donor) => filters.makes.size === 0 || filters.makes.has(donor.make))
      .map((donor) => donor.model)
  )];

  // Aktywne filtry jako chipsy [typ, etykieta]
  const chips = [
    ...[...filters.categories].map((value) => ["category", value]),
    ...[...filters.makes].map((value) => ["make", value]),
    ...(filters.model ? [["model", filters.model]] : []),
    ...[...filters.grades].map((value) => ["grade", value]),
    ...(filters.query ? [["query", filters.query]] : []),
  ];

  const chipLabel = (type, value) => {
    if (type === "grade") return `Klasa ${value}`;
    if (type === "query") return `„${value}”`;
    return value;
  };

  const checkbox = (attr, value, checked, label, count) => `
    <label class="chk">
      <input type="checkbox" ${attr}="${value}" ${checked ? "checked" : ""}>
      ${label}
      ${count !== undefined ? `<span class="n">${count}</span>` : ""}
    </label>`;

  return `
    ${pageHero(
      PHOTOS.enginePile,
      "Sklep internetowy",
      "Części używane",
      `${PARTS.length} sprawdzonych części z ${DONORS.length} aut. Szukasz czegoś konkretnego? Użyj wyszukiwarki VIN.`
    )}

    <section class="section">
      <div class="wrap">
        <div class="shop">

          <!-- Filtry -->
          <aside class="filters" aria-label="Filtry">
            <div class="filters__group">
              <h4>Kategoria</h4>
              ${CATEGORIES.map((category) => checkbox(
                "data-filter-category", category, filters.categories.has(category), category,
                PARTS.filter((part) => part.category === category).length
              )).join("")}
            </div>

            <div class="filters__group">
              <h4>Marka</h4>
              ${MAKES.map((make) => checkbox(
                "data-filter-make", make, filters.makes.has(make), make,
                PARTS.filter((part) => part.donor.make === make).length
              )).join("")}
            </div>

            <div class="field">
              <label for="filterModel">Model</label>
              <select class="input" id="filterModel">
                <option value="">Wszystkie</option>
                ${models.map((model) => `<option ${filters.model === model ? "selected" : ""}>${model}</option>`).join("")}
              </select>
            </div>

            <div class="filters__group">
              <h4>Stan</h4>
              ${Object.entries(GRADES).map(([grade, label]) => checkbox(
                "data-filter-grade", grade, filters.grades.has(grade), `${grade} – ${label}`
              )).join("")}
            </div>

            <div class="field">
              <label for="filterMaxPrice">Cena do (zł)</label>
              <input class="input" id="filterMaxPrice" inputmode="numeric" placeholder="np. 500"
                     value="${escapeHtml(filters.maxPrice)}">
            </div>

            <button class="btn btn--line" data-reset-filters>Wyczyść filtry</button>
          </aside>

          <!-- Lista części -->
          <div>
            <div class="toolbar">
              <input class="input search" id="filterQuery" aria-label="Szukaj w sklepie"
                     placeholder="Nazwa, numer OE, kod silnika…" value="${escapeHtml(filters.query)}">
              <select class="input" id="filterSort" aria-label="Sortowanie">
                <option value="new"  ${filters.sort === "new" ? "selected" : ""}>Najnowsze</option>
                <option value="asc"  ${filters.sort === "asc" ? "selected" : ""}>Cena rosnąco</option>
                <option value="desc" ${filters.sort === "desc" ? "selected" : ""}>Cena malejąco</option>
              </select>
            </div>

            ${chips.length > 0 ? `
              <div class="chips">
                ${chips.map(([type, value]) => `
                  <button class="chip" data-remove-filter="${type}" data-value="${escapeHtml(value)}">
                    ${escapeHtml(chipLabel(type, value))} ✕
                  </button>`).join("")}
              </div>` : ""}

            <p class="hint result-count">Znaleziono: ${results.length}</p>

            ${results.length > 0 ? partGrid(results, state.cart) : `
              <div class="empty">
                <h3>Brak części dla tych filtrów</h3>
                <p class="muted">Nie wszystko jest jeszcze w sklepie. Wyślij zapytanie z numerem VIN, a sprawdzimy magazyn i auta na placu.</p>
                <button class="btn btn--red" data-go="vin">Zapytaj o część</button>
              </div>`}
          </div>

        </div>
      </div>
    </section>`;
}


/* ============================================================
   Widok: wyszukiwarka VIN
   ============================================================ */

/** Wynik odczytu VIN: tabela + formularz zapytania + pasujące części. */
function vinResult(decoded, state) {
  const vin = decoded.vin;
  const match = findPartsForVin(decoded);

  // VIN rozbity na pojedyncze znaki z numerami pozycji
  const chars = [...vin].map((char, index) => {
    const cls = index < 3 ? "is-wmi" : index === 9 ? "is-year" : "";
    return `<span class="${cls}">${char}<small>${index + 1}</small></span>`;
  }).join("");

  const modelCell = decoded.modelCode
    ? (decoded.modelName
        ? `<b>${decoded.modelName}</b> <span class="mono muted">kod ${decoded.modelCode}</span>`
        : `<span class="mono">kod ${decoded.modelCode}</span> <span class="muted">– potwierdzimy telefonicznie</span>`)
    : `<span class="muted">Dokładny model potwierdzimy w katalogu producenta</span>`;

  const checkCell = decoded.checkOk
    ? `<span class="status status--ok">Zgodna (${decoded.checkDigit})</span>`
    : `<span class="status status--warn">Brak lub niezgodna</span> <span class="muted">– typowe w autach europejskich</span>`;

  const matchLabel = {
    model: "Dopasowanie po kodzie modelu",
    make: "Dopasowanie po marce i roczniku – sprawdź numer OE",
    none: "Wyniki",
  }[match.level];

  return `
    <div class="two-col">
      <!-- Odczyt numeru -->
      <div class="panel">
        <span class="eyebrow">Odczyt numeru VIN</span>
        <div class="vin-chars mono" aria-label="Znaki VIN">${chars}</div>
        <div class="kv">
          <div>Producent</div>      <div><b>${decoded.make || "Nieznany kod " + decoded.wmi}</b> <span class="mono muted">${decoded.wmi}</span></div>
          <div>Kraj produkcji</div> <div>${decoded.country || "—"}</div>
          <div>Rok modelowy</div>   <div>${decoded.year ? `<b>${decoded.year}</b> <span class="muted">(10. znak „${vin[9]}”)</span>` : "—"}</div>
          <div>Model</div>          <div>${modelCell}</div>
          <div>Cyfra kontrolna</div><div>${checkCell}</div>
          <div>Numer seryjny</div>  <div class="mono">${decoded.serial}</div>
        </div>
      </div>

      <!-- Zapytanie o część -->
      <div class="panel stack">
        <span class="eyebrow">Nie ma tego, czego szukasz?</span>
        <h3>Zapytaj o część z tym VIN</h3>
        <p class="panel__text">Sprawdzimy magazyn i auta czekające na demontaż. Odpowiadamy zwykle w ciągu godziny w dni robocze.</p>
        <form class="stack" id="askForm">
          <div class="field">
            <label for="askPart">Jakiej części szukasz?</label>
            <input class="input" id="askPart" required placeholder="np. lewy reflektor, ksenon">
          </div>
          <div class="two">
            <div class="field"><label for="askName">Imię</label><input class="input" id="askName" required></div>
            <div class="field"><label for="askPhone">Telefon</label><input class="input" id="askPhone" required inputmode="tel" placeholder="600 000 000"></div>
          </div>
          <button class="btn btn--red" type="submit">Wyślij zapytanie</button>
          <div id="askResult"></div>
        </form>
      </div>
    </div>

    <!-- Pasujące części -->
    <div class="vin-results">
      <div class="sec-head">
        <div>
          <span class="eyebrow">${matchLabel}</span>
          <h2>${match.list.length > 0 ? `Pasujące części: ${match.list.length}` : "Brak części na stanie"}</h2>
        </div>
      </div>
      ${match.list.length > 0 ? partGrid(match.list, state.cart) : `
        <div class="empty">
          <p class="muted">Na razie nie mamy w sklepie części do ${decoded.make || "tego auta"}.
          Wyślij zapytanie powyżej – codziennie przyjmujemy nowe auta do demontażu.</p>
        </div>`}
    </div>`;
}

/** Legenda pokazywana, zanim ktoś wpisze VIN. */
function vinLegend() {
  return `
    <div class="sec-head sec-head--center">
      <span class="eyebrow">Co oznaczają znaki</span>
      <h2>Budowa numeru VIN</h2>
    </div>
    <div class="vin-legend">
      <div><b>ZNAKI 1–3</b><h3>Producent</h3><p>Kod WMI, np. WVW to Volkswagen, TMB to Skoda.</p></div>
      <div><b>ZNAKI 4–8</b><h3>Opis pojazdu</h3><p>W autach grupy VW znaki 7–8 to kod modelu, np. 1K.</p></div>
      <div><b>ZNAK 9</b><h3>Cyfra kontrolna</h3><p>Obowiązkowa w USA, w Europie często jej brak.</p></div>
      <div><b>ZNAK 10</b><h3>Rok modelowy</h3><p>Np. 8 to 2008, B to 2011, R to 2024.</p></div>
      <div><b>ZNAKI 12–17</b><h3>Numer seryjny</h3><p>Indywidualny numer egzemplarza.</p></div>
    </div>`;
}

function vinView(state) {
  const vin = state.vin;
  let content = vinLegend();

  if (vin) {
    const decoded = decodeVin(vin);
    content = decoded.errors.length > 0
      ? `<div class="panel panel--error">
           <b>Ten numer VIN wymaga poprawki.</b>
           <ul class="clean">${decoded.errors.map((error) => `<li>${error}</li>`).join("")}</ul>
         </div>`
      : vinResult(decoded, state);
  }

  return `
    <section class="page-hero" style="background-image: url('${photoUrl(PHOTOS.engineBay, 1800, 600)}')">
      <div class="wrap">
        <span class="eyebrow">Wyszukiwarka VIN</span>
        <h1>Znajdź części do swojego auta</h1>
        <p>Wpisz numer VIN z pola E dowodu rejestracyjnego lub z tabliczki pod przednią szybą.
           Odczytamy producenta, rok modelowy i model, a potem pokażemy pasujące części.</p>

        <form class="vin-form" id="vinForm">
          <input class="input vin-input" id="vinMain" maxlength="20" autocomplete="off" spellcheck="false"
                 placeholder="WVWZZZ1KZ8W000000" value="${escapeHtml(vin)}" aria-label="Numer VIN">
          <button class="btn btn--red" type="submit">Sprawdź VIN</button>
        </form>

        <p class="hint vin-examples">
          Przykłady:
          <button type="button" data-example-vin="WVWZZZ1KZ8W123456">Golf V 2008</button> ·
          <button type="button" data-example-vin="TMBZZZ1Z77B012345">Octavia II 2007</button> ·
          <button type="button" data-example-vin="VF1BZ0B0H44551234">Renault</button>
        </p>
      </div>
    </section>

    <section class="section">
      <div class="wrap">${content}</div>
    </section>`;
}


/* ============================================================
   Widok: kasacja pojazdów
   ============================================================ */

function scrapView() {
  return `
    ${pageHero(
      PHOTOS.yard,
      "Stacja demontażu pojazdów",
      "Kasacja pojazdów",
      "Samochody osobowe, ciężarowe, autobusy i maszyny rolnicze. Odbieramy pojazd, zajmujemy się formalnościami i wystawiamy zaświadczenie o demontażu potrzebne do wyrejestrowania."
    )}

    <section class="section">
      <div class="wrap two-col">

        <!-- Formularz wyceny -->
        <div class="panel stack">
          <span class="eyebrow">Bezpłatna wycena</span>
          <h2>Wyceń auto do kasacji</h2>
          <form class="stack" id="scrapForm">
            <div class="two">
              <div class="field"><label for="scrapCar">Marka i model</label><input class="input" id="scrapCar" required placeholder="np. Opel Astra"></div>
              <div class="field"><label for="scrapYear">Rok produkcji</label><input class="input" id="scrapYear" inputmode="numeric" placeholder="2004"></div>
            </div>
            <div class="two">
              <div class="field">
                <label for="scrapType">Rodzaj pojazdu</label>
                <select class="input" id="scrapType">
                  <option>Samochód osobowy</option>
                  <option>Samochód ciężarowy / dostawczy</option>
                  <option>Autobus</option>
                  <option>Maszyna rolnicza</option>
                </select>
              </div>
              <div class="field">
                <label for="scrapCondition">Stan</label>
                <select class="input" id="scrapCondition">
                  <option>Na chodzie</option>
                  <option>Uszkodzony / nie odpala</option>
                  <option>Powypadkowy</option>
                  <option>Niekompletny</option>
                </select>
              </div>
            </div>
            <div class="two">
              <div class="field"><label for="scrapCity">Miejscowość odbioru</label><input class="input" id="scrapCity" required placeholder="np. Rzeszów"></div>
              <div class="field"><label for="scrapPhone">Telefon</label><input class="input" id="scrapPhone" required inputmode="tel"></div>
            </div>
            <button class="btn btn--red" type="submit">Poproś o wycenę</button>
            <div id="scrapResult"></div>
          </form>
        </div>

        <!-- Dokumenty i kontakt -->
        <div class="panel stack">
          <span class="eyebrow">Potrzebne dokumenty</span>
          <ul class="clean">
            <li>Dowód rejestracyjny</li>
            <li>Karta pojazdu, jeśli była wydana</li>
            <li>Dowód osobisty właściciela</li>
            <li>Tablice rejestracyjne</li>
          </ul>
          <span class="eyebrow">Telefon w sprawie kasacji</span>
          <div class="big-number">797 807 809</div>
          <p class="panel__text">Po demontażu auto trafia do naszego sklepu jako dawca części.</p>
        </div>

      </div>
    </section>`;
}


/* ============================================================
   Widok: kontakt
   ============================================================ */

function contactView() {
  const contactCard = (label, number, extra = "") => `
    <div class="contact-card">
      <span class="eyebrow">${label}</span>
      <div class="big-number">${number}</div>
      ${extra}
      <button class="copy" data-copy="${number}">Kopiuj numer</button>
    </div>`;

  return `
    ${pageHero(PHOTOS.engines, "Skontaktuj się", "Kontakt", "Zadzwoń, napisz albo przyjedź po część osobiście.")}

    <section class="section">
      <div class="wrap">
        <div class="contact-grid">
          ${contactCard("Sprzedaż części", "666 285 795")}
          ${contactCard("Kasacja pojazdów", "797 807 809")}
          ${contactCard("Biuro", "697 020 093", `<div>hajder@wp.pl</div>`)}
        </div>

        <div class="two-col contact-more">
          <div class="panel stack">
            <span class="eyebrow">Adres placu i magazynu</span>
            <h3>Wólka Sokołowska 237<br>36-050 Sokołów Małopolski</h3>
            <p class="panel__text">Powiat rzeszowski, woj. podkarpackie. Odbiór osobisty części po wcześniejszym telefonie.</p>
            <a class="btn btn--dark" style="align-self: flex-start" target="_blank" rel="noopener"
               href="https://www.google.com/maps/search/?api=1&query=W%C3%B3lka+Soko%C5%82owska+237">
              Otwórz w Mapach Google
            </a>
          </div>

          <div class="panel stack">
            <span class="eyebrow">Zasady sklepu</span>
            <ul class="clean">
              <li>14-dniowa gwarancja rozruchowa na wszystkie części.</li>
              <li>Zwrot w ciągu 14 dni przy zakupie na odległość.</li>
              <li>Silniki i skrzynie wysyłamy na palecie.</li>
              <li>Faktura VAT na życzenie.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>`;
}


/* ============================================================
   Widok: zamówienie
   ============================================================ */

function checkoutView(state) {
  // Po złożeniu zamówienia
  if (state.orderNumber) {
    return `
      <section class="section">
        <div class="wrap" style="max-width: 720px">
          <div class="panel stack">
            <span class="eyebrow">Zamówienie ${state.orderNumber}</span>
            <h2>Dziękujemy za zamówienie</h2>
            <div class="notice notice--demo">
              To jest projekt strony, więc zamówienie nie zostało nigdzie wysłane. W gotowym sklepie trafi
              do panelu zamówień, a klient dostanie e-mail z potwierdzeniem.
            </div>
            <button class="btn btn--red" style="align-self: flex-start" data-go="shop">Wróć do sklepu</button>
          </div>
        </div>
      </section>`;
  }

  const items = state.cart.map((code) => PARTS.find((part) => part.code === code));

  // Pusty koszyk
  if (items.length === 0) {
    return `
      <section class="section">
        <div class="wrap">
          <div class="empty">
            <h3>Koszyk jest pusty</h3>
            <p class="muted">Dodaj części ze sklepu albo wyszukaj je po numerze VIN.</p>
            <button class="btn btn--red" data-go="shop">Przejdź do sklepu</button>
          </div>
        </div>
      </section>`;
  }

  const needsPallet = items.some((part) => part.shipping === "paleta");
  const subtotal = items.reduce((sum, part) => sum + part.price, 0);

  const shippingOptions = needsPallet
    ? `<label class="chk"><input type="radio" name="shipping" value="180"> Paleta (silnik, skrzynia, drzwi)<span class="n">180 zł</span></label>`
    : `<label class="chk"><input type="radio" name="shipping" value="25"> Kurier DPD<span class="n">25 zł</span></label>
       <label class="chk"><input type="radio" name="shipping" value="18"> Paczkomat InPost<span class="n">18 zł</span></label>`;

  return `
    <section class="section">
      <div class="wrap">
        <div class="sec-head">
          <div><span class="eyebrow">Zamówienie</span><h2>Dostawa i płatność</h2></div>
        </div>

        <form class="two-col" id="checkoutForm">
          <!-- Dane klienta -->
          <div class="panel stack">
            <div class="two">
              <div class="field"><label for="orderName">Imię i nazwisko</label><input class="input" id="orderName" required></div>
              <div class="field"><label for="orderPhone">Telefon</label><input class="input" id="orderPhone" required inputmode="tel"></div>
            </div>
            <div class="field"><label for="orderEmail">E-mail</label><input class="input" id="orderEmail" type="email" required></div>
            <div class="field"><label for="orderAddress">Adres dostawy</label><input class="input" id="orderAddress" placeholder="Ulica, numer, kod, miejscowość"></div>
            <div class="field">
              <label for="orderVin">VIN auta (sprawdzimy dopasowanie przed wysyłką)</label>
              <input class="input vin-input" id="orderVin" maxlength="17" value="${escapeHtml(state.vin)}">
            </div>

            <div class="filters__group">
              <h4>Dostawa</h4>
              <label class="chk"><input type="radio" name="shipping" value="0" checked> Odbiór osobisty – Wólka Sokołowska<span class="n">0 zł</span></label>
              ${shippingOptions}
            </div>

            <div class="filters__group">
              <h4>Płatność</h4>
              <label class="chk"><input type="radio" name="payment" checked> Przelew tradycyjny</label>
              <label class="chk"><input type="radio" name="payment"> Szybki przelew / BLIK</label>
              <label class="chk"><input type="radio" name="payment"> Za pobraniem (+12 zł)</label>
            </div>

            <label class="chk"><input type="checkbox" id="orderInvoice"> Chcę fakturę VAT</label>
          </div>

          <!-- Podsumowanie -->
          <div class="panel stack">
            <h4>Podsumowanie</h4>
            ${items.map((part) => `
              <div class="line">
                <img src="${photoUrl(part.photoId, 160, 120)}" alt="">
                <div><b>${escapeHtml(part.name)}</b><small class="mono">${part.code} · OE ${part.oe}</small></div>
                <span>${formatPrice(part.price)}</span>
              </div>`).join("")}

            <div class="totals totals--plain">
              <div class="totals__row"><span>Części</span><span>${formatPrice(subtotal)}</span></div>
              <div class="totals__row"><span>Dostawa</span><span id="shippingCost">0 zł</span></div>
              <div class="totals__row">
                <span class="totals__label">Razem</span>
                <span class="price" id="orderTotal" data-subtotal="${subtotal}">${formatPrice(subtotal)}</span>
              </div>
            </div>

            <button class="btn btn--red" type="submit">Zamawiam i płacę</button>
            <p class="panel__text">Każda część ma 14 dni gwarancji rozruchowej. Przed wysyłką sprawdzimy dopasowanie po VIN.</p>
          </div>
        </form>
      </div>
    </section>`;
}


/* ============================================================
   Nakładki: koszyk i szczegóły części
   ============================================================ */

function cartDrawer(state) {
  const items = state.cart.map((code) => PARTS.find((part) => part.code === code));
  const total = items.reduce((sum, part) => sum + part.price, 0);

  const lines = items.length > 0
    ? items.map((part) => `
        <div class="line">
          <img src="${photoUrl(part.photoId, 160, 120)}" alt="">
          <div>
            <b>${escapeHtml(part.name)}</b>
            <small>${part.donor.make} ${part.donor.model} · <span class="mono">${part.code}</span></small><br>
            <button class="line__remove" data-remove="${part.code}">Usuń</button>
          </div>
          <span>${formatPrice(part.price)}</span>
        </div>`).join("")
    : `<p class="muted">Koszyk jest pusty. Dodaj części ze sklepu albo wyszukaj je po VIN.</p>`;

  return `
    <div class="scrim" data-close></div>
    <aside class="drawer" role="dialog" aria-label="Koszyk">
      <header class="drawer__head">
        <h2>Koszyk</h2>
        <button class="close" data-close aria-label="Zamknij">×</button>
      </header>
      <div class="drawer__lines">${lines}</div>
      <div class="totals">
        <div class="totals__row"><span>Razem</span><b class="price">${formatPrice(total)}</b></div>
        <button class="btn btn--red" data-checkout ${items.length > 0 ? "" : "disabled"}>Przejdź do zamówienia</button>
        <button class="btn btn--line" data-close>Kontynuuj zakupy</button>
      </div>
    </aside>`;
}

function partModal(part, inCart) {
  const donor = part.donor;

  return `
    <div class="scrim" data-close></div>
    <div class="modal" role="dialog" aria-label="${escapeHtml(part.name)}">
      <div class="modal__box">
        <div class="modal__photo">
          <img src="${photoUrl(part.photoId, 900, 900)}" alt="${escapeHtml(part.name)} – zdjęcie przykładowe">
          <span class="photo-note">Zdjęcie przykładowe · w sklepie zdjęcia konkretnej części</span>
        </div>

        <div class="modal__info">
          <div class="modal__top">
            <span class="eyebrow">${part.category} · <span class="mono">${part.code}</span></span>
            <button class="close" data-close aria-label="Zamknij">×</button>
          </div>

          <h2>${escapeHtml(part.name)}</h2>
          ${gradeTag(part.grade)}
          <p>${escapeHtml(part.note)}</p>

          <dl class="spec">
            <dt>Numer OE</dt>       <dd class="mono">${part.oe}</dd>
            <dt>Z auta</dt>         <dd>${donor.make} ${donor.model}, ${donor.year}</dd>
            <dt>Wersja</dt>         <dd>${donor.version}, silnik <span class="mono">${donor.engine}</span></dd>
            <dt>Przebieg dawcy</dt> <dd>${donor.mileage} km</dd>
            <dt>Kolor</dt>          <dd>${donor.color}</dd>
            <dt>Magazyn</dt>        <dd class="mono">Regał ${part.shelf}</dd>
            <dt>Wysyłka</dt>        <dd>${part.shipping === "paleta" ? "Paleta" : "Kurier / paczkomat"}</dd>
            <dt>Gwarancja</dt>      <dd>14 dni rozruchowa</dd>
          </dl>

          <div class="modal__buy">
            <span class="price">${formatPrice(part.price)}</span>
            <button class="btn ${inCart ? "btn--dark" : "btn--red"}" data-add="${part.code}" data-keep-open>
              ${inCart ? "W koszyku" : "Dodaj do koszyka"}
            </button>
          </div>
        </div>
      </div>
    </div>`;
}
