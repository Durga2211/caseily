import React, { useState, useEffect } from 'react';
import { DIWALI_CONFIG } from './diwaliConfig';

/**
 * Diwali Community & Contests Section
 * - #CaseilyDiwali Photo Contest card
 * - Creators Club "Design a Diwali Case" challenge card
 * - Interactive Diwali Poll with animated result bars
 */
export default function DiwaliCommunity({ onNavigateToCreatorsClub, onShowToast }) {
  const pollData = DIWALI_CONFIG.poll;

  // Track user votes in localStorage
  const [selectedOption, setSelectedOption] = useState(() => {
    try {
      const saved = localStorage.getItem('caseily_diwali_poll_vote');
      return saved !== null ? parseInt(saved, 10) : null;
    } catch {
      return null;
    }
  });

  const [votes, setVotes] = useState(() => {
    try {
      const savedVotes = localStorage.getItem('caseily_diwali_poll_counts');
      if (savedVotes) return JSON.parse(savedVotes);
    } catch {}
    return pollData.options.map(opt => opt.initialVotes);
  });

  const totalVotes = votes.reduce((acc, curr) => acc + curr, 0);

  const handleVote = (idx) => {
    if (selectedOption !== null) return; // already voted

    const updated = [...votes];
    updated[idx] += 1;
    setVotes(updated);
    setSelectedOption(idx);

    try {
      localStorage.setItem('caseily_diwali_poll_vote', idx.toString());
      localStorage.setItem('caseily_diwali_poll_counts', JSON.stringify(updated));
    } catch {}

    if (onShowToast) {
      onShowToast(`🗳️ Vote recorded for "${pollData.options[idx].text}"! Thank you for participating.`);
    }
  };

  const handleEnterContest = () => {
    if (onShowToast) {
      onShowToast('📸 Upload your setup on Instagram/Twitter with #CaseilyDiwali to enter!');
    }
    window.open('https://twitter.com/intent/tweet?text=Here%27s+my+festive+desk+%26+phone+setup+for+Diwali!+%23CaseilyDiwali+%23caseilyinsider+%40caseily', '_blank');
  };

  return (
    <section id="diwali-community" style={{
      maxWidth: '820px',
      margin: '0 auto 36px',
      padding: '0 16px',
      boxSizing: 'border-box',
      width: '100%'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '18px'
      }}>
        <span style={{ fontSize: '26px' }}>🪔</span>
        <div>
          <h2 className="diwali-font" style={{
            fontSize: '24px',
            fontWeight: '900',
            margin: 0,
            color: '#FFFFFF'
          }}>
            Diwali Community Hub
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' }}>
            Contests, community polls, and creator showcases for the festive season.
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* ─── Card 1: #CaseilyDiwali Photo Contest ─── */}
        <div className="diwali-card" style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #1e3a8a 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <span style={{ fontSize: '26px' }}>📸</span>
              <span className="festive-pill-badge">Win ₹5,000</span>
            </div>

            <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: '800', color: '#FFFBEB' }}>
              #CaseilyDiwali Photo Contest
            </h3>
            <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: '#cbd5e1', lineHeight: 1.45 }}>
              Share a photo of your Caseily case alongside your Diwali diyas, lights, or festive sweets. Tag <strong>#CaseilyDiwali</strong> to participate!
            </p>

            <div style={{
              background: 'rgba(0,0,0,0.25)',
              padding: '10px 12px',
              borderRadius: '10px',
              fontSize: '12px',
              color: '#FDE047',
              border: '1px dashed rgba(245, 179, 1, 0.3)'
            }}>
              🏆 <strong>Prizes:</strong> 3 Winners get iPhone 16 Pro Case + ₹5,000 Shopping Voucher.
            </div>
          </div>

          <button
            type="button"
            className="diwali-gold-btn"
            onClick={handleEnterContest}
            style={{
              marginTop: '16px',
              padding: '11px',
              borderRadius: '10px',
              fontSize: '13px',
              width: '100%'
            }}
          >
            <span>Submit Entry with #CaseilyDiwali</span>
            <span style={{ marginLeft: '4px' }}>✨</span>
          </button>
        </div>

        {/* ─── Card 2: Creators Club Challenge ─── */}
        <div className="diwali-card" style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #431407 0%, #7c2d12 60%, #9a3412 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <span style={{ fontSize: '26px' }}>🎨</span>
              <span className="festive-pill-badge" style={{ background: 'linear-gradient(135deg, #F43F5E, #BE185D)', color: '#ffffff' }}>
                Creator Collab
              </span>
            </div>

            <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: '800', color: '#FFFBEB' }}>
              Design a Diwali Case Challenge
            </h3>
            <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: '#cbd5e1', lineHeight: 1.45 }}>
              Are you an artist or digital creator? Submit your festive mandala or modern Indian artwork. Winning design gets produced into real cases with 15% revenue share!
            </p>

            <div style={{
              background: 'rgba(0,0,0,0.25)',
              padding: '10px 12px',
              borderRadius: '10px',
              fontSize: '12px',
              color: '#FDE047',
              border: '1px dashed rgba(245, 179, 1, 0.3)'
            }}>
              ⚡ <strong>Royalty:</strong> Earn up to ₹50,000 in royalties during festive sales.
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToCreatorsClub}
            style={{
              marginTop: '16px',
              padding: '11px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '800',
              background: '#FFFBEB',
              color: '#7c2d12',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            <span>Join Creators Challenge →</span>
          </button>
        </div>
      </div>

      {/* ─── Card 3: Interactive Diwali Poll Widget ─── */}
      <div className="diwali-card" style={{ padding: '22px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px' }}>🍬</span>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#FFFBEB' }}>
              Community Poll
            </h3>
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>
            {totalVotes.toLocaleString()} votes
          </span>
        </div>

        <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#e2e8f0', fontWeight: '600' }}>
          {pollData.question}
        </p>

        {/* Poll Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {pollData.options.map((opt, idx) => {
            const count = votes[idx];
            const pct = Math.round((count / totalVotes) * 100) || 0;
            const isVoted = selectedOption === idx;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleVote(idx)}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: isVoted ? 'rgba(245, 179, 1, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: isVoted ? '1.5px solid #F5B301' : '1px solid rgba(255, 255, 255, 0.12)',
                  cursor: selectedOption === null ? 'pointer' : 'default',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'border-color 0.2s'
                }}
              >
                {/* Animated Percentage Fill Bar */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: `${pct}%`,
                    background: isVoted
                      ? 'linear-gradient(90deg, rgba(245, 179, 1, 0.35), rgba(255, 153, 51, 0.45))'
                      : 'rgba(255, 255, 255, 0.12)',
                    transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                    pointerEvents: 'none'
                  }}
                />

                {/* Option Text */}
                <span style={{
                  position: 'relative',
                  zIndex: 2,
                  fontSize: '13.5px',
                  fontWeight: isVoted ? '800' : '600',
                  color: isVoted ? '#FDE047' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {opt.text} {isVoted && '✓'}
                </span>

                {/* Percentage Badge */}
                <span style={{
                  position: 'relative',
                  zIndex: 2,
                  fontSize: '13px',
                  fontWeight: '800',
                  color: isVoted ? '#FDE047' : '#94a3b8'
                }}>
                  {pct}%
                </span>
              </button>
            );
          })}
        </div>

        {selectedOption === null && (
          <p style={{
            margin: '12px 0 0',
            fontSize: '11.5px',
            color: '#94a3b8',
            textAlign: 'center'
          }}>
            Tap an option to cast your vote!
          </p>
        )}
      </div>
    </section>
  );
}
