
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTrendingMovies, getPopularMovies, getTopRatedMovies } from '../services/tmdb';
import Navbar from '../components/Navbar';
import { useAdmin } from '../contexts/AdminContext';
import { PlayCircle } from 'lucide-react';
import { Movie, TvShow } from '../types';
import Hero from '../components/Hero';
import ContentRow from '../components/ContentRow';
import Footer from '../components/Footer';

const Index = () => {
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [featuredTVShow, setFeaturedTVShow] = useState<TvShow | null>(null);
  const { settings } = useAdmin();

  // Fetch trending movies
  const { data: trendingMovies, isLoading: isLoadingTrendingMovies, error: errorTrendingMovies } = useQuery({
    queryKey: ['trendingMovies'],
    queryFn: getTrendingMovies,
  });

  // Fetch popular movies
  const { data: popularMovies, isLoading: isLoadingPopularMovies, error: errorPopularMovies } = useQuery({
    queryKey: ['popularMovies'],
    queryFn: getPopularMovies,
  });

  // Fetch top rated movies
  const { data: topRatedMovies, isLoading: isLoadingTopRatedMovies, error: errorTopRatedMovies } = useQuery({
    queryKey: ['topRatedMovies'],
    queryFn: getTopRatedMovies,
  });

  useEffect(() => {
    if (settings?.featuredContent?.movie) {
      const { id, title, posterPath, backdropPath } = settings.featuredContent.movie;
      setFeaturedMovie({
        id,
        title,
        poster_path: posterPath,
        backdrop_path: backdropPath,
        release_date: '',
        overview: '',
        vote_average: 0,
        vote_count: 0,
        popularity: 0,
        adult: false,
      });
    }
    if (settings?.featuredContent?.tvShow) {
      const { id, name, posterPath, backdropPath } = settings.featuredContent.tvShow;
      setFeaturedTVShow({
        id,
        name,
        poster_path: posterPath,
        backdrop_path: backdropPath,
        first_air_date: '',
        overview: '',
        vote_average: 0,
        vote_count: 0,
        popularity: 0,
        number_of_seasons: 0,
        number_of_episodes: 0,
      });
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

        {(topRatedMovies && topRatedMovies.results.length > 0) && (
          <ContentRow
            title="Top Rated Movies"
            content={topRatedMovies.results}
            type="movie"
            isLoading={isLoadingTopRatedMovies}
            error={errorTopRatedMovies}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
