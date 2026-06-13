import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Calendar,
  Eye,
  ChevronDown,
  ShieldCheck,
  Clock,
  Smartphone,
  Star,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import api from "../api/axios";
import DoctorCard from "../components/DoctorCard";

const LandingPage = () => {
  const navigate = useNavigate();
  const [dbDoctors, setDbDoctors] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All Specialists");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSpecialty, setSearchSpecialty] = useState("All Specialists");
  const [isSpecialtyDropdownOpen, setIsSpecialtyDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // 🔴 FIXED: Correct public endpoint for fetching doctors
        const response = await api.get("/patient/doctors");
        if (response.data && response.data.data) {
          const formattedDoctors = response.data.data.map((doc) => ({
            id: doc._id,
            fullName: doc.fullName,
            title: doc.speciality || "Ophthalmologist",
            profilePicture: doc.profilePicture || "",
            experience: doc.experience || "5",
            clinicName: doc.clinicName || "Oju Vision Care",
            fees: doc.consultationFee || "5000",
          }));
          setDbDoctors(formattedDoctors);
        }
      } catch (error) {
        console.log("Falling back to dummy data.");
      }
    };
    fetchDoctors();
  }, []);

  const dummyDoctors = [
    {
      id: "dummy1",
      fullName: "Aisha Rahman",
      title: "Consultant Optometrist",
      profilePicture: "https://i.pravatar.cc/150?img=43",
      experience: "12",
      clinicName: "Clear Vision Clinic",
      fees: "5000",
    },
    {
      id: "dummy2",
      fullName: "Samuel Johnson",
      title: "Glaucoma Specialist",
      profilePicture: "https://i.pravatar.cc/150?img=11",
      experience: "15",
      clinicName: "Lagos Eye Center",
      fees: "8000",
    },
    {
      id: "dummy3",
      fullName: "Zubiya Tayyab",
      title: "Pediatric Optometrist",
      profilePicture: "https://i.pravatar.cc/150?img=47",
      experience: "8",
      clinicName: "Sight Savers Hospital",
      fees: "6500",
    },
  ];

  const displayDoctors =
    dbDoctors.length >= 3
      ? dbDoctors
      : [...dbDoctors, ...dummyDoctors.slice(dbDoctors.length, 3)];

  const filteredDoctors = displayDoctors.filter((doctor) => {
    let matchesSpecialty = true;
    if (activeFilter !== "All Specialists") {
      const searchWord = activeFilter.split(" ")[0].toLowerCase();
      matchesSpecialty = doctor.title.toLowerCase().includes(searchWord);
    }
    let matchesQuery = true;
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      matchesQuery =
        doctor.fullName.toLowerCase().includes(query) ||
        doctor.title.toLowerCase().includes(query) ||
        doctor.clinicName.toLowerCase().includes(query);
    }
    return matchesSpecialty && matchesQuery;
  });

  const handleHeroSearch = () => {
    setActiveFilter(searchSpecialty);
    document.getElementById("doctors")?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  const specialtiesList = [
    "All Specialists",
    "Optometrists",
    "Ophthalmologists",
    "Glaucoma Specialists",
    "Pediatric",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300 scroll-smooth">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 px-4 md:px-6 py-4 flex justify-between items-center fixed w-full z-50 shadow-sm transition-colors duration-300">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => window.scrollTo(0, 0)}>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Eye className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-gray-800 dark:text-white">
            Project Oju
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-gray-600 dark:text-gray-300 font-medium">
          <div className="relative group cursor-pointer py-2">
            <span className="hover:text-primary flex items-center gap-1 transition-colors">
              Specialists{" "}
              <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
            </span>
            <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700">
              {specialtiesList.slice(1).map((spec) => (
                <span
                  key={spec}
                  onClick={() => {
                    setActiveFilter(spec);
                    setSearchSpecialty(spec);
                    document
                      .getElementById("doctors")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-4 py-3 hover:bg-primary/10 hover:text-primary transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0 cursor-pointer">
                  {spec}
                </span>
              ))}
            </div>
          </div>
          <a
            href="#how-it-works"
            className="hover:text-primary transition-colors">
            How it Works
          </a>
          <a href="#reviews" className="hover:text-primary transition-colors">
            Reviews
          </a>
        </div>

        {/* Desktop Auth Buttons (Hidden on small screens) */}
        <div className="hidden sm:flex items-center gap-4">
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:border-primary hover:text-primary transition-all duration-300">
            Sign In
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 rounded-full bg-primary text-white font-medium hover:bg-primary-dark hover:shadow-lg transition-all duration-300">
            Consult Now
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-gray-700 dark:text-gray-300 p-2">
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="fixed top-[73px] left-0 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg md:hidden flex flex-col p-4 space-y-4 z-40 animate-fade-in-up">
          <a
            href="#how-it-works"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-gray-700 dark:text-gray-300 font-medium hover:text-primary py-2">
            How it Works
          </a>
          <a
            href="#reviews"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-gray-700 dark:text-gray-300 font-medium hover:text-primary py-2">
            Reviews
          </a>
          <hr className="border-gray-200 dark:border-gray-700" />
          <button
            onClick={() => {
              navigate("/login");
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:border-primary hover:text-primary transition-all">
            Sign In
          </button>
          <button
            onClick={() => {
              navigate("/login");
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-center px-4 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-all shadow-md">
            Consult Now
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative pt-28 md:pt-32 pb-16 md:pb-20 px-4 md:px-6 lg:px-20 bg-gradient-to-br from-primary-light/20 to-white dark:from-gray-800 dark:to-gray-900 overflow-hidden transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center relative z-10">
          <div className="w-full md:w-1/2 pr-0 md:pr-10 text-center md:text-left mb-10 md:mb-0">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary dark:text-primary-light text-sm font-semibold mb-6 border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              {displayDoctors.length}+ eye specialists active right now
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Your Gateway To <br />
              <span className="text-primary">Clear Vision & Premium</span>{" "}
              <br />
              Eye Care Solutions
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-lg mx-auto md:mx-0">
              Connect with top optometrists and ophthalmologists instantly. Book
              in-person clinic visits and manage your optical health with ease.
            </p>
          </div>
          <div className="w-full md:w-1/2 mt-10 md:mt-0 relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>
            <img
              src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=800"
              alt="Eye examination"
              className="rounded-3xl shadow-xl object-cover h-[300px] md:h-[400px] w-full relative z-10 transform transition-transform duration-500 group-hover:-translate-y-2"
            />
          </div>
        </div>

        {/* Floating Search Bar */}
        <div className="max-w-5xl mx-auto mt-12 md:mt-16 bg-white dark:bg-gray-800 rounded-2xl md:rounded-full shadow-xl p-4 md:p-2 flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x border border-gray-100 dark:border-gray-700 relative z-20">
          <div className="flex-1 flex items-center px-2 md:px-4 py-3 w-full">
            <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search condition or doctor name..."
              className="w-full outline-none text-gray-700 dark:text-white bg-transparent placeholder-gray-400"
              onKeyDown={(e) => e.key === "Enter" && handleHeroSearch()}
            />
          </div>
          <div
            className="flex-1 relative w-full"
            onMouseLeave={() => setIsSpecialtyDropdownOpen(false)}>
            <div
              className="flex items-center px-2 md:px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors h-full rounded-2xl md:rounded-none"
              onClick={() =>
                setIsSpecialtyDropdownOpen(!isSpecialtyDropdownOpen)
              }>
              <Eye className="w-5 h-5 text-primary mr-3 shrink-0" />
              <span className="text-gray-600 dark:text-gray-300 flex-1 truncate text-left">
                {searchSpecialty === "All Specialists"
                  ? "Select Specialty"
                  : searchSpecialty}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${isSpecialtyDropdownOpen ? "rotate-180" : ""}`}
              />
            </div>
            {isSpecialtyDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-800 shadow-xl rounded-xl z-50 border border-gray-100 dark:border-gray-700 overflow-hidden">
                {specialtiesList.map((spec) => (
                  <div
                    key={spec}
                    onClick={() => {
                      setSearchSpecialty(spec);
                      setIsSpecialtyDropdownOpen(false);
                    }}
                    className="px-4 py-3 hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0 text-gray-700 dark:text-gray-300 text-left">
                    {spec}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="px-2 w-full md:w-auto mt-3 md:mt-0">
            <button
              onClick={handleHeroSearch}
              className="w-full md:w-auto bg-primary text-white px-8 py-3 rounded-xl md:rounded-full font-semibold hover:bg-primary-dark hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
              <Search className="w-4 h-4" /> Search
            </button>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div
        className="bg-white dark:bg-gray-800 py-16 md:py-20 transition-colors duration-300"
        id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Simple Steps to Better Vision
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Our platform bridges the gap between you and premium optical care
              through a streamlined, digital-first process.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6 transform transition-transform hover:-translate-y-2">
                <Search className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                1. Wadi Symptoms
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Use our intelligent triage engine to investigate your ocular
                symptoms and determine the urgency of your condition.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6 transform transition-transform hover:-translate-y-2">
                <Eye className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                2. Choose Specialist
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Browse through our network of verified optometrists and
                ophthalmologists tailored to your specific needs.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6 transform transition-transform hover:-translate-y-2">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                3. Visit & Treat
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Arrive at your scheduled time for a comprehensive physical
                examination and expert optical care at the clinic.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Doctors Section */}
      <div
        className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20"
        id="doctors">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Featured Specialists
          </h2>
          <button className="text-primary font-medium hover:text-primary-dark flex items-center gap-2 border border-primary/30 hover:border-primary rounded-full px-6 py-2 transition-all duration-300 hover:shadow-md shrink-0">
            View all →
          </button>
        </div>
        <div className="flex flex-wrap gap-3 mb-10 overflow-x-auto pb-2">
          {specialtiesList.map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                setSearchSpecialty(filter);
              }}
              className={`px-6 py-2.5 rounded-full border text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                activeFilter === filter
                  ? "border-primary text-white bg-primary shadow-md transform scale-105"
                  : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5"
              }`}>
              {filter}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor, index) => (
              <div
                key={doctor.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}>
                <DoctorCard doctor={doctor} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-10 text-center text-gray-500 dark:text-gray-400">
              <Eye className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>
                No specialists found matching your search. Try adjusting your
                filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("All Specialists");
                  setSearchSpecialty("All Specialists");
                }}
                className="mt-4 text-primary font-medium hover:underline">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Why Choose Us & CTA Section */}
      <div
        className="bg-primary-dark py-16 md:py-20 relative overflow-hidden"
        id="reviews">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full opacity-20 blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-light rounded-full opacity-10 blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="w-full lg:w-1/2 text-white text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why Patients Trust Project Oju
            </h2>
            <div className="space-y-6 mb-10">
              <div className="flex gap-4 justify-center lg:justify-start">
                <ShieldCheck className="w-8 h-8 text-primary-light flex-shrink-0" />
                <div>
                  <h4 className="text-xl font-semibold mb-1">
                    Verified Professionals
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Every specialist is strictly vetted, ensuring you receive
                    care from licensed and experienced experts.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 justify-center lg:justify-start">
                <Clock className="w-8 h-8 text-primary-light flex-shrink-0" />
                <div>
                  <h4 className="text-xl font-semibold mb-1">
                    Zero Wait Times
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Book physical clinic appointments instantly. No more sitting
                    in crowded waiting rooms for hours.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => navigate("/assessment")}
                className="bg-white text-primary-dark px-8 py-3.5 rounded-full font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                Start Assessment <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="border-2 border-white/30 text-white px-8 py-3.5 rounded-full font-bold hover:bg-white/10 transition-colors text-center">
                Login or Register
              </button>
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl">
              <div className="flex text-yellow-400 mb-6 justify-center lg:justify-start">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-current" />
                ))}
              </div>
              <p className="text-white text-xl md:text-2xl font-medium leading-relaxed mb-8 italic text-center lg:text-left">
                "The triage assessment engine was spot on. I booked a physical
                clinic visit immediately and got a comprehensive eye exam and
                prescription within 30 minutes. Exceptional service."
              </p>
              <div className="flex items-center gap-4 justify-center lg:justify-start">
                <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-primary-dark font-bold text-xl">
                  JD
                </div>
                <div>
                  <h5 className="text-white font-bold">James Doe</h5>
                  <p className="text-gray-300 text-sm">Verified Patient</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Eye className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white">Project Oju</span>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Digital-first healthcare solutions prioritizing your vision and
              optical health.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">For Patients</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#doctors"
                  className="hover:text-primary transition-colors">
                  Find a Doctor
                </a>
              </li>
              <li>
                <a
                  href="/login"
                  className="hover:text-primary transition-colors">
                  Book Appointment
                </a>
              </li>
              <li>
                <a
                  href="/assessment"
                  className="hover:text-primary transition-colors">
                  Symptom Assessment
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">For Doctors</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/login"
                  className="hover:text-primary transition-colors">
                  Join the Network
                </a>
              </li>
              <li>
                <a
                  href="/doctor-dashboard"
                  className="hover:text-primary transition-colors">
                  Doctor Dashboard
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Stay Updated</h4>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to our newsletter for eye health tips.
            </p>
            <div className="flex bg-gray-800 rounded-lg overflow-hidden border border-gray-700 focus-within:border-primary transition-colors">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-transparent px-4 py-2 text-sm outline-none text-white"
              />
              <button className="bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-6 mt-12 pt-8 border-t border-gray-800 text-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Project Oju. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
