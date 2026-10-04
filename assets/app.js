/* Both pages are readable as static HTML; JavaScript adds compact navigation and filters. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const menu = $('.menu-toggle');
  const nav = $('#main-nav');
  const closeMenu = () => {nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');};
  menu.addEventListener('click', () => {const open = menu.getAttribute('aria-expanded') !== 'true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
  nav.addEventListener('click', event => {if(event.target.closest('a')) closeMenu();});
  document.addEventListener('keydown', event => {if(event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true'){closeMenu();menu.focus();}});
  window.matchMedia('(min-width: 721px)').addEventListener('change',closeMenu);
  const newsButton = $('#show-news');
  if(newsButton){
    const older = $$('.news-item').slice(10);
    let expanded = false;
    const renderNews = () => {older.forEach(item=>item.hidden=!expanded);newsButton.setAttribute('aria-expanded',String(expanded));newsButton.textContent=expanded?'Show Less':`Show More (${older.length})`;};
    newsButton.hidden = older.length === 0;
    renderNews();
    newsButton.addEventListener('click',()=>{expanded=!expanded;renderNews();if(!expanded) $('#news').scrollIntoView({block:'start'});});
  }
  const sections = $$('main > section[id]');
  if(sections.length && 'IntersectionObserver' in window){
    const observer = new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;$$('.main-nav a[href^="#"]').forEach(link=>{if(link.hash===`#${entry.target.id}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}}, {rootMargin:'-12% 0px -64% 0px',threshold:0});
    sections.forEach(section=>observer.observe(section));
  }
  const filters = $('#publication-filters');
  if(!filters) return;
  filters.hidden = false;
  const papers = $$('.publication-item');
  const groups = $$('.pub-year-group');
  const buttons = $$('button[data-topic]');
  const labels = {all:'',recommendation:'Recommendation',llm:'LLMs',agents:'Agents',graph:'Graph Learning'};
  let topic = 'all';
  function readUrl(){const candidate=new URLSearchParams(location.search).get('topic');topic=Object.hasOwn(labels,candidate)?candidate:'all';}
  function updateUrl(){const url=new URL(location.href);url.searchParams.delete('year');if(topic==='all')url.searchParams.delete('topic');else url.searchParams.set('topic',topic);url.hash='';try{history.pushState(null,'',url);}catch{/* Some file:// browsers limit history; filters still work. */}}
  function render(){
    let count = 0;
    for(const paper of papers){paper.hidden=topic!=='all'&&!paper.dataset.topics.split(' ').includes(topic);if(!paper.hidden)count++;}
    groups.forEach(group=>group.hidden=!$('.publication-item:not([hidden])',group));
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.topic===topic)));
    $('#result-count').textContent=`${count} selected publication${count===1?'':'s'}${topic==='all'?'':` · ${labels[topic]}`}`;
    $('#empty-state').hidden=count!==0;
  }
  buttons.forEach(button=>button.addEventListener('click',()=>{topic=button.dataset.topic;updateUrl();render();}));
  $$('.pub-tag').forEach(link=>link.addEventListener('click',event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();topic=link.dataset.filterTopic;updateUrl();render();filters.scrollIntoView({block:'start'});buttons.find(button=>button.dataset.topic===topic)?.focus({preventScroll:true});}));
  $('#empty-reset').addEventListener('click',()=>{topic='all';updateUrl();render();buttons[0].focus();});
  window.addEventListener('popstate',()=>{readUrl();render();});
  readUrl();render();
})();
