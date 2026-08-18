import { AssignmentJson, MIN_LIBRARY_DIFFICULTY } from '@arduino/shared';
import { BEGINNER_CATALOG } from './beginnerCatalog';

export interface CatalogEntry extends AssignmentJson {
  slug: string;
}

export { MIN_LIBRARY_DIFFICULTY };

const TOPICS = [
  'LED',
  'Button',
  'Servo',
  'Serial',
  'Buzzer',
  'Temperature',
  'Ultrasonic',
  'Motors',
  'Loops',
  'Functions',
] as const;

type Topic = (typeof TOPICS)[number];

interface TopicTemplate {
  components: string[];
  testVariables: string[];
  syntaxConcepts: string[];
  includes?: string;
  requiresLibrary?: boolean;
  buildCodes: (difficulty: number, index: number) => {
    objective: string;
    instructions: string[];
    hint: string;
    solutionCode: string;
  };
}

/** Starter code never contains the solution — only scaffolding scaled by difficulty. */
function buildStarterCode(difficulty: number, includes = ''): string {
  if (difficulty <= 0) {
    return `${includes}// Foundations project — write your code below.
// Use the variable names listed in "Required in Your Code".

void setup() {
  // Initialize pins and Serial here
}

void loop() {
  // Your program logic here
}
`;
  }

  if (difficulty <= 2) {
    return `${includes}// Write your Arduino sketch below.
// See "Required in Your Code" for the variables you must define.

void setup() {
  // Initialize pins and Serial here
}

void loop() {
  // Main program logic here
}
`;
  }

  if (difficulty <= 5) {
    return `${includes}void setup() {

}

void loop() {

}
`;
  }

  if (difficulty <= 8) {
    return `void setup() {
}

void loop() {
}
`;
  }

  return `void setup() {}

void loop() {}
`;
}

const topicTemplates: Record<Topic, TopicTemplate> = {
  LED: {
    components: ['Arduino Uno', 'LED', '220Ω resistor', 'Breadboard', 'Jumper wires'],
    testVariables: ['LED_PIN', 'blinkDelay'],
    syntaxConcepts: ['pinMode() sets a pin as INPUT or OUTPUT', 'digitalWrite() writes HIGH or LOW', 'delay() pauses in milliseconds'],
    buildCodes: (d, i) => {
      const delay = 500 + i * 100;
      return {
        objective: `Blink an LED on pin 13 using variables LED_PIN and blinkDelay (${delay}ms).`,
        instructions: ['Connect the LED to pin 13 through a resistor', 'Define LED_PIN and blinkDelay', 'Use pinMode in setup()', 'Toggle the LED in loop() using delay(blinkDelay)'],
        hint: 'Declare LED_PIN as 13 and use it inside digitalWrite and pinMode.',
        solutionCode: `const int LED_PIN = 13;\nconst int blinkDelay = ${delay};\n\nvoid setup() {\n  pinMode(LED_PIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_PIN, HIGH);\n  delay(blinkDelay);\n  digitalWrite(LED_PIN, LOW);\n  delay(blinkDelay);\n}\n`,
      };
    },
  },
  Button: {
    components: ['Arduino Uno', 'Push button', 'LED', '10kΩ resistor', 'Breadboard'],
    testVariables: ['BUTTON_PIN', 'LED_PIN', 'buttonState'],
    syntaxConcepts: ['digitalRead() reads a button state', 'INPUT_PULLUP avoids external pull-down', 'if statements react to input'],
    buildCodes: (d, i) => ({
      objective: 'Read a button on pin 2 and control an LED using BUTTON_PIN, LED_PIN, and buttonState.',
      instructions: ['Wire the button with INPUT_PULLUP', 'Read buttonState with digitalRead', 'Turn the LED on when pressed'],
      hint: 'buttonState == LOW means pressed when using INPUT_PULLUP.',
      solutionCode: `const int BUTTON_PIN = 2;\nconst int LED_PIN = 13;\n\nvoid setup() {\n  pinMode(BUTTON_PIN, INPUT_PULLUP);\n  pinMode(LED_PIN, OUTPUT);\n}\n\nvoid loop() {\n  int buttonState = digitalRead(BUTTON_PIN);\n  digitalWrite(LED_PIN, buttonState == LOW ? HIGH : LOW);\n  delay(${50 + i * 10});\n}\n`,
    }),
  },
  Servo: {
    components: ['Arduino Uno', 'SG90 Servo', 'Jumper wires'],
    testVariables: ['SERVO_PIN', 'startAngle', 'endAngle'],
    syntaxConcepts: ['Servo library controls angle', 'servo.attach() links a pin', 'write() sets degrees 0-180'],
    includes: '#include <Servo.h>\n\n',
    requiresLibrary: true,
    buildCodes: (d, i) => ({
      objective: 'Sweep a servo using SERVO_PIN, startAngle, and endAngle.',
      instructions: ['Include the Servo library', 'Define angle variables', 'Attach and write angles in loop()'],
      hint: 'Use myServo.attach(SERVO_PIN) once in setup().',
      solutionCode: `#include <Servo.h>\n\nServo myServo;\nconst int SERVO_PIN = 9;\nconst int startAngle = ${i * 10};\nconst int endAngle = ${160 - i * 5};\n\nvoid setup() {\n  myServo.attach(SERVO_PIN);\n}\n\nvoid loop() {\n  myServo.write(startAngle);\n  delay(800);\n  myServo.write(endAngle);\n  delay(800);\n}\n`,
    }),
  },
  Serial: {
    components: ['Arduino Uno', 'USB cable'],
    testVariables: ['baudRate', 'message', 'counter'],
    syntaxConcepts: ['Serial.begin() starts communication', 'Serial.println() sends text', 'Strings store messages'],
    buildCodes: (d, i) => ({
      objective: 'Print messages over Serial using baudRate, message, and counter.',
      instructions: ['Open Serial Monitor at 9600 baud', 'Define all three variables', 'Print and increment counter each loop'],
      hint: 'Serial.begin(baudRate) must run in setup().',
      solutionCode: `const long baudRate = 9600;\nconst char* message = "Sensor reading";\nint counter = ${i};\n\nvoid setup() {\n  Serial.begin(baudRate);\n}\n\nvoid loop() {\n  Serial.print(message);\n  Serial.print(": ");\n  Serial.println(counter);\n  counter++;\n  delay(500);\n}\n`,
    }),
  },
  Buzzer: {
    components: ['Arduino Uno', 'Piezo buzzer', '220Ω resistor'],
    testVariables: ['BUZZER_PIN', 'toneFrequency', 'toneDuration'],
    syntaxConcepts: ['tone() generates a frequency on a pin', 'noTone() stops the sound', 'delay() controls note length'],
    buildCodes: (d, i) => {
      const freq = 440 + i * 50;
      return {
        objective: `Play a ${freq}Hz tone using BUZZER_PIN, toneFrequency, and toneDuration.`,
        instructions: ['Connect buzzer to pin 8', 'Define frequency and duration variables', 'Use tone() in loop()'],
        hint: 'tone(BUZZER_PIN, toneFrequency, toneDuration) plays the note.',
        solutionCode: `const int BUZZER_PIN = 8;\nconst int toneFrequency = ${freq};\nconst int toneDuration = 400;\n\nvoid setup() {\n  pinMode(BUZZER_PIN, OUTPUT);\n}\n\nvoid loop() {\n  tone(BUZZER_PIN, toneFrequency, toneDuration);\n  delay(toneDuration + 100);\n  noTone(BUZZER_PIN);\n  delay(300);\n}\n`,
      };
    },
  },
  Temperature: {
    components: ['Arduino Uno', 'TMP36 sensor', 'Breadboard'],
    testVariables: ['TEMP_PIN', 'sensorValue', 'voltage', 'tempC'],
    syntaxConcepts: ['analogRead() reads 0-1023', 'map() or math converts to Celsius', 'float stores decimals'],
    buildCodes: (d, i) => ({
      objective: 'Read temperature using TEMP_PIN, sensorValue, voltage, and tempC.',
      instructions: ['Connect TMP36 to A0', 'Read analog value into sensorValue', 'Convert to tempC and print'],
      hint: 'tempC = (voltage - 0.5) * 100.0 for TMP36 sensors.',
      solutionCode: `const int TEMP_PIN = A0;\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int sensorValue = analogRead(TEMP_PIN);\n  float voltage = sensorValue * (5.0 / 1023.0);\n  float tempC = (voltage - 0.5) * 100.0;\n  Serial.print("Temp ${i}: ");\n  Serial.println(tempC);\n  delay(800);\n}\n`,
    }),
  },
  Ultrasonic: {
    components: ['Arduino Uno', 'HC-SR04', 'Jumper wires'],
    testVariables: ['TRIG_PIN', 'ECHO_PIN', 'duration', 'distanceCm'],
    syntaxConcepts: ['pulseIn() measures echo time', 'digitalWrite triggers ultrasonic pulse', 'distance = duration * 0.034 / 2'],
    buildCodes: (d, i) => ({
      objective: 'Measure distance with TRIG_PIN, ECHO_PIN, duration, and distanceCm.',
      instructions: ['Wire TRIG to pin 7 and ECHO to pin 8', 'Send a 10µs trigger pulse', 'Calculate distanceCm from duration'],
      hint: 'distanceCm = duration * 0.034 / 2 converts microseconds to centimeters.',
      solutionCode: `const int TRIG_PIN = 7;\nconst int ECHO_PIN = 8;\n\nvoid setup() {\n  pinMode(TRIG_PIN, OUTPUT);\n  pinMode(ECHO_PIN, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  digitalWrite(TRIG_PIN, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG_PIN, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG_PIN, LOW);\n  long duration = pulseIn(ECHO_PIN, HIGH);\n  float distanceCm = duration * 0.034 / 2;\n  Serial.print("Distance ${i}: ");\n  Serial.println(distanceCm);\n  delay(${400 + i * 20});\n}\n`,
    }),
  },
  Motors: {
    components: ['Arduino Uno', 'DC motor', 'L293D driver', 'Power supply'],
    testVariables: ['MOTOR_PIN', 'motorSpeed', 'spinDirection'],
    syntaxConcepts: ['analogWrite() sets PWM speed 0-255', 'digitalWrite() sets direction', 'H-bridge drivers control motors'],
    buildCodes: (d, i) => {
      const speed = 120 + i * 10;
      return {
        objective: `Run a motor at speed ${speed} using MOTOR_PIN, motorSpeed, and spinDirection.`,
        instructions: ['Connect motor through driver to pin 5', 'Define speed and direction variables', 'Use analogWrite for PWM control'],
        hint: 'motorSpeed should be between 0 and 255 for PWM.',
        solutionCode: `const int MOTOR_PIN = 5;\nconst int motorSpeed = ${speed};\nconst int spinDirection = HIGH;\n\nvoid setup() {\n  pinMode(MOTOR_PIN, OUTPUT);\n}\n\nvoid loop() {\n  analogWrite(MOTOR_PIN, motorSpeed);\n  delay(1500);\n  analogWrite(MOTOR_PIN, 0);\n  delay(500);\n}\n`,
      };
    },
  },
  Loops: {
    components: ['Arduino Uno', '3x LEDs', '220Ω resistors'],
    testVariables: ['ledPins', 'numLeds', 'delayMs', 'index'],
    syntaxConcepts: ['for loops repeat code', 'arrays store multiple pin numbers', 'sizeof calculates array length'],
    buildCodes: (d, i) => ({
      objective: 'Blink multiple LEDs using ledPins[], numLeds, delayMs, and index.',
      instructions: ['Create an array of LED pin numbers', 'Use for loops with index', 'Blink each LED for delayMs'],
      hint: 'Access each pin as ledPins[index] inside your loop.',
      solutionCode: `const int ledPins[] = {2, 3, 4, ${5 + (i % 3)}};\nconst int numLeds = ${3 + (i % 2)};\nconst int delayMs = ${200 + i * 30};\n\nvoid setup() {\n  for (int index = 0; index < numLeds; index++) {\n    pinMode(ledPins[index], OUTPUT);\n  }\n}\n\nvoid loop() {\n  for (int index = 0; index < numLeds; index++) {\n    digitalWrite(ledPins[index], HIGH);\n    delay(delayMs);\n    digitalWrite(ledPins[index], LOW);\n  }\n}\n`,
    }),
  },
  Functions: {
    components: ['Arduino Uno', 'LED', 'Push button'],
    testVariables: ['LED_PIN', 'BUTTON_PIN', 'blinkCount', 'blinkLed'],
    syntaxConcepts: ['Functions group reusable code', 'Parameters pass values', 'Return types optional for void functions'],
    buildCodes: (d, i) => ({
      objective: 'Create a blinkLed function using LED_PIN, BUTTON_PIN, blinkCount, and blinkLed.',
      instructions: ['Define pin constants', 'Write blinkLed to blink a given number of times', 'Call it when the button is pressed'],
      hint: 'void blinkLed(int times) { ... } is a reusable function.',
      solutionCode: `const int LED_PIN = 13;\nconst int BUTTON_PIN = 2;\nconst int blinkCount = ${2 + (i % 4)};\n\nvoid setup() {\n  pinMode(LED_PIN, OUTPUT);\n  pinMode(BUTTON_PIN, INPUT_PULLUP);\n}\n\nvoid blinkLed(int times) {\n  for (int i = 0; i < times; i++) {\n    digitalWrite(LED_PIN, HIGH);\n    delay(150);\n    digitalWrite(LED_PIN, LOW);\n    delay(150);\n  }\n}\n\nvoid loop() {\n  if (digitalRead(BUTTON_PIN) == LOW) {\n    blinkLed(blinkCount);\n    delay(300);\n  }\n}\n`,
    }),
  },
};

function topicRequiresLibrary(template: TopicTemplate): boolean {
  return !!template.requiresLibrary || !!template.includes?.includes('#include');
}

export function topicNameRequiresLibrary(topic: string): boolean {
  const match = TOPICS.find((t) => t.toLowerCase() === topic.toLowerCase());
  if (!match) return false;
  return topicRequiresLibrary(topicTemplates[match]);
}

export function catalogEntryRequiresLibrary(entry: CatalogEntry): boolean {
  return /#include\s*[<"]/.test(entry.starterCode) || /#include\s*[<"]/.test(entry.solutionCode);
}

function buildCatalogEntry(difficulty: number, topicIndex: number): CatalogEntry {
  const topic = TOPICS[topicIndex];
  const template = topicTemplates[topic];
  const codes = template.buildCodes(difficulty, topicIndex);
  const variant = topicIndex + 1;

  return {
    slug: `difficulty-${difficulty}-${topic.toLowerCase()}-${variant}`,
    title: `${topic} Challenge ${variant} (Level ${difficulty})`,
    objective: codes.objective,
    difficulty,
    topic,
    components: template.components,
    instructions: codes.instructions,
    hint: codes.hint,
    starterCode: buildStarterCode(difficulty, template.includes),
    solutionCode: codes.solutionCode,
    testVariables: template.testVariables,
    syntaxConcepts: template.syntaxConcepts,
    estimatedMinutes: Math.max(5, difficulty * 4 + topicIndex),
  };
}

export const ASSIGNMENT_CATALOG: CatalogEntry[] = [...BEGINNER_CATALOG];

for (let difficulty = 1; difficulty <= 10; difficulty++) {
  for (let topicIndex = 0; topicIndex < 10; topicIndex++) {
    const template = topicTemplates[TOPICS[topicIndex]];
    if (topicRequiresLibrary(template) && difficulty < MIN_LIBRARY_DIFFICULTY) continue;
    ASSIGNMENT_CATALOG.push(buildCatalogEntry(difficulty, topicIndex));
  }
}

function filterPoolForDifficulty(pool: CatalogEntry[], difficulty: number): CatalogEntry[] {
  if (difficulty >= MIN_LIBRARY_DIFFICULTY) return pool;
  return pool.filter((a) => !catalogEntryRequiresLibrary(a));
}

export function getCatalogByDifficulty(difficulty: number): CatalogEntry[] {
  return filterPoolForDifficulty(
    ASSIGNMENT_CATALOG.filter((a) => a.difficulty === difficulty),
    difficulty
  );
}

export function getCatalogAssignment(
  difficulty: number,
  topic?: string,
  excludeSlugs: string[] = []
): CatalogEntry {
  let pool = getCatalogByDifficulty(difficulty).filter((a) => !excludeSlugs.includes(a.slug));

  if (topic && topic !== 'Random challenge') {
    const topicPool = pool.filter(
      (a) => a.topic?.toLowerCase() === topic.toLowerCase()
    );
    if (topicPool.length > 0) pool = topicPool;
  }

  if (pool.length === 0) {
    pool = getCatalogByDifficulty(difficulty);
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

export function getCatalogBySlug(slug: string): CatalogEntry | undefined {
  return ASSIGNMENT_CATALOG.find((a) => a.slug === slug);
}

export function catalogEntryToAssignmentJson(entry: CatalogEntry): AssignmentJson {
  const { slug: _slug, ...assignment } = entry;
  return assignment;
}
