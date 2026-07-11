import React, { useState, useEffect } from 'react';
import { Field, FieldLabel } from './ui/field';
import { Input } from './ui/input';
import { Avatar, AVATARS } from '@/lib/avatar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import Image from 'next/image';
import { Button } from './ui/button';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { useRoomHandler } from '@/hooks/useRoomHandler';
import { socket } from '@/lib/socket';
import { useGameStore } from '@/store/game.store';
import { useSocketListener } from '@/hooks/useSocketListener';

export default function JoinRoomForm() {
    const { joinRoom } = useRoomHandler(socket)
    const [userName, setUserName] = useState<string>("");
    const [roomId, setRoomId] = useState<string>("");
    const [avatarId, setAvatarId] = useState<number>(0);
    const { takenAvatars, roomError, checkTakenAvatars, setTakenAvatars, setRoomError } = useGameStore()
    const { joinSuccessListener, joinErrorListener } = useSocketListener(socket)
    // const [takenAvatars, setTakenAvatars] = useState<number[]>([]);
    // const [roomError, setRoomError] = useState<string>("");
    const router = useRouter();

    //  const checkTakenAvatars=async()=>{
    //     try {
    //         const res=await axios.get(`http://localhost:5000/api/taken-avatars/${roomId}`)
    //         const numericAvatars = res.data.takenAvatars.map((id: string) => Number(id));
    //         setTakenAvatars(numericAvatars)
    //         setRoomError("")
    //     } catch (error) {
    //         const axiosError=error as AxiosError
    //         console.log("Inside join room error ",axiosError.response)
    //         setRoomError(axiosError.message)
    //         setTakenAvatars([])
    //     }
    // }

    useEffect(() => {
        // Query taken items from Redis as soon as room code matches structural limit
        if (roomId.length === 6) {
            checkTakenAvatars(roomId)
        } else {
            setTakenAvatars([]);
            setRoomError("");
        }
    }, [roomId]);

    useEffect(() => {
        // Bind the listeners and capture their cleanup functions
        const cleanJoinSuccess = joinSuccessListener();
        const cleanJoinError = joinErrorListener();

        // Clean up the event listeners on unmount or before re-running
        return () => {
            if (cleanJoinSuccess) cleanJoinSuccess();
            if (cleanJoinError) cleanJoinError();
        };
    }, []); // Remove [router, roomId] so it binds exactly ONCE on mount

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userName.trim() || roomId.length !== 6 || avatarId === 0 || roomError) {
            return toast.error("Please fill all properties correctly.");
        }

        let userId = localStorage.getItem('game_user_id');
        if (!userId) {
            userId = 'usr_' + Math.random().toString(36).substring(2, 11);
            localStorage.setItem('game_user_id', userId);
        }
        joinRoom(userName, roomId, avatarId, userId)
    };

    return (
        <form onSubmit={handleJoin} className="space-y-6 max-w-md mx-auto p-6 bg-slate-950/80 border-2 border-indigo-500/30 rounded-2xl shadow-xl shadow-indigo-500/5 relative backdrop-blur-md overflow-hidden group">
            {/* Top Decorative Indigo Cyber-Glow Accent */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

            {/* Room Code Target Input Field */}
            <Field className="space-y-1.5">
                <FieldLabel htmlFor="join-room-id" className="text-xs uppercase font-extrabold tracking-wider text-slate-300 group-focus-within:text-indigo-400 transition-colors">
                    🛰️ Broadcast Channel Code
                </FieldLabel>
                <Input
                    id="join-room-id"
                    type="text"
                    maxLength={6}
                    placeholder="ENTER 6-LETTER VECTOR..."
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    className={`bg-slate-900/60 border-2 uppercase font-mono tracking-widest placeholder:text-slate-600 text-sm text-white focus:ring-0 rounded-xl transition-all duration-200
                        ${roomError
                            ? "border-red-500 focus:border-red-500 shadow-md shadow-red-500/10"
                            : "border-slate-800 focus:border-indigo-500 focus:shadow-md focus:shadow-indigo-500/10"
                        }`}
                />
                {roomError && (
                    <p className="text-xs font-bold text-red-500 flex items-center mt-1 animate-pulse">
                        ⚠️ CHANNEL ERROR: {roomError}
                    </p>
                )}
            </Field>

            {/* Username Selection Block */}
            <Field className="space-y-1.5">
                <FieldLabel htmlFor="join-username" className="text-xs uppercase font-extrabold tracking-wider text-slate-300">
                    ✦ Player Codename
                </FieldLabel>
                <Input
                    id="join-username"
                    type="text"
                    placeholder="ENTER CODENAME..."
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="bg-slate-900/60 border-2 border-slate-800 focus:border-indigo-500 focus:shadow-md focus:shadow-indigo-500/10 focus:ring-0 uppercase font-mono tracking-wide placeholder:text-slate-600 text-sm text-white rounded-xl transition-all duration-200"
                />
            </Field>

            {/* Avatar Picker Gallery Registry */}
            <div className="space-y-3">
                <label className="text-xs uppercase font-extrabold tracking-wider text-slate-300 block">
                    🧬 Claim Profile Frame
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                    {AVATARS.map((a: Avatar) => {
                        const isTaken = takenAvatars.includes(a.id);
                        const isSelected = avatarId === a.id;
                        const isAnySelected = avatarId !== 0;
                        const isGreyedOut = (isAnySelected && !isSelected) || isTaken;

                        return (
                            <Card
                                key={a.id}
                                onClick={() => !isTaken && setAvatarId(a.id)}
                                className={`transition-all duration-300 border-2 rounded-xl overflow-hidden relative group/card
                                    ${isTaken
                                        ? 'bg-red-950/5 border-red-950/40 cursor-not-allowed select-none'
                                        : 'bg-slate-900/40 cursor-pointer'
                                    }
                                    ${isSelected
                                        ? 'border-indigo-500 bg-indigo-500/10 scale-105 shadow-lg shadow-indigo-500/10 z-10'
                                        : !isTaken ? 'border-slate-900 hover:border-slate-700 hover:scale-[1.02]' : ''
                                    }
                                    ${isGreyedOut ? 'opacity-30 filter grayscale saturate-50' : 'opacity-100'}
                                `}
                            >
                                {/* Micro Corner Ribbon Tag Indicators */}
                                {isTaken ? (
                                    <span className="absolute top-0 right-0 bg-red-600/90 text-[7px] text-white px-1 py-0.5 font-black uppercase rounded-bl-md tracking-wider shadow-sm z-20">
                                        LOCKED
                                    </span>
                                ) : isSelected ? (
                                    <div className="absolute top-0 right-0 w-3 h-3 bg-indigo-500 rounded-bl-md shadow-sm z-20" />
                                ) : null}

                                <CardHeader className="p-1.5 text-center bg-slate-950/60 border-b border-slate-900/40">
                                    <CardTitle className={`text-[10px] font-bold tracking-tight truncate transition-colors
                                        ${isTaken
                                            ? 'text-red-500/70'
                                            : isSelected ? 'text-indigo-400' : 'text-slate-400 group-hover/card:text-slate-200'
                                        }`}>
                                        {a.name}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="flex justify-center p-2.5 bg-transparent">
                                    <div className={`relative rounded-full p-0.5 transition-all duration-300 border
                                        ${isSelected
                                            ? 'border-indigo-400 scale-110 shadow-sm shadow-indigo-400/20'
                                            : isTaken ? 'border-red-950' : 'border-slate-800'
                                        }`}>
                                        <Image
                                            src={a.imageUrl}
                                            alt={a.name}
                                            height={44}
                                            width={44}
                                            className="rounded-full bg-slate-950 object-cover"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Submition Dispatch Gateway Button */}
            <Button
                type='submit'
                disabled={!!roomError || avatarId === 0 || !userName.trim() || roomId.length < 4}
                className="w-full py-6 mt-2 bg-gradient-to-r from-indigo-600 to-violet-500 hover:from-indigo-500 hover:to-violet-400 disabled:from-slate-900 disabled:to-slate-900 text-slate-950 disabled:text-slate-600 font-black tracking-widest text-sm uppercase rounded-xl border border-indigo-400/20 hover:border-indigo-400/40 shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 transform active:scale-95 cursor-pointer"
            >
                ⚡ Infiltrate Match Vector ⚡
            </Button>
        </form>
    );
}