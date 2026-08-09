import React from "react";
import Image from "next/image";
import FireflyButton from "@/components/ui/firefly-button";
import CurvedLoop from "../CurvedLoop";
export default function PopularSection() {
  return (
    <div className="my-15 ">
      {" "}
      <section className="  flex flex-col items-center justify-center md:gap-12.5 max-md:gap-6 container  max-7-xl mx-auto   relative z-20   w-full">
        <p className="lg:text-5xl md:text-4xl max-md:text-2xl text-center dark:text-[#22a447] font-semibold text-primary-800">
          បទពិសោធន៍ថ្មីក្នុង
          <span className="text-secondary-500">ការស្វែងរកអាហារ</span>{" "}
        </p>
        <p className="lg:text-[24px] md:text-[20px] text-center  font-light text-gray-700 dark:text-gray-100 max-md:text-[16px]">
          ស្វែងរកមុខម្ហូប និងហាងអាហារដែលសមនឹងអ្នក តាមរយៈ <br />
          ប្រព័ន្ធណែនាំឆ្លាតវៃ ដែលគិតគូរពីចំណូលចិត្ត អាឡែស៊ី របបអាហារ ជំនឿសាសនា
          និងទីតាំងរបស់អ្នក
        </p>
      </section>
      {/* <CurvedLoop
        marqueeText="ស្វែងរកមុខម្ហូបនៅជិតអ្នកបំផុត"
        speed={2}
        curveAmount={-170}
        direction="left"
        interactive
        className="custom-text-style"
      /> */}
      <div className="flex  pt-20 justify-center lg:max-w-7xl  mx-auto">
        <Image
          width={235}
          height={285}
          className="border-6 object-cover z-7 lg:w-[235px]  lg:h-[285px] md:w-[170px] md:h-[220px] max-md:h-[110px] max-md:w-[85px] max-md:h-[130px] max-md:w-[100px] mt-6 -rotate-[10deg] border-white shadow-md rounded-[24px]"
          src="/Image/food-picture/card 4.jpg"
          alt="Popular"
        />{" "}
        <Image
          width={235}
          height={285}
          className="border-6 object-cover z-6 lg:w-[235px] lg:h-[285px] md:w-[170px] md:h-[220px] max-md:h-[110px] max-md:w-[85px] max-md:h-[130px] max-md:w-[100px] -rotate-3 -mt-6 -ml-10 border-white shadow-md rounded-[24px]"
          src="/Image/food-picture/drink 1.jpg"
          alt="Popular"
        />{" "}
        <Image
          width={235}
          height={285}
          className="border-6 object-fill z-5 lg:w-[235px] lg:h-[285px] md:w-[170px] md:h-[220px] max-md:h-[110px] max-md:w-[85px] max-md:h-[130px] max-md:w-[100px] -rotate-1 -ml-10 border-white shadow-md rounded-[24px]"
          src="/Image/food-picture/card 2.jpg"
          alt="Popular"
        />{" "}
        <Image
          width={235}
          height={285}
          className="border-6 object-cover z-4 lg:w-[235px] lg:h-[285px] md:w-[170px] md:h-[220px] max-md:h-[110px] max-md:w-[85px] max-md:h-[130px] max-md:w-[100px]  rotate-2 -mt-6 -ml-10 border-white shadow-md rounded-[24px]"
          src="/Image/food-picture/card 3.jpg"
          alt="Popular"
        />{" "}
        <Image
          width={235}
          height={285}
          className="border-6 object-cover z-2 lg:w-[235px] lg:h-[285px] md:w-[170px] md:h-[220px] max-md:h-[110px] max-md:w-[85px] max-md:h-[130px] max-md:w-[100px] rotate-5 mt-4  -ml-10 border-white shadow-md rounded-[24px]"
          src="/Image/food-picture/drink 2.jpg"
          alt="Popular"
        />{" "}
        <Image
          width={235}
          height={285}
          className="border-6 object-cover z-1 lg:w-[235px] lg:h-[285px] md:w-[170px] md:h-[220px] max-md:h-[110px] max-md:w-[85px] max-md:h-[130px] max-md:w-[100px] -ml-10 rotate-10 border-white shadow-md rounded-[24px]"
          src="/Image/food-picture/card 6.jpg"
          alt="Popular"
        />{" "}
      </div>
      {/* <div className="container max-w-7xl mx-auto">
        <FireflyButton
          text="ណែនាំមុខម្ហូប "
          backgroundColor="#ffa500"
          textColor="#ffffff"
          glowColor="#ff4500"
          fireflyCount={40}
          className="cursor-pointer mx-auto  mt-8 "
          onClick={() => alert("Glowing button clicked!")}
        />
      </div> */}
    </div>
  );
}
