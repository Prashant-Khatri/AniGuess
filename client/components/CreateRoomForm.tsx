import React, { useState, useEffect } from 'react';
import { Field, FieldDescription, FieldError, FieldLabel } from './ui/field';
import { Input } from './ui/input';
import { Avatar, AVATARS } from '@/lib/avatar';
import Image from 'next/image';
import { Button } from './ui/button';
import toast from 'react-hot-toast';
import { useRoomHandler } from '@/hooks/useRoomHandler';
import { useRouter } from 'next/navigation';
import { socket } from '@/lib/socket';
import { useSocketListener } from '@/hooks/useSocketListener';
interface AvatarGridProps {
    avatarId: number;
    setAvatarId: (id: number) => void;
}
const AvatarGrid = React.memo(function AvatarGrid({ avatarId, setAvatarId }: AvatarGridProps) {
    const isAnySelected = avatarId !== 0;
    return (
        <div className="grid grid-cols-5 gap-2.5 w-full max-w-md mx-auto aspect-[5/4] overflow-hidden">
            {AVATARS.map((a: Avatar) => {
                const isSelected = avatarId === a.id;
                const isGreyedOut = isAnySelected && !isSelected;

                return (
                    <button
                        key={a.id}
                        type="button"
                        onClick={() => setAvatarId(a.id)}
                        className={`relative aspect-square w-full rounded-xl overflow-hidden border-2 transition-all duration-200 outline-none cursor-pointer group
          ${isSelected
                                ? 'border-red-600 bg-red-50 scale-105 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10'
                                : 'border-slate-950 bg-white hover:border-red-600 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            }
          ${isGreyedOut ? 'opacity-40 filter grayscale contrast-125' : 'opacity-100'}
        `}
                        title={a.name}
                    >
                        <Image
                            src={a.imageUrl}
                            alt={a.name}
                            fill
                            sizes="(max-width: 768px) 20vw, 80px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {isSelected && (
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 border border-white rounded-full shadow-sm animate-pulse" />
                        )}
                    </button>
                );
            })}
        </div>
    );
});
export default function CreateRoomForm() {
    const [userName, setUserName] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [avatarId, setAvatarId] = useState<number>(0);
    const { createRoom } = useRoomHandler(socket);
    const { roomCreatedListener, joinErrorListener } = useSocketListener(socket);
    useEffect(() => {
        const cleanRoomCreated = roomCreatedListener();
        const cleanJoinError = joinErrorListener();
        return () => {
            if (cleanRoomCreated) cleanRoomCreated();
            if (cleanJoinError) cleanJoinError();
        };
    }, []);
    const submitHandler = (e: React.FormEvent) => {
        e.preventDefault();
        if (userName.trim() === "") {
            setErrorMessage('Username can\'t be empty');
            return;
        }
        if (avatarId === 0) {
            toast.error('Please select an avatar');
            return;
        }
        let userId = localStorage.getItem('game_user_id');
        if (!userId) {
            userId = 'usr_' + Math.random().toString(36).substring(2, 11);
            localStorage.setItem('game_user_id', userId);
        }
        createRoom(userName, avatarId, userId);
    };

    return (
        <form
            onSubmit={submitHandler}
            className="space-y-6 max-w-md mx-auto p-6 bg-white border-4 border-slate-950 rounded-2xl shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] relative overflow-hidden select-none"
        >
            <div className="absolute top-0 left-0 w-full h-[6px] bg-red-600" />

            <Field className="space-y-1.5">
                <div className="flex justify-between items-center">
                    <FieldLabel
                        htmlFor="input-field-username"
                        className="text-xs uppercase font-mono font-black tracking-widest text-slate-950 group-focus-within:text-red-600 transition-colors"
                    >
                        Player Name
                    </FieldLabel>
                </div>
                <Input
                    id="input-field-username"
                    type="text"
                    placeholder="ENTER YOUR NAME..."
                    value={userName}
                    onChange={(e) => {
                        setUserName(e.target.value);
                        if (e.target.value !== "") setErrorMessage("");
                    }}
                    className={`w-full px-3 py-2.5 bg-slate-50 border-2 font-mono font-bold tracking-wide placeholder:text-slate-400 text-sm text-slate-950 focus:outline-none focus:ring-0 rounded-xl transition-all duration-150
        ${errorMessage !== '' && userName === ''
                            ? 'border-red-600 bg-red-50 focus:border-red-600 shadow-[2px_2px_0px_0px_rgba(220,38,38,1)]'
                            : 'border-slate-950 focus:border-red-600 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        }`}
                />
                <FieldDescription className="text-[11px] font-mono font-bold text-slate-500 tracking-tight">
                    This name will be shown directly on the live leaderboard.
                </FieldDescription>
                {errorMessage !== '' && userName === '' && (
                    <FieldError className="text-xs font-mono font-black text-red-600 flex items-center mt-1 animate-pulse">
                        ⚠️ {errorMessage}
                    </FieldError>
                )}
            </Field>
            <div className="space-y-3">
                <label className="text-xs uppercase font-mono font-black tracking-widest text-slate-950 block">
                    Select Avatar
                </label>
                <AvatarGrid avatarId={avatarId} setAvatarId={setAvatarId} />
            </div>
            <Button
                type="submit"
                disabled={!userName.trim() || avatarId === 0}
                className="w-full py-4 mt-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-100 text-white disabled:text-slate-400 font-mono font-black tracking-wider text-xs uppercase rounded-xl border-4 border-slate-950 disabled:border-slate-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:shadow-none hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all duration-150 cursor-pointer"
            >
                Enter Lobby
            </Button>
        </form>
    );
}