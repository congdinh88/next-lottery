import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PrizeType, PrizeConfig, WinnersState, SelectedWinner, HoveredWinner, Employee } from "../app/types";

interface PrizeListProps {
  revealedPrizes: PrizeType[];
  prizeConfig: Record<string, PrizeConfig>;
  winners: WinnersState;
  expandedPrize: PrizeType;
  selectedWinner: SelectedWinner | null;
  onPrizeHeaderClick: (e: React.MouseEvent, key: PrizeType) => void;
  onWinnerClick: (prizeType: PrizeType, index: number, winner: Employee) => void;
  setHoveredWinner: (data: HoveredWinner | null) => void;
}

const PrizeList: React.FC<PrizeListProps> = ({
  revealedPrizes,
  prizeConfig,
  winners,
  expandedPrize,
  selectedWinner,
  onPrizeHeaderClick,
  onWinnerClick,
  setHoveredWinner
}) => {
  return (
    <div className="w-[500px] mt-[100px] ml-[10px] bg-transparent flex flex-col h-[70vh]">
      {revealedPrizes.length > 0 && (
        <h2 className="text-xl font-bold mb-4 text-white text-center animate-bounce-in">
          DANH SÁCH GIẢI THƯỞNG
        </h2>
      )}
      <div className="bg-transparent overflow-y-auto flex-1 pr-2 relative scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {revealedPrizes.map((key) => {
            const config = prizeConfig[key];
            return (
              <motion.div
                layout
                key={key}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                id={`prize-section-${key}`}
                className="mb-1 scroll-mt-2"
              >
                <div
                  onClick={(e) => onPrizeHeaderClick(e, key)}
                  className={`bg-transparent border border-white/50 text-white px-2 py-2 rounded-lg font-bold text-sm flex items-center justify-between shadow-lg cursor-pointer hover:bg-white/10 transition-all relative z-10 mb-1`}
                >
                  <span>{config.name}</span>
                  <span className="bg-transparent border border-white text-white px-2 py-0.5 rounded-full text-xs">
                    {winners[key].length}/{config.total}
                  </span>
                </div>
                <AnimatePresence>
                  {expandedPrize === key && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden mt-0"
                    >
                      <div className="border-2 border-white/30 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-transparent border-b border-white/30">
                            <tr>
                              <th className="px-2 py-2 w-[100px] text-left text-sm font-semibold text-white">Mã NV</th>
                              <th className="px-2 py-2 w-[200px] text-left text-sm font-semibold text-white">Họ và tên</th>
                              <th className="px-2 py-2 w-[200px] text-left text-sm font-semibold text-white">Bộ phận</th>
                            </tr>
                          </thead>
                          <tbody>
                            {winners[key].length > 0 ? (
                              winners[key].map((winner, idx) => (
                                <tr
                                  key={idx}
                                  className={`border-t border-white/20 hover:bg-white/20 cursor-pointer transition-all ${
                                    selectedWinner?.prizeType === key && selectedWinner?.index === idx
                                      ? "bg-blue-500/30 ring-2 ring-blue-400"
                                      : ""
                                  }`}
                                  onClick={() => onWinnerClick(key, idx, winner)}
                                  onMouseEnter={() => setHoveredWinner({ prizeType: key, index: idx })}
                                  onMouseLeave={() => setHoveredWinner(null)}
                                >
                                  <td className="px-2 py-2 w-[100px] text-sm font-semibold text-white">{winner.id}</td>
                                  <td className="px-2 py-2 w-[200px] text-sm text-white">{winner.name}</td>
                                  <td className="px-2 py-2 w-[200px] text-sm text-white text-opacity-80">{winner.position}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={3} className="px-2 py-4 text-center text-xs text-white/60 italic">
                                  Chưa có người trúng giải
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PrizeList;