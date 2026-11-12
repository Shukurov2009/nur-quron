export interface ArabicLetter {
  letter: string
  name: string
  nameCyr: string
  sound: string
  forms: [string, string, string, string]
  example: string
  exampleLatin: string
  hint: string
  connects: boolean
}

export const arabicLetters: ArabicLetter[] = [
  { letter: 'ا', name: 'Alif', nameCyr: 'Алиф', sound: 'a', forms: ['ا', 'ا', 'ا', 'ا'], example: 'اللّٰه', exampleLatin: 'Alloh', hint: "Cho'ziq “a” tovushi. Keyingi harf bilan ulashmaydi.", connects: false },
  { letter: 'ب', name: 'Bo', nameCyr: 'Бо', sound: 'b', forms: ['ب', 'بـ', 'ـبـ', 'ـب'], example: 'بِسْمِ', exampleLatin: 'bismi', hint: 'Lablar bilan aytiladigan “b”.', connects: true },
  { letter: 'ت', name: 'To', nameCyr: 'То', sound: 't', forms: ['ت', 'تـ', 'ـتـ', 'ـت'], example: 'تَقْوَى', exampleLatin: 'taqvo', hint: 'Til uchi bilan yumshoq “t”.', connects: true },
  { letter: 'ث', name: 'So', nameCyr: 'Со', sound: 's', forms: ['ث', 'ثـ', 'ـثـ', 'ـث'], example: 'ثَوَاب', exampleLatin: 'savob', hint: 'Til uchini tishga tegizib aytiladigan “s”.', connects: true },
  { letter: 'ج', name: 'Jim', nameCyr: 'Жим', sound: 'j', forms: ['ج', 'جـ', 'ـجـ', 'ـج'], example: 'جَنَّة', exampleLatin: 'janna', hint: 'Inglizcha “j” kabi yumshoq tovush.', connects: true },
  { letter: 'ح', name: 'Ha', nameCyr: 'Ҳа', sound: 'h', forms: ['ح', 'حـ', 'ـحـ', 'ـح'], example: 'حَمْد', exampleLatin: 'hamd', hint: 'Halqumdan chuqur “h”.', connects: true },
  { letter: 'خ', name: 'Xo', nameCyr: 'Хо', sound: 'x', forms: ['خ', 'خـ', 'ـخـ', 'ـخ'], example: 'خَيْر', exampleLatin: 'xayr', hint: 'Tomog‘dan “x” tovushi.', connects: true },
  { letter: 'د', name: 'Dal', nameCyr: 'Дал', sound: 'd', forms: ['د', 'د', 'ـد', 'ـد'], example: 'دِين', exampleLatin: 'din', hint: 'Keyingi harf bilan ulashmaydi.', connects: false },
  { letter: 'ذ', name: 'Zal', nameCyr: 'Зал', sound: 'z', forms: ['ذ', 'ذ', 'ـذ', 'ـذ'], example: 'ذِكْر', exampleLatin: 'zikr', hint: 'Til uchini tishga yaqinlashtirib “z”.', connects: false },
  { letter: 'ر', name: 'Ro', nameCyr: 'Ро', sound: 'r', forms: ['ر', 'ر', 'ـر', 'ـر'], example: 'رَحْمَة', exampleLatin: 'rahmat', hint: 'Yumshoq, bir marta tebranadigan “r”.', connects: false },
  { letter: 'ز', name: 'Zay', nameCyr: 'Зай', sound: 'z', forms: ['ز', 'ز', 'ـز', 'ـز'], example: 'زَكَاة', exampleLatin: 'zakot', hint: 'Oddiy “z” tovushi.', connects: false },
  { letter: 'س', name: 'Sin', nameCyr: 'Син', sound: 's', forms: ['س', 'سـ', 'ـسـ', 'ـس'], example: 'سَلَام', exampleLatin: 'salom', hint: 'Tishlar orasidan “s”.', connects: true },
  { letter: 'ش', name: 'Shin', nameCyr: 'Шин', sound: 'sh', forms: ['ش', 'شـ', 'ـشـ', 'ـش'], example: 'شَمْس', exampleLatin: 'shams', hint: '“sh” tovushi.', connects: true },
  { letter: 'ص', name: 'Sod', nameCyr: 'Сод', sound: 's', forms: ['ص', 'صـ', 'ـصـ', 'ـص'], example: 'صَلَاة', exampleLatin: 'salot', hint: 'Qalin “s”.', connects: true },
  { letter: 'ض', name: 'Dod', nameCyr: 'Дод', sound: 'd', forms: ['ض', 'ضـ', 'ـضـ', 'ـض'], example: 'ضِيَاء', exampleLatin: 'ziyo', hint: 'Qalin “d” — arab tilining o‘ziga xos tovushi.', connects: true },
  { letter: 'ط', name: 'To (qalin)', nameCyr: 'То (қалин)', sound: 't', forms: ['ط', 'طـ', 'ـطـ', 'ـط'], example: 'طَهَارَة', exampleLatin: 'tahorat', hint: 'Qalin “t”.', connects: true },
  { letter: 'ظ', name: 'Zo', nameCyr: 'Зо', sound: 'z', forms: ['ظ', 'ظـ', 'ـظـ', 'ـظ'], example: 'ظُلْم', exampleLatin: 'zulm', hint: 'Qalin “z”.', connects: true },
  { letter: 'ع', name: 'Ayn', nameCyr: 'Айн', sound: 'ʽ', forms: ['ع', 'عـ', 'ـعـ', 'ـع'], example: 'عِلْم', exampleLatin: 'ilm', hint: 'Tomog‘ning o‘rtasidan chiqadigan tovush.', connects: true },
  { letter: 'غ', name: 'G‘ayn', nameCyr: 'Ғайн', sound: 'g‘', forms: ['غ', 'غـ', 'ـغـ', 'ـغ'], example: 'غَفُور', exampleLatin: 'g‘afur', hint: 'Tomog‘dan “g‘” tovushi.', connects: true },
  { letter: 'ف', name: 'Fa', nameCyr: 'Фа', sound: 'f', forms: ['ف', 'فـ', 'ـفـ', 'ـف'], example: 'فَقِير', exampleLatin: 'faqir', hint: 'Lab-tish “f”.', connects: true },
  { letter: 'ق', name: 'Qof', nameCyr: 'Қоф', sound: 'q', forms: ['ق', 'قـ', 'ـقـ', 'ـق'], example: 'قُرْآن', exampleLatin: 'Qur’on', hint: 'Chuqur tomog‘dan “q”.', connects: true },
  { letter: 'ك', name: 'Kaf', nameCyr: 'Каф', sound: 'k', forms: ['ك', 'كـ', 'ـكـ', 'ـك'], example: 'كِتَاب', exampleLatin: 'kitob', hint: '“k” tovushi.', connects: true },
  { letter: 'ل', name: 'Lam', nameCyr: 'Лам', sound: 'l', forms: ['ل', 'لـ', 'ـلـ', 'ـل'], example: 'لَيْل', exampleLatin: 'layl', hint: '“l” tovushi.', connects: true },
  { letter: 'م', name: 'Mim', nameCyr: 'Мим', sound: 'm', forms: ['م', 'مـ', 'ـمـ', 'ـم'], example: 'مَسْجِد', exampleLatin: 'masjid', hint: 'Lablar bilan “m”.', connects: true },
  { letter: 'ن', name: 'Nun', nameCyr: 'Нун', sound: 'n', forms: ['ن', 'نـ', 'ـنـ', 'ـن'], example: 'نُور', exampleLatin: 'nur', hint: '“n” tovushi.', connects: true },
  { letter: 'ه', name: 'Ha', nameCyr: 'Ҳа', sound: 'h', forms: ['ه', 'هـ', 'ـهـ', 'ـه'], example: 'هُدًى', exampleLatin: 'huda', hint: 'Yengil “h”.', connects: true },
  { letter: 'و', name: 'Vav', nameCyr: 'Вав', sound: 'v', forms: ['و', 'و', 'ـو', 'ـو'], example: 'وَحْي', exampleLatin: 'vahiy', hint: '“v” yoki “u” tovushi. Keyingi harfga ulanmaydi.', connects: false },
  { letter: 'ي', name: 'Ya', nameCyr: 'Я', sound: 'y', forms: ['ي', 'يـ', 'ـيـ', 'ـي'], example: 'يَوْم', exampleLatin: 'yavm', hint: '“y” tovushi.', connects: true },
  { letter: 'ء', name: 'Hamza', nameCyr: 'Ҳамза', sound: 'ʼ', forms: ['ء', 'ء', 'ء', 'ء'], example: 'شَيْء', exampleLatin: 'shay’', hint: 'Bo‘g‘izdan qisqa to‘xtash.', connects: false },
]

export interface Haraka {
  mark: string
  name: string
  sound: string
  example: string
  exampleLatin: string
  explanation: string
}

export const harakat: Haraka[] = [
  { mark: 'َ', name: 'Fatha', sound: 'a', example: 'بَ', exampleLatin: 'ba', explanation: 'Harf ustidagi qiyshiq chiziq “a” tovushini beradi.' },
  { mark: 'ِ', name: 'Kasra', sound: 'i', example: 'بِ', exampleLatin: 'bi', explanation: 'Harf ostidagi chiziq “i” tovushini beradi.' },
  { mark: 'ُ', name: 'Damma', sound: 'u', example: 'بُ', exampleLatin: 'bu', explanation: 'Kichik vov shakli “u” tovushini beradi.' },
  { mark: 'ْ', name: 'Sukun', sound: '—', example: 'بْ', exampleLatin: 'b', explanation: 'Harfni tovushsiz, faqat bo‘g‘in yopuvi sifatida o‘qish.' },
  { mark: 'ّ', name: 'Shadda', sound: 'ikkilanish', example: 'بَّ', exampleLatin: 'bba', explanation: 'Harf ikki marta o‘qiladi, kuchliroq talaffuz qilinadi.' },
  { mark: 'ً', name: 'Fathatan', sound: 'an', example: 'بًا', exampleLatin: 'ban', explanation: 'Fatha + alif: “an” deb o‘qiladi.' },
  { mark: 'ٍ', name: 'Kasratan', sound: 'in', example: 'بٍ', exampleLatin: 'bin', explanation: 'Kasra + ya: “in” deb o‘qiladi.' },
  { mark: 'ٌ', name: 'Dammatan', sound: 'un', example: 'بٌ', exampleLatin: 'bun', explanation: 'Damma + vov: “un” deb o‘qiladi.' },
]

export const readingWords = [
  { arabic: 'بِسْمِ اللّٰه', latin: 'Bismillah', meaning: 'Alloh nomi bilan' },
  { arabic: 'الْحَمْدُ لِلّٰه', latin: 'Alhamdulillah', meaning: 'Allohga hamd bo‘lsin' },
  { arabic: 'سُبْحَانَ اللّٰه', latin: 'Subhanalloh', meaning: 'Alloh pokdir' },
  { arabic: 'اللّٰهُ أَكْبَر', latin: 'Allohu akbar', meaning: 'Alloh eng buyuk' },
  { arabic: 'لَا إِلٰهَ إِلَّا اللّٰه', latin: 'La ilaha illalloh', meaning: 'Allohdan boshqa iloh yo‘q' },
  { arabic: 'مُحَمَّدٌ رَسُولُ اللّٰه', latin: 'Muhammadun rasululloh', meaning: 'Muhammad — Allohning rasuli' },
  { arabic: 'قُرْآن', latin: 'Qur’on', meaning: 'O‘qiladigan kitob' },
  { arabic: 'صَلَاة', latin: 'Salot', meaning: 'Namoz' },
]
