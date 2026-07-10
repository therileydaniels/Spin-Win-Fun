import { useState } from "react";

const faqs = [
  {
    q: "What is QuickWheel?",
    a: "QuickWheel is a free, customizable wheel spinner and random picker built for content creators, streamers, and live events. It features presentation mode for clean on-screen display, weighted outcomes for controlled randomness, multi-wheel management, and embeddable wheels. No account required to start spinning.",
  },
  {
    q: "Is QuickWheel really free?",
    a: "Yes. QuickWheel is free to use with no signup required. There's a premium tier if you want extra features, but the core wheel spinner is completely free. Built by a creator, for creators.",
  },
  {
    q: "Can I use QuickWheel for live streaming?",
    a: "Absolutely. Presentation Mode hides all editing controls and gives you a clean, full-screen wheel that looks great on stream. Use it as a browser source in OBS, Streamlabs, or any streaming software, or just screen share it.",
  },
  {
    q: "Can I control what the wheel lands on?",
    a: "Yes. QuickWheel gives you flexible outcome control so you can weight certain segments to land more or less often. Your audience sees a natural spin while you stay in control of the experience.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. You can start spinning immediately with zero signup. Your wheels save locally in your browser so they're always there when you come back.",
  },
  {
    q: "What's the difference between QuickWheel and other wheel spinners?",
    a: "Most wheel spinners are built for classrooms or general decision-making, and it shows. They require accounts, feel clunky, and don't have features creators actually need like presentation mode, outcome weighting, or a clean interface for streaming. QuickWheel was built specifically as a live stream game and engagement tool for content creators who need a professional-looking random wheel they can put on screen.",
  },
  {
    q: "Can I save multiple wheels?",
    a: "Yes. Create and save as many wheels as you need. Switch between them instantly for different games, segments, or events. All saved locally with no account required.",
  },
  {
    q: "Does QuickWheel work on mobile?",
    a: "Yes. QuickWheel works on any device with a browser. It's also available as a Progressive Web App (PWA), so you can install it on your phone's home screen for quick access without going through an app store.",
  },
  {
    q: "Can I use QuickWheel as an OBS browser source?",
    a: "Yes. Copy your wheel's URL and add it as a browser source in OBS, Streamlabs, or any streaming software. Presentation mode gives you a clean display that sits perfectly in your stream layout. Works with Twitch, YouTube Live, and any platform you stream to.",
  },
  {
    q: "Can I embed QuickWheel on my website?",
    a: "Yes. QuickWheel supports embedding so you can add a wheel directly to your website, landing page, or fan hub.",
  },
];

const sections = [
  { id: "hero", label: "Hero" },
  { id: "what", label: "What It Is" },
  { id: "who", label: "Who It's For" },
  { id: "how", label: "How It Works" },
  { id: "features", label: "Features" },
  { id: "why", label: "Why QuickWheel" },
  { id: "faq", label: "FAQ" },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--border)", padding: "20px 0" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          color: "var(--text)",
          fontSize: "17px",
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 700,
          cursor: "pointer",
          width: "100%",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 0,
        }}
      >
        {q}
        <span
          style={{
            fontSize: "22px",
            color: "var(--cta)",
            marginLeft: "16px",
            flexShrink: 0,
            transition: "transform 0.2s",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
          }}
        >
          +
        </span>
      </button>
      {open && (
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "15px",
            lineHeight: 1.7,
            marginTop: "12px",
            marginBottom: 0,
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          {a}
        </p>
      )}
    </div>
  );
}

export default function QuickWheelHomepage() {
  const [activeNav, setActiveNav] = useState(null);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveNav(id);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Righteous&family=Nunito:wght@400;600;700&display=swap');
        :root {
          --bg: #F1F9F8;
          --bg2: #DDEEEC;
          --cta: #18AA96;
          --cta-hover: #138677;
          --accent: #EF6339;
          --secondary: #F7DCD4;
          --success: #3B9B6B;
          --text: #1B3232;
          --text-muted: #5B7B7B;
          --border: #C3DFDB;
          --card: #FFFFFF;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
      <div
        style={{
          background: "var(--bg)",
          color: "var(--text)",
          minHeight: "100vh",
          fontFamily: "'Nunito', sans-serif",
          fontSize: "16px",
          lineHeight: 1.5,
        }}
      >
        {/* Section Nav */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "rgba(241,249,248,0.92)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid var(--border)",
            padding: "10px 20px",
            display: "flex",
            gap: "6px",
            overflowX: "auto",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              color: "var(--text-muted)",
              alignSelf: "center",
              marginRight: "8px",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            Sections
          </span>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              style={{
                background:
                  activeNav === s.id ? "rgba(24,170,150,0.1)" : "var(--card)",
                border:
                  activeNav === s.id
                    ? "1px solid var(--cta)"
                    : "1px solid var(--border)",
                color: activeNav === s.id ? "var(--cta)" : "var(--text-muted)",
                fontSize: "12px",
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: "12px",
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px" }}>
          {/* HERO */}
          <section id="hero" style={{ textAlign: "center", padding: "72px 0 56px" }}>
            <div
              style={{
                display: "inline-block",
                background: "var(--secondary)",
                color: "var(--accent)",
                fontSize: "14px",
                fontWeight: 700,
                padding: "6px 16px",
                borderRadius: "12px",
                marginBottom: "24px",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              Free Spin Wheel for Creators
            </div>
            <h1
              style={{
                fontFamily: "'Righteous', sans-serif",
                fontSize: "clamp(36px, 6vw, 52px)",
                fontWeight: 400,
                lineHeight: 1.1,
                margin: "0 0 20px",
                color: "var(--text)",
              }}
            >
              Spin the Wheel.
              <br />
              <span style={{ color: "var(--cta)" }}>Your Way.</span>
            </h1>
            <p
              style={{
                fontSize: "18px",
                color: "var(--text-muted)",
                lineHeight: 1.6,
                maxWidth: "540px",
                margin: "0 auto 32px",
              }}
            >
              The clean, free wheel spinner and random picker built for streamers,
              content creators, and live events. Full customization, outcome
              control, and a presentation mode that looks great on screen. No
              signup required. Start spinning in seconds.
            </p>
            <div
              style={{
                display: "inline-block",
                background: "var(--cta)",
                color: "#fff",
                padding: "14px 36px",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              Launch QuickWheel — It's Free
            </div>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-muted)",
                marginTop: "14px",
                fontWeight: 600,
              }}
            >
              No signup required · Works on any device · Start in seconds
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-muted)",
                marginTop: "8px",
              }}
            >
              Want to support a small creator?{" "}
              <span style={{ color: "var(--cta)", fontWeight: 600, cursor: "pointer" }}>
                Check out Premium
              </span>
            </p>

            <div
              style={{
                marginTop: "48px",
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "60px 20px",
                color: "var(--text-muted)",
                fontSize: "14px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              [ Your existing app screenshots go here ]
            </div>
          </section>

          {/* WHAT IS QUICKWHEEL */}
          <section id="what" style={{ padding: "56px 0" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                color: "var(--cta)",
                marginBottom: "12px",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              What It Is
            </div>
            <h2
              style={{
                fontFamily: "'Righteous', sans-serif",
                fontSize: "24px",
                fontWeight: 400,
                marginBottom: "20px",
                lineHeight: 1.25,
              }}
            >
              A spin wheel app that doesn't suck.
            </h2>
            <div style={{ color: "var(--text-muted)", fontSize: "16px", lineHeight: 1.8 }}>
              <p style={{ margin: "0 0 16px" }}>
                QuickWheel is a free, customizable spin wheel built for people who
                actually put wheels on screen. If you've ever tried to run a tip
                game, a giveaway, or a viewer challenge and spent half your time
                fighting clunky interfaces and tools that weren't built for
                creators... this is for you.
              </p>
              <p style={{ margin: "0 0 16px" }}>
                Create your wheel, customize the segments, set your own outcome
                weights, and launch it in presentation mode for a clean display
                that's ready for streaming, screen sharing, or live events. Save as
                many wheels as you need and switch between them instantly.
              </p>
              <p style={{ margin: 0 }}>
                Whether you're running it as a browser source in OBS, screen
                sharing on a Twitch stream, or spinning it on your phone during
                a YouTube Live... it just works. No account required. Just a
                wheel that works the way you need it to.
              </p>
            </div>
          </section>

          {/* WHO IT'S FOR */}
          <section id="who" style={{ padding: "56px 0" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                color: "var(--cta)",
                marginBottom: "12px",
              }}
            >
              Built For
            </div>
            <h2
              style={{
                fontFamily: "'Righteous', sans-serif",
                fontSize: "24px",
                fontWeight: 400,
                marginBottom: "32px",
                lineHeight: 1.25,
              }}
            >
              If you put content on a screen, this is for you.
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
              }}
            >
              {[
                {
                  title: "Streamers & Cam Models",
                  desc: "Run tip games, spin-to-win challenges, and viewer rewards. Use it as a prize wheel for giveaways or a live stream game that actually boosts viewer engagement.",
                },
                {
                  title: "Content Creators",
                  desc: "Use wheels for content ideas, fan engagement, giveaways, and interactive posts across any platform.",
                },
                {
                  title: "Live Event Hosts",
                  desc: "Clean presentation mode makes QuickWheel perfect for raffles, prize drawings, and audience participation.",
                },
                {
                  title: "Anyone Who Values Simplicity",
                  desc: "If you just need a free wheel spinner that works without making you jump through hoops or create an account... same. That's why this exists.",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: "18px",
                      fontWeight: 700,
                      marginBottom: "10px",
                      color: "var(--text)",
                      lineHeight: 1.3,
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "14px",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section id="how" style={{ padding: "56px 0" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                color: "var(--cta)",
                marginBottom: "12px",
              }}
            >
              How It Works
            </div>
            <h2
              style={{
                fontFamily: "'Righteous', sans-serif",
                fontSize: "24px",
                fontWeight: 400,
                marginBottom: "36px",
                lineHeight: 1.25,
              }}
            >
              Three steps. No friction.
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {[
                {
                  step: "1",
                  title: "Add your segments",
                  desc: "Type in whatever you want on the wheel. Prizes, challenges, names, actions... anything. Add as many as you need.",
                },
                {
                  step: "2",
                  title: "Customize and weight",
                  desc: "Set colors, adjust outcome weights so certain segments land more or less often, and dial in the wheel to match your game or event.",
                },
                {
                  step: "3",
                  title: "Spin it",
                  desc: "Hit presentation mode for a clean, full-screen display. Add it as a browser source in OBS or Streamlabs, screen share it on Twitch or YouTube Live, or just spin it on your phone. Works with any streaming software that supports browser sources.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "flex-start",
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: i === 2 ? "var(--accent)" : "var(--cta)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'Righteous', sans-serif",
                      fontSize: "22px",
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontSize: "18px",
                        fontWeight: 700,
                        marginBottom: "6px",
                        lineHeight: 1.3,
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "15px",
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FEATURES */}
          <section id="features" style={{ padding: "56px 0" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                color: "var(--cta)",
                marginBottom: "12px",
              }}
            >
              Features
            </div>
            <h2
              style={{
                fontFamily: "'Righteous', sans-serif",
                fontSize: "24px",
                fontWeight: 400,
                marginBottom: "32px",
                lineHeight: 1.25,
              }}
            >
              Everything you need. Nothing you don't.
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              {[
                {
                  icon: "🎬",
                  title: "Presentation Mode",
                  desc: "Full-screen display with all controls hidden. Clean enough for streaming, screen sharing, and live events.",
                },
                {
                  icon: "⚖️",
                  title: "Weighted Outcomes",
                  desc: "Control how often each segment lands. Your audience sees a natural spin while you manage the experience.",
                },
                {
                  icon: "💾",
                  title: "Multiple Wheels",
                  desc: "Save and manage as many wheels as you need. Switch between them for different games, shows, or events.",
                },
                {
                  icon: "✨",
                  title: "Clean Interface",
                  desc: "No clutter, no distractions. Your wheel, your screen, and nothing getting in the way of the experience.",
                },
                {
                  icon: "⚡",
                  title: "No Account Needed",
                  desc: "Start spinning in seconds. Wheels save to your browser automatically. Come back anytime.",
                },
                {
                  icon: "📱",
                  title: "Works Everywhere",
                  desc: "Browser-based random wheel spinner that works on desktop, tablet, or phone. Install as a PWA for quick access.",
                },
                {
                  icon: "🔗",
                  title: "Embeddable",
                  desc: "Drop a wheel into your website, landing page, or fan hub with a simple embed.",
                },
                {
                  icon: "🎨",
                  title: "Custom Templates",
                  desc: "Start from pre-built wheel templates or create your own from scratch.",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    padding: "20px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "10px" }}>
                    {f.icon}
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: "16px",
                      fontWeight: 700,
                      marginBottom: "8px",
                      lineHeight: 1.3,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "13px",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Support Banner */}
            <div
              style={{
                marginTop: "32px",
                background: "var(--secondary)",
                border: "1px solid #F5C9BC",
                borderRadius: "16px",
                padding: "24px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--text)",
                  marginBottom: "8px",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                QuickWheel is built and maintained by one person.
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-muted)",
                  lineHeight: 1.6,
                  maxWidth: "500px",
                  margin: "0 auto 16px",
                }}
              >
                If you find it useful and want to support a small creator, the
                premium version unlocks extra features. Every dollar goes
                directly into hosting and building more tools for creators.
              </p>
              <div
                style={{
                  display: "inline-block",
                  background: "var(--accent)",
                  color: "#fff",
                  padding: "10px 24px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                See Premium
              </div>
            </div>
          </section>
          <section id="why" style={{ padding: "56px 0" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                color: "var(--cta)",
                marginBottom: "12px",
              }}
            >
              Why QuickWheel
            </div>
            <h2
              style={{
                fontFamily: "'Righteous', sans-serif",
                fontSize: "24px",
                fontWeight: 400,
                marginBottom: "20px",
                lineHeight: 1.25,
              }}
            >
              I built this because everything else was garbage.
            </h2>
            <div style={{ color: "var(--text-muted)", fontSize: "16px", lineHeight: 1.8 }}>
              <p style={{ margin: "0 0 16px" }}>
                I'm a content creator who needed a spin wheel for tip games on my
                live streams. Every option I found either required an account,
                looked cheap on screen, or didn't give me any real control over
                outcomes.
              </p>
              <p style={{ margin: "0 0 16px" }}>
                So I taught myself to code and built my own. QuickWheel started as
                a tool just for me, but I realized other creators deal with the
                exact same frustrations. So I cleaned it up and made it free for
                everyone.
              </p>
              <p style={{ margin: 0 }}>
                There's no company behind this. No investors. No growth team. Just
                a creator who built a tool that solves a real problem and wants
                other creators to have it too.
              </p>
            </div>

            {/* Comparison Table */}
            <div
              style={{
                marginTop: "32px",
                background: "var(--bg2)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "24px",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: "18px",
                  fontWeight: 700,
                  marginBottom: "16px",
                  color: "var(--text)",
                }}
              >
                QuickWheel vs. Other Wheel Spinners
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)" }}>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          color: "var(--text-muted)",
                          fontWeight: 600,
                        }}
                      ></th>
                      <th
                        style={{
                          textAlign: "center",
                          padding: "10px 12px",
                          color: "var(--cta)",
                          fontWeight: 700,
                          fontSize: "15px",
                        }}
                      >
                        QuickWheel
                      </th>
                      <th
                        style={{
                          textAlign: "center",
                          padding: "10px 12px",
                          color: "var(--text-muted)",
                          fontWeight: 600,
                        }}
                      >
                        Others
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Free to use", "✓", "Sometimes"],
                      ["No signup required", "✓", "Varies"],
                      ["Presentation mode", "✓", "Rare"],
                      ["Outcome weighting", "✓", "Premium"],
                      ["Built for creators", "✓", "No"],
                      ["Multiple saved wheels", "✓", "Premium"],
                      ["Embeddable", "✓", "Varies"],
                      ["Built for live streaming", "✓", "No"],
                    ].map((row, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom: "1px solid var(--border)",
                          background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.4)",
                        }}
                      >
                        <td
                          style={{
                            padding: "10px 12px",
                            color: "var(--text)",
                            fontWeight: 600,
                          }}
                        >
                          {row[0]}
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            textAlign: "center",
                            color: "var(--cta)",
                            fontWeight: 700,
                            fontSize: "16px",
                          }}
                        >
                          {row[1]}
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            textAlign: "center",
                            color: "var(--text-muted)",
                          }}
                        >
                          {row[2]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" style={{ padding: "56px 0" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                color: "var(--cta)",
                marginBottom: "12px",
              }}
            >
              FAQ
            </div>
            <h2
              style={{
                fontFamily: "'Righteous', sans-serif",
                fontSize: "24px",
                fontWeight: 400,
                marginBottom: "28px",
                lineHeight: 1.25,
              }}
            >
              Questions people actually ask.
            </h2>
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "4px 24px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              {faqs.map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>
          </section>

          {/* FINAL CTA */}
          <section
            style={{
              textAlign: "center",
              padding: "56px 0 72px",
              borderTop: "1px solid var(--border)",
            }}
          >
            <h2
              style={{
                fontFamily: "'Righteous', sans-serif",
                fontSize: "32px",
                fontWeight: 400,
                marginBottom: "16px",
              }}
            >
              Ready to spin?
            </h2>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "16px",
                marginBottom: "28px",
                maxWidth: "420px",
                margin: "0 auto 28px",
                lineHeight: 1.6,
              }}
            >
              Free to use. No account needed. Just a better wheel spinner built
              by a creator who needed one.
            </p>
            <div
              style={{
                display: "inline-block",
                background: "var(--accent)",
                color: "#fff",
                padding: "14px 36px",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              Launch QuickWheel — It's Free
            </div>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-muted)",
                marginTop: "16px",
                lineHeight: 1.6,
              }}
            >
              Love it?{" "}
              <span style={{ color: "var(--cta)", fontWeight: 600, cursor: "pointer" }}>
                Go Premium
              </span>
              {" "}to support a small creator. Every dollar goes into hosting
              and building more tools.
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                marginTop: "48px",
                lineHeight: 1.4,
              }}
            >
              QuickWheel © 2026 · Built by a creator, for creators · For
              entertainment and private use
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
