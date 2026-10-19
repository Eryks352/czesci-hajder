# Części Hajder – projekt strony

Projekt strony sklepu z używanymi częściami samochodowymi dla firmy **Części Hajder** (Wólka Sokołowska).

> Oferty, ceny i zdjęcia części są przykładowe. Formularze (zamówienie, zapytanie, wycena) niczego nie wysyłają.

## Funkcje

- sklep z filtrami (kategoria, marka, model, stan, cena) i wyszukiwaniem po nazwie / numerze OE
- wyszukiwarka części po numerze **VIN** (producent, rok modelowy, model w grupie VW)
- koszyk i formularz zamówienia (dostawa, płatność, faktura VAT)
- podstrony: kasacja pojazdów, kontakt

## Struktura

```
index.html        – szkielet strony
css/style.css     – style
js/data.js        – dane: zdjęcia, auta-dawcy, części
js/vin.js         – dekoder numeru VIN
js/templates.js   – szablony HTML widoków
js/app.js         – stan, nawigacja, obsługa zdarzeń
```

## Uruchomienie

Otwórz `index.html` w przeglądarce – nie trzeba nic instalować.

Zdjęcia przykładowe: [Unsplash](https://unsplash.com).
