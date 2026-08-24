import Image from "next/image";

type MenuItem = {
  id: string;
  image: string;
  title: string;
  description: string;
  aosDelay: number;
};

const menuItems: MenuItem[] = [
  {
    id: "power-bowl",
    image: "/Image/food01.png",
    title: "អាហារពេញនិយម",
    description: "ស្វែងរកមុខម្ហូបជាច្រើនប្រភេទទៅតាមចំណូលចិត្តរបស់អ្នក។",
    aosDelay: 200,
  },
  {
    id: "spicy-noodles",
    image: "/Image/food02.png",
    title: "អាហារបែបអឺរ៉ុប",
    description:
      "ជ្រើសរើសមុខម្ហូបដែលមានតុល្យភាពអាហារូបត្ថម្ភ និងល្អសម្រាប់សុខភាព",
    aosDelay: 250,
  },
  {
    id: "green-vitality-bowl",
    image: "/Image/food04.png",
    title: "អាហារសុខភាព",
    description:
      "រីករាយជាមួយមុខម្ហូបបែបអឺរ៉ុបដែលមានរសជាតិឆ្ងាញ់ និងគុណភាពខ្ពស់",
    aosDelay: 300,
  },
];

export default function FitFoodSection() {
  return (
    <section
      id="menu"
      className="py-12 md:py-15 px-4 sm:px-6 max-w-7xl mx-auto text-center overflow-hidden"
    >
      <section className="flex flex-col items-center justify-center md:gap-12.5 max-md:gap-6 container max-w-7xl mx-auto relative z-20 w-full">
        <p className="lg:text-6xl py-2 md:text-4xl max-md:text-2xl text-center dark:text-[#22a447] font-semibold text-primary-800 dark:text-primary-dark">
          បទពិសោធន៍ថ្មីក្នុង
          <span className="text-secondary-500">ការស្វែងរកអាហារ</span>
        </p>
        <p className="lg:text-[24px] md:text-[20px] text-center font-light text-gray-700 dark:text-gray-100 max-md:text-[16px]">
          ស្វែងរកមុខម្ហូប និងហាងអាហារដែលសមនឹងអ្នក តាមរយៈ <br />
          ប្រព័ន្ធណែនាំឆ្លាតវៃ ដែលគិតគូរពីចំណូលចិត្ត អាឡែស៊ី របបអាហារ ជំនឿសាសនា
          និងទីតាំងរបស់អ្នក
        </p>
      </section>
      {/* Menu Cards */}
      <div
        data-aos="fade-up"
        data-aos-delay="150"
        className="bg-primary-800 rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 mt-24 md:mt-40"
      >
        {menuItems.map((item) => (
          <div
            key={item.id}
            data-aos="zoom-in"
            data-aos-delay={item.aosDelay}
            className="flex flex-col items-center -mt-16 md:-mt-24"
          >
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 mb-4 md:mb-6 shadow-xl rounded-full">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="rounded-full object-cover"
                sizes="(max-width: 768px) 200px, 250px"
              />
            </div>
            <h3 className="text-white font-bold text-lg sm:text-xl mb-2 sm:mb-3">{item.title}</h3>
            <p className="text-gray-100 text-sm sm:text-base md:text-lg px-2 sm:px-4">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
