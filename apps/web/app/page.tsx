import Image from "next/image";
import { CreateRoom } from "../components/CreateRoom";
import { JoinRoom } from "../components/JoinRoom";
export default function Home() {
  return (
    <div className="h-screen px-2 sm:px-24 pt-2 md:pt-4 overflow-hidden">
      <div className="flex mt-8 md:justify-between justify-center text-yellow-300">
        <h1 className="font-bold text-3xl md:text-2xl">VIBESYNC</h1>
        <div className="hidden md:block">
          <CreateRoom />
        </div>
      </div>
      <div className="flex md:flex-row flex-col justify-center items-center lg:justify-between md:items-start md:gap-14">
        <div className="pt-8 md:pt-24 lg:pt-32">
          <p className="font-bold text-[5vw] sm:text-[4vw] lg:text-[3.5vw] text-center md:text-left text-white md:leading-tight">
            <span className="tracking-wider"> Sync your chat </span>
            <span className="hidden md:inline">
              <br />
            </span>
            with music vibes
          </p>
          <p className="md:pt-4 mb-6 text-[3.5vw] sm:text-lg md:text-xl lg:text-[1.5vw] text-center md:text-left text-gray-300">
            Experience seamless chat synchronization
          </p>
          <div className="flex pt-4 justify-center md:justify-start gap-3 md:gap-0">
            <div className="md:hidden">
              <CreateRoom />
            </div>
            <JoinRoom />
          </div>
        </div>
        <div className="pt-2 w-[500px] md:w-[400px] h-[350px] md:h-[450px] lg:h-[550px] relative">
          <Image
            className="rounded-lg object-contain"
            src="/VibeSync-3d-highres.png"
            alt="Landing Page Image"
            fill
          />
        </div>
      </div>
      <div className=" w-full lg:pt-8 flex flex-col justify-center items-center">
        <p className="text-gray-300 text-md font-medium">
          Find your rhythm with VibeSync
        </p>
      </div>{" "}
    </div>
  );
}
