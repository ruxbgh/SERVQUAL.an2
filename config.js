/* Configurare. Se editează o singură dată, înainte de oră (vezi README.md). */
window.CALITAS_CONFIG = {
  // Un singur profil în această aplicație: studentul însuși. Nu modifica.
  profilFix: "ase",

  // Doar dacă NU folosești scriptul de mai jos: linkul unui Google Form în care studenții lipesc codul
  // de rezultat. Exemplu: "https://forms.gle/AbCdEf123".
  linkFormular: "",

  // Trimitere directă în foaia ta Google Sheets (recomandat): adresa aplicației web obținute din Code.gs,
  // vezi README.md, secțiunea „Colectarea răspunsurilor”. Adresa (se termină în /exec). Exemplu:
  // "https://script.google.com/macros/s/AKfycb.../exec"
  endpoint: "https://script.google.com/macros/s/AKfycbybdqORk7K_dl3RyLMGqh-iPoalsSZVlmMIHELPHMPPriCd6ifLN3H7cLrn9KpBD8TQbA/exec",

  // Dacă este true, studentul trebuie să introducă un cod de sesiune (pe care îl anunți la oră).
  // Codul se setează în proprietățile scriptului (SESSION_CODE). Vezi README.md.
  cerCodSesiune: false
};
