import React, { useEffect, useRef } from 'react';

interface MatrixRainProps {
  color?: string;
  speed?: number;
  fontSize?: number;
}

export const MatrixRain: React.FC<MatrixRainProps> = ({
  color = '#00ffcc',
  speed = 33,
  fontSize = 14
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Matrix characters: Katakana, latin, numbers, operators
    const chars = '0123456789ABCDEF01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン$+-*/=%\"\'#&_(),.;:?!\\|{}<>[]^~';
    const charArray = chars.split('');

    const columns = Math.floor(width / fontSize);
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -50);
    }

    let lastTime = 0;

    const render = (time: number) => {
      if (time - lastTime > speed) {
        lastTime = time;

        // Semi-transparent black background creates fade trail
        ctx.fillStyle = 'rgba(4, 6, 12, 0.08)';
        ctx.fillRect(0, 0, width, height);

        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const char = charArray[Math.floor(Math.random() * charArray.length)];
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          // Randomly highlight the head of the stream with white/cyan glow
          if (Math.random() > 0.85) {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;
          } else {
            ctx.fillStyle = color;
            ctx.shadowBlur = 0;
          }

          ctx.fillText(char, x, y);

          // Reset drop to top with randomized delay once off-screen
          if (y > height && Math.random() > 0.975) {
            drops[i] = 0;
          }

          drops[i]++;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color, speed, fontSize]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none block z-0"
    />
  );
};
