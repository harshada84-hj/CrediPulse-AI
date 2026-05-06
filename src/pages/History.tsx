import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { History as HistoryIcon, Calendar, ArrowUpRight, ArrowDownRight, Loader2, Download } from 'lucide-react';

export const History: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.fetch('/credit/history');
        setHistory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 min-h-screen max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-primary/10 p-3 rounded-2xl text-primary">
            <HistoryIcon size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold font-display">Score History</h1>
            <p className="text-gray-500 font-medium">Track your credit score evolution over time</p>
          </div>
        </div>
      </header>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
          <p className="text-gray-500 font-medium">No history found. Complete your first analysis on the dashboard.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${
                  item.score >= 750 ? 'bg-emerald-500/10 text-emerald-500' :
                  item.score >= 600 ? 'bg-amber-500/10 text-amber-500' :
                  'bg-rose-500/10 text-rose-500'
                }`}>
                  {item.score}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold text-gray-500 uppercase">{item.pan_number}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider ${
                      item.risk_level === 'Low' ? 'border-emerald-500/30 text-emerald-500' :
                      item.risk_level === 'Medium' ? 'border-amber-500/30 text-amber-500' :
                      'border-rose-500/30 text-rose-500'
                    }`}>
                      {item.risk_level}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                    <Calendar size={14} />
                    {new Date(item.timestamp).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              <div className="flex-1 max-w-md text-sm text-gray-600 dark:text-gray-400 italic">
                "{item.explanation}"
              </div>

              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${index < history.length - 1 && history[index].score >= history[index+1].score ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {index < history.length - 1 && history[index].score >= history[index+1].score ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                </div>
                <button className="text-gray-400 group-hover:text-primary transition-colors">
                  <Download size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
