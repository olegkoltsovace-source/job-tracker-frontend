<template>
  <div class="charts-container">
    <div class="chart-card">
      <h3>Applications by Status</h3>
      <div class="chart-wrapper">
        <Pie :data="pieData" :options="pieOptions" />
      </div>
    </div>

    <div class="chart-card">
      <h3>Application Timeline</h3>
      <div class="chart-wrapper">
        <Bar :data="barData" :options="barOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { Pie, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
)

const props = defineProps({
  stats: Object,
  applications: Array
})

let resizeObserver = null

onMounted(() => {
  // Force Chart.js to handle window resizing
  window.addEventListener('resize', handleResize)

  // Use ResizeObserver for container size changes (like DevTools opening)
  const chartContainers = document.querySelectorAll('.chart-card')
  if (chartContainers.length > 0) {
    resizeObserver = new ResizeObserver(() => {
      // Trigger Chart.js resize
      Object.values(ChartJS.instances).forEach(chart => {
        chart.resize()
      })
    })

    chartContainers.forEach(container => {
      resizeObserver.observe(container)
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

const handleResize = () => {
  // Force all Chart.js instances to resize
  Object.values(ChartJS.instances).forEach(chart => {
    chart.resize()
  })
}

const pieData = computed(() => ({
  labels: ['Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn'],
  datasets: [{
    data: [
      props.stats.applied,
      props.stats.interviewing,
      props.stats.offer,
      props.stats.rejected,
      props.stats.withdrawn
    ],
    backgroundColor: [
      '#4CAF50',
      '#2196F3',
      '#FF9800',
      '#f44336',
      '#999999'
    ],
    borderWidth: 0
  }]
}))

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 15,
        font: { size: 12 }
      }
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const label = context.label || '';
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
          return `${label}: ${value} (${percentage}%)`;
        }
      }
    }
  }
}

const barData = computed(() => {
  const monthCounts = {}

  props.applications.forEach(app => {
    if (app.appliedDate) {
      const date = new Date(app.appliedDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })

      if (!monthCounts[monthKey]) {
        monthCounts[monthKey] = { label: monthLabel, count: 0 }
      }
      monthCounts[monthKey].count++
    }
  })

  const sortedMonths = Object.entries(monthCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)

  const labels = sortedMonths.map(([_, data]) => data.label)
  const counts = sortedMonths.map(([_, data]) => data.count)

  return {
    labels: labels.length > 0 ? labels : ['No data'],
    datasets: [{
      label: 'Applications',
      data: counts.length > 0 ? counts : [0],
      backgroundColor: '#667eea',
      borderRadius: 8
    }]
  }
})

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function (context) {
          return `Applications: ${context.parsed.y}`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1 }
    }
  }
}
</script>

<style scoped>
.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.chart-card {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 350px;
  display: flex;
  flex-direction: column;
}

.chart-card h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
  text-align: center;
}

.chart-wrapper {
  flex: 1;
  position: relative;
  min-height: 250px;
}

/* @media (min-width: 768px) {
  .charts-container {
    padding-left: 25px;
    padding-right: 25px;
  }

  .chart-card {
    padding: 20px 15px;
    min-height: 300px;
  }

  .chart-card h3 {
    font-size: 16px;
  }
} */

.charts-container {
  padding-left: 15px;
  padding-right: 15px;
}

@media (max-width: 768px) {
  .charts-container {
    /* grid-template-columns: 1fr; */
    /* padding-left: 15px;
    padding-right: 15px; */
  }

  .chart-card {
    padding: 20px 15px;
    min-height: 300px;
  }

  .chart-card h3 {
    font-size: 16px;
  }
}
</style>