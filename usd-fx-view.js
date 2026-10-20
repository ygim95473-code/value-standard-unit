"use strict";
// Comparison experiment: BIS-V vs USD-anchored FX-V. USD anchor uses BIS USD NEER;
// hence the two curves are NOT independent measures of absolute currency value.
(async()=>{
 const status=document.getElementById("usd-fx-status"),holder=document.getElementById("usd-fx-charts"),table=document.getElementById("usd-v-table");
 if(!status||!holder||!table)return;
 const codes=["KRW","USD","EUR","JPY","CNY"],fmt=v=>Number(v).toLocaleString("ko-KR",{maximumFractionDigits:6});
 try{
  const [br,fr]=await Promise.all([fetch("./data/public/bis-v-observations.json",{cache:"no-store"}),fetch("./data/public/ecb-fx-latest.json",{cache:"no-store"})]);
  if(!br.ok||!fr.ok)throw Error("BIS 또는 ECB 자료를 읽지 못했습니다.");
  const bis=await br.json(),fx=await fr.json();
  const series=Object.fromEntries(bis.series.filter(s=>s.variant==="NEER").map(s=>[s.currency,s]));
  const fxRows=fx.rows.filter(r=>r.date<="2026-10-19"&&codes.every(c=>Number(r.rates_per_eur[c])>0)).sort((a,b)=>a.date.localeCompare(b.date));
  const origin=fxRows.at(-1);
  if(!origin||codes.some(c=>!series[c]))throw Error("기준 관측 자료가 부족합니다.");
  const b=origin.rates_per_eur,base=Object.fromEntries(codes.map(c=>[c,b.KRW/b[c]]));
  const usdAtOrigin=b.USD;
  const usdNEER=series.USD;
  const bisMaps=Object.fromEntries(codes.map(c=>[c,new Map(series[c].observations.map(o=>[o.period,o.index]))]));
  const rows=fxRows.filter(r=>codes.every(c=>bisMaps[c].has(r.date)));
  if(!rows.length)throw Error("같은 날짜의 BIS·ECB 관측값이 없습니다.");
  if(typeof Chart==="undefined")throw Error("그래프 라이브러리를 불러오지 못했습니다.");
  table.replaceChildren();holder.replaceChildren();
  for(const c of codes){
   const dates=rows.map(r=>r.date);
   const bisV=rows.map(r=>base[c]*bisMaps[c].get(r.date)/series[c].baseline_index);
   const usdV=rows.map(r=>{
    const usdAnchor=base.USD*bisMaps.USD.get(r.date)/usdNEER.baseline_index;
    const usdPerCurrency=r.rates_per_eur.USD/r.rates_per_eur[c];
    const originUsdPerCurrency=usdAtOrigin/b[c];
    return base[c]*(usdAnchor/base.USD)*(usdPerCurrency/originUsdPerCurrency);
   });
   const latest=rows.at(-1),v1=bisV.at(-1),v2=usdV.at(-1);
   const tr=document.createElement("tr");
   for(const value of [c,latest.date,fmt(v1)+" V",fmt(v2)+" V",fmt(v2-v1)+" V"]){const td=document.createElement("td");td.textContent=value;tr.append(td);}table.append(tr);
   const box=document.createElement("div");box.className="chartbox";
   const title=document.createElement("h3");title.textContent=c+" · BIS-V / USD 기반 V";
   const subtitle=document.createElement("p");subtitle.className="hint";subtitle.textContent="세로축: V / 1"+c+" · 동일 관측일 "+dates[0]+" ~ "+dates.at(-1)+" · 최초 대응값(잠정): "+fmt(base[c])+" V";
   const canvas=document.createElement("canvas");canvas.setAttribute("aria-label",c+"의 BIS 기반 V와 USD 기반 V 관측값 비교");
   box.append(title,subtitle,canvas);holder.append(box);
   new Chart(canvas,{type:"line",data:{labels:dates,datasets:[
    {label:"BIS 기반 V",data:bisV,borderColor:"#1a6db0",pointRadius:0,tension:.1},
    {label:"USD 기반 V (BIS USD 앵커)",data:usdV,borderColor:"#d5783d",pointRadius:0,tension:.1,borderDash:[5,3]},
    {label:"최초 대응값 (잠정)",data:dates.map(()=>base[c]),borderColor:"#777",borderDash:[2,5],borderWidth:1,pointRadius:0}
   ]},options:{responsive:true,maintainAspectRatio:true,interaction:{mode:"index",intersect:false},plugins:{tooltip:{callbacks:{label:ctx=>ctx.dataset.label+": "+fmt(ctx.parsed.y)+" V"}}},scales:{y:{title:{display:true,text:"V / 1"+c}},x:{ticks:{maxTicksLimit:8}}}}});
  }
  status.textContent="비교 기간: "+rows[0].date+" ~ "+rows.at(-1).date+" · BIS NEER와 ECB 환율의 날짜가 일치하는 "+rows.length+"개 관측일 · 최초 환산값은 정각 호가 미검증 잠정값";
 }catch(e){status.textContent="V 비교를 표시할 수 없습니다: "+e.message;}
})();
