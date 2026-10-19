#!/usr/bin/env python3
"""Fetch BIS WS_EER observed NEER/REER and preserve a fixed reference period.
No synthetic observations; fail closed if BIS API data cannot be verified.
"""
import csv, io, json, urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE="https://stats.bis.org/api/v1/data/BIS,WS_EER,1.0/"
CURRENCIES={"KRW":"KR","USD":"US","EUR":"XM","JPY":"JP","CNY":"CN"}
OUT=Path(__file__).resolve().parents[1]/"data/public/bis-v-observations.json"
CUTOFF="2026-10-19"
def get_series(key, start):
    url=BASE+key+"?startPeriod="+start+"&format=csvfile"
    req=urllib.request.Request(url,headers={"Accept":"csvfile","User-Agent":"ValueStandardUnit/1.0 research dashboard"})
    with urllib.request.urlopen(req,timeout=40) as resp:
        body=resp.read().decode("utf-8-sig")
    records=list(csv.DictReader(io.StringIO(body)))
    if not records or not {"TIME_PERIOD","OBS_VALUE"}.issubset(records[0]):raise ValueError("BIS CSV fields missing: "+key)
    values={}
    for r in records:
        try:
            t=r["TIME_PERIOD"].strip();v=float(r["OBS_VALUE"])
            if v>0 and t and t<="2026-10-19":values[t]=v
        except (ValueError,TypeError,KeyError):continue
    if not values:raise ValueError("No BIS observations: "+key)
    return [{"period":k,"index":v} for k,v in sorted(values.items())]
def main():
    series=[];failures=[]
    for c,area in CURRENCIES.items():
        for variant,frequency,typ,start in (("NEER","D","N","2025-10-01"),("REER","M","R","2025-01")):
            key=f"{frequency}.{typ}.B.{area}"
            try:
                obs=get_series(key,start)
                # Daily reference period is the last available observation on/before fixed t0.
                # REER latest period may be published later: do not imply vintage verification.
                base=obs[-1]
                series.append({"currency":c,"variant":variant,"series_id":key,"source":"BIS WS_EER 1.0",
                  "source_url":"https://data.bis.org/topics/EER/BIS%2CWS_EER%2C1.0/"+key,
                  "baseline_period":base["period"],"baseline_index":base["index"],"observations":obs})
            except Exception as e:failures.append(f"{c} {variant}: {e}")
    if len(series)!=10:raise RuntimeError("Incomplete BIS collection; existing feed preserved. "+"; ".join(failures))
    result={"dataset":"BIS WS_EER 1.0","retrieved_at_utc":datetime.now(timezone.utc).isoformat(),
      "reference_time_utc":"2026-10-19T00:00:00Z",
      "notice":"BIS historical observations, not FX quotes. Baseline observation availability at exact reference time is not independently verified. Data may be revised. Broad basket B.",
      "series":series}
    OUT.parent.mkdir(parents=True,exist_ok=True)
    OUT.write_text(json.dumps(result,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf-8")
    print("Wrote",OUT,len(series),"series")
if __name__=="__main__":main()
