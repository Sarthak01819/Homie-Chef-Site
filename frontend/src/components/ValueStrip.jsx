import { Leaf, Clock, IndianRupee } from "lucide-react";

const ValueStrip = () => (
    <section className="py-12 bg-linear-to-r from-[#119DA4]/90 to-[#FDE789]/90">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-black font-medium">
            <div className="flex items-center gap-4">
                <Leaf />
                100% Fresh & Vegetarian
            </div>
            <div className="flex items-center gap-4">
                <Clock />
                Delivered On Time, Daily
            </div>
            <div className="flex items-center gap-4">
                <IndianRupee />
                Cheaper Than Daily Ordering
            </div>
        </div>
    </section>
);

export default ValueStrip;
