import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import FaisalabadClock from "@/components/FaisalabadClock";
import FeedbackDialog from "@/components/FeedbackDialog";
import { ArrowLeft, Check, BookOpen, Heart, BookMarked, Sparkles, HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useTodayTiming } from "@/hooks/usePrayerTimings";
import { useSessionAttendance, useSaveAttendance } from "@/hooks/usePrayerAttendance";
import {
  getFaisalabadTime,
  getSessionWindows,
  calculateTimePercentage,
  getFeedbackTier,
  getFeedbackMessage,
  sessionNames,
  FeedbackMessage,
} from "@/lib/prayerUtils";

const PrayerDetail = () => {
  const { prayerId } = useParams<{ prayerId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data: todayTiming } = useTodayTiming();
  const { data: existingAttendance } = useSessionAttendance(user?.id, prayerId || "");
  const saveAttendance = useSaveAttendance();

  const [namazChecked, setNamazChecked] = useState(false);
  const [duaChecked, setDuaChecked] = useState(false);
  const [quranChecked, setQuranChecked] = useState(false);
  const [extraZiker, setExtraZiker] = useState("");
  const [goodDeed, setGoodDeed] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackMessage | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const sessionName = sessionNames[prayerId || ""] || { en: "Prayer", ur: "نماز" };

  // Load existing attendance data
  useEffect(() => {
    if (existingAttendance) {
      setNamazChecked(existingAttendance.namaz_marked);
      setDuaChecked(existingAttendance.dua_marked);
      setQuranChecked(existingAttendance.quran_marked);
      setExtraZiker(existingAttendance.extra_ziker || "");
      setGoodDeed(existingAttendance.good_deed || "");
    }
  }, [existingAttendance]);

  // Check session status
  useEffect(() => {
    const checkStatus = () => {
      if (todayTiming && prayerId) {
        const currentTime = getFaisalabadTime();
        const windows = getSessionWindows(todayTiming, currentTime);
        const window = windows[prayerId];
        if (window) {
          setIsLocked(window.isLocked);
          setIsActive(window.isActive);
        }
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, [todayTiming, prayerId]);

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Please sign in to save attendance");
      navigate("/signin");
      return;
    }

    if (!namazChecked) {
      toast.error("Namaz is required", {
        description: "نماز لازمی ہے",
      });
      return;
    }

    if (!todayTiming || !prayerId) {
      toast.error("Unable to save attendance");
      return;
    }

    if (isLocked) {
      toast.error("This prayer session has ended");
      return;
    }

    try {
      const currentTime = getFaisalabadTime();
      const windows = getSessionWindows(todayTiming, currentTime);
      const window = windows[prayerId];
      
      const timePercentage = window
        ? calculateTimePercentage(currentTime, window.startTime, window.endTime)
        : 50;

      await saveAttendance.mutateAsync({
        userId: user.id,
        sessionType: prayerId,
        namazMarked: namazChecked,
        duaMarked: duaChecked,
        quranMarked: quranChecked,
        extraZiker: extraZiker.trim() || undefined,
        goodDeed: goodDeed.trim() || undefined,
        timePercentage,
      });

      const tier = getFeedbackTier(timePercentage);
      const feedback = getFeedbackMessage(tier);
      setFeedbackData(feedback);
      setShowFeedback(true);
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error("Failed to save attendance");
    }
  };

  const handleFeedbackClose = () => {
    setShowFeedback(false);
    navigate("/attendance");
  };

  if (!prayerId || !sessionNames[prayerId]) {
    return (
      <AppLayout>
        <div className="px-4 py-6 text-center">
          <p className="text-muted-foreground">Invalid prayer session</p>
          <Link to="/attendance" className="text-primary underline mt-4 block">
            Go back
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 py-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link to="/attendance" className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {sessionName.en}
            </h1>
            <p className="text-lg font-urdu text-muted-foreground">{sessionName.ur}</p>
          </div>
        </div>

        {/* Clock */}
        <FaisalabadClock />

        {/* Status Banner */}
        {isLocked && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6">
            <p className="text-destructive text-sm text-center font-medium">
              This prayer session has ended and cannot be modified.
            </p>
            <p className="text-destructive/80 text-xs text-center font-urdu mt-1">
              اس نماز کا وقت ختم ہو چکا ہے۔
            </p>
          </div>
        )}

        {isActive && !isLocked && (
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6">
            <p className="text-primary text-sm text-center font-medium">
              ✨ This prayer session is currently active
            </p>
            <p className="text-primary/80 text-xs text-center font-urdu mt-1">
              یہ نماز کا وقت ابھی جاری ہے۔
            </p>
          </div>
        )}

        {!isAuthenticated && (
          <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 mb-6">
            <p className="text-secondary text-sm text-center">
              <Link to="/signin" className="underline font-semibold">Sign in</Link> to save your attendance
            </p>
          </div>
        )}

        {/* Description */}
        <p className="text-muted-foreground text-sm mb-6">
          Mark what you completed during {sessionName.en}
          <span className="block text-xs font-urdu mt-1">
            {sessionName.ur} کے دوران آپ نے کیا مکمل کیا، نشان لگائیں
          </span>
        </p>

        {/* Check Items */}
        <div className="space-y-5 mb-6">
          {/* Namaz - Required */}
          <CheckItem
            id="namaz"
            label="Namaz"
            labelUrdu="نماز"
            description="Offered prayer with congregation"
            descriptionUrdu="جماعت کے ساتھ نماز ادا کی"
            icon={Heart}
            checked={namazChecked}
            onChange={setNamazChecked}
            required
            disabled={isLocked}
          />

          {/* Dua */}
          <CheckItem
            id="dua"
            label="Dua"
            labelUrdu="دعا"
            description="Made supplications after prayer"
            descriptionUrdu="نماز کے بعد دعائیں کیں"
            icon={BookMarked}
            checked={duaChecked}
            onChange={setDuaChecked}
            disabled={isLocked}
          />

          {/* Quran */}
          <CheckItem
            id="quran"
            label="Quran"
            labelUrdu="قرآن"
            description="Recited Quran today"
            descriptionUrdu="آج قرآن کی تلاوت کی"
            icon={BookOpen}
            checked={quranChecked}
            onChange={setQuranChecked}
            disabled={isLocked}
          />
        </div>

        {/* Extra Ziker - Optional */}
        <div className="mb-4">
          <Label htmlFor="extraZiker" className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Extra Ziker (Optional)</span>
            <span className="font-urdu text-muted-foreground text-sm">اضافی ذکر</span>
          </Label>
          <Textarea
            id="extraZiker"
            placeholder="Enter any additional dhikr you performed..."
            value={extraZiker}
            onChange={(e) => setExtraZiker(e.target.value)}
            className="min-h-[80px] resize-none"
            disabled={isLocked}
          />
        </div>

        {/* Good Deed - Optional */}
        <div className="mb-8">
          <Label htmlFor="goodDeed" className="flex items-center gap-2 mb-2">
            <HandHeart className="w-4 h-4 text-secondary" />
            <span>Good Deed Today (Optional)</span>
            <span className="font-urdu text-muted-foreground text-sm">آج کی نیکی</span>
          </Label>
          <Textarea
            id="goodDeed"
            placeholder="What good deed did you do today?"
            value={goodDeed}
            onChange={(e) => setGoodDeed(e.target.value)}
            className="min-h-[80px] resize-none"
            disabled={isLocked}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLocked || !isAuthenticated || saveAttendance.isPending}
          className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 btn-shadow"
        >
          {saveAttendance.isPending ? "Saving..." : "Submit Attendance"}
        </Button>

        {/* Required Note */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          * Namaz is required to save attendance
          <span className="block font-urdu mt-1">نماز لازمی ہے</span>
        </p>
      </div>

      {/* Feedback Dialog */}
      {feedbackData && (
        <FeedbackDialog
          open={showFeedback}
          onClose={handleFeedbackClose}
          feedback={feedbackData}
          sessionName={sessionName.en}
        />
      )}
    </AppLayout>
  );
};

interface CheckItemProps {
  id: string;
  label: string;
  labelUrdu: string;
  description: string;
  descriptionUrdu: string;
  icon: typeof Heart;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  disabled?: boolean;
}

const CheckItem = ({
  id,
  label,
  labelUrdu,
  description,
  descriptionUrdu,
  icon: Icon,
  checked,
  onChange,
  required,
  disabled,
}: CheckItemProps) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-300 border-2 ${
        checked
          ? "bg-primary/10 border-primary"
          : "bg-card border-transparent"
      } ${disabled ? "opacity-60" : "cursor-pointer"}`}
      onClick={() => !disabled && onChange(!checked)}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            checked ? "bg-primary" : "bg-accent"
          }`}
        >
          <Icon className={`w-6 h-6 ${checked ? "text-primary-foreground" : "text-primary"}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`text-lg font-semibold ${checked ? "text-primary" : "text-foreground"}`}>
              {label}
            </h3>
            <span className="font-urdu text-muted-foreground text-sm">{labelUrdu}</span>
            {required && (
              <span className="text-xs text-destructive">*</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
          <p className="text-xs text-muted-foreground font-urdu">{descriptionUrdu}</p>
        </div>
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(val) => !disabled && onChange(val as boolean)}
          disabled={disabled}
          className="w-6 h-6"
        />
      </div>
    </div>
  );
};

export default PrayerDetail;
