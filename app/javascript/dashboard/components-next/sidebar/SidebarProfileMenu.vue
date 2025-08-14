<script setup>
import { computed } from 'vue';
import Auth from 'dashboard/api/auth';
import { useMapGetter } from 'dashboard/composables/store';
import { useI18n } from 'vue-i18n';
import Avatar from 'next/avatar/Avatar.vue';
import SidebarProfileMenuStatus from './SidebarProfileMenuStatus.vue';
import { FEATURE_FLAGS } from 'dashboard/featureFlags';

import {
  DropdownContainer,
  DropdownBody,
  DropdownSeparator,
  DropdownItem,
} from 'next/dropdown-menu/base';
import CustomBrandPolicyWrapper from '../../components/CustomBrandPolicyWrapper.vue';

const emit = defineEmits(['close', 'openKeyShortcutModal']);

defineOptions({
  inheritAttrs: false,
});

const { t } = useI18n();

const currentUser = useMapGetter('getCurrentUser');
const currentUserAvailability = useMapGetter('getCurrentUserAvailability');
const accountId = useMapGetter('getCurrentAccountId');
const globalConfig = useMapGetter('globalConfig/get');
const isFeatureEnabledonAccount = useMapGetter(
  'accounts/isFeatureEnabledonAccount'
);

const showChatSupport = computed(() => {
  return (
    isFeatureEnabledonAccount.value(
      accountId.value,
      FEATURE_FLAGS.CONTACT_CHATWOOT_SUPPORT_TEAM
    ) && globalConfig.value.chatwootInboxToken
  );
});

const menuItems = computed(() => {
  return [
    {
      show: showChatSupport.value,
      showOnCustomBrandedInstance: false,
      label: t('SIDEBAR_ITEMS.CONTACT_SUPPORT'),
      icon: 'i-lucide-life-buoy',
      click: () => {
        window.$chatwoot.toggle();
      },
    },
    {
      show: true,
      showOnCustomBrandedInstance: true,
      label: t('SIDEBAR_ITEMS.KEYBOARD_SHORTCUTS'),
      icon: 'i-lucide-keyboard',
      click: () => {
        emit('openKeyShortcutModal');
      },
    },
    {
      show: true,
      showOnCustomBrandedInstance: true,
      label: t('SIDEBAR_ITEMS.PROFILE_SETTINGS'),
      icon: 'i-lucide-user-pen',
      link: { name: 'profile_settings_index' },
    },
    {
      show: true,
      showOnCustomBrandedInstance: true,
      label: t('SIDEBAR_ITEMS.APPEARANCE'),
      icon: 'i-lucide-palette',
      click: () => {
        const ninja = document.querySelector('ninja-keys');
        ninja.open({ parent: 'appearance_settings' });
      },
    },
    {
      show: false, // Comentado: currentUser.value.type === 'SuperAdmin',
      showOnCustomBrandedInstance: true,
      label: t('SIDEBAR_ITEMS.SUPER_ADMIN_CONSOLE'),
      icon: 'i-lucide-castle',
      link: '/super_admin',
      nativeLink: true,
      target: '_blank',
    },
    {
      show: true,
      showOnCustomBrandedInstance: true,
      label: t('SIDEBAR_ITEMS.LOGOUT'),
      icon: 'i-lucide-power',
      click: Auth.logout,
    },
  ];
});

const allowedMenuItems = computed(() => {
  return menuItems.value.filter(item => item.show);
});
</script>

<template>
  <DropdownContainer class="relative w-full min-w-0" @close="emit('close')">
    <template #trigger="{ toggle, isOpen }">
      <button
        class="flex gap-2 items-center rounded-lg cursor-pointer text-left w-full hover:bg-n-alpha-1 p-1"
        :class="{ 'bg-n-alpha-1': isOpen }"
        @click="toggle"
      >
        <Avatar
          :size="32"
          :name="currentUser.available_name"
          :src="currentUser.avatar_url"
          :status="currentUserAvailability"
          class="flex-shrink-0"
          rounded-full
        />
        <div class="min-w-0">
          <div class="text-n-slate-12 text-sm leading-4 font-medium truncate">
            {{ currentUser.available_name }}
          </div>
          <div class="text-n-slate-11 text-xs truncate">
            {{ currentUser.email }}
          </div>
        </div>
      </button>
    </template>
    <DropdownBody class="ltr:left-0 rtl:right-0 bottom-12 z-50 w-80 mb-2">
      <SidebarProfileMenuStatus />
      <DropdownSeparator />
      <template v-for="item in allowedMenuItems" :key="item.label">
        <CustomBrandPolicyWrapper
          :show-on-custom-branded-instance="item.showOnCustomBrandedInstance"
        >
          <DropdownItem v-if="item.show" v-bind="item" />
        </CustomBrandPolicyWrapper>
      </template>
    </DropdownBody>
  </DropdownContainer>
</template>

<style>
/* Estilos globais para o dropdown do perfil com fundo laranja claro e texto escuro */
.DropdownBody *,
.DropdownContent * {
  color: #9a3412 !important; /* orange-800 */
}

.DropdownContent,
.n-dropdown-body {
  background: #fff7ed !important; /* orange-50 - fundo laranja muito claro */
  border: 1px solid #fdba74 !important; /* orange-300 */
  box-shadow: 0 4px 12px rgba(251, 146, 60, 0.15) !important;
  backdrop-filter: none !important;
}

/* Garantindo que TODOS os textos dentro do dropdown sejam escuros e visíveis */
.DropdownContent *,
.n-dropdown-body * {
  color: #9a3412 !important; /* orange-800 - texto laranja escuro */
}

.DropdownContent .text-n-slate-12,
.DropdownContent .text-n-strong,
.DropdownContent .DropdownItem > div,
.DropdownContent .font-medium,
.DropdownContent span,
.DropdownContent p,
.DropdownContent div,
.DropdownContent a,
.DropdownContent button,
.DropdownItem div,
.DropdownItem span,
.n-dropdown-body .text-n-slate-12,
.n-dropdown-body .text-n-strong,
.n-dropdown-body .DropdownItem > div,
.n-dropdown-body .font-medium,
.n-dropdown-body span,
.n-dropdown-body p,
.n-dropdown-body div,
.n-dropdown-body a,
.n-dropdown-body button,
.SidebarProfileMenuStatus *,
.DropdownContent .text-n-slate-11,
.DropdownContent .text-n-weak,
.n-dropdown-body .text-n-slate-11,
.n-dropdown-body .text-n-weak {
  color: #9a3412 !important; /* orange-800 - texto laranja escuro */
}

/* Status do usuário - com cor contrastante */
.SidebarProfileMenuStatus {
  background-color: #ffedd5 !important; /* orange-100 */
  border-radius: 8px;
  margin: 8px;
  padding: 8px;
  border: 1px solid #fed7aa !important; /* orange-200 */
}

/* Item do dropdown no hover */
.DropdownContent .DropdownItem:hover,
.n-dropdown-body .DropdownItem:hover {
  background-color: #fed7aa !important; /* orange-200 */
}

/* Separador com cor contrastante */
.DropdownContent .DropdownSeparator,
.DropdownSeparator,
.n-dropdown-body .DropdownSeparator,
div.h-0.border-b {
  background-color: #fdba74 !important; /* orange-300 */
  border-color: #fdba74 !important; /* orange-300 */
  height: 1px !important;
  margin: 4px 0 !important;
}

/* Cores para os ícones */
.DropdownContent svg,
.DropdownContent svg *,
.DropdownContent [class*="i-lucide-"],
.DropdownItem svg,
.DropdownItem [class*="i-lucide-"],
.n-dropdown-body svg,
.n-dropdown-body svg *,
.n-dropdown-body [class*="i-lucide-"] {
  color: #ea580c !important; /* orange-600 - laranja médio para ícones */
  fill: #ea580c !important;
  stroke: #ea580c !important;
}

/* Seletor de disponibilidade */
.DropdownContent select,
.DropdownContent select option,
.n-dropdown-body select,
.n-dropdown-body select option {
  background-color: #ffedd5 !important; /* orange-100 */
  color: #9a3412 !important; /* orange-800 */
  border-color: #fdba74 !important; /* orange-300 */
}

/* Checkboxes e controles específicos */
.DropdownContent input[type="checkbox"],
.n-dropdown-body input[type="checkbox"] {
  accent-color: #f97316 !important; /* orange-500 */
}

/* Resetando qualquer backdrop-blur que possa interferir */
.n-dropdown-body.backdrop-blur-\[100px\] {
  backdrop-filter: none !important;
}

/* Garantindo que o pseudo-elemento before não adicione blur */
.before\:backdrop-blur-sm::before {
  backdrop-filter: none !important;
}
</style>

<style scoped>
/* Estilo para o botão do perfil */
button.flex {
  background-color: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  transition: all 0.2s ease;
}

button.flex:hover {
  background-color: rgba(255, 255, 255, 0.3) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
}

/* Cor do texto no botão do perfil */
button.flex .text-n-slate-12,
button.flex .text-n-slate-11 {
  color: white !important;
}
</style>