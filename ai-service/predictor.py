"""Node Health Predictor — AI Scoring Engine"""
import time, logging
logger = logging.getLogger(__name__)

class NodeHealthPredictor:
    WEIGHT_SUCCESS, WEIGHT_UPTIME, WEIGHT_STAKE, MIN_STAKE = 70, 25, 5, 0.05

    def predict(self, d: dict) -> dict:
        addr = d.get("address","0x0")
        jc, jf = d.get("jobs_completed",0), d.get("jobs_failed",0)
        total = jc + jf
        sr = jc/total if total > 0 else 0.5
        sc = (sr * self.WEIGHT_SUCCESS) if total > 0 else 35

        dt = int(time.time()) - d.get("last_heartbeat", 0)
        us = 100 if dt < 300 else 70 if dt < 900 else 40 if dt < 3600 else 10 if dt < 21600 else 0
        uc = (us * self.WEIGHT_UPTIME) / 100

        stake = d.get("staked_amount", 0)
        sb = self.WEIGHT_STAKE if stake >= 3*self.MIN_STAKE else int(self.WEIGHT_STAKE*0.7) if stake >= 2*self.MIN_STAKE else int(self.WEIGHT_STAKE*0.4) if stake >= self.MIN_STAKE else 0

        score = sc + uc + sb
        if jf > 3: score -= 20
        if us < 20: score -= 10
        days = max(1, (int(time.time()) - d.get("registered_at", int(time.time()))) / 86400)
        if jc/days > 10: score += 5
        score = max(0, min(100, int(score)))

        risk = "critical" if score < 40 else "warning" if score < 70 else "safe"
        trend = "up" if us >= 70 and sr >= 0.9 else "down" if us < 40 or sr < 0.7 else "stable"
        rec = "Node healthy." if score >= 80 else f"Score {score}. " + ("⚠️ CRITICAL risk." if score < 40 else "Monitor closely.")

        return {"address": addr, "predictedScore": score, "successRate": round(sr,4),
                "uptimeScore": us, "stakeBonus": sb, "trend": trend, "riskLevel": risk, "recommendation": rec}

    def predict_batch(self, nodes: list[dict]) -> list[dict]: return [self.predict(n) for n in nodes]
