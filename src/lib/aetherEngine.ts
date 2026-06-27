import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ThreatNode, 
  ThreatLink, 
  DigitalDNAProfile, 
  UnifiedFraudChainStep, 
  ThreatForecastBranch,
  InvestigationCard 
} from '../types';

export interface AttackerAction {
  id: string;
  timestamp: string;
  layer: string;
  action: string;
  maliciousness: number;
  entropy: number;
  timing: number;
}

export interface DeceptionResponse {
  id: string;
  timestamp: string;
  response: string;
  analysis: string;
  mutation: string;
}

// Shannon Entropy calculation
const calculateEntropy = (actions: string[]) => {
  if (actions.length === 0) return 0;
  const counts: Record<string, number> = {};
  actions.forEach(a => counts[a] = (counts[a] || 0) + 1);
  const probs = Object.values(counts).map(c => c / actions.length);
  return -probs.reduce((sum, p) => sum + p * Math.log2(p), 0);
};

// Initial Indian cyber-fraud scenarios to populate our network, constellation, and forecast tabs
const INITIAL_CONSTELLATION_NODES: ThreatNode[] = [
  { id: 'apk-1', label: 'Monthly House Rent', type: 'RENT', riskScore: 10, status: 'mitigated', details: { 'Monthly Amount': '₹35,000', 'Category': 'Essential Living', 'Payment Mode': 'Auto-Debit NetBanking', 'Status': 'Paid Securely' } },
  { id: 'vic-1', label: 'E-Commerce Shopping', type: 'SHOPPING', riskScore: 82, status: 'flagged', details: { 'Platform': 'Amazon India', 'Amount': '₹14,200', 'Trigger': 'Impulsive Midnight Purchase', 'Cognitive Bias': 'Loss Aversion / Sale FOMO' } },
  { id: 'acc-1', label: 'Pharma & Medication', type: 'MEDICATION', riskScore: 15, status: 'mitigated', details: { 'Merchant': 'Apollo Pharmacy', 'Amount': '₹4,850', 'Cycle': 'Monthly Chronic Needs', 'Prescription Verification': 'Secured' } },
  { id: 'mule-1', label: 'Premium Dining & Leisure', type: 'DINING', riskScore: 88, status: 'quarantined', details: { 'Category': 'Fine Dining & Pubs', 'Amount': '₹18,500', 'Velocity Alert': '3x Weekly Cap Breached', 'Status': 'Payment Limit Cap Activated' } },
  { id: 'ring-1', label: 'Wealth SIP Investment', type: 'INVESTMENT', riskScore: 0, status: 'mitigated', details: { 'SIP Amount': '₹15,000', 'Asset Class': 'Nifty 50 Equity Index', 'Financial Health Impact': '+15% Score Contribution', 'Allocation': '10th of every month' } },
  { id: 'ip-1', label: 'Essential Utility Bills', type: 'UTILITIES', riskScore: 5, status: 'active', details: { 'Billed Amount': '₹6,800', 'Providers': 'BSES Electricity & Fiber Wi-Fi', 'Billing Cycle': 'Monthly Recurring', 'Status': 'Pending Payment Approval' } },
  { id: 'dev-1', label: 'Travel & Weekend Flights', type: 'TRAVEL', riskScore: 48, status: 'flagged', details: { 'Booking': 'MakeMyTrip (Goa Holiday)', 'Amount': '₹22,000', 'Trigger': 'Unplanned Weekend Trip', 'Recommendation': 'Optimize leisure budget' } },
  { id: 'wallet-1', label: 'Digital App Subscriptions', type: 'SUBSCRIPTIONS', riskScore: 38, status: 'active', details: { 'Total SaaS Commit': '₹3,200', 'Active Subscriptions': 'Netflix, Spotify, Gym, Cloud Storage', 'Optimizer Action': '2 Unused Subscriptions Detected', 'Potential Savings': '₹950 / month' } }
];

const INITIAL_CONSTELLATION_LINKS: ThreatLink[] = [
  { source: 'apk-1', target: 'ip-1', type: 'correlated_with', weight: 1.0 },
  { source: 'vic-1', target: 'mule-1', type: 'discretionary_flow', weight: 0.9 },
  { source: 'mule-1', target: 'dev-1', type: 'leisure_link', weight: 1.0 },
  { source: 'ip-1', target: 'wallet-1', type: 'recurring_cycle', weight: 0.85 },
  { source: 'acc-1', target: 'apk-1', type: 'living_essential', weight: 0.95 },
  { source: 'ring-1', target: 'apk-1', type: 'balance_factor', weight: 0.9 },
  { source: 'vic-1', target: 'wallet-1', type: 'lifestyle_affinity', weight: 0.6 }
];

const INITIAL_FORECAST_BRANCHES: ThreatForecastBranch[] = [
  {
    id: 'branch-a',
    scenarioName: 'Scenario A: Unmitigated Fraud Pipeline',
    expectedLoss: '₹4,50,000',
    lossValue: 450000,
    probability: 88,
    status: 'unmitigated',
    nodesTimeline: ['com.sbi.secure.verify installs', 'OTP Intercepted via SMS Reader', 'UPI Session Hijack', 'Rs. 4.5L withdrawal', 'Splits through 3 PPB Bank Accounts', 'Withdrawal at ATM Raipur'],
    color: '#FF1F1F'
  },
  {
    id: 'branch-b',
    scenarioName: 'Scenario B: Shadow Sandbox Redirector (Active)',
    expectedLoss: '₹22,500',
    lossValue: 22500,
    probability: 45,
    status: 'partially_mitigated',
    nodesTimeline: ['com.sbi.secure.verify installs', 'Suspicion Flagged on System Alert Window', 'Sandbox triggers simulated banking screen', 'Attacker receives honey credentials', 'Rs. 22.5k limit hold active', 'Mule account traced & blacklisted'],
    color: '#00F0FF'
  },
  {
    id: 'branch-c',
    scenarioName: 'Scenario C: Unified Autonomous Block (Finome Proactive)',
    expectedLoss: '₹0 (Fully Blocked)',
    lossValue: 0,
    probability: 95,
    status: 'blocked',
    nodesTimeline: ['Finome identifies Digital APK Signature', 'Dynamic Sandbox verifies SMS intercept protocol', 'Automatic registry of target UPI id', 'Immediate freeze instruction sent to Bank Raipur API', 'APK blocked on device layer via Secure SDK', 'Zero funds leave victim account'],
    color: '#FFB000'
  }
];

const INITIAL_INVESTIGATION_CARDS: InvestigationCard[] = [
  {
    id: 'inv-1',
    title: 'Apk Decompile: SBI_Security_Update.apk',
    time: '10:14 AM',
    category: 'malware',
    description: 'Dynamic sandbox decompiled com.sbi.secure.verify. Package has self-signed cert and triggers hidden accessibility features.',
    status: 'CRITICAL',
    payload: {
      'Permissions requested': 'READ_SMS, RECEIVE_SMS, READ_CONTACTS, SYSTEM_ALERT_WINDOW',
      'API Target': 'Android API Level 34',
      'Certificate CN': 'Android Debug Module',
      'C2 IP endpoint': '103.242.12.5 (Located VPN India)'
    }
  },
  {
    id: 'inv-2',
    title: 'OTP Interception Flag',
    time: '10:28 AM',
    category: 'malware',
    description: 'SMS Broadcast Receiver is listening for inbound messages from "SBI-ALERT", "SBI-UPI", or "PAYTM" and exfiltrating them via websocket.',
    status: 'CRITICAL',
    payload: {
      'Interceptor String': '([0-9]{6}) is your OTP for transaction',
      'Receiver Class': 'com.sbi.secure.service.SmsReader',
      'Protocols': 'Websocket wss://103.242.12.5/receiver',
      'Exfiltration Frequency': 'Instantaneous'
    }
  },
  {
    id: 'inv-3',
    title: 'Mule Account Central Centralization',
    time: '10:35 AM',
    category: 'financial',
    description: 'Target Account No. 581938102948 at Cooperative Bank Raipur noticed an abnormal inflow of UPI deposits from 4 different states followed by rapid IMPS transfers.',
    status: 'WARNING',
    payload: {
      'Inflow Rate': '₹2.8 Lakhs/min',
      'Cumulative Volume': '₹28.5 Lakhs today',
      'Centrality Score': '0.94 (GNN central mule account hub)',
      'Recommended Action': 'Inject API Freeze payload to RBI gateway'
    }
  },
  {
    id: 'inv-4',
    title: 'UPI Transaction Intercept Blocked',
    time: '11:02 AM',
    category: 'agent',
    description: 'Finome Autonomous Agent matched transaction hash toward known high-risk mule ring and automatically adjusted dynamic limit.',
    status: 'SECURED',
    payload: {
      'Transaction Source': 'anil.k@okhdfcbank',
      'Target Mule Account': 'Ramesh Patel (Layer-1 Mule)',
      'Pre-empted Threat': 'UPI OTP Interception Bypass',
      'Outcome': 'Transaction Blocked, User alerted via Secure Push Notification'
    }
  }
];

export const useAetherEngine = () => {
  // Legacy variables for backward-compatibility
  const [threatLevel, setThreatLevel] = useState(38);
  const [confusionIndex, setConfusionIndex] = useState(62);
  const [attackerLogs, setAttackerLogs] = useState<any[]>([]);
  const [deceptionLogs, setDeceptionLogs] = useState<any[]>([]);
  const [isEngaging, setIsEngaging] = useState(false);
  const [digitalDNA, setDigitalDNA] = useState<string[]>(['0x4F', '0x12', '0xBC', '0x2A']);
  const [metrics, setMetrics] = useState({
    entropyRate: 1.48,
    confusionProbability: 0.65,
    engagementScore: 78,
    intelligenceYield: 0.44,
    adversaryACI: 0.88,
    dnaSync: 0.92
  });

  // FINOME Specific Stateful Variables
  const [constellationNodes, setConstellationNodes] = useState<ThreatNode[]>(INITIAL_CONSTELLATION_NODES);
  const [constellationLinks, setConstellationLinks] = useState<ThreatLink[]>(INITIAL_CONSTELLATION_LINKS);
  const [selectedConstellationNode, setSelectedConstellationNode] = useState<ThreatNode | null>(INITIAL_CONSTELLATION_NODES[0]);
  const [digitalGenome, setDigitalGenome] = useState<DigitalDNAProfile>({
    permissions: ['READ_SMS', 'RECEIVE_SMS', 'READ_CONTACTS', 'SYSTEM_ALERT_WINDOW', 'GET_ACCOUNTS'],
    entropy: 4.82,
    networkBehavior: ['C2 connect: 103.242.12.5', 'Port scanning router gateway', 'Websocket SMS relay established'],
    knownFamily: 'Banking_Trojan:Anubis_X',
    riskScore: 92,
    timestamp: new Date().toLocaleTimeString(),
    dnaSequence: '0x4F:0x12:0xBC:0x2A:0xE8:0x1B:0xD4'
  });

  const [forecastBranches, setForecastBranches] = useState<ThreatForecastBranch[]>(INITIAL_FORECAST_BRANCHES);
  const [selectedForecastBranch, setSelectedForecastBranch] = useState<ThreatForecastBranch | null>(INITIAL_FORECAST_BRANCHES[2]);
  const [investigationCards, setInvestigationCards] = useState<InvestigationCard[]>(INITIAL_INVESTIGATION_CARDS);
  const [activeInvestigationStage, setActiveInvestigationStage] = useState<number>(3); // stages: 0 to 4

  const [riskRings, setRiskRings] = useState({
    malware: 92,
    fraud: 85,
    network: 78,
    system: 45
  });

  // Uploaded APK Simulating States
  const [uploadedApkStatus, setUploadedApkStatus] = useState<'idle' | 'dragging' | 'scanning' | 'complete'>('idle');
  const [uploadedApkDetails, setUploadedApkDetails] = useState<any | null>(null);

  // Autonomous Thinking Loop
  const [isPlayingScenarios, setIsPlayingScenarios] = useState(false);
  const [autonomousThinking, setAutonomousThinking] = useState(false);

  const lastActionTime = useRef<number>(Date.now());
  const deceptionCountRef = useRef<number>(0);
  const confusionIndexRef = useRef<number>(62);

  // Keep refs up to date in real time without causing interval re-creation
  useEffect(() => {
    deceptionCountRef.current = deceptionLogs.length;
    confusionIndexRef.current = confusionIndex;
  }, [deceptionLogs.length, confusionIndex]);

  // Function to simulate dropping an APK
  const startApkScan = useCallback((fileName: string, fileSize: string, customReportText?: string) => {
    setUploadedApkStatus('scanning');
    
    setTimeout(() => {
      const generatedRisk = 75 + Math.floor(Math.random() * 23);
      const generatedDetails = {
        name: fileName,
        size: fileSize,
        packageName: `com.analysis.payload.${fileName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        riskScore: generatedRisk,
        permissions: ['READ_SMS', 'RECEIVE_SMS', 'SYSTEM_ALERT_WINDOW', 'REQUEST_INSTALL_PACKAGES', 'ACCESS_COARSE_LOCATION'],
        explainableReport: customReportText || `Finome Sandbox successfully unpacked and decompiled ${fileName} (${fileSize}). Analysis identified severe banking Trojan features mimicking legitimate Indian UPI prompts. Trigger actions list rapid injection of SYSTEM_ALERT_WINDOW elements to capture passwords, while exfiltrating validation OTP packets.`,
        muleAccounts: [
          { name: 'Kushal Traders (Cooperative Hyd)', score: 94, account: '502948291039' },
          { name: 'Saraswati Exports (Mule Main)', score: 88, account: '119284920281' }
        ],
        entropy: 3.96 + Math.random() * 2
      };

      setUploadedApkDetails(generatedDetails);
      setUploadedApkStatus('complete');
      setThreatLevel(generatedRisk);
      
      // Inject new nodes into constellation & network list to match the analyzed app!
      const newApkNode: ThreatNode = {
        id: `apk-temp-${Date.now()}`,
        label: fileName,
        type: 'APK',
        riskScore: generatedRisk,
        status: 'active',
        details: { package: generatedDetails.packageName, size: fileSize, triggers: 'SYSTEM_ALERT_WINDOW', certificate: 'Self-Signed (Debug CN)' }
      };

      const newMuleNode: ThreatNode = {
        id: `mule-temp-${Date.now()}`,
        label: `${generatedDetails.muleAccounts[0].name}`,
        type: 'MULE',
        riskScore: generatedDetails.muleAccounts[0].score,
        status: 'flagged',
        details: { accountNo: generatedDetails.muleAccounts[0].account, Bank: 'SBI Cooperative', centralInflow: '₹12,40,000' }
      };

      setConstellationNodes(prev => [newApkNode, newMuleNode, ...prev]);
      setConstellationLinks(prev => [
        { source: newApkNode.id, target: 'vic-1', type: 'installs', weight: 1.0 },
        { source: 'vic-1', target: newMuleNode.id, type: 'steals_from', weight: 0.95 },
        ...prev
      ]);

      // Add a dynamic investigation card as well
      const newInvCard: InvestigationCard = {
        id: `inv-temp-${Date.now()}`,
        title: `Scan Success: ${fileName}`,
        time: new Date().toLocaleTimeString(),
        category: 'malware',
        description: generatedDetails.explainableReport,
        status: 'CRITICAL',
        payload: {
          'Identified Package': generatedDetails.packageName,
          'Risk Classification': 'High Severity Banking Trojan',
          'Associated Accounts found': generatedDetails.muleAccounts.map(m => m.name).join(', '),
          'Entropy Rating': generatedDetails.entropy.toFixed(2)
        }
      };

      setInvestigationCards(prev => [newInvCard, ...prev]);
      
      // Update risk rings
      setRiskRings({
        malware: generatedRisk,
        fraud: Math.min(100, Math.floor(generatedRisk * 0.9)),
        network: Math.min(100, Math.floor(generatedRisk * 0.85)),
        system: Math.min(100, Math.floor(generatedRisk * 0.75))
      });
      
    }, 4500); // realistic scanning simulation duration (4.5s)
  }, []);

  // Autonomous mode Easter-Egg. Mutate data dynamically over time!
  const triggerAutonomousMode = useCallback(() => {
    setAutonomousThinking(prev => {
      const nextState = !prev;
      if (nextState) {
        setIsPlayingScenarios(true);
      } else {
        setIsPlayingScenarios(false);
      }
      return nextState;
    });
  }, []);

  const triggerManualDeception = useCallback((responseMsg: string) => {
    setIsEngaging(true);
    setTimeout(() => {
      const newDeception = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        response: responseMsg,
        analysis: "Autonomous Agent deployed custom security mitigation bypass lock to target node.",
        mutation: `MITIGATION_APPLIED_${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase()}`
      };
      setDeceptionLogs(prev => [newDeception, ...prev].slice(0, 50));
      setThreatLevel(prev => Math.max(10, prev - 12));
      setIsEngaging(false);
    }, 1000);
  }, []);

  // Background stream simulator (maintaining existing log streams)
  useEffect(() => {
    const interval = setInterval(() => {
      const actionTextList = [
        'Attempting APK root access mimic',
        'Intercepting SMS packet to +91-XXX-XXXX-99',
        'Payload injection via Jamtara malware relay',
        'Websocket established for remote VNC session',
        'Intercepting OTP broadcast intent',
        'Initiating unauthorized UPI transfer Rs. 20,000',
        'Mule centralized inflow triggered',
        'Blind balance check probe on HDFC UPI registry',
        'New APK family footprint match'
      ];
      const actionText = actionTextList[Math.floor(Math.random() * actionTextList.length)];
      const layerOptions = ['APK_STATIC', 'APK_DYNAMIC', 'MULE_DETECTION', 'FRAUD_NETWORK'];
      const currentLayer = layerOptions[Math.floor(Math.random() * layerOptions.length)];
      
      const now = Date.now();
      const timing = (now - lastActionTime.current) / 1000;
      lastActionTime.current = now;

      const currentActions = [actionText, ...attackerLogs.map(l => l.action)].slice(0, 20);
      const entropyValue = calculateEntropy(currentActions);

      const fakeAction = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        layer: currentLayer,
        action: actionText,
        maliciousness: 70 + Math.floor(Math.random() * 30),
        entropy: Number(entropyValue.toFixed(2)),
        timing
      };

      setAttackerLogs(prev => [fakeAction, ...prev].slice(0, 50));

      // Dynamic Multi-Factor Risk Scoring Engine (incorporates entropy rate, active attacks density, scenario triggers & mitigator adjustments)
      setThreatLevel(prev => {
        const baseRisk = 48; // Baseline vulnerability exposure
        const dynamicEntropy = Number((1.5 + Math.random() * 3).toFixed(2));
        const attackDensity = Math.min(22, (attackerLogs.length || 1) * 0.75);
        const scenarioFactor = isPlayingScenarios ? 15 : 0;
        
        // Dynamic feedback deduction: each active deception honeypot counter-measure triggers mitigation
        const responseDeduction = Math.min(25, deceptionCountRef.current * 3.5);
        
        const calculatedThreat = Math.floor(baseRisk + (dynamicEntropy * 4.5) + attackDensity + scenarioFactor - responseDeduction);
        const finalThreat = Math.max(15, Math.min(100, calculatedThreat));
        return finalThreat;
      });

      setConfusionIndex(prev => {
        const drift = Math.floor(Math.random() * 6 - 2);
        return Math.max(30, Math.min(100, prev + drift));
      });

      // Update metrics
      setMetrics(prev => ({
        ...prev,
        entropyRate: Number((1.5 + Math.random() * 3).toFixed(2)),
        dnaSync: Math.max(0.8, Math.min(1.0, prev.dnaSync + (Math.random() * 0.04 - 0.02))),
        adversaryACI: Number((0.75 + Math.random() * 0.22).toFixed(2)),
        engagementScore: Math.max(60, Math.min(100, prev.engagementScore + Math.floor(Math.random() * 4 - 2)))
      }));

      // In Autonomous mode, trigger live genome mutations periodically!
      if (isPlayingScenarios || Math.random() > 0.8) {
        setDigitalDNA(prev => {
          const nextVal = `0x${Math.floor(Math.random() * 256).toString(16).toUpperCase()}`;
          return [...prev, nextVal].slice(-8);
        });

        // Mutate Digital DNA Core State
        setDigitalGenome(prev => {
          const currentTimestamp = new Date().toLocaleTimeString();
          const mutatedDnaSeq = `${prev.dnaSequence}:${Math.floor(Math.random() * 256).toString(16).toUpperCase()}`.split(':').slice(-7).join(':');
          const mutationOptions = [
            'Obfuscated payload loaded dynamically',
            'C2 Host signature mutated: rotated routing IPs',
            'UPI transaction redirection target updated to Raipur Co-op Mule',
            'Accessibility features re-routed via Android intent overlay',
            'Fake Bank Portal splash layout swapped: mimicking state central SBI bank'
          ];
          const behaviors = [mutationOptions[Math.floor(Math.random() * mutationOptions.length)], ...prev.networkBehavior].slice(0, 3);
          
          return {
            ...prev,
            entropy: Number((prev.entropy + (Math.random() * 0.4 - 0.2)).toFixed(2)),
            timestamp: currentTimestamp,
            dnaSequence: mutatedDnaSeq,
            networkBehavior: behaviors
          };
        });

        // Constellation nodes update: add an alert on them randomly
        setConstellationNodes(prev => prev.map(node => {
          if (Math.random() > 0.75) {
            return {
              ...node,
              riskScore: Math.min(100, Math.max(40, node.riskScore + Math.floor(Math.random() * 6 - 3)))
            };
          }
          return node;
        }));

        // Rotate risk core rings coupled to the dynamic multi-factor calculations
        setRiskRings(prev => {
          // Coupled calculations
          const malwareVal = Math.min(100, Math.max(15, Math.floor(prev.malware * 0.4 + (prev.malware > 75 ? 55 : 35) + Math.random() * 6 - 3)));
          const fraudVal = Math.min(100, Math.max(15, Math.floor(prev.fraud * 0.5 + (prev.fraud > 70 ? 45 : 30) + Math.random() * 6 - 3)));
          const networkVal = Math.min(100, Math.max(15, Math.floor(prev.network * 0.45 + (prev.network > 60 ? 40 : 25) + Math.random() * 6 - 3)));
          const systemVal = Math.min(100, Math.max(10, Math.floor((100 - confusionIndexRef.current) * 0.85 + Math.random() * 6 - 3)));
          return {
            malware: malwareVal,
            fraud: fraudVal,
            network: networkVal,
            system: systemVal
          };
        });
      }

      // Generate simulated honeypot deceptions dynamically to mitigate threat
      if (fakeAction.maliciousness > 80 && Math.random() > 0.5) {
        setIsEngaging(true);
        setTimeout(() => {
          const fakeDeceptionAnswers = [
            'Simulating synthetic Bank accounts on targeted remote device context to defuse credential thief accessibility loops.',
            'Injecting random UPI transaction timing jitter to derail automated Jamtara bulk fund exfiltration.',
            'Triggering virtual OTP response pattern inside device sandbox to fully identify malicious API receiver addresses.',
            'Rotated sandbox fake transaction state machine. Current state simulated with Rs. 10 Lakh test account.',
            'Isolated C2 communication port redirecting traffic requests to internal network analyzer Honeypot.'
          ];
          const deceptiveResponse = fakeDeceptionAnswers[Math.floor(Math.random() * fakeDeceptionAnswers.length)];
          const analysisTextOptions = [
            'Mitigation deployed: Credential theft sandboxed successfully.',
            'Mule centralized network detected: Account registered for blacklisting.',
            'Dynamic VNC receiver blocked inside secure local emulator interface.',
            'Fake OTP proxy payload successfully intercepted and identified.'
          ];
          const customDeception = {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toLocaleTimeString(),
            response: deceptiveResponse,
            analysis: analysisTextOptions[Math.floor(Math.random() * analysisTextOptions.length)],
            mutation: `DNA_MUT_${Math.floor(Math.random() * 0xFFF).toString(16).toUpperCase()}`
          };

          setDeceptionLogs(prev => [customDeception, ...prev].slice(0, 50));
          setIsEngaging(false);
          // Decrease threat slightly
          setThreatLevel(prev => Math.max(15, prev - 10));
        }, 1200);
      }

    }, isPlayingScenarios ? 1500 : 3000); // 1.5s interval in Autonomous "Thinking Mode"!

    return () => clearInterval(interval);
  }, [attackerLogs, isPlayingScenarios]);

  return {
    threatLevel,
    confusionIndex,
    attackerLogs,
    deceptionLogs,
    isEngaging,
    digitalDNA,
    metrics,
    
    // FINOME Enhanced States
    constellationNodes,
    constellationLinks,
    selectedConstellationNode,
    setSelectedConstellationNode,
    digitalGenome,
    forecastBranches,
    selectedForecastBranch,
    setSelectedForecastBranch,
    investigationCards,
    setInvestigationCards,
    activeInvestigationStage,
    setActiveInvestigationStage,
    riskRings,
    uploadedApkStatus,
    setUploadedApkStatus,
    uploadedApkDetails,
    startApkScan,
    isPlayingScenarios,
    autonomousThinking,
    triggerAutonomousMode,
    triggerManualDeception
  };
};
