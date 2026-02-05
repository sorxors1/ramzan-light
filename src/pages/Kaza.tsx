import { useState, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useMissedDates } from "@/hooks/useMissedPrayers";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, AlertCircle } from "lucide-react";

const Kaza = () => {
  const { user } = useAuth();
  const { missedDates, missedByDate, isLoading } = useMissedDates(user?.id);
  
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPrayer, setSelectedPrayer] = useState("");
  const [reason, setReason] = useState("");

  // Get prayers available for the selected date
  const availablePrayers = useMemo(() => {
    if (!selectedDate || !missedByDate || !missedByDate[selectedDate]) {
      return [];
    }
    return missedByDate[selectedDate];
  }, [selectedDate, missedByDate]);

  // Reset prayer selection when date changes
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedPrayer("");
  };

  // Format date for display
  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const handleSave = () => {
    if (!selectedDate) {
      toast.error("تاریخ منتخب کریں", {
        description: "Please select a date",
      });
      return;
    }
    
    if (!selectedPrayer) {
      toast.error("نماز منتخب کریں", {
        description: "Please select a prayer",
      });
      return;
    }
    
    if (!reason.trim()) {
      toast.error("وجہ درج کریں", {
        description: "Reason is required",
      });
      return;
    }

    const prayer = availablePrayers.find(p => p.sessionType === selectedPrayer);
    
    toast.success("قضا نماز درج ہو گئی!", {
      description: `${prayer?.sessionName.en} on ${formatDateDisplay(selectedDate)}`,
    });
    
    // Reset form
    setSelectedDate("");
    setSelectedPrayer("");
    setReason("");
  };

  if (isLoading) {
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
          Kaza Prayer | قضا نماز
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
            {/* Date and Prayer Selection - Same Line */}
            <div className="bg-card rounded-xl p-5 prayer-card-shadow animate-slide-up">
              <label className="block text-sm font-medium text-foreground mb-3">
                Select Date & Prayer | تاریخ اور نماز منتخب کریں
              </label>
              <div className="flex gap-3">
                {/* Date Dropdown */}
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

                {/* Prayer Dropdown */}
                <div className="flex-1">
                  <Select 
                    value={selectedPrayer} 
                    onValueChange={setSelectedPrayer}
                    disabled={!selectedDate}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-background border-border">
                      <SelectValue placeholder="Prayer | نماز" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {availablePrayers.map((prayer) => (
                        <SelectItem 
                          key={prayer.sessionType} 
                          value={prayer.sessionType} 
                          className="cursor-pointer"
                        >
                          {prayer.sessionName.en} | {prayer.sessionName.ur}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedDate && availablePrayers.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  No missed prayers on this date
                </p>
              )}
            </div>

            {/* Reason Input - Required */}
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
              disabled={!selectedDate || !selectedPrayer || !reason.trim()}
              className="w-full h-14 text-lg font-semibold rounded-xl bg-secondary hover:bg-secondary/90 btn-shadow animate-slide-up disabled:opacity-50"
              style={{ animationDelay: "200ms" }}
            >
              Save Kaza Record | قضا درج کریں
            </Button>

            {/* Info Section */}
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
      </div>
    </AppLayout>
  );
};

export default Kaza;
