
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Movie from "./pages/Movie";
import TvShow from "./pages/TvShow";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import Explore from "./pages/Explore";
import Genres from "./pages/Genres";
import GenreContent from "./pages/GenreContent";
import Trending from "./pages/Trending";
import LiveTV from "./pages/LiveTV";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/movie/:id" element={<Movie />} />
          <Route path="/tv/:id" element={<TvShow />} />
          <Route path="/search" element={<Search />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/genres" element={<Genres />} />
          <Route path="/genre/:type/:id" element={<GenreContent />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/live-tv" element={<LiveTV />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
