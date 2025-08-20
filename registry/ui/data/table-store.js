/**
 * Alpine.js Table Store for reactive data table functionality
 * Provides sorting, filtering, pagination, and selection features
 */

export function createTableStore(initialData = {}) {
  return {
    // Core data
    data: initialData.data || [],
    columns: initialData.columns || [],
    
    // State management
    filteredData: [],
    sortBy: null,
    sortDirection: 'asc',
    searchQuery: '',
    selectedRows: new Set(),
    
    // Pagination
    currentPage: 1,
    pageSize: initialData.pageSize || 10,
    
    // UI state
    isLoading: false,
    selectAll: false,
    
    // Initialization
    init() {
      this.filteredData = [...this.data];
      this.updateSelectAllState();
    },
    
    // Computed properties
    get paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredData.slice(start, end);
    },
    
    get totalPages() {
      return Math.ceil(this.filteredData.length / this.pageSize);
    },
    
    get hasData() {
      return this.filteredData.length > 0;
    },
    
    get selectedCount() {
      return this.selectedRows.size;
    },
    
    get hasSelection() {
      return this.selectedRows.size > 0;
    },
    
    // Sorting functionality
    sort(columnKey) {
      if (this.sortBy === columnKey) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortBy = columnKey;
        this.sortDirection = 'asc';
      }
      
      this.filteredData.sort((a, b) => {
        let aVal = a[columnKey];
        let bVal = b[columnKey];
        
        // Handle different data types
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        
        if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
      
      // Reset to first page after sorting
      this.currentPage = 1;
    },
    
    // Filtering functionality
    filter(query = null) {
      const searchTerm = (query !== null ? query : this.searchQuery).toLowerCase();
      
      if (!searchTerm) {
        this.filteredData = [...this.data];
      } else {
        this.filteredData = this.data.filter(row =>
          Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchTerm)
          )
        );
      }
      
      // Reset to first page after filtering
      this.currentPage = 1;
      this.updateSelectAllState();
    },
    
    // Pagination functionality
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    
    nextPage() {
      this.goToPage(this.currentPage + 1);
    },
    
    previousPage() {
      this.goToPage(this.currentPage - 1);
    },
    
    setPageSize(size) {
      this.pageSize = size;
      this.currentPage = 1;
    },
    
    // Selection functionality
    toggleRowSelection(rowId) {
      if (this.selectedRows.has(rowId)) {
        this.selectedRows.delete(rowId);
      } else {
        this.selectedRows.add(rowId);
      }
      this.updateSelectAllState();
    },
    
    toggleSelectAll() {
      if (this.selectAll) {
        this.selectedRows.clear();
      } else {
        this.paginatedData.forEach(row => {
          if (row.id) this.selectedRows.add(row.id);
        });
      }
      this.updateSelectAllState();
    },
    
    updateSelectAllState() {
      const visibleIds = this.paginatedData.filter(row => row.id).map(row => row.id);
      this.selectAll = visibleIds.length > 0 && visibleIds.every(id => this.selectedRows.has(id));
    },
    
    clearSelection() {
      this.selectedRows.clear();
      this.selectAll = false;
    },
    
    // Utility methods
    isRowSelected(rowId) {
      return this.selectedRows.has(rowId);
    },
    
    getSortIcon(columnKey) {
      if (this.sortBy !== columnKey) return 'unsorted';
      return this.sortDirection === 'asc' ? 'asc' : 'desc';
    },
    
    // Data manipulation
    updateData(newData) {
      this.data = newData;
      this.filter(); // Re-apply current filter
      this.clearSelection();
    },
    
    refreshData() {
      // Hook for server-side data refresh
      this.isLoading = true;
      // Emit event for parent component to handle
      this.$dispatch('table-refresh');
    }
  };
}