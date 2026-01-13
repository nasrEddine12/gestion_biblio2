/**
 * Data Models Module
 * Entity classes with CRUD operations and validation
 */

/**
 * Validation utilities
 */
const Validators = {
    // Email validation regex
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    // ISBN-13 format (simplified: accepts XXX-X-XX-XXXXXX-X or 13 digits)
    isbnRegex: /^(?:\d{3}-\d-\d{2}-\d{6}-\d|\d{13})$/,

    /**
     * Validate email format
     * @param {string} email 
     * @returns {boolean}
     */
    isValidEmail(email) {
        return this.emailRegex.test(email);
    },

    /**
     * Validate ISBN format
     * @param {string} isbn 
     * @returns {boolean}
     */
    isValidISBN(isbn) {
        return this.isbnRegex.test(isbn);
    },

    /**
     * Check if string is not empty
     * @param {string} str 
     * @param {number} minLength 
     * @returns {boolean}
     */
    isNotEmpty(str, minLength = 1) {
        return typeof str === 'string' && str.trim().length >= minLength;
    },

    /**
     * Check if value is in allowed values
     * @param {string} value 
     * @param {Array} allowed 
     * @returns {boolean}
     */
    isInList(value, allowed) {
        return allowed.includes(value);
    }
};

/**
 * Base Entity Model
 * Provides common CRUD operations
 */
class BaseModel {
    constructor(storageKey) {
        this.storageKey = storageKey;
    }

    /**
     * Get all records
     * @returns {Array}
     */
    getAll() {
        return Storage.get(this.storageKey) || [];
    }

    /**
     * Get record by ID
     * @param {string} id 
     * @returns {Object|null}
     */
    getById(id) {
        const items = this.getAll();
        return items.find(item => item.id === id) || null;
    }

    /**
     * Save all records
     * @param {Array} items 
     */
    saveAll(items) {
        Storage.set(this.storageKey, items);
    }

    /**
     * Create a new record
     * @param {Object} data 
     * @returns {Object} Created record with ID
     */
    create(data) {
        const validation = this.validate(data);
        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }

        const items = this.getAll();
        const now = new Date().toISOString();

        const newItem = {
            id: Storage.generateId(),
            ...data,
            createdAt: now,
            updatedAt: now
        };

        items.push(newItem);
        this.saveAll(items);

        return newItem;
    }

    /**
     * Update an existing record
     * @param {string} id 
     * @param {Object} data 
     * @returns {Object} Updated record
     */
    update(id, data) {
        const items = this.getAll();
        const index = items.findIndex(item => item.id === id);

        if (index === -1) {
            throw new Error(`Record with ID ${id} not found`);
        }

        const validation = this.validate(data, id);
        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }

        const updatedItem = {
            ...items[index],
            ...data,
            id: id, // Preserve original ID
            createdAt: items[index].createdAt, // Preserve creation date
            updatedAt: new Date().toISOString()
        };

        items[index] = updatedItem;
        this.saveAll(items);

        return updatedItem;
    }

    /**
     * Delete a record
     * @param {string} id 
     * @returns {boolean}
     */
    delete(id) {
        const canDelete = this.canDelete(id);
        if (!canDelete.allowed) {
            throw new Error(canDelete.reason);
        }

        const items = this.getAll();
        const filteredItems = items.filter(item => item.id !== id);

        if (filteredItems.length === items.length) {
            throw new Error(`Record with ID ${id} not found`);
        }

        this.saveAll(filteredItems);
        return true;
    }

    /**
     * Search records
     * @param {string} query 
     * @returns {Array}
     */
    search(query) {
        const items = this.getAll();
        const lowerQuery = query.toLowerCase();
        return items.filter(item => this.matchesSearch(item, lowerQuery));
    }

    /**
     * Get record count
     * @returns {number}
     */
    count() {
        return this.getAll().length;
    }

    // Override these in subclasses
    validate(data, excludeId = null) {
        return { valid: true, errors: [] };
    }

    canDelete(id) {
        return { allowed: true };
    }

    matchesSearch(item, query) {
        return false;
    }
}

/**
 * Authors Model
 */
class AuthorModel extends BaseModel {
    constructor() {
        super('library_authors');
    }

    validate(data, excludeId = null) {
        const errors = [];

        if (!Validators.isNotEmpty(data.name, 2)) {
            errors.push('Name is required (minimum 2 characters)');
        }

        if (!Validators.isNotEmpty(data.surname, 2)) {
            errors.push('Surname is required (minimum 2 characters)');
        }

        return { valid: errors.length === 0, errors };
    }

    canDelete(id) {
        // Check if any books reference this author
        const books = new BookModel().getAll();
        const hasBooks = books.some(book => book.authorId === id);

        if (hasBooks) {
            return {
                allowed: false,
                reason: 'Cannot delete author with existing books. Delete the books first.'
            };
        }

        return { allowed: true };
    }

    matchesSearch(item, query) {
        return item.name.toLowerCase().includes(query) ||
            item.surname.toLowerCase().includes(query);
    }

    /**
     * Get full name
     * @param {string} id 
     * @returns {string}
     */
    getFullName(id) {
        const author = this.getById(id);
        return author ? `${author.name} ${author.surname}` : 'Unknown Author';
    }
}

/**
 * Categories Model
 */
class CategoryModel extends BaseModel {
    constructor() {
        super('library_categories');
    }

    validate(data, excludeId = null) {
        const errors = [];

        if (!Validators.isNotEmpty(data.name, 1)) {
            errors.push('Category name is required');
        }

        // Check uniqueness
        const existing = this.getAll().find(
            cat => cat.name.toLowerCase() === data.name.toLowerCase() && cat.id !== excludeId
        );
        if (existing) {
            errors.push('A category with this name already exists');
        }

        return { valid: errors.length === 0, errors };
    }

    canDelete(id) {
        // Check if any books reference this category
        const books = new BookModel().getAll();
        const hasBooks = books.some(book => book.categoryId === id);

        if (hasBooks) {
            return {
                allowed: false,
                reason: 'Cannot delete category with existing books. Reassign the books first.'
            };
        }

        return { allowed: true };
    }

    matchesSearch(item, query) {
        return item.name.toLowerCase().includes(query) ||
            (item.description && item.description.toLowerCase().includes(query));
    }

    /**
     * Get book count for a category
     * @param {string} id 
     * @returns {number}
     */
    getBookCount(id) {
        const books = new BookModel().getAll();
        return books.filter(book => book.categoryId === id).length;
    }
}

/**
 * Books Model
 */
class BookModel extends BaseModel {
    constructor() {
        super('library_books');
    }

    validate(data, excludeId = null) {
        const errors = [];

        if (!Validators.isNotEmpty(data.isbn)) {
            errors.push('ISBN is required');
        } else if (!Validators.isValidISBN(data.isbn)) {
            errors.push('Invalid ISBN format (use XXX-X-XX-XXXXXX-X or 13 digits)');
        } else {
            // Check uniqueness
            const existing = this.getAll().find(
                book => book.isbn === data.isbn && book.id !== excludeId
            );
            if (existing) {
                errors.push('A book with this ISBN already exists');
            }
        }

        if (!Validators.isNotEmpty(data.title)) {
            errors.push('Title is required');
        }

        if (!data.authorId) {
            errors.push('Author is required');
        } else {
            const author = new AuthorModel().getById(data.authorId);
            if (!author) {
                errors.push('Selected author does not exist');
            }
        }

        if (!data.categoryId) {
            errors.push('Category is required');
        } else {
            const category = new CategoryModel().getById(data.categoryId);
            if (!category) {
                errors.push('Selected category does not exist');
            }
        }

        return { valid: errors.length === 0, errors };
    }

    canDelete(id) {
        // Check if any active loans reference this book
        const loans = new LoanModel().getAll();
        const hasActiveLoans = loans.some(loan => loan.bookId === id && !loan.returned);

        if (hasActiveLoans) {
            return {
                allowed: false,
                reason: 'Cannot delete book with active loans. Return the book first.'
            };
        }

        return { allowed: true };
    }

    matchesSearch(item, query) {
        const authorModel = new AuthorModel();
        const authorName = authorModel.getFullName(item.authorId).toLowerCase();

        return item.title.toLowerCase().includes(query) ||
            item.isbn.toLowerCase().includes(query) ||
            authorName.includes(query);
    }

    /**
     * Get available books
     * @returns {Array}
     */
    getAvailable() {
        return this.getAll().filter(book => book.availability);
    }

    /**
     * Set book availability
     * @param {string} id 
     * @param {boolean} available 
     */
    setAvailability(id, available) {
        const book = this.getById(id);
        if (book) {
            this.update(id, { ...book, availability: available });
        }
    }
}

/**
 * Members Model
 */
class MemberModel extends BaseModel {
    constructor() {
        super('library_members');
    }

    validate(data, excludeId = null) {
        const errors = [];

        if (!Validators.isNotEmpty(data.name, 2)) {
            errors.push('Name is required (minimum 2 characters)');
        }

        if (!Validators.isNotEmpty(data.email)) {
            errors.push('Email is required');
        } else if (!Validators.isValidEmail(data.email)) {
            errors.push('Invalid email format');
        } else {
            // Check uniqueness
            const existing = this.getAll().find(
                member => member.email.toLowerCase() === data.email.toLowerCase() && member.id !== excludeId
            );
            if (existing) {
                errors.push('A member with this email already exists');
            }
        }

        if (!Validators.isInList(data.status, ['active', 'inactive', 'suspended'])) {
            errors.push('Status must be: active, inactive, or suspended');
        }

        return { valid: errors.length === 0, errors };
    }

    canDelete(id) {
        // Check if any active loans reference this member
        const loans = new LoanModel().getAll();
        const hasActiveLoans = loans.some(loan => loan.memberId === id && !loan.returned);

        if (hasActiveLoans) {
            return {
                allowed: false,
                reason: 'Cannot delete member with active loans. Return the books first.'
            };
        }

        return { allowed: true };
    }

    matchesSearch(item, query) {
        return item.name.toLowerCase().includes(query) ||
            item.email.toLowerCase().includes(query);
    }

    /**
     * Get active members
     * @returns {Array}
     */
    getActive() {
        return this.getAll().filter(member => member.status === 'active');
    }
}

/**
 * Loans Model
 */
class LoanModel extends BaseModel {
    constructor() {
        super('library_loans');
    }

    validate(data, excludeId = null) {
        const errors = [];

        if (!data.bookId) {
            errors.push('Book is required');
        } else {
            const book = new BookModel().getById(data.bookId);
            if (!book) {
                errors.push('Selected book does not exist');
            } else if (!excludeId && !book.availability) {
                // Only check availability for new loans
                errors.push('Selected book is not available for loan');
            }
        }

        if (!data.memberId) {
            errors.push('Member is required');
        } else {
            const member = new MemberModel().getById(data.memberId);
            if (!member) {
                errors.push('Selected member does not exist');
            } else if (member.status !== 'active') {
                errors.push('Selected member is not active');
            }
        }

        if (!data.returnDate) {
            errors.push('Return date is required');
        } else {
            const returnDate = new Date(data.returnDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (returnDate < today) {
                errors.push('Return date cannot be in the past');
            }
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Create a loan and update book availability
     * @param {Object} data 
     * @returns {Object}
     */
    create(data) {
        const loan = super.create({
            ...data,
            loanDate: new Date().toISOString(),
            returned: false,
            actualReturnDate: null
        });

        // Mark book as unavailable
        new BookModel().setAvailability(data.bookId, false);

        return loan;
    }

    /**
     * Return a book
     * @param {string} id 
     * @returns {Object}
     */
    returnBook(id) {
        const loan = this.getById(id);
        if (!loan) {
            throw new Error('Loan not found');
        }

        if (loan.returned) {
            throw new Error('This loan has already been returned');
        }

        const updated = this.update(id, {
            ...loan,
            returned: true,
            actualReturnDate: new Date().toISOString()
        });

        // Mark book as available
        new BookModel().setAvailability(loan.bookId, true);

        return updated;
    }

    canDelete(id) {
        // Can always delete loans (history cleanup)
        return { allowed: true };
    }

    matchesSearch(item, query) {
        const bookModel = new BookModel();
        const memberModel = new MemberModel();

        const book = bookModel.getById(item.bookId);
        const member = memberModel.getById(item.memberId);

        const bookTitle = book ? book.title.toLowerCase() : '';
        const memberName = member ? member.name.toLowerCase() : '';

        return bookTitle.includes(query) || memberName.includes(query);
    }

    /**
     * Get active (not returned) loans
     * @returns {Array}
     */
    getActive() {
        return this.getAll().filter(loan => !loan.returned);
    }

    /**
     * Get overdue loans
     * @returns {Array}
     */
    getOverdue() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.getAll().filter(loan => {
            if (loan.returned) return false;
            const returnDate = new Date(loan.returnDate);
            return returnDate < today;
        });
    }

    /**
     * Get loans by member
     * @param {string} memberId 
     * @returns {Array}
     */
    getByMember(memberId) {
        return this.getAll().filter(loan => loan.memberId === memberId);
    }

    /**
     * Get loans by book
     * @param {string} bookId 
     * @returns {Array}
     */
    getByBook(bookId) {
        return this.getAll().filter(loan => loan.bookId === bookId);
    }
}

// Create singleton instances
const Authors = new AuthorModel();
const Categories = new CategoryModel();
const Books = new BookModel();
const Members = new MemberModel();
const Loans = new LoanModel();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Authors, Categories, Books, Members, Loans, Validators };
}
