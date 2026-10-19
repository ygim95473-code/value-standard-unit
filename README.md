# Value Standard Unit (V) | 가치기준단위

**Open research proposal v0.1 — 2026-10-19**  
An open experiment to test whether changes in the US dollar and other currencies can be compared more clearly using a common measurement framework.

> **Status:** Proposal, not a validated index. Baseline FX quotes and BIS index observations are **pending verification**. V is not a cryptocurrency, payment instrument, or investment product.

## English

### 1. The question
The US dollar is a widely used reference currency, but its own value changes. **When other currencies are quoted against USD, how clearly can we distinguish changes in those currencies from changes in the dollar itself?** A bilateral exchange rate already reflects movements in *both* currencies. We are not claiming otherwise.

V is an open experiment to examine whether placing USD, KRW, EUR, JPY and CNY in a common analytical framework adds useful information beyond existing measures. We do not presume that the approach is original, superior, or necessary.

### 2. Definition and immutable reference time
- Name: **Value Standard Unit**, symbol **V**.
- Historical baseline: **2026-10-19 09:00:00 KST (UTC+09:00)** = **2026-10-19 00:00:00 UTC**.
- Initial scale: **1 V = 1 KRW at the baseline**.
- This equality defines a *starting numerical scale*, not a permanent peg to KRW or a claim that KRW is stable.
- Initial currencies: KRW, USD, EUR, JPY and CNY.

The baseline V amount of one unit of each non-KRW currency will be determined from independently verifiable FX observations near the fixed timestamp. Each entry must disclose its source, currency pair, units, bid/ask/mid convention, actual quote timestamp, and deviation from 09:00:00. If a quote exactly at that second is unavailable, a rule for selecting the nearest acceptable observation must be agreed and published **before** declaring a baseline value. Never label an approximate quote as an exact observation.

### 3. BIS data: observation date is not the timestamp
We propose two **separate** experimental variants using BIS effective exchange-rate series:

- **NEER-V:** nominal effective exchange-rate index, subject to verification of a **daily observation dated 2026-10-19** for each currency and chosen series. Publication may lag the observation date.
- **REER-V:** real effective exchange-rate index, typically available at **monthly frequency**. A value for exactly 09:00:00 on October 19 does not exist. We propose testing the **October 2026 monthly observation** as an *ex-post period-aligned baseline*, while comparing the alternative of the latest previously published month. These conventions must never be represented as data available in real time at 09:00.

For every BIS series we will publish its identifier, definition, direction of appreciation, frequency, reference period, publication/retrieval dates, and revision history. Original baseline data snapshots will be preserved; later revisions will be documented separately. NEER and REER will not be combined without an independently specified rationale and test.

### 4. Proposed formula — subject to testing

```text
V_i(t) = V_i(t0) × [I_i(t) / I_i(t0)]
```

Here `V_i(t0)` is the verified baseline V value of one unit of currency `i`; `I_i(t0)` is the explicitly chosen baseline observation from one BIS index series; and `I_i(t)` is a later observation from that same series and methodology. For KRW, `V_KRW(t0) = 1` by definition. We will verify the index's direction before interpreting an increase as appreciation.

This yields an **index-derived experimental number**, not a tradable FX quote or a direct measure of absolute purchasing power.

### 5. Baseline verification register

| Currency | V at baseline | Evidence status |
|---|---:|---|
| KRW | 1 V per 1 KRW | Defined by convention |
| USD | Pending | Historical FX quote not yet verified |
| EUR | Pending | Historical FX quote not yet verified |
| JPY | Pending | Historical FX quote not yet verified; specify 1 JPY vs 100 JPY |
| CNY | Pending | Historical FX quote not yet verified |
| BIS NEER / REER | Pending | Series, observation periods and releases to be verified |

**No unverified numeric quote or index value will be presented as confirmed.** To reproduce the experiment we will publish sources, retrieval steps, timestamps, transformations, missing-data rules, calculations and code.

### 6. Limitations and specific questions for review
NEER and REER are **relative, trade-weighted** indices, not universal absolute measures of value. Currency baskets and weights differ across economies; index-derived V cross-rates may not agree with market spot cross-rates. Different frequencies, publication delays, revisions, inflation measures and retrospective information can introduce inconsistencies or look-ahead bias.

We invite economists, researchers, statisticians, developers and other readers to test:
1. Whether an existing metric already separates the effects we seek to understand.
2. Whether NEER, REER, purchasing-power parity, or another method is the appropriate foundation.
3. Whether the timestamp and monthly/daily baseline alignment rules are defensible.
4. Whether V adds information beyond established FX indices, and where it fails.
5. Whether the proposed formula produces internally coherent comparisons.

Please submit **specific citations, datasets, reproducible calculations, counterexamples or code reviews** through GitHub Issues.

### 7. Why we began — and when we will stop
**“If the dollar itself fluctuates, is it an adequate yardstick for comparing the value of other currencies?”** Our concern is not that conventional exchange rates ignore USD movements, but whether those movements can be identified and understood clearly when USD is also the reference currency.

We respect existing scholarship and **do not claim this question has never been studied**. If an existing theory or measurement system already answers our central question adequately, please provide its sources and reproducible method. We will review and test that evidence openly.

**If we verify that existing methods already solve the problem V is intended to address, we will end the effort to develop V as a new measurement unit.** If a meaningful gap remains, we will document it and continue testing. The objective is not to justify V's existence; it is to find a sound answer. **Confirming that the answer already exists would itself be a successful outcome.**

---

## 한국어

### 1. 출발 질문
미국 달러는 국제 금융에서 널리 사용되는 기준 통화지만 달러 자체의 가치도 변한다. **다른 통화를 달러로 표시할 때 해당 통화의 변화와 달러 자체의 변화를 얼마나 명확하게 구분할 수 있는가?** 기존 양자 환율에 두 통화의 상대적 변화가 이미 반영된다는 사실을 부정하지 않는다.

V는 달러를 포함한 원화·유로·엔화·위안화를 공통된 분석 체계에서 비교할 때 기존 지표보다 유용한 정보를 얻을 수 있는지 검증하는 공개 실험이다. 새로운 방법이 반드시 필요하거나 우수하다고 미리 단정하지 않는다.

### 2. 최초 정의와 기준 시각
- 공식 명칭: **Value Standard Unit(가치기준단위)**, 기호 **V**.
- 고정 기준 시각: **2026년 10월 19일 09:00:00 KST**, 즉 **2026년 10월 19일 00:00:00 UTC**.
- 최초 단위: **1 V = 1 KRW**.
- 이는 숫자의 출발 크기를 정하는 약속일 뿐 **원화에 영구 고정하는 제도는 아니다**.
- 최초 대상: KRW, USD, EUR, JPY, CNY.

다른 통화의 최초 V 값은 기준 시각의 검증 가능한 시장 환율로 정한다. **자료 출처, 통화쌍, 표기 단위, 매수·매도·중간값 기준, 실제 호가 시각 및 09시와의 시차**를 기록한다. 정확히 09시 호가가 없으면 가까운 시각의 값을 정각 자료라고 표시하지 않는다. 대체 관측값을 고르는 규칙부터 먼저 공개한다.

### 3. BIS 자료도 출발 관측값을 고정한다
BIS **명목실효환율(NEER)**과 **실질실효환율(REER)**을 별도 실험으로 운영한다.

- **NEER-V:** 각 통화·계열에 대해 **2026년 10월 19일자 일별 관측값**을 최초 기준으로 삼는 방안을 검증한다. 해당 관측값의 발표일은 관측일보다 늦을 수 있다.
- **REER-V:** 월별 지수에는 10월 19일 오전 9시 값이 존재하지 않는다. **2026년 10월 월별 관측값**을 사후적으로 대응시키는 방안을 제안하며, **당시 이미 발표된 직전 월 지수**를 쓰는 대안과 비교한다. 10월 월별 지수를 10월 19일 오전 9시에 알 수 있었던 값처럼 설명하지 않는다.
- 계열별 **BIS 식별자, 관측 주기, 기준 기간, 지수 방향, 발표·조회 시점, 수정 이력**을 공개한다.
- 최초 확보한 원본 자료를 보존하고 이후 개정은 별도로 기록한다.

즉, **시장 환율의 초 단위 기준 시각과 BIS의 일별·월별 관측 기간은 동일하지 않다.** 이 차이와 발표 시차를 숨기지 않는다.

### 4. 최초 계산식(검증 대상)

```text
V_i(t) = V_i(t0) × [I_i(t) / I_i(t0)]
```

`V_i(t0)`는 검증된 최초 시장 환율로 산출한 통화별 V 값이고, `I_i(t0)`는 선택한 BIS 계열의 최초 관측값, `I_i(t)`는 같은 계열의 이후 관측값이다. 원화는 정의상 `V_KRW(t0) = 1`이다. 지수의 상승·하락 방향도 원본 정의와 대조한다.

**NEER-V와 REER-V는 혼합하지 않고 각각 계산한다.** 결과는 실험적 지표값이지 실제 거래 환율이나 절대적 구매력의 확정값이 아니다.

### 5. 최초 기준표의 현재 상태

| 통화 | 최초 V 값 | 검증 상태 |
|---|---|---|
| KRW | 1 KRW = 1 V | 정의상 확정 |
| USD | 미확정 | 과거 시장 환율 검증 대기 |
| EUR | 미확정 | 과거 시장 환율 검증 대기 |
| JPY | 미확정 | 과거 시장 환율 검증 대기, 1엔/100엔 구분 |
| CNY | 미확정 | 과거 시장 환율 검증 대기 |
| BIS NEER·REER | 미확정 | 계열·관측값·발표 시점 검증 대기 |

확인되지 않은 수치를 임의로 넣지 않는다. 공식 기준표에는 원본 출처, 조회·재현 방법, 실제 시각, 결측 처리 규칙, 계산 과정과 코드까지 포함한다.

### 6. 한계와 공개 검증 질문
NEER와 REER는 교역 가중치를 사용한 **상대적 지수**이며 통화의 절대 가치를 직접 측정하지 않는다. 국가별 통화 바스켓과 가중치가 다르고, V로 계산한 교차값은 실제 시장 교차환율과 다를 수 있다. 발표 시차, 월별·일별 주기 차이, 물가 지표, 과거 자료 개정, 사후 정보를 실시간 정보처럼 사용하는 오류도 검증해야 한다.

경제학자·통계학자·개발자와 관심 있는 모든 분들께 다음을 묻는다.

1. 우리의 질문을 이미 해결한 이론이나 측정 지표가 있는가?
2. NEER·REER 대신 더 적절한 기존 방법이 있는가?
3. 09시 기준 환율과 BIS 일별·월별 관측값의 연결 규칙이 타당한가?
4. V가 기존 지표보다 추가로 보여주는 정보가 있는가? 어떤 반례가 있는가?
5. 제안한 계산식이 서로 다른 통화에 대해 일관된 비교를 제공하는가?

**논문, 공식 자료, 재현 가능한 계산, 반례, 코드 검토를 GitHub Issues로 제시해 주시기 바란다.**

### 7. 우리의 출발점과 실험 종료 조건
**“달러 자체의 가치도 끊임없이 변하는데, 과연 달러는 세계 각국 화폐의 가치를 비교하고 측정하는 기준으로 충분히 적절한가?”**

기존 환율에 달러 변동이 반영되지 않는다고 주장하는 것이 아니다. **상대적 변화 속에서 달러 자체의 움직임을 얼마나 명확하게 구분하고 이해할 수 있는가**라는 의문에서 시작했다.

우리는 이 문제를 최초로 연구했다고 주장하지 않는다. **기존 연구나 측정 체계가 이미 충분하고 검증 가능한 답을 제시한다면 그 근거와 계산 방법을 알려주시기 바란다.** 공개적으로 자료를 검토하고 실제 데이터로 확인하겠다.

**기존 방법이 V가 해결하려는 문제를 이미 충분히 해결한다는 사실이 확인되면, 새로운 측정 단위 V를 개발하려는 실험을 종결하겠다.** 미해결 문제가 확인된다면 그 차이를 기록하고 실험을 이어가겠다.

우리의 목적은 V의 존재를 정당화하는 것이 아니라 최초의 질문에 정확히 답하는 것이다. **그 답이 이미 존재한다면, 확인하는 것만으로도 이 실험은 성공이다.**

---

## Participation / 참여
Open a [GitHub Issue](../../issues) with a concrete question, source, reproducible dataset, critique or alternative methodology. / 구체적인 질문·근거 자료·재현 가능한 데이터·반론·대안을 이슈로 남겨 주세요.

## License / 라이선스
See [LICENSE](LICENSE). Research experiment only; not financial advice.
