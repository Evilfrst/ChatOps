import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Terminal, 
  Activity, 
  Cpu, 
  Database, 
  Server, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  LayoutDashboard,
  MessageSquare,
  Settings,
  ChevronRight,
  Search,
  Command,
  History,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { Message, DevOpsState } from './types';

// Initialize Gemini AI
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your DevOps Assistant. How can I help you with your infrastructure today? You can try commands like /status, /deploy, or /logs.",
      timestamp: Date.now(),
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard' | 'monitoring' | 'security'>('chat');
  const [showSecurityReport, setShowSecurityReport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [devOpsState, setDevOpsState] = useState<DevOpsState>({
    status: 'healthy',
    uptime: '15d 4h 22m',
    deployments: 124,
    lastDeployment: '2h ago',
    cpuUsage: 42,
    memoryUsage: 68
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate dynamic metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setDevOpsState(prev => ({
        ...prev,
        cpuUsage: Math.min(100, Math.max(0, prev.cpuUsage + (Math.random() * 10 - 5))),
        memoryUsage: Math.min(100, Math.max(0, prev.memoryUsage + (Math.random() * 4 - 2)))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCommand = (command: string) => {
    const cmd = command.toLowerCase().trim();
    let response = '';
    let type: Message['type'] = 'status';

    switch (cmd) {
      case '/status':
        response = `Current System Status: ${devOpsState.status.toUpperCase()}\nCPU: ${devOpsState.cpuUsage.toFixed(1)}%\nMemory: ${devOpsState.memoryUsage.toFixed(1)}%\nUptime: ${devOpsState.uptime}\nAll services are operational.`;
        break;
      case '/deploy':
        response = 'Initiating deployment pipeline for production environment... [v1.4.2]\nChecking artifacts...\nRunning tests...\nDeploying to Kubernetes cluster...';
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now().toString() + '-deploy',
            role: 'assistant',
            content: 'Deployment successful! Production is now running v1.4.2.',
            timestamp: Date.now(),
            type: 'status'
          }]);
          setDevOpsState(prev => ({ ...prev, deployments: prev.deployments + 1, lastDeployment: 'Just now' }));
        }, 2000);
        break;
      case '/logs':
        response = 'Fetching latest logs from production-api-v1...\n[INFO] 13:04:02 - Request processed successfully\n[INFO] 13:04:05 - Cache hit for key: user_profile_42\n[DEBUG] 13:04:10 - Database connection pool check: OK';
        break;
      case '/rollback':
        response = 'Rollback initiated. Reverting to previous stable version (v1.4.1)...';
        break;
      default:
        return false;
    }

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
      type
    }]);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      type: input.startsWith('/') ? 'command' : 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    if (input.startsWith('/')) {
      if (handleCommand(input)) return;
    }

    setIsTyping(true);

    try {
      const model = 'gemini-3-flash-preview';
      const response = await genAI.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [{ text: `You are a DevOps expert chatbot. The user says: ${input}. Provide a helpful, technical, and concise response. If they ask about infrastructure, mention best practices like CI/CD, monitoring, or security.` }]
          }
        ],
        config: {
          systemInstruction: "You are a professional DevOps Assistant. You help users manage their infrastructure, explain technical concepts, and provide ChatOps commands. Keep responses concise and use technical terminology correctly."
        }
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || "I'm sorry, I couldn't process that request.",
        timestamp: Date.now(),
        type: 'text'
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error calling Gemini:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to my brain right now. Please try again later.",
        timestamp: Date.now(),
        type: 'error'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0c] text-gray-200 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111114] border-r border-gray-800 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-gray-800">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight">ChatOps AI</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">DevOps Platform</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'hover:bg-gray-800 text-gray-400'}`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Chat Assistant</span>
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'hover:bg-gray-800 text-gray-400'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Infrastructure</span>
          </button>
          <div className="pt-4 pb-2 px-4 text-[10px] text-gray-600 uppercase font-bold tracking-widest">System</div>
          <button 
            onClick={() => setActiveTab('monitoring')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'monitoring' ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'hover:bg-gray-800 text-gray-400'}`}
          >
            <Activity className="w-5 h-5" />
            <span className="font-medium">Monitoring</span>
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'security' ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'hover:bg-gray-800 text-gray-400'}`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="font-medium">Security</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="bg-[#1a1a1e] rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">System Load</span>
              <span className="text-xs text-blue-400 font-mono">Normal</span>
            </div>
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-blue-500"
                animate={{ width: `${devOpsState.cpuUsage}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-gray-800 bg-[#0a0a0c]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="md:hidden bg-blue-600 p-1.5 rounded-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-semibold text-white">
              {activeTab === 'chat' ? 'DevOps ChatBot' : 
               activeTab === 'dashboard' ? 'Infrastructure Dashboard' :
               activeTab === 'monitoring' ? 'System Monitoring' : 'Security Audit'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1e] border border-gray-800 rounded-full">
              <div className={`w-2 h-2 rounded-full ${devOpsState.status === 'healthy' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-yellow-500'}`} />
              <span className="text-xs font-medium text-gray-300">Production</span>
            </div>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <AnimatePresence mode="wait">
            {activeTab === 'chat' ? (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                        msg.role === 'user' ? 'bg-blue-600' : 
                        msg.type === 'status' ? 'bg-green-600/20 border border-green-500/30' :
                        msg.type === 'error' ? 'bg-red-600/20 border border-red-500/30' :
                        'bg-gray-800 border border-gray-700'
                      }`}>
                        {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-blue-400" />}
                      </div>
                      <div className={`space-y-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          msg.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : msg.type === 'status'
                            ? 'bg-green-900/10 text-green-300 border border-green-800/30 rounded-tl-none font-mono'
                            : msg.type === 'error'
                            ? 'bg-red-900/10 text-red-300 border border-red-800/30 rounded-tl-none'
                            : 'bg-[#1a1a1e] text-gray-300 border border-gray-800 rounded-tl-none'
                        }`}>
                          {msg.content.split('\n').map((line, i) => (
                            <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-600 font-medium px-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="bg-[#1a1a1e] px-5 py-3 rounded-2xl border border-gray-800 flex gap-1 items-center">
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </motion.div>
            ) : activeTab === 'dashboard' ? (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-6xl mx-auto space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'CPU Usage', value: `${devOpsState.cpuUsage.toFixed(1)}%`, icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Memory', value: `${devOpsState.memoryUsage.toFixed(1)}%`, icon: Database, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                    { label: 'Deployments', value: devOpsState.deployments, icon: RefreshCw, color: 'text-green-400', bg: 'bg-green-500/10' },
                    { label: 'Uptime', value: devOpsState.uptime, icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-[#111114] border border-gray-800 p-6 rounded-2xl hover:border-gray-700 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`${stat.bg} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                          <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-700" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                      <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
                    </div>
                  ))}
                </div>

                {/* Main Dashboard Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Service Status */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#111114] border border-gray-800 rounded-3xl overflow-hidden">
                      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                        <h3 className="font-bold text-white flex items-center gap-2">
                          <Server className="w-5 h-5 text-blue-400" />
                          Cluster Services
                        </h3>
                        <span className="text-xs text-gray-500">12 Nodes Active</span>
                      </div>
                      <div className="p-6 space-y-4">
                        {[
                          { name: 'API Gateway', status: 'Healthy', load: 24, latency: '12ms' },
                          { name: 'Auth Service', status: 'Healthy', load: 15, latency: '8ms' },
                          { name: 'User Database', status: 'Healthy', load: 45, latency: '4ms' },
                          { name: 'Payment Worker', status: 'Warning', load: 88, latency: '142ms' },
                        ].map((service, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-[#1a1a1e] rounded-2xl border border-gray-800/50">
                            <div className="flex items-center gap-4">
                              <div className={`w-2 h-2 rounded-full ${service.status === 'Healthy' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                              <div>
                                <h4 className="text-sm font-semibold text-gray-200">{service.name}</h4>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{service.status}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-8">
                              <div className="text-right">
                                <p className="text-[10px] text-gray-600 uppercase font-bold">Load</p>
                                <p className="text-xs font-mono text-gray-300">{service.load}%</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-gray-600 uppercase font-bold">Latency</p>
                                <p className="text-xs font-mono text-gray-300">{service.latency}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Info */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-xl shadow-blue-900/20">
                      <ShieldCheck className="w-10 h-10 mb-4 opacity-80" />
                      <h3 className="text-xl font-bold mb-2">Security Audit</h3>
                      <p className="text-blue-100 text-sm mb-6 leading-relaxed">Your infrastructure passed the last 24 security checks with zero vulnerabilities found.</p>
                      <button 
                        onClick={() => setShowSecurityReport(true)}
                        className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-sm font-bold transition-all"
                      >
                        View Report
                      </button>
                    </div>

                    <div className="bg-[#111114] border border-gray-800 rounded-3xl p-6">
                      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <History className="w-5 h-5 text-orange-400" />
                        Recent Events
                      </h3>
                      <div className="space-y-4">
                        {[
                          { event: 'Deployment v1.4.2', time: '2h ago', type: 'success' },
                          { event: 'Auto-scale Triggered', time: '4h ago', type: 'info' },
                          { event: 'Backup Completed', time: '12h ago', type: 'success' },
                        ].map((e, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${e.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`} />
                            <div>
                              <p className="text-xs text-gray-300 font-medium">{e.event}</p>
                              <p className="text-[10px] text-gray-600">{e.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'monitoring' ? (
              <motion.div 
                key="monitoring"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-6xl mx-auto space-y-8"
              >
                <div className="bg-[#111114] border border-gray-800 rounded-3xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <Activity className="w-6 h-6 text-blue-400" />
                    Real-time System Monitoring
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="p-6 bg-[#1a1a1e] rounded-2xl border border-gray-800">
                        <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">CPU Load Distribution</h4>
                        <div className="space-y-4">
                          {[
                            { core: 'Core 0', load: 45 },
                            { core: 'Core 1', load: 32 },
                            { core: 'Core 2', load: 58 },
                            { core: 'Core 3', load: 21 },
                          ].map((c, i) => (
                            <div key={i} className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">{c.core}</span>
                                <span className="text-blue-400 font-mono">{c.load}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${c.load}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="p-6 bg-[#1a1a1e] rounded-2xl border border-gray-800">
                        <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Network Traffic</h4>
                        <div className="flex items-end gap-2 h-32">
                          {[40, 65, 30, 85, 45, 70, 55, 90, 60, 75].map((h, i) => (
                            <motion.div 
                              key={i}
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              className="flex-1 bg-blue-600/40 rounded-t-sm"
                            />
                          ))}
                        </div>
                        <div className="flex justify-between mt-4 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                          <span>Inbound: 1.2 GB/s</span>
                          <span>Outbound: 450 MB/s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-6xl mx-auto space-y-8"
              >
                <div className="bg-[#111114] border border-gray-800 rounded-3xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-green-400" />
                    Security Compliance & Audit
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                      <div className="p-6 bg-[#1a1a1e] rounded-2xl border border-gray-800">
                        <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Active Security Policies</h4>
                        <div className="space-y-3">
                          {[
                            { name: 'RBAC Enforcement', status: 'Active', desc: 'Role-based access control is strictly enforced across all nodes.' },
                            { name: 'TLS 1.3 Encryption', status: 'Active', desc: 'All data in transit is encrypted using TLS 1.3 protocols.' },
                            { name: 'Intrusion Detection', status: 'Active', desc: 'Real-time monitoring for suspicious network patterns.' },
                            { name: 'Vulnerability Scanner', status: 'Scheduled', desc: 'Next full scan scheduled for 02:00 UTC.' },
                          ].map((p, i) => (
                            <div key={i} className="p-4 bg-[#111114] rounded-xl border border-gray-800/50 flex items-start gap-4">
                              <div className={`mt-1 w-2 h-2 rounded-full ${p.status === 'Active' ? 'bg-green-500' : 'bg-blue-500'}`} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="text-sm font-semibold text-gray-200">{p.name}</h5>
                                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded uppercase font-bold">{p.status}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{p.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="p-6 bg-gradient-to-br from-green-600/20 to-green-900/20 rounded-2xl border border-green-500/20">
                        <div className="flex items-center gap-3 mb-4">
                          <ShieldCheck className="w-6 h-6 text-green-400" />
                          <span className="text-lg font-bold text-white">98/100</span>
                        </div>
                        <p className="text-xs text-green-200/70 leading-relaxed">Your overall security score is excellent. No critical vulnerabilities detected in the last 7 days.</p>
                      </div>
                      <div className="p-6 bg-[#1a1a1e] rounded-2xl border border-gray-800">
                        <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Recent Alerts</h4>
                        <div className="space-y-4">
                          <div className="flex gap-3">
                            <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-300 font-medium">Failed Login Attempt</p>
                              <p className="text-[10px] text-gray-600">IP: 192.168.1.45 • 12m ago</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-300 font-medium">Policy Update</p>
                              <p className="text-[10px] text-gray-600">Admin: evraddsoh • 1h ago</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area (Only for Chat) */}
        {activeTab === 'chat' && (
          <div className="p-6 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c] to-transparent">
            <form 
              onSubmit={handleSubmit}
              className="max-w-4xl mx-auto relative group"
            >
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Terminal className="w-5 h-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything or type a command (/status, /deploy)..."
                className="w-full bg-[#1a1a1e] border border-gray-800 text-gray-200 text-sm rounded-2xl py-4 pl-14 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all shadow-2xl"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-xl transition-all shadow-lg shadow-blue-900/20"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
            <p className="text-center text-[10px] text-gray-600 mt-3 font-medium uppercase tracking-widest">
              Powered by Google Gemini AI • DevOps Intelligence
            </p>
          </div>
        )}
      </main>

      {/* Security Report Modal */}
      <AnimatePresence>
        {showSecurityReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSecurityReport(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#111114] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-transparent">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">Security Audit Report</h3>
                </div>
                <button 
                  onClick={() => setShowSecurityReport(false)}
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#1a1a1e] rounded-2xl border border-gray-800">
                    <p className="text-[10px] text-gray-600 uppercase font-bold mb-1">Scan Date</p>
                    <p className="text-sm text-gray-200 font-mono">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="p-4 bg-[#1a1a1e] rounded-2xl border border-gray-800">
                    <p className="text-[10px] text-gray-600 uppercase font-bold mb-1">Status</p>
                    <p className="text-sm text-green-400 font-bold">COMPLIANT</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Detailed Findings</h4>
                  {[
                    { category: 'Network Security', score: '100/100', status: 'Pass', details: 'All ingress/egress rules are properly scoped. No open ports detected outside of 80/443.' },
                    { category: 'Identity & Access', score: '95/100', status: 'Pass', details: 'MFA is enabled for 98% of users. 2 accounts flagged for password rotation.' },
                    { category: 'Data Protection', score: '100/100', status: 'Pass', details: 'At-rest encryption verified for all S3 buckets and RDS instances.' },
                    { category: 'Vulnerability Mgmt', score: '92/100', status: 'Warning', details: '3 low-severity CVEs detected in legacy microservices. Patching scheduled.' },
                  ].map((item, i) => (
                    <div key={i} className="p-5 bg-[#1a1a1e] rounded-2xl border border-gray-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-200">{item.category}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${item.status === 'Pass' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                          {item.score}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.details}</p>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-blue-600/5 border border-blue-600/20 rounded-2xl">
                  <h4 className="text-sm font-bold text-blue-400 mb-2">Recommendations</h4>
                  <ul className="text-xs text-gray-400 space-y-2 list-disc pl-4">
                    <li>Rotate credentials for service accounts older than 90 days.</li>
                    <li>Update Node.js runtime for 'auth-service' to v20.x.</li>
                    <li>Enable VPC Flow Logs for the staging environment.</li>
                  </ul>
                </div>
              </div>
              <div className="p-6 border-t border-gray-800 bg-[#0a0a0c] flex justify-end">
                <button 
                  onClick={() => setShowSecurityReport(false)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20"
                >
                  Close Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#111114] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">System Settings</h3>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-8 space-y-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest">General Preferences</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-200">Real-time Notifications</p>
                        <p className="text-xs text-gray-500">Receive alerts for deployment status</p>
                      </div>
                      <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-200">Auto-refresh Dashboard</p>
                        <p className="text-xs text-gray-500">Update metrics every 3 seconds</p>
                      </div>
                      <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest">API Configuration</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-[#1a1a1e] rounded-xl border border-gray-800">
                      <p className="text-[10px] text-gray-600 uppercase font-bold mb-2">Gemini Model</p>
                      <div className="flex items-center justify-between text-sm text-gray-300">
                        <span>gemini-3-flash-preview</span>
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                    <div className="p-4 bg-[#1a1a1e] rounded-xl border border-gray-800">
                      <p className="text-[10px] text-gray-600 uppercase font-bold mb-2">Infrastructure Endpoint</p>
                      <div className="flex items-center justify-between text-sm text-gray-300">
                        <span className="font-mono">https://api.devops.cluster</span>
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20"
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="flex-1 py-3 bg-[#1a1a1e] hover:bg-gray-800 text-gray-400 text-sm font-bold rounded-xl border border-gray-800 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
