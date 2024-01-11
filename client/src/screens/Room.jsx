import React, {useCallback, useEffect, useState} from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from '../service/peer'
const Room=()=>{
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [mystream,setmystream]=useState(null)
    const [remotestream,setremotestream]=useState(null)

    const handleUserJoined = useCallback(({ email, id }) => {
        console.log(`Email ${email} joined room`);
        setRemoteSocketId(id);
    }, []);

    const handleCallUser = useCallback(async ()=>{
    const stream=await navigator.mediaDevices.getUserMedia({
        audio:true,
        video:true,
    });
    const offer=await peer.getOffer();
    socket.emit("user:call",{to:remoteSocketId,offer})
    setmystream(stream)
    },[remoteSocketId,socket]);
    const handleIncommingCall= useCallback(async ({from,offer})=>{
    setRemoteSocketId(from)
    const stream=await navigator.mediaDevices.getUserMedia({
        audio:true,
        video:true,
    });
    setmystream(stream)
    console.log(`Incoming Call`,from,offer)
    const ans = await peer.getanswer(offer)
    socket.emit('call:accepted',{to:from,ans})
    },[socket])
    const sendStreams=useCallback(()=>{
        for (const track of mystream.getTracks()){
            peer.peer.addTrack(track, mystream)
        }
    },[mystream])
    const handleCallaccepted=useCallback(({from,ans})=>{
        peer.setLocalDescription(ans)
        console.log("Call Accepted")
        sendStreams()
    },[sendStreams])

    const handleNegoNeeded=useCallback(async()=>{
        const offer=await peer.getOffer()
        socket.emit('peer:nego:needed',{offer, to: remoteSocketId})
    },[remoteSocketId,socket])

    const handleNegoNeedIncomming=useCallback(async ({from,offer})=>{
        const ans= await peer.getanswer(offer)
        socket.emit("peer:nego:done",{to:from,ans})
    },[socket])

    const handleNegoNeedFinal=useCallback(async ({ans})=>{
        await peer.setLocalDescription(ans)
    },[])
    useEffect(()=>{
        peer.peer.addEventListener("negotiationneeded",handleNegoNeeded)
        return ()=>{
            peer.peer.removeEventListener("negotiationneeded",handleNegoNeeded)
        }
    },[handleNegoNeeded])
    useEffect(()=>{
    peer.peer.addEventListener('track',async ev=>{
        const remotestream=ev.streams
        console.log("Got Tracks")
        setremotestream(remotestream[0])
    })
    },[])
    useEffect(()=>{
        socket.on("user:joined", handleUserJoined);
        socket.on("incomming:call",handleIncommingCall)
        socket.on("call:accepted",handleCallaccepted)
        socket.on("peer:nego:needed",handleNegoNeedIncomming)
        socket.on("peer:nego:final",handleNegoNeedFinal)
        return ()=>{
            socket.off("user:joined", handleUserJoined);
            socket.off("incomming:call",handleIncommingCall)
            socket.off("call:accepted",handleCallaccepted)
            socket.off("peer:nego:needed",handleNegoNeedIncomming)
            socket.off("peer:nego:final",handleNegoNeedFinal)

        }
    },[socket,handleUserJoined,handleIncommingCall,handleCallaccepted,handleNegoNeedIncomming,handleNegoNeedFinal])
    return (
        <div className="flex flex-col items-center justify-center">
            <h4 className="text-3xl font-bold">{remoteSocketId? 'Connected':'No One In The Room'}</h4>
            <div className="flex space-x-4">
                {mystream && <button className="mt-4 p-2  text-black rounded bg-blue-500 font-medium" onClick={sendStreams}>Send Stream</button>}
                {remoteSocketId && <button className="mt-4 p-2  text-black rounded bg-green-500 font-medium" onClick={handleCallUser}>CALL</button>}
            </div>
            <div className="mt-8 flex flex-row space-x-4">
                {
                    
                    mystream && (
                    <div className="flex flex-col space-y-4">
                    <h1 className="text-2xl font-semibold text-center">My Stream</h1>
                    <ReactPlayer playing='true' height="200px" width="300px" url={mystream}/>
                    </div>
                    )
                }
                {
                    
                    remotestream && (
                    <div className="flex flex-col space-y-4">
                    <h1 className="text-2xl font-semibold text-center">Remote Stream</h1>
                    <ReactPlayer playing='true' height="200px" width="300px" url={remotestream}/>
                    </div>
                    )
                }
            </div>
        </div>
    )
}

export default Room