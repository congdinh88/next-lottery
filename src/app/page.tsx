"use client";

import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";

// Types & Config
import { PrizeType, PrizeConfig, SelectedWinner, HoveredWinner, Employee } from "./types";
import { PRIZE_ORDER, prizeConfig } from "../components/config";

// Hooks
import { useAudio, useLotteryData, useLotteryMechanics } from "./hooks";

// UI Components
import ParticleText from "../components/ParticleText";
import ElectronStar from "../components/ElectronStar";
import EmployeeListModal from "../components/EmployeeListModal";
import PrizeModal from "../components/PrizeModal";
import ConfirmationModal from "../components/ConfirmationModal";
import PrizeList from "../components/PrizeList";

const Lotteryapp: React.FC = () => {
  // --- 1. UI STATE ---
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showEmployeeList, setShowEmployeeList] = useState<boolean>(false);
  const [showPrizeModal, setShowPrizeModal] = useState<boolean>(false);
  const [modalPrizeType, setModalPrizeType] = useState<PrizeType | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  
  const [currentLabel, setCurrentLabel] = useState<string>("-- Chọn giải thưởng --");
  const [selectedPrize, setSelectedPrize] = useState<PrizeType>("consolation3");
  const [expandedPrize, setExpandedPrize] = useState<PrizeType>("consolation3");
  
  const [selectedWinner, setSelectedWinner] = useState<SelectedWinner | null>(null);
  const [_, setHoveredWinner] = useState<HoveredWinner | null>(null);

  // --- 2. HOOKS ---
  const { volume, setVolume, showVolumeSlider, setShowVolumeSlider } = useAudio();
  const {
    employees, availableEmployees, setAvailableEmployees,
    winners, setWinners,
    cancelledWinnerIds, setCancelledWinnerIds,
    revealedPrizes, setRevealedPrizes,
    handleReset, handleExportExcel, deleteWinner
  } = useLotteryData({ prizeConfig, PRIZE_ORDER });

  const {
    currentNumber, setCurrentNumber,
    isSpinning, isWaitingForStop, countdown,
    startSpin, handleStopSpin,
    showConfirmation, pendingWinner, showFireworks,
    handleConfirm, handleCancel
  } = useLotteryMechanics({
    availableEmployees, winners, selectedPrize, prizeConfig,
    setWinners, setAvailableEmployees, setCancelledWinnerIds
  });

  // --- 3. EFFECTS & HANDLERS ---
  const scrollToPrizeSection = (prizeType: PrizeType) => {
    setTimeout(() => {
      const element = document.getElementById(`prize-section-${prizeType}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  useEffect(() => {
    if (currentNumber) {
      const container = document.getElementById("employee-table-container");
      const highlightedRow = document.getElementById("emp-" + currentNumber);
      if (container && highlightedRow) {
        const containerHeight = container.clientHeight;
        const rowHeight = highlightedRow.clientHeight;
        const rowTop = highlightedRow.offsetTop;
        const scrollTo = rowTop - containerHeight / 2 + rowHeight / 2;
        container.scrollTo({ top: scrollTo, behavior: "auto" });
      }
    }
  }, [currentNumber]);

  useEffect(() => {
    setExpandedPrize(selectedPrize);
    scrollToPrizeSection(selectedPrize);
  }, [selectedPrize]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Delete" && selectedWinner) {
        e.preventDefault();
        const success = deleteWinner(selectedWinner.prizeType, selectedWinner.index);
        if (success) setSelectedWinner(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedWinner, deleteWinner]);

  const onReset = () => {
    const success = handleReset(setShowMenu);
    if (success) {
      setCurrentLabel("-- Chọn giải thưởng --");
      setSelectedPrize("consolation3");
      setCurrentNumber("HP00000");
    }
  };

  const onConfirm = () => handleConfirm(scrollToPrizeSection);

  const handlePrizeHeaderClick = (e: React.MouseEvent, prizeKey: PrizeType) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setModalPrizeType(prizeKey);
      setShowPrizeModal(true);
    } else {
      setExpandedPrize(prizeKey);
      scrollToPrizeSection(prizeKey);
    }
  };

  const handleWinnerClick = (prizeType: PrizeType, index: number, winner: Employee) => {
    setSelectedWinner({ prizeType, index, winner });
  };

  // --- 4. RENDER ---
  return (
    <div className="h-screen w-full bg-[url(/bg.png)] bg-[length:100%_100%] bg-center bg-no-repeat flex flex-col overflow-hidden font-['Times_New_Roman'] text-white">
      {/* Styles animation giữ nguyên */}
      <style>{`
        @keyframes firework {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
          100% { transform: scale(0) rotate(360deg); opacity: 0; }
        }
        .animate-firework { animation: firework 2s ease-out infinite; }
        @keyframes bounce-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.5s ease-out; }
        @keyframes roll-down { 0% { transform: translateY(0); } 100% { transform: translateY(-1000px); } }
        @keyframes roll-up { 0% { transform: translateY(-1000px); } 100% { transform: translateY(0); } }
        @keyframes orbit-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .atom-container { perspective: 800px; }
        .orbit-ring {
           position: absolute; top: 50%; left: 50%; width: 165px; height: 165px;
           margin-top: -82.5px; margin-left: -82.5px; border-radius: 50%; border: none;
           transform-style: preserve-3d; pointer-events: none;
        }
        .electron-wrapper {
           position: absolute; top: 0; left: 0; width: 100%; height: 100%;
           border-radius: 50%; animation: orbit-spin 2s linear infinite;
        }
      `}</style>

      {/* MENU & VOLUME */}
      <div className="fixed bottom-5 right-4 z-50 flex items-center gap-4">
        {/* Menu Dropdown */}
        <div className="relative group" onMouseEnter={() => setShowMenu(true)} onMouseLeave={() => setShowMenu(false)}>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full mb-4 right-0 w-64 bg-transparent rounded-xl shadow-2xl border border-white/40 overflow-hidden text-white origin-bottom-right"
              >
                <div className="flex flex-col py-2">
                  <button onClick={() => { setShowEmployeeList(true); setShowMenu(false); }} className="px-4 py-3 text-left hover:bg-white/20 transition-colors flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                    Danh sách quay thưởng
                  </button>
                  <button onClick={() => handleExportExcel(setShowMenu)} className="px-4 py-3 text-left hover:bg-white/20 transition-colors flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                    Xuất Excel giải thưởng
                  </button>
                  <div className="h-px bg-white/20 my-1"></div>
                  <button onClick={onReset} className="px-4 py-3 text-left hover:bg-white/20 hover:text-red-400 transition-colors flex items-center gap-2 font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                    Xóa kết quả
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button className="bg-transparent text-white rounded-full p-2 hover:bg-white/20 transition-all border border-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
          </button>
        </div>

        {/* Volume */}
        <div className="relative text-gray-800 flex items-center justify-center group" onMouseEnter={() => setShowVolumeSlider(true)} onMouseLeave={() => setShowVolumeSlider(false)}>
          {showVolumeSlider && (
            <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-transparent rounded-full p-1 shadow-lg border border-white flex items-center justify-center animate-bounce-in h-32 w-6 after:content-[''] after:absolute after:-bottom-4 after:left-0 after:w-full after:h-4">
              <div className="relative w-full h-full flex items-center justify-center">
                <input type="range" min="0" max="100" value={volume * 100} onChange={(e) => setVolume(Number(e.target.value) / 100)} className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer absolute" style={{ transform: "rotate(-90deg)", background: `linear-gradient(to right, #9fc5e8 0%, #9fc5e8 ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)` }} />
              </div>
            </div>
          )}
          <button onClick={() => setShowVolumeSlider(!showVolumeSlider)} className="bg-transparent text-white rounded-full p-2 hover:bg-white/20 border border-white transition-all z-10">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d={volume > 0.5 ? "M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" : volume > 0 ? "M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" : "M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"} /></svg>
          </button>
        </div>
      </div>

      {/* MODALS */}
      {showEmployeeList && (
        <EmployeeListModal
          employees={employees}
          winners={winners}
          cancelledWinnerIds={cancelledWinnerIds}
          onClose={() => setShowEmployeeList(false)}
        />
      )}

      {showPrizeModal && modalPrizeType && (
        <PrizeModal
          prizeType={modalPrizeType}
          prizeConfig={prizeConfig}
          winners={winners}
          onClose={() => setShowPrizeModal(false)}
        />
      )}

      {showConfirmation && pendingWinner && (
        <ConfirmationModal
          pendingWinner={pendingWinner}
          selectedPrize={selectedPrize}
          prizeConfig={prizeConfig}
          onConfirm={onConfirm}
          onCancel={handleCancel}
        />
      )}

      {showFireworks && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute animate-firework" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }}></div>
          ))}
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="max-w-9xl mt-4 relative z-10 w-full h-[calc(100vh-100px)] flex flex-col justify-center">
        <div className="flex w-full items-start">
          
          {/* LEFT: Prize List Component */}
          <PrizeList
            revealedPrizes={revealedPrizes}
            prizeConfig={prizeConfig}
            winners={winners}
            expandedPrize={expandedPrize}
            selectedWinner={selectedWinner}
            onPrizeHeaderClick={handlePrizeHeaderClick}
            onWinnerClick={handleWinnerClick}
            setHoveredWinner={setHoveredWinner}
          />

          {/* CENTER: Spinning Machine */}
          <div className="flex-1 flex flex-col mt-[100px] ml-[60px] items-center justify-center min-h-[70vh]">
            
            {/* Number Display */}
            <div className="bg-transparent rounded-2xl p-5 text-center border-2 border-white shadow-lg mb-6">
              <div className="flex justify-center gap-1">
                {/* Prefix HP */}
                <div className="bg-transparent rounded-xl shadow-lg border-2 border-white overflow-hidden relative" style={{ width: "180px", height: "200px" }}>
                  {isSpinning ? (
                    <div className="absolute inset-0 flex flex-col" style={{ animation: "roll-up 1.5s linear infinite", willChange: "transform" }}>
                      {[...Array(20)].map((_, i) => (
                        <div key={i} className="flex items-center justify-center" style={{ height: "100px", minHeight: "100px" }}>
                          <div className="text-8xl text-white tracking-wider">HP</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-8xl text-white tracking-wider">HP</div>
                    </div>
                  )}
                </div>

                {/* Digits */}
                {currentNumber.replace("HP", "").split("").map((digit, index) => {
                    const isEven = index % 2 === 0;
                    const speed = isEven ? "1.3s" : "1.7s";
                    const direction = isEven ? "roll-down" : "roll-up";
                    let numbers: number[];
                    if (index === 0) {
                      numbers = isEven ? [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0] : [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
                    } else {
                      numbers = isEven ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0] : [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 9];
                    }
                    return (
                      <div key={index} className="bg-transparent rounded-xl shadow-lg border-2 border-white overflow-hidden relative" style={{ width: "100px", height: "200px" }}>
                        {isSpinning ? (
                          <div className="absolute inset-0 flex flex-col" style={{ animation: `${direction} ${speed} linear infinite` }}>
                            {numbers.map((num, idx) => (
                              <div key={idx} className="flex items-center justify-center" style={{ height: "100px", minHeight: "100px" }}>
                                <div className="text-8xl text-white">{num}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-8xl text-white">{digit}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center w-full max-w-md gap-4">
              {/* Dropdown */}
              <div className="relative w-full flex-1 z-30">
                <div onClick={() => !isSpinning && setIsDropdownOpen(!isDropdownOpen)} className={`h-12 px-4 py-2 rounded-xl border-2 border-white flex items-center justify-between text-base font-bold text-white bg-transparent transition-all select-none ${isSpinning ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-white/10"}`}>
                  <span className="truncate">{currentLabel}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-4 h-4 ml-2 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                </div>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute bottom-full left-0 mb-2 w-full bg-[#0e5590]/60 backdrop-blur-xl border border-white/30 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-60 overflow-y-auto scrollbar-hide">
                      {(Object.entries(prizeConfig) as [PrizeType, PrizeConfig][]).map(([key, config]) => (
                        <div key={key} onClick={() => { setSelectedPrize(key as PrizeType); setCurrentLabel(config.name); setRevealedPrizes((prev) => !prev.includes(key as PrizeType) ? [key as PrizeType, ...prev] : prev); setIsDropdownOpen(false); }} className={`px-4 py-3 text-white border-b border-white/10 last:border-0 transition-colors flex justify-between items-center cursor-pointer hover:bg-white/20 ${(key === selectedPrize && currentLabel === config.name) ? "bg-blue-600/40 font-bold" : ""}`}>
                          <span>{config.name}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                {isDropdownOpen && <div className="fixed inset-0 z-[-1]" onClick={() => setIsDropdownOpen(false)}></div>}
              </div>

              {/* Start/Stop Button */}
              <div className="relative w-40 h-40 atom-container flex-shrink-0">
                {[0, 60, 120].map((deg, i) => (
                  <div key={i} className="orbit-ring" style={{ transform: `rotateZ(${deg}deg) rotateX(75deg)` }}>
                    <div className="electron-wrapper" style={{ animationDuration: `${2 + i * 0.5}s` }}>
                      <ElectronStar />
                    </div>
                  </div>
                ))}
                <button onClick={isWaitingForStop ? handleStopSpin : () => startSpin(currentLabel)} disabled={isSpinning && !isWaitingForStop} className={`relative z-10 w-full h-full rounded-full overflow-hidden group border-none outline-none ${isSpinning && !isWaitingForStop ? "cursor-not-allowed" : "hover:scale-105 transition-all duration-300"}`} style={{ backgroundColor: "transparent" }}>
                  <div className="absolute inset-0">
                    <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                      <ambientLight intensity={0.5} />
                      <pointLight position={[10, 10, 1]} />
                      <React.Suspense fallback={null}>
                        <ParticleText text={countdown !== null ? countdown.toString() : isWaitingForStop ? "DỪNG" : "BẮT ĐẦU"} />
                      </React.Suspense>
                    </Canvas>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div className="w-1/4 hidden lg:block"></div>
        </div>
      </div>
    </div>
  );
};

export default Lotteryapp;