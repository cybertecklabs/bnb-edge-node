"""Keeper Bot — Background Scheduler"""
import logging
from apscheduler.schedulers.background import BackgroundScheduler
logger = logging.getLogger(__name__)
scheduler = BackgroundScheduler()

def start_keeper(chain, predictor):
    def check_critical():
        try:
            for a in chain.get_active_nodes():
                r = predictor.predict(chain.get_node(a))
                if r["predictedScore"] < 40:
                    logger.warning(f"⚠️ Critical: {a} ({r['predictedScore']})")
                    try: chain.signal_reassignment(a, 0)
                    except: pass
        except Exception as e: logger.error(f"Check failed: {e}")

    def batch_update():
        try:
            active = chain.get_active_nodes()
            if active:
                results = predictor.predict_batch([chain.get_node(a) for a in active])
                chain.submit_batch_scores(active, [r["predictedScore"] for r in results])
        except Exception as e: logger.error(f"Batch failed: {e}")

    scheduler.add_job(check_critical, 'interval', minutes=5)
    scheduler.add_job(batch_update, 'interval', minutes=30)
    scheduler.start()

def stop_keeper():
    if scheduler.running: scheduler.shutdown(wait=False)
