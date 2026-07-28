const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function main(){
  const root = process.cwd();
  const svgPath = path.join(root, 'client', 'logo.svg');
  const out = path.join(root, 'client', 'logo.png');
  if(!fs.existsSync(svgPath)){
    console.error('client/logo.svg not found');
    process.exit(1);
  }
  const svg = fs.readFileSync(svgPath, 'utf8');
  const vbMatch = svg.match(/viewBox=["']([\d\.\s\-]+)["']/);
  let width = 800, height = 600;
  if(vbMatch){
    const parts = vbMatch[1].trim().split(/\s+/).map(Number);
    if(parts.length === 4){ width = parts[2]; height = parts[3]; }
  } else {
    const wMatch = svg.match(/width=["']?(\d+)(px)?["']?/);
    const hMatch = svg.match(/height=["']?(\d+)(px)?["']?/);
    if(wMatch) width = Number(wMatch[1]);
    if(hMatch) height = Number(hMatch[1]);
  }

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent;}svg{display:block;width:${width}px;height:${height}px;}</style></head><body>${svg}</body></html>`;

  const browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.setViewport({width: Math.round(width), height: Math.round(height)});
  await page.setContent(html, {waitUntil: 'networkidle0'});
  const el = await page.$('svg');
  if(el){
    await el.screenshot({path: out});
  } else {
    await page.screenshot({path: out, fullPage: true});
  }
  await browser.close();
  console.log('Wrote', out);
}

main().catch(err=>{ console.error(err); process.exit(1); });
