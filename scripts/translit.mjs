// Uzbek Cyrillic -> Latin transliteration used to produce the Latin edition
// of Muhammad Sodiq Muhammad Yusuf's Quran translation.

const lowerMap = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  ғ: 'gʻ',
  д: 'd',
  ж: 'j',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  қ: 'q',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ў: 'oʻ',
  ф: 'f',
  х: 'x',
  ҳ: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ъ: 'ʼ',
  ь: '',
  э: 'e',
  ы: 'i',
}

const vowels = new Set(['а', 'е', 'ё', 'и', 'о', 'у', 'ў', 'э', 'ю', 'я'])
const softSigns = new Set(['ъ', 'ь'])

function isUpper(ch) {
  return ch === ch.toLocaleUpperCase('uz') && ch !== ch.toLocaleLowerCase('uz')
}

function mapLetter(ch, prev, next) {
  const lower = ch.toLocaleLowerCase('uz')
  let out = lowerMap[lower] ?? ch

  if (lower === 'е') {
    out = !prev || vowels.has(prev) || softSigns.has(prev) ? 'ye' : 'e'
  } else if (lower === 'ё') {
    out = 'yo'
  } else if (lower === 'ю') {
    out = 'yu'
  } else if (lower === 'я') {
    out = 'ya'
  } else if (lower === 'ъ') {
    out = next && ['е', 'ё', 'ю', 'я'].includes(next) ? 'y' : 'ʼ'
  }

  if (isUpper(ch) && /[a-z]/.test(out)) {
    out = out.charAt(0).toLocaleUpperCase('uz') + out.slice(1)
  }
  return out
}

export function transliterateUz(text) {
  if (!text) return ''
  const chars = Array.from(text)
  let out = ''
  for (let i = 0; i < chars.length; i += 1) {
    const ch = chars[i]
    if (/[А-Яа-яЁёЎўҚқҒғҲҳЪъЬьЭэЫыЦцЧчШшЩщ]/.test(ch)) {
      const prev = i > 0 ? chars[i - 1].toLocaleLowerCase('uz') : ''
      const next = i + 1 < chars.length ? chars[i + 1].toLocaleLowerCase('uz') : ''
      out += mapLetter(ch, prev, next)
    } else {
      out += ch
    }
  }
  return out
}

export const surahNames = [
  ['Fotiha', 'Фотиҳа'],
  ['Baqara', 'Бақара'],
  ['Oli Imron', 'Оли Имрон'],
  ['Niso', 'Нисо'],
  ['Moida', 'Моида'],
  ["An'om", 'Анъом'],
  ["A'rof", 'Аъроф'],
  ['Anfol', 'Анфол'],
  ['Tavba', 'Тавба'],
  ['Yunus', 'Юнус'],
  ['Hud', 'Ҳуд'],
  ['Yusuf', 'Юсуф'],
  ["Ra'd", 'Раъд'],
  ['Ibrohim', 'Иброҳим'],
  ['Hijr', 'Ҳижр'],
  ['Nahl', 'Наҳл'],
  ['Isro', 'Исро'],
  ['Kahf', 'Каҳф'],
  ['Maryam', 'Марям'],
  ['Toha', 'Тоҳо'],
  ['Anbiyo', 'Анбиё'],
  ['Haj', 'Ҳаж'],
  ["Mu'minun", 'Муъминун'],
  ['Nur', 'Нур'],
  ['Furqon', 'Фурқон'],
  ['Shuaro', 'Шуаро'],
  ['Naml', 'Намл'],
  ['Qasas', 'Қасас'],
  ['Ankabut', 'Анкабут'],
  ['Rum', 'Рум'],
  ['Luqmon', 'Луқмон'],
  ['Sajda', 'Сажда'],
  ['Ahzob', 'Аҳзоб'],
  ['Saba', 'Саба'],
  ['Fotir', 'Фотир'],
  ['Yosin', 'Ёсин'],
  ['Soffat', 'Соффат'],
  ['Sod', 'Сод'],
  ['Zumar', 'Зумар'],
  ["G'ofir", 'Ғофир'],
  ['Fussilat', 'Фуссилат'],
  ['Shuro', 'Шуро'],
  ['Zuxruf', 'Зухруф'],
  ['Duxon', 'Духон'],
  ['Josiya', 'Жосия'],
  ['Ahqof', 'Аҳқоф'],
  ['Muhammad', 'Муҳаммад'],
  ['Fath', 'Фатҳ'],
  ['Hujurot', 'Ҳужурот'],
  ['Qof', 'Қоф'],
  ['Zoriyot', 'Зориёт'],
  ['Tur', 'Тур'],
  ['Najm', 'Нажм'],
  ['Qamar', 'Қамар'],
  ['Rahmon', 'Раҳмон'],
  ['Voqia', 'Воқиа'],
  ['Hadid', 'Ҳадид'],
  ['Mujodala', 'Мужодала'],
  ['Hashr', 'Ҳашр'],
  ['Mumtahana', 'Мумтаҳана'],
  ['Saff', 'Сафф'],
  ['Jumua', 'Жумуа'],
  ['Munofiqun', 'Мунофиқун'],
  ["Tag'obun", 'Тағобун'],
  ['Taloq', 'Талоқ'],
  ['Tahrim', 'Таҳрим'],
  ['Mulk', 'Мулк'],
  ['Qalam', 'Қалам'],
  ['Haqqa', 'Ҳаққа'],
  ["Ma'orij", 'Маориж'],
  ['Nuh', 'Нуҳ'],
  ['Jin', 'Жин'],
  ['Muzzammil', 'Муззаммил'],
  ['Muddassir', 'Муддассир'],
  ['Qiyoma', 'Қиёма'],
  ['Insan', 'Инсон'],
  ['Mursalot', 'Мурсалот'],
  ['Naba', 'Наба'],
  ["Nazi'at", 'Назиот'],
  ['Abasa', 'Абаса'],
  ['Takvir', 'Таквир'],
  ['Infitor', 'Инфитор'],
  ['Mutaffifin', 'Мутаффифин'],
  ['Inshiqoq', 'Иншиқоқ'],
  ['Buruj', 'Буруж'],
  ['Toriq', 'Ториқ'],
  ["A'lo", 'Аъло'],
  ["G'oshiya", 'Ғошия'],
  ['Fajr', 'Фажр'],
  ['Balad', 'Балад'],
  ['Shams', 'Шамс'],
  ['Layl', 'Лайл'],
  ['Zuho', 'Зуҳо'],
  ['Sharh', 'Шарҳ'],
  ['Tin', 'Тин'],
  ['Alaq', 'Алақ'],
  ['Qadr', 'Қадр'],
  ['Bayyina', 'Баййина'],
  ['Zalzala', 'Залзала'],
  ['Odiyat', 'Одиёт'],
  ["Qori'a", 'Қориа'],
  ['Takosur', 'Такосур'],
  ['Asr', 'Аср'],
  ['Humaza', 'Ҳумаза'],
  ['Fil', 'Фил'],
  ['Quraysh', 'Қурайш'],
  ["Mo'un", 'Моун'],
  ['Kavsar', 'Кавсар'],
  ['Kofirun', 'Кофирун'],
  ['Nasr', 'Наср'],
  ['Lahab', 'Лаҳаб'],
  ['Ixlos', 'Ихлос'],
  ['Falaq', 'Фалақ'],
  ['Nos', 'Нос'],
]
