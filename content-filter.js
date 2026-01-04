// =================================================================
// CONTENT FILTER & SEARCH SYSTEM
// Interactive filtering, searching, and collapsible items
// =================================================================

class ContentFilter {
  constructor(options = {}) {
    this.searchInput = document.getElementById(options.searchId || 'search-input');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.categoryTabs = document.querySelectorAll('.tab-btn');
    this.collapsibleItems = document.querySelectorAll('.collapsible-item');
    this.categorySections = document.querySelectorAll('.category-section');
    this.noResultsMsg = document.getElementById('no-results');
    this.expandCollapseBtn = document.getElementById('expand-collapse-btn');
    
    this.currentFilter = 'all';
    this.currentTab = 'all';
    this.searchTerm = '';
    this.allExpanded = false;
    
    this.init();
  }

  init() {
    // Search functionality
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase();
        this.applyFilters();
      });
    }

    // Filter buttons
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.applyFilters();
      });
    });

    // Category tabs
    this.categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentTab = tab.dataset.category;
        this.showCategory(this.currentTab);
      });
    });

    // Collapsible items
    this.collapsibleItems.forEach(item => {
      const header = item.querySelector('.collapsible-header');
      if (header) {
        header.addEventListener('click', () => {
          item.classList.toggle('expanded');
        });
      }
    });

    // Expand/Collapse all button
    if (this.expandCollapseBtn) {
      this.expandCollapseBtn.addEventListener('click', () => {
        this.toggleAllItems();
      });
    }

    // Initialize stats
    this.updateStats();
  }

  applyFilters() {
    let visibleCount = 0;

    this.collapsibleItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      const category = item.dataset.category || '';
      const status = item.dataset.status || '';
      const date = item.dataset.date || '';

      // Check search term
      const matchesSearch = this.searchTerm === '' || text.includes(this.searchTerm);

      // Check filter
      let matchesFilter = true;
      if (this.currentFilter !== 'all') {
        if (this.currentFilter === 'fulfilled') {
          matchesFilter = status === 'fulfilled';
        } else if (this.currentFilter === 'partial') {
          matchesFilter = status === 'partial';
        } else if (this.currentFilter === 'unfulfilled') {
          matchesFilter = status === 'unfulfilled';
        } else if (this.currentFilter.startsWith('year-')) {
          const year = this.currentFilter.replace('year-', '');
          matchesFilter = date.includes(year);
        }
      }

      // Show/hide item
      if (matchesSearch && matchesFilter) {
        item.classList.remove('hidden');
        visibleCount++;
        
        // Auto-expand if searching
        if (this.searchTerm !== '') {
          item.classList.add('expanded');
        }
      } else {
        item.classList.add('hidden');
        item.classList.remove('expanded');
      }
    });

    // Show/hide no results message
    if (this.noResultsMsg) {
      if (visibleCount === 0) {
        this.noResultsMsg.classList.add('show');
      } else {
        this.noResultsMsg.classList.remove('show');
      }
    }

    // Update stats
    this.updateStats();
  }

  showCategory(category) {
    if (category === 'all') {
      this.categorySections.forEach(section => {
        section.classList.remove('hidden');
      });
      this.collapsibleItems.forEach(item => {
        item.classList.remove('hidden');
      });
    } else {
      this.categorySections.forEach(section => {
        if (section.dataset.category === category) {
          section.classList.remove('hidden');
        } else {
          section.classList.add('hidden');
        }
      });

      this.collapsibleItems.forEach(item => {
        if (item.dataset.category === category) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    }

    this.updateStats();
  }

  toggleAllItems() {
    this.allExpanded = !this.allExpanded;
    
    const visibleItems = Array.from(this.collapsibleItems).filter(
      item => !item.classList.contains('hidden')
    );

    visibleItems.forEach(item => {
      if (this.allExpanded) {
        item.classList.add('expanded');
      } else {
        item.classList.remove('expanded');
      }
    });

    if (this.expandCollapseBtn) {
      this.expandCollapseBtn.textContent = this.allExpanded ? 'Collapse All' : 'Expand All';
    }
  }

  updateStats() {
    const visibleItems = Array.from(this.collapsibleItems).filter(
      item => !item.classList.contains('hidden')
    );

    // Update total count
    const totalCountEl = document.getElementById('total-count');
    if (totalCountEl) {
      totalCountEl.textContent = visibleItems.length;
    }

    // Update category counts
    const categories = {};
    visibleItems.forEach(item => {
      const cat = item.dataset.category || 'other';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    // Update status counts (for promises page)
    const statusCounts = {
      fulfilled: 0,
      partial: 0,
      unfulfilled: 0
    };

    visibleItems.forEach(item => {
      const status = item.dataset.status;
      if (status && statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });

    const fulfilledCountEl = document.getElementById('fulfilled-count');
    const partialCountEl = document.getElementById('partial-count');
    const unfulfilledCountEl = document.getElementById('unfulfilled-count');

    if (fulfilledCountEl) fulfilledCountEl.textContent = statusCounts.fulfilled;
    if (partialCountEl) partialCountEl.textContent = statusCounts.partial;
    if (unfulfilledCountEl) unfulfilledCountEl.textContent = statusCounts.unfulfilled;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if we're on a content page (not the game page)
  if (document.getElementById('search-input')) {
    new ContentFilter();
  }
});

