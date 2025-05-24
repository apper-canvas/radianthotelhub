const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'room_type';

// Fields for room_type table
const allFields = [
  'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy',
  'id', 'capacity', 'price', 'availability', 'description', 'amenities'
];

// Only updateable fields for create/update operations
const updateableFields = [
  'Name', 'Tags', 'Owner', 'id', 'capacity', 'price', 'availability', 'description', 'amenities'
];

export const roomTypeService = {
  // Fetch all room types
  async fetchRoomTypes(params = {}) {
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
      console.error("Error fetching room types:", error);
      throw error;
    }
  },

  // Get room type by ID
  async getRoomTypeById(recordId) {
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
      console.error(`Error fetching room type with ID ${recordId}:`, error);
      throw error;
    }
  },

  // Create new room type
  async createRoomType(roomTypeData) {
    try {
      // Filter to only include updateable fields
      const filteredData = {};
      updateableFields.forEach(field => {
        if (roomTypeData[field] !== undefined && roomTypeData[field] !== null) {
          filteredData[field] = roomTypeData[field];
        }
      });

      // Format data according to field types
      if (filteredData.amenities && Array.isArray(filteredData.amenities)) {
        filteredData.amenities = filteredData.amenities.join(',');
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
          console.warn('Failed to create some room types:', failedRecords);
        }
        
        return successfulRecords.map(result => result.data);
      } else {
        throw new Error("Room type creation failed");
      }
    } catch (error) {
      console.error("Error creating room type:", error);
      throw error;
    }
  },

  // Update room type
  async updateRoomType(roomTypeData) {
    try {
      // Filter to only include updateable fields (plus ID)
      const filteredData = { Id: roomTypeData.Id || roomTypeData.id };
      updateableFields.forEach(field => {
        if (roomTypeData[field] !== undefined && roomTypeData[field] !== null) {
          filteredData[field] = roomTypeData[field];
        }
      });

      // Format data according to field types
      if (filteredData.amenities && Array.isArray(filteredData.amenities)) {
        filteredData.amenities = filteredData.amenities.join(',');
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
          console.warn('Failed to update some room types:', failedUpdates);
        }
        
        return successfulUpdates.map(result => result.data);
      } else {
        throw new Error("Room type update failed");
      }
    } catch (error) {
      console.error("Error updating room type:", error);
      throw error;
    }
  },

  // Delete room type
  async deleteRoomType(recordIds) {
    try {
      const params = {
        RecordIds: Array.isArray(recordIds) ? recordIds : [recordIds]
      };

      const response = await apperClient.deleteRecord(tableName, params);
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.warn('Failed to delete some room types:', failedDeletions);
        }
        
        return true;
      } else {
        throw new Error("Room type deletion failed");
      }
    } catch (error) {
      console.error("Error deleting room type:", error);
      throw error;
    }
  }
};