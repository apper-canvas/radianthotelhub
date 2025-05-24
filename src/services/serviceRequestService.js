const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'service_request';

// Fields for service_request table
const allFields = [
  'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy',
  'request_number', 'room_number', 'service_type', 'guest_name', 'priority', 
  'requested_time', 'status'
];

// Only updateable fields for create/update operations
const updateableFields = [
  'Name', 'Tags', 'Owner', 'request_number', 'room_number', 'service_type', 
  'guest_name', 'priority', 'requested_time', 'status'
];

export const serviceRequestService = {
  // Fetch all service requests
  async fetchServiceRequests(params = {}) {
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
      console.error("Error fetching service requests:", error);
      throw error;
    }
  },

  // Get service request by ID
  async getServiceRequestById(recordId) {
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
      console.error(`Error fetching service request with ID ${recordId}:`, error);
      throw error;
    }
  },

  // Create new service request
  async createServiceRequest(serviceRequestData) {
    try {
      // Filter to only include updateable fields
      const filteredData = {};
      updateableFields.forEach(field => {
        if (serviceRequestData[field] !== undefined && serviceRequestData[field] !== null) {
          filteredData[field] = serviceRequestData[field];
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
          console.warn('Failed to create some service requests:', failedRecords);
        }
        
        return successfulRecords.map(result => result.data);
      } else {
        throw new Error("Service request creation failed");
      }
    } catch (error) {
      console.error("Error creating service request:", error);
      throw error;
    }
  },

  // Update service request
  async updateServiceRequest(serviceRequestData) {
    try {
      // Filter to only include updateable fields (plus ID)
      const filteredData = { Id: serviceRequestData.Id || serviceRequestData.id };
      updateableFields.forEach(field => {
        if (serviceRequestData[field] !== undefined && serviceRequestData[field] !== null) {
          filteredData[field] = serviceRequestData[field];
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
          console.warn('Failed to update some service requests:', failedUpdates);
        }
        
        return successfulUpdates.map(result => result.data);
      } else {
        throw new Error("Service request update failed");
      }
    } catch (error) {
      console.error("Error updating service request:", error);
      throw error;
    }
  },

  // Delete service request
  async deleteServiceRequest(recordIds) {
    try {
      const params = {
        RecordIds: Array.isArray(recordIds) ? recordIds : [recordIds]
      };

      const response = await apperClient.deleteRecord(tableName, params);
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.warn('Failed to delete some service requests:', failedDeletions);
        }
        
        return true;
      } else {
        throw new Error("Service request deletion failed");
      }
    } catch (error) {
      console.error("Error deleting service request:", error);
      throw error;
    }
  },

  // Complete service request (update status to completed)
  async completeServiceRequest(recordId) {
    try {
      return await this.updateServiceRequest({
        Id: recordId,
        status: 'completed'
      });
    } catch (error) {
      console.error("Error completing service request:", error);
      throw error;
    }
  }
};