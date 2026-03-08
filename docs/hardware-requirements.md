---
id: hardware-requirements
title: Hardware Requirements
sidebar_position: 7
---

# Hardware Requirements

This course supports multiple hardware configurations. Choose the tier that fits your
budget and learning goals.

## Learning Objectives

By reading this section, you will be able to:

- Select the appropriate hardware tier for your learning goals and budget
- Understand minimum requirements for running NVIDIA Isaac Sim
- Compare cloud vs on-premise development workflows
- Identify recommended robot platforms for the capstone project

## Tier 1: High-Performance Workstation (Full Course)

The recommended setup for running NVIDIA Isaac Sim and training RL policies locally.

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| GPU | RTX 4070 Ti (12GB VRAM) | RTX 4090 (24GB VRAM) |
| CPU | Intel i7-12700 / AMD Ryzen 7 | Intel i9-13900K / Ryzen 9 |
| RAM | 32 GB DDR5 | 64 GB DDR5 |
| Storage | 512 GB NVMe SSD | 2 TB NVMe SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

**Estimated cost**: $2,000–$4,000

```bash
# Check your GPU compatibility for Isaac Sim
nvidia-smi
# Minimum: CUDA 11.8+, Driver 525+
# Recommended: CUDA 12.x, Driver 545+

# Check VRAM
nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits
# Should output: 12288 or higher (12 GB minimum)
```

## Tier 2: Economy Student Kit (~$700)

An affordable setup using NVIDIA Jetson for edge AI development.

| Component | Specification | Price (approx.) |
|-----------|---------------|-----------------|
| NVIDIA Jetson Orin Nano 8GB | ARM Cortex-A78AE, 1024-core Ampere GPU | ~$250 |
| Intel RealSense D435i | Stereo depth camera + IMU | ~$150 |
| USB Hub + Power | Powered 4-port USB hub | ~$30 |
| MicroSD + NVMe | 256GB storage | ~$50 |
| Cooling + Case | Active cooling kit | ~$40 |
| Peripherals | Monitor/keyboard (optional) | ~$150 |

**Total**: ~$670–$720

```python
# Check Jetson specs programmatically
import subprocess
result = subprocess.run(['cat', '/proc/device-tree/model'], capture_output=True, text=True)
print(result.stdout)  # e.g., "NVIDIA Jetson Orin Nano 8GB Developer Kit"

# Check JetPack version
result = subprocess.run(['cat', '/etc/nv_tegra_release'], capture_output=True, text=True)
print(result.stdout)
# Required: JetPack 6.0+ (based on Ubuntu 22.04, CUDA 12.2)
```

## Tier 3: Robot Platforms

### Option A: Unitree G1 (Full Humanoid)
- **Type**: Full-size bipedal humanoid
- **Payload**: 3 kg
- **Height**: 127 cm
- **Sensors**: Depth cameras, LiDAR, IMU
- **ROS 2**: Supported via Unitree SDK
- **Price**: ~$16,000

### Option B: Unitree Go2 (Quadruped, Learning Platform)
- **Type**: Quadruped robot dog
- **Payload**: 3 kg
- **ROS 2**: Full support via `unitree_ros2`
- **Price**: ~$1,600 (Air) – $3,200 (Pro)
- **Best for**: Navigation, SLAM, manipulation arm add-on

### Option C: Hiwonder AiArm (Desktop Arm)
- **Type**: 6-DOF robotic arm
- **Reach**: 280mm
- **Payload**: 250g
- **ROS 2**: Supported
- **Price**: ~$400
- **Best for**: Manipulation tasks, pick & place capstone

## Cloud vs On-Premise Comparison

| Factor | Cloud (Vast.ai / AWS) | On-Premise (Workstation) |
|--------|----------------------|--------------------------|
| Initial Cost | $0 (pay per use) | $2,000–$4,000 |
| Cost for Isaac Sim (8h/day, 30 days) | ~$200–$400/month | ~$15–$20/month electricity |
| Latency | High (remote display) | Zero |
| Data Privacy | External servers | Local |
| Scalability | Infinite | Single machine |
| **Recommendation** | Modules 1–3 training runs | Module 4 capstone demos |

## Software Requirements (All Tiers)

```bash
# Ubuntu 22.04 LTS (required)
lsb_release -a

# ROS 2 Humble (required for all modules)
sudo apt install ros-humble-desktop

# Python 3.10+ (required)
python3 --version

# NVIDIA Container Toolkit (for Isaac ROS)
sudo apt install nvidia-container-toolkit

# Verify CUDA
nvcc --version
```

---

[→ Assessments & Capstone Project](/docs/assessments-capstone)
