---
id: week-1-2-foundations
title: "Week 1–2: Foundations of Physical AI"
sidebar_position: 2
---

# Week 1–2: Foundations of Physical AI & Embodied Intelligence

## Learning Objectives

By the end of this section, you will be able to:

- Define Physical AI and distinguish it from purely digital AI systems
- Explain the concept of **Embodied Intelligence** and why it matters for robotics
- Identify key sensor modalities used in humanoid robots (LiDAR, cameras, IMUs, F/T sensors)
- Explain why the humanoid form factor is strategically important for real-world deployment
- Describe the basic perception-reasoning-action loop of a robotic agent

## What Is Embodied Intelligence?

Embodied Intelligence is the idea that true intelligence cannot exist independently of a
physical body interacting with the world. Humans learn by touching, moving, and manipulating
objects — not just by reading about them. Robots with embodied intelligence learn similarly.

Key insight: **The world is the best model of itself.** Instead of building a perfect
internal simulation, an embodied agent continuously queries the real world through sensors
and updates its beliefs in real time.

## Why Humanoids?

The world is built for humans — doorknobs at hand height, stairs at human stride length,
tools designed for human hands. A humanoid robot can:

- Navigate human-scale environments without modification
- Use existing tools and infrastructure
- Collaborate naturally alongside human workers
- Generalize learned behaviors across diverse tasks

Major investments from Boston Dynamics (Atlas), Figure AI, Agility Robotics (Digit),
and Tesla (Optimus) reflect the industrial confidence in humanoid robotics.

## Sensor Systems Overview

| Sensor | Type | Use Case |
|--------|------|----------|
| RGB Camera | Visual | Object detection, face recognition, navigation |
| Depth Camera (RealSense, ZED) | Visual+Depth | 3D mapping, obstacle avoidance |
| LiDAR | Laser Range | Precise mapping, SLAM |
| IMU (Inertial Measurement Unit) | Inertial | Balance, orientation, fall detection |
| Force/Torque (F/T) Sensors | Tactile | Grasping, contact force control |
| Microphone Array | Audio | Voice commands, sound localization |

## The Perception-Reasoning-Action Loop

```python
# Simplified Physical AI agent loop (conceptual)
import rclpy
from rclpy.node import Node

class PhysicalAIAgent(Node):
    def __init__(self):
        super().__init__('physical_ai_agent')
        self.sensor_sub = self.create_subscription(
            SensorData, '/sensors/all', self.perception_callback, 10
        )
        self.action_pub = self.create_publisher(
            ActionCommand, '/robot/action', 10
        )

    def perception_callback(self, sensor_data):
        # 1. PERCEIVE: Process raw sensor data
        world_state = self.perceive(sensor_data)

        # 2. REASON: Plan next action
        action = self.reason(world_state)

        # 3. ACT: Execute in the physical world
        self.action_pub.publish(action)
```

## Key Concepts Review

:::tip Key Concept
**Embodied Intelligence** = AI + Physical Body + Real-World Interaction.
The body is not just a container for the AI — it is integral to how intelligence develops
and operates.
:::

The three pillars of Physical AI:
1. **Sensing** — Rich, multi-modal perception of the physical world
2. **World Modeling** — Maintaining an internal representation of the environment
3. **Closed-Loop Control** — Continuous feedback between sensing and acting

---

[→ Next Module: Module 1 – The Robotic Nervous System (ROS 2)](/docs/module-1-ros2)
