/* Presentation preferences and a read-only public status check. No registration data is stored here. */
(() => {
 'use strict';
 const root=document.documentElement, size=document.getElementById('reading-size');
 const key='sibia-reading-size-v1';
 function setSize(large){root.dataset.reading=large?'large':'normal';size.setAttribute('aria-pressed',String(large));size.textContent=large?'字體 A−':'字體 A+';size.setAttribute('aria-label',large?'改回標準字體':'放大閱讀字體');}
 let large=false;try{large=localStorage.getItem(key)==='large';}catch(_){}
 setSize(large);size.addEventListener('click',()=>{large=!large;setSize(large);try{localStorage.setItem(key,large?'large':'normal');}catch(_){}});
 const photo=document.getElementById('hero-photo');
 const fallback=document.getElementById('photo-fallback');
 function photoFailed(){photo.hidden=true;fallback.setAttribute('role','img');fallback.setAttribute('aria-label','以書頁與暖陽象徵閱讀與傳承的裝飾圖');document.getElementById('photo-credit').textContent='閱讀與傳承意象；圖片暫時無法載入，改以書頁圖案呈現。';}
 photo.addEventListener('error',photoFailed);if(photo.complete&&photo.naturalWidth===0)photoFailed();
 document.querySelectorAll('.mobile-nav a').forEach(a=>a.addEventListener('click',()=>a.closest('details').removeAttribute('open')));
 const status=document.getElementById('intake-status'),title=document.getElementById('status-title'),message=document.getElementById('status-message'),stamp=document.getElementById('status-meta');
 const entry=document.querySelector('[data-apply]');
 if(!entry||!window.fetch)return;
 const url=new URL(entry.href);url.search='?health=1';
 const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),12000);
 fetch(url.href,{credentials:'omit',cache:'no-store',signal:abort.signal})
 .then(r=>{if(!r.ok)throw new Error('status');return r.json();})
 .then(s=>{
  if(s.app!=='sibia-2026'||s.schema!==1||typeof s.accepting!=='boolean')throw new Error('format');
  const open=s.accepting===true&&s.initialized===true&&s.privateStorage===true;
  title.textContent=open?'線上投稿已開放':'線上投稿尚未開放';
  message.textContent=open?'請在 Google 申請頁完成信箱驗證、文件上傳及最後送出；仍須依簡章辦理紙本。':String(s.reason||'請先閱讀簡章與準備文件，尚不能完成線上投稿。');
  stamp.textContent='即時查核：'+new Date().toLocaleString('zh-TW',{timeZone:'Asia/Taipei',hour12:false})+'（臺灣時間）';
  status.classList.toggle('is-open',open);
 }).catch(()=>{stamp.textContent='最近確認：2026/09/27 尚未開放。本次無法即時更新，請查看 Google 投稿入口。';})
 .finally(()=>clearTimeout(timer));
})();
