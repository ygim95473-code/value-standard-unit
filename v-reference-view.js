"use strict";
// ECB-derived reference conversion preview only. Not the BIS-index V time series.
(async function(){
 const status=document.getElementById("v-fx-status"),tbody=document.getElementById("v-fx-table");
 if(!status||!tbody)return;
 try{
  const res=await fetch("./data/public/ecb-fx-latest.json",{cache:"no-store"});
  if(!res.ok)throw Error("환율 원본을 읽을 수 없습니다.");
  const feed=await res.json();
  const rows=(feed.rows||[]).filter(r=>/^\d{4}-\d{2}-\d{2}$/.test(r.date)&&r.date<="2026-10-19"&&["KRW","USD","JPY","CNY"].every(c=>Number.isFinite(r.rates_per_eur?.[c])&&r.rates_per_eur[c]>0)).sort((a,b)=>a.date.localeCompare(b.date));
  if(!rows.length)throw Error("사용 가능한 관측값이 없습니다.");
  const base=rows.at(-1),krw=base.rates_per_eur.KRW;
  const unitsPerV={KRW:1,USD:base.rates_per_eur.USD/krw,EUR:1/krw,JPY:base.rates_per_eur.JPY/krw,CNY:base.rates_per_eur.CNY/krw};
  const fmt=n=>Number(n).toLocaleString("ko-KR",{maximumFractionDigits:10});
  tbody.replaceChildren();
  for(const c of ["KRW","USD","EUR","JPY","CNY"]){
   const tr=document.createElement("tr");
   const cells=[c,fmt(unitsPerV[c])+" "+c,fmt(1/unitsPerV[c])+" V"];
   for(const v of cells){const td=document.createElement("td");td.textContent=v;tr.appendChild(td)}
   tbody.appendChild(tr);
  }
  status.textContent="ECB "+base.date+" 관측 환율로 계산한 1V 환산 미리보기 · 2026-10-19 09:00 KST 확정 호가 아님 · BIS 변화 지수 미적용";
 }catch(e){status.textContent="환산값 표시 대기: "+e.message}
})();
