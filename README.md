# Talerz 🍽️ – licznik kalorii ze zdjęć

Prosta aplikacja na telefon (PWA). Robi dwie rzeczy:

1. **Liczy kalorie ze zdjęcia posiłku.** Zdjęcie analizuje AI: Google Gemini albo Claude, z Twoim własnym kluczem API. Rozpoznane składniki i gramatury możesz poprawić.
2. **Liczy dzienny limit kalorii na odchudzanie.** Bierze pod uwagę płeć, wiek, wzrost, wagę, liczbę kroków i trening.

Aplikacja nie ma serwera ani konta. Wszystkie dane (posiłki, waga, klucze API) zostają **tylko na Twoim telefonie**.

---

## Jak liczony jest limit

| Krok | Wzór |
|---|---|
| Przemiana podstawowa (BMR) | Mifflin-St Jeor: `10 × waga + 6,25 × wzrost − 5 × wiek + 5` (M) / `− 161` (K) |
| Dzień bez kroków | `BMR × 1,2` (praca siedząca) / `1,3` (stojąca) / `1,4` (fizyczna) |
| Kalorie z kroków | `kroki × (0,415 × wzrost) = km`, potem `0,5 kcal × waga × km` |
| Trening | kcal wpisane ręcznie |
| Deficyt | `tempo (kg/tydz.) × 7700 / 7` |
| **Limit** | `wydatek − deficyt` |

Zabezpieczenia:
- limit nie spada poniżej 1500 kcal (M) i 1200 kcal (K);
- tempo chudnięcia jest ograniczone do ok. 1% masy ciała tygodniowo;
- przy BMI < 18,5 aplikacja nie liczy deficytu.

> Szacunki są przybliżone. Ocena kalorii ze zdjęcia może się mylić o 20–30%. Jeśli chorujesz lub przyjmujesz leki, skonsultuj dietę z lekarzem lub dietetykiem.

---

## Struktura repozytorium

```
index.html              ← cała aplikacja (HTML + CSS + JS, bez zależności)
manifest.webmanifest    ← dane do instalacji na telefonie
sw.js                   ← service worker (działanie offline)
icons/                  ← ikony aplikacji
README.md
.gitignore
```

Nie trzeba niczego budować ani instalować (bez npm i bez frameworków).

---

## 1. Wrzucenie na GitHub

**Przez przeglądarkę (najprościej):**
1. Na github.com kliknij **New repository**. Nazwa np. `talerz`, widoczność **Public**, bez README.
2. Kliknij **uploading an existing file** i przeciągnij **wszystkie pliki razem z folderem `icons`**.
3. Kliknij **Commit changes**.

**Albo z terminala:**
```bash
cd talerz
git init
git add .
git commit -m "Talerz – pierwsza wersja"
git branch -M main
git remote add origin https://github.com/TWOJ_LOGIN/talerz.git
git push -u origin main
```

## 2. Włączenie GitHub Pages (darmowy hosting)

1. W repozytorium wejdź w **Settings → Pages**.
2. W **Source** wybierz **Deploy from a branch**, branch **main**, folder **/ (root)**, a potem **Save**.
3. Po 1–2 minutach aplikacja będzie pod adresem:
   `https://TWOJ_LOGIN.github.io/talerz/`

> **Prywatność:** publiczne repozytorium pokazuje tylko **kod** aplikacji. Twoje posiłki, waga i klucze API nigdy nie trafiają do repozytorium, bo są zapisywane wyłącznie w pamięci przeglądarki na telefonie. GitHub Pages z prywatnego repozytorium wymaga płatnego planu (GitHub Pro).

## 3. Instalacja na telefonie

**Android (Chrome):** otwórz adres aplikacji, potem menu **⋮** i **Zainstaluj aplikację** (albo **Dodaj do ekranu głównego**).

**iPhone (Safari):** otwórz adres aplikacji, potem **Udostępnij** i **Do ekranu początkowego**.

Aplikacja uruchamia się wtedy jak zwykła apka: na pełnym ekranie, z ikoną i z działaniem offline (bez analizy zdjęć, bo ta wymaga internetu).

## 4. Klucz AI (zakładka „AI” w aplikacji)

| Dostawca | Gdzie wziąć klucz | Koszt |
|---|---|---|
| **Google Gemini** | https://aistudio.google.com/apikey | darmowy limit na wybranych modelach |
| **Claude (Anthropic)** | https://platform.claude.com/settings/keys | płatne za użycie (kredyty w Claude Console); subskrypcja claude.ai nie obejmuje API |

W zakładce AI wklej klucz, kliknij **Pobierz listę**, wybierz model i kliknij **Zapisz i przetestuj**.

> ⚠️ **Nigdy nie wpisuj klucza do kodu ani nie commituj go do repozytorium.** Aplikacja wywołuje API bezpośrednio z telefonu, więc klucz jest bezpieczny tylko na Twoim urządzeniu. Dla Claude ustaw w Console miesięczny limit wydatków.

---

## Aktualizacja aplikacji

Po zmianie plików podbij `VERSION` w `sw.js` (np. `talerz-v2`). Dzięki temu telefony pobiorą nową wersję. Zwykle wystarczy potem zamknąć i ponownie otworzyć aplikację.

## Kopia zapasowa

**Profil → Eksportuj dane** zapisuje plik `.json` z profilem i historią. Ten sam plik wczytasz przez **Importuj z pliku**, np. na nowym telefonie. Klucze API nie są zapisywane w kopii.

## Pomysły na rozwój

- Automatyczne kroki z Apple Health / Health Connect wymagają natywnej aplikacji (np. Capacitor z wtyczką do Health Connect / HealthKit).
- Skaner kodów kreskowych z bazą Open Food Facts.
- Własny mały serwer (np. Cloudflare Worker), żeby nie trzymać klucza API na telefonie.
