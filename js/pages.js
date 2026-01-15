const Pages = {

    authors() {
        const container = document.getElementById('mainContent');

        container.innerHTML = `
            <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Authors</h1>
                    <p class="text-gray-500">Manage book authors</p>
                </div>
                <div class="flex gap-2">
                    <button id="exportCsvBtn" class="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        Export CSV
                    </button>
                    <button id="addAuthorBtn" class="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        Add Author
                    </button>
                </div>
            </div>
            <div id="authorsTable"></div>
        `;

        const columns = [
            { key: 'name', label: 'First Name' },
            { key: 'surname', label: 'Last Name' },
            {
                key: 'bookCount',
                label: 'Books',
                render: (val, row) => {
                    const count = Books.getAll().filter(b => b.authorId === row.id).length;
                    return `<span class="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">${count}</span>`;
                }
            },
            {
                key: 'createdAt',
                label: 'Created',
                render: (val) => new Date(val).toLocaleDateString()
            }
        ];

        const table = UI.dataTable({
            container: document.getElementById('authorsTable'),
            columns,
            data: Authors.getAll(),
            onView: (id) => this.viewAuthor(id),
            onEdit: (id) => this.editAuthor(id),
            onDelete: async (id) => {
                const author = Authors.getById(id);
                const confirmed = await UI.confirm({
                    title: 'Delete Author',
                    message: `Are you sure you want to delete ${author.name} ${author.surname}?`,
                    confirmText: 'Delete',
                    type: 'danger'
                });
                if (confirmed) {
                    try {
                        Authors.delete(id);
                        UI.toast('Author deleted successfully', 'success');
                        table.setData(Authors.getAll());
                    } catch (error) {
                        UI.toast(error.message, 'error');
                    }
                }
            }
        });

        document.getElementById('addAuthorBtn').addEventListener('click', () => this.addAuthor(table));
        document.getElementById('exportCsvBtn').addEventListener('click', () => {
            UI.exportCSV(Authors.getAll(), columns, 'authors.csv');
            UI.toast('CSV exported successfully', 'success');
        });
    },

    addAuthor(table) {
        const modal = UI.modal({
            title: 'Add Author',
            size: 'md',
            content: UI.form({
                fields: [
                    { name: 'name', label: 'First Name', required: true, placeholder: 'Enter first name' },
                    { name: 'surname', label: 'Last Name', required: true, placeholder: 'Enter last name' }
                ],
                submitText: 'Add Author'
            })
        });

        modal.body.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                const data = UI.getFormData(e.target);
                Authors.create(data);
                UI.toast('Author added successfully', 'success');
                modal.close();
                table.setData(Authors.getAll());
            } catch (error) {
                UI.toast(error.message, 'error');
            }
        });

        modal.body.querySelector('#formCancel').addEventListener('click', () => modal.close());
    },

    editAuthor(id, table) {
        const author = Authors.getById(id);
        const modal = UI.modal({
            title: 'Edit Author',
            size: 'md',
            content: UI.form({
                fields: [
                    { name: 'name', label: 'First Name', required: true },
                    { name: 'surname', label: 'Last Name', required: true }
                ],
                values: author,
                submitText: 'Save Changes'
            })
        });

        modal.body.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                const data = UI.getFormData(e.target);
                Authors.update(id, data);
                UI.toast('Author updated successfully', 'success');
                modal.close();
                this.authors(); // Refresh page
            } catch (error) {
                UI.toast(error.message, 'error');
            }
        });

        modal.body.querySelector('#formCancel').addEventListener('click', () => modal.close());
    },

    viewAuthor(id) {
        const author = Authors.getById(id);
        const books = Books.getAll().filter(b => b.authorId === id);

        UI.modal({
            title: `${author.name} ${author.surname}`,
            size: 'lg',
            content: `
                <div class="space-y-6">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-500">First Name</p>
                            <p class="font-medium">${author.name}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Last Name</p>
                            <p class="font-medium">${author.surname}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Created</p>
                            <p class="font-medium">${new Date(author.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Last Updated</p>
                            <p class="font-medium">${new Date(author.updatedAt).toLocaleString()}</p>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-semibold mb-3">Books by this Author (${books.length})</h4>
                        ${books.length > 0 ? `
                            <div class="space-y-2">
                                ${books.map(book => `
                                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span>${book.title}</span>
                                        <span class="text-sm text-gray-500">${book.isbn}</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="text-gray-500">No books found</p>'}
                    </div>
                </div>
            `
        });
    },


    categories() {
        const container = document.getElementById('mainContent');

        container.innerHTML = `
            <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Categories</h1>
                    <p class="text-gray-500">Manage book categories</p>
                </div>
                <div class="flex gap-2">
                    <button id="exportCsvBtn" class="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        Export CSV
                    </button>
                    <button id="addCategoryBtn" class="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        Add Category
                    </button>
                </div>
            </div>
            <div id="categoriesTable"></div>
        `;

        const columns = [
            { key: 'name', label: 'Name' },
            { key: 'description', label: 'Description', render: (val) => val || '-' },
            {
                key: 'bookCount',
                label: 'Books',
                render: (val, row) => {
                    const count = Categories.getBookCount(row.id);
                    return `<span class="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">${count}</span>`;
                }
            }
        ];

        const table = UI.dataTable({
            container: document.getElementById('categoriesTable'),
            columns,
            data: Categories.getAll(),
            onView: (id) => this.viewCategory(id),
            onEdit: (id) => this.editCategory(id),
            onDelete: async (id) => {
                const category = Categories.getById(id);
                const confirmed = await UI.confirm({
                    title: 'Delete Category',
                    message: `Are you sure you want to delete "${category.name}"?`,
                    confirmText: 'Delete',
                    type: 'danger'
                });
                if (confirmed) {
                    try {
                        Categories.delete(id);
                        UI.toast('Category deleted successfully', 'success');
                        table.setData(Categories.getAll());
                    } catch (error) {
                        UI.toast(error.message, 'error');
                    }
                }
            }
        });

        document.getElementById('addCategoryBtn').addEventListener('click', () => this.addCategory(table));
        document.getElementById('exportCsvBtn').addEventListener('click', () => {
            UI.exportCSV(Categories.getAll(), columns, 'categories.csv');
            UI.toast('CSV exported successfully', 'success');
        });
    },

    addCategory(table) {
        const modal = UI.modal({
            title: 'Add Category',
            size: 'md',
            content: UI.form({
                fields: [
                    { name: 'name', label: 'Category Name', required: true, placeholder: 'Enter category name' },
                    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description' }
                ],
                submitText: 'Add Category'
            })
        });

        modal.body.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                const data = UI.getFormData(e.target);
                Categories.create(data);
                UI.toast('Category added successfully', 'success');
                modal.close();
                table.setData(Categories.getAll());
            } catch (error) {
                UI.toast(error.message, 'error');
            }
        });

        modal.body.querySelector('#formCancel').addEventListener('click', () => modal.close());
    },

    editCategory(id) {
        const category = Categories.getById(id);
        const modal = UI.modal({
            title: 'Edit Category',
            size: 'md',
            content: UI.form({
                fields: [
                    { name: 'name', label: 'Category Name', required: true },
                    { name: 'description', label: 'Description', type: 'textarea' }
                ],
                values: category,
                submitText: 'Save Changes'
            })
        });

        modal.body.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                const data = UI.getFormData(e.target);
                Categories.update(id, data);
                UI.toast('Category updated successfully', 'success');
                modal.close();
                this.categories();
            } catch (error) {
                UI.toast(error.message, 'error');
            }
        });

        modal.body.querySelector('#formCancel').addEventListener('click', () => modal.close());
    },

    viewCategory(id) {
        const category = Categories.getById(id);
        const books = Books.getAll().filter(b => b.categoryId === id);

        UI.modal({
            title: category.name,
            size: 'lg',
            content: `
                <div class="space-y-6">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-500">Name</p>
                            <p class="font-medium">${category.name}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Total Books</p>
                            <p class="font-medium">${books.length}</p>
                        </div>
                    </div>
                    ${category.description ? `
                        <div>
                            <p class="text-sm text-gray-500">Description</p>
                            <p>${category.description}</p>
                        </div>
                    ` : ''}
                    <div>
                        <h4 class="font-semibold mb-3">Books in this Category</h4>
                        ${books.length > 0 ? `
                            <div class="space-y-2 max-h-60 overflow-y-auto">
                                ${books.map(book => `
                                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span>${book.title}</span>
                                        <span class="px-2 py-1 ${book.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} rounded-full text-xs">${book.availability ? 'Available' : 'On Loan'}</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="text-gray-500">No books in this category</p>'}
                    </div>
                </div>
            `
        });
    },


    books() {
        const container = document.getElementById('mainContent');

        container.innerHTML = `
            <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Books</h1>
                    <p class="text-gray-500">Manage library books</p>
                </div>
                <div class="flex gap-2">
                    <button id="exportCsvBtn" class="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        Export CSV
                    </button>
                    <button id="exportPdfBtn" class="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                        </svg>
                        Export PDF
                    </button>
                    <button id="addBookBtn" class="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        Add Book
                    </button>
                </div>
            </div>
            <div id="booksTable"></div>
        `;

        const columns = [
            { key: 'isbn', label: 'ISBN' },
            { key: 'title', label: 'Title' },
            {
                key: 'authorId',
                label: 'Author',
                render: (val) => Authors.getFullName(val)
            },
            {
                key: 'categoryId',
                label: 'Category',
                render: (val) => {
                    const cat = Categories.getById(val);
                    return cat ? cat.name : '-';
                }
            },
            {
                key: 'availability',
                label: 'Status',
                render: (val) => val
                    ? '<span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Available</span>'
                    : '<span class="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">On Loan</span>'
            }
        ];

        const table = UI.dataTable({
            container: document.getElementById('booksTable'),
            columns,
            data: Books.getAll(),
            onView: (id) => this.viewBook(id),
            onEdit: (id) => this.editBook(id),
            onDelete: async (id) => {
                const book = Books.getById(id);
                const confirmed = await UI.confirm({
                    title: 'Delete Book',
                    message: `Are you sure you want to delete "${book.title}"?`,
                    confirmText: 'Delete',
                    type: 'danger'
                });
                if (confirmed) {
                    try {
                        Books.delete(id);
                        UI.toast('Book deleted successfully', 'success');
                        table.setData(Books.getAll());
                    } catch (error) {
                        UI.toast(error.message, 'error');
                    }
                }
            }
        });

        document.getElementById('addBookBtn').addEventListener('click', () => this.addBook(table));
        document.getElementById('exportCsvBtn').addEventListener('click', () => {
            const exportData = Books.getAll().map(b => ({
                ...b,
                author: Authors.getFullName(b.authorId),
                category: Categories.getById(b.categoryId)?.name || '-'
            }));
            UI.exportCSV(exportData, [
                { key: 'isbn', label: 'ISBN' },
                { key: 'title', label: 'Title' },
                { key: 'author', label: 'Author' },
                { key: 'category', label: 'Category' },
                { key: 'availability', label: 'Available' }
            ], 'books.csv');
            UI.toast('CSV exported successfully', 'success');
        });
        document.getElementById('exportPdfBtn').addEventListener('click', () => {
            const exportData = Books.getAll().map(b => ({
                isbn: b.isbn,
                title: b.title,
                author: Authors.getFullName(b.authorId),
                category: Categories.getById(b.categoryId)?.name || '-',
                status: b.availability ? 'Available' : 'On Loan'
            }));
            UI.exportPDF(exportData, [
                { key: 'isbn', label: 'ISBN' },
                { key: 'title', label: 'Title' },
                { key: 'author', label: 'Author' },
                { key: 'category', label: 'Category' },
                { key: 'status', label: 'Status' }
            ], 'Books List');
        });
    },

    addBook(table) {
        const authorOptions = Authors.getAll().map(a => ({ value: a.id, label: `${a.name} ${a.surname}` }));
        const categoryOptions = Categories.getAll().map(c => ({ value: c.id, label: c.name }));

        const modal = UI.modal({
            title: 'Add Book',
            size: 'md',
            content: UI.form({
                fields: [
                    { name: 'isbn', label: 'ISBN', required: true, placeholder: '978-X-XX-XXXXXX-X' },
                    { name: 'title', label: 'Title', required: true, placeholder: 'Enter book title' },
                    { name: 'authorId', label: 'Author', type: 'select', required: true, options: authorOptions },
                    { name: 'categoryId', label: 'Category', type: 'select', required: true, options: categoryOptions },
                    { name: 'availability', label: 'Available for loan', type: 'checkbox', default: true }
                ],
                submitText: 'Add Book'
            })
        });

        modal.body.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                const data = UI.getFormData(e.target);
                Books.create(data);
                UI.toast('Book added successfully', 'success');
                modal.close();
                table.setData(Books.getAll());
            } catch (error) {
                UI.toast(error.message, 'error');
            }
        });

        modal.body.querySelector('#formCancel').addEventListener('click', () => modal.close());
    },

    editBook(id) {
        const book = Books.getById(id);
        const authorOptions = Authors.getAll().map(a => ({ value: a.id, label: `${a.name} ${a.surname}` }));
        const categoryOptions = Categories.getAll().map(c => ({ value: c.id, label: c.name }));

        const modal = UI.modal({
            title: 'Edit Book',
            size: 'md',
            content: UI.form({
                fields: [
                    { name: 'isbn', label: 'ISBN', required: true },
                    { name: 'title', label: 'Title', required: true },
                    { name: 'authorId', label: 'Author', type: 'select', required: true, options: authorOptions },
                    { name: 'categoryId', label: 'Category', type: 'select', required: true, options: categoryOptions },
                    { name: 'availability', label: 'Available for loan', type: 'checkbox' }
                ],
                values: book,
                submitText: 'Save Changes'
            })
        });

        modal.body.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                const data = UI.getFormData(e.target);
                Books.update(id, data);
                UI.toast('Book updated successfully', 'success');
                modal.close();
                this.books();
            } catch (error) {
                UI.toast(error.message, 'error');
            }
        });

        modal.body.querySelector('#formCancel').addEventListener('click', () => modal.close());
    },

    viewBook(id) {
        const book = Books.getById(id);
        const author = Authors.getById(book.authorId);
        const category = Categories.getById(book.categoryId);
        const loans = Loans.getByBook(id);

        UI.modal({
            title: book.title,
            size: 'lg',
            content: `
                <div class="space-y-6">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-500">ISBN</p>
                            <p class="font-medium font-mono">${book.isbn}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Status</p>
                            <p>${book.availability
                    ? '<span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Available</span>'
                    : '<span class="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">On Loan</span>'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Author</p>
                            <p class="font-medium">${author ? `${author.name} ${author.surname}` : '-'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Category</p>
                            <p class="font-medium">${category ? category.name : '-'}</p>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-semibold mb-3">Loan History (${loans.length})</h4>
                        ${loans.length > 0 ? `
                            <div class="space-y-2 max-h-40 overflow-y-auto">
                                ${loans.map(loan => {
                        const member = Members.getById(loan.memberId);
                        return `
                                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span>${member ? member.name : 'Unknown'}</span>
                                            <span class="text-sm ${loan.returned ? 'text-green-600' : 'text-yellow-600'}">${loan.returned ? 'Returned' : 'Active'}</span>
                                        </div>
                                    `;
                    }).join('')}
                            </div>
                        ` : '<p class="text-gray-500">No loan history</p>'}
                    </div>
                </div>
            `
        });
    },


    members() {
        const container = document.getElementById('mainContent');

        container.innerHTML = `
            <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Members</h1>
                    <p class="text-gray-500">Manage library members</p>
                </div>
                <div class="flex gap-2">
                    <button id="exportCsvBtn" class="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        Export CSV
                    </button>
                    <button id="addMemberBtn" class="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        Add Member
                    </button>
                </div>
            </div>
            <div id="membersTable"></div>
        `;

        const statusColors = {
            active: 'bg-green-100 text-green-700',
            inactive: 'bg-gray-100 text-gray-700',
            suspended: 'bg-red-100 text-red-700'
        };

        const columns = [
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            {
                key: 'status',
                label: 'Status',
                render: (val) => `<span class="px-2 py-1 ${statusColors[val]} rounded-full text-xs font-medium capitalize">${val}</span>`
            },
            {
                key: 'activeLoans',
                label: 'Active Loans',
                render: (val, row) => {
                    const count = Loans.getByMember(row.id).filter(l => !l.returned).length;
                    return count > 0 ? `<span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">${count}</span>` : '0';
                }
            }
        ];

        const table = UI.dataTable({
            container: document.getElementById('membersTable'),
            columns,
            data: Members.getAll(),
            onView: (id) => this.viewMember(id),
            onEdit: (id) => this.editMember(id),
            onDelete: async (id) => {
                const member = Members.getById(id);
                const confirmed = await UI.confirm({
                    title: 'Delete Member',
                    message: `Are you sure you want to delete ${member.name}?`,
                    confirmText: 'Delete',
                    type: 'danger'
                });
                if (confirmed) {
                    try {
                        Members.delete(id);
                        UI.toast('Member deleted successfully', 'success');
                        table.setData(Members.getAll());
                    } catch (error) {
                        UI.toast(error.message, 'error');
                    }
                }
            }
        });

        document.getElementById('addMemberBtn').addEventListener('click', () => this.addMember(table));
        document.getElementById('exportCsvBtn').addEventListener('click', () => {
            UI.exportCSV(Members.getAll(), columns, 'members.csv');
            UI.toast('CSV exported successfully', 'success');
        });
    },

    addMember(table) {
        const modal = UI.modal({
            title: 'Add Member',
            size: 'md',
            content: UI.form({
                fields: [
                    { name: 'name', label: 'Full Name', required: true, placeholder: 'Enter full name' },
                    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'email@example.com' },
                    {
                        name: 'status',
                        label: 'Status',
                        type: 'select',
                        required: true,
                        options: [
                            { value: 'active', label: 'Active' },
                            { value: 'inactive', label: 'Inactive' },
                            { value: 'suspended', label: 'Suspended' }
                        ]
                    }
                ],
                submitText: 'Add Member'
            })
        });

        modal.body.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                const data = UI.getFormData(e.target);
                Members.create(data);
                UI.toast('Member added successfully', 'success');
                modal.close();
                table.setData(Members.getAll());
            } catch (error) {
                UI.toast(error.message, 'error');
            }
        });

        modal.body.querySelector('#formCancel').addEventListener('click', () => modal.close());
    },

    editMember(id) {
        const member = Members.getById(id);
        const modal = UI.modal({
            title: 'Edit Member',
            size: 'md',
            content: UI.form({
                fields: [
                    { name: 'name', label: 'Full Name', required: true },
                    { name: 'email', label: 'Email', type: 'email', required: true },
                    {
                        name: 'status',
                        label: 'Status',
                        type: 'select',
                        required: true,
                        options: [
                            { value: 'active', label: 'Active' },
                            { value: 'inactive', label: 'Inactive' },
                            { value: 'suspended', label: 'Suspended' }
                        ]
                    }
                ],
                values: member,
                submitText: 'Save Changes'
            })
        });

        modal.body.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                const data = UI.getFormData(e.target);
                Members.update(id, data);
                UI.toast('Member updated successfully', 'success');
                modal.close();
                this.members();
            } catch (error) {
                UI.toast(error.message, 'error');
            }
        });

        modal.body.querySelector('#formCancel').addEventListener('click', () => modal.close());
    },

    viewMember(id) {
        const member = Members.getById(id);
        const loans = Loans.getByMember(id);
        const activeLoans = loans.filter(l => !l.returned);

        UI.modal({
            title: member.name,
            size: 'lg',
            content: `
                <div class="space-y-6">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-500">Email</p>
                            <p class="font-medium">${member.email}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Status</p>
                            <p><span class="px-2 py-1 ${member.status === 'active' ? 'bg-green-100 text-green-700' : member.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'} rounded-full text-xs font-medium capitalize">${member.status}</span></p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Member Since</p>
                            <p class="font-medium">${new Date(member.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Total Loans</p>
                            <p class="font-medium">${loans.length}</p>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-semibold mb-3">Active Loans (${activeLoans.length})</h4>
                        ${activeLoans.length > 0 ? `
                            <div class="space-y-2">
                                ${activeLoans.map(loan => {
                const book = Books.getById(loan.bookId);
                const isOverdue = new Date(loan.returnDate) < new Date();
                return `
                                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span>${book ? book.title : 'Unknown'}</span>
                                            <span class="text-sm ${isOverdue ? 'text-red-600' : 'text-gray-500'}">Due: ${new Date(loan.returnDate).toLocaleDateString()}</span>
                                        </div>
                                    `;
            }).join('')}
                            </div>
                        ` : '<p class="text-gray-500">No active loans</p>'}
                    </div>
                </div>
            `
        });
    },


    loans() {
        const container = document.getElementById('mainContent');

        container.innerHTML = `
            <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Loans</h1>
                    <p class="text-gray-500">Manage book loans</p>
                </div>
                <div class="flex gap-2">
                    <button id="exportCsvBtn" class="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        Export CSV
                    </button>
                    <button id="addLoanBtn" class="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        New Loan
                    </button>
                </div>
            </div>
            <div id="loansTable"></div>
        `;

        const columns = [
            {
                key: 'bookId',
                label: 'Book',
                render: (val) => {
                    const book = Books.getById(val);
                    return book ? book.title : '-';
                }
            },
            {
                key: 'memberId',
                label: 'Member',
                render: (val) => {
                    const member = Members.getById(val);
                    return member ? member.name : '-';
                }
            },
            {
                key: 'loanDate',
                label: 'Loan Date',
                render: (val) => new Date(val).toLocaleDateString()
            },
            {
                key: 'returnDate',
                label: 'Due Date',
                render: (val, row) => {
                    const date = new Date(val);
                    const isOverdue = !row.returned && date < new Date();
                    return `<span class="${isOverdue ? 'text-red-600 font-medium' : ''}">${date.toLocaleDateString()}</span>`;
                }
            },
            {
                key: 'returned',
                label: 'Status',
                render: (val, row) => {
                    if (val) {
                        return '<span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Returned</span>';
                    }
                    const isOverdue = new Date(row.returnDate) < new Date();
                    return isOverdue
                        ? '<span class="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Overdue</span>'
                        : '<span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Active</span>';
                }
            }
        ];

        const table = UI.dataTable({
            container: document.getElementById('loansTable'),
            columns,
            data: Loans.getAll(),
            actions: ['view', 'delete'],
            onView: (id) => this.viewLoan(id),
            onDelete: async (id) => {
                const confirmed = await UI.confirm({
                    title: 'Delete Loan Record',
                    message: 'Are you sure you want to delete this loan record?',
                    confirmText: 'Delete',
                    type: 'danger'
                });
                if (confirmed) {
                    try {
                        const loan = Loans.getById(id);
                        if (!loan.returned) {
                            Books.setAvailability(loan.bookId, true);
                        }
                        Loans.delete(id);
                        UI.toast('Loan record deleted', 'success');
                        table.setData(Loans.getAll());
                    } catch (error) {
                        UI.toast(error.message, 'error');
                    }
                }
            }
        });

        document.getElementById('addLoanBtn').addEventListener('click', () => this.addLoan(table));
        document.getElementById('exportCsvBtn').addEventListener('click', () => {
            const exportData = Loans.getAll().map(l => ({
                book: Books.getById(l.bookId)?.title || '-',
                member: Members.getById(l.memberId)?.name || '-',
                loanDate: new Date(l.loanDate).toLocaleDateString(),
                returnDate: new Date(l.returnDate).toLocaleDateString(),
                status: l.returned ? 'Returned' : (new Date(l.returnDate) < new Date() ? 'Overdue' : 'Active')
            }));
            UI.exportCSV(exportData, [
                { key: 'book', label: 'Book' },
                { key: 'member', label: 'Member' },
                { key: 'loanDate', label: 'Loan Date' },
                { key: 'returnDate', label: 'Due Date' },
                { key: 'status', label: 'Status' }
            ], 'loans.csv');
            UI.toast('CSV exported successfully', 'success');
        });
    },

    addLoan(table) {
        const availableBooks = Books.getAvailable().map(b => ({ value: b.id, label: `${b.title} (${b.isbn})` }));
        const activeMembers = Members.getActive().map(m => ({ value: m.id, label: `${m.name} (${m.email})` }));

        // Default return date: 14 days from now
        const defaultReturnDate = new Date();
        defaultReturnDate.setDate(defaultReturnDate.getDate() + 14);

        const modal = UI.modal({
            title: 'New Loan',
            size: 'md',
            content: UI.form({
                fields: [
                    { name: 'bookId', label: 'Book', type: 'select', required: true, options: availableBooks },
                    { name: 'memberId', label: 'Member', type: 'select', required: true, options: activeMembers },
                    { name: 'returnDate', label: 'Return Date', type: 'date', required: true, default: defaultReturnDate.toISOString().split('T')[0] }
                ],
                submitText: 'Create Loan'
            })
        });

        if (availableBooks.length === 0) {
            modal.body.innerHTML = `
                <div class="text-center py-8">
                    <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    <p class="text-gray-600 mb-4">No books available for loan</p>
                    <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200" onclick="this.closest('.fixed').querySelector('#modalClose').click()">Close</button>
                </div>
            `;
            return;
        }

        modal.body.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                const data = UI.getFormData(e.target);
                Loans.create(data);
                UI.toast('Loan created successfully', 'success');
                modal.close();
                table.setData(Loans.getAll());
            } catch (error) {
                UI.toast(error.message, 'error');
            }
        });

        modal.body.querySelector('#formCancel').addEventListener('click', () => modal.close());
    },

    viewLoan(id) {
        const loan = Loans.getById(id);
        const book = Books.getById(loan.bookId);
        const member = Members.getById(loan.memberId);
        const isOverdue = !loan.returned && new Date(loan.returnDate) < new Date();

        const modal = UI.modal({
            title: 'Loan Details',
            size: 'md',
            content: `
                <div class="space-y-6">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-500">Book</p>
                            <p class="font-medium">${book ? book.title : '-'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Member</p>
                            <p class="font-medium">${member ? member.name : '-'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Loan Date</p>
                            <p class="font-medium">${new Date(loan.loanDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Due Date</p>
                            <p class="font-medium ${isOverdue ? 'text-red-600' : ''}">${new Date(loan.returnDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Status</p>
                            <p>${loan.returned
                    ? '<span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Returned</span>'
                    : isOverdue
                        ? '<span class="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Overdue</span>'
                        : '<span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Active</span>'
                }</p>
                        </div>
                        ${loan.returned ? `
                        <div>
                            <p class="text-sm text-gray-500">Returned On</p>
                            <p class="font-medium">${new Date(loan.actualReturnDate).toLocaleDateString()}</p>
                        </div>
                        ` : ''}
                    </div>
                    ${!loan.returned ? `
                    <div class="pt-4 border-t">
                        <button id="returnBookBtn" class="w-full px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            Mark as Returned
                        </button>
                    </div>
                    ` : ''}
                </div>
            `
        });

        if (!loan.returned) {
            modal.body.querySelector('#returnBookBtn').addEventListener('click', async () => {
                try {
                    Loans.returnBook(id);
                    UI.toast('Book returned successfully', 'success');
                    modal.close();
                    this.loans(); // Refresh the page
                } catch (error) {
                    UI.toast(error.message, 'error');
                }
            });
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Pages;
}
