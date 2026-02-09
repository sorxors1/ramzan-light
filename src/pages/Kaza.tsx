import { useState, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useMissedDates } from "@/hooks/useMissedPrayers";
import { useQazaRecords, useSaveQazaRecord } from "@/hooks/useQazaRecords";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const sessionNames: Record<string, { en: string; ur: string }> = {
  fajr: { en: "Fajr", ur: "فجر" },
  zoharain: { en: "Zoharain", ur: "ظہرین" },
  magribain: { en: "Magribain", ur: "مغربین" },
};

const formatDateDisplay = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Kaza = () => {
  const { user } = useAuth();
  const { missedDates, missedByDate, isLoading } = useMissedDates(user?.id);
  const { data: qazaRecords = [], isLoading: qazaLoading } = useQazaRecords(user?.id);
  const saveQaza = useSaveQazaRecord();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPrayer, setSelectedPrayer] = useState("");
  const [reason, setReason] = useState("");

  const availablePrayers = useMemo(() => {
    if (!selectedDate || !missedByDate || !missedByDate[selectedDate]) {
      return [];
    }
    return missedByDate[selectedDate];
  }, [selectedDate, missedByDate]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedPrayer("");
  };

  const handleSave = () => {
    if (!selectedDate || !selectedPrayer || !reason.trim() || !user?.id) return;

    const prayer = availablePrayers.find((p) => p.sessionType === selectedPrayer);

    saveQaza.mutate(
      {
        userId: user.id,
        date: selectedDate,
        sessionType: selectedPrayer,
        reason: reason.trim(),
      },
      {
        onSuccess: () => {
          toast.success("قضا نماز درج ہو گئی!", {
            description: `${prayer?.sessionName.en} on ${formatDateDisplay(selectedDate)}`,
          });
          setSelectedDate("");
          setSelectedPrayer("");
          setReason("");
        },
        onError: () => {
          toast.error("Error saving Qaza record");
        },
      }
    );
  };

  if (isLoading || qazaLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const hasNoMissedPrayers = missedDates.length === 0;

  return (
    <AppLayout>
      <div className="px-4 py-6 animate-fade-in">
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          Qaza Prayer | قضا نماز
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Record reason for missed prayers | چھوٹی ہوئی نمازوں کی وجہ درج کریں
        </p>

        {hasNoMissedPrayers ? (
          <div className="bg-card rounded-xl p-8 prayer-card-shadow text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              No Missed Prayers | کوئی قضا نماز نہیں
            </h2>
            <p className="text-muted-foreground text-sm">
              MashaAllah! You have marked all your prayers on time.
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              ماشاء اللہ! آپ نے تمام نمازیں وقت پر ادا کیں۔
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Date and Prayer Selection */}
            <div className="bg-card rounded-xl p-5 prayer-card-shadow animate-slide-up">
              <label className="block text-sm font-medium text-foreground mb-3">
                Select Date & Prayer | تاریخ اور نماز منتخب کریں
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Select value={selectedDate} onValueChange={handleDateChange}>
                    <SelectTrigger className="h-12 rounded-xl bg-background border-border">
                      <SelectValue placeholder="Date | تاریخ" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border max-h-[300px]">
                      {missedDates.map((date) => (
                        <SelectItem key={date} value={date} className="cursor-pointer">
                          {formatDateDisplay(date)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Select value={selectedPrayer} onValueChange={setSelectedPrayer} disabled={!selectedDate}>
                    <SelectTrigger className="h-12 rounded-xl bg-background border-border">
                      <SelectValue placeholder="Prayer | نماز" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {availablePrayers.map((prayer) => (
                        <SelectItem key={prayer.sessionType} value={prayer.sessionType} className="cursor-pointer">
                          {prayer.sessionName.en} | {prayer.sessionName.ur}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {selectedDate && availablePrayers.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">No missed prayers on this date</p>
              )}
            </div>

            {/* Reason Input */}
            <div className="bg-card rounded-xl p-5 prayer-card-shadow animate-slide-up" style={{ animationDelay: "100ms" }}>
              <label className="block text-sm font-medium text-foreground mb-3">
                Reason (Required) | وجہ (ضروری)
                <span className="text-destructive ml-1">*</span>
              </label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why was the prayer missed? | نماز کیوں چھوٹی؟"
                className="min-h-[100px] rounded-xl bg-background border-border resize-none"
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={!selectedDate || !selectedPrayer || !reason.trim() || saveQaza.isPending}
              className="w-full h-14 text-lg font-semibold rounded-xl bg-secondary hover:bg-secondary/90 btn-shadow animate-slide-up disabled:opacity-50"
              style={{ animationDelay: "200ms" }}
            >
              {saveQaza.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : null}
              Save Qaza Record | قضا درج کریں
            </Button>

            {/* Info */}
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground">
                {missedDates.length} date(s) with missed prayers
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {missedDates.length} تاریخوں پر نماز قضا
              </p>
            </div>
          </div>
        )}

        {/* Marked Qaza Records Table */}
        {qazaRecords.length > 0 && (
          <div className="mt-6 bg-card rounded-xl p-5 prayer-card-shadow animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Marked Qaza | ادا شدہ قضا
              </h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date | تاریخ</TableHead>
                    <TableHead className="text-xs">Prayer | نماز</TableHead>
                    <TableHead className="text-xs">Reason | وجہ</TableHead>
                    <TableHead className="text-xs">Marked At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qazaRecords.map((record) => {
                    const names = sessionNames[record.session_type] || {
                      en: record.session_type,
                      ur: record.session_type,
                    };
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="text-xs">{formatDateDisplay(record.date)}</TableCell>
                        <TableCell className="text-xs">
                          {names.en}
                          <span className="block text-muted-foreground font-urdu">{names.ur}</span>
                        </TableCell>
                        <TableCell className="text-xs max-w-[120px] truncate">{record.reason}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDateTime(record.marked_at)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Kaza;
