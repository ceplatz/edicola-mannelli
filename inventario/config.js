// Edicola Mannelli — configurazione. Per il passaggio di proprietà basta cambiare questo file.
window.EDICOLA_CONFIG = {
  firebase: {
    apiKey: "AIzaSyBcnqvl9MINZK2_zpDZXlqjPHhQuVu5nw4",
    authDomain: "edicola-mannelli.firebaseapp.com",
    projectId: "edicola-mannelli",
    storageBucket: "edicola-mannelli.firebasestorage.app",
    messagingSenderId: "637961807962",
    appId: "1:637961807962:web:307fd2085f368799f3d063",
    measurementId: "G-914HJL9WFF"
  },
  // Account di accesso (creati in Firebase → Authentication). Devono coincidere con firestore.rules.
  emailTitolare: "proprietario@edicolamannelli.com",
  emailPersonale: "staff@edicolamannelli.com",
  // Splash nero "Empowered By Viridian" prima del logo Edicola. Metti false per toglierlo.
  mostraSplashViridian: true
};
