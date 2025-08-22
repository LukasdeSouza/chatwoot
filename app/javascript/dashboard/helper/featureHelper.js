const FEATURE_HELP_URLS = {
  agent_bots: 'https://lpomnitech.codetech.software/ajuda',
  agents: 'https://lpomnitech.codetech.software/ajuda',
  audit_logs: 'https://lpomnitech.codetech.software/ajuda',
  campaigns: 'https://lpomnitech.codetech.software/ajuda',
  canned_responses: 'https://lpomnitech.codetech.software/ajudad',
  channel_email: 'https://lpomnitech.codetech.software/ajuda',
  channel_facebook: 'https://lpomnitech.codetech.software/ajuda',
  custom_attributes: 'https://lpomnitech.codetech.software/ajuda',
  dashboard_apps: 'https://lpomnitech.codetech.software/ajuda',
  help_center: 'https://lpomnitech.codetech.software/ajuda',
  inboxes: 'https://lpomnitech.codetech.software/ajuda',
  integrations: 'https://lpomnitech.codetech.software/ajuda',
  labels: 'https://lpomnitech.codetech.software/ajuda',
  macros: 'https://lpomnitech.codetech.software/ajuda',
  message_reply_to: 'https://lpomnitech.codetech.software/ajuda',
  reports: 'https://lpomnitech.codetech.software/ajuda',
  sla: 'https://lpomnitech.codetech.software/ajuda',
  team_management: 'https://lpomnitech.codetech.software/ajuda',
  webhook: 'https://lpomnitech.codetech.software/ajuda',
  billing: 'https://lpomnitech.codetech.software/ajuda',
};

export function getHelpUrlForFeature(featureName) {
  return FEATURE_HELP_URLS[featureName];
}
