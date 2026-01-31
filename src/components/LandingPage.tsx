import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Image as ImageIcon, MessageSquare, Settings } from 'lucide-react';
import gsap from 'gsap';
import '../styles/landing.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const cardsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Title gradient shimmer animation
    if (titleRef.current) {
      gsap.to(titleRef.current, {
        backgroundPosition: '200% center',
        duration: 3,
        repeat: -1,
        ease: 'linear',
      });
    }

    // Cards staggered entrance animation
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.mode-card');
      gsap.from(cards, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
      });
    }
  }, []);

  const modes = [
    {
      id: 'voice',
      title: 'Voice',
      description: 'Speech-to-text and text-to-speech with Whisper and SpeechT5',
      icon: Mic,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      path: '/voice',
    },
    {
      id: 'image',
      title: 'Image',
      description: 'Analyze and understand images with CLIP and Florence-2',
      icon: ImageIcon,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      path: '/image',
    },
    {
      id: 'text',
      title: 'Text',
      description: 'Chat with powerful language models running locally',
      icon: MessageSquare,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      path: '/text',
    },
  ];

  return (
    <div className="landing-container">
      <button
        className="settings-button"
        onClick={() => navigate('/settings')}
        aria-label="Settings"
      >
        <Settings size={24} />
      </button>

      <h1 ref={titleRef} className="landing-title">
        Sigma AI
      </h1>

      <p className="landing-subtitle">
        Open-source AI models running entirely in your browser
      </p>

      <div ref={cardsRef} className="modes-grid">
        {modes.map((mode) => (
          <div
            key={mode.id}
            className="mode-card"
            onClick={() => navigate(mode.path)}
            style={{ background: mode.gradient }}
          >
            <div className="mode-icon">
              <mode.icon size={48} />
            </div>
            <h2 className="mode-title">{mode.title}</h2>
            <p className="mode-description">{mode.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
