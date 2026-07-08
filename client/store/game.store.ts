import { EndGameData, IntermissionData } from "@/app/room/[roomId]/page";
import { IPlayers } from "@/components/DisplayScreen";
import { FeedMessage } from "@/components/LiveFeedPanel";
import { AVATARS } from "@/lib/avatar";
import { socket } from "@/lib/socket";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { create } from "zustand";

interface GameStore {
  hostName: string;
  setHostName: (name: string) => void;
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
  adminId: string;
  setAdminId: (id: string) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  status: string;
  setStatus: (status: string) => void;
  intermissionData: IntermissionData | null;
  setIntermissionData: (data: IntermissionData | null) => void;
  endGameData: EndGameData | null;
  setEndGameData: (data: EndGameData | null) => void;
  showAnswerPhase: boolean;
  setShowAnswerPhase: (show: boolean) => void;
  round: number;
  setRound: (round: number | ((prev: number) => number)) => void; // Supports direct values or functions like setRound(prev => prev + 1)
  imageUrl: string;
  setImageUrl: (url: string) => void;
  hint1: string;
  setHint1: (hint: string) => void;
  hint2: string;
  setHint2: (hint: string) => void;
  remainingTime: number;
  setRemainingTime: (time: number | ((prev: number) => number)) => void;
  takenAvatars: number[];
  setTakenAvatars: (avatars: number[]) => void;
  roomError: string;
  setRoomError: (error: string) => void;
  checkTakenAvatars: (roomId: string) => Promise<void>; // Added roomId argument here
  feedMessagesCollection: FeedMessage[];
  setFeedMessagesCollection: (messages: FeedMessage[] | ((prev: FeedMessage[]) => FeedMessage[])) => void;
  players: IPlayers[];
  setPlayers: (players: IPlayers[]) => void;
  getAdminIdandAvatar : (targetRoomId: string)=>Promise<void>,
  totalRounds : number;
  imagesInOneRound : number;
  maxPlayers : number;
  guessTime : number;
  setTotalRounds : (rounds : number)=>void;
  setImagesInOneRound : (images : number)=>void;
  setGuessTime : (time : number)=>void;
  setMaxPlayers : (players : number)=>void
}

export const useGameStore = create<GameStore>()((set) => ({
  // --- Initial States ---
  hostName: "",
  avatarUrl: "",
  adminId: "",
  isAdmin: false,
  status: "lobby",
  intermissionData: null,
  endGameData: null,
  showAnswerPhase: true,
  round: 1,
  imageUrl: "",
  hint1: "",
  hint2: "",
  remainingTime: 20,
  takenAvatars: [],
  roomError: "",
  feedMessagesCollection: [],
  players: [],
  totalRounds : 3,
  maxPlayers : 8,
  guessTime : 20,
  imagesInOneRound : 5,

  // --- Actions / Setters ---
  setHostName: (name) => set({ hostName: name }),
  setAvatarUrl: (url) => set({ avatarUrl: url }),
  setAdminId: (id) => set({ adminId: id }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setStatus: (status) => set({ status }),
  setIntermissionData: (intermissionData) => set({ intermissionData }),
  setEndGameData: (endGameData) => set({ endGameData }),
  setShowAnswerPhase: (showAnswerPhase) => set({ showAnswerPhase }),
  
  setRound: (round) =>
    set((state) => ({
      round: typeof round === "function" ? round(state.round) : round,
    })),
    
  setImageUrl: (imageUrl) => set({ imageUrl }),
  setHint1: (hint1) => set({ hint1 }),
  setHint2: (hint2) => set({ hint2 }),
  
  setRemainingTime: (remainingTime) =>
    set((state) => ({
      remainingTime: typeof remainingTime === "function" ? remainingTime(state.remainingTime) : remainingTime,
    })),
    
  setTakenAvatars: (takenAvatars) => set({ takenAvatars }),
  setRoomError: (roomError) => set({ roomError }),
  
  setFeedMessagesCollection: (messages) =>
    set((state) => ({
      feedMessagesCollection:
        typeof messages === "function" ? messages(state.feedMessagesCollection) : messages,
    })),
    
  setPlayers: (players) => set({ players }),
  setGuessTime : (time : number)=>set({guessTime : time}),
  setImagesInOneRound : (images : number)=>set({imagesInOneRound : images}),
  setMaxPlayers : (players : number)=>set({maxPlayers : players}),
  setTotalRounds : (rounds : number)=>set({totalRounds : rounds}),

  // --- Async Operations ---
  checkTakenAvatars: async (roomId: string) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/taken-avatars/${roomId}`);
      // Fallback map layout matching your original codebase structure
      const numericAvatars = res.data.takenAvatars.map((id: string) => Number(id));
      set({ takenAvatars: numericAvatars, roomError: "" });
    } catch (error) {
      const axiosError = error as AxiosError;
      console.log(axiosError)
      console.error("Inside join room error ", axiosError.response);
      set({ roomError: axiosError.message, takenAvatars: [] });
    }
  },
  getAdminIdandAvatar : async (targetRoomId: string) => {
    console.log("hello")
    try {
      const res = await axios.get(`http://localhost:5000/api/get-admin/${targetRoomId}`);
      console.log("Called api",res)
      const { adminId, avatarId, userName } = res.data;
      set({adminId,hostName : userName})
      
      // Target correct image URL structure out of layout matrix index array
      const foundAvatar = AVATARS.find(a => a.id === Number(avatarId));
      set({avatarUrl : foundAvatar ? foundAvatar.imageUrl : "https://api.dicebear.com/7.x/bottts/svg?seed=host"});
      
      if (adminId === socket.id) {
        set({isAdmin : true})
      }
    } catch (error) {
      toast.error("Failed to sync structural room admin vectors.");
    }
  }
}));