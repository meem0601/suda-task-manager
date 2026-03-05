import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // 背景（青）
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(0, 0, size, size);
  
  // チェックマーク（白）
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.1;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  ctx.moveTo(size * 0.25, size * 0.5);
  ctx.lineTo(size * 0.4, size * 0.65);
  ctx.lineTo(size * 0.75, size * 0.35);
  ctx.stroke();
  
  // 保存
  const buffer = canvas.toBuffer('image/png');
  const publicDir = path.join(__dirname, '..', 'public');
  const iconPath = path.join(publicDir, `icon-${size}.png`);
  
  fs.writeFileSync(iconPath, buffer);
  console.log(`✅ Generated: icon-${size}.png`);
}

// 192x192 と 512x512 を生成
generateIcon(192);
generateIcon(512);

console.log('🎉 アイコン生成完了！');
