export function generateReportCSV(
  profiles: any[],
  attendance: any[],
  qazaRecords: any[]
): string {
  // Build per-user stats
  const statsMap = new Map<string, {
    display_name: string;
    father_name: string;
    earlyCount: number; earlyPts: number;
    middleCount: number; middlePts: number;
    lateCount: number; latePts: number;
    duaCount: number; duaPts: number;
    quranCount: number; quranPts: number;
    dhikrCount: number; dhikrPts: number;
    goodDeedCount: number; goodDeedPts: number;
    qazaCount: number; qazaPts: number;
    totalPoints: number;
  }>();

  const detailRows: { name: string; date: string; session: string; type: string; text: string }[] = [];

  profiles.forEach((p: any) => {
    statsMap.set(p.user_id, {
      display_name: p.display_name || "Unknown",
      father_name: p.father_name || "",
      earlyCount: 0, earlyPts: 0,
      middleCount: 0, middlePts: 0,
      lateCount: 0, latePts: 0,
      duaCount: 0, duaPts: 0,
      quranCount: 0, quranPts: 0,
      dhikrCount: 0, dhikrPts: 0,
      goodDeedCount: 0, goodDeedPts: 0,
      qazaCount: 0, qazaPts: 0,
      totalPoints: 0,
    });
  });

  attendance.forEach((a: any) => {
    const stat = statsMap.get(a.user_id);
    if (!stat) return;

    if (a.namaz_marked) {
      const tp = a.time_percentage ?? 50;
      if (tp <= 33.33) { stat.earlyCount++; stat.earlyPts += 3; }
      else if (tp <= 66.66) { stat.middleCount++; stat.middlePts += 2; }
      else { stat.lateCount++; stat.latePts += 1; }
    }
    if (a.dua_marked) { stat.duaCount++; stat.duaPts += 1; }
    if (a.quran_marked) { stat.quranCount++; stat.quranPts += 1; }
    if (a.extra_ziker && a.extra_ziker.trim()) {
      stat.dhikrCount++; stat.dhikrPts += 0.5;
      detailRows.push({ name: stat.display_name, date: a.date, session: a.session_type, type: "Extra Dhikr", text: a.extra_ziker.trim() });
    }
    if (a.good_deed && a.good_deed.trim()) {
      stat.goodDeedCount++; stat.goodDeedPts += 0.5;
      detailRows.push({ name: stat.display_name, date: a.date, session: a.session_type, type: "Good Deed", text: a.good_deed.trim() });
    }
  });

  qazaRecords.forEach((q: any) => {
    const stat = statsMap.get(q.user_id);
    if (stat) { stat.qazaCount++; stat.qazaPts += 0.5; }
  });

  statsMap.forEach((s) => {
    s.totalPoints = s.earlyPts + s.middlePts + s.latePts + s.duaPts + s.quranPts + s.dhikrPts + s.goodDeedPts + s.qazaPts;
  });

  const sorted = Array.from(statsMap.values()).sort((a, b) => b.totalPoints - a.totalPoints);

  const esc = (v: any) => {
    const s = String(v ?? "").replace(/"/g, '""');
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
  };

  const headers = [
    "Rank", "Student Name", "Father Name",
    "Early Namaz (Count)", "Early Namaz (Pts)",
    "Middle Namaz (Count)", "Middle Namaz (Pts)",
    "Late Namaz (Count)", "Late Namaz (Pts)",
    "Dua (Count)", "Dua (Pts)",
    "Quran (Count)", "Quran (Pts)",
    "Extra Dhikr (Count)", "Extra Dhikr (Pts)",
    "Good Deeds (Count)", "Good Deeds (Pts)",
    "Qaza (Count)", "Qaza (Pts)",
    "Total Points",
  ];

  let csv = headers.join(",") + "\n";

  sorted.forEach((s, i) => {
    csv += [
      i + 1, esc(s.display_name), esc(s.father_name),
      s.earlyCount, s.earlyPts,
      s.middleCount, s.middlePts,
      s.lateCount, s.latePts,
      s.duaCount, s.duaPts,
      s.quranCount, s.quranPts,
      s.dhikrCount, s.dhikrPts,
      s.goodDeedCount, s.goodDeedPts,
      s.qazaCount, s.qazaPts,
      s.totalPoints,
    ].join(",") + "\n";
  });

  if (detailRows.length > 0) {
    csv += "\n\n--- EXTRA DHIKR & GOOD DEEDS DETAIL ---\n";
    csv += "Student Name,Date,Session,Type,Text\n";
    detailRows
      .sort((a, b) => a.name.localeCompare(b.name) || a.date.localeCompare(b.date))
      .forEach((r) => {
        csv += [esc(r.name), r.date, esc(r.session), r.type, esc(r.text)].join(",") + "\n";
      });
  }

  return csv;
}
