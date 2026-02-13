import AppLayout from "@/components/layout/AppLayout";

const RAMADAN_DUAS = [
  {
    day: 1,
    arabic: "اللَّهُمَّ اجْعَلُ صِيَامِي فِيهِ صِيَامَ الصَّائِمِينَ وَقِيَانِي فِيهِ قِيامَ الْقَائِمِينَ وَنَبْهُنِي فِيهِ عَنْ نَوْمَةِ الْغَافِلِينَ وَهَبْ لي جُرْمِي فِيهِ يَا الهَ الْعَالَمِينَ وَاعْفُ عَنِّى يَا عَافِنَا عَنِ الْمُجْرِمِينَ",
  },
];

const Dua = () => {
  return (
    <AppLayout>
      <div className="px-4 py-6 animate-fade-in">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6 text-center">
          Ramadan Daily Duas
        </h1>
        <p className="text-muted-foreground text-sm text-center mb-6">
          روزانہ کی دعائیں
        </p>

        <div className="space-y-4">
          {RAMADAN_DUAS.map((dua) => (
            <div
              key={dua.day}
              className="rounded-2xl border border-border bg-card p-5 shadow-md prayer-card-shadow animate-slide-up"
            >
              {/* Day Header */}
              <div
                className="rounded-xl px-4 py-2 mb-4 text-center"
                style={{
                  background: "linear-gradient(135deg, #145C43 0%, #1E7F5C 50%, #28A070 100%)",
                }}
              >
                <h2 className="text-white font-display font-bold text-lg">
                  Day {dua.day}
                </h2>
                <p className="text-white/70 text-xs">Ramadan — رمضان</p>
              </div>

              {/* Arabic Dua */}
              <p
                className="text-foreground text-xl leading-loose text-right font-arabic"
                dir="rtl"
              >
                {dua.arabic}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dua;
