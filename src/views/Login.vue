<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>Job Tracker</h1>
      <h2>Login</h2>

      <div v-if="error" class="error">{{ error }}</div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Username</label>
          <input v-model="username" type="text" placeholder="Enter username" required />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input v-model="password" type="password" placeholder="Enter password" required />
        </div>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <p class="switch-auth">
        Don't have an account?
        <router-link to="/register">Register</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router   = useRouter()
const username = ref('')
const password = ref('')
const error    = ref('')
const loading  = ref(false)

const handleLogin = async () => {
  error.value   = ''
  loading.value = true

  try {
    const response = await api.post('/api/auth/login', {
      username: username.value,
      password: password.value,
    })

    // Store token separately — api.js interceptor picks it up automatically
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify({
      id:       response.data.userId,
      username: response.data.username,
      email:    response.data.email,
    }))

    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h1 {
  color: #667eea;
  margin-bottom: 10px;
  font-size: 28px;
}

h2 {
  color: #333;
  margin-bottom: 30px;
  font-size: 20px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

button {
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  font-family: inherit;
}

button:hover:not(:disabled) { background: #5568d3; }
button:disabled { opacity: 0.6; cursor: not-allowed; }

.error {
  background: #fee;
  color: #c33;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
  font-size: 14px;
}

.switch-auth {
  margin-top: 20px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.switch-auth a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.switch-auth a:hover { text-decoration: underline; }

@media (max-width: 480px) {
  .auth-card { padding: 25px 15px; }
  h1 { font-size: 22px; }
  h2 { font-size: 17px; }
}
</style>