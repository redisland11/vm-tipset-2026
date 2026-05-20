const TEAM_ISO = {
  "Mexiko": "mx",
  "Sydafrika": "za",
  "Sydkorea": "kr",
  "Tjeckien": "cz",
  "Kanada": "ca",
  "Schweiz": "ch",
  "Qatar": "qa",
  "Bosnien och Hercegovina": "ba",
  "Brasilien": "br",
  "Marocko": "ma",
  "Skottland": "gb-sct",
  "Haiti": "ht",
  "USA": "us",
  "Australien": "au",
  "Paraguay": "py",
  "Turkiet": "tr",
  "Tyskland": "de",
  "Ecuador": "ec",
  "Elfenbenskusten": "ci",
  "Curaçao": "cw",
  "Nederländerna": "nl",
  "Japan": "jp",
  "Sverige": "se",
  "Tunisien": "tn",
  "Belgien": "be",
  "Iran": "ir",
  "Egypten": "eg",
  "Nya Zeeland": "nz",
  "Spanien": "es",
  "Uruguay": "uy",
  "Saudiarabien": "sa",
  "Kap Verde": "cv",
  "Frankrike": "fr",
  "Senegal": "sn",
  "Norge": "no",
  "Irak": "iq",
  "Argentina": "ar",
  "Österrike": "at",
  "Algeriet": "dz",
  "Jordanien": "jo",
  "Portugal": "pt",
  "Colombia": "co",
  "Uzbekistan": "uz",
  "Kongo-Kinshasa": "cd",
  "England": "gb-eng",
  "Kroatien": "hr",
  "Ghana": "gh",
  "Panama": "pa"
};

// flagcdn.com stödjer endast specifika widths: 20, 40, 80, 160, 320, 640, 1280, 2560.
// För matchtabellen renderar vi i 40px och låter CSS skala ner till önskad visuell storlek.
function flagUrl(team, width = 40) {
  const code = TEAM_ISO[team];
  if (!code) return "";
  return `https://flagcdn.com/w${width}/${code}.png`;
}

function flagImg(team, width = 40) {
  const url = flagUrl(team, width);
  if (!url) return "";
  return `<img class="flag" src="${url}" alt="${team}" loading="lazy">`;
}
