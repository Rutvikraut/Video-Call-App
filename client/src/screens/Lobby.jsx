import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

const Lobby = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/room/${room}`);
    },[navigate]
  );

  useEffect(()=>{
    socket.on("room:join",handleJoinRoom);
    return ()=>{
      socket.off('room:join',handleJoinRoom)
    }
  },[socket,handleJoinRoom])

  return (
    <div className="w-4/12 grid gap-8 p-12 rounded-xl backdrop-blur-sm bg-white/30 shadow-xl">
      <h1 className="text-center text-3xl font-sans font-bold">Lobby</h1>
      <form onSubmit={handleSubmitForm}>
        <div className="grid grid-cols-2">
          <div className="grid gap-y-4">
            <label className="text-xl font-medium" htmlFor="email">Email ID</label>
            <label className="text-xl font-medium" htmlFor="room">Room Number</label>
          </div>
          <div className="grid gap-y-4">
            <input className="rounded indent-2.5 outline-none"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input className="rounded indent-2.5 outline-none"
              type="text"
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex justify-center mt-8">
          <button className="py-2 px-5 bg-black text-white text-center font-medium rounded">Join</button>
        </div>
      </form>
      
    </div>
  );
};

export default Lobby;