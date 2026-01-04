# Product Requirements Document (PRD)
## Rigged Wheel Spinner App

---

## 1. Product Overview

| Item | Description |
|------|-------------|
| **Product Name** | TBD (working title: Wheel Spinner) |
| **One-liner** | A customizable prize wheel with hidden probability controls |
| **Problem** | Existing wheel spinners are truly random — users have no control over outcomes |
| **Solution** | A wheel that *appears* fair but lets the operator secretly weight the odds |
| **Key Differentiator** | Unlike competitors (Wheel of Names, Picker Wheel), this app allows operators to secretly control outcomes while maintaining the appearance of randomness to viewers |

---

## 2. Target Users

| User Type | Use Case |
|-----------|----------|
| Content creators / streamers | Controlled giveaways, entertainment |
| Marketers | Prize promotions with managed prize distribution |
| Teachers / presenters | Classroom games, decision-making |
| Event hosts | Party games, raffles |

---

## 3. User Roles

| Role | Permissions |
|------|-------------|
| **Visitor** | View landing page, use wheel without saving, sign up |
| **Free User** | Create wheels, limited saves (1-2), sees ads |
| **Paid User** | Unlimited saves, no ads, premium features |
| **Admin** | Full access to all features, admin dashboard, user management, bypasses paywalls |

---

## 4. Core Features (MVP)

### 4.1 Wheel Display & Spin

| Spec | Detail |
|------|--------|
| Wheel design | Colorful segments, red/gold pointer fixed at top |
| Spin duration | 4-5 seconds with ±0.5s randomness |
| Animation | Fast start, natural deceleration (ease-out) |
| Spin lock | Cannot spin again while wheel is spinning |
| Winner determination | Server-side: probability selects winner before animation begins |
| Win feedback | Confetti animation + celebration sound |
| Landing visual | Winning segment stops directly under pointer |

### 4.2 Segment Customization

| Spec | Detail |
|------|--------|
| Add/remove segments | Yes |
| Rename segments | Yes |
| Duplicate names | Allowed |
| Custom colors | Yes, per segment |
| Minimum segments | 2 |
| Maximum segments | 20 |
| Text handling | Auto-scale font based on length, truncate with "..." if needed |
| Max characters | 25 per segment name |

### 4.3 Probability Rigging

| Spec | Detail |
|------|--------|
| Input type | Percentage per segment (whole numbers only) |
| Validation | Must total exactly 100% |
| UI indicator | Shows current total, warns if over/under 100% |
| Default (all 0) | Equal odds across all segments |
| Calculation | Server-side to keep weights hidden from viewers |
| Audience visibility | Probabilities never visible in Presentation Mode |

### 4.4 Presentation Mode

| Spec | Detail |
|------|--------|
| Toggle | Single button to enter/exit |
| Hidden elements | All editing controls, probability inputs, segment management |
| Visible elements | Wheel, spin button, result display |
| Use case | Show to audience without revealing controls |

### 4.5 User Accounts

| Spec | Detail |
|------|--------|
| Sign up / log in | Email + password |
| OAuth (optional) | Google login |
| Profile management | Change password, email |

### 4.6 Save & Load Wheels

| Spec | Detail |
|------|--------|
| Save wheel | Stores segment names, colors, probabilities |
| Naming | User names each saved wheel |
| Free tier | 1-2 saved wheels |
| Paid tier | Unlimited saved wheels |
| Dashboard | "My Wheels" list to manage saved configurations |

### 4.7 Admin System

| Spec | Detail |
|------|--------|
| Admin flag | `role: admin` in database |
| Admin dashboard | `/admin` route (hidden from regular users) |
| Dashboard features | View all users, subscription status, usage stats |
| Permissions | Full feature access, bypasses all paywalls/limits |

---

## 5. Screens

| Screen | Description |
|--------|-------------|
| **Home / Wheel** | Landing page + main wheel interface (doubles as both) |
| **My Wheels** | Dashboard listing saved wheel configurations |
| **Pricing** | Compare free vs paid tiers |
| **Account Settings** | Manage profile, password, subscription |
| **Admin Dashboard** | User management, stats (admin only) |

---

## 6. Technical Architecture

| Layer | Technology |
|-------|------------|
| **Frontend** | React |
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL |
| **Auth** | Email/password + Google OAuth |
| **Hosting** | Replit (Autoscale deployment) |
| **Probability logic** | Server-side (keeps rigging hidden from browser) |

---

## 7. Visual Design Direction

### 7.1 Overall Aesthetic

| Element | Spec |
|---------|------|
| **Vibe** | Luxe, polished, premium — feels high-end but approachable |
| **Style** | Clean, modern, minimal clutter |
| **Inspiration** | Tiny Decisions' simplicity + elevated sophistication |

### 7.2 Color System

| Element | Spec |
|---------|------|
| **Default mode** | Light — crisp white/off-white background |
| **Dark mode** | Deep charcoal/black background (included in MVP) |
| **Accent color** | User-selectable (gold, rose, teal, purple, etc.) |
| **Wheel palette** | Vibrant but harmonious — curated color sets that look good together |

### 7.3 Theme Options (User Customizable)

| Theme | Description |
|-------|-------------|
| **Classic** | Bold primary colors, clean look |
| **Pastel** | Soft, muted tones |
| **Neon** | Bright, energetic, punchy |
| **Monochrome** | Shades of a single color |
| **Luxe** | Golds, deep jewel tones, elegant feel |
| **Custom** | User picks individual segment colors |

### 7.4 UI Elements

| Element | Spec |
|---------|------|
| **Typography** | Modern sans-serif (Inter, Poppins, or SF Pro) |
| **Buttons** | Rounded corners, subtle shadows, satisfying hover/tap states |
| **Spin button** | Large, prominent, slightly elevated — feels tactile |
| **Pointer** | Sleek red/gold triangle at top — premium feel |
| **Cards/panels** | Soft shadows, rounded corners, clean separation |
| **Icons** | Simple line icons, consistent stroke weight |

### 7.5 Wheel Design

| Element | Spec |
|---------|------|
| **Shape** | Perfect circle, clean segment divisions |
| **Segment style** | Flat colors with subtle gradient or slight bevel for depth |
| **Border** | Thin outer ring (metallic gold/silver option for luxe feel) |
| **Text** | White or dark depending on segment color, auto-contrast |
| **Animation** | Smooth easing, satisfying momentum, gentle bounce at stop |

### 7.6 Celebration/Win State

| Element | Spec |
|---------|------|
| **Confetti** | Colorful burst, matches wheel theme |
| **Sound** | Satisfying "ding" or chime (toggleable) |
| **Result display** | Clean modal or highlight showing winning segment |

### 7.7 Presentation Mode Look

| Element | Spec |
|---------|------|
| **Background** | Simplified — just wheel centered on clean backdrop |
| **Hidden** | All controls, editing UI, probability indicators |
| **Visible** | Wheel + spin button + result only |
| **Feel** | Cinematic, full-screen ready for streaming/sharing |

---

## 8. Mobile & Responsive

| Spec | Detail |
|------|--------|
| Responsive design | Yes — mobile-first approach |
| Touch-friendly | Large spin button, easy segment editing |
| Future | Convert to mobile app (React Native / Expo) |

---

## 9. Edge Case Handling

| Scenario | Behavior |
|----------|----------|
| Delete last segment | Blocked — minimum 2 required |
| All probabilities = 0 | Treated as equal odds |
| Probabilities ≠ 100% | Warning displayed, spin button disabled until fixed |
| Duplicate segment names | Allowed |
| Text too long | Auto-shrink font, truncate with "..." at 25 chars |
| Spin while spinning | Disabled — button locked during animation |

---

## 10. Legal

Terms of Service to include:

> *"This app is for entertainment purposes only. Not intended for gambling or financial decisions."*

---

## 11. Future Features (Post-MVP)

| Feature | Description |
|---------|-------------|
| Subscription tiers | Stripe integration for paid plans |
| Ad integration | Display ads for free users |
| Premium themes | Custom wheel styles, sound packs |
| Force spin | Guarantee next spin lands on specific segment |
| Spin history | Log of past results |
| Shareable links | Public view-only wheel links |
| Spin speed setting | Quick / Normal / Dramatic options |

---

## 12. Build Phases

| Phase | Focus |
|-------|-------|
| 1 | Wheel UI + spin animation (default segments) |
| 2 | Probability rigging logic (server-side) |
| 3 | Segment customization (add/remove/rename/colors) |
| 4 | Presentation Mode |
| 5 | User auth + database setup |
| 6 | Save/load wheels + My Wheels dashboard |
| 7 | Admin role + admin dashboard |
| 8 | Subscription tiers + paywalls |
| 9 | Ad integration |

---

## 13. Success Criteria (MVP)

- [ ] Wheel displays with customizable segments (2-20)
- [ ] Spin animation with confetti + sound on win
- [ ] Probability weights respected (server-side calculation)
- [ ] Presentation Mode hides all controls
- [ ] User can sign up, log in, save/load wheels
- [ ] Admin account has full access + dashboard
- [ ] Responsive on mobile and desktop
- [ ] Dark mode toggle available
- [ ] Multiple theme options for wheel customization

---

## 14. Appendix: Replit Vibe Coding Notes

This project follows the **Vibe Coding** methodology:

- **Incremental building**: One phase at a time
- **Plan before build**: Use Plan Mode in Replit Agent before implementation
- **Specific prompts**: Clear goals, context, and success criteria
- **Checkpoint often**: Save progress after each working feature
- **Debug with evidence**: Provide exact errors, expected vs actual behavior

Reference: See `Reference_Knowledge_Document.docx` for full vibe coding principles.

---

*Document Version: 1.0*
*Last Updated: January 2025*
