/**
 * Başlangıç içeriği (seed) — gerçek ürün içeriği, sahte veri değil.
 * Konular, sorular, şubeler, unvan kuralları ve varsayılan ayarlar.
 * Sorular ilk açılışta veri deposuna yazılır; sonrasında admin tarafından yönetilir (§26).
 * Ton: farkındalık + güvenli davranış; korkutucu/tıbbi dil yok (§5). Metinler kısa (§2).
 */

import type {
  AppConfig,
  TestResult,
  DBData,
  GradeSettings,
  Question,
  SchoolClass,
  TitleRule,
  Topic,
} from '../models';
import { GRADES, SECTION_LETTERS } from '../models';

export const seedTopics: Topic[] = [
  {
    id: 'ekran',
    name: 'Ekran Bağımlılığı',
    description: 'Ekranı dengeli kullanmayı öğreniyoruz.',
    icon: '📱',
    accent: 'sky',
    isActive: true,
    targetGrades: [1, 2, 3, 4],
  },
  {
    id: 'teknoloji',
    name: 'Bilinçli Teknoloji',
    description: 'Teknolojiyi akıllıca ve güvenli kullanıyoruz.',
    icon: '🧠',
    accent: 'mint',
    isActive: true,
    targetGrades: [1, 2, 3, 4],
  },
  {
    id: 'sigara',
    name: 'Sigara ve Korunma',
    description: 'Sigara dumanından uzak durmayı öğreniyoruz.',
    icon: '🚭',
    accent: 'coral',
    isActive: true,
    targetGrades: [1, 2, 3, 4],
  },
  {
    id: 'zararli',
    name: 'Güvenli Seçimler',
    description: 'Bilmediğimiz maddelerden uzak dururuz.',
    icon: '🛡️',
    accent: 'lavender',
    isActive: true,
    targetGrades: [1, 2, 3, 4],
  },
  {
    id: 'yapayzeka',
    name: 'Bilinçli Yapay Zekâ',
    description: 'Yapay zekâyı akıllıca kullanıyoruz.',
    icon: '🤖',
    accent: 'amber',
    isActive: true,
    targetGrades: [2, 3, 4],
  },
];

/** Tüm sınıf seviyeleri için şubeler A'dan Z'ye oluşturulur (bkz. SECTION_LETTERS). */
export const seedClasses: SchoolClass[] = GRADES.flatMap((grade) =>
  SECTION_LETTERS.map((section) => ({
    id: `${grade}${section}`,
    grade,
    section,
    isActive: true,
  })),
);

/**
 * Sonuç ekranı HAYVAN unvanları — puana göre oyuncuya bir hayvan verilir;
 * bariz üstünlük/küçümseme yok, her seviyede teşvik edici (kiosk uyarlaması).
 */
export const seedTitles: TitleRule[] = [
  { minPercent: 100, name: 'Altın Aslan', emoji: '🦁' },
  { minPercent: 90, name: 'Keskin Kartal', emoji: '🦅' },
  { minPercent: 70, name: 'Akıllı Tilki', emoji: '🦊' },
  { minPercent: 50, name: 'Denge Yunusu', emoji: '🐬' },
  { minPercent: 30, name: 'Sağlam Kaplumbağa', emoji: '🐢' },
  { minPercent: 0, name: 'Cesur Yavru', emoji: '🐣' },
];

export const seedGradeSettings: GradeSettings[] = [
  { grade: 1, difficulty: 'easy', questionCount: 5 },
  { grade: 2, difficulty: 'easy-medium', questionCount: 7 },
  { grade: 3, difficulty: 'medium', questionCount: 10 },
  { grade: 4, difficulty: 'medium-hard', questionCount: 12 },
];

export const defaultConfig = (): AppConfig => ({
  certificatePrefix: 'BEUN',
  period: '2026',
  projectTitle: 'Bağımlılıkla Mücadele Farkındalık Projesi',
  universityName: 'Zonguldak Bülent Ecevit Üniversitesi',
  signatoryLeft: 'Proje Ekibi',
  signatoryRight: 'Danışman Öğretmen',
  titles: seedTitles,
});

export const DEFAULT_ADMIN_PIN = '3579';
export const DEFAULT_ADMIN_NAME = 'Yönetici';

/**
 * Soru bankası — 1. sınıf 5 / 2. sınıf 7 / 3. sınıf 10 / 4. sınıf 12 (brief §3).
 * Her soru: büyük emoji görsel + kısa metin + büyük seçenekler + kısa "neden" cümlesi.
 */
export const seedQuestions: Question[] = [
  {
    id: 'g1-ekran-1',
    grade: 1,
    topicId: 'ekran',
    difficulty: 'easy',
    visual: '📱',
    text: 'Uzun süre tabletle oynadın. Şimdi ne yapmalısın?',
    options: ['📱 Daha çok oynarım', '⏸️ Mola veririm'],
    correctIndex: 1,
    points: 10,
    fact: 'Mola verince gözlerimiz ve beynimiz dinlenir.',
    isActive: true,
  },
  {
    id: 'g1-ekran-2',
    grade: 1,
    topicId: 'ekran',
    difficulty: 'easy',
    visual: '🤔',
    text: 'Hangisi daha sağlıklı?',
    options: ['😊 Mola vermek', '😫 Saatlerce ekrana bakmak'],
    correctIndex: 0,
    points: 10,
    fact: 'Mola vermek bedenimize iyi gelir.',
    isActive: true,
  },
  {
    id: 'g1-teknoloji-1',
    grade: 1,
    topicId: 'teknoloji',
    difficulty: 'easy',
    visual: '☀️',
    text: 'Ekransız oyun zamanı! Ne oynayabilirsin?',
    options: ['📱 Telefonla oynamak', '⚽ Top oynamak'],
    correctIndex: 1,
    points: 10,
    fact: 'Koşmak ve oyun oynamak bizi güçlendirir.',
    isActive: true,
  },
  {
    id: 'g1-sigara-1',
    grade: 1,
    topicId: 'sigara',
    difficulty: 'easy',
    visual: '🚬',
    text: 'Sigara içen birini gördün. Ne yapmalısın?',
    options: ['👀 Yanına oturup bakarım', '🚶 Uzaklaşıp temiz hava alırım'],
    correctIndex: 1,
    points: 10,
    fact: 'Sigara dumanı sağlığımıza zarar verir; uzak durmak en iyisi.',
    isActive: true,
  },
  {
    id: 'g1-zararli-1',
    grade: 1,
    topicId: 'zararli',
    difficulty: 'easy',
    visual: '🎁',
    text: 'Ne olduğunu bilmediğin bir şey sana verildi. Ne yapmalısın?',
    options: ['🧍 Almam ve büyüğüme söylerim', '🤲 Alıp tadına bakarım'],
    correctIndex: 0,
    points: 10,
    fact: 'Bilmediğimiz şeyleri almayız; güvendiğimiz büyüğümüze söyleriz.',
    isActive: true,
  },
  {
    id: 'g2-ekran-1',
    grade: 2,
    topicId: 'ekran',
    difficulty: 'easy-medium',
    visual: '🛏️',
    text: 'Yatmadan önce telefonla oynamak neye sebep olur?',
    options: ['💪 Daha güçlü oluruz', '🌟 Hiçbir şey olmaz', '😴 Uykumuz bozulur'],
    correctIndex: 2,
    points: 10,
    fact: 'Uyku saatinde ekran olmazsa daha iyi dinleniriz.',
    isActive: true,
  },
  {
    id: 'g2-ekran-2',
    grade: 2,
    topicId: 'ekran',
    difficulty: 'easy-medium',
    visual: '🕐',
    text: 'Ekran molasında ne yapabilirsin?',
    options: ['🎮 Oyuna devam ederim', '🏃 Hareket edip su içerim', '📺 Televizyon açarım'],
    correctIndex: 1,
    points: 10,
    fact: 'Mola, ekrandan uzak ve hareketli olursa gerçek mola olur.',
    isActive: true,
  },
  {
    id: 'g2-teknoloji-1',
    grade: 2,
    topicId: 'teknoloji',
    difficulty: 'easy-medium',
    visual: '💻',
    text: 'Teknolojiyi en iyi nasıl kullanırız?',
    options: ['⚖️ Dengeli ve faydalı işler için', '🌙 Gece boyunca', '😠 Kızgın olduğumuzda'],
    correctIndex: 0,
    points: 10,
    fact: 'Teknoloji doğru zamanda, doğru amaçla kullanılınca faydalıdır.',
    isActive: true,
  },
  {
    id: 'g2-teknoloji-2',
    grade: 2,
    topicId: 'teknoloji',
    difficulty: 'easy-medium',
    visual: '💬',
    text: 'İnternette tanımadığın biri "adresini söyle" dedi. Ne yapmalısın?',
    options: ['📝 Hemen yazarım', '🤫 Sır olarak saklarım', '🛡️ Söylemem, büyüğüme haber veririm'],
    correctIndex: 2,
    points: 10,
    fact: 'Kişisel bilgilerimizi kimseyle paylaşmayız; büyüğümüze söyleriz.',
    isActive: true,
  },
  {
    id: 'g2-sigara-1',
    grade: 2,
    topicId: 'sigara',
    difficulty: 'easy-medium',
    visual: '🚬',
    text: 'Arkadaşın "sigara denemek ister misin?" dedi. Ne dersin?',
    options: ['😎 Havalı bulurum', '🙅‍♂️ Hayır derim', '🙈 Bir kere denerim'],
    correctIndex: 1,
    points: 10,
    fact: 'Sigara sağlığa zararlıdır. "Hayır" demek en cesur seçimdir.',
    isActive: true,
  },
  {
    id: 'g2-zararli-1',
    grade: 2,
    topicId: 'zararli',
    difficulty: 'easy-medium',
    visual: '🧴',
    text: 'Evde tanımadığın bir kutu buldun. Ne yapmalısın?',
    options: ['👅 Tadına bakarım', '🎒 Çantama koyarım', '🙋 Anneme babama gösteririm'],
    correctIndex: 2,
    points: 10,
    fact: 'Tanımadığımız maddelere dokunmayız; büyüğümüze gösteririz.',
    isActive: true,
  },
  {
    id: 'g2-yapayzeka-1',
    grade: 2,
    topicId: 'yapayzeka',
    difficulty: 'easy-medium',
    visual: '🤖',
    text: 'Yapay zekâ sana bir şey söyledi. Her zaman doğru mu?',
    options: ['🧠 Bazen yanılabilir, kontrol ederim', '🤓 Her şeyi doğrudur', '📵 Hiç kullanmam'],
    correctIndex: 0,
    points: 10,
    fact: 'Yapay zekâ yardımcıdır ama söylediklerini büyüğümüzle kontrol ederiz.',
    isActive: true,
  },
  {
    id: 'g3-ekran-1',
    grade: 3,
    topicId: 'ekran',
    difficulty: 'medium',
    visual: '⏳',
    text: 'Günde ne kadar ekran süresi daha dengeli?',
    options: ['🌙 Gece sabaha kadar', '⏰ Sınırlı ve belli saatlerde', '🌞 Tüm gün'],
    correctIndex: 1,
    points: 10,
    fact: 'Ekran süresini planlamak dengeyi sağlar.',
    isActive: true,
  },
  {
    id: 'g3-ekran-2',
    grade: 3,
    topicId: 'ekran',
    difficulty: 'medium',
    visual: '📱',
    text: 'Ekran molası vermezsek ne olur?',
    options: ['🎉 Hiçbir sorun olmaz', '💪 Daha zeki oluruz', '🤕 Gözlerimiz ve bedenimiz yorulur'],
    correctIndex: 2,
    points: 10,
    fact: 'Uzun ekran gözleri ve bedeni yorar; mola şarttır.',
    isActive: true,
  },
  {
    id: 'g3-ekran-3',
    grade: 3,
    topicId: 'ekran',
    difficulty: 'medium',
    visual: '🍽️',
    text: 'Yemek yerken ekran kullanmak doğru mu?',
    options: [
      '🏠 Hayır, aile ile sohbet daha güzel',
      '📺 Evet, çizgi film izlerim',
      '🤷 Fark etmez',
    ],
    correctIndex: 0,
    points: 10,
    fact: 'Yemekte ekransız zaman, ailemizle bağımızı güçlendirir.',
    isActive: true,
  },
  {
    id: 'g3-teknoloji-1',
    grade: 3,
    topicId: 'teknoloji',
    difficulty: 'medium',
    visual: '🔑',
    text: 'İnternette güçlü şifre neden önemlidir?',
    options: ['🎲 Şans getirir', '📛 Hiç gerekli değildir', '🔒 Bilgilerimizi korur'],
    correctIndex: 2,
    points: 10,
    fact: 'Şifre, dijital dünyadaki ev anahtarımızdır.',
    isActive: true,
  },
  {
    id: 'g3-teknoloji-2',
    grade: 3,
    topicId: 'teknoloji',
    difficulty: 'medium',
    visual: '🎮',
    text: 'Oyun oynarken sürenin farkına varmazsan ne yapmalısın?',
    options: ['🌙 Daha da oynarım', '⏰ Önceden alarm kurarım', '📵 Oyunu tamamen bırakırım'],
    correctIndex: 1,
    points: 10,
    fact: 'Alarm gibi hatırlatıcılar dengede kalmamıza yardım eder.',
    isActive: true,
  },
  {
    id: 'g3-sigara-1',
    grade: 3,
    topicId: 'sigara',
    difficulty: 'medium',
    visual: '🚬',
    text: 'Sigara dumanı olan bir yerde ne yapmalısın?',
    options: [
      '🫁 Derin nefes alırım',
      '🪑 Orada oturmaya devam ederim',
      '🌬️ Uzaklaşıp temiz hava alırım',
    ],
    correctIndex: 2,
    points: 10,
    fact: 'Sigara dumanı sadece içene değil, çevresindekilere de zarar verir.',
    isActive: true,
  },
  {
    id: 'g3-sigara-2',
    grade: 3,
    topicId: 'sigara',
    difficulty: 'medium',
    visual: '💬',
    text: 'Sigara içen biri "zararı yok" derse ne düşünmelisin?',
    options: ['🧠 Bilim zararlı olduğunu söylüyor', '🤔 Belki doğrudur', '😮 Ona inanırım'],
    correctIndex: 0,
    points: 10,
    fact: 'Bilim, sigaranın sağlığa zararlı olduğunu kanıtlamıştır.',
    isActive: true,
  },
  {
    id: 'g3-zararli-1',
    grade: 3,
    topicId: 'zararli',
    difficulty: 'medium',
    visual: '🎁',
    text: 'Tanımadığın biri sana bir şey verirse ne yapmalısın?',
    options: [
      '🤐 Kimseye söylemem',
      '🗣️ Reddedip güvendiğim büyüğüme söylerim',
      '🤝 Teşekkür edip alırım',
    ],
    correctIndex: 1,
    points: 10,
    fact: 'Güvenli davranış: reddet ve büyüğüne anlat.',
    isActive: true,
  },
  {
    id: 'g3-zararli-2',
    grade: 3,
    topicId: 'zararli',
    difficulty: 'medium',
    visual: '🧪',
    text: 'Okulda çantanda olmayan bir madde buldun. Ne yapmalısın?',
    options: ['👃 Koklarım', '🤫 Cebime koyarım', '👩‍🏫 Öğretmenime teslim ederim'],
    correctIndex: 2,
    points: 10,
    fact: 'Bilmediğimiz maddelere dokunmadan büyüğümüze haber veririz.',
    isActive: true,
  },
  {
    id: 'g3-yapayzeka-1',
    grade: 3,
    topicId: 'yapayzeka',
    difficulty: 'medium',
    visual: '🤖',
    text: 'Yapay zekâdan ödev için yardım isterken en doğru yol hangisi?',
    options: [
      '🤷 Hiç düşünmeden kullanırım',
      '💡 Fikir alıp kendim yazarım',
      '📋 Kopyalayıp aynen veririm',
    ],
    correctIndex: 1,
    points: 10,
    fact: 'Yapay zekâ fikir verir; öğrenmek için kendimiz yazarız.',
    isActive: true,
  },
  {
    id: 'g4-ekran-1',
    grade: 4,
    topicId: 'ekran',
    difficulty: 'medium-hard',
    visual: '📱',
    text: 'Çok fazla ekran kullanmak beynimizi nasıl etkiler?',
    options: [
      '🚀 Her zaman hızlandırır',
      '🌟 Hiç etkilemez',
      '😴 Odaklanmayı ve uykuyu zorlaştırır',
    ],
    correctIndex: 2,
    points: 10,
    fact: 'Dengesiz ekran, dikkat ve uyku düzenini bozar.',
    isActive: true,
  },
  {
    id: 'g4-ekran-2',
    grade: 4,
    topicId: 'ekran',
    difficulty: 'medium-hard',
    visual: '🕐',
    text: 'Ekran süresini azaltmak için en iyi yöntem hangisi?',
    options: [
      '🌙 Sadece gece kullanmak',
      '📅 Günlük plan ve süre sınırı',
      '📴 Teknolojiyi tamamen bırakmak',
    ],
    correctIndex: 1,
    points: 10,
    fact: 'Amaç tamamen bırakmak değil, dengeli planlamaktır.',
    isActive: true,
  },
  {
    id: 'g4-ekran-3',
    grade: 4,
    topicId: 'ekran',
    difficulty: 'medium-hard',
    visual: '🎮',
    text: 'Arkadaşın sürekli oyun oynadığı için derslerine çalışamıyor. Ona ne önerirsin?',
    options: [
      '🎮 Daha çok oynamayı',
      '🤐 Karışmamayı',
      '📵 Oyunu tamamen yasaklamayı',
      '⏰ Birlikte dengeli bir plan yapmayı',
    ],
    correctIndex: 3,
    points: 10,
    fact: 'Destek olmak, birlikte plan yapmaktır.',
    isActive: true,
  },
  {
    id: 'g4-teknoloji-1',
    grade: 4,
    topicId: 'teknoloji',
    difficulty: 'medium-hard',
    visual: '🌐',
    text: 'İnternette gördüğün her bilgi doğru mu?',
    options: [
      '🔍 Hayır, güvenilir kaynaklardan kontrol ederim',
      '🙂 Evet, internette yazıyorsa doğrudur',
      '🤔 Sadece resimler doğrudur',
    ],
    correctIndex: 0,
    points: 10,
    fact: 'Bilgiyi birden fazla güvenilir kaynaktan doğrularız.',
    isActive: true,
  },
  {
    id: 'g4-teknoloji-2',
    grade: 4,
    topicId: 'teknoloji',
    difficulty: 'medium-hard',
    visual: '🔐',
    text: 'Şifreni arkadaşın istedi. Ne yapmalısın?',
    options: [
      '📢 Herkesle paylaşırım',
      '📝 Defterime yazarım',
      '🛡️ Paylaşmam, sadece ailemle konuşurum',
      '🤝 Veririm, sonuçta arkadaşım',
    ],
    correctIndex: 2,
    points: 10,
    fact: 'Şifreler kişiye özeldir; en yakın arkadaşla bile paylaşılmaz.',
    isActive: true,
  },
  {
    id: 'g4-teknoloji-3',
    grade: 4,
    topicId: 'teknoloji',
    difficulty: 'medium-hard',
    visual: '⚖️',
    text: 'Dijital denge ne demektir?',
    options: [
      '📵 Hiç teknoloji kullanmamak',
      '🧭 Teknolojiyi faydalı işler için ölçülü kullanmak',
      '📱 Telefonu her an elimizde tutmak',
    ],
    correctIndex: 1,
    points: 10,
    fact: 'Denge: teknoloji hayatımızın bir parçasıdır, tamamı değil.',
    isActive: true,
  },
  {
    id: 'g4-sigara-1',
    grade: 4,
    topicId: 'sigara',
    difficulty: 'medium-hard',
    visual: '🚬',
    text: 'Sigaranın ilk denemede bile zarar vermesinin nedeni nedir?',
    options: [
      '😌 Hiç zararı yoktur',
      '💨 Sadece kokusu rahatsız eder',
      '🧪 İçindeki maddeler bağımlılık yapar',
    ],
    correctIndex: 2,
    points: 10,
    fact: 'Sigara maddeleri kısa sürede bağımlılık yapabilir; ilk deneme bile risklidir.',
    isActive: true,
  },
  {
    id: 'g4-sigara-2',
    grade: 4,
    topicId: 'sigara',
    difficulty: 'medium-hard',
    visual: '👥',
    text: 'Sigara içen bir arkadaşın var. Ona nasıl yardım edebilirsin?',
    options: [
      '💙 Nazikçe uyarır, bir büyüğümüze söylemesini öneririm',
      '😂 Onunla dalga geçerim',
      '🚬 Onunla birlikte içerim',
    ],
    correctIndex: 0,
    points: 10,
    fact: 'Doğru destek: saygılı uyarı ve güvendiği büyüğüne yönlendirme.',
    isActive: true,
  },
  {
    id: 'g4-zararli-1',
    grade: 4,
    topicId: 'zararli',
    difficulty: 'medium-hard',
    visual: '🎭',
    text: 'Güvenli seçim nedir?',
    options: [
      '🌙 Gizlice denemek',
      '🙋 Bilmediğim hiçbir maddeyi kullanmamak, büyüğüme danışmak',
      '😎 Arkadaşlar ne yapıyorsa onu yapmak',
    ],
    correctIndex: 1,
    points: 10,
    fact: 'Güvenli seçim her zaman açık ve bilinçli olandır.',
    isActive: true,
  },
  {
    id: 'g4-zararli-2',
    grade: 4,
    topicId: 'zararli',
    difficulty: 'medium-hard',
    visual: '💭',
    text: 'Böyle bir durumla karşılaşırsan ilk adım ne olmalı?',
    options: [
      '🤐 Sır olarak saklamak',
      '🌐 Sadece internette araştırmak',
      '🗣️ Güvendiğim bir büyüğüme hemen anlatmak',
    ],
    correctIndex: 2,
    points: 10,
    fact: 'Konuşmak en güçlü korumadır; utanılacak bir şey yoktur.',
    isActive: true,
  },
  {
    id: 'g4-yapayzeka-1',
    grade: 4,
    topicId: 'yapayzeka',
    difficulty: 'medium-hard',
    visual: '🤖',
    text: 'Yapay zekânın verdiği bilgiler neden yanlış olabilir?',
    options: [
      '🧠 Öğrendiği veriler eksik veya hatalı olabilir',
      '🤖 Asla yanılmaz',
      '🌟 Hep sihir yapar',
    ],
    correctIndex: 0,
    points: 10,
    fact: 'Yapay zekâ olasılıkla çalışır; sonuç her zaman %100 doğru değildir.',
    isActive: true,
  },
  {
    id: 'g4-yapayzeka-2',
    grade: 4,
    topicId: 'yapayzeka',
    difficulty: 'medium-hard',
    visual: '💬',
    text: 'Yapay zekâ sohbetine kişisel bilgi yazmak doğru mu?',
    options: [
      '🤷 Bazen olabilir',
      '🛡️ Hayır, adres ve okul gibi bilgileri paylaşmam',
      '🙂 Evet, sorun olmaz',
    ],
    correctIndex: 1,
    points: 10,
    fact: 'Kişisel bilgiler hiçbir sohbette paylaşılmaz.',
    isActive: true,
  },
];

export function buildSeedData(): Omit<DBData, 'results' | 'certificates' | 'admins'> {
  return {
    classes: seedClasses,
    topics: seedTopics,
    questions: seedQuestions,
    gradeSettings: seedGradeSettings,
    config: defaultConfig(),
  };
}


/**
 * v2.4 içerik senkronizasyonu — soru bankasının kanonik sürümü (yukarıdaki
 * `seedQuestions`) cihazdaki kayıtlı sorulara uygulanır:
 *  · her görsel tek emoji,
 *  · yargı bildiren (✅/❌/🚫/🛑…) seçenek emojileri nötr eylem emojilerine döndü,
 *  · doğru şık soru bazında döndürüldü; eskiden tüm sorularda ilk sıradaydı ve
 *    bu, okuma yazması zayıf çocuğa bile işleyen bir kopya yoluydu.
 *
 * Admin'in kendi ürettiği/düzenlediği soru korunur: `edited` işaretliyse veya
 * metin/bilgi/puan/seviye/konu/zorluk birebir eşleşmiyorsa dokunulmaz.
 * Şık sırası değişen sorularda eski katılımcı cevaplarının şık numarası da
 * taşınır — puan ve doğru/yanlış durumu değişmez. Geçiş idempotenttir.
 */

/** "<emoji> <metin>" biçimindeki seçeneğin yalnız metin kısmını döndürür. */
function optionText(option: string): string {
  const space = option.indexOf(' ');
  return (space > 0 ? option.slice(space + 1) : option).trim();
}

export interface SeedQuestionSyncResult {
  syncedQuestions: number;
  remappedAnswers: number;
}

export function syncSeedQuestions(
  questions: Question[],
  results: TestResult[],
): SeedQuestionSyncResult {
  const permutations = new Map<string, number[]>();
  let syncedQuestions = 0;

  for (const question of questions) {
    if (question.edited) continue;
    const canonical = seedQuestions.find((item) => item.id === question.id);
    if (!canonical) continue;
    const sameFrame =
      question.text === canonical.text &&
      question.fact === canonical.fact &&
      question.points === canonical.points &&
      question.grade === canonical.grade &&
      question.topicId === canonical.topicId &&
      question.difficulty === canonical.difficulty;
    if (!sameFrame) continue;
    const alreadyCurrent =
      question.visual === canonical.visual &&
      question.correctIndex === canonical.correctIndex &&
      question.options.join('\n') === canonical.options.join('\n');
    if (alreadyCurrent) continue;

    // Eski şık -> yeni şık: birebir metin, olmazsa emoji-insensizin.
    const permutation = question.options.map((option) => {
      const exact = canonical.options.indexOf(option);
      if (exact >= 0) return exact;
      const text = optionText(option);
      return canonical.options.findIndex((item) => optionText(item) === text);
    });
    const unmapped = permutation.some((index) => index < 0);
    const ambiguous = new Set(permutation).size !== permutation.length;
    if (unmapped || ambiguous) continue;

    question.visual = canonical.visual;
    question.options = [...canonical.options];
    question.correctIndex = canonical.correctIndex;
    syncedQuestions += 1;
    permutations.set(question.id, permutation);
  }

  let remappedAnswers = 0;
  if (permutations.size === 0) return { syncedQuestions, remappedAnswers };
  for (const result of results) {
    for (const answer of result.answers) {
      const permutation = permutations.get(answer.questionId);
      if (!permutation) continue;
      const moved = permutation[answer.selectedIndex];
      if (moved === undefined || moved === answer.selectedIndex) continue;
      answer.selectedIndex = moved;
      remappedAnswers += 1;
    }
  }
  return { syncedQuestions, remappedAnswers };
}

const LEGACY_TITLE_NAMES = ['Sınıfın Bilgesi', 'Farkındalık Kahramanı', 'Bilinçli Kahraman'];

/**
 * Eski 3'lü unvan setini HAYVAN setiyle değiştirir — yalnız birebir eski setle
 * eşleşiyorsa (admin kendi kuralını yazdıysa dokunulmaz).
 */
export function applyConfigTitleMigration(config: AppConfig): boolean {
  const names = config.titles.map((title) => title.name);
  const isLegacy =
    config.titles.length === LEGACY_TITLE_NAMES.length &&
    LEGACY_TITLE_NAMES.every((name) => names.includes(name));
  if (!isLegacy) return false;
  config.titles = seedTitles;
  return true;
}
