'use client'
import React, { useState } from 'react';
import { characterSeedData } from '@/lib/character';
export default function CharacterGalleryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  // Filter logic for quick searching/filtering the 100 characters
  const filteredCharacters = (characterSeedData).filter((char) => {
    const matchesSearch =
      char.characterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      char.animeNameEnglish?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty =
      difficultyFilter === 'all' || char.difficulty === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Anime Character Seed Explorer</h1>
        <p style={styles.subtitle}>Viewing {filteredCharacters.length} of {characterSeedData.length} records</p>
        
        {/* Controls Toolkit */}
        <div style={styles.controls}>
          <input
            type="text"
            placeholder="Search character or anime..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            style={styles.selectInput}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </header>

      {/* Grid Layout */}
      <div style={styles.grid}>
        {filteredCharacters.map((character, index) => {
          const badgeStyle = {
            ...styles.badge,
            backgroundColor: 
              character.difficulty === 'easy' ? '#22c55e' : 
              character.difficulty === 'medium' ? '#eab308' : '#ef4444'
          };

          return (
            <div key={index} style={styles.card}>
              <div style={styles.imageWrapper}>
                <img
                  src={character.imageUrl}
                  alt={character.characterName}
                  style={styles.image}
                  loading="lazy"
                  onError={(e) => {
                    // Fallback in case of a broken hotlink
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80";
                  }}
                />
                <span style={badgeStyle}>{character.difficulty}</span>
              </div>
              
              <div style={styles.cardContent}>
                <h3 style={styles.characterName}>{character.characterName}</h3>
                <p style={styles.animeName}>{character.animeNameEnglish}</p>
                
                <div style={styles.altsContainer}>
                  {character.alternateName?.map((alt, i) => (
                    <span key={i} style={styles.altTag}>{alt}</span>
                  ))}
                </div>

                <div style={styles.hintsSection}>
                  <p style={styles.hintText}>
                    <strong>Hint 1 (Hard):</strong> {character.hint1}
                  </p>
                  <p style={styles.hintText}>
                    <strong>Hint 2 (Easy):</strong> {character.hint2}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCharacters.length === 0 && (
        <div style={styles.noResults}>
          <p>No database records match your search criteria.</p>
        </div>
      )}
    </div>
  );
}

// Inline CSS Stylesheet for quick single-file setup
const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    marginBottom: '0.5rem',
    background: 'linear-gradient(to right, #38bdf8, #818cf8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '1rem',
    marginBottom: '1.5rem',
  },
  controls: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
    maxWidth: '600px',
    margin: '0 auto',
  },
  searchInput: {
    flex: 1,
    minWidth: '250px',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid #334155',
    backgroundColor: '#1e293b',
    color: '#fff',
    fontSize: '1rem',
  },
  selectInput: {
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid #334155',
    backgroundColor: '#1e293b',
    color: '#fff',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '1rem',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    border: '1px solid #334155',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: '240px',
    backgroundColor: '#334155',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  badge: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#000',
  },
  cardContent: {
    padding: '1.25rem',
  },
  characterName: {
    fontSize: '1.25rem',
    fontWeight: '700',
    margin: '0 0 0.25rem 0',
    color: '#fff',
  },
  animeName: {
    fontSize: '0.9rem',
    color: '#38bdf8',
    margin: '0 0 0.75rem 0',
    fontWeight: '600',
  },
  altsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
    marginBottom: '1rem',
  },
  altTag: {
    backgroundColor: '#334155',
    color: '#cbd5e1',
    fontSize: '0.75rem',
    padding: '0.2rem 0.5rem',
    borderRadius: '0.25rem',
  },
  hintsSection: {
    borderTop: '1px solid #334155',
    paddingTop: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  hintText: {
    fontSize: '0.825rem',
    color: '#94a3b8',
    margin: 0,
    lineHeight: '1.4',
  },
  noResults: {
    textAlign: 'center',
    padding: '3rem',
    color: '#64748b',
    fontSize: '1.2rem',
  },
};