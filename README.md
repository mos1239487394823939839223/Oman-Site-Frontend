<div align="center">

# 🛍️ Oman E-Commerce — Storefront

**Bilingual (Arabic / English) online store built with Next.js — full RTL support, real-time updates and online checkout.**

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MUI](https://img.shields.io/badge/MUI-007FFF?style=for-the-badge&logo=mui&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-0EA5E9?style=for-the-badge&logo=tailwindcss&logoColor=white)
![i18next](https://img.shields.io/badge/i18next-26A69A?style=for-the-badge&logo=i18next&logoColor=white)

</div>

---

## ✨ Features

- 🌍 **Arabic & English** with automatic language detection and true **RTL layouts** (MUI + stylis RTL plugin)
- 🏠 Home page with dynamic banners managed from the admin
- 🗂️ Browse by **categories, sub-categories and brands**; product details with reviews
- 🛒 **Cart, wishlist, coupons and gifts**
- 📦 Order history and product reviews
- 💳 **Checkout** with saved addresses and online payment (Thawani Pay)
- 👤 Signup, login, password reset and profile management
- 🛠️ **Admin area** for products, orders, banners and content
- ⚡ Real-time updates via Socket.io
- 🐳 Dockerfile for container deployment

## 🧰 Tech Stack

| Layer | Tools |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| UI | MUI, Tailwind CSS v4, React Icons |
| i18n | i18next, react-i18next, browser language detector |
| Forms | React Hook Form |
| Realtime | Socket.io client |

## 🚀 Getting Started

```bash
git clone https://github.com/mos1239487394823939839223/Oman-Site-Frontend.git
cd Oman-Site-Frontend
npm install
npm run dev            # http://localhost:3000
```

Point the app to the API in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

| Script | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run type-check` | TypeScript check |

### 🐳 Docker

```bash
docker build -t oman-frontend .
docker run -p 3000:3000 oman-frontend
```

## 🔗 Related

- Backend API: **[Oman-Site-Backend](https://github.com/mos1239487394823939839223/Oman-Site-Backend)**

---

<div align="center">

Built by **[Mustafa Anwer Hamed](https://github.com/mos1239487394823939839223)**

</div>
