'use client'
import Image from "next/image";
import { useEffect } from "react";
import {io} from 'socket.io-client'

export default function Home() {
  useEffect(() => {
    // Connect to the Express server port (e.g., 5000), NOT 3000
    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("Connected to backend! My ID is:", socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  return (
    <div>Tera Bhai Seedhe maut</div>
  );
}
