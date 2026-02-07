import { useEffect, useRef, useState } from 'react';

const InfinityGlowBackground = ({ className = "", children }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);
  const trailRef = useRef([]);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const params = useRef({
    speed: 1.0,
    size: 1.2,
    glowIntensity: 1.0,
    showTrail: true,
    maxTrailLength: 150,
    // Fixed dimensions for infinity pattern
    fixedWidth: 1920,
    fixedHeight: 1080
  });

  // Get CSS variable value
  const getCSSVariable = (variable) => {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  };

  // Convert hex to rgba
  const hexToRgba = (hex, alpha = 1) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return `rgba(0, 0, 0, ${alpha})`;
  };

  // Detect theme changes
  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDarkTheme(theme === 'dark');
    };

    // Initial check
    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  const getThemeColors = () => {
    // Get colors from CSS variables
    const primaryBg = getCSSVariable('--primary-bg');
    const brandPrimary = getCSSVariable('--brand-primary');
    const brandSecondary = getCSSVariable('--brand-secondary');
    const brandLight = getCSSVariable('--brand-light');

    // Convert hex colors to rgba format for gradient use
    // eslint-disable-next-line no-unused-vars
    const primaryRgba = hexToRgba(brandPrimary, 0);
    const r = parseInt(brandPrimary.slice(1, 3), 16);
    const g = parseInt(brandPrimary.slice(3, 5), 16);
    const b = parseInt(brandPrimary.slice(5, 7), 16);

    return {
      background: primaryBg,
      canvasBackground: primaryBg,
      glowColor: { r, g, b },
      glowColorRgb: `rgba(${r}, ${g}, ${b},`,
      trailColor: brandPrimary,
      coreColor: `rgba(${r}, ${g}, ${b},`,
      midColor: hexToRgba(brandSecondary, 0).replace('0)', ''),
      highlightColor: hexToRgba(brandLight, 0).replace('0)', '')
    };
  };

  const initCanvas = (canvas) => {
    if (!canvas || !canvas.parentElement) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  };

  const getInfinityPosition = (t) => {
    // Use fixed dimensions for calculation
    const fixedWidth = params.current.fixedWidth;
    const fixedHeight = params.current.fixedHeight;

    const scale = Math.min(fixedWidth, fixedHeight) * 0.29;
    const centerX = fixedWidth / 2;
    const centerY = fixedHeight / 2;

    const y = centerY + scale * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
    const x = centerX + scale * Math.sin(t) * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));

    return { x, y };
  };

  const drawGlowObject = (ctx, x, y, rotation, time) => {
    const colors = getThemeColors();
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    const baseSize = 30 * params.current.size;
    const pulseAmount = 0.8 + 0.2 * Math.sin(time * 5);
    const currentSize = baseSize * pulseAmount;

    // Glow layers
    for (let i = 0; i < 5; i++) {
      const glowSize = currentSize + (i * 8 * params.current.glowIntensity);
      const alpha = (0.1 - i * 0.02) * params.current.glowIntensity;
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
      gradient.addColorStop(0, `${colors.glowColorRgb} ${alpha})`);
      gradient.addColorStop(0.5, `${colors.glowColorRgb} ${alpha * 0.5})`);
      gradient.addColorStop(1, `${colors.glowColorRgb} 0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(-glowSize, -glowSize / 3, glowSize * 2, glowSize * 2 / 3);
    }

    // Core
    ctx.fillStyle = `${colors.coreColor} ${0.9 * pulseAmount})`;
    ctx.fillRect(-currentSize / 2, -currentSize / 6, currentSize, currentSize / 3);

    // Mid layer
    ctx.fillStyle = `${colors.midColor} ${pulseAmount})`;
    ctx.fillRect(-currentSize / 3, -currentSize / 10, currentSize * 2 / 3, currentSize / 5);

    // Highlight
    ctx.fillStyle = `${colors.highlightColor} ${pulseAmount})`;
    ctx.fillRect(-currentSize / 4, -1, currentSize / 2, 2);

    ctx.restore();
  };

  const updateTrail = (x, y) => {
    if (!params.current.showTrail) return;
    trailRef.current.push({ x, y, alpha: 1.0 });
    if (trailRef.current.length > params.current.maxTrailLength) {
      trailRef.current.shift();
    }
    trailRef.current.forEach((point, index) => {
      point.alpha = index / trailRef.current.length;
    });
  };

  const drawTrail = (ctx, offsetX, offsetY) => {
    if (!params.current.showTrail || trailRef.current.length < 2) return;
    const colors = getThemeColors();
    ctx.strokeStyle = colors.trailColor;
    ctx.lineWidth = 3;
    for (let i = 1; i < trailRef.current.length; i++) {
      const current = trailRef.current[i];
      const previous = trailRef.current[i - 1];
      ctx.globalAlpha = current.alpha * (isDarkTheme ? 0.6 : 0.4);
      ctx.beginPath();
      ctx.moveTo(previous.x + offsetX, previous.y + offsetY);
      ctx.lineTo(current.x + offsetX, current.y + offsetY);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
  };

  const getRotationAngle = (t) => {
    const current = getInfinityPosition(t);
    const future = getInfinityPosition(t + 0.01);
    return Math.atan2(future.y - current.y, future.x - current.x);
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = getThemeColors();
    ctx.fillStyle = colors.canvasBackground;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    timeRef.current += 0.02 * params.current.speed;
    const pos = getInfinityPosition(timeRef.current);
    const rotation = getRotationAngle(timeRef.current);

    // Calculate offset to center the pattern in the actual canvas
    const offsetX = (canvas.width - params.current.fixedWidth) / 2;
    const offsetY = (canvas.height - params.current.fixedHeight) / 2;

    updateTrail(pos.x, pos.y);
    drawTrail(ctx, offsetX, offsetY);
    drawGlowObject(ctx, pos.x + offsetX, pos.y + offsetY, rotation, timeRef.current);

    animationRef.current = requestAnimationFrame(animate);
  };

  const handleResize = () => {
    const canvas = canvasRef.current;
    if (canvas) initCanvas(canvas);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    initCanvas(canvas);
    animate();
    window.addEventListener('resize', handleResize);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render when theme changes
  useEffect(() => {
    if (canvasRef.current) {
      const colors = getThemeColors();
      canvasRef.current.style.backgroundColor = colors.background;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDarkTheme]);

  const colors = getThemeColors();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          backgroundColor: colors.background,
          pointerEvents: 'none'
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export default InfinityGlowBackground;