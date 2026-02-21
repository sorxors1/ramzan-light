import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface AttendanceRecord {
  date: string;
  session_type: string;
  extra_ziker?: string | null;
  good_deed?: string | null;
}

interface AttendanceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  type: "dhikr" | "goodDeed";
  records: AttendanceRecord[];
}

const sessionLabels: Record<string, string> = {
  fajr: "Fajr",
  zoharain: "Zoharain",
  magribain: "Maghribain",
};

const AttendanceDetailDialog = ({
  open,
  onOpenChange,
  userName,
  type,
  records,
}: AttendanceDetailDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const field = type === "dhikr" ? "extra_ziker" : "good_deed";
  const title = type === "dhikr" ? "Extra Dhikr" : "Good Deeds";

  // Filter records that have content for this type
  const relevantRecords = useMemo(
    () => records.filter((r) => r[field] && r[field]!.trim()),
    [records, field]
  );

  // Set of date strings that have entries
  const highlightedDates = useMemo(() => {
    const dates = new Set<string>();
    relevantRecords.forEach((r) => dates.add(r.date));
    return dates;
  }, [relevantRecords]);

  // Entries for the selected date
  const selectedEntries = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return relevantRecords.filter((r) => r.date === dateStr);
  }, [selectedDate, relevantRecords]);

  // Modifiers for the calendar
  const highlightedDaysMatcher = useMemo(
    () => Array.from(highlightedDates).map((d) => parseISO(d)),
    [highlightedDates]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">
            {title} — {userName}
          </DialogTitle>
        </DialogHeader>

        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className={cn("p-3 pointer-events-auto")}
          modifiers={{ highlighted: highlightedDaysMatcher }}
          modifiersClassNames={{
            highlighted: "bg-primary/20 text-primary font-bold",
          }}
        />

        {selectedDate && (
          <div className="space-y-2 mt-2">
            <p className="text-xs font-semibold text-muted-foreground">
              {format(selectedDate, "PPP")}
            </p>
            {selectedEntries.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No {title.toLowerCase()} recorded on this date.
              </p>
            ) : (
              selectedEntries.map((entry, i) => (
                <div
                  key={i}
                  className="bg-muted rounded-lg p-2 text-xs space-y-1"
                >
                  <p className="font-semibold text-foreground">
                    {sessionLabels[entry.session_type] || entry.session_type}
                  </p>
                  <p className="text-foreground/80 whitespace-pre-wrap">
                    {entry[field]}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {!selectedDate && highlightedDates.size > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Tap a highlighted date to view details
          </p>
        )}

        {highlightedDates.size === 0 && (
          <p className="text-xs text-muted-foreground text-center italic">
            No {title.toLowerCase()} entries found for this student.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceDetailDialog;
