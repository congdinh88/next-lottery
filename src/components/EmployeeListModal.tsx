import React from "react";
import { Employee, WinnersState } from "../app/types";

interface EmployeeListModalProps {
  employees: Employee[];
  winners: WinnersState;
  cancelledWinnerIds: string[];
  onClose: () => void;
}

const EmployeeListModal: React.FC<EmployeeListModalProps> = ({
  employees,
  winners,
  cancelledWinnerIds,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0e5590]/60 border-2 border-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden animate-bounce-in text-gray-800">
        <div className="p-4 flex justify-between items-center bg-transparent">
          <h2 className="text-xl font-bold text-white">
            DANH SÁCH NHÂN VIÊN ({employees.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white hover:bg-gray-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div id="employee-table-container" className="flex-1 overflow-auto p-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-transparent text-left text-white">
                <th className="p-2 border font-semibold">STT</th>
                <th className="p-2 border font-semibold">Mã nhân viên</th>
                <th className="p-2 border font-semibold">Họ và tên</th>
                <th className="p-2 border font-semibold">Bộ phận/Nhà máy</th>
                <th className="p-2 border font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, index) => {
                const isWinner = Object.values(winners).some((list) =>
                  list.some((w: { id: string }) => w.id === emp.id)
                );
                const isCancelled = cancelledWinnerIds.includes(emp.id);
                return (
                  <tr
                    key={emp.id}
                    id={`emp-${emp.id}`}
                    className={`border-b text-white ${isWinner ? "bg-transparent" : isCancelled ? "bg-transparent" : ""}`}
                  >
                    <td className="p-2 border text-center">{index + 1}</td>
                    <td className="p-2 border">{emp.id}</td>
                    <td className="p-2 border font-medium">{emp.name}</td>
                    <td className="p-2 border ">{emp.position}</td>
                    <td className="p-2 border text-center">
                      {isWinner ? (
                        <span className="text-green-600 font-bold text-xs px-2 py-1 bg-green-100 rounded-full">Đã trúng</span>
                      ) : isCancelled ? (
                        <span className="text-red-600 font-bold text-xs px-2 py-1 bg-red-100 rounded-full">Đã hủy</span>
                      ) : (
                        <span className=" text-xs">Chưa quay</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeListModal;