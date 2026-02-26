---
id: index
title: "Module 3: The AI-Robot Brain (NVIDIA Isaac)"
sidebar_position: 1
---

# Module 3: The AI-Robot Brain (NVIDIA Isaac)

**Weeks 8–10** | Isaac Sim, Isaac ROS, VSLAM, Nav2, and Reinforcement Learning

## Learning Objectives

By the end of this module, you will be able to:

- Set up **NVIDIA Isaac Sim** and connect it to a ROS 2 workspace
- Use **Isaac ROS** acceleration libraries for GPU-accelerated perception
- Implement **Visual SLAM (VSLAM)** for robot localization and mapping
- Configure **Nav2** for autonomous navigation in a mapped environment
- Train a basic locomotion policy using **Isaac Lab** reinforcement learning
- Understand **Sim-to-Real** transfer and domain randomization techniques

## The NVIDIA Isaac Platform

NVIDIA Isaac is a complete robotics development platform:

| Component | Purpose |
|-----------|---------|
| **Isaac Sim** | Photorealistic robot simulation (built on Omniverse) |
| **Isaac ROS** | GPU-accelerated ROS 2 perception packages |
| **Isaac Lab** | Reinforcement learning training environment |
| **Isaac Perceptor** | Multi-camera 3D perception stack |

## Visual SLAM with Isaac ROS

VSLAM enables your robot to build a map and localize itself using only cameras
(no GPS, no external markers):

```python
# ROS 2 launch file for Isaac ROS Visual SLAM
# isaac_ros_visual_slam >= 2.0.0 | ROS 2 Humble

from launch import LaunchDescription
from launch_ros.actions import ComposableNodeContainer, Node
from launch_ros.descriptions import ComposableNode

def generate_launch_description():
    vslam_node = ComposableNode(
        name='visual_slam_node',
        package='isaac_ros_visual_slam',
        plugin='nvidia::isaac_ros::visual_slam::VisualSlamNode',
        parameters=[{
            'denoise_input_images': False,
            'rectified_images': True,
            'enable_debug_mode': False,
            'enable_slam_visualization': True,
            'enable_landmarks_view': True,
            'map_frame': 'map',
            'odom_frame': 'odom',
            'base_frame': 'base_link',
        }],
        remappings=[
            ('/stereo_camera/left/image', '/camera/left/image_rect'),
            ('/stereo_camera/right/image', '/camera/right/image_rect'),
        ],
    )

    container = ComposableNodeContainer(
        name='vslam_container',
        namespace='',
        package='rclcpp_components',
        executable='component_container_mt',
        composable_node_descriptions=[vslam_node],
        output='screen',
    )

    return LaunchDescription([container])
```

## Nav2 — Autonomous Navigation

Nav2 is the ROS 2 navigation stack. With a map from VSLAM, it enables:
- **Path planning** (A*, Dijkstra, SMAC)
- **Obstacle avoidance** (costmap layers)
- **Goal pursuit** (Pure Pursuit, DWB controller)

```bash
# Launch Nav2 with a pre-built map
ros2 launch nav2_bringup bringup_launch.py \
  map:=/path/to/map.yaml \
  params_file:=/path/to/nav2_params.yaml
```

## Reinforcement Learning with Isaac Lab

Isaac Lab enables training locomotion policies (walking gaits) in simulation:

```python
# Isaac Lab RL training configuration (simplified)
# isaaclab >= 1.0.0 | Python 3.10+

from omni.isaac.lab.envs import ManagerBasedRLEnvCfg
from omni.isaac.lab.utils import configclass

@configclass
class HumanoidWalkEnvCfg(ManagerBasedRLEnvCfg):
    """Configuration for humanoid walking task."""

    # Simulation settings
    sim: SimulationCfg = SimulationCfg(
        dt=0.005,           # 200 Hz simulation
        render_interval=4,  # Render every 4 steps
    )

    # Reward: positive for forward velocity, negative for energy use
    rewards: RewardsCfg = RewardsCfg()
    observations: ObservationsCfg = ObservationsCfg()
    actions: ActionsCfg = ActionsCfg()
```

## Domain Randomization for Sim-to-Real Transfer

Key randomization parameters for successful sim-to-real transfer:

- **Physics**: ±20% friction, mass, damping coefficients
- **Visual**: Lighting, texture, camera noise
- **Dynamics**: Motor delays, sensor noise

---

[→ Next Module: Module 4 – Vision-Language-Action (VLA)](/module-4-vla-capstone)
