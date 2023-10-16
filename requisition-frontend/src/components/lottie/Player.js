'use client';

if (typeof window !== 'undefined') import('@dotlottie/player-component');
export default function Player(props) {
    return (
        <div>
            <dotlottie-player
                src={props.src}
                autoplay={props.playbackOptions?.autoplay}
                defaultTheme={props.playbackOptions?.defaultTheme}
                direction={props.playbackOptions?.direction}
                hover={props.playbackOptions?.hover}
                intermission={props.playbackOptions?.intermission}
                loop={props.playbackOptions?.loop}
                playMode={props.playbackOptions?.playMode}
                speed={props.playbackOptions?.speed}
                controls={props.controls}
                light={props.light}
            ></dotlottie-player>
        </div>
    );
}
