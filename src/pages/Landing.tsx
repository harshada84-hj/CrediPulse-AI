import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, BarChart3, CreditCard } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 dark:opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary rounded-full blur-[120px]" />
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-accent rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wider uppercase mb-6">
              AI-Powered Credit Analysis
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Know Your Credit Score,<br /> 
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Driven by Intelligence.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
              Unlock deep financial insights using our proprietary behavioral AI model. No real bank data required—just your financial profile simulation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?mode=register" className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all hover:scale-105 shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
                Check Score Now
                <ArrowRight size={20} />
              </Link>
              <button className="bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 px-8 py-4 rounded-2xl text-lg font-bold transition-all">
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-white/5 border-y border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {[
              { 
                icon: Shield, 
                title: 'Privacy Focused', 
                desc: 'Your data stays encrypted. We use PAN only for behavioral simulation identity.',
                color: 'text-blue-500'
              },
              { 
                icon: Zap, 
                title: 'Instant Results', 
                desc: 'Our AI engine processes your profile in milliseconds to deliver real-time scoring.',
                color: 'text-yellow-500' 
              },
              { 
                icon: BarChart3, 
                title: 'Smart Insights', 
                desc: 'Get human-readable explanations on why your score is what it is.',
                color: 'text-primary'
              }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="p-8 rounded-3xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
              >
                <div className={`mx-auto w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${f.color}`}>
                  <f.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Trust */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-extrabold mb-12">Simplified Digital Finance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 dark:opacity-20 grayscale">
            <div className="flex items-center justify-center gap-2 font-bold text-xl"><CreditCard /> FINTECH</div>
            <div className="flex items-center justify-center gap-2 font-bold text-xl"><Shield /> SECURE</div>
            <div className="flex items-center justify-center gap-2 font-bold text-xl"><BarChart3 /> ANALYTICS</div>
            <div className="flex items-center justify-center gap-2 font-bold text-xl"><Zap /> FAST</div>
          </div>
        </div>
      </section>
    </div>
  );
};
