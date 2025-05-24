import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import { roomTypeService } from '../services/roomTypeService';
import { reservationService } from '../services/reservationService';

// Icons
const BedIcon = getIcon('bed');
const PlusIcon = getIcon('plus');
const MinusIcon = getIcon('minus');
const AlertIcon = getIcon('alert-triangle');
const XIcon = getIcon('x');
const CheckIcon = getIcon('check');
const CalendarIcon = getIcon('calendar');
const UserIcon = getIcon('user');
const UserPlusIcon = getIcon('user-plus');
const SaveIcon = getIcon('save');
const SearchIcon = getIcon('search');
const LoaderIcon = getIcon('loader-2');

const MainFeature = ({ onServiceComplete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomTypes, setRoomTypes] = useState([]);
  const [activeRoomType, setActiveRoomType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [reservations, setReservations] = useState([]);
  const [newReservation, setNewReservation] = useState({
    guestName: '',
    roomType: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    specialRequests: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load room types and reservations on component mount
  useEffect(() => {
    loadRoomTypes();
    loadReservations();
  }, []);

  const loadRoomTypes = async () => {
    try {
      setIsLoading(true);
      const data = await roomTypeService.fetchRoomTypes();
      
      // Transform data to match expected format
      const transformedData = data.map(item => ({
        id: item.id || item.Id,
        name: item.Name || 'Unknown',
        capacity: item.capacity || 2,
        price: item.price || 0,
        availability: item.availability || 0,
        description: item.description || '',
        amenities: typeof item.amenities === 'string' ? item.amenities.split(',') : (item.amenities || [])
      }));
      
      setRoomTypes(transformedData);
      if (transformedData.length > 0) {
        setActiveRoomType(transformedData[0]);
        setNewReservation(prev => ({ ...prev, roomType: transformedData[0].id }));
      }
    } catch (error) {
      console.error('Error loading room types:', error);
      toast.error('Failed to load room types');
      setRoomTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReservations = async () => {
    try {
      const data = await reservationService.fetchReservations();
      
      // Transform data to match expected format
      const transformedData = data.map(item => ({
        id: item.reservation_number || item.Id,
        guestName: item.guest_name || 'Unknown Guest',
        roomType: item.room_type || 'Unknown',
        checkIn: item.check_in_date || '',
        checkOut: item.check_out_date || '',
        guests: item.guests_count || 1,
        status: item.status || 'pending',
        totalAmount: item.total_amount || 0
      }));
      
      setReservations(transformedData);
    } catch (error) {
      console.error('Error loading reservations:', error);
      toast.error('Failed to load reservations');
      setReservations([]);
    }
  };

  // Filter reservations by search term
  const filteredReservations = reservations.filter(reservation => 
    reservation.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.roomType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReservation(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleGuestChange = (increment) => {
    setNewReservation(prev => ({
      ...prev,
      guests: Math.max(1, Math.min(10, prev.guests + increment))
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!newReservation.guestName.trim()) {
      newErrors.guestName = "Guest name is required";
    }
    
    if (!newReservation.checkIn) {
      newErrors.checkIn = "Check-in date is required";
    }
    
    if (!newReservation.checkOut) {
      newErrors.checkOut = "Check-out date is required";
    } else if (newReservation.checkIn && new Date(newReservation.checkOut) <= new Date(newReservation.checkIn)) {
      newErrors.checkOut = "Check-out date must be after check-in date";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
    // Generate a random ID for the new reservation
    const newId = `RSV${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Calculate number of nights and total amount
    const checkIn = new Date(newReservation.checkIn);
    const checkOut = new Date(newReservation.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    // Find selected room type to get price
    const selectedRoomType = roomTypes.find(room => room.id === newReservation.roomType);
      if (!selectedRoomType) {
        toast.error('Selected room type not found');
        return;
      }
    const totalAmount = selectedRoomType.price * nights;
    
      // Create reservation data for API
      const reservationData = {
        Name: newReservation.guestName,
        reservation_number: newId,
        guest_name: newReservation.guestName,
        check_in_date: newReservation.checkIn,
        check_out_date: newReservation.checkOut,
        guests_count: newReservation.guests,
        status: 'confirmed',
        total_amount: totalAmount,
        special_requests: newReservation.specialRequests,
        room_type: selectedRoomType.id
      };

      // Create reservation via service
      const createdReservations = await reservationService.createReservation(reservationData);
      
      if (createdReservations && createdReservations.length > 0) {
        // Reload reservations to get updated data
        await loadReservations();
        
        // Reset form and close modal
        setNewReservation({
          guestName: '',
          roomType: roomTypes[0]?.id || '',
          checkIn: '',
          checkOut: '',
          guests: 1,
          specialRequests: ''
        });
        setIsModalOpen(false);
        
        // Show success toast
        toast.success("Reservation created successfully!");
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error('Failed to create reservation');
    } finally {
      setIsSubmitting(false);
    }
    };

  const handleDelete = async (id) => {
    try {
      setIsDeleting(true);
      
      // Find the reservation to get its actual ID
      const reservation = reservations.find(r => r.id === id);
      if (!reservation) {
        toast.error('Reservation not found');
        return;
      }
      
      // Delete via service (using reservation number as ID)
      await reservationService.deleteReservation([id]);
      
      // Reload reservations to get updated data
      await loadReservations();
      
      toast.success("Reservation cancelled successfully");
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error('Failed to cancel reservation');
    } finally {
      setIsDeleting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="flex items-center justify-center py-8">
          <LoaderIcon className="h-8 w-8 animate-spin text-primary mr-3" />
          <span>Loading room types and reservations...</span>
        </div>
      </section>
    );
  }

  // Show empty state if no room types
  if (!roomTypes || roomTypes.length === 0) {
    return (
      <section className="mb-8">
        <div className="text-center py-8">
          <BedIcon className="h-16 w-16 text-surface-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-600 dark:text-surface-400 mb-2">No Room Types Available</h3>
          <p className="text-surface-500">Please add room types to start managing reservations.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold flex items-center">
          <BedIcon className="mr-2 h-6 w-6 text-primary" />
          Room Bookings & Availability
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-surface-400" />
            </div>
            <input
              type="text"
              placeholder="Search reservations..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary flex items-center whitespace-nowrap"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            New Reservation
          </button>
        </div>
      </div>

      {/* Room Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {roomTypes.map(roomType => (
          <motion.button
            key={roomType.id}
            className={`relative flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
              activeRoomType.id === roomType.id 
              ? 'bg-primary text-white shadow-lg' 
              : 'bg-white dark:bg-surface-800 shadow-card hover:bg-surface-50 dark:hover:bg-surface-700'
            }`}
            onClick={() => setActiveRoomType(roomType)}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className={`absolute top-2 right-2 text-xs font-medium px-1.5 py-0.5 rounded-full 
              ${roomType.availability < 5 
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              }`}
            >
              {roomType.availability} left
            </span>
            
            <div className="text-center mt-2">
              <p className={`font-semibold text-sm ${activeRoomType.id === roomType.id ? 'text-white' : ''}`}>
                {roomType.name}
              </p>
              <p className={`text-sm mt-1 ${activeRoomType.id === roomType.id ? 'text-white/90' : 'text-surface-500 dark:text-surface-400'}`}>
                ${roomType.price}/night
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Room Details */}
      {activeRoomType && (
      <motion.div 
        className="card mb-6 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        key={activeRoomType.id}
      >
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 p-4">
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-surface-200 dark:bg-surface-700">
              <img 
                src={`https://source.unsplash.com/600x400/?hotel,room,${activeRoomType.id}`} 
                alt={activeRoomType.name} 
                className="object-cover w-full h-full rounded-lg"
              />
            </div>
          </div>
          
          <div className="md:w-2/3 p-4">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold">{activeRoomType.name} Room</h3>
              <span className="text-lg font-bold text-primary">${activeRoomType.price}<span className="text-sm font-normal text-surface-500">/night</span></span>
            </div>
            
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {activeRoomType.capacity} Guests
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                Free WiFi
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                Air Conditioning
              </span>
              {activeRoomType.id !== 'standard' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  Mini Bar
                </span>
              )}
              {(activeRoomType.id === 'suite' || activeRoomType.id === 'presidential') && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
                  Jacuzzi
                </span>
              )}
            </div>
            
            <p className="mt-3 text-surface-600 dark:text-surface-300">
              {activeRoomType.description || "Comfortable room with modern amenities for a pleasant stay."}
            </p>

            {/* Amenities */}
            {activeRoomType.amenities && activeRoomType.amenities.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {activeRoomType.amenities.map((amenity, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {amenity.trim()}
                  </span>
                ))}
              </div>
            )}
            
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setNewReservation(prev => ({
                    ...prev,
                    roomType: activeRoomType.id
                  }));
                  setIsModalOpen(true);
                }}
              >
                Book Now
              </button>
              <button className="btn btn-outline">
                View Details
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      )}

      {/* Reservations Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
            <thead className="bg-surface-100 dark:bg-surface-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Reservation ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Guest</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Room Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Check In/Out</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-surface-800 divide-y divide-surface-200 dark:divide-surface-700">
              {filteredReservations.length > 0 ? (
                filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{reservation.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{reservation.guestName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{reservation.roomType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(reservation.checkIn).toLocaleDateString()} - {new Date(reservation.checkOut).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        reservation.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {reservation.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">${reservation.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(reservation.id)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        {isDeleting ? (
                          <LoaderIcon className="h-4 w-4 animate-spin" />
                        ) : (
                        Cancel
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-surface-500">
                    <div className="flex flex-col items-center py-6">
                      <AlertIcon className="h-10 w-10 text-surface-400 mb-2" />
                      <p>No reservations found matching "{searchTerm}"</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Reservation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center p-4 z-50"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-surface-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 flex justify-between items-start border-b border-surface-200 dark:border-surface-700">
                <div>
                  <h3 className="text-xl font-semibold">New Reservation</h3>
                  <p className="text-surface-500 text-sm mt-1">Create a new guest reservation</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Guest Information */}
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-surface-500 mb-3 flex items-center">
                      <UserIcon className="mr-1.5 h-4 w-4" />
                      Guest Information
                    </h4>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="guestName" className="form-label">Guest Name</label>
                    <input
                      type="text"
                      id="guestName"
                      name="guestName"
                      value={newReservation.guestName}
                      onChange={handleInputChange}
                      className={`form-input ${errors.guestName ? 'border-red-500' : ''}`}
                      placeholder="Full name"
                    />
                    {errors.guestName && (
                      <p className="mt-1 text-sm text-red-600">{errors.guestName}</p>
                    )}
                  </div>
                  
                  {/* Reservation Details */}
                  <div className="md:col-span-2 mt-2">
                    <h4 className="text-sm font-medium text-surface-500 mb-3 flex items-center">
                      <CalendarIcon className="mr-1.5 h-4 w-4" />
                      Reservation Details
                    </h4>
                  </div>
                  
                  <div>
                    <label htmlFor="roomType" className="form-label">Room Type</label>
                    <select
                      id="roomType"
                      name="roomType"
                      value={newReservation.roomType}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      {roomTypes.map(room => (
                        <option key={room.id} value={room.id}>{room.name} - ${room.price}/night</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Number of Guests</label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => handleGuestChange(-1)}
                        className="p-2 rounded-l-lg bg-surface-100 dark:bg-surface-700 border border-surface-300 dark:border-surface-600"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        name="guests"
                        value={newReservation.guests}
                        onChange={handleInputChange}
                        min="1"
                        max="10"
                        className="form-input rounded-none border-y border-x-0 border-surface-300 dark:border-surface-600 text-center w-16"
                      />
                      <button
                        type="button"
                        onClick={() => handleGuestChange(1)}
                        className="p-2 rounded-r-lg bg-surface-100 dark:bg-surface-700 border border-surface-300 dark:border-surface-600"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="checkIn" className="form-label">Check-in Date</label>
                    <input
                      type="date"
                      id="checkIn"
                      name="checkIn"
                      value={newReservation.checkIn}
                      onChange={handleInputChange}
                      className={`form-input ${errors.checkIn ? 'border-red-500' : ''}`}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.checkIn && (
                      <p className="mt-1 text-sm text-red-600">{errors.checkIn}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="checkOut" className="form-label">Check-out Date</label>
                    <input
                      type="date"
                      id="checkOut"
                      name="checkOut"
                      value={newReservation.checkOut}
                      onChange={handleInputChange}
                      className={`form-input ${errors.checkOut ? 'border-red-500' : ''}`}
                      min={newReservation.checkIn || new Date().toISOString().split('T')[0]}
                    />
                    {errors.checkOut && (
                      <p className="mt-1 text-sm text-red-600">{errors.checkOut}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="specialRequests" className="form-label">Special Requests</label>
                    <textarea
                      id="specialRequests"
                      name="specialRequests"
                      value={newReservation.specialRequests}
                      onChange={handleInputChange}
                      rows="3"
                      className="form-input"
                      placeholder="Any special requests or requirements"
                    ></textarea>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? (
                      <LoaderIcon className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                    <SaveIcon className="mr-1.5 h-4 w-4" />
                    )}
                    Create Reservation
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default MainFeature;