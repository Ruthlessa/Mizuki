import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ALBUM_DIR = path.join(__dirname, '../public/images/albums/RandomImages');
const IMAGE_URL = 'https://www.dmoe.cc/random.php';
const TOTAL_IMAGES = 1000;
const CONCURRENT_DOWNLOADS = 5;

async function ensureAlbumDir() {
  try {
    await fs.access(ALBUM_DIR);
  } catch {
    await fs.mkdir(ALBUM_DIR, { recursive: true });
  }
}

async function createInfoJson() {
  const info = {
    title: '随机图片集',
    description: '从 dmoe.cc 随机获取的图片',
    cover: '1.webp',
    order: 0,
    hidden: false,
    password: null
  };
  await fs.writeFile(
    path.join(ALBUM_DIR, 'info.json'),
    JSON.stringify(info, null, 2)
  );
}

async function downloadImage(index) {
  try {
    const response = await axios.get(IMAGE_URL, {
      responseType: 'arraybuffer',
      timeout: 10000
    });
    
    const buffer = Buffer.from(response.data);
    const webpPath = path.join(ALBUM_DIR, `${index + 1}.webp`);
    
    await sharp(buffer)
      .webp({ quality: 85 })
      .toFile(webpPath);
    
    console.log(`✓ 下载成功 ${index + 1}/${TOTAL_IMAGES}`);
    return true;
  } catch (error) {
    console.error(`✗ 下载失败 ${index + 1}/${TOTAL_IMAGES}:`, error.message);
    return false;
  }
}

async function downloadAllImages() {
  let successCount = 0;
  let currentIndex = 0;

  while (currentIndex < TOTAL_IMAGES) {
    const batch = [];
    const endIndex = Math.min(currentIndex + CONCURRENT_DOWNLOADS, TOTAL_IMAGES);
    
    for (let i = currentIndex; i < endIndex; i++) {
      batch.push(downloadImage(i));
    }
    
    const results = await Promise.all(batch);
    successCount += results.filter(r => r).length;
    currentIndex = endIndex;
    
    if (currentIndex < TOTAL_IMAGES) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return successCount;
}

async function main() {
  console.log('开始下载图片...');
  console.log(`目标: ${TOTAL_IMAGES} 张图片`);
  console.log('='.repeat(50));

  await ensureAlbumDir();
  await createInfoJson();
  const successCount = await downloadAllImages();

  console.log('='.repeat(50));
  console.log(`下载完成: ${successCount}/${TOTAL_IMAGES} 张图片`);
  console.log(`图片保存到: ${ALBUM_DIR}`);
}

main().catch(err => {
  console.error('\n✘ 脚本执行错误:');
  console.error(err);
  process.exit(1);
});
