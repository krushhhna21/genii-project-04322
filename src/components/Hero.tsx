import { Brain, Sparkles, TrendingUp, Shield, Clock, Zap } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20 px-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_hsl(var(--accent)/0.1),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_hsl(var(--secondary)/0.1),_transparent_50%)]" />

      <div className="relative max-w-5xl mx-auto animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm mb-6">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
          <span className="text-sm font-medium text-primary-foreground">AI-Powered MSBTE Project Builder</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-6">
          AutoProject<span className="text-secondary">.AI</span>
        </h1>

        <p className="text-xl md:text-2xl text-primary-foreground/90 mb-4 font-light">
          Enhanced MSBTE Microproject Generator with AI Quality Assurance
        </p>

        <p className="text-lg text-primary-foreground/80 max-w-3xl mx-auto mb-8">
          Transform your reference materials into professional MSBTE-compliant project reports with AI enhancement,
          quality validation, and smart suggestions. Generate better projects in minutes, not hours.
        </p>

        {/* Key Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-primary-foreground/5 backdrop-blur-sm">
            <TrendingUp className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-primary-foreground mb-1">40% Better Quality</h3>
            <p className="text-sm text-primary-foreground/70">AI-powered content enhancement and quality scoring</p>
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-primary-foreground/5 backdrop-blur-sm">
            <Shield className="w-8 h-8 text-secondary mb-3" />
            <h3 className="font-semibold text-primary-foreground mb-1">MSBTE Compliant</h3>
            <p className="text-sm text-primary-foreground/70">Guaranteed compliance with diploma standards</p>
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-primary-foreground/5 backdrop-blur-sm">
            <Clock className="w-8 h-8 text-accent mb-3" />
            <h3 className="font-semibold text-primary-foreground mb-1">60% Time Saved</h3>
            <p className="text-sm text-primary-foreground/70">Complete projects in under 60 seconds</p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/70">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <span>Multi-Stage AI Processing</span>
          </div>

          <div className="hidden md:block w-1 h-1 rounded-full bg-primary-foreground/50" />
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-secondary" />
            <span>Real-time Quality Metrics</span>
          </div>

          <div className="hidden md:block w-1 h-1 rounded-full bg-primary-foreground/50" />
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            <span>MSBTE Validation</span>
          </div>

          <div className="hidden md:block w-1 h-1 rounded-full bg-primary-foreground/50" />
          <span className="hidden md:inline">Smart Suggestions</span>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 pt-8 border-t border-primary-foreground/20">
          <p className="text-sm text-primary-foreground/60 mb-4">Trusted by diploma engineering students across Maharashtra</p>
          <div className="flex items-center justify-center gap-8 text-xs text-primary-foreground/50">
            <span>1000+ Projects Generated</span>
            <span>•</span>
            <span>95% User Satisfaction</span>
            <span>•</span>
            <span>All MSBTE Branches Supported</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
