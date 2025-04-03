import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTrendingMovies, getTrendingTV, getPopularMovies, getPopularTV, getTopRatedMovies, getTopRatedTV } from '../services/tmdb';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import ContentRow from '../components/ContentRow';
import { Movie, TvShow } from '../types';
import { useAdmin } from '../contexts/AdminContext';
import { PlayCircle } from 'lucide-react';

const Index = () => {
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [featuredTVShow, setFeaturedTVShow] = useState<TvShow | null>(null);
  const { settings } = useAdmin();

  // Fetch trending movies
  const { data: trendingMovies, isLoading: isLoadingTrendingMovies, error: errorTrendingMovies } = useQuery({
    queryKey: ['trendingMovies'],
    queryFn: getTrendingMovies,
  });

  // Fetch trending TV shows
  const { data: trendingTV, isLoading: isLoadingTrendingTV, error: errorTrendingTV } = useQuery({
    queryKey: ['trendingTV'],
    queryFn: getTrendingTV,
  });

  // Fetch popular movies
  const { data: popularMovies, isLoading: isLoadingPopularMovies, error: errorPopularMovies } = useQuery({
    queryKey: ['popularMovies'],
    queryFn: getPopularMovies,
  });

  // Fetch popular TV shows
  const { data: popularTV, isLoading: isLoadingPopularTV, error: errorPopularTV } = useQuery({
    queryKey: ['popularTV'],
    queryFn: getPopularTV,
  });

  // Fetch top rated movies
  const { data: topRatedMovies, isLoading: isLoadingTopRatedMovies, error: errorTopRatedMovies } = useQuery({
    queryKey: ['topRatedMovies'],
    queryFn: getTopRatedMovies,
  });

  // Fetch top rated TV shows
  const { data: topRatedTV, isLoading: isLoadingTopRatedTV, error: errorTopRatedTV } = useQuery({
    queryKey: ['topRatedTV'],
    queryFn: getTopRatedTV,
  });

  useEffect(() => {
    if (settings?.featuredContent?.movie) {
      setFeaturedMovie(settings.featuredContent.movie as Movie);
    }
    if (settings?.featuredContent?.tvShow) {
      setFeaturedTVShow(settings.featuredContent.tvShow as TvShow);
    }
  }, [settings]);

  return (
    <div className="min-h-screen bg-moviemate-background text-white">
      <Navbar />
      <Hero featuredMovie={featuredMovie} featuredTVShow={featuredTVShow} />

      <main className="container mx-auto px-4 py-8">
        {settings?.enableTrending && (
          <>
            {(trendingMovies && trendingMovies.results.length > 0) && (
              <ContentRow
                title="Trending Movies"
                content={trendingMovies.results}
                type="movie"
                isLoading={isLoadingTrendingMovies}
                error={errorTrendingMovies}
              />
            )}

            {(trendingTV && trendingTV.results.length > 0) && (
              <ContentRow
                title="Trending TV Shows"
                content={trendingTV.results}
                type="tv"
                isLoading={isLoadingTrendingTV}
                error={errorTrendingTV}
              />
            )}
          </>
        )}

        {(popularMovies && popularMovies.results.length > 0) && (
          <ContentRow
            title="Popular Movies"
            content={popularMovies.results}
            type="movie"
            isLoading={isLoadingPopularMovies}
            error={errorPopularMovies}
          />
        )}

        {(popularTV && popularTV.results.length > 0) && (
          <ContentRow
            title="Popular TV Shows"
            content={popularTV.results}
            type="tv"
            isLoading={isLoadingPopularTV}
            error={errorPopularTV}
          />
        )}

        {(topRatedMovies && topRatedMovies.results.length > 0) && (
          <ContentRow
            title="Top Rated Movies"
            content={topRatedMovies.results}
            type="movie"
            isLoading={isLoadingTopRatedMovies}
            error={errorTopRatedMovies}
          />
        )}

        {(topRatedTV && topRatedTV.results.length > 0) && (
          <ContentRow
            title="Top Rated TV Shows"
            content={topRatedTV.results}
            type="tv"
            isLoading={isLoadingTopRatedTV}
            error={errorTopRatedTV}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
