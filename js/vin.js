/* ============================================================
   vin.js — dekoder numeru VIN
   ------------------------------------------------------------
   Budowa numeru VIN (17 znaków):
     1–3   WMI  – producent i kraj
     4–8   VDS  – opis pojazdu (w grupie VW znaki 7–8 to kod modelu)
     9          – cyfra kontrolna (obowiązkowa w USA, w Europie często brak)
     10         – rok modelowy
     11         – fabryka
     12–17      – numer seryjny

   Funkcje publiczne:
     cleanVin(text)     – usuwa spacje i znaki spoza VIN, zamienia na wielkie litery
     decodeVin(vin)     – odczytuje dane z numeru
     findPartsForVin(d) – wybiera części pasujące do odczytanego auta
   ============================================================ */

"use strict";


/* ---------- Tabele kodów ---------- */

/** Kody producentów (WMI): [marka, kraj produkcji]. */
const WMI_CODES = {
  // Niemcy
  WVW: ["Volkswagen", "Niemcy"],
  WV1: ["Volkswagen Użytkowe", "Niemcy"],
  WV2: ["Volkswagen Użytkowe", "Niemcy"],
  WAU: ["Audi", "Niemcy"],
  WUA: ["Audi Sport", "Niemcy"],
  WBA: ["BMW", "Niemcy"],
  WBS: ["BMW M", "Niemcy"],
  WDD: ["Mercedes-Benz", "Niemcy"],
  WDB: ["Mercedes-Benz", "Niemcy"],
  W1K: ["Mercedes-Benz", "Niemcy"],
  W0L: ["Opel", "Niemcy"],
  W0V: ["Opel", "Niemcy"],
  WF0: ["Ford", "Niemcy"],
  WP0: ["Porsche", "Niemcy"],
  WME: ["Smart", "Niemcy"],

  // Francja, Hiszpania
  VF1: ["Renault", "Francja"],
  VF3: ["Peugeot", "Francja"],
  VR3: ["Peugeot", "Francja"],
  VF7: ["Citroën", "Francja"],
  VR7: ["Citroën", "Francja"],
  VNK: ["Toyota", "Francja"],
  VSS: ["Seat", "Hiszpania"],
  VS6: ["Ford", "Hiszpania"],
  VSK: ["Nissan", "Hiszpania"],

  // Europa Środkowa i Południowa
  TMB: ["Skoda", "Czechy"],
  TMA: ["Hyundai", "Czechy"],
  TSM: ["Suzuki", "Węgry"],
  ZFA: ["Fiat", "Włochy"],
  ZAR: ["Alfa Romeo", "Włochy"],
  ZLA: ["Lancia", "Włochy"],
  UU1: ["Dacia", "Rumunia"],
  SUP: ["Fiat (FCA Poland)", "Polska"],

  // Wielka Brytania, Szwecja
  SB1: ["Toyota", "Wielka Brytania"],
  SAL: ["Land Rover", "Wielka Brytania"],
  SAJ: ["Jaguar", "Wielka Brytania"],
  SJN: ["Nissan", "Wielka Brytania"],
  YV1: ["Volvo", "Szwecja"],
  YS3: ["Saab", "Szwecja"],

  // Azja
  JTD: ["Toyota", "Japonia"],
  JTE: ["Toyota", "Japonia"],
  JT1: ["Toyota", "Japonia"],
  JMZ: ["Mazda", "Japonia"],
  JHM: ["Honda", "Japonia"],
  JN1: ["Nissan", "Japonia"],
  JMB: ["Mitsubishi", "Japonia"],
  JS1: ["Suzuki", "Japonia"],
  KMH: ["Hyundai", "Korea Płd."],
  KNA: ["Kia", "Korea Płd."],
  U5Y: ["Kia", "Słowacja"],
  KL1: ["Chevrolet", "Korea Płd."],
  LRW: ["Tesla", "Chiny"],

  // Ameryka
  "1FA": ["Ford", "USA"],
  "1G1": ["Chevrolet", "USA"],
  "5YJ": ["Tesla", "USA"],
};

/** Producenci grupy VW, u których znaki 7–8 oznaczają kod modelu. */
const VAG_WMI = ["WVW", "WV1", "WV2", "WAU", "TMB", "VSS"];

/** Kody modeli grupy VW (znaki 7–8). */
const VAG_MODEL_CODES = {
  "1K": "Golf V / Golf VI / Jetta",
  "5K": "Golf VI",
  "AU": "Golf VII",
  "3C": "Passat B6 / B7",
  "3G": "Passat B8",
  "6R": "Polo V",
  "5N": "Tiguan",
  "1Z": "Octavia II",
  "5E": "Octavia III",
  "NX": "Octavia IV",
  "3T": "Superb II",
  "5J": "Fabia II / Roomster",
  "8K": "A4 B8",
  "8W": "A4 B9",
  "8P": "A3 8P",
  "8V": "A3 8V",
  "4F": "A6 C6",
  "4G": "A6 C7",
  "1P": "Leon II",
  "5F": "Leon III",
};

/** Powiązanie kodu modelu z modelami aut-dawców w sklepie. */
const VAG_CODE_TO_DONOR_MODELS = {
  "1K": ["Golf V"],
  "5K": ["Golf V"],
  "3C": ["Passat B6"],
  "1Z": ["Octavia II"],
  "8K": ["A4 B8"],
};

/** Znaki roku modelowego — cykl 30-letni od 1980 (bez I, O, Q, U, Z i zera). */
const YEAR_CHARS = "ABCDEFGHJKLMNPRSTVWXY123456789";

/** Wartości liter do liczenia cyfry kontrolnej. */
const TRANSLITERATION = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
};

/** Wagi kolejnych pozycji przy liczeniu cyfry kontrolnej. */
const POSITION_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

/** Najpóźniejszy rok modelowy, jaki dopuszczamy przy odczycie. */
const MAX_MODEL_YEAR = new Date().getFullYear() + 1;


/* ---------- Funkcje ---------- */

/**
 * Czyści wpisany tekst: wielkie litery, tylko A–Z i 0–9.
 * @param {string} text
 * @returns {string}
 */
function cleanVin(text) {
  return text.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/**
 * Wylicza rok modelowy z 10. znaku. Ten sam znak powtarza się co 30 lat,
 * więc wybieramy najpóźniejszy rok, który nie wypada w przyszłości.
 * @param {string} char
 * @returns {number|null}
 */
function modelYearFromChar(char) {
  const index = YEAR_CHARS.indexOf(char);
  if (index === -1) return null;

  let year = 1980 + index;
  while (year + 30 <= MAX_MODEL_YEAR) {
    year += 30;
  }
  return year;
}

/**
 * Liczy cyfrę kontrolną (pozycja 9) wg normy północnoamerykańskiej.
 * @param {string} vin 17 znaków
 * @returns {string} cyfra 0–9 lub „X”
 */
function computeCheckDigit(vin) {
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const char = vin[i];
    const value = /\d/.test(char) ? Number(char) : TRANSLITERATION[char];
    sum += value * POSITION_WEIGHTS[i];
  }
  const rest = sum % 11;
  return rest === 10 ? "X" : String(rest);
}

/**
 * Odczytuje dane z numeru VIN.
 * @param {string} vin oczyszczony numer (po cleanVin)
 * @returns {object} { vin, errors[], wmi, make, country, year, checkDigit, checkOk, modelCode, modelName, serial }
 */
function decodeVin(vin) {
  const result = { vin, errors: [] };

  // Walidacja
  if (vin.length !== 17) {
    result.errors.push(`VIN ma ${vin.length} znaków, a powinien mieć 17.`);
  }
  if (/[IOQ]/.test(vin)) {
    result.errors.push("VIN nie zawiera liter I, O ani Q. Sprawdź, czy to nie cyfry 1 lub 0.");
  }
  if (result.errors.length > 0) {
    return result;
  }

  // Producent i kraj (znaki 1–3)
  result.wmi = vin.slice(0, 3);
  const maker = WMI_CODES[result.wmi];
  result.make = maker ? maker[0] : null;
  result.country = maker ? maker[1] : null;

  // Rok modelowy (znak 10)
  result.year = modelYearFromChar(vin[9]);

  // Cyfra kontrolna (znak 9)
  result.checkDigit = computeCheckDigit(vin);
  result.checkOk = result.checkDigit === vin[8];

  // Kod modelu w grupie VW (znaki 7–8)
  if (VAG_WMI.includes(result.wmi)) {
    result.modelCode = vin.slice(6, 8);
    result.modelName = VAG_MODEL_CODES[result.modelCode] || null;
  }

  // Numer seryjny (znaki 12–17)
  result.serial = vin.slice(11);

  return result;
}

/**
 * Sprowadza nazwę marki z tabeli WMI do nazwy używanej w danych sklepu
 * (np. „Volkswagen Użytkowe” → „Volkswagen”).
 * @param {string|null} make
 */
function normalizeMake(make) {
  if (!make) return null;
  if (make.startsWith("Volkswagen")) return "Volkswagen";
  if (make.startsWith("Audi")) return "Audi";
  if (make.startsWith("BMW")) return "BMW";
  if (make.startsWith("Mercedes")) return "Mercedes-Benz";
  return make;
}

/**
 * Wybiera części pasujące do odczytanego auta.
 *   level "model" – dokładne dopasowanie po kodzie modelu (grupa VW)
 *   level "make"  – ta sama marka i rocznik ±4 lata
 *   level "none"  – brak części
 * @param {object} decoded wynik decodeVin()
 * @returns {{ list: object[], level: "model"|"make"|"none" }}
 */
function findPartsForVin(decoded) {
  const make = normalizeMake(decoded.make);
  if (!make) {
    return { list: [], level: "none" };
  }

  // 1. Dokładne dopasowanie po kodzie modelu
  const donorModels = VAG_CODE_TO_DONOR_MODELS[decoded.modelCode];
  if (donorModels) {
    const byModel = PARTS.filter(
      (part) => part.donor.make === make && donorModels.includes(part.donor.model)
    );
    if (byModel.length > 0) {
      return { list: byModel, level: "model" };
    }
  }

  // 2. Marka i zbliżony rocznik
  const byMake = PARTS.filter(
    (part) =>
      part.donor.make === make &&
      (!decoded.year || Math.abs(part.donor.year - decoded.year) <= 4)
  );

  return { list: byMake, level: byMake.length > 0 ? "make" : "none" };
}
