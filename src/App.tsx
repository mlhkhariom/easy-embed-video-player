
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
import Movies from "./pages/Movies";
import WebSeries from "./pages/WebSeries";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminLiveTV from "./pages/admin/AdminLiveTV";
import AdminContent from "./pages/admin/AdminContent";
import { AdminGuard } from "./components/admin/AdminGuard";
import DynamicStyles from "./components/DynamicStyles";

// Customize QueryClient with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DynamicStyles />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movie/:id" element={<Movie />} />
          <Route path="/tv" element={<WebSeries />} />
          <Route path="/tv/:id" element={<TvShow />} />
          <Route path="/search" element={<Search />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/genres" element={<Genres />} />
          <Route path="/genre/:type/:id" element={<GenreContent />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/live-tv" element={<LiveTV />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
          <Route path="/admin/settings" element={<AdminGuard><AdminSettings /></AdminGuard>} />
          <Route path="/admin/live-tv" element={<AdminGuard><AdminLiveTV /></AdminGuard>} />
          <Route path="/admin/content" element={<AdminGuard><AdminContent /></AdminGuard>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
