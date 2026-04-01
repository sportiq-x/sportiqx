"use client";

import { FormEvent, useEffect, useState } from "react";

type CitySuggestion = {
  id: number;
  city: string;
  region: string;
  countryCode: string;
  displayName: string;
};

type HomePageClientProps = {
  initialEarlyUsers: number;
};

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

export default function HomePageClient({ initialEarlyUsers }: HomePageClientProps) {
  const [earlyUsers, setEarlyUsers] = useState(initialEarlyUsers);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    phone?: string;
    location?: string;
  }>({});
  const [phoneDigits, setPhoneDigits] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [cityError, setCityError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [otherCityMode, setOtherCityMode] = useState(false);
  const [otherCity, setOtherCity] = useState("");

  useEffect(() => {
    const query = cityQuery.trim();

    if (query.length < 2 || otherCityMode || selectedLocation === cityQuery) {
      setCitySuggestions([]);
      setCityError(null);
      setCityLoading(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setCityLoading(true);
        const response = await fetch(`/api/cities?q=${encodeURIComponent(query)}`);

        if (!response.ok) {
          setCitySuggestions([]);
          setCityError("City search failed. Please use Other.");
          return;
        }

        const result = (await response.json()) as { data?: CitySuggestion[]; error?: string | null };
        setCitySuggestions(Array.isArray(result.data) ? result.data : []);
        setCityError(result.error || null);
        setShowCityDropdown(true);
      } catch {
        setCitySuggestions([]);
        setCityError("Could not fetch cities right now. Please use Other.");
      } finally {
        setCityLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [cityQuery, otherCityMode, selectedLocation]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setFieldErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);
    const sanitizedPhoneDigits = String(formData.get("phoneDigits") ?? "").replace(/\D/g, "");
    const finalLocation = otherCityMode ? otherCity.trim() : selectedLocation.trim();

    if (!finalLocation) {
      setSubmitting(false);
      setFieldErrors({ location: "Please select your city from suggestions or choose Other." });
      return;
    }

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: `+91${sanitizedPhoneDigits}`,
      location: finalLocation,
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
          const result = (await response.json()) as {
            message?: string;
            field?: "email" | "phone";
            fieldErrors?: { email?: string; phone?: string };
          };

          if (result.fieldErrors) {
            setFieldErrors(result.fieldErrors);
            setSubmitting(false);
            return;
          }

          if (result.field) {
            setFieldErrors({ [result.field]: result.message || "Already registered." });
            setSubmitting(false);
            return;
          }

          throw new Error(result.message || "Unable to submit form.");
        }
        const text = await response.text();
        throw new Error(text ? "Server returned an unexpected response." : "Unable to submit form.");
      }

      const result = (await response.json()) as { count?: number };
      if (Number.isFinite(result.count)) {
        setEarlyUsers(Number(result.count) + 47);
      } else {
        setEarlyUsers((prev) => prev + 1);
      }
      setSubmitting(false);
      setSubmitted(true);
      form.reset();
      setPhoneDigits("");
      setCityQuery("");
      setCitySuggestions([]);
      setCityError(null);
      setSelectedLocation("");
      setOtherCityMode(false);
      setOtherCity("");
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
          <form id="earlyForm" method="post" action="/api/waitlist" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">
                  Your Name <span className="required-asterisk">*</span>
                </label>
                <input type="text" id="name" name="name" placeholder="Full Name" required />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email Address <span className="required-asterisk">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email Address"
                  required
                />
                {fieldErrors.email && (
                  <p className="field-error" role="alert">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  Phone Number <span className="required-asterisk">*</span>
                </label>
                <div className="phone-input-group">
                  <span className="phone-prefix">+91</span>
                  <input
                    type="tel"
                    id="phone"
                    name="phoneDigits"
                    value={phoneDigits}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setPhoneDigits(digitsOnly);
                    }}
                    placeholder="9876543210"
                    pattern="[6-9][0-9]{9}"
                    maxLength={10}
                    inputMode="numeric"
                    title="Enter a valid 10-digit mobile number"
                    required
                  />
                </div>
                {fieldErrors.phone && (
                  <p className="field-error" role="alert">
                    {fieldErrors.phone}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="location">
                  Your City <span className="required-asterisk">*</span>
                </label>
                <div className="city-search-wrap">
                  <input
                    type="text"
                    id="location"
                    placeholder="Search your city..."
                    value={otherCityMode ? otherCity : cityQuery}
                    onChange={(e) => {
                      const value = e.target.value;

                      if (otherCityMode) {
                        setOtherCity(value);
                      } else {
                        setCityQuery(value);
                        setSelectedLocation("");
                        setCityError(null);
                      }

                      setFieldErrors((prev) => ({ ...prev, location: undefined }));
                    }}
                    onFocus={() => {
                      if (!otherCityMode && (citySuggestions.length > 0 || cityQuery.trim().length >= 2)) {
                        setShowCityDropdown(true);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowCityDropdown(false), 120);
                    }}
                    required
                  />

                  {!otherCityMode &&
                    showCityDropdown &&
                    (cityQuery.trim().length >= 2 || citySuggestions.length > 0 || cityLoading) && (
                    <ul className="city-dropdown" role="listbox">
                      {cityLoading ? (
                        <li className="city-option city-option-muted">Searching cities...</li>
                      ) : (
                        <>
                          {citySuggestions.length > 0 ? (
                            citySuggestions.map((city) => (
                              <li key={city.id}>
                                <button
                                  type="button"
                                  className="city-option"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    setSelectedLocation(city.displayName);
                                    setCityQuery(city.displayName);
                                    setShowCityDropdown(false);
                                    setFieldErrors((prev) => ({ ...prev, location: undefined }));
                                  }}
                                >
                                  {city.displayName}
                                </button>
                              </li>
                            ))
                          ) : cityError ? null : (
                            <li className="city-option city-option-muted">No matching city found.</li>
                          )}
                        </>
                      )}

                      {!cityLoading && (
                        <li>
                          <button
                            type="button"
                            className="city-option city-option-other"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setOtherCityMode(true);
                              setOtherCity("");
                              setSelectedLocation("");
                              setShowCityDropdown(false);
                            }}
                          >
                            Other (my city is not listed)
                          </button>
                        </li>
                      )}
                    </ul>
                  )}
                </div>

                <input
                  type="hidden"
                  name="location"
                  value={otherCityMode ? otherCity.trim() : selectedLocation}
                />

                {otherCityMode && (
                  <button
                    type="button"
                    className="location-reset-btn"
                    onClick={() => {
                      setOtherCityMode(false);
                      setOtherCity("");
                      setCityQuery("");
                      setSelectedLocation("");
                    }}
                  >
                    Back to city search
                  </button>
                )}

                {fieldErrors.location && (
                  <p className="field-error" role="alert">
                    {fieldErrors.location}
                  </p>
                )}
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
        <p className="footer-copy">© 2026 SportIQX. Built for players.</p>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    </div>
  );
}

