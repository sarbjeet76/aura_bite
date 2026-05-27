# AuraBite 🍔✨
### Gourmet Concierge, Live Order Tracker & Administrative Control Suite

Welcome to **AuraBite**, a premium, high-fidelity full-stack single-page restaurant directory, critique review, and real-time ordering application. The platform features a gorgeously designed dark/light glassmorphic layout, role-based dashboards, automatic database failover mechanisms, and interactive customer desks.

---

## 💻 GitHub Repository & Production Source
- **Official Repository**: [github.com/Sarbjeetjk/aura_bite](https://github.com/Sarbjeetjk/aura_bite)
- **Primary Branch**: `main`
- **Remote Origin**: `https://github.com/Sarbjeetjk/aura_bite.git`

---

## 🛠️ Technology Stack Used

| Layer | Technologies & Libraries | Key Purposes & Roles |
| :--- | :--- | :--- |
| **Frontend Core** | **React (v18)**, **React Router DOM v6** | Single-page UI routing, component lifecycles, and interactive view managers. |
| **State Managers** | **React Context API** | Unified auth session context, cart addition safety checks, and visual theme persistence. |
| **Frontend Styling** | **Vanilla CSS**, **FontAwesome Icons** | Curved custom border radiuses, soft glow glassmorphisms, CSS variables dark/light switching. |
| **API Client** | **Axios**, **Socket.io Client** | Secure REST data operations and instant bi-directional Websockets channels sync. |
| **Backend Core** | **Node.js**, **Express.js (10MB Limit)**, **Socket.io Server** | High-throughput REST API controllers, JWT/RBAC gatekeepers, live orders pipeline. |
| **Database ODM** | **MongoDB**, **Mongoose** | Strict model schema validations, dynamic pre-save review averages and count aggregates. |
| **Zero-Config DB** | **MongoDB Memory Server** | High-fidelity automatic in-memory MongoDB fallback server if local databases are unavailable. |
| **Security & Auth** | **JWT (JSON Web Tokens)**, **bcryptjs** | Dynamic credential hashing, cryptographically signed cookies, secure access gates. |

---

## 🌟 Visual Core & Design Language
- **Dual Persisted Themes**: A space-chasm dark theme with dynamic golden amber accents, and a cream-ivory light theme (`#f8f6f0`) with dark stone-charcoal typography, fully bound to `localStorage`.
- **Gourmet Ambient Hero Image Background**: The home page search banner background is styled with a gorgeous dining restaurant photo (`/hero-bg.jpg`) overlaid with a dark glassmorphic gradient for optimal text contrast and readability in both themes.
- **Premium Glassmorphic Design**: Utilizes soft multi-layered shadows, elegant container borders, and frosted glass backdrops (`backdrop-filter`) built on vanilla CSS.
- **Scroll Restoration**: Route changes automatically reset scroll offsets to `(0, 0)`, preventing frustrating bottom-snapping when browsing menus, reviews, or logging in.

---

## 🚀 Key Functional Modules & Features

### 👤 1. Customer Dining Hub
* **Store Directory**: Interactive restaurant grids categorized with quick-search inputs and cuisine-type tags filtering.
* **Storefront Detail**: Interactive menu directories categorized by cuisine types (e.g., Starters, Mains, Desserts, Beverages) and responsive checkout carts.
* **Structured checkout & Simulator**:
  * Multi-field delivery address input system (Street, City, State, Pincode, and optional Landmark).
  * Interactive payment method dropdown with a high-fidelity credit/debit card details form simulator.
* **Critiques Drawer**: Submit, modify, or delete review comments and star ratings. Unauthenticated guest attempts dynamically redirect to the authentication screen and auto-focus the "Sign Up" tab.
* **Order History Progress Tracker**: Interactive customer ledger showcasing a beautiful horizontal step progress indicator driven by WebSockets.

### 💼 2. Seller Restaurant Console
* **Real-time Order Alerts**: Live incoming order tickets with immediate audio alert prompts and desktop notifications.
* **Hybrid Image Uploader (Dishes & Cover Showcase)**:
  * Replaced static text inputs with an interactive hybrid uploader component.
  * Sellers can **paste standard Image URLs** or **directly upload local JPEG, JPG, and PNG files** (up to 5MB).
  * Uploaded images are encoded to high-fidelity Base64 Data URIs via `FileReader` in the browser and updated seamlessly inside the 10MB-supported backend.
  * Renders a real-time thumbnail image loading preview with a clearing trigger before saving.
* **Culinary Menu CRUD Workspace**: Create, read, update, or delete menu items, pricing, availability toggles, and categories.
* **Storefront Customizer**: Modify store descriptions, cuisine profiles, and operational hours.

### 🛡️ 3. Master Administrator Command Center
* **Live Revenue Metrics**: Dynamic card layout tracking **Gross Revenue**, **Active Customers/Sellers**, and **Restaurant Listings count**.
* **Profile Authority Manager**: Tabular view to inspect registrations, elevate customer accounts to restaurant owners or admins, or delete credentials.
* **Enquiry Helpdesk Manager**: Administrative tickets portal to read customer/demo contact submissions, update workflow states (`Pending`, `In Progress`, `Resolved`), or purge stale items.
* **Critiques Moderation Control**: Master review logs to filter out malicious content using a dynamic toggle to **Hide/Unhide** review posts publicly (which dynamically recalculates restaurant ratings) or delete reviews permanently.

---

## 👥 Demo Credentials & Profiles

Use the following seeded accounts (currently populated in your cloud Atlas database) to test all three panels:

| Portal Panel | User Role | Seed Email Address | Password | Key Functionality |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Hub** | `admin` | `admin@aurabite.com` | `admin123` | System stats, users elevation, review hiding, support tickets |
| **Seller Console** | `seller` | `seller1@aurabite.com` | `seller123` | Bella Italia menu management, order live-alert, operational hours |
| **Seller Console** | `seller` | `seller2@aurabite.com` | `seller123` | Sakura Sushi menu management, order live-alert, operational hours |
| **Customer Hub** | `customer` | `customer1@aurabite.com` | `customer123` | Place order, write reviews, structured address checkout, track status |

---

## 🛠️ Step-by-Step Setup & How to Run

AuraBite is a decoupled full-stack monorepo consisting of a Node/Express backend and a Vite React frontend.

### 📋 Prerequisites
- **Node.js** (v16.x or newer) and **npm** installed.
- **MongoDB Atlas** configuration is already established inside [backend/.env](file:///d:/project_/backend/.env) pointing directly to your remote live database clusters!

---

### 🔌 Step 1: Backend Server Setup

1. Open your terminal and navigate to the `/backend` folder:
   ```bash
   cd backend
   ```
2. Install the server-side dependencies:
   ```bash
   npm install
   ```
3. *(Optional)* Seed the database with gourmet restaurants, categorized menus, critiques, and analytical history:
   ```bash
   npm run seed
   ```
4. Start the Express server:
   ```bash
   npm run dev
   ```
   *The backend will boot up on `http://localhost:5000`.*

---

### 💻 Step 2: Frontend Client Setup

1. Open a second terminal window and navigate to the `/frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the client-side dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development build server:
   ```bash
   npm run dev
   ```
   *The frontend client will boot up on `http://localhost:5173`. Click the terminal link to launch AuraBite!*

---

## 🧪 Running Automated API Integration Tests

The platform includes a backend integration test suite. This suite spawns an isolated server, performs database initialization, verifies registrations, tests restaurant creations, checks price-fraud validation, places a structured order, triggers Mongoose review aggregates, and purges test documents safely.

To run the automated tests:
1. Navigate to `/backend` in your terminal.
2. Execute the test command:
   ```bash
   node scripts/test-api.js
   ```
3. Expected Output: `✔ ALL REST API INTEGRATION TESTS PASSED!`

---

## 📞 Support & Inquiries
For platform feedback, demo assistance, or custom enquiries, reach out to the Gourmet Support team:
- **Email**: [Sarbjeet@aurabite.com](mailto:Sarbjeet@aurabite.com)
- **Phone**: `+91 76****5919`
- **Portal**: Access the online ticket system at `/enquiry` in your browser.
