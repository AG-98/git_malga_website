document.addEventListener('DOMContentLoaded', function() {
  // Configuration
  const itemsPerPage = 5;
  let currentPage = 1;
  let allPublications = [];
  let filteredPublications = [];
  let sortColumn = 'year';
  let sortDirection = 'desc';

  // DOM elements
  const tableBody = document.getElementById('publication-body');
  const searchInput = document.getElementById('search-input');
  const noResults = document.getElementById('no-results');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  const pageInfo = document.getElementById('page-info');
  const pageSizeSelect = document.getElementById('page-size');
  const sortableHeaders = document.querySelectorAll('.sortable');

  // Initialize
  loadPublications();
  setupEventListeners();

  function loadPublications() {
    
    // In a real implementation, you would load from CSV like this:
    
    fetch('/publications.csv')
      .then(response => response.text())
      .then(csvData => {
        allPublications = parseCSV(csvData);
        filteredPublications = [...allPublications];
        sortPublications();
        renderTable();
        updatePagination();
      });
    

    filteredPublications = [...allPublications];
    sortPublications();
    renderTable();
    updatePagination();
  }

  function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', function() {
      currentPage = 1;
      filterPublications();
      renderTable();
      updatePagination();
    });

    // Sorting
    sortableHeaders.forEach(header => {
      header.addEventListener('click', function() {
        const column = this.dataset.sortBy;
        
        if (sortColumn === column) {
          sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          sortColumn = column;
          sortDirection = 'asc';
        }
        
        // Update sort icons
        sortableHeaders.forEach(h => {
          const icon = h.querySelector('.sort-icon');
          if (h.dataset.sortBy === column) {
            icon.textContent = sortDirection === 'asc' ? '▲' : '▼';
          } else {
            icon.textContent = '▲';
          }
        });
        
        sortPublications();
        renderTable();
      });
    });

    // Pagination
    prevPageBtn.addEventListener('click', function() {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
        updatePagination();
      }
    });

    nextPageBtn.addEventListener('click', function() {
      const totalPages = Math.ceil(filteredPublications.length / parseInt(pageSizeSelect.value));
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
        updatePagination();
      }
    });

    // Page size change
    pageSizeSelect.addEventListener('change', function() {
      currentPage = 1;
      renderTable();
      updatePagination();
    });
  }

  function filterPublications() {
    const searchTerm = searchInput.value.toLowerCase();
    
    if (!searchTerm) {
      filteredPublications = [...allPublications];
      return;
    }
    
    filteredPublications = allPublications.filter(pub => {
      return (
        pub.title.toLowerCase().includes(searchTerm) ||
        pub.authors.toLowerCase().includes(searchTerm) ||
        pub.year.toString().includes(searchTerm) ||
        pub.venue.toLowerCase().includes(searchTerm)
      );
    });
  }

  function sortPublications() {
    filteredPublications.sort((a, b) => {
      let valueA = a[sortColumn];
      let valueB = b[sortColumn];
      
      // Convert to string for consistent comparison
      valueA = String(valueA).toLowerCase();
      valueB = String(valueB).toLowerCase();
      
      if (valueA < valueB) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  function renderTable() {
    const pageSize = parseInt(pageSizeSelect.value);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const publicationsToShow = filteredPublications.slice(startIndex, endIndex);
    
    tableBody.innerHTML = '';
    
    if (publicationsToShow.length === 0) {
      noResults.classList.remove('hidden');
      return;
    }
    
    noResults.classList.add('hidden');
    
    publicationsToShow.forEach(pub => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${pub.title}</td>
        <td>${pub.year}</td>
        <td>${pub.authors}</td>
        <td>${pub.venue}</td>
        <td><a href="${pub.link}" target="_blank">View</a></td>
      `;
      
      tableBody.appendChild(row);
    });
  }

  function updatePagination() {
    const pageSize = parseInt(pageSizeSelect.value);
    const totalItems = filteredPublications.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
  }

  // Helper function to parse CSV (would be used with real CSV data)
  function parseCSV(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i]) continue;
      
      const obj = {};
      const currentLine = lines[i].split(',');
      
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentLine[j] ? currentLine[j].trim() : '';
      }
      
      result.push(obj);
    }
    
    return result;
  }
});