import Image from "next/image";

const ApplicationLogo = props => (
    <>
        <Image src="/inventory.png" alt={`IsDB-BISEW`} {...props} width={100} height={100}/>
    </>
)

export default ApplicationLogo
