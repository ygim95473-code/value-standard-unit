"use strict";
// USD bilateral FX comparison only. Does not alter the immutable 1V definition.
(async () => {
 const holder=document.getElementById("usd-fx-charts"),status=document.getElementById("usd-fx-status");
 if(!holder||!status)return;
 const currencies=["KRW","EUR","JPY","CNY"];
 const colors={KRW:"#1a6db0",EUR:"#15978b",JPY:"#9069b7",CNY:"#b08c28"};
 try {
  const response=await fetch("./data/public/ecb-fx-latest.json",{cache:"no-store"});
  if(!response.ok)throw Error("ECB 환율 자료를 불러오지 못했습니다.");
  const fx=await response.json();
  const rows=fx.rows.filter(r=>r.rates_per_eur&&currencies.every(c=>Number(r.rates_per_eur[c])>0)&&Number(r.rates_per_eur.USD)>0).sort((a,b)=>a.date.localeCompare(b.date));
  if(rows.length<2)throw Error("비교 가능한 환율 관측값이 부족합니다.");
  if(typeof Chart==="undefined")throw Error("Chart.js를 불러오지 못했습니다.");
  const first=rows[0],last=rows.at(-1);
  holder.replaceChildren();
  for(const c of currencies){
   // USD per 1 currency: ECB USD per EUR / ECB currency units per EUR.
   const values=rows.map(r=>r.rates_per_eur.USD/r.rates_per_eur[c]);
   const baseline=values[0],pct=values.map(v=>100*(v/baseline-1));
   const box=document.createElement("div");box.className="chartbox";
   const title=document.createElement("h3");title.textContent=c+" / USD · "+(pct.at(-1)>=0?"+":"")+pct.at(-1).toFixed(2)+"%";
   const note=document.createElement("p");note.className="hint";
   note.textContent="1"+c+"당 USD · "+first.date+" = 0% · 상승은 "+c+"의 달러 대비 강세";
   const canvas=document.createElement("canvas");canvas.setAttribute("aria-label",c+"의 USD 대비 환율 변화율");
   box.append(title,note,canvas);holder.append(box);
   new Chart(canvas,{type:"line",data:{labels:rows.map(r=>r.date),datasets:[
    {label:c+" / USD 변화율 (%)",data:pct,borderColor:colors[c],pointRadius:0,tension:0.1},
    {label:"시작일 0%",data:rows.map(()=>0),borderColor:"#777",borderDash:[5,5],pointRadius:0,borderWidth:1}
   ]},options:{responsive:true,maintainAspectRatio:true,interaction:{mode:"index",intersect:false},plugins:{legend:{display:true},tooltip:{callbacks:{label:ctx=>ctx.dataset.label+": "+Number(ctx.parsed.y).toFixed(3)+"%"}}},scales:{y:{title:{display:true,text:"시작일 대비 변화 (%)"}},x:{ticks:{maxTicksLimit:8}}}}});
  }
  status.textContent="ECB 실제 환율 · "+first.date+" ~ "+last.date+" ("+rows.length+"개 관측일) · 각 통화의 USD 대비 변동률. BIS 그래프와 관측 시작일 및 산식이 다릅니다.";
 }catch(e){status.textContent="USD 환율 비교를 표시할 수 없습니다: "+e.message;}
})();
