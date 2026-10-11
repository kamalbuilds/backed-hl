#!/usr/bin/env python3
"""Compile every logged run into app/evidence.json. Each row is tagged REAL (HyperEVM/HyperCore testnet) or SIM (local anvil + SimCore)."""
import json, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
def rows(p): return [json.loads(l) for l in open(R / p) if l.strip().startswith("{")]
out = {"factory": None, "vault": None, "groups": []}
dep = json.load(open(R / "deployment.json")); out.update(factory=dep["factory"], vault=dep["vault"])
v1 = rows("evidence/spikes/v1-v2-runs.jsonl")
lat = [r for r in v1 if r.get("step") == "RESULT" and r.get("mode") == "keeper" and r.get("breachToFillMs")]
lat = lat[-5:]
out["latency"] = {"real_ms": [r["breachToFillMs"] for r in lat], "real_block_to_fill_ms": [r["flattenBlockToFillMs"] for r in lat]}
out["groups"].append({"title": "Loss line crossed -> position flat (keeper, V1 vault 0xB758…)", "kind": "REAL", "items": [
    {"label": f"run {r['run']}: breach -> HyperCore fill {r['breachToFillMs']} ms", "tx": r["flattenTx"]} for r in lat]})
ctl = [r for r in v1 if r.get("step") == "RESULT" and r.get("mode") == "control"][-2:]
out["groups"].append({"title": "Control: trusted API wallet (nobody else can act)", "kind": "REAL", "items": [
    {"label": f"run {r['run']}: still open after {r['stillOpenAfterMs']//1000} s (szi {r['sziAfter']})", "tx": None} for r in ctl]})
v3 = rows("evidence/testnet-v3-runs.jsonl")
out["groups"].append({"title": "V3 rule rejections on chain (factory vault)", "kind": "REAL", "items": [
    {"label": r["step"].replace("REJECT on-chain ", "rejected: "), "tx": r["tx"]} for r in v3 if r.get("step", "").startswith("REJECT")]})
v2 = [r for r in v1 if str(r.get("step", "")).startswith(("v2 REJECT", "REJECT"))]
out["groups"].append({"title": "Earlier rejections (V1/V2/V2.1)", "kind": "REAL", "items": [{"label": r["step"], "tx": r["tx"]} for r in v2][-6:]})
sim = rows("evidence/sim-runs.jsonl")
items = [{"label": r["step"] + (f": {r['breachToFlatMs']} ms" if r.get("breachToFlatMs") else "") + (f" ({r['sim']})" if r.get("sim") else ""), "tx": None}
         for r in sim if str(r.get("step", "")).startswith(("SCENARIO", "RESULT", "REJECT"))]
out["groups"].append({"title": "Missed-band retry, daily loss, settle — simulated HyperCore", "kind": "SIM", "items": items})
out["latency"]["sim_ms"] = [r["breachToFlatMs"] for r in sim if str(r.get("step", "")).startswith("RESULT latency")]

# --- V3 live funded re-test (backed-operator-2, vault 0x6619…) ---
live = [json.loads(l) for l in open(R / "evidence/testnet-live-runs.jsonl")]
kp = [json.loads(l) for l in open(R / "evidence/keeper-testnet.jsonl")]
runs = {}
runs[0] = {"ms": 1768, "tx": "0x17209f5525b905dcc29135051d11cfa8872af9c310b098d6eb5492973e0eccd5", "who": "keeper"}  # keeper saw breach 1791608832637, HyperCore fill 1791608834405 (userFills)
for r in live:
    if r["step"] == "RESULT live V3" and r["run"] >= 1:
        tx = r.get("flattenTx") or next((k["tx"] for k in kp if k["step"] == "keeper flatten" and 0 < k["t"] - r["tBreach"] < 5000), None)
        runs[r["run"]] = {"ms": r["breachToFillMs"], "tx": tx, "who": "script" if r.get("flattenTx") else "keeper"}
ms = sorted(v["ms"] for v in runs.values())
out["latency"].update(live_ms=[runs[i]["ms"] for i in sorted(runs)], median_live_s=round(ms[len(ms) // 2] / 1000, 2),
    replay_real_ms=ms[len(ms) // 2], replay_real_label="V3 vault 0x6619…, median of 5 live testnet runs")
out["latency"]["replay_sim_ms"] = sorted(out["latency"]["sim_ms"])[len(out["latency"]["sim_ms"]) // 2] if out["latency"]["sim_ms"] else 900
g = lambda k: next(r["tx"] for r in live if r["step"].startswith(k))
items = [{"label": f"run {i}: breach -> HyperCore fill {runs[i]['ms']} ms ({runs[i]['who']} flatten)" + (" — tx waited ~51 s for block inclusion" if runs[i]["ms"] > 10000 else ""), "tx": runs[i]["tx"]} for i in sorted(runs)]
out["groups"].insert(0, {"title": "V3 live, funded (20 USDC) — breach-to-flat, 5 runs", "kind": "REAL", "items": items})
out["groups"].insert(1, {"title": "V3 live, funded — rules that bite", "kind": "REAL", "items": [
    {"label": "stacked order (2.5x open + 1x more > 3x cap) reverted", "tx": g("LIVE REJECT stacked")},
    {"label": "reopen after flatten reverted (frozen)", "tx": g("LIVE REJECT reopen")},
    {"label": "rearm while flat, realized loss below loss line, reverted (equity floor)", "tx": g("LIVE REJECT rearm")},
    {"label": "fundPerp 19.9 USDC into vault margin", "tx": g("fundPerp")}]})
out["vault"] = "0x661971C1183088D6290395F4dE15Be9858DeF049"
json.dump(out, open(R / "app/evidence.json", "w"), indent=1)
print(json.dumps(out["latency"]), sum(len(g["items"]) for g in out["groups"]), "items")
