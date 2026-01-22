import React from "react";
import { PrizeConfig, PrizeType, WinnerWithIndex } from "../app/types";

interface ConfirmationModalProps {
  pendingWinner: WinnerWithIndex;
  selectedPrize: PrizeType;
  prizeConfig: Record<string, PrizeConfig>;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  pendingWinner,
  selectedPrize,
  prizeConfig,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm font-['Times_New_Roman']">
      <div className="mx-4 w-full max-w-md transform scale-100 animate-bounce-in rounded-3xl border-4 border-white bg-[#0e5590]/60 p-16 shadow-2xl">
        <div className="text-center">
          <h2 className="mb-2 text-3xl font-bold text-white">CHÚC MỪNG!</h2>
          <div className="mb-6 text-sm font-semibold text-gray-200">
            {prizeConfig[selectedPrize]?.name || "Giải thưởng"}
          </div>
          <div className="mb-6 rounded-2xl border-3 border-white bg-[#0e5590]/60 p-6 shadow-lg">
            <div className="mb-2 text-3xl font-bold text-white">{pendingWinner.id}</div>
            <div className="mb-1 text-2xl font-semibold text-gray-200">{pendingWinner.name}</div>
            <div className="text-lg text-gray-200">{pendingWinner.position}</div>
          </div>
          <div className="flex justify-center gap-6">
            <button
              onClick={onCancel}
              className="group relative w-1/2 inline-flex h-12 overflow-hidden rounded-full p-[4px] focus:outline-none hover:scale-105 transition-transform duration-300"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#F3F4F6_0%,#374151_50%,#F3F4F6_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gray-500 px-8 py-1 text-sm font-bold text-white backdrop-blur-3xl">
                Hủy
              </span>
            </button>
            <button
              onClick={onConfirm}
              className="group relative w-1/2 inline-flex h-12 overflow-hidden rounded-full p-[4px] focus:outline-none hover:scale-105 transition-transform duration-300 shadow-lg shadow-blue-500/50"
            >
              <span className="absolute inset-[-1000%] animate-[spin_1.5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#00C9FF_0%,#2563EB_50%,#00C9FF_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-blue-600 px-8 py-1 text-sm font-bold text-white backdrop-blur-3xl">
                Cập nhật
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;