import React from "react";
import Player from "@/components/lottie/Player";

const Loading = () => {
    return (
        <div className={`flex flex-row min-h-screen min-w-full justify-center items-center justify-items-center`}>
            <Player
                src="/animation/lnr8f7at.lottie"
                playbackOptions={{
                    autoplay: true,
                    speed: 1,
                    light: true
                }}
            />
        </div>
    )
}
export default Loading;
