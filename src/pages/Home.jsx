import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';
import { serviceRequestService } from '../services/serviceRequestService';
import { hotelStatsService } from '../services/hotelStatsService';

// Icons
const HotelIcon = getIcon('hotel');
const ActivityIcon = getIcon('activity');
const UsersIcon = getIcon('users');
const CalendarIcon = getIcon('calendar');
const RoomServiceIcon = getIcon('coffee');
const ArrowRightIcon = getIcon('arrow-right');
const CheckCircleIcon = getIcon('check-circle');
const LoaderIcon = getIcon('loader-2');

const Home = () => {
  const [hotelStats, setHotelStats] = useState(null);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompletingService, setIsCompletingService] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadHotelStats();
    loadServiceRequests();
  }, []);

  const loadHotelStats = async () => {
    try {
      setIsLoading(true);
      const stats = await hotelStatsService.getLatestHotelStats();
      if (stats) {
        setHotelStats({
          occupancy: stats.occupancy_rate || 0,
          availableRooms: stats.available_rooms || 0,
          pendingServices: stats.pending_services || 0,
          upcomingCheckIns: stats.upcoming_check_ins || 0,
          revenue: stats.revenue || 0
        });
      } else {
        // Set default values if no stats found
        setHotelStats({
          occupancy: 0,
          availableRooms: 0,
          pendingServices: 0,
          upcomingCheckIns: 0,
          revenue: 0
        });
      }
    } catch (error) {
      console.error('Error loading hotel stats:', error);
      // Set default values on error
      setHotelStats({
        occupancy: 0,
        availableRooms: 0,
        pendingServices: 0,
        upcomingCheckIns: 0,
        revenue: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadServiceRequests = async () => {
    try {
      const params = {
        where: [
          {
            fieldName: "status",
            operator: "ExactMatch",
            values: ["pending"]
          }
        ],
        orderBy: [
          {
            fieldName: "CreatedOn",
            SortType: "DESC"
          }
        ],
        pagingInfo: {
          limit: 10,
          offset: 0
        }
      };
      
      const data = await serviceRequestService.fetchServiceRequests(params);
      
      // Transform data to match expected format
      const transformedData = data.map(item => ({
        id: item.request_number || item.Id,
        room: item.room_number || 'Unknown',
        type: item.service_type || 'Unknown',
        guest: item.guest_name || 'Unknown Guest',
        priority: item.priority || 'medium',
        time: item.requested_time || 'Unknown'
      }));
      
      setServiceRequests(transformedData);
    } catch (error) {
      console.error('Error loading service requests:', error);
      setServiceRequests([]);
    }
  };

  const handleServiceComplete = async (serviceId) => {
    try {
      setIsCompletingService(true);
      
      // Complete the service request via API
      await serviceRequestService.completeServiceRequest(serviceId);
      
      // Reload service requests to get updated data
      await loadServiceRequests();
      
      // Update hotel stats if available
      if (hotelStats) {
        setHotelStats(prev => ({
          ...prev,
          pendingServices: Math.max(0, prev.pendingServices - 1)
        }));
      }
      
      toast.success(`Service request #${serviceId} completed successfully`);
    } catch (error) {
      console.error('Error completing service request:', error);
      toast.error('Failed to complete service request');
    } finally {
      setIsCompletingService(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center py-16">
          <LoaderIcon className="h-8 w-8 animate-spin text-primary mr-3" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

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
      {hotelStats && (
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
                <h3 className="text-2xl font-bold mt-1">{hotelStats.occupancy?.toFixed?.(0) || 0}%</h3>
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
                <h3 className="text-2xl font-bold mt-1">{hotelStats.availableRooms || 0}</h3>
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
                <h3 className="text-2xl font-bold mt-1">{hotelStats.upcomingCheckIns || 0}</h3>
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
                <h3 className="text-2xl font-bold mt-1">{hotelStats.pendingServices || 0}</h3>
                <p className="text-sm text-surface-500 mt-1.5">To be completed</p>
              </div>
              <span className="bg-primary/10 text-primary p-2 rounded-lg">
                <RoomServiceIcon className="h-6 w-6" />
              </span>
            </div>
          </motion.div>
        </div>
      </section>
      )}

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
              {serviceRequests.length > 0 ? (
                serviceRequests.map((service) => (
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
                        disabled={isCompletingService}
                        className="text-secondary hover:text-secondary-dark flex items-center justify-end w-full"
                      >
                        {isCompletingService ? (
                          <LoaderIcon className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                        <span>Complete</span>
                        <CheckCircleIcon className="ml-1 h-4 w-4" />
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-surface-500">
                    <div className="flex flex-col items-center py-6">
                      <RoomServiceIcon className="h-10 w-10 text-surface-400 mb-2" />
                      <p>No pending service requests</p>
                    </div>
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;