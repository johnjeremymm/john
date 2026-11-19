/* ==========================================================
   config.js  -  DITO MO PALITAN ANG LAHAT NG PERSONAL NA DETALYE
   Pangalan, photo, social links, numero, email, text sa ilalim ng Call now, at footer.
   Para sa bagong tao: palitan ang file na ito, ang pfp.jpg at apple-touch-icon.png, at ang mga bagay sa taas ng index.html
   na nakalista sa "SITE SETUP". Hindi na kailangang galawin ang script.js at style.css.
   Dapat nasa parehong folder ito ng index.html, at naka-load bago ang script.js.
   ========================================================== */
const CONFIG = {
  // THEME (kulay ng buong page): "navy" (Midnight Blue) | "gold" (Graphite Gold) | "emerald" (Forest Emerald) | "violet" (Royal Violet)
  //   | "rose" (Rose Wine) | "teal" (Ocean Teal) | "ember" (Ember Orange) | "slate" (Slate Silver)
  // DARK / LIGHT: wala na rito. May switch icon (araw / buwan) na sa mismong page, ang bisita ang pipili.
  //   Sa unang bukas, sumusunod ito sa dark/light setting ng phone ng bisita; pagkatapos, naaalala na ang pinili niya.
  // 8 kulay x 2 mode = 16 combinations. Pang-preview nang hindi ginagalaw ang file: idagdag sa dulo ng link ang ?theme=gold&mode=light
  theme: "slate",

  // Animation ng dark/light switch: "fade" (malinis na dissolve, default) | "wipe" (kurtina pababa) | "circle" (bilog mula sa button)
  modeAnim: "circle",

  // Pangalan (ginagamit sa contact file at sa alt text ng photo)
  name: "John Jeremy",

  // Profile picture: filename ng picture mo (hal. "me.jpg"). Kapag walang laman ("") o hindi nahanap, placeholder na avatar ang lalabas.
  photo: "pfp.jpg",

  // Links ng social buttons. Palitan lang ang laman ng quotes. Walang laman ("") = mawawala ang button na iyon.
  facebook: "https://www.facebook.com/john.jeremy.33633",
  messenger: "https://www.messenger.com/t/john.jeremy.33633", // diretso sa chat thread. Na-test: bumubukas sa Messenger app. Ang m.me ay sa browser lang napunta.
  instagram: "https://www.instagram.com/_jerym",
  tiktok: "https://www.tiktok.com/@_jerym",

  // Text sa ilalim ng bawat social button (para tugma sa link)
  handles: {
    facebook: "John Jeremy",
    messenger: "Chat with me",
    instagram: "@_jerym",
    tiktok: "@_jerym",
  },

  // Text sa ilalim ng "Call now" button. Walang laman ("") = ipapakita nang buo ang unang numero.
  callMask: "+63 994 *** ****",

  // Text sa pinakailalim ng page
  footer: "Powered by Linkertap.",

  // MUSIC / AUDIO: kusang tumutugtog pag-load ng page (paulit-ulit, walang play/stop/next/back).
  // audio = filename ng kanta mo sa parehong folder ng index.html (hal. "music.mp3"). Walang laman ("") = walang music.
  // audioTitle / audioArtist = lalabas sa ilalim ng pfp kapag pinindot ang profile photo.
  // audioVolume = 0 hanggang 1.
  // PAALALA: bawal ng browsers (lalo na iOS/Safari at Chrome) ang tunog na kusang tumutugtog nang walang pindot ng bisita.
  // Kaya sinusubukan itong i-play pag-load, at kapag hinarang, magsisimula ito sa UNANG pindot / tap ng bisita kahit saan sa page.
  audio: "music.mp3",
  audioTitle: "Song Title",
  audioArtist: "Artist Name",
  audioVolume: 1,
  // audioFadeIn = ilang segundo ang dahan-dahang pagtaas ng volume (fade in) pagsimula ng music. 0 = walang fade.
  audioFadeIn: 3.5,

  // SHARE PROFILE: ang link na ilalagay sa QR code at share options.
  // shareUrl = buong link ng site mo (hal. "https://linkertap.vercel.app/@john/"). Walang laman = ang link ng page na binuksan.
  // shareText = kasamang mensahe kapag nag-share.
  shareUrl: "https://linkertap.vercel.app/@john/",
  shareText: "Let’s connect! Here’s my contact card.",

  // Mga numero sa Call popup at Save contact. label = kung paano ipapakita, tel = para sa phone app.
  // Ang una ang lalabas sa "Call now" button. Hanggang 2 numero ang kasya sa popup.
  phones: [
    { label: "+63 994 613 3680", tel: "+639946133680" },
    { label: "+63 931 896 4245", tel: "+639318964245" },
  ],

  // EMAIL (mailto): pag pinindot ang "Send now", magbubukas ang email app ng bisita na nakalagay na ang To, subject at message.
  email: "johnjeremymm@gmail.com",
  emailSubject: "Message from my website",
  smsNumber: "09946133680", // tatanggap ng SMS kapag "Switch to SMS" ang pinili. Walang laman = gagamitin ang unang numero sa phones.

  // SAVE CONTACT: dagdag na detalye ng contact card. Walang laman = hindi isasama sa card.
  // firstName / lastName: kung walang laman, hinahati mula sa name sa taas. Ang phones, email, social links at photo ay galing din sa taas.
  contact: {
    firstName: "John Jeremy",
    lastName: "Medina",
    company: "",
    jobTitle: "",
    website: "",
    address: "0591 Sto niño, Bilibiran, Binangonan, Rizal.",
    note: "Saved via my digital contact card",
  },
  // Android: subukan muna ang share sheet. Kung walang Contacts na lumalabas sa share sheet ng phone mo, gawing false para direktang .vcf na.
  androidShare: true,
  // iOS Call now: true = lalabas ang popup na may dalawang numero (pili ka muna, saka lalabas ang native iOS confirm).
  // false = diretsong tawag sa unang numero gamit ang native iOS confirm (isang numero lang ang maaabot).
  iosCallPopup: true,
};