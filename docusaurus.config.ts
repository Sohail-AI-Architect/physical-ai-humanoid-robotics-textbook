import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Physical AI & Humanoid Robotics',
  tagline: 'From Digital Brain to Embodied Humanoid Intelligence',
  favicon: 'img/favicon.ico',

  url: 'https://sohail-ai-architect.github.io',
  baseUrl: '/physical-ai-humanoid-robotics-textbook/',

  organizationName: 'Sohail-AI-Architect',
  projectName: 'physical-ai-humanoid-robotics-textbook',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: 'https://github.com/Sohail-AI-Architect/physical-ai-humanoid-robotics-textbook/edit/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Physical AI',
      logo: {
        alt: 'Physical AI & Humanoid Robotics',
        src: 'img/logo.svg',
        style: {height: '28px', width: 'auto'},
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'bookSidebar',
          position: 'left',
          label: 'Course',
        },
        {
          to: '/hardware-requirements',
          label: 'Hardware',
          position: 'left',
        },
        {
          to: '/assessments-capstone',
          label: 'Capstone',
          position: 'left',
        },
        {
          href: 'https://github.com/Sohail-AI-Architect/physical-ai-humanoid-robotics-textbook',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Course',
          items: [
            {label: 'Introduction', to: '/intro-physical-ai'},
            {label: 'Module 1: ROS 2', to: '/module-1-ros2'},
            {label: 'Module 2: Gazebo & Unity', to: '/module-2-gazebo-unity'},
            {label: 'Module 3: NVIDIA Isaac', to: '/module-3-nvidia-isaac'},
            {label: 'Module 4: VLA & Capstone', to: '/module-4-vla-capstone'},
          ],
        },
        {
          title: 'Resources',
          items: [
            {label: 'Hardware Requirements', to: '/hardware-requirements'},
            {label: 'Assessments & Capstone', to: '/assessments-capstone'},
          ],
        },
        {
          title: 'Links',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/Sohail-AI-Architect/physical-ai-humanoid-robotics-textbook',
            },
            {
              label: 'Panaversity',
              href: 'https://panaversity.org',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Panaversity. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['python', 'bash', 'yaml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
