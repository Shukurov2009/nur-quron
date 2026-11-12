export interface GuideStep {
  id: string
  title: string
  subtitle?: string
  body: string
  arabic?: string
  translit?: string
  translation?: string
  count?: string
  figure?: 'takbir' | 'qiyam' | 'ruku' | 'qavma' | 'sujud' | 'jalsa' | 'tashahhud' | 'salam'
  tip?: string
}

export const wuduSteps: GuideStep[] = [
  {
    id: 'niyat',
    title: 'Niyat va Bismillah',
    body: 'Tahoratga niyat qiling va «Bismillah» deb boshlang. Niyat — qalbda bo‘ladi.',
    arabic: 'بِسْمِ اللّٰهِ',
    translit: 'Bismillah',
    translation: 'Alloh nomi bilan boshlayman.',
  },
  {
    id: 'hands',
    title: 'Qo‘llarni yuvish',
    body: 'Ikkala qo‘lni bilaklar bilan birga, barmoqlar orasini ham qo‘shib, 3 marta yuvang.',
    count: '3 marta',
  },
  {
    id: 'mouth',
    title: 'Og‘izni chayish',
    body: 'Og‘izni 3 marta chaying. Ro‘za tutayotgan bo‘lsangiz, suvni yutib yubormaslikka ehtiyot bo‘ling.',
    count: '3 marta',
  },
  {
    id: 'nose',
    title: 'Burunni yuvish',
    body: 'Burun teshiklariga suv olib, 3 marta chaying. Suvni burundan chiqarib tashlang.',
    count: '3 marta',
  },
  {
    id: 'face',
    title: 'Yuzni yuvish',
    body: 'Peshonadan iyak ostigacha, bir quloqdan ikkinchi quloqgacha bo‘lgan yuzni 3 marta yuvang.',
    count: '3 marta',
  },
  {
    id: 'arms',
    title: 'Qo‘llarni tirsakkacha yuvish',
    body: 'Avval o‘ng qo‘lni, keyin chap qo‘lni tirsak bilan birga 3 martadan yuvang.',
    count: '3 marta',
  },
  {
    id: 'head',
    title: 'Boshni mesh qilish',
    body: 'Ho‘l qo‘l bilan boshning old qismidan orqa qismiga, keyin orqaga qaytarib bir marta mesh qiling.',
    count: '1 marta',
  },
  {
    id: 'ears',
    title: 'Quloqlarni mesh qilish',
    body: 'Ko‘rsatkich barmoqlar bilan quloq ichini, bosh barmoqlar bilan orqasini bir marta mesh qiling.',
    count: '1 marta',
  },
  {
    id: 'feet',
    title: 'Oyoqlarni yuvish',
    body: 'Avval o‘ng oyoqni, keyin chap oyoqni to‘piq bilan birga 3 marta yuvang. Barmoqlar orasini ham tozalang.',
    count: '3 marta',
    tip: 'Tahoratdan so‘ng «Ash-hadu an la ilaha illalloh...» duosini o‘qish sunnatdir.',
  },
]

export const salahSteps: GuideStep[] = [
  {
    id: 'niyat',
    title: 'Niyat',
    subtitle: 'Qalbda niyat qilish',
    body: 'Qaysi namozni o‘qimoqchi bo‘lsangiz, qalbingizda niyat qiling. Masalan: «Bugungi Bomdod namozining farzini Alloh uchun o‘qishga niyat qildim».',
    tip: 'Niyatni til bilan aytish shart emas, qalbda niyat qilish kifoya.',
    figure: 'qiyam',
  },
  {
    id: 'takbir',
    title: 'Takbir — namozga kirish',
    body: 'Qiblaga yuzlanib, ikkala qo‘lni quloq barobariga ko‘tarib, «Allohu akbar» deng. Shundan so‘ng namoz boshlangan hisoblanadi.',
    arabic: 'اللّٰهُ أَكْبَر',
    translit: 'Allohu akbar',
    translation: 'Alloh eng buyukdir.',
    figure: 'takbir',
  },
  {
    id: 'qiyam',
    title: 'Qiyam va Sana',
    body: 'O‘ng qo‘lni chap qo‘l ustiga qo‘yib, kindik ostida bog‘lang va Sana duosini o‘qing.',
    arabic: 'سُبْحَانَكَ اللّٰهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلٰهَ غَيْرُكَ',
    translit: 'Subhanakallohumma va bihamdika, va tabarokasmuka, va ta’ala jadduka, va la ilaha g‘ayruka.',
    translation: 'Allohim, Sani poklayman va Sanga hamd aytaman. Isming barokatli, ulug‘liging yuksak. Sendan boshqa iloh yo‘q.',
    figure: 'qiyam',
  },
  {
    id: 'fatiha',
    title: 'Fotiha surasi',
    body: 'Sana duosidan so‘ng «A’uzu billahi...» va «Bismillah...» aytib, Fotiha surasini o‘qing. So‘ngra qisqa bo‘lsa ham bir sura yoki bir necha oyat o‘qing.',
    arabic: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ',
    translit: 'Bismillahir-rohmanir-rohim',
    translation: 'Mehribon va rahmli Alloh nomi bilan.',
    tip: 'Fotiha — namozning har rakatida o‘qiladi.',
    figure: 'qiyam',
  },
  {
    id: 'ruku',
    title: 'Ruku',
    body: '«Allohu akbar» deb belni egib ruku qiling. Qo‘llar tizza ustiga, orqa tekis bo‘lsin. Rukuda 3 marta tasbeh o‘qing.',
    arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ',
    translit: 'Subhana robbiyal ‘azim',
    translation: 'Ulug‘ Rabbimni poklayman.',
    count: '3 marta',
    figure: 'ruku',
  },
  {
    id: 'qavma',
    title: 'Rukudan turish',
    body: '«Sami‘allohu liman hamidah» deb qad ko‘taring. Tik turganingizda «Robbana lakal hamd» deng.',
    arabic: 'سَمِعَ اللّٰهُ لِمَنْ حَمِدَهُ — رَبَّنَا لَكَ الْحَمْدُ',
    translit: 'Sami‘allohu liman hamidah — Robbana lakal hamd.',
    translation: 'Alloh O‘ziga hamd aytganni eshitdi — Rabbimiz, Sanga hamd bo‘lsin.',
    figure: 'qavma',
  },
  {
    id: 'sujud',
    title: 'Sajda',
    body: '«Allohu akbar» deb sajdaga boring. Peshona va burun yerga tegishi, qo‘llar, tizzalar va oyoq barmoqlari joyida bo‘lishi kerak. Sajdada 3 marta tasbeh o‘qing.',
    arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى',
    translit: 'Subhana robbiyal a‘lo',
    translation: 'Eng yuksak Rabbimni poklayman.',
    count: '3 marta',
    figure: 'sujud',
  },
  {
    id: 'jalsa',
    title: 'Sajdalar orasida o‘tirish',
    body: '«Allohu akbar» deb bosh ko‘tarib, chap oyoq ustida qisqa o‘tiring. So‘ng yana bir marta sajda qiling.',
    arabic: 'رَبِّ اغْفِرْ لِي',
    translit: 'Robbighfir li',
    translation: 'Rabbim, meni kechir.',
    figure: 'jalsa',
  },
  {
    id: 'tashahhud',
    title: 'Tashahhud',
    body: 'Ikkinchi rakatning oxirida va har bir rakat yakunida qad’da o‘tirib Tashahhud o‘qiladi. Barmoq bilan shahodat ishorasi qilinadi.',
    arabic: 'التَّحِيَّاتُ لِلّٰهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ ...',
    translit: 'At-tahiyyatu lillahi vas-salavatu vat-tayyibatu...',
    translation: 'Barcha salomlar, ibodatlar va yaxshiliklar Alloh uchundir...',
    figure: 'tashahhud',
  },
  {
    id: 'salawat',
    title: 'Salavot',
    body: 'Tashahhuddan so‘ng Payg‘ambarimizga salavot o‘qing.',
    arabic: 'اللّٰهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
    translit: 'Allohumma solli ‘ala Muhammadin va ‘ala oli Muhammad.',
    translation: 'Allohim, Muhammad va uning oilasiga salavot yo‘llagin.',
    figure: 'tashahhud',
  },
  {
    id: 'salam',
    title: 'Salom bilan yakunlash',
    body: 'Avval o‘ng yelkaga, keyin chap yelkaga qarab «As-salamu alaykum va rahmatulloh» deb salom bering. Namoz tugadi.',
    arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ',
    translit: 'As-salamu ‘alaykum va rahmatulloh.',
    translation: 'Sizga salom va Allohning rahmati bo‘lsin.',
    figure: 'salam',
  },
]

export const prayerRakats = [
  { name: 'Bomdod', time: 'Fajr', farz: 2, sunnat: '2 sunnat', note: 'Tong otguncha o‘qiladi.' },
  { name: 'Peshin', time: 'Dhuhr', farz: 4, sunnat: '4 sunnat + 2 sunnat', note: 'Quyosh zenithdan o‘tgach.' },
  { name: 'Asr', time: 'Asr', farz: 4, sunnat: '4 sunnat', note: 'Ikindi paytida.' },
  { name: 'Shom', time: 'Maghrib', farz: 3, sunnat: '2 sunnat', note: 'Quyosh botgach.' },
  { name: 'Xufton', time: 'Isha', farz: 4, sunnat: '4 sunnat + 3 vitr', note: 'Kechqurun.' },
]

export const prayerDuas = [
  {
    title: 'Tashahhud (to‘liq)',
    arabic:
      'التَّحِيَّاتُ لِلّٰهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللّٰهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    translit:
      'At-tahiyyatu lillahi vas-salavatu vat-tayyibatu. As-salamu ‘alayka ayyuhan-nabiyyu va rahmatullohi va barakatuhu. As-salamu ‘alayna va ‘ala ‘ibadillahis-salihin. Ash-hadu an la ilaha illallohu va ash-hadu anna Muhammadan ‘abduhu va rasuluhu.',
    translation:
      'Barcha salomlar, ibodatlar va yaxshiliklar Alloh uchundir. Ey Payg‘ambar, Sanga Allohning salomi, rahmati va barakati bo‘lsin. Bizga va Allohning solih bandalariga salom bo‘lsin. Allohdan boshqa iloh yo‘qligiga va Muhammad Uning bandasi va rasuli ekanligiga guvohlik beraman.',
  },
  {
    title: 'Salavot',
    arabic:
      'اللّٰهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ. اللّٰهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ',
    translit:
      'Allohumma solli ‘ala Muhammadin va ‘ala oli Muhammad, kama sollayta ‘ala Ibrohima va ‘ala oli Ibrohim, innaka hamidun majid. Allohumma barik ‘ala Muhammadin va ‘ala oli Muhammad, kama barokta ‘ala Ibrohima va ‘ala oli Ibrohim, innaka hamidun majid.',
    translation:
      'Allohim, Ibrohim va uning oilasiga salavot yo‘llaganing kabi Muhammad va uning oilasiga ham salavot yo‘lla. Sen hamdga sazovor va ulug‘ Zotsan. Allohim, Ibrohim va uning oilasiga baraka berganing kabi Muhammad va uning oilasiga ham baraka ber. Sen hamdga sazovor va ulug‘ Zotsan.',
  },
  {
    title: 'Rabbana otina',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    translit: 'Robbana otina fid-dunyo hasanatan va fil-axirati hasanatan va qina ‘azaban-nar.',
    translation: 'Rabbimiz, bizga dunyoda ham, oxiratda ham yaxshilik ber va bizni do‘zax azobidan saqla.',
  },
  {
    title: 'Tahoratdan keyingi duo',
    arabic:
      'أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ. اللّٰهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ',
    translit:
      'Ash-hadu an la ilaha illallohu vahdahu la sharika lah, va ash-hadu anna Muhammadan ‘abduhu va rasuluh. Allohummaj‘alni minat-tavvabina vaj‘alni minal-mutatahhirin.',
    translation:
      'Allohdan boshqa iloh yo‘qligiga, U yolg‘iz va sherigi yo‘qligiga guvohlik beraman. Muhammad Uning bandasi va rasuli ekanligiga ham guvohlik beraman. Allohim, meni tavba qiluvchilar va poklanuvchilar qatoriga qo‘shgin.',
  },
]
