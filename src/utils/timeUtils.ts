import { toZonedTime, format } from 'date-fns-tz';

const WIB_TIMEZONE = 'Asia/Jakarta';

export function getNowWIB(): Date {
  return toZonedTime(new Date(), WIB_TIMEZONE);
}

export function formatWIB(date: Date, pattern: string): string {
  const zonedDate = toZonedTime(date, WIB_TIMEZONE);
  return format(zonedDate, pattern, { timeZone: WIB_TIMEZONE });
}

export function getWIBDateForDay(dayOffset: number, h: number, m: number, baseDate: Date = new Date()): Date {
    const wibDate = toZonedTime(baseDate, WIB_TIMEZONE);
    wibDate.setDate(wibDate.getDate() + dayOffset);
    
    const year = wibDate.getFullYear();
    const month = String(wibDate.getMonth() + 1).padStart(2, '0');
    const day = String(wibDate.getDate()).padStart(2, '0');
    const hour = String(h).padStart(2, '0');
    const min = String(m).padStart(2, '0');
    
    return new Date(`${year}-${month}-${day}T${hour}:${min}:00+07:00`);
}
