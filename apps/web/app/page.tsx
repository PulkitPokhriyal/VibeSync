import Image from "next/image";
import { CreateRoom } from "../components/CreateRoom";
import { JoinRoom } from "../components/JoinRoom";
export default function Home() {
  return (
    <div className="h-screen px-14 pt-4 overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <div className="flex mt-8 justify-between px-20 text-yellow-300">
        <h1 className="font-bold text-xl">VIBESYNC</h1>
        <CreateRoom />
      </div>
      <div className="flex justify-between px-20">
        <div className="pt-32">
          <p className="font-bold text-5xl text-white">
            <span className="mb-2"> Sync your chat </span> <br /> with music
            vibes
          </p>
          <p className="pt-2 mb-6 text-gray-300">
            Experience seamless chat synchronization
          </p>
          <JoinRoom />
        </div>
        <div className="pt-2">
          <Image
            className="rounded-lg"
            src="/VibeSync-3d-highres.png"
            alt="Landing Page Image"
            width={400}
            height={300}
          />
        </div>
      </div>
      <div className=" w-full pt-8 flex flex-col justify-center items-center">
        <p className="text-gray-300 text-lg font-medium">
          Find your rhythm with VibeSync
        </p>
      </div>{" "}
    </div>
  );
}
