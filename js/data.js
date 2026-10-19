/* ============================================================
   data.js — dane sklepu
   ------------------------------------------------------------
   Wszystkie oferty są PRZYKŁADOWE. W gotowym sklepie te dane
   będą pochodzić z bazy danych / systemu magazynowego.

   Zawartość:
     photoUrl()     – buduje adres zdjęcia z Unsplash
     PHOTOS         – identyfikatory przykładowych zdjęć
     CATEGORY_PHOTO – zdjęcie dla każdej kategorii
     DONORS         – auta-dawcy (rozebrane na części)
     PARTS          – części w sklepie
     CATEGORIES, MAKES – listy pomocnicze do filtrów
   ============================================================ */

"use strict";


/* ---------- Zdjęcia ---------- */

/**
 * Zwraca adres zdjęcia z Unsplash przyciętego do podanego rozmiaru.
 * @param {string} id     identyfikator zdjęcia (z obiektu PHOTOS)
 * @param {number} width  szerokość w pikselach
 * @param {number} height wysokość w pikselach
 */
function photoUrl(id, width = 640, height = 480) {
  return `https://images.unsplash.com/photo-${id}?w=${width}&h=${height}&fit=crop&q=70&auto=format`;
}

/** Przykładowe zdjęcia (darmowe, z serwisu Unsplash). */
const PHOTOS = {
  // Silnik i osprzęt
  engine:      "1486262715619-67b85e0b08d3",
  engineBay:   "1527383418406-f85a3b146499",
  turbo:       "1591879742348-13012c2963bf",
  injectors:   "1779263569890-ce0389630b10",
  pulley:      "1614447428943-52ec0bdbc7aa",
  gearbox:     "1767884162326-54d3e26d444a",
  module:      "1537462715879-360eeb61a0ad",

  // Karoseria i oświetlenie
  door:        "1564705604144-51593412c133",
  mirror:      "1590520745369-36d668d1ae20",
  rear:        "1441148489547-da3f133be9ae",
  headlight:   "1492144534655-ae79c964c9d7",
  taillight:   "1518438223361-dde09dbeed6a",
  brakelight:  "1495506539593-87a23e41b6fe",

  // Zawieszenie, wnętrze, koła
  coilover:    "1760836395716-7dd00b71311a",
  steering:    "1612805144400-88c7821bf36f",
  gauge:       "1517026575980-3e1e2dedeab4",
  seat:        "1619719287848-883c8f26efbc",
  wheel:       "1623564493214-6137dff043ad",
  wheelAudi:   "1542377281-73d08e3a10aa",

  // Zdjęcia do banerów
  enginePile:  "1763836393413-3b79e6b4560a",
  engines:     "1767340078222-98633f3ffd27",
  yard:        "1719242513425-f5eed99b282f",
  mechanic:    "1615906655593-ad0386982a0f",
};

/** Zdjęcie wyświetlane na kafelku każdej kategorii. */
const CATEGORY_PHOTO = {
  "Silnik":          PHOTOS.engine,
  "Skrzynia biegów": PHOTOS.gearbox,
  "Elektryka":       PHOTOS.module,
  "Karoseria":       PHOTOS.door,
  "Oświetlenie":     PHOTOS.headlight,
  "Zawieszenie":     PHOTOS.coilover,
  "Wnętrze":         PHOTOS.steering,
  "Koła":            PHOTOS.wheel,
};


/* ---------- Auta-dawcy ---------- */

const DONORS = [
  { id: "D-0412", make: "Volkswagen", model: "Golf V",      version: "1.9 TDI 105 KM",  engine: "BXE",     year: 2008, mileage: "212 000", color: "Srebrny LA7W",   added: "14.10.2026" },
  { id: "D-0409", make: "Skoda",      model: "Octavia II",  version: "1.9 TDI 105 KM",  engine: "BXE",     year: 2007, mileage: "268 000", color: "Czarny 9910",    added: "09.10.2026" },
  { id: "D-0405", make: "Audi",       model: "A4 B8",       version: "2.0 TDI 143 KM",  engine: "CAGA",    year: 2011, mileage: "241 000", color: "Szary LX7W",     added: "02.10.2026" },
  { id: "D-0401", make: "Opel",       model: "Astra H",     version: "1.7 CDTI 125 KM", engine: "Z17DTR",  year: 2009, mileage: "198 000", color: "Granat Z22C",    added: "28.09.2026" },
  { id: "D-0398", make: "Ford",       model: "Focus Mk2",   version: "1.6 TDCi 109 KM", engine: "G8DA",    year: 2010, mileage: "233 000", color: "Biały",          added: "22.09.2026" },
  { id: "D-0394", make: "Toyota",     model: "Corolla E12", version: "1.4 VVT-i 97 KM", engine: "4ZZ-FE",  year: 2005, mileage: "187 000", color: "Srebrny 1C0",    added: "16.09.2026" },
  { id: "D-0390", make: "Renault",    model: "Megane III",  version: "1.5 dCi 110 KM",  engine: "K9K 836", year: 2011, mileage: "254 000", color: "Czerwony NNP",   added: "10.09.2026" },
  { id: "D-0386", make: "BMW",        model: "Seria 3 E90", version: "320d 177 KM",     engine: "N47D20C", year: 2008, mileage: "296 000", color: "Czarny 475",     added: "03.09.2026" },
  { id: "D-0381", make: "Peugeot",    model: "308 T7",      version: "1.6 HDi 110 KM",  engine: "9HZ",     year: 2009, mileage: "221 000", color: "Szary EZW",      added: "27.08.2026" },
  { id: "D-0377", make: "Volkswagen", model: "Passat B6",   version: "2.0 TDI 140 KM",  engine: "BKP",     year: 2007, mileage: "305 000", color: "Niebieski LD5Q", added: "20.08.2026" },
];


/* ---------- Części ----------
   Pola:
     code     – kod magazynowy
     name     – nazwa części
     category – kategoria (klucz z CATEGORY_PHOTO)
     donorId  – z którego auta pochodzi (DONORS.id)
     oe       – numer katalogowy producenta (OE)
     price    – cena brutto w zł
     grade    – klasa stanu: A (bardzo dobry), B (ślady użytkowania), C (opisane uszkodzenia)
     note     – opis stanu
     shelf    – miejsce w magazynie
     shipping – "kurier" albo "paleta" (części duże i ciężkie)
     photo    – klucz z PHOTOS
*/
const PARTS_RAW = [
  { code: "HJ-26-1201", name: "Silnik kompletny 1.9 TDI BXE",           category: "Silnik",          donorId: "D-0412", oe: "038100040",   price: 3400, grade: "A", shelf: "R1-01",  shipping: "paleta", photo: "engine",     note: "Słuchany na aucie przed demontażem, ciśnienie sprężania sprawdzone. Kompletny z osprzętem, bez skrzyni." },
  { code: "HJ-26-1202", name: "Skrzynia biegów manualna 5b GVR",        category: "Skrzynia biegów", donorId: "D-0412", oe: "02J300053",   price: 1150, grade: "A", shelf: "R1-04",  shipping: "paleta", photo: "gearbox",    note: "Biegi wchodzą lekko, bez wycia. Z półosiami po wcześniejszym uzgodnieniu." },
  { code: "HJ-26-1203", name: "Reflektor lewy przedni",                 category: "Oświetlenie",     donorId: "D-0412", oe: "1K6941005Q",  price: 340,  grade: "B", shelf: "R7-12",  shipping: "kurier", photo: "headlight",  note: "Klosz lekko zmatowiony, zaczepy całe, regulator sprawny." },
  { code: "HJ-26-1204", name: "Drzwi przednie prawe kompletne",         category: "Karoseria",       donorId: "D-0412", oe: "1K4831056",   price: 520,  grade: "B", shelf: "R4-02",  shipping: "paleta", photo: "door",       note: "Kolor LA7W. Szyba, podnośnik, zamek, lusterko. Drobne ryski przy klamce." },
  { code: "HJ-26-1205", name: "Alternator Valeo 140A",                  category: "Elektryka",       donorId: "D-0412", oe: "06F903023F",  price: 260,  grade: "A", shelf: "R9-03",  shipping: "kurier", photo: "pulley",     note: "Sprawdzony na stole probierczym: ładowanie 14,3 V." },
  { code: "HJ-26-1206", name: "Turbosprężarka Garrett",                 category: "Silnik",          donorId: "D-0409", oe: "038253056G",  price: 780,  grade: "A", shelf: "R2-07",  shipping: "kurier", photo: "turbo",      note: "Brak luzów osiowych, łopatki bez uszkodzeń, bez oleju w dolocie." },
  { code: "HJ-26-1207", name: "Sterownik silnika ECU",                  category: "Elektryka",       donorId: "D-0409", oe: "03G906021AB", price: 420,  grade: "A", shelf: "R9-11",  shipping: "kurier", photo: "module",     note: "Bez immobilizera do odkodowania. Numer oprogramowania podajemy na życzenie." },
  { code: "HJ-26-1208", name: "Zderzak tylny",                          category: "Karoseria",       donorId: "D-0409", oe: "1Z5807421",   price: 460,  grade: "B", shelf: "R5-01",  shipping: "kurier", photo: "rear",       note: "Kolor 9910, uchwyty całe, jedna rysa na narożniku." },
  { code: "HJ-26-1209", name: "Amortyzator przedni lewy",               category: "Zawieszenie",     donorId: "D-0409", oe: "1K0413031BE", price: 110,  grade: "B", shelf: "R6-08",  shipping: "kurier", photo: "coilover",   note: "Szczelny, sprawdzony na przebieg ręczny." },
  { code: "HJ-26-1210", name: "Silnik 2.0 TDI CAGA",                    category: "Silnik",          donorId: "D-0405", oe: "03L100035",   price: 5900, grade: "A", shelf: "R1-03",  shipping: "paleta", photo: "engineBay",  note: "Common rail, 241 tys. km. Film z pracy silnika do wglądu." },
  { code: "HJ-26-1211", name: "Lampa tylna lewa w błotnik",             category: "Oświetlenie",     donorId: "D-0405", oe: "8K5945095",   price: 290,  grade: "A", shelf: "R7-03",  shipping: "kurier", photo: "taillight",  note: "Bez pęknięć, oprawka żarówek kompletna." },
  { code: "HJ-26-1212", name: "Felgi aluminiowe 17\" 5x112 (4 szt.)",   category: "Koła",            donorId: "D-0405", oe: "8K0601025C",  price: 1250, grade: "B", shelf: "R10-01", shipping: "kurier", photo: "wheelAudi",  note: "ET 46, 7,5J. Proste, delikatne przetarcia na rantach." },
  { code: "HJ-26-1213", name: "Kierownica multifunkcyjna",              category: "Wnętrze",         donorId: "D-0405", oe: "8K0419091",   price: 380,  grade: "A", shelf: "R8-06",  shipping: "kurier", photo: "steering",   note: "Skóra bez przetarć, przyciski działają. Bez poduszki." },
  { code: "HJ-26-1214", name: "Skrzynia biegów 6b M32",                 category: "Skrzynia biegów", donorId: "D-0401", oe: "55192042",    price: 1450, grade: "B", shelf: "R1-06",  shipping: "paleta", photo: "gearbox",    note: "Łożyska bez szumów przy teście na aucie. Uszczelniacze suche." },
  { code: "HJ-26-1215", name: "Pompa wtryskowa Denso",                  category: "Silnik",          donorId: "D-0401", oe: "8973279242",  price: 640,  grade: "A", shelf: "R2-02",  shipping: "kurier", photo: "injectors",  note: "Sprawdzona na stole Bosch EPS." },
  { code: "HJ-26-1216", name: "Lusterko lewe elektryczne",              category: "Karoseria",       donorId: "D-0398", oe: "1695426",     price: 170,  grade: "B", shelf: "R5-11",  shipping: "kurier", photo: "mirror",     note: "7 pinów, podgrzewane. Szkło całe." },
  { code: "HJ-26-1217", name: "Wahacz przedni prawy",                   category: "Zawieszenie",     donorId: "D-0398", oe: "1500154",     price: 120,  grade: "A", shelf: "R6-02",  shipping: "kurier", photo: "coilover",   note: "Tuleje i sworzeń bez luzów." },
  { code: "HJ-26-1218", name: "Felgi aluminiowe 16\" 5x108 (4 szt.)",   category: "Koła",            donorId: "D-0398", oe: "1323389",     price: 890,  grade: "B", shelf: "R10-04", shipping: "kurier", photo: "wheel",      note: "Proste, jedna z rysą na rancie." },
  { code: "HJ-26-1219", name: "Rozrusznik",                             category: "Elektryka",       donorId: "D-0394", oe: "2810022020",  price: 190,  grade: "A", shelf: "R9-05",  shipping: "kurier", photo: "pulley",     note: "Test obciążeniowy bez zastrzeżeń." },
  { code: "HJ-26-1220", name: "Reflektor prawy przedni",                category: "Oświetlenie",     donorId: "D-0394", oe: "8113002A70",  price: 230,  grade: "C", shelf: "R7-14",  shipping: "kurier", photo: "headlight",  note: "Pęknięte jedno ucho mocowania, klosz przezroczysty." },
  { code: "HJ-26-1221", name: "Wtryskiwacze Continental (4 szt.)",      category: "Silnik",          donorId: "D-0390", oe: "166000897R",  price: 880,  grade: "A", shelf: "R2-10",  shipping: "kurier", photo: "injectors",  note: "Sprawdzone na stole: przelewy w normie." },
  { code: "HJ-26-1222", name: "Licznik zegarów",                        category: "Wnętrze",         donorId: "D-0390", oe: "248100026R",  price: 210,  grade: "A", shelf: "R8-02",  shipping: "kurier", photo: "gauge",      note: "Wyświetlacz bez martwych pikseli." },
  { code: "HJ-26-1223", name: "Drzwi tylne lewe",                       category: "Karoseria",       donorId: "D-0390", oe: "821010019R",  price: 440,  grade: "B", shelf: "R4-05",  shipping: "paleta", photo: "door",       note: "Kolor NNP, kompletne z szybą." },
  { code: "HJ-26-1224", name: "Moduł ABS z pompą",                      category: "Elektryka",       donorId: "D-0386", oe: "3451677283",  price: 690,  grade: "A", shelf: "R9-08",  shipping: "kurier", photo: "module",     note: "Brak błędów na aucie przed demontażem." },
  { code: "HJ-26-1225", name: "Mechanizm różnicowy 2,47",               category: "Skrzynia biegów", donorId: "D-0386", oe: "33107572765", price: 980,  grade: "A", shelf: "R3-01",  shipping: "kurier", photo: "gearbox",    note: "Przełożenie 2,47. Cichy, bez wycieków." },
  { code: "HJ-26-1226", name: "Fotel kierowcy",                         category: "Wnętrze",         donorId: "D-0386", oe: "52107265123", price: 520,  grade: "B", shelf: "R8-10",  shipping: "paleta", photo: "seat",       note: "Materiał z alcantarą. Regulacja manualna." },
  { code: "HJ-26-1227", name: "Lampa stop w klapę",                     category: "Oświetlenie",     donorId: "D-0381", oe: "6351HJ",      price: 180,  grade: "A", shelf: "R7-09",  shipping: "kurier", photo: "brakelight", note: "Bez pęknięć, wiązka kompletna." },
  { code: "HJ-26-1228", name: "Kolumna McPherson przód kpl.",           category: "Zawieszenie",     donorId: "D-0381", oe: "5202SQ",      price: 260,  grade: "A", shelf: "R6-11",  shipping: "kurier", photo: "coilover",   note: "Sprężyna, amortyzator, poduszka górna." },
  { code: "HJ-26-1229", name: "Skrzynia DSG 6b DQ250",                  category: "Skrzynia biegów", donorId: "D-0377", oe: "02E300051",   price: 3200, grade: "A", shelf: "R1-08",  shipping: "paleta", photo: "gearbox",    note: "Sprzęgła w normie wg odczytu adaptacji, mechatronika sprawna." },
  { code: "HJ-26-1230", name: "Ksenon prawy z przetwornicą",            category: "Oświetlenie",     donorId: "D-0377", oe: "3C0941752J",  price: 690,  grade: "A", shelf: "R7-06",  shipping: "kurier", photo: "headlight",  note: "Skrętny, palnik i przetwornica sprawne." },
];

/** Części z dołączonym obiektem dawcy i gotowym identyfikatorem zdjęcia. */
const PARTS = PARTS_RAW.map((part) => ({
  ...part,
  donor: DONORS.find((donor) => donor.id === part.donorId),
  photoId: PHOTOS[part.photo],
}));


/* ---------- Listy pomocnicze ---------- */

const CATEGORIES = Object.keys(CATEGORY_PHOTO);
const MAKES = [...new Set(DONORS.map((donor) => donor.make))].sort();

/** Opisy klas stanu części. */
const GRADES = {
  A: "bardzo dobry",
  B: "ślady użytkowania",
  C: "opisane uszkodzenia",
};
