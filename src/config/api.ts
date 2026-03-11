import siteConfig from '@generated/docusaurus.config';

const HF_SPACES_URL = 'https://iqra-sohail-2025-physical-ai-humanoid-robotics-textbook.hf.space';

export const API_BASE_URL: string = (siteConfig.customFields?.apiBaseUrl as string) || HF_SPACES_URL;
