const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'hotel_stats';

// Fields for hotel_stats table
const allFields = [
  'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy',
  'occupancy_rate', 'available_rooms', 'pending_services', 'upcoming_check_ins', 'revenue'
];

// Only updateable fields for create/update operations
const updateableFields = [
  'Name', 'Tags', 'Owner', 'occupancy_rate', 'available_rooms', 'pending_services', 
  'upcoming_check_ins', 'revenue'
];

export const hotelStatsService = {
  // Fetch all hotel stats
  async fetchHotelStats(params = {}) {
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
      console.error("Error fetching hotel stats:", error);
      throw error;
    }
  },

  // Get latest hotel stats (most recent record)
  async getLatestHotelStats() {
    try {
      const params = {
        fields: allFields,
        orderBy: [
          {
            fieldName: "CreatedOn",
            SortType: "DESC"
          }
        ],
        pagingInfo: {
          limit: 1,
          offset: 0
        }
      };

      const response = await apperClient.fetchRecords(tableName, params);
      
      if (!response || !response.data || response.data.length === 0) {
        return null;
      }
      
      return response.data[0];
    } catch (error) {
      console.error("Error fetching latest hotel stats:", error);
      throw error;
    }
  },

  // Get hotel stats by ID
  async getHotelStatsById(recordId) {
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
      console.error(`Error fetching hotel stats with ID ${recordId}:`, error);
      throw error;
    }
  },

  // Create new hotel stats
  async createHotelStats(statsData) {
    try {
      // Filter to only include updateable fields
      const filteredData = {};
      updateableFields.forEach(field => {
        if (statsData[field] !== undefined && statsData[field] !== null) {
          filteredData[field] = statsData[field];
        }
      });

      // Format data according to field types
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
          console.warn('Failed to create some hotel stats:', failedRecords);
        }
        
        return successfulRecords.map(result => result.data);
      } else {
        throw new Error("Hotel stats creation failed");
      }
    } catch (error) {
      console.error("Error creating hotel stats:", error);
      throw error;
    }
  },

  // Update hotel stats
  async updateHotelStats(statsData) {
    try {
      // Filter to only include updateable fields (plus ID)
      const filteredData = { Id: statsData.Id || statsData.id };
      updateableFields.forEach(field => {
        if (statsData[field] !== undefined && statsData[field] !== null) {
          filteredData[field] = statsData[field];
        }
      });

      // Format data according to field types
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
          console.warn('Failed to update some hotel stats:', failedUpdates);
        }
        
        return successfulUpdates.map(result => result.data);
      } else {
        throw new Error("Hotel stats update failed");
      }
    } catch (error) {
      console.error("Error updating hotel stats:", error);
      throw error;
    }
  }
};