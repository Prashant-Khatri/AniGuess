import React, { useState, useEffect } from 'react';
import { Field, FieldDescription, FieldError, FieldLabel } from './ui/field';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Avatar, AVATARS } from '@/lib/avatar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import Image from 'next/image';
import { Button } from './ui/button';
import toast from 'react-hot-toast';
import { useRoomHandler } from '@/hooks/useRoomHandler';
import { useRouter } from 'next/navigation';
import { socket } from '@/lib/socket';
import { useSocketListener } from '@/hooks/useSocketListener';

// Declare instance outside the component render cycle to prevent multi-connection leaks

export default function CreateRoomForm() {
    const [userName, setUserName] = useState<string>("");
    const [rounds, setRounds] = useState<number[]>([3]);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [avatarId, setAvatarId] = useState<number>(0);
    const { createRoom } = useRoomHandler(socket);
    const router = useRouter();
    const {roomCreatedListener,joinErrorListener}=useSocketListener(socket)

    useEffect(() => {
        // Handle listeners on mount
        roomCreatedListener()
        joinErrorListener()
    }, [router]);

    const submitHandler = (e: React.FormEvent) => {
        e.preventDefault(); // ◄ Prevents page reload
        
        if (userName.trim() === "") {
            setErrorMessage('Username can\'t be empty');
            return;
        }
        if (avatarId === 0) {
            toast.error('Please select an avatar');
            return;
        }

        // Persistent Unique Identification Engine
        let userId = localStorage.getItem('game_user_id');
        if (!userId) {
            userId = 'usr_' + Math.random().toString(36).substring(2, 11);
            localStorage.setItem('game_user_id', userId);
        }

        createRoom(userName, rounds[0], avatarId, userId);
    };

    return (
        <form onSubmit={submitHandler} className="space-y-6 max-w-md mx-auto p-6 bg-slate-950/80 border-2 border-orange-500/30 rounded-2xl shadow-xl shadow-orange-500/5 relative backdrop-blur-md overflow-hidden group">
            {/* Top Decorative Cyberpunk/Anime Border Accent */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
            
            {/* Username Input Field Block */}
            <Field className="space-y-1.5">
                <div className="flex justify-between items-center">
                    <FieldLabel htmlFor="input-field-username" className="text-xs uppercase font-extrabold tracking-wider text-slate-300 group-focus-within:text-orange-400 transition-colors">
                        ✦ Player Codename
                    </FieldLabel>
                </div>
                <Input
                    id="input-field-username"
                    type="text"
                    placeholder="ENTER CODENAME..."
                    value={userName}
                    onChange={(e) => {
                        setUserName(e.target.value);
                        if (e.target.value !== "") setErrorMessage("");
                    }}
                    className={`bg-slate-900/60 border-2 uppercase font-mono tracking-wide placeholder:text-slate-600 text-sm text-white focus:ring-0 rounded-xl transition-all duration-200
                        ${errorMessage !== '' && userName === '' 
                            ? 'border-red-500 focus:border-red-500 shadow-md shadow-red-500/10' 
                            : 'border-slate-800 focus:border-orange-500 focus:shadow-md focus:shadow-orange-500/10'
                        }`}
                />
                <FieldDescription className="text-[11px] font-medium text-slate-500 tracking-normal">
                    This moniker will identify your statistics on the public scoreboard matrix.
                </FieldDescription>
                {errorMessage !== '' && userName === '' && (
                    <FieldError className="text-xs font-bold text-red-500 flex items-center mt-1 animate-pulse">
                        ⚠️ {errorMessage}
                    </FieldError>
                )}
            </Field>

            {/* Match Rounds Configurations */}
            <Field className="space-y-2">
                <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="input-field-rounds" className="text-xs uppercase font-extrabold tracking-wider text-slate-300">
                        ⚔️ Combat Rounds
                    </FieldLabel>
                    <span className="text-sm font-black font-mono bg-orange-500/10 text-orange-400 px-2.5 py-0.5 rounded-md border border-orange-500/30 shadow-sm animate-pulse">
                        {rounds[0]} MATCHES
                    </span>
                </div>
                <div className="py-2 px-1">
                    <Slider 
                        id='input-field-rounds' 
                        max={10} 
                        min={2} 
                        value={rounds} 
                        step={1} 
                        onValueChange={setRounds}
                        className="cursor-pointer tracking-wide uppercase accent-orange-500"
                    />
                </div>
                <FieldDescription className="text-[11px] font-medium text-slate-500">
                    Defines the total unique character sequences to pop out of the Redis database queue.
                </FieldDescription>
            </Field>

            {/* Dynamic Card Selection Gallery Wrapper Container */}
            <div className="space-y-3">
                <label className="text-xs uppercase font-extrabold tracking-wider text-slate-300 block">
                    🧬 Select Avatar Frame
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                    {AVATARS.map((a: Avatar) => {
                        const isSelected = avatarId === a.id;
                        const isAnySelected = avatarId !== 0;
                        const isGreyedOut = isAnySelected && !isSelected;

                        return (
                            <Card 
                                key={a.id} 
                                onClick={() => setAvatarId(a.id)}
                                className={`cursor-pointer transition-all duration-300 border-2 rounded-xl overflow-hidden relative group/card
                                    ${isSelected 
                                        ? 'border-orange-500 bg-orange-500/10 scale-105 shadow-lg shadow-orange-500/10 z-10' 
                                        : 'border-slate-900 bg-slate-900/40 hover:border-slate-700 hover:scale-[1.02]'
                                    }
                                    ${isGreyedOut ? 'opacity-30 filter grayscale saturate-50' : 'opacity-100'}
                                `}
                            >
                                {/* Diagonal Neon Marker Backdrop Corner Ribbon Accent */}
                                {isSelected && (
                                    <div className="absolute top-0 right-0 w-3 h-3 bg-orange-500 rounded-bl-md shadow-sm" />
                                )}
                                <CardHeader className="p-1.5 text-center bg-slate-950/60 border-b border-slate-900/40">
                                    <CardTitle className={`text-[10px] font-bold tracking-tight truncate transition-colors
                                        ${isSelected ? 'text-orange-400' : 'text-slate-400 group-hover/card:text-slate-200'}`}>
                                        {a.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex justify-center p-2.5 bg-transparent">
                                    <div className={`relative rounded-full p-0.5 transition-all duration-300 border
                                        ${isSelected ? 'border-orange-400 scale-110 shadow-sm shadow-orange-400/20' : 'border-slate-800'}`}>
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

            {/* Interactive Neon Dispatch Call Button Trigger */}
            <Button 
                type='submit' 
                disabled={!userName.trim() || avatarId === 0}
                className="w-full py-6 mt-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 disabled:from-slate-900 disabled:to-slate-900 text-slate-950 disabled:text-slate-600 font-black tracking-widest text-sm uppercase rounded-xl border border-orange-400/20 hover:border-orange-400/40 shadow-lg hover:shadow-orange-500/20 transition-all duration-300 transform active:scale-95 cursor-pointer"
            >
                ⚡ Initialize Room Vector ⚡
            </Button>
        </form>
    );
}