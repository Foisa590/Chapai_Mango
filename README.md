# 🥭 Chapai Mango

A premium full-stack e-commerce site for selling **Chapainawabganj-er gachpaka aam** online.

Built with **Next.js 14**, **Supabase**, **Tailwind CSS**, **React Three Fiber** (3D hero), **Framer Motion** & **Zustand**. Fully deployable to **Vercel** in minutes.

---

## ✨ Features

- 🥭 **5 polished pages** — Home, Shop, Product detail, About, Contact (+ Cart & Checkout)
- 🎨 **3D rotating mango** hero (React Three Fiber, no external assets)
- 🛒 **Cart** persisted to `localStorage` (Zustand)
- 💳 **Manual MFS payment** — Cash on Delivery + **bKash / Nagad / Rocket** with TrxID capture
- 🗄️ **Supabase** — products, orders, testimonials, contact messages
- 🪄 **Mock data fallback** — site works locally even before Supabase is wired up
- 📱 Fully responsive · animated · SEO-friendly · BDT formatting
- ⚡ Auto-deploy from GitHub → Vercel

---

## 🚀 Quick Start (Local)

```bash
# 1. Install deps
npm install

# 2. Copy env example
cp .env.local.example .env.local
# (you can leave Supabase keys blank for now — site uses mock data)

# 3. Run dev server
npm run dev
```

Open <http://localhost:3000>.

---

## 🗄️ Supabase Setup (5 minutes)

### 1. Create a project
1. Go to <https://supabase.com> → **New project**
2. Name it `chapai-mango`, pick a region (Singapore is closest to BD)
3. Save the password somewhere safe

### 2. Run the schema
1. Open **SQL Editor** in Supabase dashboard
2. Click **New query**
3. Copy contents of [`supabase/schema.sql`](./supabase/schema.sql) and **Run**
4. ✅ Tables created + RLS enabled + 6 mangoes + 3 testimonials seeded

### 3. Grab API keys
1. **Settings → API** in Supabase
2. Copy `Project URL` and `anon public` key
3. Paste into `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Restart `npm run dev` — the site will now read from Supabase.

---

## 💳 Payment Setup (bKash / Nagad / Rocket)

This site uses a **manual MFS flow** (no SSL Commerz / merchant integration needed):

1. Customer chooses bKash / Nagad / Rocket on checkout
2. Site shows **your personal/agent number** + total amount
3. Customer "Send Money" → enters **TrxID + sender number** in form
4. Order saved to Supabase with `status='pending'`
5. You verify the transaction in your bKash app, then update `status='confirmed'` from Supabase dashboard

### Configure your numbers

Edit `.env.local`:

```bash
NEXT_PUBLIC_BKASH_NUMBER=01XXXXXXXXX
NEXT_PUBLIC_NAGAD_NUMBER=01XXXXXXXXX
NEXT_PUBLIC_ROCKET_NUMBER=01XXXXXXXXX
NEXT_PUBLIC_BUSINESS_PHONE=01XXXXXXXXX
NEXT_PUBLIC_BUSINESS_EMAIL=hello@chapaimango.com
```

> 💡 Pore SSLCommerz / Stripe-er proper integration korte chaile, just `components/checkout/CheckoutForm.tsx`-er `onSubmit` handler change korle hobe.

---

## 📦 Manage Orders

Open Supabase → **Table Editor → `orders`**:

- `status='pending'` → new order, payment unverified
- Verify TrxID in bKash/Nagad/Rocket app
- Update to `confirmed` → `shipped` → `delivered`

You can also build an admin panel later at `/admin` (Supabase auth + service role).

---

## ☁️ Deploy to Vercel (3 minutes)

### 1. Push to GitHub
This repo is already at <https://github.com/Foisa590/Chapai_Mango>. Just commit & push your local changes.

### 2. Import on Vercel
1. Go to <https://vercel.com/new>
2. Click **Import** on `Chapai_Mango`
3. Framework: **Next.js** (auto-detected)
4. Add **Environment Variables**:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase |
| `NEXT_PUBLIC_BKASH_NUMBER` | your bKash number |
| `NEXT_PUBLIC_NAGAD_NUMBER` | your Nagad number |
| `NEXT_PUBLIC_ROCKET_NUMBER` | your Rocket number |
| `NEXT_PUBLIC_BUSINESS_PHONE` | your contact number |
| `NEXT_PUBLIC_BUSINESS_EMAIL` | your contact email |

5. Click **Deploy**. Done. 🎉

Future pushes to `main` auto-deploy.

### Custom Domain
Settings → Domains → add `chapaimango.com` (or whatever) → update DNS.

---

## 🗂️ Project Structure

```
Chapai_Mango/
├── app/
│   ├── layout.tsx              # Root layout (Navbar, Footer, Toaster)
│   ├── page.tsx                # Home
│   ├── products/
│   │   ├── page.tsx            # Shop listing
│   │   └── [slug]/page.tsx     # Detail
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   └── globals.css
├── components/
│   ├── 3d/                     # MangoMesh, Scene (R3F)
│   ├── home/                   # Hero, Featured, WhyChooseUs, Testimonials, CTA
│   ├── product/                # ProductCard, ProductsExplorer, Gallery, AddToCart
│   ├── cart/CartView.tsx
│   ├── checkout/CheckoutForm.tsx
│   ├── contact/ContactForm.tsx
│   └── layout/                 # Navbar, Footer
├── lib/
│   ├── supabase/               # client.ts, server.ts (SSR helpers)
│   ├── data.ts                 # Supabase + mock-fallback fetchers
│   └── utils.ts                # cn, formatBDT, slugify
├── store/cart-store.ts         # Zustand cart (persisted)
├── types/index.ts
├── supabase/schema.sql         # Run this in Supabase SQL Editor
└── .env.local.example
```

---

## 🎨 Customizing

| Want to… | Edit |
|---|---|
| Change colors / theme | `tailwind.config.ts` (mango palette) |
| Add a new mango variety | Insert row in Supabase `products` table |
| Update homepage copy | `components/home/*` |
| Change delivery fee / free threshold | `components/cart/CartView.tsx` & `components/checkout/CheckoutForm.tsx` (search `2000`) |
| Replace 3D mango with a real GLB | `components/3d/MangoMesh.tsx` → use `useGLTF` from drei |
| Add admin dashboard | Create `app/admin/` with Supabase auth + service role |

---

## 🛣️ Roadmap (next phases)

- [ ] Admin dashboard (`/admin`) with Supabase Auth
- [ ] Email/SMS notification on new order (Resend / SMS API)
- [ ] SSLCommerz integration for direct online payment
- [ ] Customer order tracking page (`/orders/[id]`)
- [ ] Product reviews & ratings (logged-in customers)
- [ ] Multi-language toggle (Bangla / English)

---

## 🧰 Tech Stack

| Category | Tool |
|----------|------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| 3D | React Three Fiber + Three.js + drei |
| Animation | Framer Motion |
| State | Zustand (persisted) |
| Forms | React Hook Form + Zod |
| Database / Auth | Supabase |
| Notifications | react-hot-toast |
| Icons | lucide-react |
| Deploy | Vercel |

---

## 📜 License

Private — © Chapai Mango. All rights reserved.
