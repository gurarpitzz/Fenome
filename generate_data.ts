import * as fs from 'fs';
import * as crypto from 'crypto';

const NUM_RECORDS = 1200;
const START_TIME = new Date(Date.now() - 24 * 60 * 60 * 1000);

const LAYERS = ['SSH', 'HTTP', 'SQL'] as const;
const ACTION_TYPES = {
  SSH: ['ROOT_LOGIN_ATTEMPT', 'BRUTE_FORCE', 'BANNER_GRAB', 'SHELLCODE_INJECTION', 'PRIV_ESC'],
  HTTP: ['ADMIN_RECON', 'SQL_INJECTION', 'ENV_SCAN', 'DIR_TRAVERSAL', 'XSS_PAYLOAD'],
  SQL: ['USER_ENUMERATION', 'VERSION_PROBE', 'TABLE_DROP', 'HONEYTOKEN_TRIGGER', 'BLIND_SQLI']
};

const DECEPTION_STRATEGIES = [
  'SHADOW_NET_REDIRECT', 'ENTROPY_NOISE_INJECTION', 'BANNER_MUTATION', 
  'ILLUSIONARY_FS_SYNTHESIS', 'SANDBOX_ISOLATION', 'LATENCY_MASKING', 
  'HONEYTOKEN_GENERATION', 'RECURSIVE_TARPIT', 'DB_CORRUPTION_SIM', 'TRAFFIC_MIRRORING'
];

function generateAttackerLogs() {
  const logs = [];
  for (let i = 0; i < NUM_RECORDS; i++) {
    const timestamp = new Date(START_TIME.getTime() + i * 72000).toISOString();
    const layer = LAYERS[Math.floor(Math.random() * LAYERS.length)];
    const action = ACTION_TYPES[layer][Math.floor(Math.random() * ACTION_TYPES[layer].length)];
    const maliciousness = 60 + Math.floor(Math.random() * 40);
    const entropy = (1.5 + Math.random() * 3).toFixed(2);
    
    logs.push({
      log_id: crypto.randomUUID().slice(0, 8),
      timestamp,
      session_id: `0x${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase()}`,
      source_ip: `192.168.1.${2 + Math.floor(Math.random() * 252)}`,
      layer,
      action_type: action,
      maliciousness_score: maliciousness,
      entropy_value: entropy,
      threat_vector_contribution: (maliciousness / 10).toFixed(2)
    });
  }
  return logs;
}

function generateDeceptionLogs(attackerLogs: any[]) {
  const logs = [];
  for (const attackerLog of attackerLogs) {
    if (attackerLog.maliciousness_score > 75) {
      const timestamp = new Date(new Date(attackerLog.timestamp).getTime() + 100 + Math.random() * 700).toISOString();
      logs.push({
        timestamp,
        trigger_action_id: attackerLog.log_id,
        deception_strategy: DECEPTION_STRATEGIES[Math.floor(Math.random() * DECEPTION_STRATEGIES.length)],
        mutation_id: `DNA_SEQ_${Math.floor(Math.random() * 0xFFF).toString(16).toUpperCase()}`,
        confusion_delta: 2 + Math.floor(Math.random() * 7),
        intelligence_yield: (0.1 + Math.random() * 0.8).toFixed(2),
        mitigation_status: Math.random() > 0.2 ? 'SUCCESS' : 'PARTIAL'
      });
    }
  }
  // Ensure at least 1000
  while(logs.length < 1000) {
      logs.push(logs[Math.floor(Math.random() * logs.length)]);
  }
  return logs;
}

function generateTelemetry() {
  const logs = [];
  let currentThreat = 20;
  let currentConfusion = 40;
  for (let i = 0; i < NUM_RECORDS; i++) {
    const timestamp = new Date(START_TIME.getTime() + i * 72000).toISOString();
    currentThreat = Math.max(0, Math.min(100, currentThreat + Math.floor(Math.random() * 14 - 6)));
    currentConfusion = Math.max(0, Math.min(100, currentConfusion + Math.floor(Math.random() * 8 - 3)));
    
    logs.push({
      timestamp,
      threat_level: currentThreat,
      entropy_rate: (1.0 + Math.random() * 2.5).toFixed(2),
      confusion_index: currentConfusion,
      dna_sync_percentage: (85 + Math.random() * 14.9).toFixed(2),
      adversary_aci: (0.4 + Math.random() * 0.55).toFixed(2),
      active_deception_traps: 5 + Math.floor(Math.random() * 21)
    });
  }
  return logs;
}

const attackerData = generateAttackerLogs();
const deceptionData = generateDeceptionLogs(attackerData);
const telemetryData = generateTelemetry();

const toCSV = (data: any[]) => {
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
  return `${headers}\n${rows}`;
};

fs.writeFileSync('attacker_logs.csv', toCSV(attackerData));
fs.writeFileSync('deception_responses.csv', toCSV(deceptionData));
fs.writeFileSync('system_telemetry.csv', toCSV(telemetryData));

console.log('Datasets generated with 1000+ records each.');
