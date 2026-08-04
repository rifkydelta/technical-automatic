import { useState, useEffect, useMemo } from 'react';
import { ALL_PATTERNS } from '../data/chartpatterns';

export function useChartPatterns() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // LocalStorage state
  const [favorites, setFavorites] = useState(new Set());
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem('chart-pattern-favorites');
      if (storedFavs) {
        setFavorites(new Set(JSON.parse(storedFavs)));
      }
      
      const storedRecent = localStorage.getItem('chart-pattern-recent');
      if (storedRecent) {
        setRecentlyViewed(JSON.parse(storedRecent));
      }
    } catch (e) {
      console.error('Failed to parse chart pattern local storage', e);
    }
    setIsLoaded(true);
  }, []);

  // Sync favorites to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('chart-pattern-favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites, isLoaded]);

  // Sync recently viewed to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('chart-pattern-recent', JSON.stringify(recentlyViewed));
  }, [recentlyViewed, isLoaded]);

  // Actions
  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const markAsViewed = (id) => {
    setRecentlyViewed(prev => {
      const next = prev.filter(item => item !== id); // Remove if exists
      next.unshift(id); // Add to beginning
      if (next.length > 5) {
        return next.slice(0, 5); // Keep max 5
      }
      return next;
    });
  };

  // Filter & Sort
  const filteredPatterns = useMemo(() => {
    let result = ALL_PATTERNS;

    // Filter by Category
    if (activeCategory !== 'all') {
      result = result.filter(p => p.category === activeCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.id.toLowerCase().includes(q)
      );
    }

    // Sort: Favorites first
    result = [...result].sort((a, b) => {
      const aFav = favorites.has(a.id);
      const bFav = favorites.has(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0; // maintain original order for non-favorites
    });

    return result;
  }, [searchQuery, activeCategory, favorites]);

  // Provide fully hydrated recent objects for UI
  const recentPatterns = useMemo(() => {
    return recentlyViewed
      .map(id => ALL_PATTERNS.find(p => p.id === id))
      .filter(Boolean); // Ensure valid items
  }, [recentlyViewed]);

  return {
    filteredPatterns,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    favorites,
    toggleFavorite,
    recentlyViewed: recentPatterns,
    markAsViewed,
  };
}
