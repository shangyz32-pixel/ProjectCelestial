// public/modules/minimap.js
// Mini-map overlay — click to travel between regions.

export function createMinimap() {
  // Create DOM elements
  const container = document.createElement('div');
  container.style.cssText = 'position:absolute;top:10px;right:10px;width:110px;height:110px;background:rgba(0,0,0,0.7);border:2px solid #556;border-radius:4px;z-index:100;pointer-events:all;overflow:hidden';

  const canvas = document.createElement('canvas');
  canvas.width = 110;
  canvas.height = 110;
  canvas.style.cssText = 'width:100%;height:100%;image-rendering:pixelated';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  // Region data
  const regions = [
    { id: 'town',       x: 55, y: 55, r: 14, label: '镇', color: '#cba', danger: 0 },
    { id: 'bamboo',     x: 55, y: 28, r: 12, label: '竹', color: '#4a4', danger: 1 },
    { id: 'misty',      x: 85, y: 40, r: 12, label: '云', color: '#999', danger: 3 },
    { id: 'thunder',    x: 85, y: 70, r: 12, label: '雷', color: '#a4a', danger: 5 },
    { id: 'dragon',     x: 30, y: 55, r: 12, label: '龙', color: '#f90', danger: 8 },
  ];

  // Click handler
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    for (const r of regions) {
      const dx = mx - r.x, dy = my - r.y;
      if (Math.sqrt(dx * dx + dy * dy) < r.r) {
        const event = new CustomEvent('minimap-click', { detail: r });
        window.dispatchEvent(event);
        return;
      }
    }
  });

  document.body.appendChild(container);

  // Draw function
  function draw(playerRegion) {
    ctx.clearRect(0, 0, 110, 110);

    // Background
    ctx.fillStyle = '#223322';
    ctx.fillRect(0, 0, 110, 110);

    // Paths between town and regions
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    for (let i = 1; i < regions.length; i++) {
      ctx.beginPath();
      ctx.moveTo(55, 55);
      ctx.lineTo(regions[i].x, regions[i].y);
      ctx.stroke();
    }

    // Regions
    for (const r of regions) {
      const isHere = playerRegion === r.id;
      // Glow if player is here
      if (isHere) {
        ctx.fillStyle = r.color + '40';
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r + 4, 0, Math.PI * 2);
        ctx.fill();
      }
      // Region circle
      ctx.fillStyle = r.color;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isHere ? '#fff' : '#000';
      ctx.lineWidth = isHere ? 2 : 1;
      ctx.stroke();
      // Label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(r.label, r.x, r.y + 3);
    }

    // Player dot
    ctx.fillStyle = '#48f';
    ctx.beginPath();
    ctx.arc(regions.find(r => r.id === playerRegion)?.x || 55,
            regions.find(r => r.id === playerRegion)?.y || 55,
            3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Compass
    ctx.fillStyle = '#fff';
    ctx.font = '8px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('N', 100, 12);

    ctx.textAlign = 'left';
    ctx.fillText('S', 8, 100);
  }

  return { draw, regions };
}
