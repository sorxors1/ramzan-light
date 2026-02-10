// Faisalabad timezone offset: UTC+5
const FAISALABAD_OFFSET = 5;

export interface PrayerTiming {
  id: string;
  date: string;
  day_name: string;
  fajr_start: string;
  sunrise: string;
  dhuhr_start: string;
  asr_end: string;
  maghrib_start: string;
  isha_end: string;
}

export interface SessionWindow {
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  isLocked: boolean;
  isPast: boolean;
}

// Get current Faisalabad time
export const getFaisalabadTime = (): Date => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 3600000 * FAISALABAD_OFFSET);
};

// Format time for display
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

// Format date for display
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format date for Urdu display
export const formatDateUrdu = (date: Date): string => {
  const days: Record<number, string> = {
    0: 'اتوار',
    1: 'پیر',
    2: 'منگل',
    3: 'بدھ',
    4: 'جمعرات',
    5: 'جمعہ',
    6: 'ہفتہ',
  };
  return days[date.getDay()] || '';
};

// Get date string in YYYY-MM-DD format for Faisalabad timezone
export const getFaisalabadDateString = (): string => {
  const faisalabadTime = getFaisalabadTime();
  return faisalabadTime.toISOString().split('T')[0];
};

// Parse time string (HH:MM) to Date object for today in Faisalabad
export const parseTimeToDate = (timeStr: string, dateStr: string): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(dateStr);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Get session windows for a given day's timing
export const getSessionWindows = (
  timing: PrayerTiming,
  currentTime: Date
): Record<string, SessionWindow> => {
  const dateStr = timing.date;
  
  // Fajr: from fajr_start to sunrise
  const fajrStart = parseTimeToDate(timing.fajr_start, dateStr);
  const fajrEnd = parseTimeToDate(timing.sunrise, dateStr);
  
  // Zoharain: from dhuhr_start to maghrib_start (Dhuhr + Asr combined window)
  const zoharainStart = parseTimeToDate(timing.dhuhr_start, dateStr);
  const zoharainEnd = parseTimeToDate(timing.maghrib_start, dateStr);
  
  // Magribain: from maghrib_start to isha_end (Maghrib + Isha combined window)
  const magribainStart = parseTimeToDate(timing.maghrib_start, dateStr);
  let magribainEnd = parseTimeToDate(timing.isha_end, dateStr);
  // If isha_end is midnight (00:00), it means end of day — push to next day's midnight
  if (magribainEnd <= magribainStart) {
    magribainEnd = new Date(magribainEnd.getTime() + 24 * 60 * 60 * 1000);
  }

  const getSessionStatus = (start: Date, end: Date): SessionWindow => {
    const isActive = currentTime >= start && currentTime <= end;
    const isPast = currentTime > end;
    const isLocked = isPast;
    
    return { startTime: start, endTime: end, isActive, isLocked, isPast };
  };

  return {
    fajr: getSessionStatus(fajrStart, fajrEnd),
    zoharain: getSessionStatus(zoharainStart, zoharainEnd),
    magribain: getSessionStatus(magribainStart, magribainEnd),
  };
};

// Calculate time percentage (which third of the window)
export const calculateTimePercentage = (
  currentTime: Date,
  startTime: Date,
  endTime: Date
): number => {
  const totalDuration = endTime.getTime() - startTime.getTime();
  const elapsed = currentTime.getTime() - startTime.getTime();
  return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
};

// Get feedback tier based on percentage
export type FeedbackTier = 'early' | 'middle' | 'late';

export const getFeedbackTier = (percentage: number): FeedbackTier => {
  if (percentage <= 33.33) return 'early';
  if (percentage <= 66.66) return 'middle';
  return 'late';
};

// Feedback messages in English and Urdu
export interface FeedbackMessage {
  title: string;
  titleUrdu: string;
  message: string;
  messageUrdu: string;
}

export const getFeedbackMessage = (tier: FeedbackTier): FeedbackMessage => {
  switch (tier) {
    case 'early':
      return {
        title: 'Awal Waqt!',
        titleUrdu: 'اول وقت!',
        message: 'Excellent! You have prayed in the first time of prayer. May Allah accept your prayers.',
        messageUrdu: 'بہت خوب! آپ نے اول وقت میں نماز پڑھی۔ اللہ آپ کی نمازیں قبول فرمائے۔',
      };
    case 'middle':
      return {
        title: 'Shabash!',
        titleUrdu: 'شاباش!',
        message: 'Good work! You have offered your prayer. May Allah bless you.',
        messageUrdu: 'شاباش! آپ نے نماز ادا کی۔ اللہ آپ کو برکت دے۔',
      };
    case 'late':
      return {
        title: 'Masha Allah',
        titleUrdu: 'ماشاءاللہ',
        message: 'Masha Allah, you have read the Namaz, but try to read it as early as possible.',
        messageUrdu: 'ماشاءاللہ، آپ نے نماز پڑھی، لیکن جلد از جلد پڑھنے کی کوشش کریں۔',
      };
  }
};

// Session type names
export const sessionNames: Record<string, { en: string; ur: string }> = {
  fajr: { en: 'Fajr', ur: 'فجر' },
  zoharain: { en: 'Zoharain', ur: 'ظہرین' },
  magribain: { en: 'Magribain', ur: 'مغربین' },
  test: { en: 'Test Prayer', ur: 'ٹیسٹ' },
};

// Status labels
export const statusLabels = {
  ada: { en: 'Namaz Ada', ur: 'نماز ادا' },
  kaza: { en: 'Namaz Qaza', ur: 'نماز قضا' },
  pending: { en: 'Pending', ur: 'زیر التوا' },
};
