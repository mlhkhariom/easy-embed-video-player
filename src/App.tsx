import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AdminProvider } from './contexts/AdminContext';
import { AdminGuard } from './components/admin/AdminGuard';
import GlobalCSS from './components/GlobalCSS';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminContent from './pages/admin/AdminContent';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLiveTV from './pages/admin/AdminLiveTV';
import AdminCloudStream from './pages/admin/AdminCloudStream';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import Movie from './pages/Movie';
import TvShow from './pages/TvShow';
import GenreContent from './pages/GenreContent';
import Genres from './pages/Genres';
import Search from './pages/Search';
import WatchList from './pages/WatchList';
import History from './pages/History';
import LiveTV from './pages/LiveTV';
import Explore from './pages/Explore';
import Trending from './pages/Trending';
import Movies from './pages/Movies';
import WebSeries from './pages/WebSeries';
import TvSerials from './pages/TvSerials';
import CloudStream from './pages/CloudStream';
import CloudStreamDetails from './pages/CloudStreamDetails';
import { ErrorBoundary } from './components/ErrorBoundary';
import AdminPlayer from './pages/admin/AdminPlayer';

const queryClient = new QueryClient();

const App = () => {
  return (
    <BrowserRouter>
      <React.Suspense fallback={<div>Loading...</div>}>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <AdminProvider>
              <GlobalCSS />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/movie/:id" element={<Movie />} />
                <Route path="/tv/:id" element={<TvShow />} />
                <Route path="/genre/:id" element={<GenreContent />} />
                <Route path="/genres" element={<Genres />} />
                <Route path="/search" element={<Search />} />
                <Route path="/watch-list" element={<WatchList />} />
                <Route path="/history" element={<History />} />
                <Route path="/live-tv" element={<LiveTV />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/trending" element={<Trending />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/web-series" element={<WebSeries />} />
                <Route path="/tv-serials" element={<TvSerials />} />
                <Route path="/cloudstream" element={<CloudStream />} />
                <Route path="/cloudstream/:id" element={<CloudStreamDetails />} />
                
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <AdminGuard>
                      <AdminDashboard />
                    </AdminGuard>
                  }
                />
                <Route
                  path="/admin/content"
                  element={
                    <AdminGuard>
                      <AdminContent />
                    </AdminGuard>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <AdminGuard>
                      <AdminSettings />
                    </AdminGuard>
                  }
                />
                <Route
                  path="/admin/livetv"
                  element={
                    <AdminGuard>
                      <AdminLiveTV />
                    </AdminGuard>
                  }
                />
                <Route
                  path="/admin/cloudstream"
                  element={
                    <AdminGuard>
                      <AdminCloudStream />
                    </AdminGuard>
                  }
                />
                <Route
                  path="/admin/player"
                  element={
                    <AdminGuard>
                      <AdminPlayer />
                    </AdminGuard>
                  }
                />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </AdminProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </React.Suspense>
    </BrowserRouter>
  );
};

export default App;
