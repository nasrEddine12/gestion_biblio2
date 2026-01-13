/**
 * Local Storage Management Module
 * Handles all data persistence operations
 */

const Storage = {
    /**
     * Get data from localStorage
     * @param {string} key 
     * @returns {Array|Object|null}
     */
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error reading from localStorage: ${key}`, error);
            return null;
        }
    },

    /**
     * Save data to localStorage
     * @param {string} key 
     * @param {any} data 
     * @returns {boolean} Success status
     */
    set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error writing to localStorage: ${key}`, error);
            return false;
        }
    },

    /**
     * Remove data from localStorage
     * @param {string} key 
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing from localStorage: ${key}`, error);
            return false;
        }
    },

    /**
     * Initialize default data if not exists
     */
    initializeDefaults() {
        const defaults = {
            'library_books': [],
            'library_authors': [],
            'library_members': [],
            'library_loans': [],
            'library_categories': []
        };

        for (const [key, value] of Object.entries(defaults)) {
            if (this.get(key) === null) {
                this.set(key, value);
            }
        }
    },

    /**
     * Generate unique ID
     * @returns {string}
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Clear all library data (for testing/reset purposes)
     */
    clearAll() {
        const keys = ['library_books', 'library_authors', 'library_members', 'library_loans', 'library_categories'];
        keys.forEach(key => this.remove(key));
    },

    /**
     * Initialize with sample/demo data
     */
    initializeSampleData() {
        // Clear existing data first
        this.clearAll();
        this.initializeDefaults();

        const now = new Date().toISOString();

        // Sample Categories
        const categories = [
            { id: 'cat1', name: 'Fiction', description: 'Fictional literature and novels', createdAt: now, updatedAt: now },
            { id: 'cat2', name: 'Science', description: 'Scientific and educational books', createdAt: now, updatedAt: now },
            { id: 'cat3', name: 'History', description: 'Historical accounts and biographies', createdAt: now, updatedAt: now },
            { id: 'cat4', name: 'Technology', description: 'Computer science and programming', createdAt: now, updatedAt: now },
            { id: 'cat5', name: 'Philosophy', description: 'Philosophical works and essays', createdAt: now, updatedAt: now }
        ];

        // Sample Authors
        const authors = [
            { id: 'auth1', name: 'George', surname: 'Orwell', createdAt: now, updatedAt: now },
            { id: 'auth2', name: 'Stephen', surname: 'Hawking', createdAt: now, updatedAt: now },
            { id: 'auth3', name: 'Yuval Noah', surname: 'Harari', createdAt: now, updatedAt: now },
            { id: 'auth4', name: 'Robert', surname: 'Martin', createdAt: now, updatedAt: now },
            { id: 'auth5', name: 'Marcus', surname: 'Aurelius', createdAt: now, updatedAt: now }
        ];

        // Sample Books
        const books = [
            { id: 'book1', isbn: '978-0-45-152493-5', title: '1984', authorId: 'auth1', categoryId: 'cat1', availability: true, createdAt: now, updatedAt: now },
            { id: 'book2', isbn: '978-0-55-338016-8', title: 'A Brief History of Time', authorId: 'auth2', categoryId: 'cat2', availability: true, createdAt: now, updatedAt: now },
            { id: 'book3', isbn: '978-0-06-231609-7', title: 'Sapiens: A Brief History of Humankind', authorId: 'auth3', categoryId: 'cat3', availability: false, createdAt: now, updatedAt: now },
            { id: 'book4', isbn: '978-0-13-235088-4', title: 'Clean Code', authorId: 'auth4', categoryId: 'cat4', availability: true, createdAt: now, updatedAt: now },
            { id: 'book5', isbn: '978-0-14-044933-4', title: 'Meditations', authorId: 'auth5', categoryId: 'cat5', availability: true, createdAt: now, updatedAt: now },
            { id: 'book6', isbn: '978-0-45-128456-7', title: 'Animal Farm', authorId: 'auth1', categoryId: 'cat1', availability: false, createdAt: now, updatedAt: now },
            { id: 'book7', isbn: '978-0-06-231610-3', title: 'Homo Deus', authorId: 'auth3', categoryId: 'cat3', availability: true, createdAt: now, updatedAt: now },
            { id: 'book8', isbn: '978-0-13-468599-1', title: 'The Clean Coder', authorId: 'auth4', categoryId: 'cat4', availability: true, createdAt: now, updatedAt: now }
        ];

        // Sample Members
        const members = [
            { id: 'mem1', name: 'Alice Johnson', email: 'alice@example.com', status: 'active', createdAt: now, updatedAt: now },
            { id: 'mem2', name: 'Bob Smith', email: 'bob@example.com', status: 'active', createdAt: now, updatedAt: now },
            { id: 'mem3', name: 'Carol White', email: 'carol@example.com', status: 'active', createdAt: now, updatedAt: now },
            { id: 'mem4', name: 'David Brown', email: 'david@example.com', status: 'inactive', createdAt: now, updatedAt: now },
            { id: 'mem5', name: 'Eva Green', email: 'eva@example.com', status: 'suspended', createdAt: now, updatedAt: now }
        ];

        // Sample Loans (some active, some returned, some overdue)
        const today = new Date();
        const pastDate = new Date(today);
        pastDate.setDate(pastDate.getDate() - 14);
        const futureDate = new Date(today);
        futureDate.setDate(futureDate.getDate() + 14);
        const overduePastDate = new Date(today);
        overduePastDate.setDate(overduePastDate.getDate() - 7);

        const loans = [
            {
                id: 'loan1',
                bookId: 'book3',
                memberId: 'mem1',
                loanDate: pastDate.toISOString(),
                returnDate: futureDate.toISOString(),
                returned: false,
                actualReturnDate: null,
                createdAt: now,
                updatedAt: now
            },
            {
                id: 'loan2',
                bookId: 'book6',
                memberId: 'mem2',
                loanDate: pastDate.toISOString(),
                returnDate: overduePastDate.toISOString(), // Overdue!
                returned: false,
                actualReturnDate: null,
                createdAt: now,
                updatedAt: now
            },
            {
                id: 'loan3',
                bookId: 'book1',
                memberId: 'mem3',
                loanDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                returnDate: new Date(today.getTime() - 16 * 24 * 60 * 60 * 1000).toISOString(),
                returned: true,
                actualReturnDate: new Date(today.getTime() - 17 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: now,
                updatedAt: now
            }
        ];

        // Save all sample data
        this.set('library_categories', categories);
        this.set('library_authors', authors);
        this.set('library_books', books);
        this.set('library_members', members);
        this.set('library_loans', loans);

        console.log('Sample data initialized successfully!');
        return true;
    },

    /**
     * Export all data as JSON
     * @returns {Object}
     */
    exportData() {
        return {
            exportDate: new Date().toISOString(),
            version: '1.0',
            data: {
                categories: this.get('library_categories') || [],
                authors: this.get('library_authors') || [],
                books: this.get('library_books') || [],
                members: this.get('library_members') || [],
                loans: this.get('library_loans') || []
            }
        };
    },

    /**
     * Import data from JSON
     * @param {Object} exportedData 
     * @returns {boolean}
     */
    importData(exportedData) {
        try {
            if (!exportedData || !exportedData.data) {
                throw new Error('Invalid import data format');
            }

            const { categories, authors, books, members, loans } = exportedData.data;

            this.clearAll();
            this.set('library_categories', categories || []);
            this.set('library_authors', authors || []);
            this.set('library_books', books || []);
            this.set('library_members', members || []);
            this.set('library_loans', loans || []);

            console.log('Data imported successfully!');
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    },

    /**
     * Download data as JSON file
     */
    downloadBackup() {
        const data = this.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `library_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

// Initialize defaults on load
Storage.initializeDefaults();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}

