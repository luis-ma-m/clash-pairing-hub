
# DebateMinistrator

**A comprehensive tournament management system for academic debate competitions**

Created by **Luis Martín Maíllo**

---

## 🎯 Project Overview

DebateMinistrator is a modern, web-based platform designed to streamline the end-to-end management of academic debate tournaments. Built with tournament administrators, adjudicators, and team captains in mind, it combines intuitive design with powerful features to handle everything from team registration to live scoring and real-time analytics.

## ✨ Current Features

### 🏆 Tournament Dashboard
- **Real-time tournament overview** with progress tracking
- **Live activity feed** showing recent updates and actions
- **Quick statistics** including team counts, round progress, and active debates
- **Tournament configuration** management with flexible format support

### 👥 User Management
- **Role-based access control** with predefined user types:
  - SuperAdmin: Full system access
  - Tab Director: Tournament management and oversight
  - Judge: Scoring and evaluation access
  - Team Captain: Team-specific information
  - Public Viewer: Read-only tournament access

### 📊 Analytics & Monitoring
- **Live tournament analytics** with visual data representation
- **Performance tracking** for teams and individual speakers
- **Real-time updates** without page refreshes
- **Comprehensive reporting** tools

### 🔧 Core Infrastructure
- **Modern React-based frontend** with TypeScript
- **Responsive design** optimized for all devices
- **Component-based architecture** using shadcn/ui
- **Real-time data synchronization**

## 🚀 Planned Features

### 📋 Roster Management
- **Complete CRUD operations** for schools, teams, and participants
- **CSV/Excel import/export** functionality
- **Google Sheets integration** for seamless data management
- **Team validation** (maximum 5 debaters per team)
- **Participant tracking** with detailed profiles

### 🏁 Tournament Formats
- **Group Stage Support:**
  - Swiss system pairing
  - Round-robin tournaments
  - Power-paired competitions
  - Custom seeding algorithms

- **Elimination Brackets:**
  - Single and double elimination
  - Intelligent BYE handling
  - Re-seeding between rounds
  - Third-place playoff options

- **Debate Style Configuration:**
  - British Parliamentary (BP)
  - World Schools Debate Championship (WSDC)
  - Karl Popper format
  - Custom speaker orders and timing

### ⚡ Automated Pairing Engine ("Clash" System)
- **Deterministic algorithms** ensuring reproducible results
- **Hard constraints enforcement:**
  - Same-team clash prevention
  - Room capacity management
  - Judge availability tracking

- **Soft constraints optimization:**
  - Rematch avoidance
  - Speaker balance maintenance
  - Geographic distribution

- **Transparency features:**
  - Detailed pairing logs
  - Algorithm explanation
  - Manual override capabilities

### 📝 Advanced Scoring & Adjudication
- **Flexible scoring systems:**
  - Team points (win/loss, margins)
  - Individual speaker scores
  - Custom rubrics (content, style, strategy)

- **Configurable tie-breakers:**
  - Head-to-head records
  - Speaker point averages
  - Buchholz scoring
  - Custom hierarchies

- **Real-time score entry** with validation
- **Score verification** and approval workflows

### 📈 Enhanced Analytics
- **Interactive visualizations** using D3.js/Recharts
- **Live bracket progression** tracking
- **Speaker performance trends**
- **Tournament statistics** and insights
- **Exportable reports** in multiple formats

### 🔒 Security & Compliance
- **GDPR-compliant data handling**
- **Per-tournament data export/purge**
- **Secure authentication** (email/social login)
- **Audit logging** for all actions

## 🛠️ Technical Stack

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS
- **UI Components:** shadcn/ui with Radix UI primitives
- **State Management:** TanStack Query for server state
- **Icons:** Lucide React
- **Charts:** Recharts for data visualization
- **Routing:** React Router v6
- **Build Tool:** Vite for fast development and builds

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git for version control

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd debateministrator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   This installs **all** required packages, including development
   dependencies. A full install is necessary before running `npm run lint`
   or any TypeScript build scripts.

### Environment Variables

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` to configure the backend endpoint and Supabase credentials. `VITE_API_BASE_URL` controls the API server URL and defaults to `http://localhost:3001`.

   Create a project at [Supabase](https://supabase.com), then copy the **Project URL** and **Anon public key** from the dashboard. Add them to `.env`:

   ```
   SUPABASE_URL=your Supabase project URL
   SUPABASE_ANON_KEY=your anon key
   VITE_SUPABASE_URL=your Supabase project URL
   VITE_SUPABASE_ANON_KEY=your anon key
   ```

   The Vite variables are used on the client and should match the server values.

### Supabase Setup

1. Sign in to [Supabase](https://supabase.com) and create a new project.
2. In your project's **Settings → API** section copy the **Project URL** and **Anon public key**.
3. Paste those values into the corresponding variables in your `.env` file as shown above.
4. Ensure these variables are available when starting the API server or the frontend. The backend will exit with an error if `SUPABASE_URL` or `SUPABASE_ANON_KEY` is missing.
5. See [docs/credentials.md](docs/credentials.md) for the default admin login and a list of required environment variables. These must be configured before running `npm run create-admin`.
6. The login and signup pages also depend on `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. If these variables are missing, you'll see a setup prompt (the `AuthFallback` component) instead of the forms.

### Creating the Admin User

After configuring `.env`, you can create the default admin account by running:

```bash
npm run create-admin
```

This script uses the credentials described in [docs/credentials.md](docs/credentials.md). Provide `SUPABASE_SERVICE_ROLE_KEY` if possible; otherwise it will fall back to the anon key.

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` to see the application.

### Development Commands

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run linting *(assumes dependencies installed)* |

### API Server

Run the backend during development with:

```bash
npm run server
```

By default it listens on `http://localhost:3001` unless the `PORT` environment variable is set. The frontend expects the server URL to match `VITE_API_BASE_URL`.
The API server requires `SUPABASE_URL` and `SUPABASE_ANON_KEY` to connect to your Supabase project. The server will not start if either variable is missing.

### Running Tests

Install dependencies if you haven't already:

```bash
npm install
```

Alternatively you can use **Bun**:

```bash
bun install
```

Then execute all unit tests:

```bash
npm test --silent
```

This command runs both frontend and backend tests, including the Swiss pairing
and bracket generation checks located under `server/__tests__`.

## 🎯 Success Criteria

The platform aims to enable tournament administrators to:
- Import teams and participants effortlessly
- Run complete Swiss-system tournaments (4+ rounds)
- Generate elimination brackets automatically
- Input and track scores in real-time
- Monitor tournament progress through live dashboards
- Handle a 16-team tournament with 3 judges per debate without manual intervention

## 🔮 Future Roadmap

### Phase 1: Core Backend
- Database schema implementation
- Authentication system
- Basic API endpoints
- Data validation and security

### Phase 2: Core Tournament Management (Weeks 4-6)
- Tournament creation with format selection
- Team and speaker management linked to tournaments
- Round tracking with progression logic
- Tournament status and settings management

### Phase 3: Real-time Features
- WebSocket integration
- Live score updates
- Real-time bracket progression
- Push notifications

### Phase 4: Advanced Analytics
- Performance metrics
- Predictive analytics
- Export capabilities
- Data visualization enhancements

### Phase 5: Mobile Optimization
- Progressive Web App (PWA) features
- Offline capability
- Mobile-specific UI improvements
- Push notification support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Luis Martín Maíllo**

---

*DebateMinistrator - Streamlining academic debate tournaments with modern technology*
