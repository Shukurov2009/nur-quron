export interface City {
  id: string
  name: string
  nameCyr: string
  lat: number
  lon: number
  country: string
  timezone: string
}

export const cities: City[] = [
  { id: 'tashkent', name: 'Toshkent', nameCyr: 'Тошкент', lat: 41.2995, lon: 69.2401, country: "O'zbekiston", timezone: 'Asia/Tashkent' },
  { id: 'samarkand', name: 'Samarqand', nameCyr: 'Самарқанд', lat: 39.6542, lon: 66.9597, country: "O'zbekiston", timezone: 'Asia/Tashkent' },
  { id: 'bukhara', name: 'Buxoro', nameCyr: 'Бухоро', lat: 39.7747, lon: 64.4286, country: "O'zbekiston", timezone: 'Asia/Tashkent' },
  { id: 'andijan', name: 'Andijon', nameCyr: 'Андижон', lat: 40.7821, lon: 72.3442, country: "O'zbekiston", timezone: 'Asia/Tashkent' },
  { id: 'fergana', name: "Farg'ona", nameCyr: 'Фарғона', lat: 40.3842, lon: 71.7843, country: "O'zbekiston", timezone: 'Asia/Tashkent' },
  { id: 'namangan', name: 'Namangan', nameCyr: 'Наманган', lat: 40.9983, lon: 71.6726, country: "O'zbekiston", timezone: 'Asia/Tashkent' },
  { id: 'nukus', name: 'Nukus', nameCyr: 'Нукус', lat: 42.4531, lon: 59.6103, country: "O'zbekiston", timezone: 'Asia/Tashkent' },
  { id: 'qarshi', name: 'Qarshi', nameCyr: 'Қарши', lat: 38.8606, lon: 65.7891, country: "O'zbekiston", timezone: 'Asia/Tashkent' },
  { id: 'termiz', name: 'Termiz', nameCyr: 'Термиз', lat: 37.2242, lon: 67.2783, country: "O'zbekiston", timezone: 'Asia/Tashkent' },
  { id: 'khiva', name: 'Xiva', nameCyr: 'Хива', lat: 41.3783, lon: 60.3639, country: "O'zbekiston", timezone: 'Asia/Tashkent' },
  { id: 'urgench', name: 'Urganch', nameCyr: 'Урганч', lat: 41.55, lon: 60.6333, country: "O'zbekiston", timezone: 'Asia/Tashkent' },
  { id: 'jizzakh', name: 'Jizzax', nameCyr: 'Жиззах', lat: 40.1158, lon: 67.8422, country: "O'zbekiston", timezone: 'Asia/Tashkent' },
  { id: 'navoiy', name: 'Navoiy', nameCyr: 'Навоий', lat: 40.0844, lon: 65.3792, country: "O'zbekiston", timezone: 'Asia/Tashkent' },
  { id: 'gulistan', name: 'Guliston', nameCyr: 'Гулистон', lat: 40.4897, lon: 68.7842, country: "O'zbekiston", timezone: 'Asia/Tashkent' },
  { id: 'margilan', name: "Marg'ilon", nameCyr: 'Марғилон', lat: 40.4711, lon: 71.7247, country: "O'zbekiston", timezone: 'Asia/Tashkent' },
  { id: 'kokand', name: "Qo'qon", nameCyr: 'Қўқон', lat: 40.5286, lon: 70.9425, country: "O'zbekiston", timezone: 'Asia/Tashkent' },
  { id: 'shahrisabz', name: 'Shahrisabz', nameCyr: 'Шаҳрисабз', lat: 39.0578, lon: 66.8342, country: "O'zbekiston", timezone: 'Asia/Tashkent' },
  { id: 'denov', name: 'Denov', nameCyr: 'Денов', lat: 38.2667, lon: 67.9, country: "O'zbekiston", timezone: 'Asia/Tashkent' },
  { id: 'chirchiq', name: 'Chirchiq', nameCyr: 'Чирчиқ', lat: 41.4689, lon: 69.5822, country: "O'zbekiston", timezone: 'Asia/Tashkent' },
  { id: 'angren', name: 'Angren', nameCyr: 'Ангрен', lat: 41.0167, lon: 70.1436, country: "O'zbekiston", timezone: 'Asia/Tashkent' },
  { id: 'makkah', name: 'Makka', nameCyr: 'Макка', lat: 21.4225, lon: 39.8262, country: 'Saudiya Arabistoni', timezone: 'Asia/Riyadh' },
  { id: 'madinah', name: 'Madina', nameCyr: 'Мадина', lat: 24.4672, lon: 39.6111, country: 'Saudiya Arabistoni', timezone: 'Asia/Riyadh' },
  { id: 'istanbul', name: 'Istanbul', nameCyr: 'Истанбул', lat: 41.0082, lon: 28.9784, country: 'Turkiya', timezone: 'Europe/Istanbul' },
  { id: 'moscow', name: 'Moskva', nameCyr: 'Москва', lat: 55.7558, lon: 37.6173, country: 'Rossiya', timezone: 'Europe/Moscow' },
  { id: 'dubai', name: 'Dubay', nameCyr: 'Дубай', lat: 25.2048, lon: 55.2708, country: 'BAA', timezone: 'Asia/Dubai' },
  { id: 'london', name: 'London', nameCyr: 'Лондон', lat: 51.5074, lon: -0.1278, country: 'Buyuk Britaniya', timezone: 'Europe/London' },
]

export const defaultCity = cities[0]
