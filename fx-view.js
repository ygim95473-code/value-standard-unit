"use strict";
(async function () {
  const status = document.getElementById("fx-feed-status");
  const tbody = document.getElementById("fx-feed-table");
  const canvas = document.getElementById("fx-feed-chart");
  const fallback = document.getElementById("fx-feed-fallback");
  if (!status || !tbody || !canvas) return;
  try {
    const response = await fetch("./data/public/ecb-fx-latest.json", {cache:"no-store"});
    if (!response.ok) throw new Error("자료 파일을 아직 게시하지 않았습니다 (" + response.status + ")");
    const data = await response.json();
    if (!Array.isArray(data.rows) || !data.rows.length) throw new Error("표시 가능한 자료가 없습니다");
    const rows = data.rows.filter(x=>x && /^\d{4}-\d{2}-\d{2}$/.test(x.date) && ["KRW","USD","JPY","CNY"].every(k=>Number.isFinite(x.rates_per_eur?.[k]) && x.rates_per_eur[k]>0)).sort((a,b)=>a.date.localeCompare(b.date));
    if (!rows.length) throw new Error("유효한 자료가 없습니다");
    const latest = rows.at(-1), first = rows[0];
    status.textContent = "ECB 관측 " + rows.length.toLocaleString("ko-KR") + "일 · 최근 관측 " + latest.date + " · V 계산값 아님";
    const fmt=n=>Number(n).toLocaleString("ko-KR",{maximumFractionDigits:5});
    tbody.replaceChildren();
    for (const c of ["KRW","USD","EUR","JPY","CNY"]) {
      const tr=document.createElement("tr");
      const rate = c==="EUR" ? 1 : latest.rates_per_eur[c];
      const prior = c==="EUR" ? 1 : first.rates_per_eur[c];
      const change = 100*(rate/prior-1);
      for (const cell of [c,fmt(rate),latest.date,(change>=0?"+":"")+fmt(change)+"%"]) {
        const td=document.createElement("td");td.textContent=cell;tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    if (typeof Chart==="undefined") throw new Error("그래프 라이브러리를 불러오지 못했습니다");
    const palette=["#1a6db0","#dc7956","#15978b","#9069b7"];
    new Chart(canvas,{type:"line",data:{labels:rows.map(x=>x.date),datasets:["KRW","USD","JPY","CNY"].map((c,i)=>({label:c,data:rows.map(x=>100*(x.rates_per_eur[c]/first.rates_per_eur[c]-1)),borderColor:palette[i],backgroundColor:palette[i],pointRadius:0,tension:.08}))},options:{responsive:true,interaction:{mode:"index",intersect:false},plugins:{title:{display:true,text:"유로 대비 각 통화의 환율 변동률 (%) — V 아님"}},scales:{x:{ticks:{maxTicksLimit:9}},y:{title:{display:true,text:"기준 관측일 대비 환율 변동 (%)"}}}}});
    fallback.hidden=true;
  } catch(e) {
    status.textContent="실제 자료 표시 대기";
    fallback.textContent="자료 표시 실패: "+e.message+" · GitHub Actions에서 ECB 수집 작업을 다시 실행해 주세요.";
  }
})();
