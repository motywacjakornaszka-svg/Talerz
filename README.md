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

**Android (Chrome):**
1. Otwórz adres aplikacji **w Chrome**. Wpisz go ręcznie albo kliknij **„Otwórz w Chrome”** w aplikacji (Profil → 📲). Link otwarty w Messengerze, Gmailu czy aplikacji Google działa w ich wbudowanej przeglądarce, która pozwala dodać tylko skrót.
2. Poczekaj kilka sekund. Na ekranie „Dziś” pojawi się pasek **📲 Zainstaluj Talerz jako aplikację**, a w Profilu przycisk **Zainstaluj aplikację**.
3. Albo ręcznie: menu **⋮** → **Zainstaluj aplikację**, a w starszych wersjach **Dodaj do ekranu głównego** → w okienku wybierz **Zainstaluj**, nie „Utwórz skrót”.
4. Po instalacji Talerz jest na liście aplikacji. Przytrzymaj ikonę, żeby zobaczyć skróty **Dodaj posiłek** i **Dodaj wodę**.

Jeśli wcześniej dodałeś skrót, usuń go z ekranu głównego, a potem zainstaluj według kroków powyżej.

**Prawdziwy plik APK (opcjonalnie):** na https://www.pwabuilder.com wklej adres aplikacji → **Package for stores** → **Android** → pobierz paczkę i zainstaluj plik `.apk` z telefonu (trzeba zezwolić na instalację z nieznanych źródeł). Żeby zniknął pasek adresu, wgraj do repozytorium plik `.well-known/assetlinks.json` z paczki PWABuilder (plik `.nojekyll` w repozytorium sprawia, że GitHub Pages udostępni ten folder).

**iPhone (Safari):** otwórz adres aplikacji, potem **Udostępnij** i **Do ekranu początkowego**.

Aplikacja uruchamia się wtedy jak zwykła apka: na pełnym ekranie, z ikoną i z działaniem offline (bez analizy zdjęć, bo ta wymaga internetu).

## 4. Klucz AI (zakładka „AI” w aplikacji)

| Dostawca | Gdzie wziąć klucz | Koszt |
|---|---|---|
| **Google Gemini** | https://aistudio.google.com/apikey | darmowy limit na wybranych modelach |
| **Claude (Anthropic)** | https://platform.claude.com/settings/keys | płatne za użycie (kredyty w Claude Console); subskrypcja claude.ai nie obejmuje API |

W zakładce AI wklej klucz i kliknij **＋ Dodaj klucz**. Aplikacja od razu go przetestuje. Potem kliknij **Pobierz listę** i wybierz model.

### Kilka kluczy i automatyczne przełączanie

- Dla każdego dostawcy możesz dodać **dowolnie wiele kluczy**, z nazwą, np. „Prywatny” albo „Płatny”. Kolejność zmienisz strzałką ▲.
- Klucze są używane **po kolei**. Gdy klucz zwróci błąd limitu (429) albo braku środków, aplikacja od razu ponawia analizę **następnym kluczem**. Wyczerpany klucz odpoczywa:
  - przy limicie minutowym: tyle, ile każe serwer (zwykle kilkadziesiąt sekund);
  - przy dziennym limicie Gemini: do północy czasu pacyficznego, czyli ok. 9:00 w Polsce;
  - przy braku środków w Claude: 1 godzinę.
- Nieprawidłowy klucz jest pomijany, dopóki go nie przetestujesz (⟳) albo nie usuniesz.
- Opcja **„Przełącz na drugiego dostawcę”**: gdy wyczerpią się wszystkie klucze Gemini, aplikacja użyje kluczy Claude (i odwrotnie).
- Przy każdym kluczu widać jego stan (● działa / ⏸ limit do godz. … / ✗ nieprawidłowy) i liczbę dzisiejszych użyć.

> Regulaminy dostawców mogą zabraniać obchodzenia limitów, np. przez zakładanie wielu darmowych projektów tylko w tym celu. Bezpiecznie jest łączyć np. darmowy klucz z płatnym albo klucze różnych dostawców.

> ⚠️ **Nigdy nie wpisuj klucza do kodu ani nie commituj go do repozytorium.** Aplikacja wywołuje API bezpośrednio z telefonu, więc klucz jest bezpieczny tylko na Twoim urządzeniu. Dla Claude ustaw w Console miesięczny limit wydatków.

---

## Funkcje (wersja 9)

Aplikacja ma 3 zakładki: **Dziś · Historia · Profil**. Profil i ustawienia zapisują się same, bez przycisku „Zapisz”.

**Dziś**
- 🎯 limit kalorii, makro, 👟 kroki i 🏋️ trening w jednej karcie (ⓘ pokazuje, jak liczony jest limit);
- pasek jakości dnia:
  - 🥦 warzywa i owoce (cel 400 g);
  - 🍬 cukry wolne (max 30 g);
  - 💧 odsetek dobrych napojów;
- 💧 płyny:
  - wybór napoju (12 rodzajów + własne, kolorowa kropka = ocena) i ilości;
  - pasek tempa na osi dnia;
  - pasek składu napojów;
  - zamiennik po słodkim napoju, np. „−139 kcal, −35 g cukru”;
- 🍽️ posiłki z oceną (🟢 → 🔴) i podpowiedzią zamiennika przy słabych wyborach; kalorie ze słodkich napojów dochodzą tu automatycznie;
- 🔥 seria dni, tydzień, postęp do celu wagi, wskazówka dnia, odznaki.

**Ranking napojów:**
- 🟢 woda (zwykła i gazowana);
- 🟢 herbata i kawa bez cukru;
- 🟡 mleko, kefir, napój roślinny;
- 🟡 sok 100% do 150 ml dziennie (powyżej 🔴);
- 🟠 napoje zero;
- 🔴 cola i inne słodzone napoje, nektary, energetyki, alkohol (alkohol nie liczy się do nawodnienia).

**Ranking jedzenia** (kategorie nadaje AI albo wybierasz ręcznie):
- 🥦🍎🫘 najlepsze;
- 🌾🍗🧀🥜 dobre;
- 🍞 z umiarem;
- 🍟 ograniczaj;
- 🍩 odradzane.

Ocena posiłku to średnia ważona kaloriami składników. Gdy posiłek ma ponad 15 g cukrów wolnych, ocena spada do „ograniczaj”.

**Historia:** wykresy z 14 dni: kalorie, warzywa i owoce, cukry wolne, płyny, waga.

**Profil:** dane, nawodnienie (🔔 powiadomienia, 📅 przypomnienia w kalendarzu), 📸 klucze AI, 🎨 wygląd, 📲 instalacja, 💾 kopia danych.

**AI bez ustawień technicznych:**
- model jest wybierany automatycznie: najnowszy stabilny Gemini Flash albo Claude Haiku. Gdy dostawca wycofa model, aplikacja sama przełączy się na nowy;
- najpierw używane są klucze Gemini, potem Claude. Po wyczerpaniu limitu aplikacja przechodzi do następnego klucza;
- analiza startuje od razu po zrobieniu zdjęcia (zdjęcie zmniejszone do 768 px, krótkie „myślenie” modelu).

**Wygląd:** 9 gotowych zestawów, tryb jasny/ciemny/auto, a w „Kolory i tła” 7 palet, 10 teł i wyciszenie tła.

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
