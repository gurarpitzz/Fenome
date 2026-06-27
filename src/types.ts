export type LayerType = 'APK_STATIC' | 'APK_DYNAMIC' | 'FRAUD_NETWORK' | 'MULE_DETECTION' | 'FORECAST';

export interface ThreatNode {
  id: string;
  label: string;
  type: 'APK' | 'VICTIM' | 'ACCOUNT' | 'MULE' | 'RING' | 'IP' | 'DEVICE' | 'WALLET' | 'RENT' | 'SHOPPING' | 'MEDICATION' | 'DINING' | 'INVESTMENT' | 'UTILITIES' | 'TRAVEL' | 'SUBSCRIPTIONS';
  riskScore: number;
  status: 'active' | 'mitigated' | 'flagged' | 'quarantined';
  details: Record<string, any>;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface ThreatLink {
  source: string;
  target: string;
  type: 'installs' | 'steals_from' | 'transfers_to' | 'communicates_with' | 'associated_with' | 'correlated_with' | 'discretionary_flow' | 'leisure_link' | 'recurring_cycle' | 'living_essential' | 'balance_factor' | 'lifestyle_affinity';
  weight: number;
}

export interface DigitalDNAProfile {
  permissions: string[];
  entropy: number;
  networkBehavior: string[];
  knownFamily: string;
  riskScore: number;
  timestamp: string;
  dnaSequence: string;
}

export interface UnifiedFraudChainStep {
  id: string;
  name: string;
  status: 'PENDING' | 'INTEGRATING' | 'ACTIVE' | 'BLOCKED';
  description: string;
  icon: string;
  timestamp: string;
  details: string;
}

export interface ThreatForecastBranch {
  id: string;
  scenarioName: string;
  expectedLoss: string;
  lossValue: number;
  probability: number;
  status: 'unmitigated' | 'partially_mitigated' | 'blocked';
  nodesTimeline: string[];
  color: string;
}

export interface InvestigationCard {
  id: string;
  title: string;
  time: string;
  category: 'malware' | 'financial' | 'telemetry' | 'agent';
  description: string;
  status: 'CRITICAL' | 'WARNING' | 'SECURED' | 'INVESTIGATING';
  payload: Record<string, string>;
}
