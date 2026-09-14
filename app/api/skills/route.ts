export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
const thesvgIcons = require('@thesvg/icons');

type FrameType = 'hexagon' | 'circle' | 'rounded';

const getLuminance = (hex: string) => {
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const getIconData = (slug: string) => {
  // Try direct require first for fast loading
  const attempts = [
    slug,
    slug.replace(/-/g, '_'),
    slug.replace(/-/g, ''),
    `${slug}dotjs`,
    `${slug.replace(/-/g, '')}dotjs`
  ];
  for (const name of attempts) {
    try {
      const mod = require(`@thesvg/icons/${name}`);
      if (mod) return mod.default || mod;
    } catch (e) {}
  }

  // Fallback to thesvgIcons index
  const normalizedSlug = slug.replace(/-/g, '_');
  if ((thesvgIcons as any)[normalizedSlug]) {
    return (thesvgIcons as any)[normalizedSlug];
  }
  const directKey = `i_${normalizedSlug}`;
  if ((thesvgIcons as any)[directKey]) {
    return (thesvgIcons as any)[directKey];
  }

  // Find icon by slug or alias
  for (const key in thesvgIcons) {
    const icon = (thesvgIcons as any)[key];
    if (icon && typeof icon === 'object' && (icon.slug === slug || (icon.aliases && icon.aliases.includes(slug)))) {
      return icon;
    }
  }
  return null;
};

const getThemedIconSvg = (slug: string, iconColorParam: string | null, themeColor: string, isDarkTheme: boolean) => {
  const icon = getIconData(slug);
  if (!icon) return null;

  // Case A: Explicit single-color / theme color mode requested (iconColor=theme or iconColor=#hex)
  if (iconColorParam && iconColorParam !== 'original') {
    const targetColor = iconColorParam === 'theme' ? themeColor : (iconColorParam.startsWith('#') ? iconColorParam : `#${iconColorParam}`);

    // Try mono variant first
    let mono = icon.variants?.mono;
    if (!mono && !slug.endsWith('dotjs')) {
      const dotIcon = getIconData(`${slug}dotjs`) || getIconData(`${slug.replace(/-/g, '')}dotjs`);
      if (dotIcon?.variants?.mono) {
        mono = dotIcon.variants.mono;
      }
    }

    let rawSvg = mono || icon.svg || '';
    rawSvg = rawSvg.replace(/<\?xml.*?\?>/gi, '').replace(/<!DOCTYPE.*?>/gi, '').trim();

    // If root svg had fill="none", remove it to allow fill inheritance
    rawSvg = rawSvg.replace(/<svg([^>]*)fill="none"/gi, '<svg$1');

    // Replace non-none fills and strokes with themeColor
    rawSvg = rawSvg.replace(/\bfill="(?!(?:none)\b)[^"]*"/gi, `fill="${targetColor}"`);
    rawSvg = rawSvg.replace(/\bstroke="(?!(?:none)\b)[^"]*"/gi, `stroke="${targetColor}"`);

    // Ensure root svg has fill attribute set
    if (!rawSvg.includes(`fill="${targetColor}"`)) {
      rawSvg = rawSvg.replace(/<svg([^>]*)>/i, `<svg$1 fill="${targetColor}">`);
    }

    return rawSvg;
  }

  // Case B (Default): Original Brand Colors with smart contrast adaptation
  let rawSvg = '';
  if (isDarkTheme && icon.variants?.dark) {
    rawSvg = icon.variants.dark;
  } else if (!isDarkTheme && icon.variants?.light) {
    rawSvg = icon.variants.light;
  } else {
    rawSvg = icon.svg || '';
  }

  rawSvg = rawSvg.replace(/<\?xml.*?\?>/gi, '').replace(/<!DOCTYPE.*?>/gi, '').trim();

  // For icons without dedicated light/dark variants, adjust only if the main brand color itself lacks contrast
  const hasDedicatedVariant = isDarkTheme ? !!icon.variants?.dark : !!icon.variants?.light;
  if (!hasDedicatedVariant && icon.hex) {
    const luminance = getLuminance(icon.hex);
    if (isDarkTheme && luminance < 0.15) {
      // Invert very dark icons on dark themes (e.g. Express)
      const hexRegex = new RegExp(`#${icon.hex}`, 'gi');
      rawSvg = rawSvg.replace(hexRegex, '#ffffff');
    } else if (!isDarkTheme && luminance > 0.85) {
      // Invert very light icons on light themes
      const hexRegex = new RegExp(`#${icon.hex}`, 'gi');
      rawSvg = rawSvg.replace(hexRegex, '#000000');
    }
  }

  return rawSvg;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const iconsParam = searchParams.get('icons') || '';
  const frame = (searchParams.get('frame') || 'rounded') as FrameType;
  const theme = searchParams.get('theme') || 'dark';
  const iconColorParam = searchParams.get('iconColor');

  if (!iconsParam) {
    return new NextResponse('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100"><text x="10" y="40">Please provide icons parameter</text></svg>', {
      status: 400,
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }

  const iconSlugs = iconsParam.split(',').map(s => s.trim().toLowerCase());
  const maxPerRow = parseInt(searchParams.get('perLine') || '10', 10);

  const itemSize = parseInt(searchParams.get('itemSize') || '48', 10);
  const iconSize = parseInt(searchParams.get('iconSize') || '30', 10);
  const padding = (itemSize - iconSize) / 2;
  const gap = 8;

  let width = 0;
  let height = 0;

  if (frame === 'hexagon') {
    const hexWidth = itemSize * (Math.sqrt(3) / 2);
    const evenRowCap = maxPerRow;
    const oddRowCap = Math.max(1, maxPerRow - 1);
    const cycleSize = evenRowCap + oddRowCap;

    const fullCycles = Math.floor(iconSlugs.length / cycleSize);
    const rem = iconSlugs.length % cycleSize;
    let numRows = fullCycles * 2;
    if (rem > 0) {
      numRows += (rem <= evenRowCap) ? 1 : 2;
    }
    numRows = Math.max(1, numRows);

    const maxColsInRow0 = Math.min(iconSlugs.length, evenRowCap);
    width = maxColsInRow0 * hexWidth + Math.max(0, maxColsInRow0 - 1) * gap;

    if (numRows > 1) {
      const oddOffset = (hexWidth + gap) / 2;
      const oddCount = Math.min(Math.max(0, iconSlugs.length - evenRowCap), oddRowCap);
      const oddWidth = oddOffset + oddCount * hexWidth + Math.max(0, oddCount - 1) * gap;
      width = Math.max(width, oddWidth);
    }

    height = itemSize + (numRows - 1) * ((itemSize * 0.75) + gap);
  } else {
    const numCols = Math.min(iconSlugs.length, maxPerRow);
    const numRows = Math.ceil(iconSlugs.length / maxPerRow);

    width = numCols * itemSize + (numCols - 1) * gap;
    height = numRows * itemSize + (numRows - 1) * gap;
  }

  // Theme definitions with accent/icon colors
  const themes: Record<string, { bg: string, border: string, icon: string, isDark: boolean }> = {
    dark: { bg: '#151515', border: '#333333', icon: '#FB8C00', isDark: true },
    default: { bg: '#FFFEFE', border: '#E4E2E2', icon: '#FB8C00', isDark: false },
    transparent: { bg: 'none', border: '#444444', icon: '#006AFF', isDark: true },
    radical: { bg: '#141321', border: '#2A283E', icon: '#FE428E', isDark: true },
    tokyonight: { bg: '#1A1B27', border: '#414868', icon: '#70A5FD', isDark: true },
    dracula: { bg: '#282A36', border: '#44475A', icon: '#FF6E96', isDark: true },
    monokai: { bg: '#272822', border: '#3E3D32', icon: '#EB1F6A', isDark: true }
  };

  const currentTheme = themes[theme] || themes.dark;

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  svgContent += `<defs>`;
  svgContent += `
    <style>
      .icon-bg { 
        fill: ${currentTheme.bg}; 
        stroke: ${currentTheme.border};
        stroke-width: 1px;
      }
    </style>
  `;
  svgContent += `</defs>`;

  for (let index = 0; index < iconSlugs.length; index++) {
    const slug = iconSlugs[index];
    let iconSvg = getThemedIconSvg(slug, iconColorParam, currentTheme.icon, currentTheme.isDark);
    if (!iconSvg) continue;

    let x = 0;
    let y = 0;
    let currentItemWidth = itemSize;

    if (frame === 'hexagon') {
      const hexWidth = itemSize * (Math.sqrt(3) / 2);
      currentItemWidth = hexWidth;

      const evenRowCap = maxPerRow;
      const oddRowCap = Math.max(1, maxPerRow - 1);
      const cycleSize = evenRowCap + oddRowCap;

      const cycle = Math.floor(index / cycleSize);
      const rem = index % cycleSize;

      let row = 0;
      let col = 0;
      if (rem < evenRowCap) {
        row = cycle * 2;
        col = rem;
      } else {
        row = cycle * 2 + 1;
        col = rem - evenRowCap;
      }

      const rowOffset = (row % 2 === 1) ? (hexWidth + gap) / 2 : 0;
      x = col * (hexWidth + gap) + rowOffset;
      y = row * ((itemSize * 0.75) + gap);
    } else {
      const col = index % maxPerRow;
      const row = Math.floor(index / maxPerRow);

      x = col * (itemSize + gap);
      y = row * (itemSize + gap);
    }

    svgContent += `<g transform="translate(${x}, ${y})">`;

    const half = itemSize / 2;
    const quarter = itemSize / 4;
    const threeQuarter = (itemSize * 3) / 4;

    // Draw Frame
    if (frame === 'hexagon') {
      const hexWidth = itemSize * (Math.sqrt(3) / 2);
      const hw = hexWidth / 2;
      svgContent += `<polygon points="${hw},0 ${hexWidth},${quarter} ${hexWidth},${threeQuarter} ${hw},${itemSize} 0,${threeQuarter} 0,${quarter}" class="icon-bg" />`;
    } else if (frame === 'circle') {
      svgContent += `<circle cx="${half}" cy="${half}" r="${half}" class="icon-bg" />`;
    } else {
      const rx = (itemSize * 10) / 48; // scale border radius proportionally
      svgContent += `<rect x="0" y="0" width="${itemSize}" height="${itemSize}" rx="${rx}" class="icon-bg" />`;
    }

    // Inject x, y, width, height for positioning inside our frame (replace first <svg>)
    // Also remove any existing width/height to prevent duplicate attribute errors
    iconSvg = iconSvg.replace(/<svg([^>]*)>/i, (_match: string, p1: string) => {
      let attrs = p1.replace(/\bwidth\s*=\s*["'][^"']*["']/ig, '')
                    .replace(/\bheight\s*=\s*["'][^"']*["']/ig, '');
      let offsetX = (currentItemWidth - iconSize) / 2;
      let offsetY = (itemSize - iconSize) / 2;
      return `<svg x="${offsetX}" y="${offsetY}" width="${iconSize}" height="${iconSize}"${attrs}>`;
    });
    
    svgContent += iconSvg;

    svgContent += `</g>`;
  }

  svgContent += `</svg>`;

  return new NextResponse(svgContent, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': process.env.NODE_ENV === 'development' 
        ? 'no-store, no-cache, must-revalidate, proxy-revalidate' 
        : 'public, max-age=604800, stale-while-revalidate=86400',
    },
  });
}
