"use client";

import { FormEvent, useEffect, useState } from "react";

const schemaData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://sportiqx.xyz/#organization",
      name: "SportIQX",
      url: "https://sportiqx.xyz",
      logo: "https://sportiqx.xyz/favicon-sportiqx.svg",
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": "https://sportiqx.xyz/#website",
      url: "https://sportiqx.xyz",
      name: "SportIQX",
      publisher: {
        "@id": "https://sportiqx.xyz/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://sportiqx.xyz/?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebPage",
      "@id": "https://sportiqx.xyz/#webpage",
      url: "https://sportiqx.xyz",
      name: "SportIQX | Sports Venue Booking in VIT Vellore",
      isPartOf: {
        "@id": "https://sportiqx.xyz/#website",
      },
      about: {
        "@id": "https://sportiqx.xyz/#organization",
      },
      description:
        "Discover and book turfs, gaming parlours, swimming pools, badminton courts, cricket nets, gyms and sports academies near you.",
      inLanguage: "en-IN",
    },
    {
      "@type": "FAQPage",
      "@id": "https://sportiqx.xyz/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What can I book on SportIQX?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "SportIQX supports booking for turfs, gaming parlours, swimming pools, badminton courts, cricket nets, gyms, yoga studios, and sports academies.",
          },
        },
        {
          "@type": "Question",
          name: "Which cities does SportIQX support?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "SportIQX is currently focused on VIT Vellore and nearby Vellore areas for early access launch.",
          },
        },
      ],
    },
  ],
};

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
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      animateValue(1500, 247, setEarlyUsers);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      location: String(formData.get("location") ?? ""),
      sports: String(formData.get("sports") ?? ""),
      features: String(formData.get("features") ?? ""),
      feedback: String(formData.get("feedback") ?? ""),
    };

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const result = (await response.json()) as { message?: string };
          throw new Error(result.message || "Unable to submit form.");
        }
        const text = await response.text();
        throw new Error(text ? "Server returned an unexpected response." : "Unable to submit form.");
      }

      setSubmitting(false);
      setSubmitted(true);
      form.reset();
    } catch (error) {
      setSubmitting(false);
      setSubmitError(error instanceof Error ? error.message : "Unable to submit form.");
    }
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
                <input type="text" id="name" name="name" placeholder="Full Name" required />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email Address"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Phone Number"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Your City</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  placeholder="Bangalore, Delhi, Mumbai..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="sports">Sports you play</label>
                <input
                  type="text"
                  id="sports"
                  name="sports"
                  placeholder="Football, Cricket, Gaming..."
                />
              </div>

              <div className="form-group full">
                <label htmlFor="features">Features you want</label>
                <textarea
                  id="features"
                  name="features"
                  placeholder="Tell us what would make SportIQX perfect for you..."
                />
              </div>

              <div className="form-group full">
                <label htmlFor="feedback">Any feedback or thoughts</label>
                <textarea
                  id="feedback"
                  name="feedback"
                  placeholder="Anything else on your mind..."
                />
              </div>

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? "Submitting..." : "Claim My Early Access →"}
              </button>

              {submitError && (
                <p className="submit-error" role="alert">
                  {submitError}
                </p>
              )}
            </div>
          </form>
        ) : (
          <div className="success-box success-box-visible" id="successBox">
            <div className="success-icon">✓</div>
            <div className="success-title">You&apos;re In.</div>
            <p className="success-desc">
              Welcome to SportIQX Early Access. Your rewards are locked in. We will notify you on
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
        <div className="logo footer-logo">SportIQX</div>
        <p>Book your play. &nbsp;|&nbsp; खेलो बिना रुके.</p>
        <p className="footer-copy">© 2025 SportIQX. Built for players.</p>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    </div>
  );
}

