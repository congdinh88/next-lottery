import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { Employee, PrizeType, PrizeConfig, WinnersState, UseLotteryDataProps, WinnerWithIndex } from "./types";



export const useAudio = (initialVolume: number = 0.2) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState<number>(initialVolume);
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const audio = new Audio("/tune2.mp3");
      audio.loop = true;
      audio.volume = volume;
      audioRef.current = audio;

      const playAudio = () => {
        audio.play().catch(() => {});
      };

      playAudio();
      document.addEventListener("click", playAudio, { once: true });
      return () => {
        audio.pause();
        document.removeEventListener("click", playAudio);
      };
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return {
    volume,
    setVolume,
    showVolumeSlider,
    setShowVolumeSlider,
  };
};


const initialWinnersState: WinnersState = {
  special1: [], special2: [], first: [], second1: [], second2: [],
  third1: [], third2: [], third3: [], fourth1: [], fourth2: [],
  consolation1: [], consolation2: [], consolation3: [],
};

export const useLotteryData = ({ prizeConfig, PRIZE_ORDER }: UseLotteryDataProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [winners, setWinners] = useState<WinnersState>(initialWinnersState);
  const [cancelledWinnerIds, setCancelledWinnerIds] = useState<string[]>([]);
  const [revealedPrizes, setRevealedPrizes] = useState<PrizeType[]>([]);

  // Load Data & LocalStorage
  useEffect(() => {
    const loadFromLocalStorage = () => {
      if (typeof window !== "undefined") {
        const savedWinners = localStorage.getItem("lottery_winners");
        const savedCancelled = localStorage.getItem("lottery_cancelled");
        let parsedWinners = initialWinnersState;
        let parsedCancelled: string[] = [];

        if (savedWinners) {
          try { parsedWinners = JSON.parse(savedWinners); } catch (e) { console.error(e); }
        }
        if (savedCancelled) {
          try { parsedCancelled = JSON.parse(savedCancelled); } catch (e) { console.error(e); }
        }
        return { winners: parsedWinners, cancelled: parsedCancelled };
      }
      return { winners: initialWinnersState, cancelled: [] };
    };

    const { winners: savedWinners, cancelled: savedCancelled } = loadFromLocalStorage();
    setWinners(savedWinners);
    setCancelledWinnerIds(savedCancelled);

    const revealedFromStorage = PRIZE_ORDER.filter(
      (key) => savedWinners[key].length > 0
    ).reverse();
    setRevealedPrizes(revealedFromStorage);

    const loadEmployees = async () => {
      try {
        const response = await fetch("list.json");
        if (!response.ok) throw new Error("Failed");
        const data: Employee[] = await response.json();
        setEmployees(data);

        const allWinnerIds = new Set<string>();
        Object.values(savedWinners).forEach((list: any) => {
          list.forEach((w: Employee) => allWinnerIds.add(w.id));
        });

        const available = data.filter(
          (emp) =>
            emp.eligible &&
            !allWinnerIds.has(emp.id) &&
            !savedCancelled.includes(emp.id)
        );
        setAvailableEmployees(available);
      } catch (error) {
        console.error(error);
        alert("Không thể tải danh sách nhân viên.");
      }
    };

    loadEmployees();
  }, [PRIZE_ORDER]);

  // Sync to LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lottery_winners", JSON.stringify(winners));
      localStorage.setItem("lottery_cancelled", JSON.stringify(cancelledWinnerIds));
    }
  }, [winners, cancelledWinnerIds]);

  const handleReset = (setShowMenu: (show: boolean) => void) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ dữ liệu?")) {
      setWinners(initialWinnersState);
      setCancelledWinnerIds([]);
      setRevealedPrizes([]);
      localStorage.removeItem("lottery_winners");
      localStorage.removeItem("lottery_cancelled");
      setAvailableEmployees(employees.filter((emp) => emp.eligible));
      setShowMenu(false);
      alert("Đã xóa dữ liệu và làm mới chương trình thành công!");
      return true; // Return true to indicate reset happened
    }
    return false;
  };

  const handleExportExcel = (setShowMenu: (show: boolean) => void) => {
    try {
      const dataToExport: any[] = [];
      PRIZE_ORDER.forEach((key) => {
        winners[key].forEach((winner) => {
          dataToExport.push({
            "Giải thưởng": prizeConfig[key].name,
            "Mã nhân viên": winner.id,
            "Họ và tên": winner.name,
            "Bộ phận/Nhà máy": winner.position,
          });
        });
      });

      if (dataToExport.length === 0) {
        alert("Chưa có dữ liệu để xuất!");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "KetQuaQuaySo");
      XLSX.writeFile(workbook, "DanhSachTrungThuong.xlsx");
      setShowMenu(false);
    } catch (error) {
      console.error(error);
      alert("Lỗi xuất Excel.");
    }
  };

  const deleteWinner = (prizeType: PrizeType, winnerIndex: number) => {
    if (window.confirm("Xóa người này khỏi danh sách trúng thưởng?")) {
      const winnerToDelete = winners[prizeType][winnerIndex];
      setWinners((prev) => ({
        ...prev,
        [prizeType]: prev[prizeType].filter((_, idx) => idx !== winnerIndex),
      }));
      setCancelledWinnerIds((prev) => [...prev, winnerToDelete.id]);
      return true; 
    }
    return false;
  };

  return {
    employees,
    availableEmployees,
    setAvailableEmployees,
    winners,
    setWinners,
    cancelledWinnerIds,
    setCancelledWinnerIds,
    revealedPrizes,
    setRevealedPrizes,
    handleReset,
    handleExportExcel,
    deleteWinner
  };
};


interface UseLotteryMechanicsProps {
  availableEmployees: Employee[];
  winners: WinnersState;
  selectedPrize: PrizeType;
  prizeConfig: Record<string, PrizeConfig>;
  setWinners: React.Dispatch<React.SetStateAction<WinnersState>>;
  setAvailableEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  setCancelledWinnerIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const useLotteryMechanics = ({
  availableEmployees,
  winners,
  selectedPrize,
  prizeConfig,
  setWinners,
  setAvailableEmployees,
  setCancelledWinnerIds,
}: UseLotteryMechanicsProps) => {
  const [currentNumber, setCurrentNumber] = useState<string>("HP00000");
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isWaitingForStop, setIsWaitingForStop] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Confirmation Modal State
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [pendingWinner, setPendingWinner] = useState<WinnerWithIndex | null>(null);
  const [showFireworks, setShowFireworks] = useState<boolean>(false);

  // Countdown Logic
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      const timer = setTimeout(() => {
        selectWinner();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Spinning Number Visual Effect
  useEffect(() => {
    if (isSpinning && countdown !== null && countdown > 0) {
      const interval = setInterval(() => {
        if (availableEmployees.length > 0) {
          const randomEmployee =
            availableEmployees[Math.floor(Math.random() * availableEmployees.length)];
          setCurrentNumber(randomEmployee.id);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isSpinning, countdown, availableEmployees]);

  const startSpin = (currentLabel: string) => {
    if (currentLabel === "-- Chọn giải thưởng --") {
      alert("Vui lòng chọn giải thưởng trong danh sách trước khi quay!");
      return;
    }
    if (winners[selectedPrize].length >= prizeConfig[selectedPrize].total) {
      alert("Đã hết số lần quay " + prizeConfig[selectedPrize].name);
      return;
    }
    setIsSpinning(true);
    setIsWaitingForStop(true);
    setCountdown(null);
  };

  const handleStopSpin = () => {
    setIsWaitingForStop(false);
    setCountdown(3);
  };

  const selectWinner = () => {
    if (availableEmployees.length === 0) {
      alert("Không còn nhân viên đủ điều kiện!");
      setIsSpinning(false);
      setCountdown(null);
      return;
    }

    if (winners[selectedPrize].length >= prizeConfig[selectedPrize].total) {
      alert("Đã hết số lần quay " + prizeConfig[selectedPrize].name);
      setIsSpinning(false);
      setCountdown(null);
      return;
    }

    const winnerIndex = availableEmployees.findIndex((emp) => emp.id === currentNumber);
    const finalIndex =
      winnerIndex !== -1
        ? winnerIndex
        : Math.floor(Math.random() * availableEmployees.length);
    const winner = availableEmployees[finalIndex];

    setCurrentNumber(winner.id);
    setPendingWinner({ ...winner, index: finalIndex });
    setIsSpinning(false);
    setCountdown(null);
    setShowFireworks(true);
    setShowConfirmation(true);
  };

  const handleConfirm = (scrollToPrize: (prize: PrizeType) => void) => {
    if (pendingWinner) {
      setWinners((prev) => ({
        ...prev,
        [selectedPrize]: [...prev[selectedPrize], pendingWinner],
      }));
      setAvailableEmployees((prev) =>
        prev.filter((emp) => emp.id !== pendingWinner.id)
      );
    }
    setShowConfirmation(false);
    setShowFireworks(false);
    setPendingWinner(null);
    scrollToPrize(selectedPrize);
  };

  const handleCancel = () => {
    if (pendingWinner) {
      setCancelledWinnerIds((prev) => [...prev, pendingWinner.id]);
      setAvailableEmployees((prev) =>
        prev.filter((emp) => emp.id !== pendingWinner.id)
      );
    }
    setShowConfirmation(false);
    setShowFireworks(false);
    setPendingWinner(null);
  };

  return {
    currentNumber,
    setCurrentNumber,
    isSpinning,
    isWaitingForStop,
    countdown,
    startSpin,
    handleStopSpin,
    showConfirmation,
    pendingWinner,
    showFireworks,
    handleConfirm,
    handleCancel,
  };
};