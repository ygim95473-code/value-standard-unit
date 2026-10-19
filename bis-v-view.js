"use strict";
// BIS index observations; values are experimental and never redefine 1V.
(async()=>{
 const status=document.getElementById("bis-auto-status"),table=document.getElementById("bis-auto-table"),canvas=document.getElementById("bis-auto-chart"),variant=document.getElementById("bis-auto-variant");
 if(!status||!table||!canvas||!variant)return;
 const fmt=x=>Number(x).toLocaleString("ko-KR",{maximumFractionDigits:8});
 try{
  const [r,f]=await Promise.all([fetch("./data/public/bis-v-observations.json",{cache:"no-store"}),fetch("./data/public/ecb-fx-latest.json",{cache:"no-store"})]);
  if(!r.ok)throw Error("BIS 관측 자료를 읽지 못했습니다. HTTP "+r.status);
  if(!f.ok)throw Error("최초 환율 환산 자료가 없습니다.");
  const bis=await r.json(),fx=await f.json();
  const dates=fx.rows.filter(x=>x.date<="2026-10-19").sort((a,b)=>a.date.localeCompare(b.date));
  const initial=dates.at(-1);if(!initial)throw Error("기준 환율을 확인할 수 없습니다.");
  const krw=initial.rates_per_eur.KRW;
  const base={KRW:1,USD:krw/initial.rates_per_eur.USD,EUR:krw,JPY:krw/initial.rates_per_eur.JPY,CNY:krw/initial.rates_per_eur.CNY};
  let chart=null;
  function draw(){
   const type=variant.value,selected=bis.series.filter(s=>s.variant===type);
   table.replaceChildren();
   const datasets=[],allDates=new Set(),colors=["#1a6db0","#dc7956","#15978b","#9069b7","#b08c28"];
   for(const [i,c] of ["KRW","USD","EUR","JPY","CNY"].entries()){
    const s=selected.find(x=>x.currency===c);
    if(!s||!s.observations.length||!base[c])continue;
    const latest=s.observations.at(-1),v=base[c]*latest.index/s.baseline_index;
    const tr=document.createElement("tr");
    for(const value of [c,s.series_id,s.baseline_period,latest.period,fmt(v)+" V",(100*(latest.index/s.baseline_index-1)).toFixed(3)+"%"]){
     const td=document.createElement("td");td.textContent=value;tr.appendChild(td);
    }table.appendChild(tr);
    const arr=s.observations.map(x=>({period:x.period,value:100*(x.index/s.baseline_index-1)}));
    arr.forEach(x=>allDates.add(x.period));
    datasets.push({label:c+" (기준 대비 %)",points:arr,color:colors[i]});
   }
   if(chart){chart.destroy();chart=null}
   if(typeof Chart!=="undefined"&&datasets.length){
    const labels=[...allDates].sort();
    chart=new Chart(canvas,{type:"line",data:{labels,datasets:datasets.map(d=>({label:d.label,data:labels.map(p=>d.points.find(x=>x.period===p)?.value??null),borderColor:d.color,backgroundColor:d.color,pointRadius:0,spanGaps:false,tension:.1}))},options:{responsive:true,plugins:{title:{display:true,text:"BIS 지수 기반 통화별 변화율 (%) · 최초 지수 기간 대비"}},scales:{y:{title:{display:true,text:"변화율 (%)"}}}}});
   }
  }
  variant.addEventListener("change",draw);draw();
  status.textContent="BIS 관측 자료: "+bis.retrieved_at_utc+" · 최초 환율: ECB "+initial.date+" · 기준시각 정각 환율 및 과거 공표 빈티지 미검증. NEER/REER의 관측 주기는 다릅니다.";
 }catch(e){status.textContent="실제 BIS 관측 대기: "+e.message}
})();
