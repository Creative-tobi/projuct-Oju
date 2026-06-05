import React from "react";
import { BadgeCheck, CalendarPlus, Video, Clock } from "lucide-react";

const DoctorCard = ({ doctor }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <img
            src={
              doctor.profilePicture ||
              "https://ui-avatars.com/api/?name=" + doctor.fullName
            }
            alt={doctor.fullName}
            className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary transition-colors duration-300"
          />
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1">
            Dr. {doctor.fullName}
            <BadgeCheck className="w-5 h-5 text-primary" />
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {doctor.title}
          </p>
          <div className="flex text-yellow-400 text-sm mt-1">★★★★★</div>
        </div>
      </div>

      {/* Doctor Details */}
      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 mb-6 flex-grow">
        <div className="flex items-center gap-3">
          <CalendarPlus className="w-4 h-4 text-gray-400" />
          <span>
            <strong className="text-primary">
              {doctor.experience || "0"} years
            </strong>{" "}
            of Experience
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-gray-400">🏥</span>
            <span className="truncate">
              {doctor.clinicName || "Independent Practice"}
            </span>
          </div>
          <strong className="text-primary whitespace-nowrap">
            {doctor.fees || "Free"} NGN
          </strong>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Video className="w-4 h-4 text-gray-400" />
            <span>Online Consultation</span>
          </div>
          <strong className="text-primary whitespace-nowrap">
            {doctor.fees || "Free"} NGN
          </strong>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>
            <strong>15 - 20 min</strong> Wait time
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button className="w-full bg-primary/10 text-primary border border-primary/20 py-2.5 rounded-lg font-semibold group-hover:bg-primary group-hover:text-white transition-all duration-300">
        Consult Now
      </button>
    </div>
  );
};

export default DoctorCard;
