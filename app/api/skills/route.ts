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

const ICON_OVERRIDES: Record<string, any> = {
  python: {
    slug: 'python',
    title: 'Python',
    hex: '3776AB',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="16 16 32 32"><path fill="#3776AB" d="M31.885 16c-8.124 0-7.617 3.523-7.617 3.523l.01 3.65h7.752v1.095H21.197S16 23.678 16 31.876c0 8.196 4.537 7.906 4.537 7.906h2.708v-3.804s-.146-4.537 4.465-4.537h7.688s4.32.07 4.32-4.175v-7.019S40.374 16 31.885 16zm-4.275 2.454a1.394 1.394 0 1 1 0 2.79 1.393 1.393 0 0 1-1.395-1.395c0-.771.624-1.395 1.395-1.395z"/><path fill="#FFD43B" d="M32.115 47.833c8.124 0 7.617-3.523 7.617-3.523l-.01-3.65H31.97v-1.095h10.832S48 40.155 48 31.958c0-8.197-4.537-7.906-4.537-7.906h-2.708v3.803s.146 4.537-4.465 4.537h-7.688s-4.32-.07-4.32 4.175v7.019s-.656 4.247 7.833 4.247zm4.275-2.454a1.393 1.393 0 0 1-1.395-1.395 1.394 1.394 0 1 1 1.395 1.395z"/></svg>`,
    variants: {
      mono: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Python</title><path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/></svg>`
    }
  }
};

const getIconData = (slug: string) => {
  if (ICON_OVERRIDES[slug]) {
    return ICON_OVERRIDES[slug];
  }

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

    // Namespace any internal IDs to prevent collisions between multiple icons in single SVG
    const idPrefix = `icon_${index}_`;
    iconSvg = iconSvg.replace(/\bid=(["'])(.*?)\1/g, `id=$1${idPrefix}$2$1`);
    iconSvg = iconSvg.replace(/url\((["']?)#(.*?)\1\)/g, `url($1#${idPrefix}$2$1)`);
    iconSvg = iconSvg.replace(/xlink:href=(["'])#(.*?)\1/g, `xlink:href=$1#${idPrefix}$2$1`);
    iconSvg = iconSvg.replace(/href=(["'])#(.*?)\1/g, `href=$1#${idPrefix}$2$1`);

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
