# SERVQUAL la ASE

Aplicație web pentru studenții din anul 2, la disciplina *Managementul calității*. Studenții evaluează calitatea serviciilor ASE din propria experiență, cu instrumentul SERVQUAL (22 de enunțuri, 5 dimensiuni). Un scurt parcurs prin momentele anului universitar îi ajută să-și amintească experiența reală. Răspunsurile sunt **anonime**: se cere doar grupa.

Durata pentru student: aproximativ 50 de minute, individual. Profesorul are o zonă separată, gândită pentru a fi proiectată în clasă la final.

## Ce conține

| Fișier | Rol |
|---|---|
| `index.html` | Aplicația studentului |
| `profesor.html` | Zona profesorului (concluzii, rezultate pe grupe, enunțuri, momentele anului, export) |
| `content.js` | Conținutul: cele 22 de enunțuri, momentele anului, prezentarea instrumentului, ghidul de dezbatere |
| `config.js` | Configurare: adresa scriptului Google, opțional linkul unui Google Form |
| `demo.js` | Date demonstrative fictive (48 de răspunsuri, 3 grupe) |
| `Code.gs` | Scriptul care primește rezultatele în foaia ta Google Sheets (nu trebuie urcat pe GitHub) |
| `style.css`, `core.js`, `app.js`, `teacher.js` | Aspectul, calculele SERVQUAL și logica celor două pagini |

Toate fișierele stau la același nivel, fără subfoldere.

## Fluxul studentului

1. **Grupa** (fără nume).
2. **Instrumentul**: SERVQUAL pe scurt, cele 5 dimensiuni, cum se citește rezultatul.
3. **Rolul tău**: studentul nu joacă un personaj; e chiar beneficiarul serviciilor ASE.
4. **Așteptările** pentru o universitate excelentă (22 de enunțuri, scala 1–5), apoi **importanța** celor 5 dimensiuni (100 de puncte).
5. **Anul tău la ASE**: 7 momente (începutul anului, secretariat, cursuri și seminare, platforme online, spații, sesiune, servicii pentru studenți). La fiecare, o întrebare de amintire, o notă de la 1 la 5 sau „nu am avut contact”, și opțional un exemplu scris.
6. **Percepțiile** despre ASE (aceleași 22 de enunțuri) și două întrebări globale (mulțumire, recomandare 0–10).
7. **Rezultatele proprii**: IPCS, radar, discrepanțe pe dimensiuni, cele mai mari deficite.
8. **Trimitere** către profesor, cu un singur buton (sau, ca rezervă, printr-un cod de rezultat).

După începerea momentelor anului, așteptările nu mai pot fi modificate; după afișarea rezultatelor, nici percepțiile.

## Zona profesorului (`profesor.html`)

File: Concluzii pentru clasă, Sinteză, Pe grupe, Enunțuri, Prioritizare, Momentele anului, Nevoi și acțiuni, Răspunsuri, Dezbatere, Export. Butonul **Mod prezentare** mărește textul și ascunde panoul de încărcare.

- **Concluzii pentru clasă**: IPCS-ul grupei, radarul așteptări față de percepții, unde rămâne ASE în urmă, ce a mers bine, momentele adevărului, enunțul la care experiențele diferă cel mai mult, ce ar putea face ASE și concluzia SERVQUAL.
- **Pe grupe**: diferența P − A pe fiecare dimensiune și IPCS pentru fiecare grupă.
- **Momentele anului**: media pe fiecare moment, procentul notelor de 1–2, procentul celor care nu au avut contact și exemplele scrise (anonime).
- **Răspunsuri**: fiecare răspuns individual, fără nume.
- **Dezbatere**: întrebări pentru discuție, inclusiv „Sunteți clienți ai ASE? Interni sau externi?”.

Pentru a vedea cum arată înainte de oră, apasă **Încarcă date demonstrative**.

## Publicare pe GitHub Pages

1. Creează un depozit nou pe GitHub (separat de cel pentru studiul de caz Calitas). Din **Add file → Upload files**, selectează toate fișierele deodată și apasă **Commit changes**.
2. **Settings → Pages → Deploy from a branch → `main` / root → Save.**
3. După un minut, aplicația este la `https://CONTUL-TAU.github.io/NUME-DEPOZIT/`, iar zona profesorului la `.../profesor.html`.

Dacă ambele aplicații (Calitas și ASE) stau pe același cont GitHub, ele nu își amestecă datele: fiecare folosește propria memorie în browser și propria cheie.

## Colectarea răspunsurilor: direct în Google Sheets

Folosește o **foaie Google Sheets nouă**, separată de cea pentru Calitas, și un **cont Google personal** (Gmail). Conturile instituționale blochează adesea opțiunea „Oricine” de la pasul 5.

1. Creează o foaie Google Sheets nouă, de exemplu „SERVQUAL ASE, rezultate”.
2. În foaie: **Extensii → Apps Script**. Șterge tot ce e în editor, lipește conținutul fișierului `Code.gs` (din acest pachet, nu cel de la Calitas) și salvează.
3. Alege funcția **setup** și apasă **Rulează**. La autorizare: contul tău, apoi **Avansat → Accesează proiectul (nesigur)** și **Permite**.
4. În **Jurnalul de execuție** apare **cheia profesorului**. Noteaz-o.
5. **Implementare → Implementare nouă →** rotița → **Aplicație web**. *Execută ca*: **Eu**; *Cine are acces*: **Oricine**. Copiază adresa care se termină în `/exec`.
6. În `config.js`, lipește adresa la `endpoint`, între ghilimele, și urcă `config.js` din nou pe GitHub.
7. În zona profesorului introdu cheia o singură dată și apasă **Încarcă rezultatele**. Rezultatele se actualizează apoi singure la 30 de secunde.

Înainte de oră, fă o probă: completează tu aplicația, trimite, apoi verifică foaia și zona profesorului.

Foaia **Raspunsuri** are câte un rând pe răspuns: grupa, IPCS, A1–A22, P1–P22, importanțele, codul de rezultat și datele complete. Coloanele de nume rămân goale. Dacă un student retrimite de pe același dispozitiv, rândul se actualizează, nu se dublează.

**Plasa de siguranță**: dacă trimiterea nu merge, studentul copiază codul de rezultat (începe cu `CAL1.`) și ți-l trimite; tu îl lipești în zona profesorului. Fără script (`endpoint` gol), aplicația folosește doar codurile, eventual printr-un Google Form al cărui link îl pui la `linkFormular`.

## Modificarea conținutului

Totul se află în `content.js`: enunțurile (`{S}`, `{s}`, `{G}` devin «ASE» sau «o universitate excelentă»), momentele anului, textul instrumentului și întrebările de dezbatere.

## Limite și presupuneri

- **Anonimatul** este real în aplicație și în foaie (nu se cere și nu se trimite niciun nume), dar într-o grupă mică, combinația de răspunsuri și exemple scrise poate face pe cineva recognoscibil. De aceea, exemplele scrise apar doar ca listă, fără legătură vizibilă cu grupa, în fila Momentele anului.
- Același student poate completa de două ori de pe dispozitive diferite; aplicația nu are cum să împiedice asta fără identificare.
- **IPCS** este media diferențelor (percepție − așteptare) pe cele 5 dimensiuni, ca în studiul de caz Calitas.
- Rezultatele descriu percepțiile unei grupe de studenți, nu o evaluare reprezentativă a ASE. Merită spus explicit în clasă.
- Aplicația a fost testată automat (flux complet, trimitere către scriptul `Code.gs` cu servicii Google simulate, coduri de rezultat, zona profesorului) și vizual, în Chromium, pe calculator și pe telefon. Nu a fost testată pe un cont Google real și nici în Safari pe iPhone.
