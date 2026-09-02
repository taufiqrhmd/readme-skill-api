export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';

const themes: Record<string, {
  background: string;
  border: string;
  title: string;
  text: string;
  icon: string;
  ring: string;
  rank: string;
}> = {
  default: {
    background: "#FFFEFE",
    border: "#E4E2E2",
    title: "#FB8C00",
    text: "#151515",
    icon: "#FB8C00",
    ring: "#FB8C00",
    rank: "#FB8C00",
  },
  dark: {
    background: "#151515",
    border: "#E4E2E2",
    title: "#FB8C00",
    text: "#FEFEFE",
    icon: "#FB8C00",
    ring: "#FB8C00",
    rank: "#FB8C00",
  },
  transparent: {
    background: "#0000",
    border: "#E4E2E2",
    title: "#0579C3",
    text: "#006AFF",
    icon: "#006AFF",
    ring: "#006AFF",
    rank: "#0579C3",
  },
  radical: {
    background: "#141321",
    border: "#E4E2E2",
    title: "#FE428E",
    text: "#A9FEF7",
    icon: "#FE428E",
    ring: "#FE428E",
    rank: "#F8D847",
  },
  tokyonight: {
    background: "#1A1B27",
    border: "#E4E2E2",
    title: "#70A5FD",
    text: "#38BDAE",
    icon: "#70A5FD",
    ring: "#70A5FD",
    rank: "#BF91F3",
  },
  dracula: {
    background: "#282A36",
    border: "#E4E2E2",
    title: "#FF6E96",
    text: "#F8F8F2",
    icon: "#FF6E96",
    ring: "#FF6E96",
    rank: "#79DAFA",
  },
  monokai: {
    background: "#272822",
    border: "#E4E2E2",
    title: "#EB1F6A",
    text: "#F1F1EB",
    icon: "#EB1F6A",
    ring: "#EB1F6A",
    rank: "#E28905",
  },
};

function calculateRank(params: {
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalStars: number;
  contributedTo: number;
}): { level: string; percent: number } {
  const { totalCommits, totalPRs, totalIssues, totalStars, contributedTo } = params;
  const score = (totalCommits * 1) + (totalPRs * 3) + (totalIssues * 1) + (totalStars * 4) + (contributedTo * 2);

  if (score >= 2000) return { level: 'S+', percent: 1.0 };
  if (score >= 1000) return { level: 'S', percent: 0.90 };
  if (score >= 500) return { level: 'A+', percent: 0.78 };
  if (score >= 250) return { level: 'A', percent: 0.65 };
  if (score >= 100) return { level: 'B+', percent: 0.50 };
  if (score >= 50) return { level: 'B', percent: 0.35 };
  return { level: 'C', percent: 0.20 };
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userParam = searchParams.get('user');
  const themeParam = searchParams.get('theme') || 'dark';
  const hideBorder = searchParams.get('hide_border') === 'true';
  const includeAllCommits = searchParams.get('include_all_commits') !== 'false';
  const showIcons = searchParams.get('show_icons') !== 'false';
  const hideRank = searchParams.get('hide_rank') === 'true';
  const hideParam = searchParams.get('hide') || '';
  const hiddenItems = new Set(hideParam.split(',').map(s => s.trim().toLowerCase()));

  if (!userParam) {
    return new NextResponse(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100"><text x="10" y="40" fill="#f00">Please provide user parameter (?user=username)</text></svg>',
      { status: 400, headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return new NextResponse(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100"><text x="10" y="40" fill="#f00">Server is missing GITHUB_TOKEN environment variable</text></svg>',
      { status: 500, headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }

  const fetchGraphQL = async (query: string, variables: any) => {
    const res = await fetch(GITHUB_GRAPHQL_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'readme-skills-api'
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 7200 }
    });
    return res.json();
  };

  try {
    // 1. Fetch user base info & repos
    const baseQuery = `
      query($login: String!) {
        user(login: $login) {
          name
          login
          createdAt
          repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {
            totalCount
          }
          pullRequests(first: 1) {
            totalCount
          }
          issues(first: 1) {
            totalCount
          }
          repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {direction: DESC, field: STARGAZERS}) {
            nodes {
              stargazerCount
              isPrivate
            }
          }
        }
      }
    `;

    const baseData = await fetchGraphQL(baseQuery, { login: userParam });
    if (baseData.errors || !baseData.data?.user) {
      return new NextResponse(
        `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100"><text x="10" y="40" fill="#f00">Error: User '${userParam}' not found</text></svg>`,
        { status: 404, headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }

    const user = baseData.data.user;
    const displayName = user.name || user.login;
    const publicPRs = user.pullRequests?.totalCount || 0;
    const publicIssues = user.issues?.totalCount || 0;
    const contributedTo = user.repositoriesContributedTo?.totalCount || 0;

    // Sum stars from non-fork repos
    const totalStars = (user.repositories?.nodes || []).reduce(
      (sum: number, repo: { stargazerCount: number }) => sum + (repo.stargazerCount || 0),
      0
    );

    // 2. Contributions & Commits calculation
    let totalCommits = 0;
    let totalContributions = 0;
    let lifetimePRContributions = 0;
    let lifetimeIssueContributions = 0;

    if (includeAllCommits) {
      const startYear = new Date(user.createdAt).getFullYear();
      const currentYear = new Date().getFullYear();

      let yearsQuery = `query($login: String!) { user(login: $login) { `;
      for (let year = startYear; year <= currentYear; year++) {
        const from = `${year}-01-01T00:00:00Z`;
        const to = `${year}-12-31T23:59:59Z`;
        yearsQuery += `
          year${year}: contributionsCollection(from: "${from}", to: "${to}") {
            totalCommitContributions
            restrictedContributionsCount
            totalPullRequestContributions
            totalIssueContributions
            contributionCalendar {
              totalContributions
            }
          }
        `;
      }
      yearsQuery += `} }`;

      const commitData = await fetchGraphQL(yearsQuery, { login: userParam });
      if (commitData.data?.user) {
        for (let year = startYear; year <= currentYear; year++) {
          const coll = commitData.data.user[`year${year}`];
          if (coll) {
            totalCommits += (coll.totalCommitContributions || 0) + (coll.restrictedContributionsCount || 0);
            lifetimePRContributions += (coll.totalPullRequestContributions || 0);
            lifetimeIssueContributions += (coll.totalIssueContributions || 0);
            totalContributions += (coll.contributionCalendar?.totalContributions || 0);
          }
        }
      }
    } else {
      const recentQuery = `
        query($login: String!) {
          user(login: $login) {
            contributionsCollection {
              totalCommitContributions
              restrictedContributionsCount
              totalPullRequestContributions
              totalIssueContributions
              contributionCalendar {
                totalContributions
              }
            }
          }
        }
      `;
      const recentData = await fetchGraphQL(recentQuery, { login: userParam });
      const coll = recentData.data?.user?.contributionsCollection;
      if (coll) {
        totalCommits = (coll.totalCommitContributions || 0) + (coll.restrictedContributionsCount || 0);
        lifetimePRContributions = coll.totalPullRequestContributions || 0;
        lifetimeIssueContributions = coll.totalIssueContributions || 0;
        totalContributions = coll.contributionCalendar?.totalContributions || 0;
      }
    }

    const totalPRs = Math.max(publicPRs, lifetimePRContributions);
    const totalIssues = Math.max(publicIssues, lifetimeIssueContributions);

    // 3. Rank Calculation
    const rankInfo = calculateRank({
      totalCommits,
      totalPRs,
      totalIssues,
      totalStars,
      contributedTo
    });

    // 4. Prepare display rows
    const allStats = [
      { id: 'stars', label: 'Total Stars Earned', value: formatNumber(totalStars), iconPath: 'M8 1.75a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 13.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 7.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327 2.17A.75.75 0 0 1 8 1.75Z' },
      { id: 'contributions', label: includeAllCommits ? 'Total Contributions' : 'Contributions (Past Year)', value: formatNumber(totalContributions), iconPath: 'M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16m0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15' },
      { id: 'commits', label: includeAllCommits ? 'Total Commits' : 'Commits (Past Year)', value: formatNumber(totalCommits), iconPath: 'M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z' },
      { id: 'prs', label: 'Total PRs', value: formatNumber(totalPRs), iconPath: 'M7.177 3.073L9.573.677A.25.25 0 0 1 10 .854v4.792a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354zM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zm-2.25.75a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25zM11 2.5h-1V4h1a1 1 0 0 1 1 1v5.628a2.251 2.251 0 1 0 1.5 0V5A2.5 2.5 0 0 0 11 2.5zm1 10.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0zM3.75 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z' },
      { id: 'issues', label: 'Total Issues', value: formatNumber(totalIssues), iconPath: 'M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm9 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-.25-6.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5z' },
      { id: 'contribs', label: 'Contributed to', value: formatNumber(contributedTo), iconPath: 'M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z' },
    ];

    const statsToDisplay = allStats.filter(s => !hiddenItems.has(s.id));
    const theme = themes[themeParam] || themes.dark;

    // Layout dimension calculation
    const lineHeight = 26;
    const baseHeight = 90 + statsToDisplay.length * lineHeight;
    const cardHeight = Math.max(195, baseHeight);
    const cardWidth = hideRank ? 350 : 495;

    // Rank Circle progress math
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (rankInfo.percent * circumference);

    let statsSvgRows = '';
    statsToDisplay.forEach((stat, idx) => {
      const yPos = 70 + idx * lineHeight;
      const textX = showIcons ? 48 : 25;
      statsSvgRows += `
        <g transform="translate(0, ${yPos})">
          ${showIcons ? `
            <svg x="24" y="-12" width="15" height="15" viewBox="0 0 16 16" fill="${theme.icon}">
              <path d="${stat.iconPath}" />
            </svg>
          ` : ''}
          <text x="${textX}" y="0" class="stat-label">${stat.label}:</text>
          <text x="${hideRank ? cardWidth - 25 : 300}" y="0" class="stat-value" text-anchor="end">${stat.value}</text>
        </g>
      `;
    });

    const rankSvg = hideRank ? '' : `
      <g transform="translate(395, ${cardHeight / 2 + 5})">
        <circle cx="0" cy="0" r="${radius}" class="ring-bg" />
        <circle cx="0" cy="0" r="${radius}" class="ring-progress" stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}" />
        <text x="0" y="8" class="rank-text">${rankInfo.level}</text>
        <text x="0" y="${radius + 18}" class="rank-subtext">Overall Rank</text>
      </g>
    `;

    const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}">
  <defs>
    <style>
      .bg { fill: ${theme.background}; stroke: ${hideBorder ? 'none' : theme.border}; stroke-width: ${hideBorder ? '0' : '1px'}; rx: 8px; }
      .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${theme.title}; }
      .stat-label { font: 400 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${theme.text}; opacity: 0.9; }
      .stat-value { font: 700 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${theme.text}; }
      .ring-bg { fill: none; stroke: ${theme.border}; stroke-width: 5; opacity: 0.4; }
      .ring-progress { fill: none; stroke: ${theme.ring}; stroke-width: 5.5; stroke-linecap: round; transform: rotate(-90deg); transform-origin: 0 0; }
      .rank-text { font: 800 24px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${theme.rank}; text-anchor: middle; }
      .rank-subtext { font: 500 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${theme.text}; opacity: 0.8; text-anchor: middle; }
    </style>
  </defs>

  <rect width="100%" height="100%" class="bg" />

  <!-- Header -->
  <text x="25" y="36" class="header">${displayName}'s GitHub Stats</text>

  <!-- Stat rows -->
  ${statsSvgRows}

  <!-- Rank Gauge -->
  ${rankSvg}
</svg>`;

    return new NextResponse(svgContent.trim(), {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': process.env.NODE_ENV === 'development' ? 'no-cache, no-store, must-revalidate' : 'public, max-age=7200, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error("Stats Generation Error:", error);
    return new NextResponse(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100"><text x="10" y="40" fill="#f00">Internal Server Error</text></svg>`,
      { status: 500, headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}
