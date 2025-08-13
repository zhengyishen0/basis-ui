import { supabase } from "./supabase.js";

/**
 * Creates a generic data store for any Supabase table/view
 * @param {string} tableName - The name of the Supabase table/view
 * @param {Object} config - Configuration options
 * @returns {Object} Store object with CRUD operations
 */
export function createDataStore(tableName, config = {}) {
  const defaults = {
    orderBy: "created_at",
    ascending: false,
    userField: "user_id",
    primaryKey: "id",
  };

  const options = { ...defaults, ...config };

  return {
    // State
    items: [],
    loading: false,
    error: null,
    currentFilters: {},

    // Generic load with dynamic filters
    async load(userId, filters = {}) {
      this.loading = true;
      this.error = null;
      this.currentFilters = filters;

      try {
        let query = supabase.from(tableName).select("*");

        // Add user filter if userId is provided (unless bypassed)
        if (userId && options.userField && !filters._loadAllUsers) {
          filters = { ...filters, [options.userField]: userId };
        }

        // Apply dynamic filters
        Object.entries(filters).forEach(([key, value]) => {
          if (key.startsWith("_") || value === null || value === undefined)
            return;

          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (typeof value === "object") {
            if ("min" in value && value.min !== null) {
              query = query.gte(key, value.min);
            }
            if ("max" in value && value.max !== null) {
              query = query.lte(key, value.max);
            }
            if ("like" in value) {
              query = query.like(key, value.like);
            }
            if ("ilike" in value) {
              query = query.ilike(key, value.ilike);
            }
          } else {
            query = query.eq(key, value);
          }
        });

        // Apply ordering
        if (options.orderBy) {
          query = query.order(options.orderBy, {
            ascending: options.ascending,
          });
        }

        const { data, error } = await query;
        if (error) throw error;

        this.items = data || [];

        // Call afterLoad hook if provided
        if (options.afterLoad) {
          await options.afterLoad.call(this, this.items);
        }
      } catch (error) {
        this.error = `Failed to load ${tableName}: ${error.message}`;
      } finally {
        this.loading = false;
      }
    },

    // Refresh with current filters
    async refresh(userId) {
      await this.load(userId, this.currentFilters);
    },

    // Create item
    async create(userId, itemData) {
      if (!userId && options.userField) return;

      this.loading = true;
      this.error = null;

      try {
        // Prepare data
        const dataToInsert = {
          ...itemData,
        };

        if (options.userField && userId) {
          dataToInsert[options.userField] = userId;
        }

        // Call beforeCreate hook if provided
        if (options.beforeCreate) {
          await options.beforeCreate.call(this, dataToInsert);
        }

        const { data, error } = await supabase
          .from(tableName)
          .insert([dataToInsert])
          .select();

        if (error) throw error;

        if (data && data[0]) {
          // Add to items array based on ordering
          if (options.orderBy === "created_at" && !options.ascending) {
            this.items.unshift(data[0]);
          } else {
            this.items.push(data[0]);
          }

          // Call afterCreate hook if provided
          if (options.afterCreate) {
            await options.afterCreate.call(this, data[0]);
          }
        }

        return data?.[0];
      } catch (error) {
        this.error = `Failed to create ${tableName}: ${error.message}`;

        // Try to refresh to ensure consistency
        await this.refresh(userId);
      } finally {
        this.loading = false;
      }
    },

    // Update item
    async update(userId, id, updates) {
      if (!userId && options.userField) return;

      try {
        // Call beforeUpdate hook if provided
        if (options.beforeUpdate) {
          await options.beforeUpdate.call(this, id, updates);
        }

        const { error } = await supabase
          .from(tableName)
          .update(updates)
          .eq(options.primaryKey, id)
          .eq(options.userField, userId);

        if (error) throw error;

        // Update local state
        const index = this.items.findIndex(
          (item) => item[options.primaryKey] === id,
        );
        if (index !== -1) {
          this.items[index] = { ...this.items[index], ...updates };

          // Call afterUpdate hook if provided
          if (options.afterUpdate) {
            await options.afterUpdate.call(this, this.items[index]);
          }
        }
      } catch (error) {
        this.error = `Failed to update ${tableName}: ${error.message}`;
      }
    },

    // Delete item
    async delete(userId, id) {
      if (!userId && options.userField) return;

      try {
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq(options.primaryKey, id)
          .eq(options.userField, userId);

        if (error) throw error;

        // Remove from local state
        this.items = this.items.filter(
          (item) => item[options.primaryKey] !== id,
        );

        // Call afterDelete hook if provided
        if (options.afterDelete) {
          await options.afterDelete.call(this, id);
        }
      } catch (error) {
        this.error = `Failed to delete ${tableName}: ${error.message}`;
      }
    },

    // Advanced query with full Supabase query access
    async query(buildQuery) {
      this.loading = true;
      this.error = null;

      try {
        const baseQuery = supabase.from(tableName).select("*");
        const query = buildQuery(baseQuery);

        const { data, error } = await query;
        if (error) throw error;

        this.items = data || [];
        return data;
      } catch (error) {
        this.error = `Query failed: ${error.message}`;
      } finally {
        this.loading = false;
      }
    },

    // Real-time subscription with filter support
    subscribe(userId, filters = {}, callbacks = {}) {
      const channelName = `${tableName}_${userId || "public"}_${Date.now()}`;

      console.log("Setting up subscription for:", tableName, "userId:", userId);

      // Add user filter if userId is provided
      if (userId && options.userField) {
        filters = { ...filters, [options.userField]: userId };
      }

      // Build filter string for real-time subscription
      let filterString = "";

      // Add additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (key.startsWith("_")) return; // Skip internal filters

        let filterPart = "";
        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ) {
          filterPart = `${key}=eq.${value}`;
        } else if (Array.isArray(value)) {
          filterPart = `${key}=in.(${value.join(",")})`;
        } else if (typeof value === "object") {
          if (value.min !== undefined) {
            filterPart = `${key}=gte.${value.min}`;
          } else if (value.max !== undefined) {
            filterPart = `${key}=lte.${value.max}`;
          }
        }

        if (filterPart) {
          filterString = filterString
            ? `${filterString}&${filterPart}`
            : filterPart;
        }
      });

      console.log("Filter string:", filterString);

      const channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: tableName,
            filter: filterString || undefined,
          },
          (payload) => {
            console.log("Real-time event received:", payload);
            this.handleRealtimeEvent(payload, callbacks);
          },
        )
        .subscribe((status) => {
          console.log("Subscription status:", status);
        });

      // Store subscription reference
      this._subscription = channel;

      // Return unsubscribe function
      return () => {
        if (this._subscription) {
          this._subscription.unsubscribe();
          this._subscription = null;
        }
      };
    },

    // Handle real-time events
    handleRealtimeEvent(payload, callbacks = {}) {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      switch (eventType) {
        case "INSERT":
          // Add new record to items
          if (options.orderBy === "created_at" && !options.ascending) {
            this.items.unshift(newRecord);
          } else {
            this.items.push(newRecord);
          }

          if (callbacks.onInsert) {
            callbacks.onInsert(newRecord);
          }
          break;

        case "UPDATE":
          // Update existing record
          const updateIndex = this.items.findIndex(
            (item) =>
              item[options.primaryKey] === newRecord[options.primaryKey],
          );

          if (updateIndex !== -1) {
            this.items[updateIndex] = newRecord;
          }

          if (callbacks.onUpdate) {
            callbacks.onUpdate(newRecord, oldRecord);
          }
          break;

        case "DELETE":
          // Remove record from items
          this.items = this.items.filter(
            (item) =>
              item[options.primaryKey] !== oldRecord[options.primaryKey],
          );

          if (callbacks.onDelete) {
            callbacks.onDelete(oldRecord);
          }
          break;
      }

      // Call general onChange callback
      if (callbacks.onChange) {
        callbacks.onChange(eventType, newRecord, oldRecord);
      }
    },

    // Unsubscribe from real-time updates
    unsubscribe() {
      if (this._subscription) {
        this._subscription.unsubscribe();
        this._subscription = null;
      }
    },
  };
}
