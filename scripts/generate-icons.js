const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 背景グラデーション
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#6366f1'); // indigo-500
  gradient.addColorStop(1, '#4f46e5'); // indigo-600
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // チェックマークアイコン
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size / 16;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const padding = size / 4;
  const checkSize = size - padding * 2;
  
  ctx.beginPath();
  ctx.moveTo(padding + checkSize * 0.2, padding + checkSize * 0.5);
  ctx.lineTo(padding + checkSize * 0.4, padding + checkSize * 0.7);
  ctx.lineTo(padding + checkSize * 0.8, padding + checkSize * 0.3);
  ctx.stroke();

  // ファイルに保存
  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(__dirname, '..', 'public', `icon-${size}.png`);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated: icon-${size}.png`);
}

// アイコン生成
generateIcon(192);
generateIcon(512);

console.log('✅ Icons generated successfully!');
