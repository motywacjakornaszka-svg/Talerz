/* Dane startowe aplikacji Elastyczne nawyki (takie same jak w wersji 2) */
var NAW = {
CATS: {z:["Zdrowie","💪"], m:["Umysł","🧠"], r:["Relacje","🤝"], d:["Duch","🕊️"]},
LV: ["—","Mini","Plus","Elita"],
DEF: [
["w1","z","Szklanka wody rano / białko","rano"],["w2","z","Ćwiczenia fizyczne (ruch)","okno treningowe"],["w3","z","Spacer (kroki)","w ciągu dnia"],
["w4","z","Prysznic zimny / kontrastowy","rano"],["w5","z","Reset wzroku (patrzenie w dal)","co 45 min w pracy"],["w6","z","Zielona herbata","przedpołudnie"],
["w7","z","Owoc i warzywo","do posiłków"],["w8","z","Wypicie 2 litrów wody","do 16:00"],["w9","z","Różne sposoby siedzenia",""],["w10","z","Leżenie na podłodze 5 min","po ćwiczeniach"],
["m1","m","Słuchanie audiobooka","w drodze / spacer"],["m2","m","Czytanie książki / nauka hiszpańskiego","wieczorem"],["m3","m","Angielski (audiobook / słownictwo)","w ciągu dnia"],
["m4","m","Planowanie kolejnego dnia i podsumowanie","przed snem"],["m5","m","Czytanie na głos 5 min",""],["m6","m","Pisanie bezwzrokowe 5 min",""],
["r1","r","Pochwała / wdzięczność / coś dla innych","codziennie"],["r2","r","Telefon do bliskiej osoby / spotkanie","popołudnie"],
["d1","d","Tekst dzienny na głos","rano lub wieczorem"],["d2","d","Czytanie Biblii","wieczorem / rano"],["d3","d","Przygotowanie się do zebrania","popołudniu"],["d4","d","Studium osobiste","w ciągu dnia"]
],
SIT: [["Krążenie głową i rozciąganie szyi","Siedząc prosto na krześle","Siad skrzyżny / klęk"],["Mobilizacja nadgarstków i przedramion","Siedząc przy biurku","W klęku, docisk dłoni do maty"],
["Przyciąganie kolana do klatki + ruch stopy","Siedząc na krześle","Leżenie na plecach"],["Przyciąganie kolana i wyprost nogi","Siedząc na krześle","Leżenie na plecach lub siedząc"],
["„Czwórka” (stopa na kolano + skłon)","Siedząc na krześle","Leżenie, chwyt pod udem"],["Przekładanie kolan z boku na bok 90/90","Siedząc na brzegu krzesła","Leżenie tyłem, ręce w bok"],
["Wypchnięcie bioder (mostek)","Spięcie pośladków w siadzie","Most biodrowy w leżeniu"],["Mostek jednonóż / spięcie pośladka","Pięta na kolano w siadzie","Wypychanie bioder, pięta na kolanie"],
["Unoszenie nogi w bok","W siadzie na krześle","Podpora bokiem / leżenie na boku"],["Stół (odwrócony podpór)","Dłonie na blacie biurka","Odwrócony podpór w siadzie na ziemi"],
["Stół na jednej ręce z rotacją tułowia","Oparcie o blat biurka","W siadzie na ziemi"],["Koci grzbiet","Dłonie na blacie biurka","Klęk podparty"],
["Odchylanie ręki do tyłu z rotacją","Siedząc na krześle","W klęku podpartym"],["Ukłon japoński (pozycja dziecka)","Skłon do ud, ręce na blacie","Siad na piętach, czoło do maty"],
["Pies z głową w dół i w górę","Stojąc z oparciem o biurko","Podpór przodem / klęk"]],
STD: ["Pies z głową w dół (dłonie na blacie)","Szybkie oddychanie przeponowe","Krążenie głową i na boki","Machanie rękami (koła i nożyce)","Przeciąganie rąk do góry",
"Odchylanie ręki do tyłu z rotacją klatki","Skłon boczny (ręka na głowę, druga do kolana)","Krążenie biodrami","Kossak (przypad w rozkroku)","Przyciąganie kolana do klatki + ruch stopy",
"Przyciąganie kolana i wyprost nogi","Krążenie stopami na jednej nodze","Pchanie kolana nad palce (Achilles)","Stawanie na palcach","Wykrok i przyklęk","Przysiad i ugięcie kolan",
"Przysiad ze skłonem tułowia","Skłony o prostych plecach","Jaskółka","Deska przy ścianie / blacie biurka","Pajacyki / podskoki w miejscu"],
RY: [["06:00","Wypij 1–2 szklanki wody przed kawą i telefonem","Rozcieńcza krew po nocy, pobudza jelita"],["06:15","10 minut spaceru / poranne światło","Synchronizuje zegar biologiczny"],
["07:00","Śniadanie bogate w białko i tłuszcze, kawa dopiero po","Stabilizuje glukozę i energię"],["07:00–15:00","Co 30–45 min: 90 s resetu (oddechy, wzrok)","Chroni plecy, rozluźnia oczy"],
["12:30","Spacer po posiłku, ok. 10 min","Zapobiega senności"],["15:00","Dekompresja: 5 min płasko na twardej podłodze, nogi ugięte","Odciąża krążki międzykręgowe"],
["15:00–17:00","Okno treningowe: ruch / nauka / uważność","Najniższe ryzyko kontuzji"],["16:00","Zakończ picie większości płynów (ok. 70% dziennej wody)","Głębszy sen"],
["do 19:00","Lekka kolacja o stałej porze","Odciąża układ pokarmowy"],["20:30","Ekrany off na 90 minut przed snem","Więcej melatoniny"],
["przed snem","Nitkowanie zębów, płukanie gardła 30 s, nucenie 60 s","Wycisza układ nerwowy"]],
QN: ["Mniejsze kroki, większa ciągłość.","Jutrzejsze rezultaty to dzisiejsze nawyki.","Nie musisz być doskonały – wystarczy, że będziesz konsekwentny.","Sukces to suma małych wysiłków powtarzanych dzień po dniu.","Dyscyplina to po prostu wybór między tym, czego chcesz teraz, a tym, czego chcesz najbardziej.","Nie wygrywasz celu – wygrywasz systemem, który codziennie realizujesz.","Każda wykonana powtórka to głos oddany na osobę, którą chcesz się stać.",
"Twoja jedyna prawdziwa konkurencja to osoba, którą byłeś wczoraj.","Autentyczna siła rośnie wtedy, gdy przestajesz szukać potwierdzenia na zewnątrz.","Twoje przekonania tworzą Twoją rzeczywistość – wybieraj je uważnie.","Świadomość to pierwszy krok do zmiany; odwaga to krok drugi.","Zadbaj o swój umysł tak, jak dbasz o swój dom.","Siła nie wynika z tego, co potrafisz zrobić, ale z pokonywania rzeczy, które kiedyś wydawały się niemożliwe.",
"Kto chce, szuka sposobu. Kto nie chce, szuka powodu. — Sokrates","Podróż licząca tysiąc mil zaczyna się od pierwszego kroku. — Lao Tzu","Nie musisz być świetny, żeby zacząć, ale musisz zacząć, żeby być świetnym. — Les Brown","To, co robisz codziennie, ma większe znaczenie niż to, co robisz od czasu do czasu. — Gretchen Rubin","Dyscyplina jest mostem między celami a ich osiągnięciem. — Jim Rohn","Najlepszym momentem na posadzenie drzewa było 20 lat temu. Drugim najlepszym momentem jest teraz. — Przysłowie chińskie",
"Skup się na procesie, nie na wyniku.","Dziś robię to, czego innym się nie chce, by jutro żyć tak, jak inni nie mogą.","Elastyczność w działaniu, stałość w dążeniu do celu.","Zadbaj o ciało, umysł i ducha.","Każdy dzień to nowa czysta karta.","Cierpliwość to też siła."],
QD: ["Trzymaj się liny Mini! 🌱","Nigdy nie dopuszczaj do dwóch dni „Brak” pod rząd.","Mini to Twoja lina ratunkowa: poniżej 2 minut, a chroni wypracowane połączenia.","Plus to złoty środek, który buduje stabilne przyzwyczajenie.","Elita to pełne zaangażowanie w dni pełne energii.","Elastyczny nawyk eliminuje paraliż decyzyjny.","Sztywne plany zawodzą z braku elastyczności.","Mini jest śmiesznie łatwe, a utrzymuje ścieżki neuronowe."],
/* pytania dnia do pamiętnika: [dzień, wdzięczność/relacje, rozwój/jutro] */
PQ: [
["Co dziś poszło najlepiej?","Co dziś było najtrudniejsze i jak sobie z tym poradziłem?","Jaka jedna chwila z dzisiaj zostanie mi w pamięci?","Kiedy dziś miałem najwięcej energii, a kiedy najmniej?","Co dziś zrobiłem tylko na poziomie Mini – i dlaczego?","Co mnie dziś zaskoczyło?","Jaka myśl wracała do mnie dziś najczęściej?","W czym dziś byłem konsekwentny?","Co dziś odpuściłem i czy słusznie?","Jak się dziś czułem – w jednym słowie i dlaczego?"],
["Za co jestem dziś wdzięczny?","Komu dziś pomogłem albo komu mogę jutro pomóc?","Kto dziś sprawił mi radość?","Jaką dobrą rzecz ktoś dla mnie dziś zrobił?","Kogo dawno nie odwiedziłem lub nie zadzwoniłem?","Za co mogę dziś pochwalić siebie?","Co dobrego wydarzyło się w mojej rodzinie?","Jaki tekst lub myśl duchowa mnie dziś poruszyła?"],
["Czego się dziś nauczyłem?","Jaki pomysł przyszedł mi dziś do głowy?","Co jutro zrobię inaczej?","Jaki jeden mały krok zrobię jutro w stronę celu?","Jakie pytanie chcę sobie zadać na przyszłość?","Co mnie dziś rozpraszało i jak to ograniczyć?","Który nawyk jutro wzmocnię do poziomu Plus?","Co chcę zapamiętać z dzisiejszej lektury lub nauki?","Co mogę uprościć, żeby łatwiej trzymać nawyki?","Gdybym był swoim mentorem – jaką radę dałbym sobie na jutro?"]
],
ST: {idea:["💡","Pomysł"], plan:["📋","Do zrobienia"], doing:["🚧","W toku"], hold:["⏸️","Wstrzymany"], done:["✅","Zrobione"]},
ET: {note:["📝","Notatka"], grat:["🙏","Wdzięczność"], q:["❓","Pytanie / przemyślenie"], idea:["💡","Pomysł"]},
PROV: {
 gemini:{n:"Google Gemini", key:"https://aistudio.google.com/apikey", docs:"https://ai.google.dev/gemini-api/docs/models", model:"gemini-flash-latest", vision:1, audio:1,
   note:"Polecany na start: darmowy limit, jeden klucz obsługuje tekst, zdjęcia i nagrania głosowe. Klucz zaczyna się od „AQ.” (nowe klucze) albo „AIza” (starsze). Gdy główny model jest przeciążony, aplikacja sama użyje zapasowego."},
 claude:{n:"Anthropic Claude", key:"https://platform.claude.com/settings/keys", docs:"https://platform.claude.com/docs/en/about-claude/models/overview", model:"claude-sonnet-5-5", vision:1, audio:0,
   note:"Bardzo dobry jako mentor i do analizy pamiętnika. Płatny (doładowanie konta). Nie przepisuje nagrań – do tego dodaj Gemini, Groq lub OpenAI."},
 openai:{n:"OpenAI (ChatGPT)", key:"https://platform.openai.com/api-keys", docs:"https://platform.openai.com/docs/models", model:"gpt-5.4-mini", tmodel:"whisper-1", base:"https://api.openai.com/v1", vision:1, audio:1,
   note:"Tekst, zdjęcia i przepisywanie nagrań. Płatny (doładowanie konta)."},
 groq:{n:"Groq", key:"https://console.groq.com/keys", docs:"https://console.groq.com/docs/models", model:"llama-3.3-70b-versatile", tmodel:"whisper-large-v3-turbo", base:"https://api.groq.com/openai/v1", vision:0, audio:1,
   note:"Darmowy limit i bardzo szybki. Świetny do przepisywania nagrań (Whisper). Domyślny model nie analizuje zdjęć."},
 openrouter:{n:"OpenRouter", key:"https://openrouter.ai/keys", docs:"https://openrouter.ai/models", model:"openrouter/auto", base:"https://openrouter.ai/api/v1", vision:1, audio:0,
   note:"Jeden klucz do setek modeli różnych firm, także darmowych (z dopiskiem :free)."}
}
};
