const Dashboard = {
    charts: {},

    render() {
        const container = document.getElementById('mainContent');
        if (!container) return;

        const stats = this.getStats();

        container.innerHTML = `
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                ${this.renderStatCard('Total Books', stats.totalBooks, 'indigo', this.icons.book)}
                ${this.renderStatCard('Total Members', stats.totalMembers, 'green', this.icons.members)}
                ${this.renderStatCard('Active Loans', stats.activeLoans, 'yellow', this.icons.loan)}
                ${this.renderStatCard('Overdue', stats.overdueLoans, 'red', this.icons.overdue)}
                ${this.renderStatCard('Categories', stats.totalCategories, 'purple', this.icons.category)}
            </div>

            
            <div class="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
                <div class="flex flex-wrap items-center gap-4">
                    <div class="flex items-center gap-2">
                        <label class="text-sm text-gray-600">Date Range:</label>
                        <select id="dateRangeFilter" class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
                            <option value="7">Last 7 days</option>
                            <option value="30" selected>Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last year</option>
                        </select>
                    </div>
                    <div class="flex items-center gap-2">
                        <label class="text-sm text-gray-600">Category:</label>
                        <select id="categoryFilter" class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
                            <option value="">All Categories</option>
                            ${Categories.getAll().map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                    </div>
                    <button id="refreshDashboard" class="ml-auto px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>

            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                
                <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Books by Category</h3>
                    <div class="h-64">
                        <canvas id="booksByCategoryChart"></canvas>
                    </div>
                </div>

                
                <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Book Availability</h3>
                    <div class="h-64">
                        <canvas id="availabilityChart"></canvas>
                    </div>
                </div>
            </div>

            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                
                <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Loan Trends</h3>
                    <div class="h-64">
                        <canvas id="loanTrendsChart"></canvas>
                    </div>
                </div>

                
                <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Member Status Distribution</h3>
                    <div class="h-64">
                        <canvas id="memberDistributionChart"></canvas>
                    </div>
                </div>
            </div>

            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                
                <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Overdue Loans by Member</h3>
                    <div class="h-64">
                        <canvas id="overdueLoansChart"></canvas>
                    </div>
                </div>

                
                <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                    <div class="space-y-3 max-h-64 overflow-y-auto" id="recentActivity">
                        ${this.renderRecentActivity()}
                    </div>
                </div>
            </div>

            
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Category Statistics</h3>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Total Books</th>
                                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Available</th>
                                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">On Loan</th>
                                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Availability %</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            ${this.renderCategoryStats()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.initCharts();

        this.setupFilters();
    },

    getStats() {
        const books = Books.getAll();
        const members = Members.getAll();
        const loans = Loans.getAll();
        const categories = Categories.getAll();
        const activeLoans = loans.filter(l => !l.returned);
        const overdueLoans = Loans.getOverdue();

        return {
            totalBooks: books.length,
            totalMembers: members.length,
            totalCategories: categories.length,
            activeLoans: activeLoans.length,
            overdueLoans: overdueLoans.length,
            availableBooks: books.filter(b => b.availability).length,
            onLoanBooks: books.filter(b => !b.availability).length
        };
    },

    renderStatCard(title, value, color, icon) {
        const colors = {
            indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
            green: { bg: 'bg-green-100', text: 'text-green-600' },
            yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
            red: { bg: 'bg-red-100', text: 'text-red-600' },
            purple: { bg: 'bg-purple-100', text: 'text-purple-600' }
        };

        return `
            <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 card-hover">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500 font-medium">${title}</p>
                        <p class="text-2xl font-bold text-gray-800">${value}</p>
                    </div>
                    <div class="w-10 h-10 ${colors[color].bg} rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 ${colors[color].text}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            ${icon}
                        </svg>
                    </div>
                </div>
            </div>
        `;
    },

    icons: {
        book: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>',
        members: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>',
        loan: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>',
        overdue: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>',
        category: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>'
    },

    initCharts() {
        this.createBooksByCategoryChart();
        this.createAvailabilityChart();
        this.createLoanTrendsChart();
        this.createMemberDistributionChart();
        this.createOverdueLoansChart();
    },

    createBooksByCategoryChart() {
        const ctx = document.getElementById('booksByCategoryChart');
        if (!ctx) return;

        const categories = Categories.getAll();
        const books = Books.getAll();

        const data = categories.map(cat => ({
            name: cat.name,
            count: books.filter(b => b.categoryId === cat.id).length
        }));

        this.charts.booksCategory = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.name),
                datasets: [{
                    label: 'Number of Books',
                    data: data.map(d => d.count),
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                    ],
                    borderColor: [
                        'rgb(99, 102, 241)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)',
                        'rgb(239, 68, 68)',
                        'rgb(139, 92, 246)'
                    ],
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    },

    createAvailabilityChart() {
        const ctx = document.getElementById('availabilityChart');
        if (!ctx) return;

        const stats = this.getStats();

        this.charts.availability = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Available', 'On Loan'],
                datasets: [{
                    data: [stats.availableBooks, stats.onLoanBooks],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)'
                    ],
                    borderColor: [
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    },

    createLoanTrendsChart() {
        const ctx = document.getElementById('loanTrendsChart');
        if (!ctx) return;

        const loans = Loans.getAll();
        const days = 30;
        const labels = [];
        const loanData = [];
        const returnData = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

            const loansOnDay = loans.filter(l => l.loanDate.split('T')[0] === dateStr).length;
            const returnsOnDay = loans.filter(l => l.actualReturnDate && l.actualReturnDate.split('T')[0] === dateStr).length;

            loanData.push(loansOnDay);
            returnData.push(returnsOnDay);
        }

        this.charts.loanTrends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'New Loans',
                        data: loanData,
                        borderColor: 'rgb(99, 102, 241)',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Returns',
                        data: returnData,
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    },

    createMemberDistributionChart() {
        const ctx = document.getElementById('memberDistributionChart');
        if (!ctx) return;

        const members = Members.getAll();
        const active = members.filter(m => m.status === 'active').length;
        const inactive = members.filter(m => m.status === 'inactive').length;
        const suspended = members.filter(m => m.status === 'suspended').length;

        this.charts.memberDist = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Inactive', 'Suspended'],
                datasets: [{
                    data: [active, inactive, suspended],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(156, 163, 175, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ],
                    borderColor: [
                        'rgb(16, 185, 129)',
                        'rgb(156, 163, 175)',
                        'rgb(239, 68, 68)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    },

    createOverdueLoansChart() {
        const ctx = document.getElementById('overdueLoansChart');
        if (!ctx) return;

        const overdueLoans = Loans.getOverdue();
        const memberOverdue = {};

        overdueLoans.forEach(loan => {
            const member = Members.getById(loan.memberId);
            const name = member ? member.name : 'Unknown';
            memberOverdue[name] = (memberOverdue[name] || 0) + 1;
        });

        const labels = Object.keys(memberOverdue);
        const data = Object.values(memberOverdue);

        this.charts.overdue = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.length > 0 ? labels : ['No overdue loans'],
                datasets: [{
                    label: 'Overdue Books',
                    data: data.length > 0 ? data : [0],
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: 'rgb(239, 68, 68)',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    },

    renderRecentActivity() {
        const loans = Loans.getAll()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);

        if (loans.length === 0) {
            return '<p class="text-gray-500 text-center py-4">No recent activity</p>';
        }

        return loans.map(loan => {
            const book = Books.getById(loan.bookId);
            const member = Members.getById(loan.memberId);
            const isReturn = loan.returned;
            const icon = isReturn ?
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>' :
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>';
            const color = isReturn ? 'text-green-600 bg-green-100' : 'text-blue-600 bg-blue-100';
            const action = isReturn ? 'returned' : 'borrowed';
            const date = new Date(isReturn ? loan.actualReturnDate : loan.loanDate);

            return `
                <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div class="w-8 h-8 ${color} rounded-full flex items-center justify-center flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">${icon}</svg>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm text-gray-800">
                            <span class="font-medium">${member?.name || 'Unknown'}</span> ${action} 
                            <span class="font-medium">${book?.title || 'Unknown'}</span>
                        </p>
                        <p class="text-xs text-gray-500">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</p>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderCategoryStats() {
        const categories = Categories.getAll();
        const books = Books.getAll();

        if (categories.length === 0) {
            return `<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">No categories found</td></tr>`;
        }

        return categories.map(cat => {
            const catBooks = books.filter(b => b.categoryId === cat.id);
            const total = catBooks.length;
            const available = catBooks.filter(b => b.availability).length;
            const onLoan = total - available;
            const percentage = total > 0 ? Math.round((available / total) * 100) : 0;

            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm font-medium text-gray-800">${cat.name}</td>
                    <td class="px-4 py-3 text-sm text-center text-gray-600">${total}</td>
                    <td class="px-4 py-3 text-sm text-center">
                        <span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">${available}</span>
                    </td>
                    <td class="px-4 py-3 text-sm text-center">
                        <span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">${onLoan}</span>
                    </td>
                    <td class="px-4 py-3 text-sm text-center">
                        <div class="flex items-center justify-center gap-2">
                            <div class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div class="h-full bg-green-500 rounded-full" style="width: ${percentage}%"></div>
                            </div>
                            <span class="text-gray-600">${percentage}%</span>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    setupFilters() {
        document.getElementById('refreshDashboard')?.addEventListener('click', () => {
            this.destroyCharts();
            this.render();
            UI.toast('Dashboard refreshed', 'success');
        });

        document.getElementById('dateRangeFilter')?.addEventListener('change', () => {
            this.destroyCharts();
            this.initCharts();
        });

        document.getElementById('categoryFilter')?.addEventListener('change', () => {
            this.destroyCharts();
            this.initCharts();
        });
    },

    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Dashboard;
}

