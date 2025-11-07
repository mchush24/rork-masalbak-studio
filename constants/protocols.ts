export const PROTOCOLS: Record<string, {
  title: string;
  steps: string[];
  donts: string[];
  captureHints?: string[];
}> = {
  DAP: {
    title: "Bir İnsan Çiz (DAP)",
    steps: [
      "A4 + HB kalem; sessiz ortam.",
      "Yönerge: 'Şimdi bir insan çiz. Bittiğinde haber ver.'",
      "Süreyi ve silgi/üst üste çizgileri kaydet."
    ],
    donts: ["Yönlendirme yapma (elleri de çiz vb.)", "Güzel/çirkin yorumu yapma"],
    captureHints: ["Sayfa düz, gölgesiz; tüm alan kadraja girsin."]
  },
  HTP: {
    title: "Ev-Ağaç-İnsan (HTP)",
    steps: [
      "Ayrı sayfalara sırayla Ev, Ağaç, İnsan.",
      "Her biri için aynı yönerge: '... çiz. Bittiğinde haber ver.'",
      "İlişkisel notları kaydet."
    ],
    donts: ["Kapı/pencere/baca isteme", "Üç çizimi tek sayfaya toplama"]
  },
  Aile: {
    title: "Bir Aile Çiz / Kinetik",
    steps: [
      "Yönerge: 'Aileni çiz; herkes bir şey yapıyor olsun.'",
      "Figürler arası mesafeyi ve boy farkını not et."
    ],
    donts: ["Rolleri dikte etme", "Eksik kişi hatırlatma"]
  },
  Kaktus: {
    title: "Kaktüs Çiz",
    steps: [
      "Yönerge: 'Bir kaktüs çiz.'",
      "Diken yoğunluğu/çiçek/saksı not edilmelidir."
    ],
    donts: ["Saksı/çöl/çiçek zorlama"]
  },
  Agac: {
    title: "Ağaç (Koch)",
    steps: ["Yönerge: 'Bir ağaç çiz.'", "Kök/gövde/taç/dal notları"],
    donts: ["Kökü özellikle isteme"]
  },
  Bahce: {
    title: "Bahçe Testi",
    steps: [
      "Yönerge: 'Bir bahçe çiz.'",
      "Elemanlar arası ilişkileri ve yerleşimi not et."
    ],
    donts: ["Çiçek/ağaç sayısı belirtme"]
  },
  Bender: {
    title: "Bender–Gestalt II",
    steps: [
      "Kopya aşaması: 'Bu şekli aynı şekilde kopya et.'",
      "İsteğe bağlı bellek: 5–10 dk sonra hatırlatarak çizdir."
    ],
    donts: ["Kart sırasını atlama"]
  },
  Rey: {
    title: "Rey–Osterrieth",
    steps: ["Kopya: 'Bu şekli kopya et.'", "Gecikmeli bellek: 3–30 dk sonra hatırlatarak çiz."],
    donts: ["Süre kısıtını söyleme"]
  },
  Luscher: {
    title: "Lüscher Renk",
    steps: ["Renkleri en çoktan en aza sırala.", "Sırayı ve süreyi kaydet."],
    donts: ["Renk anlamı söyleme"]
  }
};
