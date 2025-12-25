
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { NeuralNode, ChatMessage, VisionReport, CommerceNegotiation, BioSyncAppointment, EvolutionMatrixOptimization, SystemTelemetry, User, GroundingSource, SocialPresence, ResumeData } from './types';
import { NODES } from './constants';
import { processPrompt, detectNode, PromptPart, generateNeuralAsset } from './services/geminiService';
import NodeIndicator from './components/NodeIndicator';
import LiveAudioSession from './components/LiveAudioSession';

// --- Sub-components (Cards) ---
const ResumeCard: React.FC<{ resume: ResumeData }> = ({ resume }) => (
  <div className="w-full bg-white text-slate-900 rounded-xl p-8 shadow-2xl font-serif mt-4 border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="border-b-2 border-slate-900 pb-4 mb-6">
      <h2 className="text-2xl font-bold uppercase tracking-tighter">{resume.header.name}</h2>
      <p className="text-sm font-semibold text-slate-600">{resume.header.title}</p>
      <p className="text-[10px] text-slate-500 mt-1 italic">{resume.header.contact}</p>
    </div>
    <div className="mb-6">
      <h3 className="text-xs font-bold uppercase border-b border-slate-300 mb-2">Professional Summary</h3>
      <p className="text-xs leading-relaxed">{resume.summary}</p>
    </div>
    <div className="mb-6">
      <h3 className="text-xs font-bold uppercase border-b border-slate-300 mb-2">Neural Experience History</h3>
      {resume.experience.map((exp, i) => (
        <div key={i} className="mb-4 last:mb-0">
          <div className="flex justify-between items-baseline">
            <h4 className="text-xs font-bold">{exp.role} @ {exp.company}</h4>
            <span className="text-[10px] text-slate-500 font-bold">{exp.period}</span>
          </div>
          <ul className="list-disc list-inside mt-1 space-y-0.5">
            {exp.bullets.map((b, j) => <li key={j} className="text-[10px] text-slate-700">{b}</li>)}
          </ul>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-2 gap-8">
      <div>
        <h3 className="text-xs font-bold uppercase border-b border-slate-300 mb-2">Protocol Stack (Skills)</h3>
        <div className="flex flex-wrap gap-1">
          {resume.skills.map((s, i) => <span key={i} className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded-sm font-medium">{s}</span>)}
        </div>
      </div>
      <div>
        <h3 className="text-xs font-bold uppercase border-b border-slate-300 mb-2">Synthesis (Education)</h3>
        {resume.education.map((e, i) => <p key={i} className="text-[9px] text-slate-700 mb-1 leading-tight">{e}</p>)}
      </div>
    </div>
    <button className="mt-8 w-full py-2 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
      Export Neural PDF
    </button>
  </div>
);

const SocialPresenceWidget: React.FC<{ links: SocialPresence[] }> = ({ links }) => (
  <div className="grid grid-cols-1 gap-2 mb-4">
    {links.map((link, idx) => (
      <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-amber-500/30 transition-all group">
        <div className="flex items-center gap-3">
          <span className="text-lg opacity-80 group-hover:scale-110 transition-transform">
            {link.platform === 'LinkedIn' ? '💼' : link.platform === 'X' ? '𝕏' : '📸'}
          </span>
          <div>
            <p className="text-[10px] font-orbitron font-bold text-white uppercase">{link.platform}</p>
            <p className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">Impact: {link.reach_estimate}</p>
          </div>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${link.status === 'connected' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'}`}>
          {link.status}
        </div>
      </div>
    ))}
  </div>
);

const VisionReportCard: React.FC<{ report: VisionReport }> = ({ report }) => (
  <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-6 mt-4 backdrop-blur-md">
    <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
      <h3 className="text-xs font-orbitron font-black text-cyan-400 uppercase tracking-[0.2em]">Sensor Scan Report</h3>
      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
        report.stock_status === 'CRITICAL' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-black'
      }`}>{report.stock_status}</span>
    </div>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="p-3 bg-black/40 rounded-lg border border-slate-800">
        <p className="text-[8px] text-slate-500 font-bold uppercase">Entity Count</p>
        <p className="text-xl font-orbitron font-black text-white">{report.estimated_count}</p>
      </div>
      <div className="p-3 bg-black/40 rounded-lg border border-slate-800">
        <p className="text-[8px] text-slate-500 font-bold uppercase">Safety Log</p>
        <p className={`text-[10px] font-bold ${report.anomaly_detected ? 'text-rose-500' : 'text-emerald-500'}`}>
          {report.anomaly_detected ? '⚠️ ANOMALY' : '✓ SECURE'}
        </p>
      </div>
    </div>
    <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-emerald-500 pl-3 py-1 bg-emerald-500/5">
      {report.action_required}
    </p>
  </div>
);

const PaymentModal: React.FC<{ isOpen: boolean; onClose: () => void; onPurchase: (credits: number) => void }> = ({ isOpen, onClose, onPurchase }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-[#0a0a0a] border border-slate-800 rounded-3xl p-8 relative animate-in zoom-in-95 duration-500">
        <h3 className="text-xl font-orbitron font-black text-white mb-2 uppercase tracking-widest">Neural Credits</h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase mb-8 leading-relaxed">Top-up compute units for advanced Asset Synthesis and deep reasoning protocols.</p>
        
        <div className="space-y-4 mb-8">
          {[
            { label: 'Uplink Pack', credits: 500, price: '$9.00', icon: '⚡' },
            { label: 'Neural Fleet', credits: 2500, price: '$29.00', icon: '🛸' },
            { label: 'Enterprise Core', credits: 10000, price: '$89.00', icon: '🌌' }
          ].map((pack, i) => (
            <button key={i} onClick={() => onPurchase(pack.credits)} className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between group hover:border-emerald-500/50 transition-all active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <span className="text-xl">{pack.icon}</span>
                <div className="text-left">
                  <p className="text-xs font-bold text-white uppercase">{pack.label}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">{pack.credits} Credits</p>
                </div>
              </div>
              <span className="text-sm font-black text-emerald-400">{pack.price}</span>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="w-full py-2 text-[9px] font-bold text-slate-600 hover:text-rose-400 uppercase tracking-widest transition-colors">Abort Transaction</button>
      </div>
    </div>
  );
};

// --- Authentication Portal ---
const LoginPage: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [mode, setMode] = useState<'uplink' | 'synthesis'>('uplink');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({ alias: '', email: '', key: '' });

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.alias || !formData.key) return;
    
    // Check if API key exists via standard selection first
    if (!await (window as any).aistudio.hasSelectedApiKey()) {
      await (window as any).aistudio.openSelectKey();
    }

    setIsProcessing(true);
    let current = 0;
    const interval = setInterval(() => {
      current += 4;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onLogin({
            name: formData.alias,
            email: formData.email || `${formData.alias}@flow.ai`,
            verified: true,
            credits: 100 // Starting credits
          });
        }, 300);
      }
    }, 40);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] p-6 relative overflow-hidden font-inter">
      <div className="absolute inset-0 scan-line opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-orbitron font-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500 bg-clip-text text-transparent mb-2 tracking-tighter">VYAPAR FLOW</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.6em]">Neural Interface v3.5</p>
        </div>

        <div className="bg-[#0a0a0a]/90 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
          {isProcessing && (
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-orbitron font-bold text-white mb-1 uppercase tracking-wider">Initialize Uplink</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Verify Neural Identity</p>
          </div>

          <form onSubmit={handleAction} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest ml-1">Entity Alias</label>
              <input 
                type="text" value={formData.alias} onChange={(e) => setFormData({...formData, alias: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
                placeholder="Ex: NEXUS-1"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest ml-1">Security Key</label>
              <input 
                type="password" value={formData.key} onChange={(e) => setFormData({...formData, key: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit" disabled={isProcessing}
              className="w-full py-5 rounded-2xl bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 font-orbitron font-bold text-xs uppercase tracking-[0.3em] hover:bg-emerald-500 hover:text-white transition-all shadow-xl shadow-emerald-900/10 active:scale-[0.98]"
            >
              Uplink Identity
            </button>
          </form>
          
          <div className="mt-8 flex items-center gap-4">
             <div className="h-[1px] flex-1 bg-slate-800" />
             <span className="text-[8px] text-slate-600 font-bold uppercase">or connect via</span>
             <div className="h-[1px] flex-1 bg-slate-800" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
             <button className="flex items-center justify-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all grayscale hover:grayscale-0">
                <img src="https://www.gstatic.com/images/branding/product/1x/gmail_512dp.png" alt="Google" className="w-5 h-5" />
                <span className="text-[9px] font-bold uppercase">Google</span>
             </button>
             <button className="flex items-center justify-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all opacity-50">
                <span className="text-sm">🏢</span>
                <span className="text-[9px] font-bold uppercase">LDAP</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [activeNode, setActiveNode] = useState<NeuralNode>(NeuralNode.CORE);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [deepThinking, setDeepThinking] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{ mimeType: string, data: string, preview: string } | null>(null);

  const activeNodeInfo = NODES.find(n => n.id === activeNode) || NODES[0];
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setMessages([{
        role: 'model',
        content: `Neural connection established. All systems nominal. Compute credits at ${user.credits} units. Protocol Standing By.`,
        node: NeuralNode.CORE,
        timestamp: new Date()
      }]);
    }
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handlePurchase = (credits: number) => {
    if (user) {
      setUser({ ...user, credits: user.credits + credits });
      setIsPaymentOpen(false);
      setMessages(prev => [...prev, {
        role: 'model',
        content: `CREDIT_UPLINK_SUCCESS: ${credits} compute units added to neural profile. Current balance: ${user.credits + credits}.`,
        node: NeuralNode.CORE,
        timestamp: new Date()
      }]);
    }
  };

  const handleSendMessage = async (text?: string, forceType?: 'image' | 'video') => {
    const messageText = text || inputValue;
    if (!messageText.trim() && !selectedImage && !forceType) return;
    if (isLoading) return;

    // Credit logic
    const creditCost = forceType === 'video' ? 50 : forceType === 'image' ? 10 : 0;
    if (user && user.credits < creditCost) {
      setIsPaymentOpen(true);
      return;
    }

    const newNode = selectedImage ? NeuralNode.VISION : detectNode(messageText);
    setActiveNode(newNode);

    setMessages(prev => [...prev, {
      role: 'user',
      content: forceType ? `[Generate Neural ${forceType.toUpperCase()}] ${messageText}` : messageText || "[Sensor Uplink Initialized]",
      node: newNode,
      timestamp: new Date()
    }]);
    setInputValue('');
    setIsLoading(true);

    try {
      if (forceType) {
        const assetUrl = await generateNeuralAsset(messageText, forceType);
        if (user) setUser({ ...user, credits: user.credits - creditCost });
        setMessages(prev => [...prev, {
          role: 'model', content: assetUrl, node: NeuralNode.VISION, isImage: forceType === 'image', isVideo: forceType === 'video', timestamp: new Date()
        }]);
      } else {
        const history = messages.map(m => ({ role: m.role, parts: [{ text: m.content }] as PromptPart[] }));
        const forceJsonNode = [NeuralNode.VISION, NeuralNode.COMMERCE, NeuralNode.BIO_SYNC, NeuralNode.EVOLUTION, NeuralNode.TELEMETRY].includes(newNode) ? newNode : undefined;

        const response = await processPrompt(messageText || "Scan sensors.", history, selectedImage ? { mimeType: selectedImage.mimeType, data: selectedImage.data } : undefined, forceJsonNode, true);
        
        let metadata: any = {};
        let displayContent = response.text;

        if (forceJsonNode) {
          try {
            const parsed = JSON.parse(response.text);
            if (newNode === NeuralNode.VISION) metadata.vision_report = parsed;
            if (newNode === NeuralNode.COMMERCE) {
              metadata.commerce_negotiation = parsed;
              metadata.social_links = [
                { platform: 'LinkedIn', status: 'connected', reach_estimate: '12.4k B2B' },
                { platform: 'X', status: 'connected', reach_estimate: '3.1k Viral' },
                { platform: 'Instagram', status: 'disconnected', reach_estimate: '0.0k Visual' }
              ];
            }
            if (newNode === NeuralNode.EVOLUTION) metadata.evolution_matrix = parsed;
            if (newNode === NeuralNode.TELEMETRY) metadata.system_telemetry = parsed;
            displayContent = ""; 
          } catch (e) { displayContent = response.text; }
        }

        setMessages(prev => [...prev, {
          role: 'model', content: displayContent, node: newNode, timestamp: new Date(), groundingSources: response.sources, metadata
        }]);
      }
    } catch (e: any) {
      if (e?.message?.includes("Requested entity was not found")) await (window as any).aistudio.openSelectKey();
      setMessages(prev => [...prev, {
        role: 'model', content: "CRITICAL FAILURE: Neural protocol interrupted.", node: NeuralNode.CORE, timestamp: new Date()
      }]);
    } finally {
      setSelectedImage(null);
      setIsLoading(false);
    }
  };

  if (!user) return <LoginPage onLogin={setUser} />;

  return (
    <div className="flex h-screen w-full bg-[#050505] text-white selection:bg-emerald-500/30 overflow-hidden relative font-inter">
      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} onPurchase={handlePurchase} />
      <div className="scan-line pointer-events-none opacity-10" />
      
      {/* Sidebar */}
      <aside className="hidden lg:flex w-80 border-r border-slate-800/50 flex-col bg-[#070707] z-10">
        <div className="p-8 border-b border-slate-800/50">
          <h1 className="text-3xl font-orbitron font-black bg-gradient-to-br from-emerald-400 via-cyan-400 to-indigo-500 bg-clip-text text-transparent tracking-tighter">VYAPAR FLOW</h1>
          <p className="text-[10px] text-slate-500 tracking-[0.5em] font-bold mt-2 uppercase">Core Interface</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          <p className="text-[9px] font-orbitron font-bold text-slate-600 uppercase tracking-widest mb-4">Neural Nodes</p>
          {NODES.map(node => (
            <button
              key={node.id}
              onClick={() => setActiveNode(node.id as NeuralNode)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${activeNode === node.id ? 'bg-slate-800/40 border-slate-700/50 translate-x-1' : 'bg-transparent border-transparent hover:bg-slate-800/20'}`}
            >
              <span className="text-2xl" style={{ color: activeNode === node.id ? node.accent : '#475569' }}>{node.icon}</span>
              <div className="text-left">
                <p className={`text-xs font-orbitron tracking-wider ${activeNode === node.id ? 'text-white font-bold' : 'text-slate-400'}`}>{node.id}</p>
              </div>
            </button>
          ))}
        </nav>

        <div className="p-6 bg-[#090909] border-t border-slate-800/50 space-y-4">
          {/* Credit Bank */}
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Compute Bank</span>
              <button onClick={() => setIsPaymentOpen(true)} className="p-1 hover:bg-emerald-500/20 rounded transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              </button>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-xl font-orbitron font-black text-white">{user.credits}</span>
              <span className="text-[8px] text-slate-600 font-bold uppercase mb-1 tracking-tighter">Units Available</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
             <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xs text-emerald-500 font-black font-orbitron uppercase">
               {user.name.substring(0, 2)}
             </div>
             <div className="flex flex-col min-w-0">
               <span className="text-xs text-white font-bold font-orbitron truncate uppercase">{user.name}</span>
               <span className="text-[9px] text-slate-600 font-bold truncate uppercase tracking-widest">Verified Entity</span>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative z-10 h-full bg-[#050505]">
        <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-8 bg-[#050505]/90 backdrop-blur-2xl">
          <NodeIndicator activeNode={activeNode} />
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 px-3 py-1.5 rounded-full">
               <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Deep Think</span>
               <button onClick={() => setDeepThinking(!deepThinking)} className={`w-8 h-4 rounded-full relative transition-colors ${deepThinking ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${deepThinking ? 'right-0.5' : 'left-0.5'}`} />
               </button>
            </div>
            
            <button onClick={() => setIsVoiceActive(true)} className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all group font-orbitron font-bold text-[10px] tracking-widest shadow-lg shadow-emerald-900/10 active:scale-95">
              INITIALIZE VOICE
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {messages.map((msg, idx) => {
            const isModel = msg.role === 'model';
            const nodeInfo = NODES.find(n => n.id === msg.node) || NODES[0];
            return (
              <div key={idx} className={`flex w-full animate-in fade-in slide-in-from-bottom-4 duration-500 ${isModel ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isModel ? 'items-start' : 'items-end'}`}>
                  <div className="flex items-center gap-3 mb-2 px-1">
                    <span className="text-[9px] font-orbitron font-black text-slate-600 uppercase tracking-widest">{isModel ? msg.node : user.name}</span>
                    <span className="text-[8px] text-slate-800 font-bold">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  
                  <div className={`p-6 rounded-3xl border-t-2 relative shadow-2xl ${
                    !isModel ? 'bg-slate-900/60 border-slate-700 text-slate-100 rounded-tr-none' : 
                    'bg-[#0a0a0a] border-slate-800 text-emerald-50/90 rounded-tl-none w-full'
                  }`} style={{ borderTopColor: isModel ? nodeInfo.accent : '#334155' }}>
                    
                    {msg.isImage ? (
                      <img src={msg.content} alt="Neural Generation" className="w-full rounded-2xl border border-slate-800 shadow-2xl" />
                    ) : msg.isVideo ? (
                      <video src={msg.content} controls className="w-full rounded-2xl border border-slate-800 shadow-2xl" />
                    ) : (
                      <>
                        {msg.metadata?.social_links && <SocialPresenceWidget links={msg.metadata.social_links} />}
                        {msg.metadata?.evolution_matrix?.resume_draft && <ResumeCard resume={msg.metadata.evolution_matrix.resume_draft} />}
                        {msg.metadata?.vision_report ? <VisionReportCard report={msg.metadata.vision_report} /> : <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium tracking-tight">{msg.content}</p>}
                        
                        {msg.groundingSources && msg.groundingSources.length > 0 && (
                          <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap gap-2">
                            <span className="w-full text-[8px] font-orbitron font-bold text-slate-700 uppercase tracking-widest mb-1">Grounding Sources</span>
                            {msg.groundingSources.map((s, i) => (
                              <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-[9px] text-cyan-400 hover:border-cyan-500/50 transition-all truncate max-w-[200px]">🌐 {s.title}</a>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {isLoading && <div className="text-[9px] font-orbitron text-emerald-500/30 animate-pulse uppercase tracking-[0.4em] ml-1">Executing Deep Protocol Chain...</div>}
        </div>

        {/* Input Controls */}
        <div className="p-8 border-t border-slate-800/50 bg-[#050505]/95">
          <div className="max-w-5xl mx-auto flex items-end gap-4">
            <div className="relative flex-1 group">
              <textarea 
                rows={1} value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                placeholder={`Uplink commands to ${activeNodeInfo.id}...`}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-[1.5rem] px-6 py-5 text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-700 custom-scrollbar resize-none"
              />
              <div className="absolute right-4 bottom-4 flex items-center gap-2">
                <input type="file" ref={fileInputRef} onChange={(e) => {
                  const f = e.target.files?.[0];
                  if(f) {
                    const r = new FileReader();
                    r.onload = () => {
                      setSelectedImage({ mimeType: f.type, data: (r.result as string).split(',')[1], preview: r.result as string });
                      setActiveNode(NeuralNode.VISION);
                    };
                    r.readAsDataURL(f);
                  }
                }} className="hidden" accept="image/*" />
                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:text-cyan-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
               <button onClick={() => handleSendMessage(inputValue, 'video')} className="p-4 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95 shadow-indigo-900/10 group relative" title="Synthesize Video (50 Credits)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
               </button>
               <button onClick={() => handleSendMessage()} disabled={isLoading} className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xl active:scale-95 shadow-emerald-900/20">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
               </button>
            </div>
          </div>
          
          {selectedImage && (
            <div className="max-w-5xl mx-auto mt-4 p-3 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <img src={selectedImage.preview} className="w-12 h-12 rounded-lg object-cover border border-slate-700" alt="Selected" />
                  <div>
                    <p className="text-[10px] font-orbitron font-bold text-white uppercase">Sensor Input Ready</p>
                    <p className="text-[8px] text-slate-500 uppercase">Awaiting analysis in Vision Node</p>
                  </div>
               </div>
               <button onClick={() => setSelectedImage(null)} className="text-slate-500 hover:text-rose-500 transition-colors px-4">Remove</button>
            </div>
          )}
        </div>
      </main>

      <LiveAudioSession isActive={isVoiceActive} onClose={() => setIsVoiceActive(false)} onTranscript={(t, r) => setMessages(prev => [...prev, {role: r, content: t, node: detectNode(t), timestamp: new Date()}])} />
    </div>
  );
};

export default App;
