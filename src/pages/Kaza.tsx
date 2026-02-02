import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const prayers = ["Fajr", "Zuhr", "Asr", "Maghrib", "Isha"];

const Kaza = () => {
  const [prayer, setPrayer] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  const handleSave = () => {
    if (!prayer || !time) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    toast.success("Kaza prayer recorded successfully!", {
      description: `${prayer} at ${time}`,
    });
    
    setPrayer("");
    setTime("");
    setReason("");
  };

  return (
    <AppLayout>
      <div className="px-4 py-6 animate-fade-in">
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          Kaza Prayer
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Record any missed prayers to make up later
        </p>

        <div className="space-y-5">
          {/* Prayer Selection */}
          <div className="bg-card rounded-xl p-5 prayer-card-shadow animate-slide-up">
            <label className="block text-sm font-medium text-foreground mb-3">
              Select Prayer
            </label>
            <Select value={prayer} onValueChange={setPrayer}>
              <SelectTrigger className="h-12 rounded-xl bg-background border-border">
                <SelectValue placeholder="Choose a prayer..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {prayers.map((p) => (
                  <SelectItem key={p} value={p} className="cursor-pointer">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Input */}
          <div className="bg-card rounded-xl p-5 prayer-card-shadow animate-slide-up" style={{ animationDelay: "100ms" }}>
            <label className="block text-sm font-medium text-foreground mb-3">
              Time Missed
            </label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-12 rounded-xl bg-background border-border"
            />
          </div>

          {/* Reason Input */}
          <div className="bg-card rounded-xl p-5 prayer-card-shadow animate-slide-up" style={{ animationDelay: "200ms" }}>
            <label className="block text-sm font-medium text-foreground mb-3">
              Reason (Optional)
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why was the prayer missed?"
              className="min-h-[100px] rounded-xl bg-background border-border resize-none"
            />
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSave}
            className="w-full h-14 text-lg font-semibold rounded-xl bg-secondary hover:bg-secondary/90 btn-shadow animate-slide-up"
            style={{ animationDelay: "300ms" }}
          >
            Save Kaza Record
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Kaza;
