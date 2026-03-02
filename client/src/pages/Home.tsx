import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei';
import { Cube3D, CubeRef } from '@/components/Cube3D';
import { generateScramble, getInverseSequence } from '@/lib/rubiks-logic';
import { useCreateSolve } from '@/hooks/use-solves';
import { Dices, Play, ArrowLeft, ArrowRight, RotateCcw, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type AppMode = 'initial' | 'scrambled' | 'solving' | 'solved';

export default function Home() {
  const cubeRef = useRef<CubeRef>(null);
  
  const [mode, setMode] = useState<AppMode>('initial');
  const [scrambleSeq, setScrambleSeq] = useState<string[]>([]);
  const [solutionSeq, setSolutionSeq] = useState<string[]>([]);
  
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [movesCount, setMovesCount] = useState(0);

  const { mutate: saveSolve } = useCreateSolve();

  // --- Handlers ---

  const handleScramble = () => {
    if (isAnimating || !cubeRef.current) return;
    
    // Reset to pristine state first just in case
    cubeRef.current.resetCube();
    
    const newScramble = generateScramble(20);
    setScrambleSeq(newScramble);
    setIsAnimating(true);
    setMode('initial'); // temporary to disable UI

    // Animate fast scramble
    cubeRef.current.animateSequence(newScramble, 80, () => {
      setIsAnimating(false);
      setMode('scrambled');
      setMovesCount(0);
      setCurrentStep(0);
      setSolutionSeq([]); // clear old solution
    });
  };

  const handleBeginSolve = () => {
    if (isAnimating || mode !== 'scrambled') return;
    
    // The "solution" is just the inverse of the scramble applied backwards
    const solution = getInverseSequence(scrambleSeq);
    setSolutionSeq(solution);
    setCurrentStep(0);
    setMode('solving');
  };

  const handleStepForward = () => {
    if (isAnimating || !cubeRef.current || currentStep >= solutionSeq.length) return;
    
    const move = solutionSeq[currentStep];
    setIsAnimating(true);
    
    cubeRef.current.animateMove(move, 400, () => {
      setIsAnimating(false);
      setCurrentStep(prev => prev + 1);
      setMovesCount(prev => prev + 1);
      
      if (currentStep + 1 === solutionSeq.length) {
        setMode('solved');
        // Save to DB
        saveSolve({
          scramble: scrambleSeq.join(' '),
          solution: solutionSeq,
          moveCount: movesCount + 1
        });
      }
    });
  };

  const handleStepBackward = () => {
    if (isAnimating || !cubeRef.current || currentStep <= 0) return;
    
    const previousMove = solutionSeq[currentStep - 1];
    const inverseOfPrevious = getInverseSequence([previousMove])[0];
    
    setIsAnimating(true);
    cubeRef.current.animateMove(inverseOfPrevious, 400, () => {
      setIsAnimating(false);
      setCurrentStep(prev => prev - 1);
      setMovesCount(prev => prev - 1);
    });
  };

  const handleReset = () => {
    if (isAnimating || !cubeRef.current) return;
    cubeRef.current.resetCube();
    setMode('initial');
    setScrambleSeq([]);
    setSolutionSeq([]);
    setCurrentStep(0);
    setMovesCount(0);
  };

  // --- Render Helpers ---
  const renderSidebarHistory = () => {
    if (mode === 'initial' || mode === 'scrambled') {
      return (
        <div className="flex-1 flex items-center justify-center text-slate-500 font-medium p-6 text-center">
          {mode === 'initial' ? "Scramble the cube to begin." : "Cube ready. Click solve to start."}
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto pr-2 space-y-2 relative">
        {solutionSeq.map((move, idx) => {
          const isActive = idx === currentStep;
          const isPast = idx < currentStep;
          
          return (
            <div 
              key={idx} 
              className={`
                flex items-center justify-between p-3 rounded-xl transition-all duration-300
                ${isActive ? 'bg-cyan-500/20 border border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'bg-slate-800/40 border border-transparent'}
                ${isPast ? 'opacity-40' : 'opacity-100'}
              `}
            >
              <div className="flex items-center gap-4">
                <span className={`font-display font-bold w-6 text-right ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                  {idx + 1}.
                </span>
                <span className={`text-lg font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {move}
                </span>
              </div>
              {isActive && (
                <motion.div 
                  layoutId="indicator" 
                  className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,240,255,1)]"
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      
      {/* LEFT SIDEBAR */}
      <div className="w-80 h-full flex flex-col z-10 glass-panel border-r border-slate-800/80 p-6 shadow-2xl">
        <div className="mb-8">
          <h1 className="text-sm tracking-widest text-cyan-500 font-display uppercase font-bold mb-2">System Status</h1>
          <h2 className="text-3xl font-display font-bold text-white text-glow">Solving Stats</h2>
        </div>

        <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800 mb-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="text-slate-400 text-sm font-medium mb-1">Moves Executed</div>
          <div className="text-5xl font-display font-bold text-white tracking-tighter">
            {movesCount}
          </div>
          {(mode === 'solving' || mode === 'solved') && (
             <div className="mt-2 text-sm text-cyan-400 font-medium">
               Step {currentStep} of {solutionSeq.length}
             </div>
          )}
        </div>

        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Sequence Log</h3>
        
        {renderSidebarHistory()}

        {/* Bottom Sidebar Action */}
        <AnimatePresence>
          {(mode === 'solving' || mode === 'solved') && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={handleReset}
              className="mt-6 w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Back to Scramble State
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* CENTER VIEWPORT (3D) */}
      <div className="flex-1 relative">
        <Canvas camera={{ position: [4, 4, 6], fov: 45 }}>
          {/* High-tech lighting setup */}
          <color attach="background" args={['#050810']} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#00f0ff" />
          <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={2} color="#b026ff" />
          
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
            <Cube3D ref={cubeRef} />
          </Float>

          <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} color="#00f0ff" />
          <Environment preset="city" />
          <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI/4} maxPolarAngle={Math.PI/1.5} />
        </Canvas>

        {/* BOTTOM CONTROLS FLOATING PANEL */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
          <div className="glass-panel-glow rounded-3xl p-3 flex items-center gap-3">
            
            {mode === 'initial' || mode === 'scrambled' ? (
              <>
                <button
                  onClick={handleScramble}
                  disabled={isAnimating}
                  className="btn-primary-glow px-8 py-4 rounded-2xl font-bold tracking-wide flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Dices className="w-5 h-5" />
                  SCRAMBLE
                </button>
                <button
                  onClick={handleBeginSolve}
                  disabled={isAnimating || mode !== 'scrambled'}
                  className={`px-8 py-4 rounded-2xl font-bold tracking-wide flex items-center gap-3 transition-all duration-300
                    ${mode === 'scrambled' && !isAnimating ? 'btn-secondary-glow' : 'bg-slate-800/50 text-slate-500 border border-slate-700/50 cursor-not-allowed'}
                  `}
                >
                  <Play className="w-5 h-5 fill-current" />
                  SOLVE
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleStepBackward}
                  disabled={isAnimating || currentStep === 0}
                  className="p-4 rounded-2xl bg-slate-800/80 text-white border border-slate-700 hover:bg-slate-700 hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  aria-label="Previous Step"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                
                <div className="px-6 font-display font-bold text-cyan-400 tracking-widest uppercase text-sm w-32 text-center">
                  {isAnimating ? "Rotating..." : mode === 'solved' ? "Complete" : "Manual Step"}
                </div>

                <button
                  onClick={handleStepForward}
                  disabled={isAnimating || currentStep === solutionSeq.length}
                  className="p-4 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.1)] hover:bg-cyan-500/30 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:bg-slate-800/80 disabled:border-slate-700 disabled:text-slate-500 transition-all"
                  aria-label="Next Step"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </>
            )}

          </div>
        </div>

        {/* High-tech Overlay Reticles */}
        <div className="absolute top-8 right-8 text-cyan-500/40 font-display text-xs tracking-widest flex items-center gap-2 pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-cyan-500/40 animate-pulse"></div>
          SYS.ONLINE
        </div>
      </div>
    </div>
  );
}
