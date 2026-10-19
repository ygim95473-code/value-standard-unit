"use strict";
// BIS index observations; values are experimental and never redefine 1V.
(async()=>{
 const status=document.getElementById("bis-auto-status"),table=document.getElementById("bis-auto-table"),holder=document.getElementById("bis-individual-charts"),variant=document.getElementById("bis-auto-variant");
 if(!status||!table||!holder||!variant){const e=document.getElementById("bis-auto-status");if(e)e.textContent="그래프 영역 연결 오류";return;}
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
  let charts=[];
  function draw(){
   const type=variant.value,selected=bis.series.filter(s=>s.variant===type);
   table.replaceChildren();
   const datasets=[],colors=["#1a6db0","#dc7956","#15978b","#9069b7","#b08c28"];
   for(const [i,c] of ["KRW","USD","EUR","JPY","CNY"].entries()){
    const s=selected.find(x=>x.currency===c);
    if(!s||!s.observations.length||!base[c])continue;
    const latest=s.observations.at(-1),v=base[c]*latest.index/s.baseline_index;
    const tr=document.createElement("tr");
    for(const value of [c,s.series_id,s.baseline_period,latest.period,fmt(v)+" V",(100*(latest.index/s.baseline_index-1)).toFixed(3)+"%"]){
     const td=document.createElement("td");td.textContent=value;tr.appendChild(td);
    }table.appendChild(tr);
    const arr=s.observations.map(x=>({period:x.period,value:base[c]*x.index/s.baseline_index}));
    datasets.push({currency:c,base:base[c],points:arr,color:colors[i]});
   }
   charts.forEach(ch=>ch.destroy());charts=[];
   holder.replaceChildren();
   if(typeof Chart==="undefined"){status.textContent="Chart.js 로딩 실패 — 차트 라이브러리를 불러올 수 없습니다.";return}
   for(const d of datasets){
    const panel=document.createElement("div");panel.className="chartbox";
    const title=document.createElement("h3");title.textContent=d.currency+" · 최초 "+fmt(d.base)+"V / 1"+d.currency;
    const subtitle=document.createElement("p");subtitle.className="hint";subtitle.textContent="세로축: 1"+d.currency+"당 V · 기준선: 최초 환산값 · BIS "+type+" 지수 기반";
    const el=document.createElement("canvas");el.setAttribute("aria-label",d.currency+"의 V 관측 변화");
    panel.append(title,subtitle,el);holder.append(panel);
    const values=d.points.map(p=>p.value),min=Math.min(d.base,...values),max=Math.max(d.base,...values);
    const pad=Math.max((max-min)*0.12,Math.abs(d.base)*0.0002);
    const ch=new Chart(el,{type:"line",data:{labels:d.points.map(p=>p.period),datasets:[
      {label:"관측 V / 1"+d.currency,data:values,borderColor:d.color,backgroundColor:d.color,pointRadius:0,tension:.1},
      {label:"최초 기준선 "+fmt(d.base)+"V",data:d.points.map(()=>d.base),borderColor:"#777",borderDash:[5,5],pointRadius:0,borderWidth:1}
    ]},options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{display:true}},scales:{y:{min:min-pad,max:max+pad,title:{display:true,text:"V / 1"+d.currency}}}}});
    charts.push(ch);
   }
  }
  variant.addEventListener("change",draw);draw();
  status.textContent="BIS 관측 자료: "+bis.retrieved_at_utc+" · 최초 환율: ECB "+initial.date+" · 기준시각 정각 환율 및 과거 공표 빈티지 미검증. NEER/REER의 관측 주기는 다릅니다.";
 }catch(e){status.textContent="실제 BIS 관측 대기: "+e.message}
})();
