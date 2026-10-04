// Rebuild the two static pages from templates and reviewed metadata. No dependencies needed.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname,'..');
const context = vm.createContext({window:{}});
for(const file of ['publications.js','profile.js'])vm.runInContext(fs.readFileSync(path.join(root,'assets',file),'utf8'),context);
const {PUBLICATIONS:publications,PROFILE:profile}=context.window;
const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const topics={recommendation:'Recommendation',llm:'LLMs',agents:'Agents',graph:'Graph Learning'};
const ext=' target="_blank" rel="noopener noreferrer"';
const trophy='<svg class="trophy-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v5c0 3.4-1.9 6.2-5 6.9V18h2a2 2 0 0 1 2 2v1H7v-1a2 2 0 0 1 2-2h2v-3.1C7.9 14.2 6 11.4 6 8V3Z"/><path class="trophy-handles" d="M6 5H2.5v2a6.5 6.5 0 0 0 6.1 6.5M18 5h3.5v2a6.5 6.5 0 0 1-6.1 6.5"/></svg>';
const microphone='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2m-7 9v3m-4 0h8"/></svg>';
const star='<svg class="impact-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.5 3 6.1 6.7 1-4.85 4.7 1.15 6.65-6-3.15-6 3.15 1.15-6.65-4.85-4.7 6.7-1Z"/></svg>';
const article=paper=>{
  const links=[...(paper.pdf?[{label:'PDF',url:paper.pdf}]:[]),...(paper.links||[])];
  const main=links.find(link=>link.label==='Paper')||links[0];
  const title=main?`<a href="${esc(main.url)}"${ext}>${esc(paper.title)}</a>`:esc(paper.title);
  const venues=paper.venues||[{name:paper.venue,year:paper.year}];
  const venueBadges=venues.map(venue=>`<span class="pub-venue" title="${esc(venue.name)} ${venue.year}">${esc(venue.name==='ACM Computing Surveys'?'ACM CSUR':venue.name)} ’${String(venue.year).slice(-2)}</span>`).join('');
  const venueType=paper.type==='tutorial'?'<span class="pub-kind">Tutorial</span>':'';
  const badges=[
    paper.award?`<span class="pub-award">${trophy}<span>${esc(paper.award)}</span></span>`:'',
    paper.impact?`<span class="pub-impact">${star}<span>${esc(paper.impact.label)}${paper.impact.citationText?` · ${esc(paper.impact.citationText)}`:''}</span></span>`:'',
    paper.presentation==='oral'?`<span class="pub-oral">${microphone}<span>Oral</span></span>`:''
  ].filter(Boolean).join('');
  return `<article class="publication-item" id="${esc(paper.id)}" data-year="${paper.year}" data-topics="${paper.tags.join(' ')}"><div class="pub-venue-column">${venueBadges}${venueType}</div><div class="pub-content"><h3>${title}</h3><p class="pub-authors">${esc(paper.authors).replace(/Jiawei Chen\*?/g,'<strong>$&</strong>')}</p>${badges?`<div class="pub-recognition">${badges}</div>`:''}<div class="pub-bottom"><div class="pub-tags">${paper.tags.map(tag=>`<a class="pub-tag" data-filter-topic="${tag}" href="publications.html?topic=${tag}" aria-label="Filter publications by ${topics[tag]}">${topics[tag]}</a>`).join('')}</div><div class="pub-links">${links.map(link=>`<a href="${esc(link.url)}"${ext}>${esc(link.label)}</a>`).join('')}</div></div></div></article>`;
};
const isOverview=p=>p.type==='survey'||p.type==='tutorial';
const groups=[{id:'surveys-tutorials',label:'Surveys &amp; Tutorials',test:isOverview},{id:'2026',label:'2026',test:p=>!isOverview(p)&&p.year===2026},{id:'2025',label:'2025',test:p=>!isOverview(p)&&p.year===2025},{id:'2024',label:'2024',test:p=>!isOverview(p)&&p.year===2024},{id:'earlier',label:'Before 2024',test:p=>!isOverview(p)&&p.year<2024}];
const content=groups.map(group=>`<section class="pub-year-group" aria-labelledby="year-${group.id}"><div class="pub-year-heading"><h2 id="year-${group.id}">${group.label}</h2></div>${publications.filter(group.test).sort((a,b)=>b.year-a.year).map(article).join('\n')}</section>`).join('\n');
let pub=fs.readFileSync(path.join(__dirname,'publications.template.html'),'utf8').replace('<!-- COUNT -->',publications.length).replace('<!-- PUBLICATIONS -->',content);
fs.writeFileSync(path.join(root,'publications.html'),pub);
function newsVenue(item){return item.venue||(item.text.match(/ECML PKDD|NeurIPS|SIGIR|RecSys|WSDM|WWW|ACL|KDD|ICLR|AAAI|CIKM|ICDE|IJCAI|ICCV|TOIS|TKDE/)||[])[0]||(/Computing Surveys/.test(item.text)?'CSUR':'UPDATE');}
function emphasize(text){return esc(text).replace(/\b(\d+|One|Two|Three|Four|A|An) (full |main-conference |benchmark )?papers?\b/g,'<strong>$&</strong>').replace(/Outstanding Paper Award|Best Paper Award|Best Paper Honorable Mention/g,'<strong>$&</strong>').replace(/\b(?:(?:ACL|SIGIR|KDD|WWW|WSDM|NeurIPS|ICLR|AAAI|CIKM|ICDE|IJCAI|ICCV|RecSys|ECML PKDD) 20\d{2}|(?:ACM TOIS|ACM Computing Surveys|IEEE TKDE)(?: 20\d{2})?)\b/g,'<strong>$&</strong>');}
const news=profile.news.map(item=>{
  const month=new Intl.DateTimeFormat('en-US',{month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(`${item.date}T12:00:00Z`));
  const summary=item.displayText||item.text;
  return `<article class="news-item${item.type==='award'?' award-news':''}"><time datetime="${item.date}">${month}</time><span class="news-badge">${esc(newsVenue(item).replace(/ 20\d{2}$/,''))}</span><p>${item.type==='award'?`<span class="news-trophy">${trophy}</span>`:''}${emphasize(summary)}</p></article>`;
}).join('\n');
const background=[...profile.career.map(item=>({date:item.period,title:item.role,institution:item.institution,detail:item.detail})),...profile.education.map(item=>({date:item.period,title:item.degree,institution:item.institution,detail:item.advisor?`Advisor: ${item.advisor}`:''}))].map(item=>`<li><span class="timeline-date">${esc(item.date)}</span><h3>${esc(item.title)}</h3><p>${esc(item.institution)}</p>${item.detail?`<p class="timeline-detail">${esc(item.detail)}</p>`:''}</li>`).join('\n');
const awards=profile.awards.map(item=>`<li><span class="award-year">${item.year}</span><h3>${esc(item.venue)} ${esc(item.title)}</h3><p><a href="${esc(item.url)}"${ext}>${esc(item.paper)}</a></p></li>`).join('\n');
let home=fs.readFileSync(path.join(__dirname,'home.template.html'),'utf8').replace('<!-- NEWS -->',news).replace('<!-- BACKGROUND -->',background).replace('<!-- AWARDS -->',awards);
fs.writeFileSync(path.join(root,'index.html'),home);
console.log(`Built homepage (${profile.news.length} news items, ${profile.awards.length} awards) and ${publications.length} publications.`);
