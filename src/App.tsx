import { useState } from 'react';
import { useBioSensor } from './contexts/BioSensorContext';
import { BiometricRing } from './components/BiometricRings';
import { commitJournalEntry } from './lib/crypto';
import { claimZorpRewards } from './lib/zorp';
import { Shield, Brain, Activity, Lock, Coins, Upload } from 'lucide-react';

function App() {
  const { current, average, isCameraActive, isBleActive, isScanningCamera, isScanningBle, startCamera, startBle } = useBioSensor();
  const [journalText, setJournalText] = useState('');
  const [monetize, setMonetize] = useState(false);
  const [commitState, setCommitState] = useState<'idle' | 'encrypting' | 'submitting'>('idle');
  const [toastMsg, setToastMsg] = useState('');

  const handleCommit = async () => {
    if (!journalText) return;
    setCommitState('encrypting');
    
    try {
      const txHash = await commitJournalEntry(journalText, average);
      
      setCommitState('submitting');
      if (monetize) {
        // Mock validity score based on how much data we collected
        const validityScore = (average.focus + average.calm) / 2;
        await claimZorpRewards(validityScore);
      }
      
      setToastMsg('Entry committed to Antigravity. +25 Elata Points earned.');
      setJournalText('');
      setTimeout(() => setToastMsg(''), 5000);
    } catch (e) {
      console.error(e);
      setToastMsg('Error committing entry');
      setTimeout(() => setToastMsg(''), 5000);
    } finally {
      setCommitState('idle');
    }
  };

  return (
    <div className="min-h-screen bg-background text-textMain p-4 md:p-8 font-sans relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 glass-panel border-primary/50 text-white animate-fade-in px-6 py-3 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <header className="glass-panel flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-t-2 border-t-primary/50">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-white flex items-center gap-2">
            Biometric Mood Journal
          </h1>
          <p className="text-textMuted text-sm">Real-time neural and biometric processing</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={startBle}
            disabled={isBleActive || isScanningBle}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-mono border transition-all ${
              isBleActive ? 'bg-primary/10 border-primary text-primary neon-text-primary neon-border-primary' : 'border-border text-gray-400 hover:border-gray-500'
            }`}
          >
            <Brain size={16} />
            {isScanningBle ? 'Scanning...' : 'Neural Link'}
            {isBleActive && <span className="ml-2 text-xs">95% signal</span>}
          </button>
          
          <button 
            onClick={startCamera}
            disabled={isCameraActive || isScanningCamera}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-mono border transition-all ${
              isCameraActive ? 'bg-secondary/10 border-secondary text-secondary' : 'border-border text-gray-400 hover:border-gray-500'
            }`}
            style={isCameraActive ? { textShadow: '0 0 10px rgba(0, 102, 255, 0.5)', boxShadow: '0 0 15px rgba(0, 102, 255, 0.3)'} : {}}
          >
            <Activity size={16} />
            {isScanningCamera ? 'Scanning...' : 'Optical Heart Rate'}
            {isCameraActive && <span className="ml-2 text-xs">88% signal</span>}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Journal Entry */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="glass-panel flex-grow flex flex-col min-h-[500px] border-t-2 border-t-secondary/50">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Entry</h2>
                <p className="text-textMuted text-sm">Distraction-free writing space</p>
              </div>
              <div className="text-right text-xs text-gray-500 font-mono">
                <div>{journalText.split(/\s+/).filter(w => w.length > 0).length} words</div>
                <div>{journalText.length} characters</div>
              </div>
            </div>
            
            <textarea
              className="w-full flex-grow bg-transparent border-none outline-none resize-none text-gray-300 font-mono text-sm leading-relaxed"
              placeholder="Write your mood, thoughts, and reflections here... All processing happens locally on your device."
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
            />
          </div>

          <button
            onClick={handleCommit}
            disabled={commitState !== 'idle' || !journalText}
            className={`glass-panel py-4 flex items-center justify-between group transition-all ${
              !journalText || commitState !== 'idle' ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50 cursor-pointer'
            }`}
          >
            <div className="flex items-center gap-2 font-mono text-gray-300 group-hover:text-primary transition-colors">
              <Upload size={18} />
              {commitState === 'encrypting' ? 'Encrypting Biometric Metadata...' : 
               commitState === 'submitting' ? 'Submitting to ZORP Research Manager...' : 
               'Commit to Ledger'}
            </div>
            <div className="text-gray-500 group-hover:text-primary transition-colors">
              &gt;
            </div>
          </button>
        </div>

        {/* Right Column: Biometrics */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel border-t-2 border-t-accent/50">
            <h3 className="text-xs font-bold tracking-widest text-gray-500 mb-6 uppercase">Live Biometrics</h3>
            
            <div className="flex flex-col gap-4">
              <BiometricRing percentage={current.focus} label="Focus" colorClass="text-[#00f0ff]" />
              <BiometricRing percentage={current.calm} label="Calm" colorClass="text-[#0066ff]" />
              <BiometricRing percentage={current.stress} label="Stress" colorClass="text-[#ff9900]" />
            </div>

            {/* Session Averages */}
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="text-xs font-bold tracking-widest text-gray-500 mb-4 uppercase">Session Average</h3>
              <div className="flex justify-between px-2">
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{average.focus}</div>
                  <div className="text-xs text-gray-500">Focus</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{average.calm}</div>
                  <div className="text-xs text-gray-500">Calm</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{average.stress}</div>
                  <div className="text-xs text-gray-500">Stress</div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Info */}
          <div className="glass-panel border border-primary/30 bg-primary/5 relative overflow-hidden">
            <div className="flex gap-3 mb-3 relative z-10">
              <Shield className="text-primary mt-1" size={20} />
              <div>
                <h4 className="font-bold text-sm text-white mb-1">Local Processing Only</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Raw EEG and heart rate data never leaves your device. All biometric analysis runs locally via WASM. Your privacy is protected by design.
                </p>
              </div>
            </div>
            <div className="flex gap-2 ml-8 relative z-10">
              <span className="text-[10px] px-2 py-1 rounded bg-black/50 border border-border text-gray-300 flex items-center gap-1">
                <Lock size={10} /> WASM Encrypted
              </span>
              <span className="text-[10px] px-2 py-1 rounded bg-black/50 border border-border text-gray-300">
                On-Device
              </span>
            </div>
            {/* Decorative background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          </div>

          {/* Monetize Toggle */}
          <div className="glass-panel flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Coins size={16} className="text-gray-300" />
                <h4 className="font-bold text-sm text-white">Monetize Data</h4>
              </div>
              <p className="text-xs text-gray-500">Participate in neuroscience research and earn $ELTA tokens</p>
            </div>
            <button 
              onClick={() => setMonetize(!monetize)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 ${monetize ? 'bg-primary' : 'bg-gray-800'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${monetize ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>
      </div>
      
      <footer className="mt-12 text-center text-xs text-gray-600 font-mono">
        Biometric Mood Journal • Powered by Local WASM Processing
      </footer>
    </div>
  );
}

export default App;
