# GitHub README Asset Generator (readme-skills-api)

A Next.js based application to generate beautiful, dynamic SVG badges, GitHub contribution streaks, developer stats, and top language cards for your GitHub profile README.

## Features

- **Tech Stack Badges**: Generate a grid of beautiful tech stack icons with customizable frames (rounded, circle, hexagon) and themes.
- **GitHub Streaks**: Display your GitHub contribution streaks, total contributions, and current streak with a beautiful, themed SVG card.
- **GitHub Stats**: Comprehensive stats card including stars earned, lifetime commits, PRs, issues, repos contributed to, and overall developer rank gauge.
- **Top Languages**: Visual breakdown of your most used programming languages with official GitHub colors and multi-segment progress bar.
- **Dynamic SVGs**: Fast, on-the-fly SVG generation with HTTP caching that can be embedded directly in markdown or HTML.
- **Dual-Theme Ready**: Ready for GitHub's light/dark mode auto-switching with `<picture>` tags.
- **Themes**: Multiple developer-favorite themes (`dark`, `default`, `tokyonight`, `dracula`, `monokai`, `radical`, `transparent`).

## Endpoints & Usage

### 1. Tech Stack Badges (`/api/skills`)

Generates a grid of icons based on the provided parameters.

**Example Markdown:**
```md
![My Skills](https://readme-skill-api.vercel.app/api/skills?icons=react,nextjs,typescript,tailwindcss&frame=hexagon&theme=tokyonight)
```

**Parameters:**
- `icons` (required): Comma-separated list of icon slugs (e.g., `react,nodedotjs,python`).
- `frame`: The shape of the icon background. Options: `rounded` (default), `circle`, `hexagon`.
- `theme`: Color theme. Options: `dark` (default), `tokyonight`, `dracula`, `monokai`.
- `perLine`: Number of icons per row (default: `10`).
- `itemSize`: Total size of the icon container (default: `48`).
- `iconSize`: Size of the actual icon inside the container (default: `30`).

---

### 2. GitHub Streaks (`/api/streaks`)

Generates a card displaying your GitHub contribution statistics.

**Example Markdown:**
```md
![My GitHub Streak](https://readme-skill-api.vercel.app/api/streaks?user=yourusername&theme=dracula)
```

**Parameters:**
- `user` (required): Your GitHub username.
- `theme`: Color theme. Options: `default`, `dark` (default), `transparent`, `radical`, `tokyonight`, `dracula`, `monokai`.
- `hide_border`: Set to `true` to remove the outer border (default: `false`).

---

### 3. GitHub Stats Card (`/api/stats`)

Generates a comprehensive summary card with your GitHub performance and overall rank score.

**Example Markdown:**
```md
![My GitHub Stats](https://readme-skill-api.vercel.app/api/stats?user=yourusername&theme=tokyonight)
```

**Parameters:**
- `user` (required): Your GitHub username.
- `theme`: Color theme. Options: `dark` (default), `default`, `transparent`, `radical`, `tokyonight`, `dracula`, `monokai`.
- `hide_border`: Set to `true` to remove outer border (default: `false`).
- `include_all_commits`: Set to `false` to show past year commits instead of lifetime (default: `true`).
- `show_icons`: Show/hide SVG icons next to stat labels (default: `true`).
- `hide_rank`: Set to `true` to hide the rank gauge (default: `false`).
- `hide`: Comma-separated list of metrics to hide (e.g. `stars,commits,prs,issues,contribs`).

---

### 4. Top Languages Card (`/api/top-langs`)

Generates a visual breakdown of your most used programming languages across public repositories.

**Example Markdown:**
```md
![My Top Languages](https://readme-skill-api.vercel.app/api/top-langs?user=yourusername&theme=dracula&langs_count=6)
```

**Parameters:**
- `user` (required): Your GitHub username.
- `theme`: Color theme. Options: `dark` (default), `default`, `transparent`, `radical`, `tokyonight`, `dracula`, `monokai`.
- `langs_count`: Number of top languages to show (default: `6`, max: `12`).
- `exclude`: Comma-separated languages to exclude (e.g. `html,css,jupyter notebook`).
- `hide_border`: Set to `true` to remove border (default: `false`).
- `hide_title`: Set to `true` to hide the card title (default: `false`).

---

## Local Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd readme-skills-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and add a GitHub Personal Access Token (PAT). This is required to fetch contribution & repository data via the GitHub GraphQL API.
   ```env
   GITHUB_TOKEN=your_github_personal_access_token
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the interactive UI generator.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: [@thesvg/icons](https://www.npmjs.com/package/@thesvg/icons) & Lucide Icons
- **API**: GitHub GraphQL API
