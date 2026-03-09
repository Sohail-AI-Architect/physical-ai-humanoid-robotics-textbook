---
id: index
title: "Module 4: Vision-Language-Action (VLA) & Capstone"
sidebar_position: 1
---

# Module 4: Vision-Language-Action (VLA) & Capstone Project

**Weeks 11–13** | Whisper + GPT Voice-to-Action | Autonomous Humanoid Capstone

## Learning Objectives

By the end of this module, you will be able to:

- Build a **Voice-to-Action** pipeline using OpenAI Whisper + GPT-4
- Design a **VLA (Vision-Language-Action)** architecture for task execution
- Integrate natural language understanding with ROS 2 action servers
- Complete the capstone: a humanoid that responds to voice commands autonomously
- Demonstrate the full pipeline: Voice → Plan → Navigate → Grasp

## What Is Vision-Language-Action (VLA)?

VLA models are the latest frontier in robotics AI. They combine:

- **Vision**: Camera perception of the environment (object detection, pose estimation)
- **Language**: Natural language understanding of human instructions
- **Action**: Low-level robot control commands

Examples: Google's RT-2, Physical Intelligence's π0, OpenVLA.

## The Voice-to-Action Pipeline

```python
#!/usr/bin/env python3
"""
VLA Pipeline: Voice Command → GPT Plan → ROS 2 Actions
Dependencies: openai>=1.0, rclpy, sounddevice, numpy
Python 3.10+ | ROS 2 Humble
"""
import openai
import sounddevice as sd
import numpy as np
import rclpy
from rclpy.node import Node
from rclpy.action import ActionClient
from nav2_msgs.action import NavigateToPose
import json


class VLAAgent(Node):
    """Autonomous humanoid agent: voice command → plan → execute."""

    def __init__(self):
        super().__init__('vla_agent')
        self.openai_client = openai.OpenAI()
        self.nav_client = ActionClient(self, NavigateToPose, '/navigate_to_pose')
        self.get_logger().info('VLA Agent ready. Listening for voice commands...')

    def listen_for_command(self, duration: float = 5.0) -> str:
        """Record audio and transcribe using Whisper."""
        self.get_logger().info(f'Recording for {duration}s...')
        sample_rate = 16000
        audio = sd.rec(
            int(duration * sample_rate),
            samplerate=sample_rate,
            channels=1,
            dtype=np.int16
        )
        sd.wait()

        # Transcribe with Whisper
        response = self.openai_client.audio.transcriptions.create(
            model='whisper-1',
            file=('audio.wav', audio.tobytes(), 'audio/wav'),
        )
        command = response.text
        self.get_logger().info(f'Heard: "{command}"')
        return command

    def plan_with_gpt(self, command: str, world_state: dict) -> list[dict]:
        """Generate action plan from natural language command."""
        response = self.openai_client.chat.completions.create(
            model='gpt-4o-mini',
            messages=[
                {
                    'role': 'system',
                    'content': (
                        'You are a robot task planner. Given a voice command and the '
                        'current world state, output a JSON list of robot actions. '
                        'Actions: navigate_to(x, y), pick_up(object), place_at(x, y, z)'
                    )
                },
                {
                    'role': 'user',
                    'content': f'Command: "{command}"\nWorld state: {world_state}'
                }
            ],
            response_format={'type': 'json_object'},
        )
        plan = json.loads(response.choices[0].message.content)
        return plan.get('actions', [])

    def execute_plan(self, actions: list[dict]):
        """Execute planned actions via ROS 2."""
        for action in actions:
            if action['type'] == 'navigate_to':
                self.navigate_to(action['x'], action['y'])
            elif action['type'] == 'pick_up':
                self.get_logger().info(f"Picking up: {action['object']}")
                # TODO: Connect to manipulation action server
```

## Capstone Project Requirements

The final capstone demonstrates full autonomous capability:

### Task: "Pick up the cup from the table"

```
1. Voice Input  → "Pick up the cup from the table"
2. Whisper      → Transcribed text
3. GPT-4 Plan   → [navigate_to(2.5, 1.0), detect_object("cup"), pick_up("cup")]
4. ROS 2 Nav2   → Robot navigates to table
5. Computer Vision → YOLOv8 detects cup position
6. Manipulation → Arm grasps cup
7. Confirmation → TTS: "I picked up the cup"
```

### Grading Criteria

| Component | Points |
|-----------|--------|
| Voice recognition accuracy | 20 |
| Task planning (GPT output) | 20 |
| Successful navigation | 25 |
| Object detection | 20 |
| Grasp success | 15 |

---

[→ Hardware Requirements](/docs/hardware-requirements)
