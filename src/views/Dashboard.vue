<template>
    <div class="dashboard">

        <!-- Navbar -->
        <nav class="navbar">
            <h1>Job Tracker</h1>
            <div class="user-menu">
                <span>{{ user?.username }}</span>
                <button @click="logout" class="logout-btn">Logout</button>
            </div>
        </nav>

        <!-- Stats Cards -->
        <div class="stats-container">
            <div class="stat-card total">
                <div class="stat-number">{{ stats.total }}</div>
                <div class="stat-label">Total</div>
            </div>
            <div class="stat-card applied">
                <div class="stat-number">{{ stats.applied }}</div>
                <div class="stat-label">Applied</div>
            </div>
            <div class="stat-card interviewing">
                <div class="stat-number">{{ stats.interviewing }}</div>
                <div class="stat-label">Interviewing</div>
            </div>
            <div class="stat-card offer">
                <div class="stat-number">{{ stats.offer }}</div>
                <div class="stat-label">Offers</div>
            </div>
            <div class="stat-card rejected">
                <div class="stat-number">{{ stats.rejected }}</div>
                <div class="stat-label">Rejected</div>
            </div>
            <div class="stat-card withdrawn">
                <div class="stat-number">{{ stats.withdrawn }}</div>
                <div class="stat-label">withdrawn</div>
            </div>
        </div>

        <!-- Charts -->
        <div class="charts-section">
            <StatsCharts :stats="stats" :applications="allApplications" />
        </div>

        <!-- Applications Section -->
        <div class="applications-section">
            <div class="section-header">
                <h2>My Applications</h2>
                <button @click="openAddModal" class="add-btn">+ Add Application</button>
            </div>

            <!-- Search and Filter -->
            <div class="filters">
                <input v-model="searchQuery" type="text" placeholder="Search by company..." class="search-input" />
                <select v-model="statusFilter" class="filter-select">
                    <option value="">All Statuses</option>
                    <option value="APPLIED">Applied</option>
                    <option value="INTERVIEWING">Interviewing</option>
                    <option value="OFFER">Offer</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="WITHDRAWN">Withdrawn</option>
                </select>
            </div>

            <!-- Desktop table -->
            <div class="table-view">
                <table v-if="applications.length > 0">
                    <thead>
                        <tr>
                            <th>Company</th>
                            <th>Position</th>
                            <th>Status</th>
                            <th>Applied Date</th>
                            <th>Notes</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="app in applications" :key="app.id">
                            <td>{{ app.companyName }}</td>
                            <td>{{ app.position }}</td>
                            <td>
                                <span :class="['status-badge', app.status.toLowerCase()]">
                                    {{ app.status }}
                                </span>
                            </td>
                            <td>{{ formatDate(app.appliedDate) }}</td>
                            <td class="notes-cell">{{ app.notes || '—' }}</td>
                            <td>
                                <button @click="editApplication(app)" class="action-btn edit">Edit</button>
                                <button @click="deleteApplication(app.id)" class="action-btn delete">Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div v-else class="empty-state">
                    <p>No applications yet. Click "Add Application" to get started!</p>
                </div>
            </div>

            <!-- Mobile cards -->
            <div class="card-view">
                <div v-for="app in applications" :key="app.id" class="app-card">
                    <div class="app-card-header">
                        <h3>{{ app.companyName }}</h3>
                        <span :class="['status-badge', app.status.toLowerCase()]">{{ app.status }}</span>
                    </div>
                    <p class="app-position">{{ app.position }}</p>
                    <p class="app-date">{{ formatDate(app.appliedDate) }}</p>
                    <p class="app-notes" v-if="app.notes">{{ app.notes }}</p>
                    <div class="app-actions">
                        <button @click="editApplication(app)" class="action-btn edit">Edit</button>
                        <button @click="deleteApplication(app.id)" class="action-btn delete">Delete</button>
                    </div>
                </div>
                <div v-if="applications.length === 0" class="empty-state">
                    <p>No applications yet. Click "Add Application" to get started!</p>
                </div>
            </div>
        </div>

        <!-- Add/Edit Modal -->
        <ApplicationForm v-if="showModal" :application="editingApplication" :userId="user?.id" @close="closeModal"
            @saved="handleSaved" />
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import ApplicationForm from '../components/ApplicationForm.vue'
import StatsCharts from '../components/StatsCharts.vue'

const router = useRouter()
const user = ref(null)
const allApplications = ref([])
const searchQuery = ref('')
const statusFilter = ref('')
const showModal = ref(false)
const editingApplication = ref(null)

const stats = ref({
    total: 0, applied: 0, interviewing: 0,
    offer: 0, rejected: 0, withdrawn: 0,
})

const applications = computed(() => {
    let filtered = allApplications.value

    if (searchQuery.value) {
        filtered = filtered.filter(app =>
            app.companyName.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
    }

    if (statusFilter.value) {
        filtered = filtered.filter(app => app.status === statusFilter.value)
    }

    return filtered
})

onMounted(async () => {
    const userData = localStorage.getItem('user')
    if (!userData) { router.push('/login'); return }

    user.value = JSON.parse(userData)
    await fetchStats()
    await fetchApplications()
})

const fetchStats = async () => {
    try {
        const response = await api.get(`/api/applications/stats?userId=${user.value.id}`)
        stats.value = response.data
    } catch (error) {
        console.error('Failed to fetch stats:', error)
    }
}

const fetchApplications = async () => {
    try {
        const response = await api.get(`/api/applications?userId=${user.value.id}`)
        allApplications.value = response.data
    } catch (error) {
        console.error('Failed to fetch applications:', error)
    }
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    })
}

const editApplication = (app) => {
    editingApplication.value = app
    showModal.value = true
}

const deleteApplication = async (id) => {
    if (!confirm('Are you sure you want to delete this application?')) return
    try {
        await api.delete(`/api/applications/${id}`)
        await fetchStats()
        await fetchApplications()
    } catch (error) {
        console.error('Failed to delete:', error)
        alert('Failed to delete application')
    }
}

const openAddModal = () => {
    editingApplication.value = null
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    editingApplication.value = null
}

const handleSaved = async () => {
    await fetchStats()
    await fetchApplications()
}

const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
}
</script>

<style scoped>
* {
    box-sizing: border-box;
}

.dashboard {
    min-height: 100vh;
    background: #f5f5f5;
    overflow-x: hidden;
}

/* Navbar */
.navbar {
    background: white;
    padding: 20px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar h1 {
    color: #667eea;
    font-size: 24px;
}

.user-menu {
    display: flex;
    align-items: center;
    gap: 20px;
}

.user-menu span {
    color: #666;
    font-weight: 500;
}

.logout-btn {
    padding: 8px 16px;
    background: #f5f5f5;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    font-family: inherit;
}

.logout-btn:hover {
    background: #e5e5e5;
}

/* Stats */
.stats-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 20px;
    padding: 40px;
    max-width: 1200px;
    margin: 0 auto;
}

.stat-card {
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.stat-number {
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 10px;
}

.stat-label {
    color: #666;
    font-size: 14px;
}

.stat-card.total .stat-number {
    color: #667eea;
}

.stat-card.applied .stat-number {
    color: #4CAF50;
}

.stat-card.interviewing .stat-number {
    color: #2196F3;
}

.stat-card.offer .stat-number {
    color: #FF9800;
}

.stat-card.rejected .stat-number {
    color: #f44336;
}

/* Charts */
.charts-section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px 20px;
}

/* Applications */
.applications-section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px 40px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.section-header h2 {
    color: #333;
    font-size: 24px;
}

.add-btn {
    padding: 12px 24px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
}

.add-btn:hover {
    background: #5568d3;
}

/* Filters */
.filters {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
}

.search-input,
.filter-select {
    padding: 10px 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
    font-family: inherit;
}

.search-input {
    flex: 1;
}

.filter-select {
    min-width: 200px;
}

/* Table */
table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

thead {
    background: #f8f9fa;
}

th {
    padding: 15px;
    text-align: left;
    font-weight: 600;
    color: #666;
    font-size: 14px;
}

td {
    padding: 15px;
    border-top: 1px solid #f0f0f0;
}

.notes-cell {
    color: #888;
    font-style: italic;
    font-size: 13px;
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.status-badge {
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
}

.status-badge.applied {
    background: #e8f5e9;
    color: #4CAF50;
}

.status-badge.interviewing {
    background: #e3f2fd;
    color: #2196F3;
}

.status-badge.offer {
    background: #fff3e0;
    color: #FF9800;
}

.status-badge.rejected {
    background: #ffebee;
    color: #f44336;
}

.status-badge.withdrawn {
    background: #f5f5f5;
    color: #999;
}

.action-btn {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    margin-right: 8px;
    font-family: inherit;
}

.action-btn.edit {
    background: #e3f2fd;
    color: #2196F3;
}

.action-btn.delete {
    background: #ffebee;
    color: #f44336;
}

.action-btn:hover {
    opacity: 0.8;
}

.empty-state {
    padding: 60px 20px;
    text-align: center;
    color: #999;
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Mobile cards — hidden on desktop */
.card-view {
    display: none;
}

/* Responsive */
@media (max-width: 1024px) {
    .navbar {
        padding: 15px 20px;
    }

    .stats-container {
        padding: 20px;
    }

    .applications-section {
        padding: 0 20px 20px;
    }

    .charts-section {
        padding: 0 20px 20px;
    }

    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }

    .add-btn {
        width: 100%;
    }

    .filters {
        flex-direction: column;
    }

    .filter-select {
        width: 100%;
        min-width: auto;
    }
}

@media (max-width: 768px) {
    .table-view {
        display: none;
    }

    .card-view {
        display: block;
    }

    .stats-container {
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        padding: 15px;
    }

    .stat-number {
        font-size: 28px;
    }

    .app-card {
        background: white;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 15px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .app-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 10px;
        gap: 10px;
    }

    .app-card-header h3 {
        margin: 0;
        font-size: 18px;
        color: #333;
        flex: 1;
    }

    .app-position {
        color: #666;
        margin: 5px 0;
        font-size: 14px;
    }

    .app-date {
        color: #999;
        font-size: 13px;
        margin: 5px 0 10px;
    }

    .app-notes {
        color: #888;
        font-size: 13px;
        font-style: italic;
        margin: 0 0 15px;
    }

    .app-actions {
        display: flex;
        gap: 10px;
    }

    .app-actions .action-btn {
        flex: 1;
        margin: 0;
        padding: 10px;
    }
}

@media (max-width: 480px) {
    .stats-container {
        grid-template-columns: 1fr;
    }

    .stat-number {
        font-size: 24px;
    }

    .navbar h1 {
        font-size: 18px;
    }
}
</style>