"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HeroComponent } from "@/components/ui/Hero";
import { motion } from "motion/react";
import PopularSection from "./pages/home/popular";
import RecommandSection from "./pages/home/recommand";
import EventSection from "./pages/home/event";
import LocationSection from "./pages/home/location";
import TextType from "@/components/TextType";
import { CiHeart } from "react-icons/ci";
import CurvedLoop from "@/components/CurvedLoop";
import SplitReveal from "../../components/animata/preloader/split-reveal";
import Modal from "../../components/animata/overlay/modal";
import { Skiper30 } from "@/components/ui/skiper-ui/skiper30";
import { Skiper19 } from "@/components/ui/skiper-ui/skiper19";

export default function Home() {
  const imageUrls = ["/Image/background.png", "/Image/logo.png"];
  return (
    <div>
      {/* <SplitReveal
        images={imageUrls}
        lockScroll={false}
        // onComplete={() => setReady(true)}
        renderProgress={({ loaded, total }) => (
          <p className="text-center hidden">
            {loaded}/{total}
          </p>
        )}
      /> */}

      <section className="">
        <div className="">
          <div className="flex relative lg:pb-13 max-w-305.25 container mx-auto flex-col items-center justify-center gap-4  lg:py-0 md:py-20   max-md:py-55 lg:min-h-screen">
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute z-10  w-20 left-10 top-25"
            >
              <img className="" src="/Image/decorate.png" alt="" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -15, 0], rotate: [0, 1, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="z-1 "
            >
              <Image
                data-aos="flip-down"
                data-aos-delay="350"
                className="lg:w-237.5    md:w-150   z-1 "
                src="/Image/foodhub-image (2).png"
                alt="FOOFHUB"
                width={950}
                height={450}
              />
            </motion.div>
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 15, 0, -15, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute lg:left-0 max-md:right-0 max-md:mt-15 lg:bottom-3 md:left-0 md:bottom-15"
            >
              <Image
                data-aos-delay="0"
                className="max-md:w-10 max-md:-rotate-90"
                src="/Image/left-vector.png"
                alt="FOODHUB"
                width={103}
                height={97}
              />
            </motion.div>
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [15, -15, 15],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute md:right-0 max-md:left-0 top-25"
            >
              <Image
                data-aos="fade-left"
                data-aos-duration="1200"
                className="max-md:w-10 max-md:-rotate-30"
                src="/Image/right-vector.png"
                alt="FOODHUB"
                width={131}
                height={114}
              />
            </motion.div>
            <motion.div
              animate={{
                scale: [10, 1.1, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <Image
              className="absolute  top-10 -left-40  "
              src="/Image/blur-green.png"
              alt="blur-image"
              width={577}
              height={542}
            />{" "}
            <motion.div />
            <div className="absolute right-25 w-30 h-30 blur-[80px] animate-pulse bg-secondary-500"></div>{" "}
            {/* <div className="absolute  top-10 -left-40   h-30 blur-[80px]  bg-primary-500"></div> */}
            <p
              data-aos="fade-up"
              data-aos-duration="1000"
              className="font-extrabold z-1 max-md:w-full lg:text-[50px] md:text-[48px] max-md:text-[38px] lg:ml-55 lg:-mt-35 md:text-center md:leading-17  text-primary-800"
            >
              ណែនាំអាហារដែលត្រូវនឹង <br className="md:block max-md:hidden" />{" "}
              ចំណូលចិត្តរបស់អ្នក !
            </p>
            <div className="absolute md:w-full ">
              <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 9, -3] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute lg:left-10 lg:top-5   md:left-0  md:top-20 max-md:top-50 max-md:ml-6 z-30 pointer-events-auto"
              >
                <div
                  data-aos="flip-down"
                  data-aos-delay="300"
                  className="w-40 md:w-52 aspect-3/3.5 bg-white/5 lg:backdrop-blur-xs border border-white/40 rounded-[2rem] p-5 flex flex-col items-center justify-center rotate-[-12deg] shadow-2xl hover:rotate-0 transition-transform duration-500"
                >
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-[#2C3E50] rounded-full flex items-center justify-center mb-4 shadow-inner border-[3px] border-white/50 overflow-hidden">
                    <img
                      src="https://api.dicebear.com/7.x/pixel-art/svg?seed=John"
                      alt="Avatar"
                      className="w-full h-full object-cover scale-150"
                    />
                  </div>
                  <div className="text-center text-primary-500 mt-2">
                    <p className="font-bold text-sm md:text-lg  ">
                      2.ម្ហូបគ្រប់ប្រភេទ
                    </p>
                    <p className="text-[10px] md:text-xs  /80 mt-1">
                      23 422 មុខសម្រាប់ជ្រើសរើស
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Glass Card 2 (Top Right) */}
              <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 9, -3] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute max-md:right-10 max-md:top-60 md:right-10 md:-top-12  z-30 pointer-events-auto"
              >
                <div
                  data-aos="flip-down"
                  data-aos-delay="450"
                  className="w-40 md:w-52 aspect-3/3.5 bg-white/5 lg:backdrop-blur-xs border border-white/40 rounded-[2rem] p-5 flex flex-col items-center justify-center rotate-[12deg] shadow-2xl hover:rotate-0 transition-transform duration-500"
                >
                  <div className="w-16 h-16  md:w-24 md:h-24 bg-[#2C3E50] rounded-full flex items-center justify-center mb-4 shadow-inner border-[3px] border-white/50 overflow-hidden">
                    <img
                      src="https://api.dicebear.com/7.x/pixel-art/svg?seed=John"
                      alt="Avatar"
                      className="w-full h-full object-cover scale-150"
                    />
                  </div>
                  <div className="text-center text-primary-500 mt-2">
                    <p className="font-bold text-sm md:text-lg  ">
                      1.ម្ហូបគ្រប់ប្រភេទ
                    </p>
                    <p className="text-[10px] md:text-xs  /80 mt-1">
                      23 422 មុខសម្រាប់ជ្រើសរើស
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="lg:-mt-30">
            <Image
              width={1550}
              height={0}
              src="/Image/background.png"
              alt="background"
              className="w-full  lg:h-auto md:h-[550px]  max-md:h-[350px]"
            />

            <section className=" lg:-mt-105  md:-mt-100  max-md:-mt-55 flex flex-col items-center justify-center md:gap-12.5 max-md:gap-6 container  max-7-xl mx-auto   relative z-20   w-full">
              <p className="lg:text-6xl md:text-5xl max-md:text-3xl text-center font-semibold text-white ">
                បទពិសោធន៍ថ្មីក្នុង
                <span className="text-secondary-500">ការស្វែងរកអាហារ</span>{" "}
              </p>
              <p className="lg:text-[24px] md:text-[20px] text-center  font-light text-accent-50">
                ស្វែងរកមុខម្ហូប និងហាងអាហារដែលសមនឹងអ្នក តាមរយៈ <br />
                ប្រព័ន្ធណែនាំឆ្លាតវៃ ដែលគិតគូរពីចំណូលចិត្ត អាឡែស៊ី របបអាហារ
                ជំនឿសាសនា និងទីតាំងរបស់អ្នក
              </p>
              <div className="max-w-7xl mx-auto container relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {/* Card 1 */}
                <Image
                  width={40}
                  height={50}
                  className="absolute    w-[40px] h-[50px] md:-left-10 max-md:hidden md:-top-10"
                  src="/Image/decorate.png"
                  alt=""
                />
                <div className="bg-gradient-to-b from-secondary-50 shadow-xs to-white rounded-[2rem] p-8 flex flex-col items-center text-center relative h-64 border border-gray-100">
                  <h3 className="text-xl font-light text-primary-800 md:text-2xl uppercase leading-tight mb-2 font-black">
                    កំណត់ចំណង់ចំណូលចិត្ត
                    <br />
                    របស់លោកអ្នក
                  </h3>
                  <p className=" font-light  text-black/60 font-bold mb-auto">
                    ជ្រើសរើសប្រភេទម្ហូប និងចំណូលចិត្តរបស់អ្នក
                  </p>

                  {/* Pill Graphic */}
                  <div className="relative w-full flex justify-center mt-6">
                    <div className="flex items-center bg-primary-600 rounded-full p-2 pr-16 text-white shadow-lg relative z-10">
                      <div className="w-8 h-8 bg-[#D2B48C] rounded-full mr-3 border border-white/30 overflow-hidden flex-shrink-0">
                        <img
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=D2B48C"
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left">
                        <p className="text-[14px] font-bold leading-none">
                          Default profile
                        </p>
                        <p className="text-[12px] text-white/70 leading-none mt-1">
                          23 422 points
                        </p>
                      </div>
                    </div>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-secondary-400 text-white font-black text-[10px] px-3 py-2 rounded-xl z-20 shadow-md">
                      add preferences
                    </div>
                  </div>

                  {/* Arrow pointing to next card */}
                  <div className="hidden md:block absolute -right-12 bottom-8 w-16 h-16 z-30">
                    <img src="/Image/arr.png" alt="" />
                  </div>
                </div>

                {/* Card 2 */}
                <div className="bg-gradient-to-b from-primary-50 to-white shadow-xs rounded-[2rem] p-8 flex flex-col items-center text-center relative h-64 border border-gray-100">
                  <h3 className="text-xl font-light text-primary-800 md:text-2xl uppercase leading-tight mb-2 font-black">
                    កំណត់ចំណង់ចំណូលចិត្ត
                    <br />
                    របស់លោកអ្នក
                  </h3>
                  <p className=" font-light text-black/60 font-bold mb-auto">
                    ជ្រើសរើសប្រភេទម្ហូប និងចំណូលចិត្តរបស់អ្នក
                  </p>

                  {/* Pill Graphic */}
                  <div className="relative w-full flex justify-center mt-6">
                    <div className="flex items-center bg-primary-600 rounded-full p-1.5 text-white shadow-lg">
                      <div className="bg-white/20 text-white font-bold text-sm px-4 py-2 rounded-full mr-2">
                        play with
                      </div>
                      <div className="font-bold text-xs px-4">swipe style</div>
                    </div>

                    {/* Small floating green pill */}
                    <div className="absolute -bottom-6 right-1/3 bg-secondary-400 rounded-full p-2.5 shadow-lg transform rotate-12 z-20">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-4 h-4 text-white stroke-current"
                        fill="none"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </div>
                  </div>

                  {/* Arrow pointing to next card */}
                  <div className="hidden md:block absolute -right-12 bottom-8 w-16 h-16 z-30">
                    <img src="/Image/arr.png" alt="" />
                  </div>
                </div>

                {/* Card 3 */}
                <div className="bg-gradient-to-b from-accent-50 to-white shadow-xs rounded-[2rem] p-8 flex flex-col items-center text-center relative h-64 border border-gray-100">
                  <h3 className="text-xl font-light text-primary-800 md:text-2xl uppercase leading-tight mb-2 font-black">
                    កំណត់ចំណង់ចំណូលចិត្ត
                    <br />
                    របស់លោកអ្នក
                  </h3>
                  <p className=" font-light text-black/60 font-bold mb-auto">
                    ជ្រើសរើសប្រភេទម្ហូប និងចំណូលចិត្តរបស់អ្នក
                  </p>

                  {/* Pill Graphic */}
                  <div className="flex flex-col items-center bg-primary-600 rounded-[2rem] px-6 py-4 text-white shadow-lg mt-6 relative w-full max-w-[200px]">
                    <p className="text-[9px] font-bold uppercase tracking-wider mb-1">
                      EST. Monthly $CLUB
                    </p>
                    <p className="text-xl font-black">188.34257</p>

                    {/* Speech bubble tail */}
                    <div className="absolute -bottom-2 left-8 w-5 h-5 bg-primary-600 transform rotate-45"></div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
        
        <Skiper30 />
        <PopularSection />
        {/* <Skiper19/> */}
        <RecommandSection />
        <EventSection />
        <LocationSection />
      </section>

      {/* <CurvedLoop
        marqueeText="ស្វែងរកមុខម្ហូបនៅជិតអ្នកបំផុត"
        speed={2}
        curveAmount={-150}
        direction="left"
        interactive
        className="custom-text-style"
      /> */}
    </div>
  );
}
