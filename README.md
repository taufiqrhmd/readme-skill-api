# GitHub README Asset Generator (readme-skills-api)

A Next.js based application to generate beautiful, dynamic SVG badges and GitHub contribution streaks for your GitHub profile README.

## Features

- **Tech Stack Badges**: Generate a grid of beautiful tech stack icons with customizable frames (rounded, circle, hexagon) and themes.
- **GitHub Streaks**: Display your GitHub contribution streaks, total contributions, and current streak with a beautiful, themed SVG card.
- **Dynamic SVGs**: Fast, on-the-fly SVG generation that can be embedded directly in markdown.
- **Dark Mode Ready**: Multiple themes inspired by popular color palettes (Dark, Tokyo Night, Dracula, Monokai, etc.).

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
   Create a `.env` file in the root directory and add a GitHub Personal Access Token (PAT). This is required to fetch contribution data via the GitHub GraphQL API.
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
- **Icons**: [@thesvg/icons](https://www.npmjs.com/package/@thesvg/icons)
- **API**: GitHub GraphQL API
