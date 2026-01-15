const Validators = {
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    isbnRegex: /^(?:\d{3}-\d-\d{2}-\d{6}-\d|\d{13})$/,

    isValidEmail(email) {
        return this.emailRegex.test(email);
    },

    isValidISBN(isbn) {
        return this.isbnRegex.test(isbn);
    },

    isNotEmpty(str, minLength = 1) {
        return typeof str === 'string' && str.trim().length >= minLength;
    },

    isInList(value, allowed) {
        return allowed.includes(value);
    }
};

class BaseModel {
    constructor(storageKey) {
        this.storageKey = storageKey;
    }

    getAll() {
        return Storage.get(this.storageKey) || [];
    }

    getById(id) {
        const items = this.getAll();
        return items.find(item => item.id === id) || null;
    }

    saveAll(items) {
        Storage.set(this.storageKey, items);
    }

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
            id: id,
            createdAt: items[index].createdAt,
            updatedAt: new Date().toISOString()
        };

        items[index] = updatedItem;
        this.saveAll(items);

        return updatedItem;
    }

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

    search(query) {
        const items = this.getAll();
        const lowerQuery = query.toLowerCase();
        return items.filter(item => this.matchesSearch(item, lowerQuery));
    }

    count() {
        return this.getAll().length;
    }

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

    getFullName(id) {
        const author = this.getById(id);
        return author ? `${author.name} ${author.surname}` : 'Unknown Author';
    }
}

class CategoryModel extends BaseModel {
    constructor() {
        super('library_categories');
    }

    validate(data, excludeId = null) {
        const errors = [];

        if (!Validators.isNotEmpty(data.name, 1)) {
            errors.push('Category name is required');
        }

        const existing = this.getAll().find(
            cat => cat.name.toLowerCase() === data.name.toLowerCase() && cat.id !== excludeId
        );
        if (existing) {
            errors.push('A category with this name already exists');
        }

        return { valid: errors.length === 0, errors };
    }

    canDelete(id) {
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

    getBookCount(id) {
        const books = new BookModel().getAll();
        return books.filter(book => book.categoryId === id).length;
    }
}

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

    getAvailable() {
        return this.getAll().filter(book => book.availability);
    }

    setAvailability(id, available) {
        const book = this.getById(id);
        if (book) {
            this.update(id, { ...book, availability: available });
        }
    }
}

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

    getActive() {
        return this.getAll().filter(member => member.status === 'active');
    }
}

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

    create(data) {
        const loan = super.create({
            ...data,
            loanDate: new Date().toISOString(),
            returned: false,
            actualReturnDate: null
        });

        new BookModel().setAvailability(data.bookId, false);

        return loan;
    }

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

        new BookModel().setAvailability(loan.bookId, true);

        return updated;
    }

    canDelete(id) {
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

    getActive() {
        return this.getAll().filter(loan => !loan.returned);
    }

    getOverdue() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.getAll().filter(loan => {
            if (loan.returned) return false;
            const returnDate = new Date(loan.returnDate);
            return returnDate < today;
        });
    }

    getByMember(memberId) {
        return this.getAll().filter(loan => loan.memberId === memberId);
    }

    getByBook(bookId) {
        return this.getAll().filter(loan => loan.bookId === bookId);
    }
}

const Authors = new AuthorModel();
const Categories = new CategoryModel();
const Books = new BookModel();
const Members = new MemberModel();
const Loans = new LoanModel();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Authors, Categories, Books, Members, Loans, Validators };
}
