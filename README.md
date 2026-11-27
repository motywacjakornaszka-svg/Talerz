# Nawyki i Talerz 4.5

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

## Nowości w 4.5: rozciąganie w Rozruchu
- **🧘 Rozciąganie** to nowy kafelek w Więcej → Rozruch. Zestaw ma 10 ćwiczeń (ok. 9 min) na:
  - biodra: wykrok w klęku, czwórka na plecach;
  - kręgosłup: koci grzbiet – krowa, skręt w leżeniu;
  - tylną taśmę: tył uda z ręcznikiem, swobodny zwis w skłonie;
  - klatkę i powięź piersiową: otwarcie w drzwiach, leżenie na zwiniętym ręczniku;
  - ramiona: ramię przed klatką, triceps za głową.
- **Każde ćwiczenie ma rysunek** z zaznaczonym rozciąganym miejscem i kierunkiem ruchu, opis „jak wykonać” i łatwiejszą wersję (przycisk „Łatwiej”).
- **Ćwiczenia „na obie strony”** dają w połowie czasu sygnał dźwiękowy i wibrację: „↔️ Zmień stronę”.
- **📚 Katalog 11 dodatkowych ćwiczeń**, dodawanych jednym dotknięciem: pozycja dziecka, motyl, łydka przy ścianie, przód uda, sfinks, skłon w bok, nawlekanie igły, anioły przy ścianie, głęboki przysiad, szyja, nadgarstki.
- **W edycji Rozruchu** każde ćwiczenie (także Twoje z fazy siedzącej i stojącej) może dostać rysunek i znacznik „obie strony”. Możesz też wybrać, który nawyk zalicza rozciąganie.
- Twoje ćwiczenia i ich zmiany (nazwy, opisy, czasy, kolejność, uwagi, rysunki) są w kopii zapasowej i wracają po jej wczytaniu.

## Nowości w 4.4: aktualizacje same się wczytują
- Aplikacja sprawdza, czy jest nowa wersja, przy starcie, przy każdym powrocie do niej i co 30 minut. Gdy ją znajdzie, przeładowuje się sama i pokazuje „✨ Zaktualizowano do wersji …”.
- Gdy akurat coś piszesz albo mentor odpowiada, aplikacja się nie przeładowuje. Pokazuje baner „Nowa wersja jest gotowa – Odśwież”.
- Więcej → stopka „🔄 Sprawdź aktualizację” i Kopie i dane → „🧹 Wczytaj od nowa”. Ten drugi przycisk usuwa tylko zapamiętane pliki programu, dane zostają.
- Nową wersję rozpoznaje numer `VER` na początku `app.js`. Przy każdej zmianie podbij go, a dla porządku także `VERSION` w `sw.js`.

## Poprawki w 4.3.1
- Kopia zapasowa nie zawiera żadnych kluczy API. Lista kluczy usuniętych w Ustawieniach zapisuje teraz tylko ich skrót, z którego nie da się odtworzyć klucza. Wcześniej zapisywała pełne klucze.
- Usunięty klucz nie wraca już po ponownym uruchomieniu z Jedzenia.

## Nowości w 4.3: diagnostyka kluczy AI
- **🔧 Diagnostyka AI** (Więcej → Diagnostyka AI albo Ustawienia → „Test i diagnostyka kluczy”) sprawdza każdy klucz z obu części, Mentora i Jedzenia, krok po kroku:
  - format klucza;
  - połączenie i to, czy dostawca przyjmuje klucz;
  - prawdziwą odpowiedź modelu (który model odpowiedział i jak szybko);
  - obsługę zdjęć i nagrań.
- Każdy problem ma wyjaśnienie po polsku i podpowiedź „Co zrobić”. Rozpoznawane problemy to m.in.: zły lub usunięty klucz, wyczerpany limit dzienny lub chwilowy (dla Gemini z godziną odnowienia), brak środków, przeciążone serwery, blokada regionu lub VPN, ograniczenia klucza i brak internetu.
- Udany test zapamiętuje działający model i odblokowuje w Jedzeniu klucz błędnie oznaczony jako nieprawidłowy.
- **📋 Ostatnie zapytania AI**: wspólny dziennik Mentora i Jedzenia (czas, dostawca, model, błąd).
- **📋 Kopiuj raport** kopiuje wyniki bez pełnych kluczy, do wklejenia w wiadomości z prośbą o pomoc.
- Gdy mentor nie odpowie, przy „Ponów” jest też przycisk „🔧 Sprawdź klucze”.

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
Po wgraniu nowych plików aplikacja zaktualizuje się sama przy najbliższym otwarciu (od wersji 4.4). Przy zmianach w plikach podbij `VER` w `app.js` i `VERSION` w `sw.js`. Przejście z wersji starszej niż 4.4 wymaga jednego ręcznego zamknięcia i otwarcia aplikacji.

## Pliki
- `index.html`, `app.js`, `data.js`, `style.css`: Nawyki (aplikacja główna);
- `talerz.html`: Jedzenie (Talerz), wyświetlane w zakładce;
- `sw.js`: działanie offline;
- `manifest.webmanifest`: instalacja i skróty z ikony (Dodaj posiłek / Dodaj wodę);
- ikony.

Klucze API zostają tylko na telefonie. Nie trafiają do repozytorium ani do kopii zapasowej. Po przeniesieniu na nowy telefon wklej klucz ponownie: jeden klucz Gemini wystarczy dla obu części. **Nigdy nie wpisuj klucza do plików.**
