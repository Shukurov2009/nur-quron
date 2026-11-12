import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  ExternalLink,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import { apkInfo } from '../data/download'

const steps = [
  {
    title: 'APK faylni yuklab oling',
    text: 'Yuqoridagi «APK yuklab olish» tugmasini bosing. Fayl telefonning «Yuklab olinganlar» papkasiga tushadi.',
  },
  {
    title: 'Chrome ruxsatini bering',
    text: 'Brauzer «Bu turdagi fayl zararli bo‘lishi mumkin» desa, «Baribir yuklab olish»ni tanlang. Bu har qanday APK uchun chiqadigan odatiy ogohlantirish.',
  },
  {
    title: 'Noma’lum manbalarga ruxsat bering',
    text: 'Telefon «Noma’lum manbalardan o‘rnatish» ruxsatini so‘rasa, Chrome uchun ruxsat bering: Sozlamalar → Ilovalar → Chrome → Maxsus ruxsatlar → Noma’lum ilovalarni o‘rnatish.',
  },
  {
    title: 'O‘rnating va oching',
    text: 'Yuklangan faylni bosing → «O‘rnatish» → «Ochish». Nur bosh ekranda alohida ilova sifatida paydo bo‘ladi.',
  },
]

export function DownloadPage() {
  const shaReady = /^[a-f0-9]{64}$/i.test(apkInfo.sha256)

  return (
    <div className="page download-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Bosh sahifa
      </Link>

      <header className="page-head">
        <div>
          <span className="eyebrow">
            <Smartphone size={14} /> Android ilova
          </span>
          <h1>Nurni telefonga yuklab oling</h1>
          <p>
            APK faylni yuklab, Android telefoningizga o‘rnating. Xuddi Chrome’dan Minecraft
            yuklagandek — Play Store shart emas.
          </p>
        </div>
      </header>

      <section className="download-hero">
        <div className="download-app-icon">
          <img src="/icons/icon-192.png" alt="Nur ilovasi" width="96" height="96" />
        </div>
        <div className="download-app-info">
          <span className="download-badge">{apkInfo.requirements}</span>
          <h2>Nur — Qur’on va namoz yo‘ldoshi</h2>
          <p className="download-meta">
            Versiya {apkInfo.version} · {apkInfo.size} · O‘zbek tilida
          </p>
          <a className="btn btn-gold download-btn" href={apkInfo.url} download>
            <Download size={18} /> APK yuklab olish
          </a>
          {shaReady && (
            <p className="download-checksum">
              SHA-256: <code>{apkInfo.sha256}</code>
            </p>
          )}
        </div>
      </section>

      <section className="download-steps">
        <h2>Qanday o‘rnatiladi?</h2>
        <ol>
          {steps.map((step) => (
            <li key={step.title}>
              <div>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="download-security">
        <h2>
          <ShieldCheck size={22} /> Xavfsizlik haqida
        </h2>
        <p>
          Bu APK uchinchi tomon saytidan olinmagan. U shu loyihaning ochiq manba kodidan GitHub
          Actions serverida quriladi va faqat shu ilovaga tegishli maxsus kalit bilan imzolanadi.
          Ichida reklama, kuzatuvchi yoki yashirin qo‘shimcha paketlar yo‘q.
        </p>
        <p>
          Android’ning <strong>Play Protect</strong> xizmati yangi imzolangan ilovalar uchun ba’zan
          ogohlantirish ko‘rsatadi. Bu virus belgisi emas — «Davom etish»ni tanlasangiz bo‘ladi.
          Faqat APK’ni doim shu sahifadan yoki GitHub’dagi rasmiy build’dan yuklab oling.
        </p>
        <ul className="download-checks">
          <li>
            <CheckCircle2 size={16} /> Manba kodi ochiq: GitHub’da tekshirish mumkin
          </li>
          <li>
            <CheckCircle2 size={16} /> Internet, joylashuv va bildirishnoma ruxsatlari — boshqa
            hech narsa so‘ralmaydi
          </li>
          <li>
            <CheckCircle2 size={16} /> Har bir build’ning SHA-256 xeshi e’lon qilinadi
          </li>
        </ul>
        <a href={apkInfo.buildUrl} target="_blank" rel="noreferrer" className="text-link">
          GitHub’dagi build tarixini ko‘rish <ExternalLink size={14} />
        </a>
      </section>

      <section className="download-alt">
        <div>
          <h2>APK kerak emasmi?</h2>
          <p>
            Saytni brauzerda ochib, «Bosh ekranga qo‘shish» orqali ham ilova sifatida
            foydalanishingiz mumkin. iPhone uchun bu yagona yo‘l.
          </p>
        </div>
        <Link to="/" className="btn btn-soft">
          Saytga qaytish <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  )
}
