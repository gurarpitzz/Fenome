import csv
import random
import uuid
from datetime import datetime, timedelta

# Configuration
NUM_RECORDS = 1000
START_TIME = datetime.now() - timedelta(days=1)

LAYERS = ['SSH', 'HTTP', 'SQL']
ACTION_TYPES = {
    'SSH': ['ROOT_LOGIN_ATTEMPT', 'BRUTE_FORCE', 'BANNER_GRAB', 'SHELLCODE_INJECTION', 'PRIV_ESC'],
    'HTTP': ['ADMIN_RECON', 'SQL_INJECTION', 'ENV_SCAN', 'DIR_TRAVERSAL', 'XSS_PAYLOAD'],
    'SQL': ['USER_ENUMERATION', 'VERSION_PROBE', 'TABLE_DROP', 'HONEYTOKEN_TRIGGER', 'BLIND_SQLI']
}

DECEPTION_STRATEGIES = [
    'SHADOW_NET_REDIRECT', 'ENTROPY_NOISE_INJECTION', 'BANNER_MUTATION', 
    'ILLUSIONARY_FS_SYNTHESIS', 'SANDBOX_ISOLATION', 'LATENCY_MASKING', 
    'HONEYTOKEN_GENERATION', 'RECURSIVE_TARPIT', 'DB_CORRUPTION_SIM', 'TRAFFIC_MIRRORING'
]

def generate_attacker_logs():
    logs = []
    for i in range(NUM_RECORDS):
        timestamp = (START_TIME + timedelta(seconds=i*86)).isoformat()
        layer = random.choice(LAYERS)
        action = random.choice(ACTION_TYPES[layer])
        maliciousness = random.randint(60, 100)
        entropy = round(random.uniform(1.5, 4.5), 2)
        
        logs.append({
            'log_id': str(uuid.uuid4())[:8],
            'timestamp': timestamp,
            'session_id': f"0x{random.randint(0x1000, 0xFFFF):X}",
            'source_ip': f"192.168.1.{random.randint(2, 254)}",
            'layer': layer,
            'action_type': action,
            'maliciousness_score': maliciousness,
            'entropy_value': entropy,
            'threat_vector_contribution': round(maliciousness / 10, 2)
        })
    return logs

def generate_deception_logs(attacker_logs):
    logs = []
    for attacker_log in attacker_logs:
        if attacker_log['maliciousness_score'] > 75:
            timestamp = (datetime.fromisoformat(attacker_log['timestamp']) + timedelta(milliseconds=random.randint(100, 800))).isoformat()
            logs.append({
                'timestamp': timestamp,
                'trigger_action_id': attacker_log['log_id'],
                'deception_strategy': random.choice(DECEPTION_STRATEGIES),
                'mutation_id': f"DNA_SEQ_{random.randint(0x100, 0xFFF):X}",
                'confusion_delta': random.randint(2, 8),
                'intelligence_yield': round(random.uniform(0.1, 0.9), 2),
                'mitigation_status': random.choice(['SUCCESS', 'SUCCESS', 'PARTIAL'])
            })
    return logs

def generate_telemetry():
    logs = []
    current_threat = 20
    current_confusion = 40
    for i in range(NUM_RECORDS):
        timestamp = (START_TIME + timedelta(seconds=i*86)).isoformat()
        current_threat = max(0, min(100, current_threat + random.randint(-5, 8)))
        current_confusion = max(0, min(100, current_confusion + random.randint(-2, 5)))
        
        logs.append({
            'timestamp': timestamp,
            'threat_level': current_threat,
            'entropy_rate': round(random.uniform(1.0, 3.5), 2),
            'confusion_index': current_confusion,
            'dna_sync_percentage': round(random.uniform(85, 99.9), 2),
            'adversary_aci': round(random.uniform(0.4, 0.95), 2),
            'active_deception_traps': random.randint(5, 25)
        })
    return logs

# Write to CSV
attacker_data = generate_attacker_logs()
with open('attacker_logs.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=attacker_data[0].keys())
    writer.writeheader()
    writer.writerows(attacker_data)

deception_data = generate_deception_logs(attacker_data)
with open('deception_responses.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=deception_data[0].keys())
    writer.writeheader()
    writer.writerows(deception_data)

telemetry_data = generate_telemetry()
with open('system_telemetry.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=telemetry_data[0].keys())
    writer.writeheader()
    writer.writerows(telemetry_data)

print("Industry-grade datasets generated successfully: attacker_logs.csv, deception_responses.csv, system_telemetry.csv")
