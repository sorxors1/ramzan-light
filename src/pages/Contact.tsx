import AppLayout from "@/components/layout/AppLayout";
import { MessageCircle } from "lucide-react";

const contacts = [
  {
    name: "Support Team",
    number: "+1 234 567 8900",
    whatsappLink: "https://wa.me/12345678900",
  },
  {
    name: "Community Manager",
    number: "+1 234 567 8901",
    whatsappLink: "https://wa.me/12345678901",
  },
];

const Contact = () => {
  return (
    <AppLayout>
      <div className="px-4 py-6 animate-fade-in">
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          Contact Us
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Reach out to us on WhatsApp for support
        </p>

        <div className="grid gap-4">
          {contacts.map((contact, index) => (
            <a
              key={contact.number}
              href={contact.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-card rounded-2xl p-6 prayer-card-shadow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {contact.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {contact.number}
                    </p>
                    <span className="inline-block mt-2 text-xs font-medium text-primary bg-accent px-3 py-1 rounded-full">
                      Tap to Chat on WhatsApp
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Contact;
