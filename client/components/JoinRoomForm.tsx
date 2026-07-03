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

export default function JoinRoomForm() {
    const {joinRoom}=useRoomHandler(socket)
    const [userName, setUserName] = useState<string>("");
    const [roomId, setRoomId] = useState<string>("");
    const [avatarId, setAvatarId] = useState<number>(0);
    const [takenAvatars, setTakenAvatars] = useState<number[]>([]);
    const [roomError, setRoomError] = useState<string>("");
    const router = useRouter();

     const checkTakenAvatars=async()=>{
        try {
            const res=await axios.get(`http://localhost:5000/api/taken-avatars/${roomId}`)
            const numericAvatars = res.data.takenAvatars.map((id: string) => Number(id));
            setTakenAvatars(numericAvatars)
            setRoomError("")
        } catch (error) {
            const axiosError=error as AxiosError
            console.log("Inside join room error ",axiosError.response)
            setRoomError(axiosError.message)
            setTakenAvatars([])
        }
    }

    useEffect(() => {
        // Query taken items from Redis as soon as room code matches structural limit
        if (roomId.length === 6) {
            console.log("RoomId is : ",roomId)
            checkTakenAvatars()
        } else {
            setTakenAvatars([]);
            setRoomError("");
        }
    }, [roomId]);

    useEffect(() => {
        socket.on('join_success', () => {
            toast.success('Room Joined successfully')
            router.push(`/room/${roomId.toUpperCase()}`);
        });

        socket.on('join_error', (data: { message: string }) => {
            toast.error(data.message);
        });

        return () => {
            socket.off('join_success');
            socket.off('join_error');
        };
    }, [router, roomId]);

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
        joinRoom(userName,roomId,avatarId,userId)
    };

    return (
        <form onSubmit={handleJoin} className="space-y-6 max-w-md mx-auto p-4">
            <Field>
                <FieldLabel htmlFor="join-room-id">Room Code</FieldLabel>
                <Input
                    id="join-room-id"
                    type="text"
                    maxLength={6}
                    placeholder="ENTER 6-LETTER CODE"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    className={roomError ? "border-red-500 focus:border-red-500" : ""}
                />
                {roomError && <p className="text-xs text-red-500 mt-1">⚠ {roomError}</p>}
            </Field>

            <Field>
                <FieldLabel htmlFor="join-username">Username</FieldLabel>
                <Input
                    id="join-username"
                    type="text"
                    placeholder="Enter your username"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                />
            </Field>

            {/* Avatar Picker with Claim Guard and Selection Highlight */}
            <div>
                <label className="text-sm font-medium block mb-2">Choose Avatar</label>
                <div className="grid grid-cols-4 gap-2">
                    {AVATARS.map((a: Avatar) => {
                        const isTaken = takenAvatars.includes(a.id);
                        const isSelected = avatarId === a.id;
                        const isAnySelected = avatarId !== 0;
                        const isGreyedOut = (isAnySelected && !isSelected) || isTaken;

                        return (
                            <Card 
                                key={a.id} 
                                onClick={() => !isTaken && setAvatarId(a.id)}
                                className={`relative transition-all duration-200 border-2 
                                    ${isTaken ? 'bg-red-950/10 border-red-900/50 cursor-not-allowed' : 'cursor-pointer'}
                                    ${isSelected ? 'border-indigo-500 bg-indigo-500/10 scale-105 shadow-md' : 'border-slate-700'}
                                    ${isGreyedOut ? 'opacity-30 filter grayscale' : 'opacity-100'}
                                `}
                            >
                                {isTaken && (
                                    <span className="absolute top-0 right-0 bg-red-600 text-[8px] text-white px-1 font-bold uppercase rounded-bl">
                                        Taken
                                    </span>
                                )}
                                <CardHeader className="p-2 text-center">
                                    <CardTitle className="text-xs truncate">{a.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex justify-center p-2 pb-3">
                                    <Image src={a.imageUrl} alt={a.name} height={40} width={40} className="rounded-full" />
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            <Button type='submit' disabled={!!roomError || avatarId === 0 || !userName} className="w-full">
                Join Match
            </Button>
        </form>
    );
}