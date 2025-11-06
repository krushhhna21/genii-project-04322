import { Brain, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20 px-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_hsl(var(--accent)/0.1),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_hsl(var(--secondary)/0.1),_transparent_50%)]" />
      
      <div className="relative max-w-4xl mx-auto animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm mb-6">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
          <span className="text-sm font-medium text-primary-foreground">Powered by Advanced AI</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-6">
          AutoProject<span className="text-secondary">.AI</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-primary-foreground/90 mb-4 font-light">
          Smart Project Generator for Students
        </p>
        
        <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
          Transform your reference materials into professional college projects instantly. 
          Upload your files, enter details, and let AI create a complete project report.
        </p>
        
        <div className="flex items-center justify-center gap-4 text-sm text-primary-foreground/70">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span>AI-Powered Generation</span>
          </div>
          <div className="hidden md:block w-1 h-1 rounded-full bg-primary-foreground/50" />
          <span className="hidden md:inline">Free to Use</span>
          <div className="hidden md:block w-1 h-1 rounded-full bg-primary-foreground/50" />
          <span className="hidden md:inline">Instant Download</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
