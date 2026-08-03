"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HeroComponent } from "@/components/ui/Hero";
import { motion } from "motion/react";

import TextType from "@/components/TextType";
import { CiHeart } from "react-icons/ci";
import CurvedLoop from "@/components/CurvedLoop";
import SplitReveal from "../../../components/animata/preloader/split-reveal";
import Modal from "../../../components/animata/overlay/modal";
import { Skiper30 } from "@/components/ui/skiper-ui/skiper30";
import { Skiper19 } from "@/components/ui/skiper-ui/skiper19";
import Carousel, { slides } from "@/components/ui/Carosel";
import FilterByCategory from "@/components/home/filterByCategory";
import SeasonSection from "@/components/home/season";
import MealsByAgeSection from "@/components/home/age";
import FitFoodSection from "@/components/home/fitfood";
import EventSection from "@/components/home/event";
import LocationSection from "@/components/home/location";
import PopularSection from "@/components/home/popular";
import RecommandSection from "@/components/home/recommand";

import FilterByMealTime from "@/components/home/features/FilterByMealTime";
import FoodSearchBar from "@/components/home/features/FoodSearchBarComponent";
import SwipeCardTinderStyle from "@/components/home/features/SwipeCardTinderStyle";
import DisplaySwipeCard from "@/components/home/features/DisplaySwipeCard";
import Model from "@/components/home/features/Model";
import FoodSearch from "@/components/food-page/FoodSearch";
import { useGetMenuItemsQuery } from "../store/menuApi";
import { useState } from "react";
import ModelFloating from "@/components/home/features/ModelFloating";
import FoodHubSmartRecommendationSection from "@/components/FoodHubSmartRecommendationSection";
import MinimalFoodHubRecommendationSection from "@/components/Component";
import HeroComponentOO1 from "@/components/home/Hero";
import Hero from "@/components/home/Hero";
import { IconCloudDemo } from "@/components/IconCloudDemo";

import { Skiper31 } from "@/components/ui/skiper-ui/skiper31";
import { IconCloudDemoWithImageLogo } from "@/components/ui/icon-cloud-demo-3";

export default function Home() {
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
        {/* <Skiper30 /> */}
        <Hero />
        <div className=" container py-12.5 mx-auto max-w-7xl flex items-center justify-between ">
          <div className="flex text-start   flex-col gap-12.5">
            <p className="lg:text-7xl text-start md:text-[38px] max-md:text-[30px] font-bold dark:text-emerald-400 text-primary-800">
              បច្ចេកវិទ្យា
              <span className="text-secondary-400">ដែលពួកយើងប្រើ</span>
            </p>
            <p className="md:text-[20px]  text-gray-700 dark:text-gray-100">
              ប្រើប្រាស់បច្ចេកវិទ្យាទំនើប
              និងប្រព័ន្ធឆ្លាតវៃដើម្បីផ្តល់បទពិសោធន៍លឿន
              <br className="md:block max-md:hidden" />
              ងាយស្រួល និងមានសុវត្ថិភាពសម្រាប់អ្នកប្រើប្រាស់។
            </p>
            <button className="bg-primary-800 w-fit text-accent-400 px-8 py-3 rounded-full texxt-[20px]">
              ទីតាំងនៅជិតនេះ{" "}
            </button>{" "}
            {/*  */}
          </div>
          <IconCloudDemoWithImageLogo />
        </div>
        {/* <IconCloudDemo /> */}
        {/* <HeroComponentOO1 /> */}
        <FoodHubSmartRecommendationSection />
        {/* <MinimalFoodHubRecommendationSection /> */}
        <FilterByMealTime />
        {/* <PopularSection /> */}
        {/* <Skiper19/> */}
        {/* <Skiper26/> */}
        {/* <div className="hidden">
          <Skiper31 />
        </div> */}
        {/* <RecommandSection
          filters={{
            query: "",
            food: new Set(),
            drink: new Set(),
            age: new Set(),
          }}
        /> */}
        <FoodSearchBar />
        {/* <DisplaySwipeCard /> */}
        <Model />
        {/* <FoodDiscoverySection /> */}
        {/* <FilterByCategory /> */}
        <SeasonSection />
        {/* <CreatePost />
        <PostsList /> */}
        {/* <Skiper19/> */}
        {/* <div className="h-screen"></div> */}
        <EventSection />
        <LocationSection />
        <MealsByAgeSection />

        {/* <RecommendCardStack foods={recommendedFoods} /> */}
        {/* <Skiper48/> */}
        {/* <TinderFoodStack foods={recommendedFoods} /> */}
        <FitFoodSection />
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
