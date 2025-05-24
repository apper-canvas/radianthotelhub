const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'reservation';

// Fields for reservation table
const allFields = [
  'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy',
  'reservation_number', 'guest_name', 'check_in_date', 'check_out_date', 
  'guests_count', 'status', 'total_amount', 'special_requests', 'room_type'
];

// Only updateable fields for create/update operations
const updateableFields = [
  'Name', 'Tags', 'Owner', 'reservation_number', 'guest_name', 'check_in_date', 
  'check_out_date', 'guests_count', 'status', 'total_amount', 'special_requests', 'room_type'
];

export const reservationService = {
  // Fetch all reservations
  async fetchReservations(params = {}) {
    try {
      const queryParams = {
        fields: allFields,
        ...params
      };

      const response = await apperClient.fetchRecords(tableName, queryParams);
      
      if (!response || !response.data || response.data.length === 0) {
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching reservations:", error);
      throw error;
    }
  },

  // Get reservation by ID
  async getReservationById(recordId) {
    try {
      const params = {
        fields: allFields
      };

      const response = await apperClient.getRecordById(tableName, recordId, params);
      
      if (!response || !response.data) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching reservation with ID ${recordId}:`, error);
      throw error;
    }
  },

  // Create new reservation
  async createReservation(reservationData) {
    try {
      // Filter to only include updateable fields
      const filteredData = {};
      updateableFields.forEach(field => {
        if (reservationData[field] !== undefined && reservationData[field] !== null) {
          filteredData[field] = reservationData[field];
        }
      });

      // Format data according to field types
      if (filteredData.check_in_date) {
        filteredData.check_in_date = filteredData.check_in_date; // Already in YYYY-MM-DD format
      }
      if (filteredData.check_out_date) {
        filteredData.check_out_date = filteredData.check_out_date; // Already in YYYY-MM-DD format
      }
      if (filteredData.Tags && Array.isArray(filteredData.Tags)) {
        filteredData.Tags = filteredData.Tags.join(',');
      }

      const params = {
        records: [filteredData]
      };

      const response = await apperClient.createRecord(tableName, params);
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.warn('Failed to create some reservations:', failedRecords);
        }
        
        return successfulRecords.map(result => result.data);
      } else {
        throw new Error("Reservation creation failed");
      }
    } catch (error) {
      console.error("Error creating reservation:", error);
      throw error;
    }
  },

  // Update reservation
  async updateReservation(reservationData) {
    try {
      // Filter to only include updateable fields (plus ID)
      const filteredData = { Id: reservationData.Id || reservationData.id };
      updateableFields.forEach(field => {
        if (reservationData[field] !== undefined && reservationData[field] !== null) {
          filteredData[field] = reservationData[field];
        }
      });

      // Format data according to field types
      if (filteredData.check_in_date) {
        filteredData.check_in_date = filteredData.check_in_date; // Already in YYYY-MM-DD format
      }
      if (filteredData.check_out_date) {
        filteredData.check_out_date = filteredData.check_out_date; // Already in YYYY-MM-DD format
      }
      if (filteredData.Tags && Array.isArray(filteredData.Tags)) {
        filteredData.Tags = filteredData.Tags.join(',');
      }

      const params = {
        records: [filteredData]
      };

      const response = await apperClient.updateRecord(tableName, params);
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.warn('Failed to update some reservations:', failedUpdates);
        }
        
        return successfulUpdates.map(result => result.data);
      } else {
        throw new Error("Reservation update failed");
      }
    } catch (error) {
      console.error("Error updating reservation:", error);
      throw error;
    }
  },

  // Delete reservation
  async deleteReservation(recordIds) {
    try {
      const params = {
        RecordIds: Array.isArray(recordIds) ? recordIds : [recordIds]
      };

      const response = await apperClient.deleteRecord(tableName, params);
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.warn('Failed to delete some reservations:', failedDeletions);
        }
        
        return true;
      } else {
        throw new Error("Reservation deletion failed");
      }
    } catch (error) {
      console.error("Error deleting reservation:", error);
      throw error;
    }
  }
};