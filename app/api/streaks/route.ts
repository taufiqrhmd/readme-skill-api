export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';

const GET_CREATED_AT_QUERY = `
  query($login: String!) {
    user(login: $login) {
      createdAt
    }
  }
`;

const themes: Record<string, any> = {
  default: { background: "#FFFEFE", border: "#151515", stroke: "#E4E2E2", ring: "#FB8C00", fire: "#FB8C00", currStreakNum: "#151515", sideNums: "#151515", currStreakLabel: "#FB8C00", sideLabels: "#151515", dates: "#464646" },
  dark: { background: "#151515", border: "#E4E2E2", stroke: "#E4E2E2", ring: "#FB8C00", fire: "#FB8C00", currStreakNum: "#FEFEFE", sideNums: "#FEFEFE", currStreakLabel: "#FB8C00", sideLabels: "#FEFEFE", dates: "#9E9E9E" },
  transparent: { background: "#0000", border: "#E4E2E2", stroke: "#E4E2E2", ring: "#006AFF", fire: "#006AFF", currStreakNum: "#0579C3", sideNums: "#006AFF", currStreakLabel: "#0579C3", sideLabels: "#006AFF", dates: "#417E87" },
  radical: { background: "#141321", border: "#E4E2E2", stroke: "#E4E2E2", ring: "#FE428E", fire: "#FE428E", currStreakNum: "#F8D847", sideNums: "#FE428E", currStreakLabel: "#F8D847", sideLabels: "#FE428E", dates: "#A9FEF7" },
  tokyonight: { background: "#1A1B27", border: "#E4E2E2", stroke: "#E4E2E2", ring: "#70A5FD", fire: "#70A5FD", currStreakNum: "#BF91F3", sideNums: "#70A5FD", currStreakLabel: "#BF91F3", sideLabels: "#70A5FD", dates: "#38BDAE" },
  dracula: { background: "#282A36", border: "#E4E2E2", stroke: "#E4E2E2", ring: "#FF6E96", fire: "#FF6E96", currStreakNum: "#79DAFA", sideNums: "#FF6E96", currStreakLabel: "#79DAFA", sideLabels: "#FF6E96", dates: "#F8F8F2" },
  monokai: { background: "#272822", border: "#E4E2E2", stroke: "#E4E2E2", ring: "#EB1F6A", fire: "#EB1F6A", currStreakNum: "#E28905", sideNums: "#EB1F6A", currStreakLabel: "#E28905", sideLabels: "#EB1F6A", dates: "#F1F1EB" },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userParam = searchParams.get('user');
  const themeParam = searchParams.get('theme') || 'dark';
  const hideBorder = searchParams.get('hide_border') === 'true';

  if (!userParam) {
    return new NextResponse(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100"><text x="10" y="40" fill="#f00">Please provide user parameter (?user=username)</text></svg>',
      { status: 200, headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store, max-age=0' } }
    );
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return new NextResponse(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100"><text x="10" y="40" fill="#f00">Server is missing GITHUB_TOKEN environment variable</text></svg>',
      { status: 200, headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store, max-age=0' } }
    );
  }

  const fetchGraphQL = async (query: string, variables: any) => {
    const res = await fetch(GITHUB_GRAPHQL_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store'
    });
    
    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.statusText}`);
    }
    
    const json = await res.json();
    
    if (json.message) {
      throw new Error(`GitHub API: ${json.message}`);
    }
    
    return json;
  };

  try {
    // 1. Fetch user creation date
    const createdData = await fetchGraphQL(GET_CREATED_AT_QUERY, { login: userParam });
    if (createdData.errors || !createdData.data.user) {
      return new NextResponse(
        `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100"><text x="10" y="40" fill="#f00">Error: User not found or API error</text></svg>`,
        { status: 200, headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    const createdAt = createdData.data.user.createdAt;
    const startYear = new Date(createdAt).getFullYear();
    const currentYear = new Date().getFullYear();

    // 2. Dynamically construct multi-year query
    let yearsQuery = `query($login: String!) { user(login: $login) { `;
    for (let year = startYear; year <= currentYear; year++) {
      const from = `${year}-01-01T00:00:00Z`;
      const to = `${year}-12-31T23:59:59Z`;
      yearsQuery += `
        year${year}: contributionsCollection(from: "${from}", to: "${to}") {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      `;
    }
    yearsQuery += `} }`;

    // 3. Fetch all years
    const contributionsData = await fetchGraphQL(yearsQuery, { login: userParam });
    if (contributionsData.errors) {
      throw new Error("Failed to fetch contribution data");
    }

    // 4. Flatten and process data
    const userCollections = contributionsData.data.user;
    let totalLifetimeContributions = 0;
    const allDays: { contributionCount: number, date: string }[] = [];

    for (let year = startYear; year <= currentYear; year++) {
      const collection = userCollections[`year${year}`];
      if (!collection) continue;

      totalLifetimeContributions += collection.contributionCalendar.totalContributions;

      collection.contributionCalendar.weeks.forEach((week: any) => {
        week.contributionDays.forEach((day: any) => {
          // Ensure we don't add days in the future
          if (new Date(day.date) <= new Date()) {
            allDays.push(day);
          }
        });
      });
    }

    // Ensure chronological order
    allDays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 5. Streak Calculations
    let longestStreak = 0;
    let longestStreakStart = '';
    let longestStreakEnd = '';

    let currentTempStreak = 0;
    let currentTempStart = '';

    for (let i = 0; i < allDays.length; i++) {
      const day = allDays[i];
      if (day.contributionCount > 0) {
        if (currentTempStreak === 0) {
          currentTempStart = day.date;
        }
        currentTempStreak++;
        if (currentTempStreak > longestStreak) {
          longestStreak = currentTempStreak;
          longestStreakStart = currentTempStart;
          longestStreakEnd = day.date;
        }
      } else {
        currentTempStreak = 0;
      }
    }

    let currentStreak = 0;
    let currentStreakStart = '';
    let currentStreakEnd = '';
    let isToday = true;

    for (let i = allDays.length - 1; i >= 0; i--) {
      const day = allDays[i];
      if (day.contributionCount > 0) {
        if (currentStreak === 0) {
          currentStreakEnd = day.date;
        }
        currentStreakStart = day.date;
        currentStreak++;
        isToday = false;
      } else {
        if (isToday) {
          isToday = false;
          continue;
        }
        break;
      }
    }

    // Handle edge cases for strings
    const todayStr = formatShortDate(new Date().toISOString());
    const totalDateStr = `${formatDate(createdAt)} - Present`;

    let longestDateStr = longestStreak > 0
      ? `${formatDate(longestStreakStart)} - ${formatDate(longestStreakEnd)}`
      : 'No Contributions';

    let currentDateStr = currentStreak > 0
      ? `${formatShortDate(currentStreakStart)} - Present`
      : todayStr;

    // 6. Generate SVG
    const theme = themes[themeParam] || themes.dark;

    // Circle progress logic
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    // Cap progress at 100% (e.g. maxing out visually at 30 days)
    const progressLimit = 30;
    const progress = Math.min(currentStreak / progressLimit, 1);
    const strokeDashoffset = circumference - (progress * circumference);
    const ringColor = currentStreak > 0 ? theme.ring : theme.ringBg;

    const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="550" height="200" viewBox="0 0 550 200">
  <defs>
    <style>
      .bg { fill: ${theme.background}; stroke: ${hideBorder ? 'none' : theme.border}; stroke-width: ${hideBorder ? '0' : '1px'}; rx: 6px; }
      .text-title { font: 400 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${theme.sideLabels}; text-anchor: middle; }
      .text-title-middle { font: 700 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${theme.currStreakLabel}; text-anchor: middle; }
      .text-stat { font: 700 32px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${theme.sideNums}; text-anchor: middle; }
      .text-stat-middle { font: 700 26px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${theme.currStreakNum}; text-anchor: middle; }
      .text-date-small { font: 400 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${theme.dates}; text-anchor: middle; }
      .line { stroke: ${theme.stroke}; stroke-width: 1.5; }
      .ring-bg { fill: none; stroke: ${theme.ring}; stroke-width: 5; }
      .ring-progress { fill: none; stroke: ${theme.ring}; stroke-width: 5; stroke-linecap: round; transform: rotate(-90deg); transform-origin: 50% 50%; transition: stroke-dashoffset 1s ease-in-out; }
      .flame { fill: ${theme.fire}; }
    </style>
    <mask id="ring-mask">
      <rect x="-50" y="-50" width="100" height="100" fill="white" />
      <circle cx="0" cy="-35" r="14" fill="black" />
    </mask>
  </defs>
  
  <rect x="0" y="0" width="100%" height="100%" class="bg" />
  
  <!-- Vertical Dividers -->
  <line x1="183" y1="35" x2="183" y2="165" class="line" />
  <line x1="366" y1="35" x2="366" y2="165" class="line" />

  <!-- LEFT COLUMN: Total Contributions -->
  <g transform="translate(91, 80)">
    <text x="0" y="0" class="text-stat">${totalLifetimeContributions}</text>
    <text x="0" y="32" class="text-title">Total Contributions</text>
    <text x="0" y="60" class="text-date-small">${totalDateStr}</text>
  </g>
  
  <!-- MIDDLE COLUMN: Current Streak -->
  <g transform="translate(275, 75)">
    <!-- Progress Ring -->
    <circle cx="0" cy="0" r="${radius}" class="ring-bg" mask="url(#ring-mask)" />
    <circle cx="0" cy="0" r="${radius}" class="ring-progress" mask="url(#ring-mask)" stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}" />
    
    <!-- Flame Icon (Centered at top of ring) -->
    <g transform="translate(-10, -45) scale(1.25)">
      <path class="flame" fill-rule="evenodd" d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16m0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15"/>
    </g>

    <text x="0" y="10" class="text-stat-middle">${currentStreak}</text>
    <text x="0" y="65" class="text-title-middle">Current Streak</text>
    <text x="0" y="90" class="text-date-small">${currentDateStr}</text>
  </g>
  
  <!-- RIGHT COLUMN: Longest Streak -->
  <g transform="translate(458, 80)">
    <text x="0" y="0" class="text-stat">${longestStreak}</text>
    <text x="0" y="32" class="text-title">Longest Streak</text>
    <text x="0" y="60" class="text-date-small">${longestDateStr}</text>
  </g>
</svg>`;

    return new NextResponse(svgContent.trim(), {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': process.env.NODE_ENV === 'development' ? 'no-cache, no-store, must-revalidate' : 'public, max-age=7200, s-maxage=86400',
      },
    });
  } catch (error: any) {
    console.error("Streak Generation Error:", error);
    const msg = error.message || "Internal Server Error";
    return new NextResponse(
      `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="100"><text x="10" y="40" fill="#f00">Error: ${msg.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text></svg>`,
      { status: 200, headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
}
