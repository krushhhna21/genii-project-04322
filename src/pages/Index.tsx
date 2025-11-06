import Hero from "@/components/Hero";
import GeneratorCard from "@/components/GeneratorCard";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      
      <main className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <GeneratorCard />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
