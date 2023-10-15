import Lottie from "lottie-react";

const Loading = () => {
    return (
        <div className={`flex flex-row min-h-screen min-w-full justify-center items-center justify-items-center`}>
            <Lottie animationData={require('../../public/animation/loading_new.json')} loop={true} />
        </div>
    )
}
export default Loading;
