'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Field, FieldLabel } from './ui/field';
import { Input } from './ui/input';
import { Avatar, AVATARS } from '@/lib/avatar';
import Image from 'next/image';
import { Button } from './ui/button';
import toast from 'react-hot-toast';
import { useRoomHandler } from '@/hooks/useRoomHandler';
import { socket } from '@/lib/socket';
import { useGameStore } from '@/store/game.store';
import { useSocketListener } from '@/hooks/useSocketListener';

export default function JoinRoomForm() {
    const { joinRoom } = useRoomHandler(socket)
    const [userName, setUserName] = useState<string>("");
    const [roomId, setRoomId] = useState<string>("");
    const [avatarId, setAvatarId] = useState<number>(0);
    const takenAvatars = useGameStore((state) => state.takenAvatars);
    const roomError = useGameStore((state) => state.roomError);
    const checkTakenAvatars = useGameStore((state) => state.checkTakenAvatars);
    const setTakenAvatars = useGameStore((state) => state.setTakenAvatars);
    const setRoomError = useGameStore((state) => state.setRoomError);
    const userIdRef = useRef<string | null>(null);
    const { joinSuccessListener, joinErrorListener } = useSocketListener(socket)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            let userId = localStorage.getItem('game_user_id');
            if (!userId) {
                userId = 'usr_' + Math.random().toString(36).substring(2, 11);
                localStorage.setItem('game_user_id', userId);
            }
            userIdRef.current = userId;
        }
    }, []);
    useEffect(() => {
        if (roomId.length === 6) {
            checkTakenAvatars(roomId)
        } else {
            setTakenAvatars([]);
            setRoomError("");
        }
    }, [roomId]);
    useEffect(() => {
        const cleanJoinSuccess = joinSuccessListener();
        const cleanJoinError = joinErrorListener();
        return () => {
            if (cleanJoinSuccess) cleanJoinSuccess();
            if (cleanJoinError) cleanJoinError();
        };
    }, []);
    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userName.trim() || roomId.length !== 6 || avatarId === 0 || roomError) {
            return toast.error("Please fill all properties correctly.");
        }
        joinRoom(userName, roomId, avatarId, userIdRef.current || "")
    };
    return (
        <form
            onSubmit={handleJoin}
            className="space-y-6 max-w-md mx-auto p-6 bg-white border-4 border-slate-950 rounded-2xl shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] relative overflow-hidden select-none"
        >
            <div className="absolute top-0 left-0 w-full h-[6px] bg-red-600" />
            <Field className="space-y-1.5">
                <FieldLabel
                    htmlFor="join-room-id"
                    className="text-xs uppercase font-mono font-black tracking-widest text-slate-950 group-focus-within:text-red-600 transition-colors"
                >
                    Room Code
                </FieldLabel>
                <Input
                    id="join-room-id"
                    type="text"
                    maxLength={6}
                    placeholder="ENTER 6-LETTER CODE..."
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    className={`w-full px-3 py-2.5 bg-slate-50 border-2 uppercase font-mono font-bold tracking-widest placeholder:text-slate-400 text-sm text-slate-950 focus:outline-none focus:ring-0 rounded-xl transition-all duration-150
        ${roomError
                            ? "border-red-600 bg-red-50 focus:border-red-600 shadow-[2px_2px_0px_0px_rgba(220,38,38,1)]"
                            : "border-slate-950 focus:border-red-600 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        }`}
                />
                {roomError && (
                    <p className="text-xs font-mono font-black text-red-600 flex items-center mt-1 animate-pulse">
                        INVALID CODE: {roomError}
                    </p>
                )}
            </Field>
            <Field className="space-y-1.5">
                <FieldLabel
                    htmlFor="join-username"
                    className="text-xs uppercase font-mono font-black tracking-widest text-slate-950"
                >
                    Player Name
                </FieldLabel>
                <Input
                    id="join-username"
                    type="text"
                    placeholder="ENTER YOUR NAME..."
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-950 focus:border-red-600 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-0 font-mono font-bold tracking-wide placeholder:text-slate-400 text-sm text-slate-950 rounded-xl transition-all duration-150"
                />
            </Field>
            <div className="space-y-3">
                <label className="text-xs uppercase font-mono font-black tracking-widest text-slate-950 block">
                    Choose Avatar
                </label>

                <div className="grid grid-cols-5 gap-2.5 w-full max-w-md mx-auto aspect-[5/4] overflow-hidden">
                    {AVATARS.map((a: Avatar) => {
                        const isTaken = takenAvatars.includes(a.id);
                        const isSelected = avatarId === a.id;
                        const isGreyedOut = (avatarId !== 0 && !isSelected) || isTaken;
                        return (
                            <button
                                key={a.id}
                                type="button"
                                disabled={isTaken}
                                onClick={() => !isTaken && setAvatarId(a.id)}
                                className={`relative aspect-square w-full rounded-xl overflow-hidden border-2 transition-all duration-200 outline-none group
              ${isTaken
                                        ? 'border-slate-300 bg-slate-100 cursor-not-allowed'
                                        : isSelected
                                            ? 'border-red-600 bg-red-50 scale-105 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10 cursor-pointer'
                                            : 'border-slate-950 bg-white hover:border-red-600 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer'
                                    }
              ${isGreyedOut ? 'opacity-40 filter grayscale contrast-125' : 'opacity-100'}
            `}
                                title={isTaken ? `${a.name} (Taken)` : a.name}
                            >
                                <Image
                                    src={a.imageUrl}
                                    alt={a.name}
                                    fill
                                    sizes="(max-width: 768px) 20vw, 80px"
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                {isTaken ? (
                                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[0.5px] flex items-center justify-center z-20">
                                        <span className="bg-red-600 border border-slate-950 text-[7px] text-white px-1 py-0.5 font-mono font-black uppercase rounded tracking-wider shadow-sm">
                                            TAKEN
                                        </span>
                                    </div>
                                ) : isSelected ? (
                                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 border border-white rounded-full shadow-sm animate-pulse z-20" />
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            </div>
            <Button
                type="submit"
                disabled={!!roomError || avatarId === 0 || !userName.trim() || roomId.length < 4}
                className="w-full py-4 mt-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-100 text-white disabled:text-slate-400 font-mono font-black tracking-wider text-xs uppercase rounded-xl border-4 border-slate-950 disabled:border-slate-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:shadow-none hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all duration-150 cursor-pointer"
            >
                Join Lobby
            </Button>
        </form>
    );
}