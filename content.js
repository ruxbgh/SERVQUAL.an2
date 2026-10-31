/* Conținutul aplicației: evaluarea ASE de către studenți, cu instrumentul SERVQUAL.
   Studenții evaluează din propria experiență; momentele anului doar îi ajută să-și amintească.
   Tokenii din enunțuri: {S} = subiect cu majusculă, {s} = subiect în interiorul propoziției,
   {G} = forma folosită după un substantiv („Personalul ASE” / „Personalul unei universități excelente”). */
window.CALITAS = {
  versiune: "ase-1.0",

  org: {
    nume: "ASE",
    per: { S: "ASE", s: "ASE", G: "ASE" },
    exp: { S: "O universitate excelentă", s: "o universitate excelentă", G: "unei universități excelente" }
  },

  dimensions: [
    { id: "T", nume: "Tangibilitate", scurt: "Tangibilitate", items: [1, 2, 3, 4],
      desc: "Ce se vede: săli, echipamente, spații de studiu, aspectul personalului și al materialelor.",
      iso: "ISO 9001: 7.1.3 Infrastructura, 7.1.4 Mediul pentru operarea proceselor" },
    { id: "F", nume: "Fiabilitate", scurt: "Fiabilitate", items: [5, 6, 7, 8, 9],
      desc: "Capacitatea de a face ce s-a promis: corect, fără erori și la timp.",
      iso: "ISO 9001: 8.5.1 Controlul furnizării serviciilor, 8.7 Ieșiri neconforme, 10.2 Acțiuni corective" },
    { id: "R", nume: "Capacitate de răspuns", scurt: "Capac. de răspuns", items: [10, 11, 12, 13],
      desc: "Disponibilitatea de a ajuta studenții, de a-i informa și de a le răspunde repede.",
      iso: "ISO 9001: 7.4 Comunicare, 8.2.1 Comunicarea cu clienții, 8.5.1 Controlul furnizării" },
    { id: "S", nume: "Siguranță", scurt: "Siguranță", items: [14, 15, 16, 17],
      desc: "Competența, corectitudinea și politețea personalului: cât de multă încredere îți inspiră.",
      iso: "ISO 9001: 7.2 Competența, 7.3 Conștientizarea, 8.5.1 Controlul furnizării" },
    { id: "E", nume: "Empatie", scurt: "Empatie", items: [18, 19, 20, 21, 22],
      desc: "Atenția acordată fiecărui student, programul convenabil și înțelegerea nevoilor lui.",
      iso: "ISO 9001: 8.2.1 Comunicarea cu clienții, 9.1.2 Satisfacția clienților" }
  ],

  /* 22 de enunțuri SERVQUAL pentru o universitate.
     d = dimensiune, s = etichetă scurtă, a = măsură sugerată (zona profesorului) */
  items: [
    { n: 1, d: "T", s: "Echipamente moderne", t: "{S} dispune de echipamente moderne (videoproiectoare, calculatoare, laboratoare, rețea Wi-Fi).",
      a: "Inventarul echipamentelor din săli, cu un plan de înlocuire și un canal rapid de semnalare a defecțiunilor." },
    { n: 2, d: "T", s: "Spații curate și plăcute", t: "Spațiile {G} (săli de curs, bibliotecă, spații de studiu, grupuri sanitare) sunt curate și plăcute.",
      a: "Verificări periodice ale sălilor și grupurilor sanitare, cu responsabil pe clădire; mai multe spații de studiu." },
    { n: 3, d: "T", s: "Ținuta personalului", t: "Personalul {G} (cadre didactice și personal administrativ) are o prezentare îngrijită.",
      a: "Reguli simple de prezentare și ecusoane la ghișee, ca studentul să știe cu cine vorbește." },
    { n: 4, d: "T", s: "Materiale clare", t: "Materialele {G} (site, fișele disciplinelor, anunțuri, ghiduri) sunt clare și bine prezentate.",
      a: "Revizuirea site-ului și a anunțurilor împreună cu studenții; un ghid al studentului actualizat anual." },
    { n: 5, d: "F", s: "Termene respectate", t: "Când {s} promite un termen (publicarea orarului, a notelor, eliberarea unui act), acesta este respectat.",
      a: "Termene publicate pentru fiecare serviciu (acte, note, orar), monitorizate și raportate studenților." },
    { n: 6, d: "F", s: "Interesul conducerii", t: "Când un student are o problemă, conducerea {G} manifestă un interes real să o rezolve.",
      a: "Un canal clar de sesizări, cu responsabil și termen de răspuns; feedback obligatoriu către student." },
    { n: 7, d: "F", s: "Obligații la timp, fără erori", t: "{S} își îndeplinește obligațiile la timp și evită erorile (în orar, cataloage, documente).",
      a: "Verificare dublă la orar și cataloage înainte de publicare; analiza erorilor repetate." },
    { n: 8, d: "F", s: "Activități la ora programată", t: "La {s}, cursurile și seminarele încep la ora programată și nu se anulează fără anunț.",
      a: "Regulă de anunțare a modificărilor de orar cu cel puțin 24 de ore înainte, pe un canal unic." },
    { n: 9, d: "F", s: "Servicii fără erori", t: "{S} insistă pe servicii fără erori (note trecute corect, acte corecte, informații corecte).",
      a: "Liste de verificare pentru actele eliberate și pentru trecerea notelor; corectarea rapidă a erorilor semnalate." },
    { n: 10, d: "R", s: "Anunță exact când", t: "Personalul {G} anunță exact când vor avea loc activitățile (examene, restanțe, înscrieri, eliberarea actelor).",
      a: "Un calendar unic al anului universitar, publicat la început și actualizat, cu notificări pentru schimbări." },
    { n: 11, d: "R", s: "Servicii prompte", t: "Personalul {G} oferă servicii prompte studenților (răspunde la e-mailuri, rezolvă cereri).",
      a: "Termen-țintă de răspuns la e-mailuri și cereri; cereri online, cu stare vizibilă pentru student." },
    { n: 12, d: "R", s: "Dispus să ajute", t: "Personalul {G} este dispus să îi ajute pe studenți.",
      a: "Instruire în comunicare pentru personalul care lucrează cu studenții; recunoașterea bunelor practici." },
    { n: 13, d: "R", s: "Niciodată prea ocupat", t: "Personalul {G} nu este niciodată prea ocupat pentru a răspunde studenților.",
      a: "Program extins la secretariat în perioadele aglomerate (început de an, sesiune) și răspunsuri standard la întrebări frecvente." },
    { n: 14, d: "S", s: "Comportament care inspiră încredere", t: "Comportamentul personalului {G} inspiră încredere studenților.",
      a: "Coerență între ce se anunță și ce se face; explicarea deciziilor care îi privesc pe studenți." },
    { n: 15, d: "S", s: "Corectitudine și siguranță", t: "Studenții se simt în siguranță în relația cu {s} (evaluare corectă, confidențialitatea datelor, respect).",
      a: "Criterii de evaluare publicate de la începutul semestrului; procedură clară de contestare." },
    { n: 16, d: "S", s: "Amabilitate constantă", t: "Personalul {G} este constant amabil cu studenții.",
      a: "Standard de interacțiune cu studenții, discutat cu personalul; feedback periodic din partea studenților." },
    { n: 17, d: "S", s: "Cunoștințe suficiente", t: "Personalul {G} are cunoștințele necesare pentru a răspunde întrebărilor studenților.",
      a: "Răspunsuri standard pentru întrebările frecvente, la îndemâna întregului personal; o persoană de contact clară." },
    { n: 18, d: "E", s: "Atenție individuală", t: "Personalul {G} acordă atenție individuală fiecărui student.",
      a: "Program de consultații respectat și cunoscut; un tutore sau îndrumător de an accesibil." },
    { n: 19, d: "E", s: "Program convenabil", t: "{S} are un program convenabil pentru studenți (secretariat, bibliotecă, consultații, orar).",
      a: "Program al secretariatului și al bibliotecii adaptat orarului studenților; servicii online fără deplasare." },
    { n: 20, d: "E", s: "Atenția profesorilor", t: "Cadrele didactice de la {s} oferă atenție personală studenților.",
      a: "Feedback individual la lucrări și proiecte; timp pentru întrebări la fiecare seminar." },
    { n: 21, d: "E", s: "Interesul studenților pe primul loc", t: "{S} pune pe primul plan interesele studenților.",
      a: "Studenții implicați în deciziile care îi privesc (orar, calendar, servicii); rezultatele evaluărilor comunicate înapoi." },
    { n: 22, d: "E", s: "Înțelege nevoi speciale", t: "Personalul {G} înțelege nevoile speciale ale studenților (studenți care lucrează, navetiști, studenți cu dizabilități).",
      a: "Opțiuni pentru studenții care lucrează sau fac naveta; accesibilitate verificată în clădiri și pe platforme." }
  ],

  /* Prezentarea instrumentului (ecranul al doilea) */
  instrument: {
    intro: "SERVQUAL, dezvoltat de Parasuraman, Zeithaml și Berry (1988), este unul dintre cele mai utilizate instrumente de evaluare a calității serviciilor. Modelul pornește de la premisa că un serviciu este perceput ca fiind de calitate atunci când experiența efectivă a beneficiarului atinge sau depășește nivelul așteptărilor sale.",
    formula: "Calitatea percepută = Percepții − Așteptări",
    pasi: [
      "Precizezi așteptările față de o universitate excelentă, pe 22 de enunțuri.",
      "Evaluezi principalele momente ale anului universitar, pe baza experienței tale.",
      "Evaluezi serviciile ASE pe aceleași 22 de enunțuri.",
      "Aplicația calculează decalajul pe fiecare dimensiune și indicele IPCS."
    ],
    rol: "În acest exercițiu nu este necesar să îți imaginezi o situație: evaluezi serviciile ASE din perspectiva beneficiarului direct. Răspunsurile sunt anonime și vor fi analizate doar în formă agregată."
  },

  /* Un singur profil: studentul însuși. Momentele anului îl ajută să-și amintească experiența reală. */
  profiles: [
    {
      id: "ase", eticheta: "Student ASE, anul II",
      persona: { nume: "tu", varsta: 0, rol: "student, anul II", initiale: "TU", loc: "ASE" },
      intro: "Ești în al doilea an de studiu și ai parcurs deja un an universitar complet: înscrieri, orare, cursuri și seminare, relația cu secretariatul, platformele online și sesiunile de examene. Această experiență directă face din tine un evaluator avizat al serviciilor oferite de universitate.",
      momente: [
        { id: "a1", ora: "Septembrie–octombrie", titlu: "Începutul anului", asteptare: 0, serviciu: 0,
          text: "Începutul anului universitar: afli orarul, formațiile de studiu, sălile, disciplinele și titularii acestora. În primele săptămâni pot interveni modificări.",
          intrebare: "Când a fost disponibil orarul final? Ai avut, de la început, informații clare despre locul și ora fiecărei activități?" },
        { id: "a2", ora: "Oricând în an", titlu: "La secretariat", asteptare: 0, serviciu: 0,
          text: "Interacțiunea cu secretariatul: solicitarea unei adeverințe de student, semnarea unui document sau soluționarea unei cereri.",
          intrebare: "Cât a durat soluționarea? Ai primit documentul corect și la termenul anunțat? Cum ai fost tratat?" },
        { id: "a3", ora: "O săptămână obișnuită", titlu: "Cursuri și seminare", asteptare: 0, serviciu: 0,
          text: "Activitatea didactică curentă: cursuri, seminare, proiecte, comunicarea cu cadrele didactice.",
          intrebare: "Încep activitățile la ora programată? Cerințele sunt formulate clar? Ai posibilitatea de a adresa întrebări?" },
        { id: "a4", ora: "Zi de zi", titlu: "Platforme online și comunicare", asteptare: 0, serviciu: 0,
          text: "Comunicarea instituțională: e-mailul instituțional, platforma de cursuri, site-ul facultății și canalele prin care sunt transmise anunțurile.",
          intrebare: "Găsești ușor informațiile necesare? Primești răspuns la mesaje? Ești informat la timp despre modificări?" },
        { id: "a5", ora: "Între ore", titlu: "Spațiile ASE", asteptare: 0, serviciu: 0,
          text: "Infrastructura: săli de curs, bibliotecă, spații de studiu individual, rețeaua Wi-Fi, grupuri sanitare, spații de așteptare între activități.",
          intrebare: "Există spații adecvate pentru studiu între activități? Funcționează rețeaua? Sălile sunt potrivite pentru activitățile desfășurate?" },
        { id: "a6", ora: "Ianuarie–februarie, iunie", titlu: "Sesiunea", asteptare: 0, serviciu: 0,
          text: "Sesiunea de examene: programarea examenelor, publicarea rezultatelor, vizualizarea lucrărilor și, eventual, reexaminările.",
          intrebare: "Programarea a fost anunțată din timp? Rezultatele au fost publicate la termen? Ai avut posibilitatea de a-ți vedea lucrarea?" },
        { id: "a7", ora: "Când ai nevoie", titlu: "Servicii pentru studenți", asteptare: 0, serviciu: 0, optional: true,
          text: "Servicii suport: burse, cazare în cămin, consiliere, orientare în carieră, mobilități Erasmus+.",
          intrebare: "Dacă ai apelat la aceste servicii: procedura a fost clară? Ai primit un răspuns în timp util?" }
      ]
    }
  ],

  dezbatere: [
    { q: "Care dimensiune are cea mai mare discrepanță? Pe cine ar privi, în primul rând, o acțiune de îmbunătățire: cadrele didactice, secretariatul, conducerea sau infrastructura?",
      n: "Ajutați grupa să lege dimensiunea de procesul și de responsabilul lui." },
    { q: "Sunteți clienți ai ASE? Clienți interni sau externi? Beneficiari, participanți, co-producători ai serviciului educațional?",
      n: "Literatura tratează de obicei studenții drept clienți externi (beneficiari); clienții interni sunt angajații și departamentele. Discutați ce schimbă fiecare încadrare." },
    { q: "La unele enunțuri notele voastre merg de la 1 la 5. Cum poate aceeași universitate să fie trăită atât de diferit?",
      n: "Așteptări diferite, servicii diferite (alt secretariat, alți profesori), experiențe diferite. Legătura cu variabilitatea serviciilor." },
    { q: "Ce ar putea schimba ASE în 30 de zile, cu cost mic, ca să crească IPCS-ul?",
      n: "Comparați propunerile pe criteriul impact și efort. De obicei câștigurile rapide sunt la informare și comunicare." },
    { q: "Ce parte din calitatea percepută depinde de studenți înșiși?",
      n: "În serviciile educaționale beneficiarul participă la producerea serviciului: prezență, pregătire, comunicare." },
    { q: "Cum ați folosi rezultatele acestei evaluări dacă ați fi responsabili de calitate în ASE? Ce indicatori ați urmări și cât de des?",
      n: "Legătura cu ciclul PDCA, cu analiza efectuată de management și cu feedbackul către studenți." }
  ]
};
