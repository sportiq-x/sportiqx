"use client";

import { FormEvent, useEffect, useState } from "react";

function animateValue(
  duration: number,
  target: number,
  onUpdate: (value: number) => void,
) {
  const start = performance.now();

  const tick = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    onUpdate(Math.floor(progress * target));

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      onUpdate(target);
    }
  };

  requestAnimationFrame(tick);
}

export default function Home() {
  const [earlyUsers, setEarlyUsers] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      animateValue(1500, 247, setEarlyUsers);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="wrapper">
      <nav>
        <div className="logo">SportIQX</div>
        <div className="badge">Early Access Open</div>
      </nav>

      <section className="hero">
        <div className="hero-glow" />
        <p className="eyebrow">Launching Soon</p>
        <h1 className="hero-title">
          Book your
          <span>Game.</span>
        </h1>
        <p className="hero-sub">
          Find and book <strong>turfs, gaming parlours, swimming pools</strong> and every
          sports venue near you. In seconds.
        </p>
      </section>

      <div className="counter-row">
        <div className="counter-item">
          <div className="counter-num">{earlyUsers}</div>
          <div className="counter-desc">Early Users</div>
        </div>
        <div className="divider" />
        <div className="counter-item">
          <div className="counter-num">300</div>
          <div className="counter-desc">Free Coins</div>
        </div>
        <div className="divider" />
        <div className="counter-item">
          <div className="counter-num">2x</div>
          <div className="counter-desc">Coins for Pro</div>
        </div>
      </div>

      <div className="benefits">
        <div className="benefit">
          <span className="benefit-icon">🪙</span>
          <div className="benefit-coins">300</div>
          <div className="benefit-label">
            <strong>Free Coins</strong>
            Credited to your account on launch day. Use them on your first booking.
          </div>
          <span className="tag">All Early Users</span>
        </div>
        <div className="benefit">
          <span className="benefit-icon">⚡</span>
          <div className="benefit-coins">1 Month</div>
          <div className="benefit-label">
            <strong>Pro Subscription Free</strong>
            Get full Pro access from day one. No card needed.
          </div>
          <span className="tag">Early Access Gift</span>
        </div>
        <div className="benefit">
          <span className="benefit-icon">🔥</span>
          <div className="benefit-coins">2x</div>
          <div className="benefit-label">
            <strong>Coins Per Booking</strong>
            Pro users earn double. Pay Rs. 200, get 400 coins back.
          </div>
          <span className="tag">Pro Members Only</span>
        </div>
      </div>

      <div className="section-label">Launching with</div>
      <div className="categories">
        <div className="cat-chip active">
          <span className="dot" /> Turfs
        </div>
        <div className="cat-chip active">
          <span className="dot" /> Gaming Parlours
        </div>
        <div className="cat-chip active">
          <span className="dot" /> Swimming Pools
        </div>
        <div className="cat-chip active">
          <span className="dot" /> Badminton Courts
        </div>
        <div className="cat-chip active">
          <span className="dot" /> Cricket Nets
        </div>
        <div className="cat-chip active">
          <span className="dot" /> Sports Academies
        </div>
        <div className="cat-chip active">
          <span className="dot" /> Yoga Studios
        </div>
        <div className="cat-chip active">
          <span className="dot" /> Gyms
        </div>
      </div>

      <div className="form-section">
        <h2 className="form-title">{submitted ? "Welcome Aboard." : "Get Early Access"}</h2>
        {!submitted && (
          <p className="form-desc">
            Join the waitlist. Be the first to play smarter. Get your 300 coins and 1 month
            Pro free on launch.
          </p>
        )}

        {!submitted ? (
          <form id="earlyForm" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input type="text" id="name" placeholder="Rahul Sharma" required />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" placeholder="rahul@gmail.com" required />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input type="tel" id="phone" placeholder="+91 98765 43210" required />
              </div>

              <div className="form-group">
                <label htmlFor="location">Your City</label>
                <input
                  type="text"
                  id="location"
                  placeholder="Bangalore, Delhi, Mumbai..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">You are a</label>
                <select id="role" defaultValue="">
                  <option value="">Select role</option>
                  <option value="user">Player / User</option>
                  <option value="owner">Venue Owner</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="sports">Sports you play</label>
                <input type="text" id="sports" placeholder="Football, Cricket, Gaming..." />
              </div>

              <div className="form-group full">
                <label htmlFor="features">Features you want</label>
                <textarea
                  id="features"
                  placeholder="Tell us what would make SportIQ perfect for you..."
                />
              </div>

              <div className="form-group full">
                <label htmlFor="feedback">Any feedback or thoughts</label>
                <textarea id="feedback" placeholder="Anything else on your mind..." />
              </div>

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? "Submitting..." : "Claim My Early Access →"}
              </button>
            </div>
          </form>
        ) : (
          <div className="success-box success-box-visible" id="successBox">
            <div className="success-icon">✓</div>
            <div className="success-title">You&apos;re In.</div>
            <p className="success-desc">
              Welcome to SportIQ Early Access. Your rewards are locked in. We will notify you on
              launch.
            </p>
            <div className="rewards-list">
              <div className="reward-item">
                🪙 <span><span className="lime">300 coins</span> credited on launch day</span>
              </div>
              <div className="reward-item">
                ⚡ <span><span className="lime">1 month Pro</span> subscription, free</span>
              </div>
              <div className="reward-item">
                🔥 <span><span className="lime">2x coins</span> on every Pro booking</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <footer>
        <div className="logo footer-logo">SportIQ</div>
        <p>Book your play. &nbsp;|&nbsp; खेलो बिना रुके.</p>
        <p className="footer-copy">© 2025 SportIQX. Built in India.</p>
      </footer>
    </div>
  );
}
