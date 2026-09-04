export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';

const themes: Record<string, {
  background: string;
  border: string;
  title: string;
  text: string;
}> = {
  default: {
    background: "#FFFEFE",
    border: "#E4E2E2",
    title: "#FB8C00",
    text: "#151515",
  },
  dark: {
    background: "#151515",
    border: "#E4E2E2",
    title: "#FB8C00",
    text: "#FEFEFE",
  },
  transparent: {
    background: "#0000",
    border: "#E4E2E2",
    title: "#0579C3",
    text: "#006AFF",
  },
  radical: {
    background: "#141321",
    border: "#E4E2E2",
    title: "#FE428E",
    text: "#A9FEF7",
  },
  tokyonight: {
    background: "#1A1B27",
    border: "#E4E2E2",
    title: "#70A5FD",
    text: "#38BDAE",
  },
  dracula: {
    background: "#282A36",
    border: "#E4E2E2",
    title: "#FF6E96",
    text: "#F8F8F2",
  },
  monokai: {
    background: "#272822",
    border: "#E4E2E2",
    title: "#EB1F6A",
    text: "#F1F1EB",
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userParam = searchParams.get('user');
  const themeParam = searchParams.get('theme') || 'dark';
  const hideBorder = searchParams.get('hide_border') === 'true';
  const hideTitle = searchParams.get('hide_title') === 'true';
  const includePrivate = searchParams.get('include_private') !== 'false';
  const langsCountParam = parseInt(searchParams.get('langs_count') || '6', 10);
  const langsCount = Math.max(1, Math.min(langsCountParam, 12));
  const excludeParam = searchParams.get('exclude') || '';
  const excludedLangs = new Set(excludeParam.split(',').map(s => s.trim().toLowerCase()).filter(Boolean));

  if (!userParam) {
    return new NextResponse(
      '<svg xmlns="http://www.w3.org/2000/svg" width="350" height="100"><text x="10" y="40" fill="#f00">Please provide user parameter (?user=username)</text></svg>',
      { status: 200, headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store, max-age=0' } }
    );
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return new NextResponse(
      '<svg xmlns="http://www.w3.org/2000/svg" width="350" height="100"><text x="10" y="40" fill="#f00">Server is missing GITHUB_TOKEN environment variable</text></svg>',
      { status: 200, headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store, max-age=0' } }
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
      next: { revalidate: 3600 }
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
    // Fetches non-fork repos (includes private repos accessible by the token)
    const query = `
      query($login: String!) {
        user(login: $login) {
          repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {direction: DESC, field: STARGAZERS}) {
            nodes {
              name
              isPrivate
              languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                edges {
                  size
                  node {
                    name
                    color
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await fetchGraphQL(query, { login: userParam });
    if (data.errors || !data.data?.user) {
      return new NextResponse(
        `<svg xmlns="http://www.w3.org/2000/svg" width="350" height="100"><text x="10" y="40" fill="#f00">Error: User '${userParam}' not found</text></svg>`,
        { status: 200, headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    const repos = data.data.user.repositories?.nodes || [];
    const langMap: Record<string, { name: string; color: string; size: number }> = {};
    let totalSize = 0;

    for (const repo of repos) {
      if (!includePrivate && repo.isPrivate) continue;
      if (!repo.languages?.edges) continue;
      for (const edge of repo.languages.edges) {
        const name = edge.node.name;
        if (excludedLangs.has(name.toLowerCase())) continue;

        const color = edge.node.color || '#858585';
        const size = edge.size;
        if (!langMap[name]) {
          langMap[name] = { name, color, size: 0 };
        }
        langMap[name].size += size;
        totalSize += size;
      }
    }

    const sortedLangs = Object.values(langMap)
      .sort((a, b) => b.size - a.size)
      .slice(0, langsCount)
      .map(lang => ({
        ...lang,
        percentNum: totalSize > 0 ? (lang.size / totalSize) * 100 : 0,
        percent: totalSize > 0 ? ((lang.size / totalSize) * 100).toFixed(1) : '0.0'
      }));

    const theme = themes[themeParam] || themes.dark;
    const cardWidth = 360;
    const barWidth = cardWidth - 50; // 310px
    const barHeight = 10;

    const rowCount = Math.ceil(sortedLangs.length / 2);
    const itemRowHeight = 22;
    const cardHeight = (hideTitle ? 45 : 75) + barHeight + (rowCount * itemRowHeight) + 20;

    // Build Progress Bar Segments
    let currentX = 0;
    let barSegments = '';
    sortedLangs.forEach((lang) => {
      const segWidth = (lang.percentNum / 100) * barWidth;
      if (segWidth <= 0) return;
      
      barSegments += `
        <rect x="${currentX}" y="0" width="${segWidth}" height="${barHeight}" fill="${lang.color}" />
      `;
      currentX += segWidth;
    });

    // Build 2-column language items list
    const startY = (hideTitle ? 35 : 65) + barHeight + 20;
    let langListSvg = '';
    sortedLangs.forEach((lang, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = col === 0 ? 25 : 190;
      const y = startY + row * itemRowHeight;

      langListSvg += `
        <g transform="translate(${x}, ${y})">
          <rect x="0" y="-9" width="14" height="10" rx="5" fill="${lang.color}" />
          <text x="20" y="0" class="lang-name">${lang.name}</text>
          <text x="145" y="0" class="lang-percent" text-anchor="end">${lang.percent}%</text>
        </g>
      `;
    });

    const customWidthParam = searchParams.get('width');
    const displayWidth = customWidthParam ? parseInt(customWidthParam, 10) : cardWidth;
    const displayHeight = customWidthParam ? (cardHeight * (displayWidth / cardWidth)) : cardHeight;

    const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="${displayWidth}" height="${displayHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}">
  <defs>
    <style>
      .bg { fill: ${theme.background}; stroke: ${hideBorder ? 'none' : theme.border}; stroke-width: ${hideBorder ? '0' : '1px'}; rx: 8px; }
      .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${theme.title}; }
      .lang-name { font: 600 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${theme.text}; }
      .lang-percent { font: 400 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${theme.text}; opacity: 0.8; }
      .bar-mask { rx: 5px; }
    </style>
    <clipPath id="bar-clip">
      <rect x="0" y="0" width="${barWidth}" height="${barHeight}" rx="5" />
    </clipPath>
  </defs>

  <rect width="100%" height="100%" class="bg" />

  ${hideTitle ? '' : `<text x="25" y="36" class="header">Most Used Languages</text>`}

  <!-- Stacked Progress Bar -->
  <g clip-path="url(#bar-clip)" transform="translate(25, ${hideTitle ? 25 : 55})">
    ${barSegments || `<rect x="0" y="0" width="${barWidth}" height="${barHeight}" fill="#444" />`}
  </g>

  <!-- Languages Legend Grid -->
  ${langListSvg}
</svg>`;

    return new NextResponse(svgContent.trim(), {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': process.env.NODE_ENV === 'development' ? 'no-cache, no-store, must-revalidate' : 'public, max-age=7200, s-maxage=86400',
      },
    });
  } catch (error: any) {
    console.error("Top Languages Generation Error:", error);
    const msg = error.message || "Internal Server Error";
    return new NextResponse(
      `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="100"><text x="10" y="40" fill="#f00">Error: ${msg.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text></svg>`,
      { status: 200, headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
}
