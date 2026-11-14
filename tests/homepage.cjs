const assert=require('node:assert/strict'),fs=require('node:fs'),{execFileSync}=require('node:child_process');
const {chromium,devices}=require('playwright');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const old=execFileSync('git',['show','e75f805:index.html'],{encoding:'utf8'}),current=fs.readFileSync('index.html','utf8');
 const hrefs=s=>[...s.matchAll(/href="([^"]+)"/g)].map(m=>m[1]).sort();assert.deepEqual(hrefs(current),hrefs(old),'all browser/support/privacy/FAQ links preserved');
 for(const name of ['CNAME','privacy/index.html','support/index.html','seamen-pool-feature.png'])assert(fs.readFileSync(name).equals(execFileSync('git',['show','e75f805:'+name])),'unchanged '+name);
 const fragment=s=>s.slice(s.indexOf('<div class="faq">'),s.indexOf('<section aria-labelledby="android-title">'));assert.equal(fragment(current),fragment(old),'complete existing FAQ preserved');
 for(const [width,height] of [[1440,1000],[390,844],[855,384],[320,568]]){
  const p=await browser.newPage({...width<900?devices['Pixel 7']:{},viewport:{width,height},deviceScaleFactor:1}),errors=[],failed=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)failed.push(r.url());});await p.goto('http://127.0.0.1:8021/',{waitUntil:'networkidle'});
  assert(await p.locator('#coming-soon-title').isVisible());assert.equal(await p.locator('.upcoming-card').count(),2);assert.equal(await p.locator('#bank-title').textContent(),'Seamen Banker');assert.equal(await p.locator('#voyager-title').textContent(),'Seamen Voyager');
  assert((await p.locator('.upcoming-card').nth(0).textContent()).includes('Another project on the horizon from Seamen Games. More details to be revealed.'));
  assert((await p.locator('.upcoming-card').nth(1).textContent()).includes('A new Seamen Games adventure is on the horizon. More details coming soon.'));
  const android=await p.locator('.android').innerText();assert(android.includes('Seamen Pool — Android Alpha testing')&&android.includes('Availability to testers is not yet confirmed.')&&android.includes('Public Android release is coming later.'));
  assert.equal(await p.locator('a[href*="play.google.com"]').count(),0);
  const apple=await p.locator('.apple').innerText();assert(apple.includes('iPhone and iPad users can play directly in Safari, without an App Store download.')&&apple.includes('Add to Home Screen'));
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const cards=await p.locator('.upcoming-card').evaluateAll(nodes=>nodes.map(el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,overflow:el.scrollWidth>el.clientWidth};}));assert(cards.every(c=>c.x>=0&&c.x+c.w<=width+1&&!c.overflow));if(width>780)assert(Math.abs(cards[0].y-cards[1].y)<1);else assert(cards[1].y>cards[0].y+cards[0].h);
  await p.locator('.faq summary').first().focus();await p.keyboard.press('Enter');assert(await p.locator('.faq details').first().evaluate(el=>el.open));
  await p.locator('#play-game').focus();assert.notEqual(await p.locator('#play-game').evaluate(el=>getComputedStyle(el).outlineStyle),'none');
  for(const href of hrefs(current)){
   if(href.startsWith('#'))assert.equal(await p.locator(href).count(),1,'valid fragment '+href);
   else if(!/^[a-z]+:/.test(href)){const response=await p.request.get('http://127.0.0.1:8021/'+href);assert(response.ok(),href);}
  }
  if(width===1440||width===390){await p.screenshot({path:`review/home-${width}.png`,fullPage:true});await p.locator('#coming-soon').screenshot({path:`review/upcoming-${width}.png`});}
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);await p.close();console.log(`PASS homepage ${width}x${height}: exact status/cards, responsive layout, named headings, keyboard/focus, internal links and preserved pages/browser URL`);
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
