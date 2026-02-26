import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  bookSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Home',
    },
    {
      type: 'category',
      label: 'Introduction to Physical AI',
      collapsed: false,
      items: [
        'intro-physical-ai/index',
        'intro-physical-ai/week-1-2-foundations',
      ],
    },
    {
      type: 'category',
      label: 'Module 1: The Robotic Nervous System (ROS 2)',
      collapsed: true,
      items: [
        'module-1-ros2/index',
        'module-1-ros2/week-3-5-ros2-fundamentals',
      ],
    },
    {
      type: 'category',
      label: 'Module 2: The Digital Twin (Gazebo & Unity)',
      collapsed: true,
      items: [
        'module-2-gazebo-unity/index',
      ],
    },
    {
      type: 'category',
      label: 'Module 3: The AI-Robot Brain (NVIDIA Isaac)',
      collapsed: true,
      items: [
        'module-3-nvidia-isaac/index',
      ],
    },
    {
      type: 'category',
      label: 'Module 4: Vision-Language-Action (VLA)',
      collapsed: true,
      items: [
        'module-4-vla-capstone/index',
      ],
    },
    {
      type: 'doc',
      id: 'hardware-requirements',
      label: 'Hardware Requirements',
    },
    {
      type: 'doc',
      id: 'assessments-capstone',
      label: 'Assessments & Capstone',
    },
  ],
};

export default sidebars;
