export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
const thesvgIcons = require('@thesvg/icons');

type FrameType = 'hexagon' | 'circle' | 'rounded';

const getIconData = (slug: string) => {
  // Try direct lookup first (most icons use raw slug, numbers are prefixed with i_)
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const iconsParam = searchParams.get('icons') || '';
  const frame = (searchParams.get('frame') || 'rounded') as FrameType;
  const theme = searchParams.get('theme') || 'light';

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

  const numCols = Math.min(iconSlugs.length, maxPerRow);
  const numRows = Math.ceil(iconSlugs.length / maxPerRow);

  const width = numCols * itemSize + (numCols - 1) * gap;
  const height = numRows * itemSize + (numRows - 1) * gap;

  // Theme definitions
  const themes: Record<string, { bg: string, border: string, isDark: boolean }> = {
    light: { bg: '#ffffff', border: '#e2e8f0', isDark: false },
    dark: { bg: '#0f172a', border: '#334155', isDark: true },
    tokyonight: { bg: '#1a1b26', border: '#414868', isDark: true },
    dracula: { bg: '#282a36', border: '#44475a', isDark: true },
    monokai: { bg: '#272822', border: '#3e3d32', isDark: true }
  };

  const currentTheme = themes[theme] || themes.light;

  const getLuminance = (hex: string) => {
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

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
    const icon = getIconData(slug);
    if (!icon) continue;

    const col = index % maxPerRow;
    const row = Math.floor(index / maxPerRow);

    const x = col * (itemSize + gap);
    const y = row * (itemSize + gap);

    let hexColor = icon.hex ? `#${icon.hex}` : '#000000';

    // Adjust color based on luminance and theme
    if (icon.hex) {
      const luminance = getLuminance(icon.hex);
      if (currentTheme.isDark && luminance < 0.1) {
        hexColor = '#ffffff'; // Invert very dark icons on dark themes
      } else if (!currentTheme.isDark && luminance > 0.9) {
        hexColor = '#000000'; // Invert very light icons on light themes
      }
    }

    svgContent += `<g transform="translate(${x}, ${y})">`;

    const half = itemSize / 2;
    const quarter = itemSize / 4;
    const threeQuarter = (itemSize * 3) / 4;

    // Draw Frame
    if (frame === 'hexagon') {
      svgContent += `<polygon points="${half},0 ${itemSize},${quarter} ${itemSize},${threeQuarter} ${half},${itemSize} 0,${threeQuarter} 0,${quarter}" class="icon-bg" />`;
    } else if (frame === 'circle') {
      svgContent += `<circle cx="${half}" cy="${half}" r="${half}" class="icon-bg" />`;
    } else {
      const rx = (itemSize * 10) / 48; // scale border radius proportionally
      svgContent += `<rect x="0" y="0" width="${itemSize}" height="${itemSize}" rx="${rx}" class="icon-bg" />`;
    }

    // Handle SVG insertion and styling
    let iconSvg = icon.svg;
    
    // Strip XML declarations and DOCTYPE if present
    iconSvg = iconSvg.replace(/<\?xml.*?\?>/gi, '').replace(/<!DOCTYPE.*?>/gi, '').trim();
    
    // Replace original hex color with our theme-adjusted color
    if (icon.hex) {
      const hexRegex = new RegExp(`#${icon.hex}`, 'gi');
      iconSvg = iconSvg.replace(hexRegex, hexColor);
    }
    
    // Inject x, y, width, height for positioning inside our frame (replace first <svg>)
    // Also remove any existing width/height to prevent duplicate attribute errors
    iconSvg = iconSvg.replace(/<svg([^>]*)>/i, (_match: string, p1: string) => {
      let attrs = p1.replace(/\bwidth\s*=\s*["'][^"']*["']/ig, '')
                    .replace(/\bheight\s*=\s*["'][^"']*["']/ig, '');
      return `<svg x="${padding}" y="${padding}" width="${iconSize}" height="${iconSize}"${attrs}>`;
    });
    
    svgContent += iconSvg;

    svgContent += `</g>`;
  }

  svgContent += `</svg>`;

  return new NextResponse(svgContent, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
    },
  });
}
