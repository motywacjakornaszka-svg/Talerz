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

## Funkcje

- **Motyw jasny / ciemny / automatyczny:** przycisk 🌗 w nagłówku albo **Profil → Wygląd**.
- **Motywacja:**
  - seria dni w limicie z rekordem;
  - podgląd tygodnia: ✓ w limicie, ↑ ponad limit, ↓ za mało jedzenia;
  - pasek postępu do wagi docelowej;
  - wskazówka dnia, np. ile kroków brakuje i ile kcal to doda;
  - odznaki.
  Dzień, w którym zjesz mniej niż 60% limitu, **nie** liczy się do serii. Aplikacja celowo nie nagradza głodzenia się.
- **Płyny 💧:**
  - szybkie przyciski +150 / +250 / +330 / +500 ml, własna ilość i „cofnij”;
  - dzienny cel: ok. 30 ml na kg masy ciała + dodatek za kroki, w zakresie 1,5–3,5 l (można ustawić ręcznie w Profilu);
  - plan równych porcji od pobudki do godziny przed snem, pokazany na osi dnia razem z wypitymi napojami;
  - wskaźnik regularności i zachęta, gdy minie pora porcji albo pojawi się zaległość;
  - wykres z 14 dni w Historii, odznaki „Cel płynów” i „7 dni nawodnienia”.
  Przypomnienia: powiadomienia, gdy aplikacja działa, albo plik `.ics` do kalendarza. Kalendarz przypomina także przy zamkniętej aplikacji.
- **Szybka analiza (zakładka AI):**
  - zdjęcie jest zmniejszane do 768 px;
  - w Gemini model „myśli” krócej (`thinkingLevel: low`);
  - analiza rusza od razu po zrobieniu zdjęcia;
  - aplikacja pokazuje czas odpowiedzi.
  Najszybsze modele to Gemini Flash-Lite i Claude Haiku.

## Gdzie są zdjęcia posiłków

- **Na telefonie** aplikacja zapisuje tylko **małą miniaturę** (160 px) przy posiłku, w pamięci przeglądarki/aplikacji. Pełnego zdjęcia aplikacja nie przechowuje.
- **Do analizy** zmniejszona kopia zdjęcia jest wysyłana do Google (Gemini) albo Anthropic (Claude) i obowiązują tam ich zasady przechowywania danych. W darmowym planie Gemini Google może używać przesłanych danych do ulepszania usług.
- **Galeria:** zdjęcie zrobione aparatem z poziomu aplikacji zwykle nie trafia do galerii telefonu. Zdjęcie wybrane z galerii zostaje tam, gdzie było.
- **GitHub:** żadne zdjęcia ani dane nie trafiają do repozytorium.

## Aktualizacja aplikacji

Wersję aplikacji widać na dole zakładki **Profil** („Talerz, wersja …”).

**Nie widać zmian po wgraniu nowej wersji?**
1. Sprawdź na github.com, czy `index.html` jest w **głównym folderze** repozytorium, a nie w podfolderze `talerz/`, i czy pliki zostały podmienione (data ostatniego commita).
2. W **Settings → Pages** poczekaj, aż wdrożenie będzie zielone (1–2 min, zakładka **Actions**).
3. Zamknij aplikację całkowicie i otwórz ją ponownie, **dwa razy**. Od wersji 4 kolejne aktualizacje pokazują się już przy pierwszym otwarciu.
4. Jeśli nadal widać starą wersję: Android/Chrome → ⋮ → Ustawienia → Ustawienia witryn → wyczyść dane strony. iPhone → Ustawienia → Safari → Zaawansowane → Dane witryn → usuń dane strony. Wcześniej zrób **eksport kopii**, bo usunięcie danych strony kasuje zapisane posiłki.


Po zmianie plików podbij `VERSION` w `sw.js` (np. z `talerz-v3` na `talerz-v4`). Dzięki temu telefony pobiorą nową wersję. Zwykle wystarczy potem zamknąć i ponownie otworzyć aplikację.

## Kopia zapasowa

**Profil → Eksportuj dane** zapisuje plik `.json` z profilem i historią. Ten sam plik wczytasz przez **Importuj z pliku**, np. na nowym telefonie. Klucze API nie są zapisywane w kopii.

## Pomysły na rozwój

- Automatyczne kroki z Apple Health / Health Connect wymagają natywnej aplikacji (np. Capacitor z wtyczką do Health Connect / HealthKit).
- Skaner kodów kreskowych z bazą Open Food Facts.
- Własny mały serwer (np. Cloudflare Worker), żeby nie trzymać klucza API na telefonie.
