import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';

// Icons
const HotelIcon = getIcon('hotel');
const ActivityIcon = getIcon('activity');
const UsersIcon = getIcon('users');
const CalendarIcon = getIcon('calendar');
const RoomServiceIcon = getIcon('coffee');
const ArrowRightIcon = getIcon('arrow-right');
const CheckCircleIcon = getIcon('check-circle');

const Home = () => {
  const [hotelStats, setHotelStats] = useState({
    occupancy: 68,
    availableRooms: 42,
    pendingServices: 14,
    upcomingCheckIns: 7,
    revenue: 24680,
  });

  const handleServiceComplete = (serviceId) => {
    setHotelStats(prev => ({
      ...prev,
      pendingServices: prev.pendingServices - 1
    }));
    toast.success(`Service request #${serviceId} completed successfully`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <HotelIcon className="h-10 w-10 text-primary mr-3" />
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              HotelHub Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn btn-primary">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span>New Reservation</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div 
            className="card overflow-hidden neu-light dark:neu-dark"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-surface-500 text-sm">Occupancy Rate</p>
                <h3 className="text-2xl font-bold mt-1">{hotelStats.occupancy}%</h3>
                <div className="mt-2 w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${hotelStats.occupancy}%` }}
                  ></div>
                </div>
              </div>
              <span className="bg-primary/10 text-primary p-2 rounded-lg">
                <ActivityIcon className="h-6 w-6" />
              </span>
            </div>
          </motion.div>

          <motion.div 
            className="card neu-light dark:neu-dark"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-surface-500 text-sm">Available Rooms</p>
                <h3 className="text-2xl font-bold mt-1">{hotelStats.availableRooms}</h3>
                <p className="text-sm text-surface-500 mt-1.5">Ready for check-in</p>
              </div>
              <span className="bg-secondary/10 text-secondary p-2 rounded-lg">
                <HotelIcon className="h-6 w-6" />
              </span>
            </div>
          </motion.div>

          <motion.div 
            className="card neu-light dark:neu-dark"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-surface-500 text-sm">Today's Check-ins</p>
                <h3 className="text-2xl font-bold mt-1">{hotelStats.upcomingCheckIns}</h3>
                <p className="text-sm text-surface-500 mt-1.5">Expected today</p>
              </div>
              <span className="bg-accent/10 text-accent p-2 rounded-lg">
                <UsersIcon className="h-6 w-6" />
              </span>
            </div>
          </motion.div>

          <motion.div 
            className="card neu-light dark:neu-dark"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-surface-500 text-sm">Pending Services</p>
                <h3 className="text-2xl font-bold mt-1">{hotelStats.pendingServices}</h3>
                <p className="text-sm text-surface-500 mt-1.5">To be completed</p>
              </div>
              <span className="bg-primary/10 text-primary p-2 rounded-lg">
                <RoomServiceIcon className="h-6 w-6" />
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Feature Component */}
      <MainFeature onServiceComplete={handleServiceComplete} />

      {/* Pending Tasks List */}
      <section className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Pending Service Requests</h2>
          <button className="btn btn-outline text-sm px-3 py-1.5">
            View All <ArrowRightIcon className="ml-1 h-4 w-4" />
          </button>
        </div>
        
        <div className="overflow-hidden card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
              <thead className="bg-surface-100 dark:bg-surface-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Room</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Service Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Guest</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Priority</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Requested</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-surface-800 divide-y divide-surface-200 dark:divide-surface-700">
                {[
                  { id: "SR-1023", room: "304", type: "Housekeeping", guest: "Emma Thompson", priority: "high", time: "10:15 AM" },
                  { id: "SR-1022", room: "215", type: "Technical Support", guest: "James Wilson", priority: "medium", time: "09:45 AM" },
                  { id: "SR-1021", room: "112", type: "Room Service", guest: "Sophia Martinez", priority: "low", time: "08:30 AM" },
                ].map((service, idx) => (
                  <tr key={service.id} className="hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Room {service.room}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{service.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{service.guest}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        service.priority === "high" 
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" 
                          : service.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      }`}>
                        {service.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{service.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleServiceComplete(service.id)}
                        className="text-secondary hover:text-secondary-dark flex items-center justify-end w-full"
                      >
                        <span>Complete</span>
                        <CheckCircleIcon className="ml-1 h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;