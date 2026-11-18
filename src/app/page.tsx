import { HeroSlider } from "@/components/home/HeroSlider";
import { FeaturedStudios } from "@/components/home/FeaturedStudios";
import { CategoryCards } from "@/components/home/CategoryCards";
import { HowBookingWorks } from "@/components/home/HowBookingWorks";
import { HostGuarantee } from "@/components/home/HostGuarantee";

export default function Home() {
  return (
    <main className="bg-base-100">
      <HeroSlider />
      <FeaturedStudios />
      <CategoryCards />
      <HowBookingWorks />
      <HostGuarantee />
    </main>
  );
}
