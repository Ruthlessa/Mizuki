import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEDULE_FILE = path.join(__dirname, "../schedule.json");

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

async function checkSchedule() {
  const today = formatDate(new Date());
  
  try {
    const data = await fs.readFile(SCHEDULE_FILE, "utf8");
    const scheduleData = JSON.parse(data);
    
    console.log(`📅 今天: ${today}`);
    console.log("\n📋 定时发布计划:");
    
    let updated = false;
    const updatedScheduled = [];
    
    for (const item of scheduleData.scheduled) {
      const isToday = item.publishDate === today;
      const isPast = new Date(item.publishDate) < new Date(today);
      const isFuture = new Date(item.publishDate) > new Date(today);
      
      let status = "📅 待发布";
      if (item.published) {
        status = "✅ 已发布";
      } else if (isToday) {
        status = "🎯 今天发布";
        item.published = true;
        updated = true;
      } else if (isPast) {
        status = "⏰ 应已发布";
      } else if (isFuture) {
        status = "📅 待发布";
      }
      
      console.log(`\n  [${status}] ${item.publishDate} - ${item.title}`);
      console.log(`    来源: ${item.source}, 链接: ${item.url}`);
      
      updatedScheduled.push(item);
    }
    
    if (updated) {
      scheduleData.scheduled = updatedScheduled;
      await fs.writeFile(SCHEDULE_FILE, JSON.stringify(scheduleData, null, 2), "utf8");
      console.log("\n✨ 已更新发布状态！");
    }
    
    console.log("\n✅ 检查完成！");
    
  } catch (error) {
    console.error("❌ 检查失败:", error.message);
    if (error.code === 'ENOENT') {
      console.log("💡 提示: 请先运行 'pnpm fetch-tech-articles' 生成定时计划！");
    }
  }
}

checkSchedule().catch((error) => {
  console.error("❌ 执行失败:", error);
  process.exit(1);
});
