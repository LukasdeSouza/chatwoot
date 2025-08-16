<script>
// utils and composables
import { login } from '../../api/auth';
import { mapGetters } from 'vuex';
import { parseBoolean } from '@chatwoot/utils';
import { useAlert } from 'dashboard/composables';
import { required, email } from '@vuelidate/validators';
import { useVuelidate } from '@vuelidate/core';
import { SESSION_STORAGE_KEYS } from 'dashboard/constants/sessionStorage';
import SessionStorage from 'shared/helpers/sessionStorage';
// mixins
import globalConfigMixin from 'shared/mixins/globalConfigMixin';

// components
import FormInput from '../../components/Form/Input.vue';
import GoogleOAuthButton from '../../components/GoogleOauth/Button.vue';
import Spinner from 'shared/components/Spinner.vue';
import NextButton from 'dashboard/components-next/button/Button.vue';

const ERROR_MESSAGES = {
  'no-account-found': 'LOGIN.OAUTH.NO_ACCOUNT_FOUND',
  'business-account-only': 'LOGIN.OAUTH.BUSINESS_ACCOUNTS_ONLY',
};

const IMPERSONATION_URL_SEARCH_KEY = 'impersonation';

export default {
  components: {
    FormInput,
    GoogleOAuthButton,
    Spinner,
    NextButton,
  },
  mixins: [globalConfigMixin],
  props: {
    ssoAuthToken: { type: String, default: '' },
    ssoAccountId: { type: String, default: '' },
    ssoConversationId: { type: String, default: '' },
    email: { type: String, default: '' },
    authError: { type: String, default: '' },
  },
  setup() {
    return { v$: useVuelidate() };
  },
  data() {
    return {
      // We need to initialize the component with any
      // properties that will be used in it
      credentials: {
        email: '',
        password: '',
      },
      loginApi: {
        message: '',
        showLoading: false,
        hasErrored: false,
      },
      error: '',
    };
  },
  validations() {
    return {
      credentials: {
        password: {
          required,
        },
        email: {
          required,
          email,
        },
      },
    };
  },
  computed: {
    ...mapGetters({ globalConfig: 'globalConfig/get' }),
    showGoogleOAuth() {
      return Boolean(window.chatwootConfig.googleOAuthClientId);
    },
    showSignupLink() {
      return parseBoolean(window.chatwootConfig.signupEnabled);
    },
  },
  created() {
    if (this.ssoAuthToken) {
      this.submitLogin();
    }
    if (this.authError) {
      const message = ERROR_MESSAGES[this.authError] ?? 'LOGIN.API.UNAUTH';
      useAlert(this.$t(message));
      // wait for idle state
      this.requestIdleCallbackPolyfill(() => {
        // Remove the error query param from the url
        const { query } = this.$route;
        this.$router.replace({ query: { ...query, error: undefined } });
      });
    }
  },
  methods: {
    // TODO: Remove this when Safari gets wider support
    // Ref: https://caniuse.com/requestidlecallback
    //
    requestIdleCallbackPolyfill(callback) {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(callback);
      } else {
        // Fallback for safari
        // Using a delay of 0 allows the callback to be executed asynchronously
        // in the next available event loop iteration, similar to requestIdleCallback
        setTimeout(callback, 0);
      }
    },
    showAlertMessage(message) {
      // Reset loading, current selected agent
      this.loginApi.showLoading = false;
      this.loginApi.message = message;
      useAlert(this.loginApi.message);
    },
    handleImpersonation() {
      // Detects impersonation mode via URL and sets a session flag to prevent user settings changes during impersonation.
      const urlParams = new URLSearchParams(window.location.search);
      const impersonation = urlParams.get(IMPERSONATION_URL_SEARCH_KEY);
      if (impersonation) {
        SessionStorage.set(SESSION_STORAGE_KEYS.IMPERSONATION_USER, true);
      }
    },
    submitLogin() {
      this.loginApi.hasErrored = false;
      this.loginApi.showLoading = true;

      const credentials = {
        email: this.email
          ? decodeURIComponent(this.email)
          : this.credentials.email,
        password: this.credentials.password,
        sso_auth_token: this.ssoAuthToken,
        ssoAccountId: this.ssoAccountId,
        ssoConversationId: this.ssoConversationId,
      };

      login(credentials)
        .then(() => {
          this.handleImpersonation();
          this.showAlertMessage(this.$t('LOGIN.API.SUCCESS_MESSAGE'));
        })
        .catch(response => {
          // Reset URL Params if the authentication is invalid
          if (this.email) {
            window.location = '/app/login';
          }
          this.loginApi.hasErrored = true;
          this.showAlertMessage(
            response?.message || this.$t('LOGIN.API.UNAUTH')
          );
        });
    },
    submitFormLogin() {
      if (this.v$.credentials.email.$invalid && !this.email) {
        this.showAlertMessage(this.$t('LOGIN.EMAIL.ERROR'));
        return;
      }

      this.submitLogin();
    },
  },
};
</script>

<template>
  <main
    class="flex items-center justify-center w-full min-h-screen bg-n-brand/5 dark:bg-n-background relative overflow-hidden"
  >
    <!-- Floating geometric shapes -->
    <div class="floating-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
      <div class="shape shape-5"></div>
    </div>

    <!-- Grid background -->
    <div class="grid-background"></div>

    <!-- Main container with two columns -->
    <div class="main-container">
      <!-- Left side - Branding and info -->
      <section class="branding-section">
        <div class="logo-container">
          <!-- <img
            :src="globalConfig.logo"
            :alt="globalConfig.installationName"
            class="brand-logo dark:hidden"
          />
          <img
            v-if="globalConfig.logoDark"
            :src="globalConfig.logoDark"
            :alt="globalConfig.installationName"
            class="brand-logo hidden dark:block"
          /> -->
        </div>
        
        <div class="brand-content">
          <h1 class="brand-title">
           OmniTech
          </h1>
          <p class="brand-subtitle">
            Transforme a comunicação com seus clientes em experiências extraordinárias.
          </p>
          <small class="brand-credits">
            desenvolvido por Codetech Software
          </small>
          
          <!-- Features list -->
          <div class="features-list">
            <div class="feature-item">
              <div class="feature-icon">
                <i class="i-lucide-message-circle"></i>
              </div>
              <span>Conversas em tempo real</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <i class="i-lucide-trending-up"></i>
              </div>
              <span>Performance otimizada</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <i class="i-lucide-phone-call"></i>
              </div>
              <span>Atendimento personalizado</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Right side - Login form -->
      <section class="login-section">
        <div class="login-card">
          <div class="card-header">
            <h2 class="login-title">
              Bem-vindo de volta!
            </h2>
            <p class="login-subtitle">
              Faça login para acessar sua conta
            </p>
          </div>

          <div class="card-content">
            <div v-if="!email">
              <GoogleOAuthButton v-if="showGoogleOAuth" class="oauth-btn" />
              
              <div v-if="showGoogleOAuth" class="divider">
                <span>ou continue com email</span>
              </div>

              <form class="login-form" @submit.prevent="submitFormLogin">
                <div class="input-group">
                  <FormInput
                    v-model="credentials.email"
                    name="email_address"
                    type="text"
                    data-testid="email_input"
                    :tabindex="1"
                    required
                    :label="$t('LOGIN.EMAIL.LABEL')"
                    :placeholder="$t('LOGIN.EMAIL.PLACEHOLDER')"
                    :has-error="v$.credentials.email.$error"
                    @input="v$.credentials.email.$touch"
                  />
                </div>
                
                <div class="input-group">
                  <FormInput
                    v-model="credentials.password"
                    type="password"
                    name="password"
                    data-testid="password_input"
                    required
                    :tabindex="2"
                    :label="$t('LOGIN.PASSWORD.LABEL')"
                    :placeholder="$t('LOGIN.PASSWORD.PLACEHOLDER')"
                    :has-error="v$.credentials.password.$error"
                    @input="v$.credentials.password.$touch"
                  />
                  
                  <!-- <div class="forgot-password">
                    <router-link
                      v-if="!globalConfig.disableUserProfileUpdate"
                      to="auth/reset/password"
                      class="forgot-link"
                      tabindex="4"
                    >
                      {{ $t('LOGIN.FORGOT_PASSWORD') }}
                    </router-link>
                  </div> -->
                </div>

                <NextButton
                  lg
                  type="submit"
                  data-testid="submit_button"
                  class="submit-btn"
                  :tabindex="3"
                  :label="$t('LOGIN.SUBMIT')"
                  :disabled="loginApi.showLoading"
                  :is-loading="loginApi.showLoading"
                />
              </form>
            </div>
            
            <div v-else class="loading-state">
              <Spinner color-scheme="primary" size="" />
              <p>Conectando...</p>
            </div>
          </div>

          <div v-if="showSignupLink" class="card-footer">
            <p class="signup-text">
              Não tem uma conta?
              <router-link to="auth/signup" class="signup-link">
                {{ $t('LOGIN.CREATE_NEW_ACCOUNT') }}
              </router-link>
            </p>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
/* Revolutionary Login Design - Two Column Layout */

/* Main container and background */
main {
  background: linear-gradient(135deg, 
    rgba(255, 237, 213, 0.8) 0%, 
    rgba(254, 215, 170, 0.6) 25%,
    rgba(253, 186, 116, 0.4) 50%,
    rgba(251, 146, 60, 0.3) 75%,
    rgba(249, 115, 22, 0.2) 100%) !important;
  background-size: 400% 400% !important;
  animation: gradientFlow 20s ease infinite !important;
}

@keyframes gradientFlow {
  0%, 100% { background-position: 0% 50%; }
  33% { background-position: 100% 50%; }
  66% { background-position: 50% 100%; }
}

/* Grid background effect */
.grid-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(251, 146, 60, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(251, 146, 60, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: gridMove 30s linear infinite;
  pointer-events: none;
}

@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(40px, 40px); }
}

/* Floating geometric shapes */
.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(251, 146, 60, 0.1), rgba(249, 115, 22, 0.05));
  animation: float 15s ease-in-out infinite;
}

.shape-1 {
  width: 120px;
  height: 120px;
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}

.shape-2 {
  width: 80px;
  height: 80px;
  top: 70%;
  right: 10%;
  animation-delay: -3s;
  border-radius: 20px;
}

.shape-3 {
  width: 60px;
  height: 60px;
  top: 40%;
  left: 85%;
  animation-delay: -6s;
}

.shape-4 {
  width: 100px;
  height: 100px;
  top: 20%;
  right: 40%;
  animation-delay: -9s;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
}

.shape-5 {
  width: 140px;
  height: 140px;
  bottom: 10%;
  left: 20%;
  animation-delay: -12s;
  border-radius: 40px;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-20px) rotate(90deg); }
  50% { transform: translateY(0px) rotate(180deg); }
  75% { transform: translateY(-10px) rotate(270deg); }
}

/* Main container layout */
.main-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1400px;
  width: 100%;
  height: 100vh;
  position: relative;
  z-index: 1;
}

/* Left side - Branding section */
.branding-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.branding-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    transparent 30%, 
    rgba(251, 146, 60, 0.05) 50%, 
    transparent 70%);
  background-size: 200% 200%;
  animation: brandingGlow 8s ease infinite;
}

@keyframes brandingGlow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.logo-container {
  margin-bottom: 3rem;
  position: relative;
  z-index: 1;
}

.brand-logo {
  height: 4rem;
  width: auto;
  filter: drop-shadow(0 8px 24px rgba(251, 146, 60, 0.3));
  transition: all 0.4s ease;
}

.brand-logo:hover {
  transform: scale(1.1) rotateY(10deg);
  filter: drop-shadow(0 12px 32px rgba(251, 146, 60, 0.5));
}

.brand-content {
  text-align: center;
  position: relative;
  z-index: 1;
}

.brand-title {
  font-size: 3.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, 
    #1f2937 0%, 
    #374151 20%,
    #fb923c 40%,
    #f97316 60%,
    #ea580c 80%,
    #c2410c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1.5rem;
  letter-spacing: -0.05em;
  line-height: 1.1;
}

.brand-subtitle {
  font-size: 1.25rem;
  color: #64748b;
  margin-bottom: 3rem;
  line-height: 1.6;
  max-width: 400px;
}

.brand-credits {
  font-size: 0.875rem;
  color: #9ca3af;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: flex-start;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(251, 146, 60, 0.2);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  width: 100%;
  max-width: 380px;
}

.feature-item:hover {
  transform: translateX(8px);
  box-shadow: 0 12px 32px rgba(251, 146, 60, 0.2);
  border-color: rgba(251, 146, 60, 0.4);
}

.feature-icon {
  font-size: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fb923c, #f97316);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3);
  color: white;
}

.feature-icon i {
  width: 1.25rem;
  height: 1.25rem;
}

/* Right side - Login section */
.login-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
}

.login-card {
  width: 100%;
  max-width: 480px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(30px);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 
    0 32px 64px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(255, 255, 255, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(251, 146, 60, 0.1);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #fb923c, #f97316, #ea580c);
  background-size: 200% 100%;
  animation: cardBorder 3s ease infinite;
}

@keyframes cardBorder {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.login-card:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 40px 80px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(251, 146, 60, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.card-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.login-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 0.75rem;
  letter-spacing: -0.025em;
}

.login-subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.card-content {
  margin-bottom: 2rem;
}

.oauth-btn {
  margin-bottom: 1.5rem;
}

.divider {
  display: flex;
  align-items: center;
  margin: 2rem 0;
  color: #9ca3af;
  font-size: 0.875rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(251, 146, 60, 0.3), transparent);
}

.divider span {
  padding: 0 1rem;
  background: rgba(255, 255, 255, 0.9);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  position: relative;
}

.forgot-password {
  margin-top: 0.75rem;
}

.forgot-link {
  color: #fb923c;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s ease;
  position: relative;
}

.forgot-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #fb923c, #f97316);
  transition: width 0.3s ease;
}

.forgot-link:hover::after {
  width: 100%;
}

.submit-btn {
  width: 100%;
  margin-top: 1rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: #6b7280;
}

.card-footer {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(251, 146, 60, 0.1);
}

.signup-text {
  color: #6b7280;
  font-size: 0.875rem;
}

.signup-link {
  color: #fb923c;
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.5rem;
  transition: all 0.2s ease;
  position: relative;
}

.signup-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #fb923c, #f97316);
  transition: width 0.3s ease;
}

.signup-link:hover::after {
  width: 100%;
}

/* Enhanced form inputs */
:deep(.input-group input) {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px) !important;
  border: 2px solid rgba(251, 146, 60, 0.2) !important;
  border-radius: 16px !important;
  padding: 1rem 1.25rem !important;
  font-size: 1rem !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
}

:deep(.input-group input:focus) {
  background: rgba(255, 255, 255, 1) !important;
  border-color: #fb923c !important;
  box-shadow: 
    0 0 0 4px rgba(251, 146, 60, 0.15),
    0 8px 24px rgba(251, 146, 60, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 1) !important;
  transform: translateY(-2px) !important;
}

:deep(.input-group label) {
  color: #374151 !important;
  font-weight: 600 !important;
  font-size: 0.875rem !important;
  margin-bottom: 0.5rem !important;
  display: block !important;
}

/* Enhanced submit button */
:deep(button[data-testid="submit_button"]) {
  background: linear-gradient(135deg, 
    #fb923c 0%, 
    #f97316 25%,
    #ea580c 50%,
    #f97316 75%,
    #fb923c 100%) !important;
  background-size: 200% 200% !important;
  border: none !important;
  color: white !important;
  font-weight: 700 !important;
  font-size: 1.1rem !important;
  padding: 1rem 2rem !important;
  border-radius: 16px !important;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
  box-shadow: 
    0 12px 32px rgba(251, 146, 60, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
  position: relative !important;
  overflow: hidden !important;
  letter-spacing: 0.025em !important;
}

:deep(button[data-testid="submit_button"]::before) {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: -100% !important;
  width: 100% !important;
  height: 100% !important;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.3), 
    transparent) !important;
  transition: left 0.8s ease !important;
}

:deep(button[data-testid="submit_button"]:hover:not([disabled])) {
  background-position: 100% 0% !important;
  transform: translateY(-4px) scale(1.02) !important;
  box-shadow: 
    0 20px 48px rgba(251, 146, 60, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
}

:deep(button[data-testid="submit_button"]:hover:not([disabled])::before) {
  left: 100% !important;
}

/* Enhanced OAuth button */
:deep(.oauth-btn) {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(15px) !important;
  border: 2px solid rgba(251, 146, 60, 0.2) !important;
  border-radius: 16px !important;
  padding: 1rem !important;
  transition: all 0.3s ease !important;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
}

:deep(.oauth-btn:hover) {
  background: rgba(255, 255, 255, 1) !important;
  border-color: rgba(251, 146, 60, 0.4) !important;
  transform: translateY(-2px) !important;
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(251, 146, 60, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 1) !important;
}

/* Dark mode adaptations */
.dark .branding-section {
  background: rgba(17, 24, 39, 0.8);
  border-right-color: rgba(75, 85, 99, 0.3);
}

.dark .login-section {
  background: rgba(31, 41, 55, 0.6);
}

.dark .login-card {
  background: rgba(31, 41, 55, 0.95);
  border-color: rgba(75, 85, 99, 0.3);
}

.dark .login-title {
  color: #f9fafb;
}

.dark .login-subtitle,
.dark .signup-text {
  color: #d1d5db;
}

.dark .feature-item {
  background: rgba(55, 65, 81, 0.8);
  border-color: rgba(75, 85, 99, 0.4);
}

.dark .brand-subtitle {
  color: #9ca3af;
}

.dark :deep(.input-group input) {
  background: rgba(55, 65, 81, 0.8) !important;
  border-color: rgba(75, 85, 99, 0.4) !important;
  color: #f9fafb !important;
}

.dark :deep(.input-group label) {
  color: #e5e7eb !important;
}

/* Responsive design */
@media (max-width: 1024px) {
  .main-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
  
  .branding-section {
    padding: 2rem;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .brand-title {
    font-size: 2.5rem;
  }
  
  .features-list {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .feature-item {
    max-width: 200px;
  }
}

@media (max-width: 768px) {
  .main-container {
    height: auto;
    min-height: 100vh;
  }
  
  .branding-section,
  .login-section {
    padding: 1.5rem;
  }
  
  .login-card {
    padding: 2rem;
    border-radius: 24px;
  }
  
  .brand-title {
    font-size: 2rem;
  }
  
  .features-list {
    gap: 1rem;
  }
  
  .feature-item {
    padding: 0.75rem 1rem;
    max-width: 100%;
  }
}

/* Error animation */
.animate-wiggle {
  animation: wiggle 0.6s ease-in-out !important;
}

@keyframes wiggle {
  0%, 100% { transform: translateY(-8px) scale(1.02); }
  25% { transform: translateY(-8px) scale(1.02) rotateZ(-2deg); }
  75% { transform: translateY(-8px) scale(1.02) rotateZ(2deg); }
}
</style>
