import React from "react";
import { PrizeConfig, PrizeType, WinnersState } from "../app/types";

interface PrizeModalProps {
  prizeType: PrizeType;
  prizeConfig: Record<string, PrizeConfig>;
  winners: WinnersState;
  onClose: () => void;
}

const PrizeModal: React.FC<PrizeModalProps> = ({ prizeType, prizeConfig, winners, onClose }) => {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="border-2 border-white bg-[#0e5590]/60 rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden animate-bounce-in text-white">
        <div className="p-4 flex items-center bg-transp justify-center">
          <h2 className="text-xl font-bold text-white text-center">
            {prizeConfig[prizeType].name.toUpperCase()} (
            {winners[prizeType].length}/{prizeConfig[prizeType].total})
          </h2>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-transparent text-left">
                <th className="p-2 border font-semibold w-12 text-center">STT</th>
                <th className="p-2 border font-semibold">Mã nhân viên</th>
                <th className="p-2 border font-semibold">Họ và tên</th>
                <th className="p-2 border font-semibold">Bộ phận/Nhà máy</th>
              </tr>
            </thead>
            <tbody>
              {winners[prizeType].length > 0 ? (
                winners[prizeType].map((winner, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 border text-center">{index + 1}</td>
                    <td className="p-2 border font-bold">{winner.id}</td>
                    <td className="p-2 border ">{winner.name}</td>
                    <td className="p-2 border ">{winner.position}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-white italic">
                    Chưa có nhân viên trúng giải này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-transparent flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-[#0e5590] font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrizeModal;