---
id: week-3-5-ros2-fundamentals
title: "Week 3–5: ROS 2 Architecture & Nodes"
sidebar_position: 2
---

# Week 3–5: ROS 2 Architecture, Nodes, Topics, Services & Actions

## Learning Objectives

By the end of this section, you will be able to:

- Explain the ROS 2 computational graph (nodes, topics, services, actions)
- Write a Python publisher and subscriber using `rclpy`
- Define a custom ROS 2 service and call it from Python
- Create a basic URDF file describing a robot's link-joint structure
- Launch a multi-node ROS 2 system using a launch file

## The ROS 2 Computational Graph

ROS 2 organizes robot software as a **graph** of communicating processes called **nodes**.

| Concept | Description | Example |
|---------|-------------|---------|
| **Node** | Single-purpose process | Camera driver, motion planner |
| **Topic** | Pub/sub message channel | `/camera/image_raw` |
| **Service** | Request-response call | `/robot/get_state` |
| **Action** | Long-running goal with feedback | `/navigate_to_pose` |
| **Parameter** | Runtime-configurable values | `max_velocity: 0.5` |

## Your First ROS 2 Node (Python)

```python
#!/usr/bin/env python3
"""
Minimal ROS 2 publisher node - publishes robot status messages.
ROS 2 Humble | rclpy | Python 3.10+
"""
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from builtin_interfaces.msg import Time


class RobotStatusPublisher(Node):
    def __init__(self):
        super().__init__('robot_status_publisher')

        # Create publisher on /robot/status topic with queue size 10
        self.publisher_ = self.create_publisher(String, '/robot/status', 10)

        # Publish at 1 Hz
        self.timer = self.create_timer(1.0, self.publish_status)
        self.get_logger().info('Robot Status Publisher started!')

    def publish_status(self):
        msg = String()
        msg.data = f'Robot ONLINE | Time: {self.get_clock().now().to_msg().sec}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Published: {msg.data}')


def main(args=None):
    rclpy.init(args=args)
    node = RobotStatusPublisher()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## URDF – Describing Your Robot

URDF (Unified Robot Description Format) is an XML format for defining robot structure:

```xml
<?xml version="1.0"?>
<!-- Minimal humanoid torso URDF - ROS 2 Humble compatible -->
<robot name="humanoid_minimal">

  <!-- Base/torso link -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.3 0.2 0.5"/>  <!-- 30cm wide, 20cm deep, 50cm tall torso -->
      </geometry>
      <material name="white">
        <color rgba="0.9 0.9 0.9 1.0"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.3 0.2 0.5"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="15.0"/>
      <inertia ixx="0.5" ixy="0.0" ixz="0.0" iyy="0.3" iyz="0.0" izz="0.4"/>
    </inertial>
  </link>

  <!-- Head link -->
  <link name="head_link">
    <visual>
      <geometry>
        <sphere radius="0.12"/>
      </geometry>
    </visual>
  </link>

  <!-- Neck joint connecting torso to head -->
  <joint name="neck_joint" type="revolute">
    <parent link="base_link"/>
    <child link="head_link"/>
    <origin xyz="0 0 0.31" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.57" upper="1.57" effort="10" velocity="1.0"/>
  </joint>

</robot>
```

## Launch Files

ROS 2 launch files orchestrate multiple nodes:

```python
# launch/robot_system.launch.py
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='my_robot_pkg',
            executable='status_publisher',
            name='status_pub',
            parameters=[{'publish_rate': 1.0}],
        ),
        Node(
            package='my_robot_pkg',
            executable='status_subscriber',
            name='status_sub',
        ),
    ])
```

## Practice Exercise

1. Create a ROS 2 Python package: `ros2 pkg create --build-type ament_python my_humanoid`
2. Write a publisher that sends joint angles at 10 Hz
3. Write a subscriber that logs received joint angles
4. Build and run: `colcon build && ros2 launch my_humanoid joints.launch.py`

---

[→ Next Module: Module 2 – The Digital Twin (Gazebo & Unity)](/module-2-gazebo-unity)
