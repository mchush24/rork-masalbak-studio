export type FrequencyAnswer = "never" | "sometimes" | "often";

export interface Question {
  id: string;
  text: string;
  category: "anxiety" | "separation" | "emotional_regulation";
}

export interface QuestionnaireAnswer {
  questionId: string;
  answer: FrequencyAnswer;
}

export interface QuestionnaireResult {
  answers: QuestionnaireAnswer[];
  completedAt: Date;
}

export const QUESTIONNAIRE_QUESTIONS: Question[] = [
  {
    id: "separation_distress",
    text: "Çocuk ayrılınca huzursuz oldu mu?",
    category: "separation",
  },
  {
    id: "stomach_pain",
    text: "Nedensiz karın ağrısı / mide sıkışması",
    category: "anxiety",
  },
  {
    id: "dark_alone",
    text: "Karanlık, yalnız uyuma konusunda zorlanma",
    category: "anxiety",
  },
  {
    id: "sudden_tension",
    text: "Gün içinde, durduk yerde gerginleşme gözlediniz mi?",
    category: "emotional_regulation",
  },
  {
    id: "internalization",
    text: "Duygularını söylemek yerine içine attığı oluyor mu?",
    category: "emotional_regulation",
  },
];

export const QUESTIONNAIRE_INTRO = {
  title: "Birkaç Soru Daha",
  subtitle: "Bu sorular, çocuğun çizimindeki duyguyu daha iyi anlamamız için.",
  note: "Yanlış veya doğru cevap yok.\nSadece sizin gözleminiz bizim için değerli.",
  timeframe: "Son 2 haftada:",
};

export const EXPLANATIONS = {
  normalEmotionalExpression: {
    title: "Duygusal İfade Normaldir",
    text: "Büyük değişim dönemlerinde çocuklar duygularını çizimle ifade edebilir.\nBu çok normaldir. Çizim iç dünyayı rahatlatır.",
  },
  supportNeeded: {
    title: "Destek Önemlidir",
    text: "Bazı çocuklar büyük korku yaşadığında bunu resme aktarır.\nBunu yalnız hissetmemesi önemli.\nİstersek birlikte bir uzmandan ücretsiz yönlendirme alabiliriz.",
  },
  disclaimer: {
    title: "Önemli Not",
    text: "Bu açıklamalar, çizimi anlamaya yardımcı olmak içindir.\nTek başına tanı koymaz, yargı içermez.\nÇocuklar duygularını dönem dönem farklı şekilde ifade edebilir.",
  },
};

export interface DrawingInsight {
  placement: string;
  interpretation: string;
  recommendation: string;
  activity: string;
}
