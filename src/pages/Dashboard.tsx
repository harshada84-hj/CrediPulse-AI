import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { Gauge } from '../components/Gauge';
import { GoogleGenAI } from "@google/genai";
import { 
  CreditCard, 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  ChevronRight,
  RefreshCw,
  Lightbulb,
  Download,
  Sparkles
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pan, setPan] = useState('');
  const [scoreData, setScoreData] = useState<any>(null);
  const [aiExplanation, setAiExplanation] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [error, setError] = useState('');

  const generateDetailedExplanation = async (score: number, risk: string) => {
    if (!process.env.GEMINI_API_KEY) return;
    setGeneratingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a credit analyst AI. Explain why someone might have a credit score of ${score} (${risk} risk) in a professional but encouraging way. Keep it under 60 words. Speak direct to the user.`,
      });
      setAiExplanation(response.text || '');
    } catch (err) {
      console.error("Gemini Error:", err);
    } finally {
      setGeneratingAi(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const data = await api.fetch('/credit/score');
        setScoreData(data);
        if (data) {
          setAiExplanation(data.explanation);
          generateDetailedExplanation(data.score, data.risk_level);
        }
      } catch (err: any) {
        if (err.message.includes('PAN not submitted')) setScoreData(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handlePanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    try {
      await api.fetch('/credit/submit-pan', {
        method: 'POST',
        body: JSON.stringify({ pan_number: pan.toUpperCase() })
      });
      const data = await api.fetch('/credit/score');
      setScoreData(data);
      if (data) {
        setAiExplanation(data.explanation);
        generateDetailedExplanation(data.score, data.risk_level);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <AnimatePresence mode="wait">
        {!scoreData ? (
          <motion.div
            key="pan-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-xl mx-auto text-center"
          >
            <div className="bg-primary/10 w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-8 text-primary">
              <CreditCard size={40} />
            </div>
            <h1 className="text-4xl font-extrabold mb-4 font-display">Identity Verification</h1>
            <p className="text-gray-500 mb-10 text-lg">Enter your PAN card number to generate your AI credit score profile. We use focus-based simulation for scoring.</p>
            
            <form onSubmit={handlePanSubmit} className="relative max-w-sm mx-auto">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono" size={18} />
                <input
                  type="text"
                  placeholder="ABCDE1234F"
                  className="w-full bg-white dark:bg-white/5 border-2 border-gray-100 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary transition-all text-xl font-bold tracking-widest font-mono"
                  value={pan}
                  onChange={e => setPan(e.target.value.toUpperCase())}
                  maxLength={10}
                  required
                />
              </div>
              
              {error && <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>}

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-70"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    Verify & Analyze
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-12 flex items-center justify-center gap-8 opacity-50 grayscale">
              <div className="flex items-center gap-2 text-xs font-bold uppercase"><ShieldCheck size={16} /> Secure Verification</div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase"><Lightbulb size={16} /> AI Driven</div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid lg:grid-cols-3 gap-8"
          >
            {/* Main Score Card */}
            <div className="lg:col-span-2 space-y-8">
              <div className="glass-card rounded-[40px] p-10 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                
                <Gauge score={scoreData.score} />
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                      scoreData.risk_level === 'Low' ? 'bg-emerald-500/10 text-emerald-500' :
                      scoreData.risk_level === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-rose-500/10 text-rose-500'
                    }`}>
                      {scoreData.risk_level} Risk Profile
                    </span>
                    <span className="text-xs text-gray-500 font-medium">Updated just now</span>
                  </div>
                  <h2 className="text-3xl font-extrabold mb-4 font-display">Financial Health Status</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8">
                    Your simulated score is calculated based on pattern recognition of financial behaviors associated with your ID signature.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/10">
                      <Download size={18} />
                      Report PDF
                    </button>
                    <button className="bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2">
                      <RefreshCw size={18} />
                      Recalculate
                    </button>
                  </div>
                </div>
              </div>

              {/* Insights Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="glass-card rounded-3xl p-8">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
                    <Sparkles size={24} className={generatingAi ? "animate-pulse" : ""} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    AI Insights
                    {generatingAi && <span className="text-[10px] text-primary animate-pulse">Analyzing...</span>}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed italic">
                    {aiExplanation || "Extracting financial behavior insights..."}
                  </p>
                </div>
                <div className="glass-card rounded-3xl p-8">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
                    <AlertCircle size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Next Steps</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Improve your score by maintaining consistent repayment cycles and keeping credit utilization under 30%.
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-8">
              <div className="glass-card rounded-[32px] p-8">
                <h3 className="text-lg font-bold mb-6 flex items-center justify-between">
                  ID Profile
                  <ShieldCheck size={20} className="text-primary" />
                </h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-4">
                    <span className="text-sm text-gray-500 font-medium">PAN Number</span>
                    <span className="font-mono font-bold">{scoreData.pan_number}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-4">
                    <span className="text-sm text-gray-500 font-medium">Verified Identity</span>
                    <span className="text-emerald-500 text-sm font-bold flex items-center gap-1">
                      <ShieldCheck size={14} /> YES
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 font-medium">Score Basis</span>
                    <span className="text-sm font-bold">Behavioral AI</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary to-accent rounded-[32px] p-8 text-white relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h4 className="text-xl font-bold mb-2">Upgrade to Pro</h4>
                <p className="text-white/80 text-sm mb-6">Get detailed real-time monitoring and bank integration simulations.</p>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl py-2 px-4 inline-flex items-center gap-2 font-bold text-sm">
                  Upgrade Now <ChevronRight size={16} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
