import Image from "next/image";
import { CreateRoom } from "../components/CreateRoom";
import { JoinRoom } from "../components/JoinRoom";
export default function Home() {
  return (
    <div className="h-screen overflow-hidden ">
      <div className="flex mt-8 justify-between px-20">
        <h1 className="font-bold text-xl">VIBESYNC</h1>
        <CreateRoom />
      </div>
      <div className="flex justify-between px-20">
        <div className="pt-32">
          <p className="font-bold text-5xl">
            <span className="mb-2"> Sync your chat </span> <br /> with music
            vibes
          </p>
          <p className="pt-2 mb-6 text-gray-600">
            Experience seamless chat synchronization
          </p>
          <JoinRoom />
        </div>
        <div className="mt-28 relative w-[400px] h-[400px]">
          <div className="bg-sky-400 h-[260px] w-[400px] rounded-lg -top-7 left-5 absolute object-cover z-0"></div>
          <Image
            className="rounded-lg absolute top-0 bottom-0 left-0 object-cover z-10"
            src="/landingpagepic1.png"
            alt="Landing Page Image"
            width={400}
            height={400}
          />
        </div>
      </div>
      <div className="bg-sky-400 w-full h-44 mx-0 flex flex-col justify-center items-center">
        <p className="text-white text-lg font-medium">
          Find your rhythm with VibeSync
        </p>
      </div>
    </div>
  );
}
