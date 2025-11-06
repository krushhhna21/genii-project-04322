import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-8 mt-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-muted-foreground flex items-center justify-center gap-2">
          © 2025 
          <span className="font-semibold text-foreground">Velvet Monarch Labs</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Made with</span>
          <Heart className="w-4 h-4 text-destructive fill-destructive hidden sm:inline" />
          <span className="hidden sm:inline">for students</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
