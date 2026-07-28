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
    image: "/Image/food01.png",
    title: "អាហារបែបអឺរ៉ុប",
    description:
      "ជ្រើសរើសមុខម្ហូបដែលមានតុល្យភាពអាហារូបត្ថម្ភ និងល្អសម្រាប់សុខភាព",
    aosDelay: 250,
  },
  {
    id: "green-vitality-bowl",
    image: "/Image/food01.png",
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
      className=" py-15 max-lg:px-2 max-w-7xl mx-auto text-center"
    >
      <section className="  flex flex-col items-center justify-center md:gap-12.5 max-md:gap-6 container  max-7-xl mx-auto   relative z-20   w-full">
        <p className="lg:text-5xl md:text-4xl max-md:text-2xl text-center font-semibold text-primary-800">
          បទពិសោធន៍ថ្មីក្នុង
          <span className="text-secondary-500">ការស្វែងរកអាហារ</span>{" "}
        </p>
        <p className="lg:text-[24px] md:text-[20px] text-center  font-light text-gray-700 max-md:text-[16px]">
          ស្វែងរកមុខម្ហូប និងហាងអាហារដែលសមនឹងអ្នក តាមរយៈ <br />
          ប្រព័ន្ធណែនាំឆ្លាតវៃ ដែលគិតគូរពីចំណូលចិត្ត អាឡែស៊ី របបអាហារ ជំនឿសាសនា
          និងទីតាំងរបស់អ្នក
        </p>
      </section>
      {/* Menu Cards */}
      <div
        data-aos="fade-up"
        data-aos-delay="150"
        className="bg-primary-800  rounded-[36px] p-12 grid grid-cols-1 md:grid-cols-3 gap-12 mt-40"
      >
        {menuItems.map((item) => (
          <div
            key={item.id}
            data-aos="zoom-in"
            data-aos-delay={item.aosDelay}
            className="flex flex-col items-center max-md:-mt-24 sm:-mt-35"
          >
            <div className="relative w-60 h-60 mb-6">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="rounded-full object-cover"
                sizes="250px"
              />
            </div>
            <h3 className="text-white font-bold text-xl mb-3">{item.title}</h3>
            <p className="text-accent text-xl px-4">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
