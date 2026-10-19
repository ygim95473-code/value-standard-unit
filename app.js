"use strict";
const CURRENCIES=["KRW","USD","EUR","JPY","CNY"], T0=Date.parse("2026-10-19T00:00:00Z");
let state=null,chart=null;
const $=id=>document.getElementById(id);
function csv(text){
 const rows=[];let row=[],field="",quoted=false;
 text=text.replace(/^\uFEFF/,"");
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++}else quoted=!quoted}else if(c===','&&!quoted){row.push(field.trim());field=""}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field.trim());if(row.some(Boolean))rows.push(row);row=[];field=""}else field+=c}
 if(quoted)throw Error("CSV 따옴표가 닫히지 않았습니다.");
 row.push(field.trim());if(row.some(Boolean))rows.push(row);
 if(rows.length<2)throw Error("CSV 헤더와 자료 행이 필요합니다.");
 const keys=rows.shift();if(new Set(keys).size!==keys.length)throw Error("CSV 헤더 중복");
 return rows.map((r,i)=>{if(r.length!==keys.length)throw Error("CSV "+(i+2)+"행의 열 수 오류");return Object.fromEntries(keys.map((k,j)=>[k,r[j]]))});
}
function fields(rows,required){for(const key of required)if(!rows[0]||!(key in rows[0]))throw Error("CSV 필수 열 누락: "+key)}
function positive(s,label){const n=Number(s);if(!s||!Number.isFinite(n)||n<=0)throw Error(label+"은 양수여야 합니다.");return n}
function parse(fx,indices,synthetic=false){
 fields(fx,["currency","krw_per_unit","quote_time_utc","source","source_url","quote_type","verified"]);
 fields(indices,["currency","variant","period","index_value","source","series_id","verified","baseline_period"]);
 const errors=[],notes=[],baseline=new Map(),groups=new Map();
 for(const r of fx){const c=r.currency.toUpperCase();if(!CURRENCIES.includes(c))continue;if(baseline.has(c))throw Error("중복 기준 환율: "+c);
 const value=positive(r.krw_per_unit,c+" 기준 환율");const timestamp=Date.parse(r.quote_time_utc);
 if(!Number.isFinite(timestamp)||!/^\d{4}-\d\d-\d\dT/.test(r.quote_time_utc))throw Error(c+"의 실제 ISO 환율 시각 필요");
 if(c==="KRW"&&value!==1)throw Error("KRW 기준값은 1이어야 합니다.");
 baseline.set(c,{value,...r,timestamp});
 if(timestamp!==T0)notes.push(c+": 기준 호가가 09:00 KST 정각과 "+Math.round((timestamp-T0)/1000)+"초 차이남");
 if(r.verified!=="true")notes.push(c+": 환율 검증 표시 미완료");
 if(!r.source||!r.source_url||!r.quote_type)notes.push(c+": 환율 출처 또는 호가 유형 누락");
 }
 for(const r of indices){const c=r.currency.toUpperCase(),v=r.variant.toUpperCase();if(!CURRENCIES.includes(c)||!["NEER","REER"].includes(v))continue;
 if(!/^\d{4}-\d\d(-\d\d)?$/.test(r.period))throw Error("잘못된 지수 관측 기간: "+r.period);
 const value=positive(r.index_value,c+" "+v+" 지수");if(!r.baseline_period||!/^\d{4}-\d\d(-\d\d)?$/.test(r.baseline_period))throw Error(c+" "+v+": 명시적 기준 관측 기간(baseline_period)이 필요합니다.");if(v==="NEER"&&r.baseline_period!=="2026-10-19")throw Error(c+" NEER: 기준 관측일은 2026-10-19여야 합니다.");if(v==="REER"&&r.baseline_period>="2026-10")throw Error(c+" REER: 2026-10-19 시각에 발표되지 않은 2026-10 이후 월 자료를 기준으로 쓸 수 없습니다.");const key=c+"|"+v;if(!groups.has(key))groups.set(key,[]);
 groups.get(key).push({...r,currency:c,variant:v,value});
 if(r.verified!=="true")notes.push(c+" "+v+" "+r.period+": 지수 검증 표시 미완료");
 if(!r.source||!r.series_id)notes.push(c+" "+v+": BIS 계열 식별자/출처 누락");
 }
 for(const [key,arr] of groups){arr.sort((a,b)=>a.period.localeCompare(b.period));if(new Set(arr.map(x=>x.period)).size!==arr.length)throw Error("중복 지수 관측 기간: "+key);
 const [c,v]=key.split("|"),bases=new Set(arr.map(x=>x.baseline_period));
 if(bases.size!==1)throw Error(key+": 기준 관측 기간이 서로 다릅니다.");
 const basePeriod=arr[0].baseline_period;
 if(!arr.some(x=>x.period===basePeriod))throw Error(key+": 기준 지수 관측값 "+basePeriod+"이 없습니다. 임의의 첫 관측값으로 대체하지 않습니다.");
 if(v==="REER")notes.push(c+" REER: "+basePeriod+" 월 자료를 기준으로 하는 사전 공개 관측치 사용. 09시 정각 지수가 아닙니다.");
 }
 for(const c of CURRENCIES)if(!baseline.has(c))notes.push(c+": 기준 환율 없음");
 return {baseline,groups,notes:[...new Set(notes)],synthetic};
}
function num(n){return Number(n).toLocaleString("ko-KR",{maximumFractionDigits:5})}
function compute(){if(!state)return;const v=$("variant").value,tbody=$("results");tbody.replaceChildren();const all=[],lines=[];
 for(const c of CURRENCIES){const fx=state.baseline.get(c),series=state.groups.get(c+"|"+v),tr=document.createElement("tr");
 const latest=series?.at(-1),initial=series?.find(x=>x.period===series[0].baseline_period),value=fx&&latest&&initial?fx.value*latest.value/initial.value:null,delta=latest&&initial?100*(latest.value/initial.value-1):null;
 for(const cell of [c,fx?num(fx.value):"미확정",latest?.period||"자료 없음",value===null?"계산 불가":num(value),delta===null?"—":(delta>=0?"+":"")+num(delta)+"%"]){const td=document.createElement("td");td.textContent=cell;tr.appendChild(td)}tbody.appendChild(tr);
 if(value!==null)all.push({currency:c,variant:v,period:latest.period,baseline_v:fx.value,index_base:initial.value,index_latest:latest.value,current_v:value,change_pct:delta});
 if(fx&&initial&&series?.length)lines.push({c,arr:series.map(r=>({x:r.period,y:100*(r.value/initial.value-1)}))});
 }
 state.output=all;
 $("export").disabled=!all.length||state.synthetic;
 $("audit").replaceChildren();const audit=[state.synthetic?"주의: 현재 모든 숫자는 기능 시험용 합성 예시입니다. 실제 경제적 해석 금지.":"사용자 제공 CSV를 계산했습니다. 출처의 진위는 프로그램이 독립적으로 검증하지 않습니다.",...state.notes];
 for(const s of audit){const li=document.createElement("li");li.textContent=s;$("audit").appendChild(li)}
 $("status").textContent=state.synthetic?"예시 모드":"사용자 자료";$("statusDetail").textContent=state.synthetic?"공식 계산 결과 아님":all.length+"개 통화 계산 가능";
 renderChart(lines);
}
function renderChart(lines){if(chart){chart.destroy();chart=null}const canvas=$("chart"),fallback=$("chartFallback");
 if(!lines.length){fallback.hidden=false;canvas.hidden=true;return}
 if(typeof Chart==="undefined"){fallback.textContent="그래프 라이브러리를 불러오지 못했습니다. 계산표는 사용할 수 있습니다.";fallback.hidden=false;canvas.hidden=true;return}
 fallback.hidden=true;canvas.hidden=false;
 const labels=[...new Set(lines.flatMap(l=>l.arr.map(x=>x.x)))].sort();
 const palette=["#1a6db0","#dc7956","#15978b","#9069b7","#b08c28"];
 chart=new Chart(canvas,{type:"line",data:{labels,datasets:lines.map((l,i)=>({label:l.c,data:labels.map(p=>l.arr.find(x=>x.x===p)?.y??null),borderColor:palette[i],backgroundColor:palette[i],spanGaps:false,tension:.1}))},options:{responsive:true,plugins:{title:{display:true,text:"기준 대비 지수 변화 (%)"+(state.synthetic?" — 합성 예시":"")}},scales:{y:{title:{display:true,text:"변화율 (%)"}}}}});
}
function sample(){
 const t="2026-10-19T00:00:00Z",curr=["KRW","USD","EUR","JPY","CNY"],fx=[1,1300,1450,9,185];
 const baseline=curr.map((c,i)=>({currency:c,krw_per_unit:String(fx[i]),quote_time_utc:t,source:"SYNTHETIC EXAMPLE — NOT MARKET DATA",source_url:"https://example.invalid",quote_type:"synthetic",verified:"false"}));
 const indices=[];for(const v of ["NEER","REER"])for(let i=0;i<curr.length;i++){const periods=v==="NEER"?["2026-10-19","2026-10-20","2026-10-21"]:["2026-09","2026-10","2026-11"];
 for(let j=0;j<3;j++)indices.push({currency:curr[i],variant:v,period:periods[j],index_value:String(100+(i-2)*j*1.4),source:"SYNTHETIC — NOT BIS",series_id:"SYNTHETIC",verified:"false",baseline_period:v==="NEER"?"2026-10-19":"2026-09"})}
 state=parse(baseline,indices,true);compute();$("message").textContent="합성 예시 모드입니다. 실제 환율·BIS 관측값이 아닙니다.";
}
$("load").addEventListener("click",async()=>{try{const a=$("baseline").files[0],b=$("indices").files[0];if(!a||!b)throw Error("두 CSV 파일을 모두 선택해 주세요.");state=parse(csv(await a.text()),csv(await b.text()));compute();$("message").textContent="계산 완료. 검증 경고와 관측 시점을 반드시 확인하세요."}catch(e){$("message").textContent="오류: "+e.message}});
$("sample").addEventListener("click",sample);
$("reset").addEventListener("click",()=>{state=null;$("baseline").value="";$("indices").value="";$("status").textContent="미입력";$("statusDetail").textContent="검증 자료를 불러오세요";$("results").innerHTML="<tr><td>KRW</td><td>1</td><td colspan='3'>기준 환율 및 지수 자료를 불러오세요.</td></tr>";$("audit").innerHTML="<li>아직 입력된 자료가 없습니다.</li>";$("export").disabled=true;$("message").textContent="";renderChart([])});
$("variant").addEventListener("change",compute);
function csvQuote(s){const x=String(s);return /[",\r\n]/.test(x)?'"'+x.replace(/"/g,'""')+'"':x}
$("export").addEventListener("click",()=>{if(!state||state.synthetic)return;const keys=["currency","variant","period","baseline_v","index_base","index_latest","current_v","change_pct"];const body=[keys.join(","),...state.output.map(r=>keys.map(k=>csvQuote(r[k])).join(","))].join("\r\n");const blob=new Blob(["\uFEFF"+body],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="v-results-"+$("variant").value.toLowerCase()+".csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
