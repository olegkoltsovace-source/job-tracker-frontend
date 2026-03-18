<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <h2>{{ isEdit ? 'Edit Application' : 'Add Application' }}</h2>

      <div v-if="error" class="error">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Company Name *</label>
          <input v-model="form.companyName" type="text" placeholder="e.g. Google" required />
        </div>

        <div class="form-group">
          <label>Position *</label>
          <input v-model="form.position" type="text" placeholder="e.g. Backend Developer" required />
        </div>

        <div class="form-group">
          <label>Status *</label>
          <select v-model="form.status" required>
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </div>

        <div class="form-group">
          <label>Applied Date *</label>
          <input v-model="form.appliedDate" type="date" required />
        </div>

        <div class="form-group">
          <label>Job URL</label>
          <input v-model="form.jobUrl" type="url" placeholder="https://careers.company.com/job123" />
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea v-model="form.notes" rows="4" placeholder="Add any notes about this application..."></textarea>
        </div>

        <div class="button-group">
          <button type="button" @click="$emit('close')" class="cancel-btn">
            Cancel
          </button>
          <button type="submit" :disabled="loading" class="submit-btn">
            {{ loading ? 'Saving...' : (isEdit ? 'Update' : 'Add Application') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '../api'

const props = defineProps({
  application: Object,  // If editing, this will have the application data
  userId: Number
})

const emit = defineEmits(['close', 'saved'])

const isEdit = ref(!!props.application)
const loading = ref(false)
const error = ref('')

const form = ref({
  companyName: '',
  position: '',
  status: 'APPLIED',
  appliedDate: new Date().toISOString().split('T')[0], // Today's date
  jobUrl: '',
  notes: ''
})

// If editing, populate form with existing data
if (props.application) {
  form.value = {
    companyName: props.application.companyName,
    position: props.application.position,
    status: props.application.status,
    appliedDate: props.application.appliedDate,
    jobUrl: props.application.jobUrl || '',
    notes: props.application.notes || ''
  }
}

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    if (isEdit.value) {
      await api.put(
        `/api/applications/${props.application.id}`,
        form.value
      )
    } else {
      await api.post('/api/applications', {
        ...form.value,
        userId: props.userId
      })
    }

    emit('saved')  // Tell parent to refresh data
    emit('close')  // Close modal
  } catch (err) {
    error.value = err.response?.data || 'Failed to save application'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}

.error {
  background: #fee;
  color: #c33;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
  font-size: 14px;
}

input,
select,
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  font-family: inherit;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #667eea;
}

textarea {
  resize: vertical;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #e5e5e5;
}

.submit-btn {
  background: #667eea;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Add at the bottom */

@media (max-width: 768px) {
  .modal {
    width: 95%;
    padding: 25px 20px;
    max-height: 85vh;
  }

  h2 {
    font-size: 18px;
  }

  .form-group {
    margin-bottom: 15px;
  }

  label {
    font-size: 13px;
  }

  input,
  select,
  textarea {
    font-size: 14px;
    padding: 10px;
  }

  .button-group {
    flex-direction: column;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .modal {
    width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
}
</style>