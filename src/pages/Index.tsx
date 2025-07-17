const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-3xl mx-auto px-4">
        <h1 className="text-5xl font-serif font-bold mb-6 text-primary">MansaLuxeRealty</h1>
        <p className="text-2xl text-foreground mb-8">Luxury Nigerian Real Estate</p>
        <p className="text-xl text-muted-foreground mb-6">Welcome to the public-facing website. The admin panel is available at <a href="/admin/login" className="text-primary hover:underline">/admin/login</a>.</p>
        <div className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md text-lg font-medium hover:bg-primary/90 transition-colors">
          Explore Luxury Properties
        </div>
      </div>
    </div>
  );
};

export default Index;
