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

// Declare instance outside the component render cycle to prevent multi-connection leaks

export default function CreateRoomForm() {
    const [userName, setUserName] = useState<string>("");
    const [rounds, setRounds] = useState<number[]>([3]);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [avatarId, setAvatarId] = useState<number>(0);
    const { createRoom } = useRoomHandler(socket);
    const router = useRouter();

    useEffect(() => {
        // Handle listeners on mount
        socket.on('room_created', (data: { roomId: string }) => {
            const { roomId } = data;
            toast.success('Room Created successfully');
            router.push(`/room/${roomId}`);
        });

        socket.on('join_error', (data: { message: string }) => {
            const { message } = data;
            toast.error(message);
        });

        return () => {
            socket.off('room_created');
            socket.off('join_error');
        };
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
        <form onSubmit={submitHandler} className="space-y-6 max-w-md mx-auto p-4">
            <Field>
                <FieldLabel htmlFor="input-field-username">Username</FieldLabel>
                <Input
                    id="input-field-username"
                    type="text"
                    placeholder="Enter your username"
                    value={userName}
                    onChange={(e) => {
                        setUserName(e.target.value);
                        if (e.target.value !== "") setErrorMessage("");
                    }}
                />
                <FieldDescription>Choose a username.</FieldDescription>
                {errorMessage !== '' && userName === '' && <FieldError>{errorMessage}</FieldError>}
            </Field>

            <Field>
                <FieldLabel htmlFor="input-field-rounds">No of Rounds</FieldLabel>
                <span className="text-sm font-bold text-orange-500 ml-2">
                    {rounds[0]}
                </span>
                <Slider id='input-field-rounds' max={10} min={2} value={rounds} step={1} onValueChange={setRounds} />
                <FieldDescription>Select the number of rounds</FieldDescription>
            </Field>

            {/* Avatar Selection Grid */}
            <div>
                <label className="text-sm font-medium block mb-2">Choose Avatar</label>
                <div className="grid grid-cols-4 gap-2">
                    {AVATARS.map((a: Avatar) => {
                        const isSelected = avatarId === a.id;
                        const isAnySelected = avatarId !== 0;
                        const isGreyedOut = isAnySelected && !isSelected;

                        return (
                            <Card 
                                key={a.id} 
                                onClick={() => setAvatarId(a.id)}
                                className={`cursor-pointer transition-all duration-200 border-2 
                                    ${isSelected ? 'border-orange-500 bg-orange-500/10 scale-105 shadow-md' : 'border-slate-700'}
                                    ${isGreyedOut ? 'opacity-30 filter grayscale saturate-50' : 'opacity-100'}
                                `}
                            >
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

            <Button type='submit' className="w-full">Create Room</Button>
        </form>
    );
}