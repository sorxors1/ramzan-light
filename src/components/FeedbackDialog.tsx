import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FeedbackMessage } from "@/lib/prayerUtils";
import { CheckCircle, Star } from "lucide-react";

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  feedback: FeedbackMessage;
  sessionName: string;
}

const FeedbackDialog = ({ open, onClose, feedback, sessionName }: FeedbackDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto text-center">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-scale-in">
              {feedback.title === 'Shabash!' ? (
                <Star className="w-10 h-10 text-white fill-white" />
              ) : (
                <CheckCircle className="w-10 h-10 text-white" />
              )}
            </div>
          </div>
          
          <DialogTitle className="text-2xl font-bold text-primary">
            {feedback.title}
          </DialogTitle>
          
          <p className="text-xl font-urdu text-secondary mt-1">
            {feedback.titleUrdu}
          </p>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-foreground mb-2">
            {feedback.message}
          </p>
          <p className="text-muted-foreground font-urdu text-right">
            {feedback.messageUrdu}
          </p>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {sessionName} attendance marked
        </p>
        
        <Button 
          onClick={onClose}
          className="w-full mt-4 bg-primary hover:bg-primary/90"
        >
          Continue
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
