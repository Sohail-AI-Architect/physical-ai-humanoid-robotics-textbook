---
id: index
title: "Module 2: The Digital Twin (Gazebo & Unity)"
sidebar_position: 1
---

# Module 2: The Digital Twin (Gazebo & Unity)

**Weeks 6–7** | Physics Simulation, URDF/SDF, and High-Fidelity HRI

## Learning Objectives

By the end of this module, you will be able to:

- Explain what a **Digital Twin** is and why it's essential for safe robot development
- Launch a Gazebo simulation of a humanoid robot from a URDF/SDF file
- Configure sensors (cameras, LiDAR) in a Gazebo world
- Use Unity's Robotics Hub for high-fidelity Human-Robot Interaction (HRI) simulation
- Understand **Sim-to-Real transfer** challenges and mitigation strategies

## What Is a Digital Twin?

A Digital Twin is a high-fidelity virtual replica of a physical robot and its environment.
It enables:

- **Safe testing**: Crash your robot virtually, not physically (robots are expensive!)
- **Parallel development**: Software teams work while hardware is being manufactured
- **Dataset generation**: Generate millions of training images without a physical camera
- **Regression testing**: Ensure software changes don't break existing behaviors

## Gazebo vs Unity

| Feature | Gazebo (Harmonic) | Unity (Robotics Hub) |
|---------|-------------------|---------------------|
| Physics Engine | ODE/Bullet/DART | PhysX |
| ROS 2 Integration | Native | via ros-tcp-endpoint |
| Visual Fidelity | Medium | Very High |
| Sensor Simulation | Excellent | Good |
| Best For | ROS 2 development | HRI, perception datasets |

## URDF to SDF

Gazebo uses SDF (Simulation Description Format), which extends URDF with physics
properties:

```xml
<!-- SDF world file with robot and physics - Gazebo Harmonic compatible -->
<?xml version="1.0"?>
<sdf version="1.9">
  <world name="humanoid_lab">

    <!-- Physics settings -->
    <physics name="1ms" type="ignored">
      <max_step_size>0.001</max_step_size>  <!-- 1ms timestep -->
      <real_time_factor>1.0</real_time_factor>
    </physics>

    <!-- Ground plane -->
    <model name="ground_plane">
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry><plane><normal>0 0 1</normal></plane></geometry>
        </collision>
        <visual name="visual">
          <geometry><plane><normal>0 0 1</normal><size>100 100</size></plane></geometry>
        </visual>
      </link>
    </model>

    <!-- Include robot from URDF/SDF -->
    <include>
      <uri>file://path/to/humanoid.sdf</uri>
      <pose>0 0 1.0 0 0 0</pose>  <!-- Spawn 1m above ground -->
    </include>

  </world>
</sdf>
```

## Practice Exercise

1. Install Gazebo Harmonic: `sudo apt install gz-harmonic`
2. Convert your URDF to SDF: `gz sdf -p my_humanoid.urdf > my_humanoid.sdf`
3. Launch simulation: `gz sim my_world.sdf`
4. Connect ROS 2: `ros2 launch ros_gz_sim gz_sim.launch.py`

---

[→ Next Module: Module 3 – The AI-Robot Brain (NVIDIA Isaac)](/docs/module-3-nvidia-isaac)
