---
id: assessments-capstone
title: Assessments & Capstone Project
sidebar_position: 8
---

# Assessments & Capstone Project

## Learning Objectives

By the end of this section, you will understand:

- The weekly assessment structure and how it contributes to your grade
- Lab assignment requirements for each module
- The complete capstone project specification and grading rubric
- Submission deadlines and evaluation criteria

## Weekly Assessment Structure

Each week includes a short quiz (10 questions, 15 minutes) covering:
- Core concepts from the week's lectures
- Code comprehension questions (read a ROS 2 node, identify what it does)
- Short answer: "Explain the difference between a ROS 2 Topic and a Service"

### Quiz Grading

| Component | Weight |
|-----------|--------|
| Weekly Quizzes (13 × 5 pts) | 65 pts |
| Lab Assignments (4 modules) | 100 pts |
| Final Capstone Project | 150 pts |
| Participation | 35 pts |
| **Total** | **350 pts** |

## Lab Assignments

### Lab 1: ROS 2 Publisher-Subscriber (Module 1)

**Objective**: Build a complete ROS 2 workspace with:
- A sensor data publisher (joint states at 50 Hz)
- A data processor subscriber (moving average filter)
- A custom URDF of a 2-DOF arm

```bash
# Expected workspace structure
my_humanoid_ws/
├── src/
│   └── my_robot_pkg/
│       ├── my_robot_pkg/
│       │   ├── joint_publisher.py
│       │   └── joint_subscriber.py
│       ├── urdf/
│       │   └── two_dof_arm.urdf
│       └── launch/
│           └── robot.launch.py
├── install/
└── build/
```

**Grading**:
- Publisher runs without errors: 10 pts
- Subscriber logs averaged data: 10 pts
- URDF loads in RViz2: 5 pts

### Lab 2: Gazebo Simulation (Module 2)

**Objective**: Spawn your URDF in Gazebo Harmonic, attach a simulated camera, and
visualize the camera feed in RViz2.

**Grading**: Simulation runs + camera stream visible: 25 pts

### Lab 3: Nav2 Navigation (Module 3)

**Objective**: Use Isaac ROS VSLAM to map a simulated room (Isaac Sim), then navigate
to 3 waypoints autonomously using Nav2.

**Grading**:
- SLAM map generated: 10 pts
- All 3 waypoints reached: 15 pts

### Lab 4: VLA Pipeline Prototype (Module 4)

**Objective**: Build a minimal VLA pipeline that accepts a typed text command (no audio
hardware required) and generates a ROS 2 action sequence using GPT-4o-mini.

**Grading**: Command → Plan → ROS 2 action execution: 25 pts

## Final Capstone Project

### "Autonomous Humanoid Assistant"

Build a system where:
1. A user speaks: **"Go to the table and pick up the red cup"**
2. Whisper transcribes the command
3. GPT-4 generates an action plan
4. The robot (simulation or physical) navigates to the table
5. Computer vision detects and localizes the cup
6. The robot arm grasps the cup
7. The robot returns to home position and announces completion

### Capstone Grading Rubric (150 pts)

| Component | Max Points | Passing Threshold |
|-----------|-----------|------------------|
| Voice recognition & transcription | 20 | 14 |
| GPT task planning (valid JSON output) | 25 | 17 |
| Robot navigation to target | 30 | 20 |
| Object detection accuracy | 25 | 17 |
| Successful grasp | 25 | 17 |
| Demo video (90 seconds, clear narration) | 15 | 10 |
| Code quality & documentation | 10 | 7 |

### Submission Requirements

1. **GitHub repository** — clean, with README and live deployment link
2. **90-second demo video** — narrated screen/robot recording
3. **Written report** (500 words) — architecture decisions, challenges, lessons learned
4. **Live demo** (optional) — synchronous presentation for bonus 10 pts

### Deadlines

- Lab 1: End of Week 5
- Lab 2: End of Week 7
- Lab 3: End of Week 10
- Lab 4: End of Week 12
- Capstone: End of Week 13 (Final Day)

---

**Congratulations on completing the Physical AI & Humanoid Robotics curriculum!**

You now have the foundations to build, program, and deploy autonomous humanoid robot
systems using the latest AI tools and robotics frameworks.
