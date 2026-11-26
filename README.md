# Nawyki i Talerz 4.2

Elastyczne nawyki (Mini / Plus / Elita, pamiętnik, cele, projekty, mentor AI) i Talerz (licznik kalorii ze zdjęć, płyny, kroki, waga) w jednej aplikacji.

## Co daje połączenie
- **Zakładka 🍽️ Jedzenie**: cały Talerz z podzakładkami Dziś, Historia i Profil.
- **Nawyki ⚡ zaliczają się same** z danych Jedzenia. Na start:
  - „Wypicie 2 litrów wody”: płyny 1000 / 1500 / 2000 ml;
  - „Owoc i warzywo”: 100 / 250 / 400 g;
  - „Spacer (kroki)”: 4000 / 7000 / 10 000 kroków;
  - „Szklanka wody rano / białko”: 50 / 75 / 100% dziennej normy białka.
  W „✏️ Edytuj nawyki” możesz zmienić progi albo podpiąć inny nawyk do: wody, warzyw, kroków, cukrów wolnych lub „jedzenie zapisane i w limicie”. Nawyk zawsze możesz też zaznaczyć ręcznie, a liczy się wyższy z dwóch poziomów.
- **Karta Jedzenia na ekranie Dziś**: kalorie / limit, płyny, warzywa i kroki, z szybkimi przyciskami 📷 Posiłek, 💧 Woda i 👟 Kroki. Posiłek i wodę dodasz też przyciskiem ＋.
- **Mentor AI widzi jedzenie, płyny, kroki i wagę.** Możesz to wyłączyć w Ustawieniach → Prywatność.
- **Postęp**: karta „Jedzenie – ostatnie 7 dni” (dni w limicie, cel płynów, warzywa, kroki, zmiana wagi).
- **Wspólne klucze AI** (Gemini i Claude): klucz dodany w jednym miejscu działa w obu częściach.
- **Kopia zapasowa** (Więcej → Kopie i dane) zawiera także dane Jedzenia.

## Nowości w 4.2: zakładka Mentor
- **Wszystkie rozmowy z AI są w zakładce Mentor.** Pozostałe zakładki pokazują same fakty. Przyciski „🧭 Omów z mentorem” (pamiętnik), „🧭 Co zjeść jutro?” (wieczorny bilans) i „🧭 Zapisz i zapytaj mentora o zdjęcie” (wpis) przenoszą do Mentora i tam zadają pytanie. Wcześniejsze odpowiedzi AI z pamiętnika są w archiwum rozmów.
- **Pole pytania jest na górze.** Zaraz pod nim widać „Mentor myśli…”, a potem dzisiejszą rozmowę, z najnowszą wymianą u góry.
- **Rozmowy z poprzednich dni trafiają do zwiniętego „🗂️ Archiwum rozmów”**, podzielonego na dni.
- **Naprawiony błąd:** po odpowiedzi mentora przycisk „Wyślij” zostawał nieaktywny. Tekst wpisany w trakcie czekania już nie znika.
- **🔊 Czytanie na głos.** Gdy pytanie jest podyktowane (🎤), mentor czyta odpowiedź, żeńskim głosem, jeśli telefon taki ma. Przy każdej odpowiedzi jest 🔊 (przeczytaj) i 📋 (kopiuj). Tryb (gdy pytam głosem, zawsze, nigdy), głos i tempo ustawisz w Ustawienia → Mentor AI.
- Gdy odpowiedź nie przyjdzie (np. brak internetu), pojawia się przycisk „Ponów”.

## Nowości w 4.1
- **⚡ Szybko dodaj posiłek**: w „＋ Posiłek” na górze są ⭐ ulubione i posiłki, które jesz często, z wyborem porcji (½, 1, 1½, 2). Gwiazdka ☆ przy posiłku na liście dodaje go do ulubionych.
- **Napoje w kaloriach**: przy „Zjedzone” widać, ile kalorii pochodzi z napojów. Napoje zawsze się wliczały, teraz jest to widoczne.
- **Trend wagi**: średnia z 7 dni (przerywana linia na wykresie), tempo w kg na tydzień i przewidywany czas do celu.
- **Nawyk ⚡ białko**: „Szklanka wody rano / białko” zalicza się sam: 50 / 75 / 100% dziennej normy białka.
- **🌆 Wieczorny bilans o 18:00**: karta na ekranie Dziś i powiadomienie. Pokazuje, ile zostało kalorii, ile brakuje płynów, warzyw, białka i kroków oraz które serie warto chronić.
- **🔥 Ochrona serii o 21:00**: przypomnienie, gdy nawyk z serią 3+ dni nie jest jeszcze dziś zaliczony.
- **🎯 Cel żywieniowy tygodnia**: jeden cel (np. 400 g warzyw przez 5 dni), liczony sam z danych Jedzenia.
- **🧭 Co zjeść jutro?**: mentor analizuje posiłki z ostatnich dni i proponuje jadłospis z listą zakupów.
- **🧠 Podpowiedź mentora w pamiętniku**: analiza odpowiedzi na pytania dnia pod kątem zdrowego myślenia. Przegląd tygodnia ma też sekcje o jedzeniu i myśleniu.
- **Moduły**: post przerywany, rytm dnia i projekty są ukryte. Włączysz je w Ustawienia → 🧩 Moduły, a ich dane zostają.
- Przypomnienia (bilans, serie, pamiętnik, eksport do kalendarza) są teraz w Ustawienia → 🔔 Przypomnienia.

## Uruchomienie na GitHub Pages
1. Na koncie **motywacjakornaszka-svg** utwórz nowe repozytorium, np. `nawyki-talerz`, z widocznością **Public**.
2. Wgraj **wszystkie pliki z tego folderu** do głównego folderu repozytorium, bez podfolderu.
3. Wejdź w Settings → Pages → Source: „Deploy from a branch”, wybierz gałąź `main`, folder `/ (root)` i kliknij Save.
4. Po 1–2 minutach aplikacja będzie pod adresem `https://motywacjakornaszka-svg.github.io/nawyki-talerz/`. Otwórz go w Chrome na telefonie i zainstaluj (⋮ → Zainstaluj aplikację).

## Twoje dane przejdą same
Przeglądarka przechowuje dane osobno dla każdego adresu bazowego. Adres bazowy to tu `motywacjakornaszka-svg.github.io`, a nie folder repozytorium. Stare aplikacje i nowa mają ten sam adres bazowy, więc nowa aplikacja **od razu widzi** Twoje nawyki, pamiętnik, zdjęcia, posiłki, wagę i klucze AI. Nie trzeba niczego przenosić.

Warunek: używasz **tej samej przeglądarki na tym samym telefonie**. Dla bezpieczeństwa przed pierwszym uruchomieniem zrób kopie w starych aplikacjach (Nawyki: Raport → 💾 Kopia JSON, Talerz: Profil → Eksportuj dane).

Po przejściu korzystaj już tylko z nowej aplikacji. Stare możesz zostawić na jakiś czas jako zapas, bo pracują na tych samych danych.

## Aktualizacje
Po zmianie plików podbij `VERSION` w `sw.js` (np. `nawyki-talerz-v4.2-2`). Zamknij aplikację i otwórz ją ponownie.

## Pliki
- `index.html`, `app.js`, `data.js`, `style.css`: Nawyki (aplikacja główna);
- `talerz.html`: Jedzenie (Talerz), wyświetlane w zakładce;
- `sw.js`: działanie offline;
- `manifest.webmanifest`: instalacja i skróty z ikony (Dodaj posiłek / Dodaj wodę);
- ikony.

Klucze API zostają tylko na telefonie i nie trafiają do repozytorium ani do kopii. **Nigdy nie wpisuj klucza do plików.**
