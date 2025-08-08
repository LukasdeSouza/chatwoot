<script>
import { mapGetters } from 'vuex';
import globalConfigMixin from 'shared/mixins/globalConfigMixin';
import SignupForm from './components/Signup/Form.vue';
import Testimonials from './components/Testimonials/Index.vue';
import Spinner from 'shared/components/Spinner.vue';

export default {
  components: {
    SignupForm,
    Spinner,
    Testimonials,
  },
  mixins: [globalConfigMixin],
  data() {
    return { isLoading: false };
  },
  computed: {
    ...mapGetters({ globalConfig: 'globalConfig/get' }),
    isAChatwootInstance() {
      return this.globalConfig.installationName === 'Chatwoot';
    },
  },
  beforeMount() {
    this.isLoading = this.isAChatwootInstance;
  },
  methods: {
    resizeContainers() {
      this.isLoading = false;
    },
  },
};
</script>

<template>
  <div class="signup-container">
    <div v-show="!isLoading" class="flex h-full min-h-screen items-center w-full max-w-6xl mx-auto">
      <!-- Left Panel - Signup Form -->
      <div class="signup-left-panel flex-1 min-h-[640px] inline-flex items-center h-full justify-center overflow-auto">
        <div class="w-full max-w-md signup-form-container">
          <!-- Header -->
          <div class="signup-header">
            <div class="signup-logo" v-if="!globalConfig.logo && !globalConfig.logoDark">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
            <img
              v-if="globalConfig.logo"
              :src="globalConfig.logo"
              :alt="globalConfig.installationName"
              class="h-12 w-auto mb-6 dark:hidden"
            />
            <img
              v-if="globalConfig.logoDark"
              :src="globalConfig.logoDark"
              :alt="globalConfig.installationName"
              class="hidden h-12 w-auto mb-6 dark:block"
            />
            
            <h1 class="signup-title">
              {{ $t('REGISTER.TRY_WOOT') }}
            </h1>
            <p class="signup-subtitle">
              {{ $t('REGISTER.SUBTITLE') || 'Comece a conversar com seus clientes hoje mesmo' }}
            </p>
          </div>

          <!-- Signup Form -->
          <div class="signup-form">
            <SignupForm />
            
            <!-- Login Link -->
            <div class="signup-login-link">
              <span>{{ $t('REGISTER.HAVE_AN_ACCOUNT') }}</span>
              <router-link to="/app/login">
                {{
                  useInstallationName(
                    $t('LOGIN.TITLE'),
                    globalConfig.installationName
                  )
                }}
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Testimonials -->
      <div 
        v-if="isAChatwootInstance" 
        class="signup-right-panel flex-1"
      >
        <Testimonials @resize-containers="resizeContainers" />
      </div>
    </div>
    
    <!-- Loading State -->
    <div
      v-show="isLoading"
      class="signup-loading"
    >
      <Spinner color-scheme="primary" size="lg" />
      <p class="signup-loading-text">
        {{ $t('REGISTER.LOADING') || 'Carregando...' }}
      </p>
    </div>
  </div>
</template>
