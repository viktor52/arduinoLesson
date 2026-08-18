import type { AssignmentJson } from '@arduino/shared';

type CatalogEntry = AssignmentJson & { slug: string };

const BEGINNER_STARTER = `// Foundations project — write your code below.
// Use the variable names listed in "Required in Your Code".

void setup() {
  // Initialize pins and Serial here
}

void loop() {
  // Your program logic here
}
`;

export const BEGINNER_CATALOG: CatalogEntry[] = [
  {
    slug: 'basics-01-integer-variable',
    title: 'Basics 1: Integer Variables',
    objective: 'Learn how to store whole numbers. Declare an int variable called ledPin, set it to 13, and use it in pinMode to configure the built-in LED.',
    difficulty: 0,
    topic: 'Basics',
    components: ['Arduino Uno', 'Built-in LED on pin 13'],
    instructions: [
      'Declare int ledPin and assign the value 13',
      'In setup(), call pinMode(ledPin, OUTPUT)',
      'Variables store values you can reuse instead of typing numbers repeatedly',
    ],
    hint: 'Write: int ledPin = 13; then use ledPin inside pinMode().',
    starterCode: BEGINNER_STARTER,
    solutionCode: `int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);
  delay(500);
  digitalWrite(ledPin, LOW);
  delay(500);
}
`,
    testVariables: ['ledPin'],
    syntaxConcepts: ['int stores whole numbers like 0, 13, or 100', 'Use a variable name instead of repeating the same number'],
    estimatedMinutes: 8,
  },
  {
    slug: 'basics-02-const-variable',
    title: 'Basics 2: Constants with const',
    objective: 'Use const to create a value that never changes. Declare const int LED_PIN as 13 and use LED_PIN in pinMode and digitalWrite.',
    difficulty: 0,
    topic: 'Basics',
    components: ['Arduino Uno', 'LED', '220Ω resistor', 'Breadboard'],
    instructions: [
      'Declare const int LED_PIN = 13',
      'const means the value cannot be changed later — good for pin numbers',
      'Use LED_PIN in pinMode and digitalWrite',
    ],
    hint: 'const int LED_PIN = 13; creates a read-only pin number.',
    starterCode: BEGINNER_STARTER,
    solutionCode: `const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(300);
  digitalWrite(LED_PIN, LOW);
  delay(300);
}
`,
    testVariables: ['LED_PIN'],
    syntaxConcepts: ['const keeps a value fixed after you set it', 'Pin numbers are often stored as const variables'],
    estimatedMinutes: 8,
  },
  {
    slug: 'basics-03-boolean-variable',
    title: 'Basics 3: Boolean Variables',
    objective: 'Learn bool variables that store true or false. Declare bool isLedOn, set it to true, and use it to turn the LED on or off.',
    difficulty: 0,
    topic: 'Basics',
    components: ['Arduino Uno', 'Built-in LED on pin 13'],
    instructions: [
      'Declare bool isLedOn and set it to true or false',
      'Use isLedOn in an if statement to decide the LED state',
      'bool variables only hold true or false',
    ],
    hint: 'if (isLedOn) { digitalWrite(13, HIGH); } else { digitalWrite(13, LOW); }',
    starterCode: BEGINNER_STARTER,
    solutionCode: `const int LED_PIN = 13;
bool isLedOn = true;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  if (isLedOn) {
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }
  delay(500);
  isLedOn = !isLedOn;
}
`,
    testVariables: ['isLedOn'],
    syntaxConcepts: ['bool stores true or false', 'Booleans are useful for on/off states'],
    estimatedMinutes: 10,
  },
  {
    slug: 'basics-04-float-variable',
    title: 'Basics 4: Float Variables',
    objective: 'Use a float to store decimal numbers. Declare float brightness, assign a value between 0.0 and 1.0, and print it with Serial.println.',
    difficulty: 0,
    topic: 'Basics',
    components: ['Arduino Uno', 'USB cable'],
    instructions: [
      'Declare float brightness and assign a decimal value like 0.75',
      'Start Serial at 9600 baud in setup()',
      'Print brightness in loop() using Serial.println',
    ],
    hint: 'float brightness = 0.75; stores a number with a decimal point.',
    starterCode: BEGINNER_STARTER,
    solutionCode: `float brightness = 0.75;

void setup() {
  Serial.begin(9600);
}

void loop() {
  Serial.print("Brightness: ");
  Serial.println(brightness);
  delay(1000);
}
`,
    testVariables: ['brightness'],
    syntaxConcepts: ['float stores numbers with decimals', 'Use float when you need fractional values'],
    estimatedMinutes: 10,
  },
  {
    slug: 'basics-05-long-variable',
    title: 'Basics 5: Long Variables',
    objective: 'Use long for larger whole numbers. Declare long delayMs, set it to 1000, and use it inside delay() to pause the program.',
    difficulty: 0,
    topic: 'Basics',
    components: ['Arduino Uno', 'Built-in LED on pin 13'],
    instructions: [
      'Declare long delayMs and assign 1000 (one second in milliseconds)',
      'Use delayMs inside delay() instead of typing 1000 directly',
      'long can store bigger numbers than int',
    ],
    hint: 'delay(delayMs); uses your variable to control timing.',
    starterCode: BEGINNER_STARTER,
    solutionCode: `const int LED_PIN = 13;
long delayMs = 1000;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(delayMs);
  digitalWrite(LED_PIN, LOW);
  delay(delayMs);
}
`,
    testVariables: ['delayMs'],
    syntaxConcepts: ['long stores larger whole numbers', 'delay() pauses the program for milliseconds'],
    estimatedMinutes: 8,
  },
  {
    slug: 'basics-06-char-variable',
    title: 'Basics 6: Character Variables',
    objective: 'Store a single character in a char variable. Declare char statusLetter, assign a letter like \'A\', and print it over Serial.',
    difficulty: 0,
    topic: 'Basics',
    components: ['Arduino Uno', 'USB cable'],
    instructions: [
      'Declare char statusLetter and assign one character in single quotes',
      'Characters use single quotes: \'A\' not "A"',
      'Print statusLetter with Serial.println',
    ],
    hint: 'char statusLetter = \'A\'; — note the single quotes around the letter.',
    starterCode: BEGINNER_STARTER,
    solutionCode: `char statusLetter = 'A';

void setup() {
  Serial.begin(9600);
}

void loop() {
  Serial.print("Status: ");
  Serial.println(statusLetter);
  delay(1000);
}
`,
    testVariables: ['statusLetter'],
    syntaxConcepts: ['char holds a single character', 'Use single quotes for char values'],
    estimatedMinutes: 8,
  },
  {
    slug: 'basics-07-string-variable',
    title: 'Basics 7: String Variables',
    objective: 'Store text in a String variable. Declare String greeting, assign a message, and print it with Serial.println in loop().',
    difficulty: 0,
    topic: 'Basics',
    components: ['Arduino Uno', 'USB cable'],
    instructions: [
      'Declare String greeting and assign text in double quotes',
      'Start Serial in setup()',
      'Print greeting each loop iteration',
    ],
    hint: 'String greeting = "Hello Arduino"; — use double quotes for text.',
    starterCode: BEGINNER_STARTER,
    solutionCode: `String greeting = "Hello Arduino";

void setup() {
  Serial.begin(9600);
}

void loop() {
  Serial.println(greeting);
  delay(1000);
}
`,
    testVariables: ['greeting'],
    syntaxConcepts: ['String stores text (multiple characters)', 'Use double quotes for String values'],
    estimatedMinutes: 8,
  },
  {
    slug: 'basics-08-if-statement',
    title: 'Basics 8: Your First if Statement',
    objective: 'Use an if statement to run code only when a condition is true. Declare bool isOn and use if (isOn) to control the LED.',
    difficulty: 0,
    topic: 'Basics',
    components: ['Arduino Uno', 'Built-in LED on pin 13'],
    instructions: [
      'Declare bool isOn and set it to true',
      'Use if (isOn) to turn the LED on',
      'if checks a condition before running code inside the { } block',
    ],
    hint: 'if (isOn) { digitalWrite(13, HIGH); } runs only when isOn is true.',
    starterCode: BEGINNER_STARTER,
    solutionCode: `const int LED_PIN = 13;
bool isOn = true;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  if (isOn) {
    digitalWrite(LED_PIN, HIGH);
  }
  delay(500);
}
`,
    testVariables: ['isOn'],
    syntaxConcepts: ['if (condition) runs code only when condition is true', 'Curly braces { } group code inside an if block'],
    estimatedMinutes: 10,
  },
  {
    slug: 'basics-09-if-else',
    title: 'Basics 9: if-else Decisions',
    objective: 'Use if-else to choose between two paths. Read buttonState and turn the LED on when pressed, off when not pressed.',
    difficulty: 0,
    topic: 'Basics',
    components: ['Arduino Uno', 'Push button', 'LED', '10kΩ resistor', 'Breadboard'],
    instructions: [
      'Declare int buttonState and read it with digitalRead',
      'Use if-else: LED on when pressed, off when released',
      'else runs when the if condition is false',
    ],
    hint: 'With INPUT_PULLUP, LOW means pressed: if (buttonState == LOW) { ... } else { ... }',
    starterCode: BEGINNER_STARTER,
    solutionCode: `const int BUTTON_PIN = 2;
const int LED_PIN = 13;
int buttonState;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  buttonState = digitalRead(BUTTON_PIN);
  if (buttonState == LOW) {
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }
}
`,
    testVariables: ['buttonState'],
    syntaxConcepts: ['if-else picks one of two code paths', 'else runs when the if condition is false'],
    estimatedMinutes: 12,
  },
  {
    slug: 'basics-10-equals-comparison',
    title: 'Basics 10: Comparing with ==',
    objective: 'Compare values with ==. Declare int targetCount = 5 and int count; use if (count == targetCount) to detect when count reaches the target.',
    difficulty: 0,
    topic: 'Basics',
    components: ['Arduino Uno', 'USB cable'],
    instructions: [
      'Declare int targetCount = 5 and int count = 0',
      'Increment count each loop',
      'Use if (count == targetCount) to print a message when they match',
    ],
    hint: '== checks if two values are equal. Do not confuse with = which assigns a value.',
    starterCode: BEGINNER_STARTER,
    solutionCode: `int targetCount = 5;
int count = 0;

void setup() {
  Serial.begin(9600);
}

void loop() {
  count++;
  if (count == targetCount) {
    Serial.println("Target reached!");
  }
  delay(500);
}
`,
    testVariables: ['targetCount', 'count'],
    syntaxConcepts: ['== compares two values for equality', '= assigns a value to a variable'],
    estimatedMinutes: 10,
  },
  {
    slug: 'basics-11-greater-less-than',
    title: 'Basics 11: Greater Than and Less Than',
    objective: 'Compare numbers with > and <. Declare int sensorValue and use if (sensorValue > 512) to react when the value is high.',
    difficulty: 0,
    topic: 'Basics',
    components: ['Arduino Uno', 'Potentiometer', 'Breadboard'],
    instructions: [
      'Declare int sensorValue and read analog pin A0',
      'Use if (sensorValue > 512) to print "High" when above halfway',
      'Use else to print "Low" when not above 512',
    ],
    hint: '> means greater than. sensorValue > 512 is true when the reading is above 512.',
    starterCode: BEGINNER_STARTER,
    solutionCode: `int sensorValue;

void setup() {
  Serial.begin(9600);
}

void loop() {
  sensorValue = analogRead(A0);
  if (sensorValue > 512) {
    Serial.println("High");
  } else {
    Serial.println("Low");
  }
  delay(300);
}
`,
    testVariables: ['sensorValue'],
    syntaxConcepts: ['> checks if left side is greater than right', '< checks if left side is less than right'],
    estimatedMinutes: 12,
  },
  {
    slug: 'basics-12-for-loop',
    title: 'Basics 12: for Loop Basics',
    objective: 'Repeat code with a for loop. Declare int blinkTimes = 5 and use a for loop to blink the LED that many times.',
    difficulty: 0,
    topic: 'Basics',
    components: ['Arduino Uno', 'Built-in LED on pin 13'],
    instructions: [
      'Declare int blinkTimes = 5',
      'Use for (int i = 0; i < blinkTimes; i++) to repeat blinks',
      'for loops run a block of code a set number of times',
    ],
    hint: 'for (int i = 0; i < blinkTimes; i++) { ... } repeats blinkTimes times.',
    starterCode: BEGINNER_STARTER,
    solutionCode: `const int LED_PIN = 13;
int blinkTimes = 5;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  for (int i = 0; i < blinkTimes; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    delay(200);
  }
  delay(1000);
}
`,
    testVariables: ['blinkTimes'],
    syntaxConcepts: ['for (start; condition; step) repeats while condition is true', 'Loop counters like i increase each repetition'],
    estimatedMinutes: 12,
  },
  {
    slug: 'basics-13-loop-counter',
    title: 'Basics 13: Loop Counter Variable',
    objective: 'Track how many times something happened. Declare int counter, start at 0, add 1 each loop, and print counter over Serial.',
    difficulty: 0,
    topic: 'Basics',
    components: ['Arduino Uno', 'USB cable'],
    instructions: [
      'Declare int counter = 0',
      'Increase counter by 1 each loop: counter++ or counter = counter + 1',
      'Print counter with Serial.println',
    ],
    hint: 'counter++ adds 1 to counter — a common pattern for counting events.',
    starterCode: BEGINNER_STARTER,
    solutionCode: `int counter = 0;

void setup() {
  Serial.begin(9600);
}

void loop() {
  Serial.print("Count: ");
  Serial.println(counter);
  counter++;
  delay(500);
}
`,
    testVariables: ['counter'],
    syntaxConcepts: ['counter++ increases a variable by 1', 'Counters track how many times something occurred'],
    estimatedMinutes: 8,
  },
  {
    slug: 'basics-14-while-loop',
    title: 'Basics 14: while Loops',
    objective: 'Repeat code while a condition stays true. Declare int counter and maxCount; use while (counter < maxCount) to blink the LED repeatedly.',
    difficulty: 0,
    topic: 'Basics',
    components: ['Arduino Uno', 'Built-in LED on pin 13'],
    instructions: [
      'Declare int counter = 0 and int maxCount = 5',
      'Use while (counter < maxCount) to blink until counter reaches maxCount',
      'Increase counter inside the while loop',
    ],
    hint: 'while (counter < maxCount) keeps looping as long as counter is less than maxCount.',
    starterCode: BEGINNER_STARTER,
    solutionCode: `const int LED_PIN = 13;
int counter = 0;
int maxCount = 5;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  counter = 0;
  while (counter < maxCount) {
    digitalWrite(LED_PIN, HIGH);
    delay(150);
    digitalWrite(LED_PIN, LOW);
    delay(150);
    counter++;
  }
  delay(1000);
}
`,
    testVariables: ['counter', 'maxCount'],
    syntaxConcepts: ['while (condition) repeats as long as condition is true', 'Always make sure the condition can become false to avoid infinite loops'],
    estimatedMinutes: 12,
  },
  {
    slug: 'basics-15-loop-index',
    title: 'Basics 15: Loop Index Variable',
    objective: 'Use an index variable in a for loop. Declare int index and int numBlinks; use index in for (index = 0; index < numBlinks; index++) to control repeats.',
    difficulty: 0,
    topic: 'Basics',
    components: ['Arduino Uno', 'Built-in LED on pin 13'],
    instructions: [
      'Declare int numBlinks = 4',
      'Use int index in a for loop: for (index = 0; index < numBlinks; index++)',
      'The index variable tracks which repetition you are on',
    ],
    hint: 'index starts at 0 and increases by 1 each time through the loop.',
    starterCode: BEGINNER_STARTER,
    solutionCode: `const int LED_PIN = 13;
int numBlinks = 4;
int index;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  for (index = 0; index < numBlinks; index++) {
    digitalWrite(LED_PIN, HIGH);
    delay(250);
    digitalWrite(LED_PIN, LOW);
    delay(250);
  }
  delay(800);
}
`,
    testVariables: ['index', 'numBlinks'],
    syntaxConcepts: ['index tracks the current position in a loop', 'for loops often use index to count from 0 upward'],
    estimatedMinutes: 12,
  },
  {
    slug: 'basics-16-multiple-variables',
    title: 'Basics 16: Using Multiple Variables',
    objective: 'Combine several variables in one program. Declare ledPin, delayTime, and isReady; use all three to control when the LED blinks.',
    difficulty: 0,
    topic: 'Basics',
    components: ['Arduino Uno', 'Built-in LED on pin 13'],
    instructions: [
      'Declare int ledPin = 13, int delayTime = 400, and bool isReady = true',
      'Only blink the LED when isReady is true',
      'Use delayTime inside delay()',
    ],
    hint: 'Programs often use many variables together — each one stores a different piece of information.',
    starterCode: BEGINNER_STARTER,
    solutionCode: `int ledPin = 13;
int delayTime = 400;
bool isReady = true;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  if (isReady) {
    digitalWrite(ledPin, HIGH);
    delay(delayTime);
    digitalWrite(ledPin, LOW);
    delay(delayTime);
  }
}
`,
    testVariables: ['ledPin', 'delayTime', 'isReady'],
    syntaxConcepts: ['Use multiple variables to organize your program', 'Each variable should have a clear purpose'],
    estimatedMinutes: 12,
  },
  {
    slug: 'basics-17-math-variables',
    title: 'Basics 17: Math with Variables',
    objective: 'Do arithmetic with variables. Declare int numberA, int numberB, and int sum; calculate sum = numberA + numberB and print the result.',
    difficulty: 0,
    topic: 'Basics',
    components: ['Arduino Uno', 'USB cable'],
    instructions: [
      'Declare int numberA = 10 and int numberB = 25',
      'Declare int sum and set sum = numberA + numberB',
      'Print sum with Serial.println',
    ],
    hint: 'sum = numberA + numberB stores the result of adding the two numbers.',
    starterCode: BEGINNER_STARTER,
    solutionCode: `int numberA = 10;
int numberB = 25;
int sum;

void setup() {
  Serial.begin(9600);
}

void loop() {
  sum = numberA + numberB;
  Serial.print("Sum: ");
  Serial.println(sum);
  delay(1000);
}
`,
    testVariables: ['numberA', 'numberB', 'sum'],
    syntaxConcepts: ['+ - * / work with numeric variables', 'Store calculation results in a variable like sum'],
    estimatedMinutes: 10,
  },
  {
    slug: 'basics-18-if-inside-loop',
    title: 'Basics 18: if Inside a Loop',
    objective: 'Combine loops and decisions. Declare int blinkCount and use a for loop; inside the loop, use if (i % 2 == 0) to blink only on even counts.',
    difficulty: 0,
    topic: 'Basics',
    components: ['Arduino Uno', 'Built-in LED on pin 13'],
    instructions: [
      'Declare int blinkCount = 6',
      'Use a for loop from 0 to blinkCount',
      'Inside the loop, use if to check whether i is even before blinking',
    ],
    hint: 'i % 2 == 0 is true when i is even (0, 2, 4...).',
    starterCode: BEGINNER_STARTER,
    solutionCode: `const int LED_PIN = 13;
int blinkCount = 6;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  for (int i = 0; i < blinkCount; i++) {
    if (i % 2 == 0) {
      digitalWrite(LED_PIN, HIGH);
      delay(200);
      digitalWrite(LED_PIN, LOW);
      delay(200);
    }
  }
  delay(1000);
}
`,
    testVariables: ['blinkCount'],
    syntaxConcepts: ['You can put if statements inside loops', 'This lets you make different decisions on each repetition'],
    estimatedMinutes: 14,
  },
  {
    slug: 'basics-19-serial-variables',
    title: 'Basics 19: Serial and Variables',
    objective: 'Practice Serial communication with variables. Declare long baudRate, String message, and int counter; print a labeled message each loop.',
    difficulty: 0,
    topic: 'Basics',
    components: ['Arduino Uno', 'USB cable'],
    instructions: [
      'Declare long baudRate = 9600, String message = "Count", and int counter = 0',
      'Call Serial.begin(baudRate) in setup()',
      'Print message and counter, then increment counter',
    ],
    hint: 'Serial.begin(baudRate) must use your baudRate variable in setup().',
    starterCode: BEGINNER_STARTER,
    solutionCode: `long baudRate = 9600;
String message = "Count";
int counter = 0;

void setup() {
  Serial.begin(baudRate);
}

void loop() {
  Serial.print(message);
  Serial.print(": ");
  Serial.println(counter);
  counter++;
  delay(500);
}
`,
    testVariables: ['baudRate', 'message', 'counter'],
    syntaxConcepts: ['Serial.begin() starts USB communication', 'Serial.print() and Serial.println() send text to the Serial Monitor'],
    estimatedMinutes: 12,
  },
  {
    slug: 'basics-20-put-it-together',
    title: 'Basics 20: Put It All Together',
    objective: 'Combine variables, if statements, and loops. When the button is pressed, blink the LED blinkCount times using a for loop and buttonState.',
    difficulty: 0,
    topic: 'Basics',
    components: ['Arduino Uno', 'Push button', 'LED', '10kΩ resistor', 'Breadboard'],
    instructions: [
      'Declare int buttonState, int ledPin = 13, and int blinkCount = 3',
      'Read the button into buttonState',
      'When pressed, use a for loop to blink blinkCount times',
    ],
    hint: 'if (buttonState == LOW) { for (int i = 0; i < blinkCount; i++) { blink code } }',
    starterCode: BEGINNER_STARTER,
    solutionCode: `const int BUTTON_PIN = 2;
int ledPin = 13;
int buttonState;
int blinkCount = 3;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  buttonState = digitalRead(BUTTON_PIN);
  if (buttonState == LOW) {
    for (int i = 0; i < blinkCount; i++) {
      digitalWrite(ledPin, HIGH);
      delay(150);
      digitalWrite(ledPin, LOW);
      delay(150);
    }
    delay(500);
  }
}
`,
    testVariables: ['buttonState', 'ledPin', 'blinkCount'],
    syntaxConcepts: [
      'Real programs combine variables, if statements, and loops',
      'Break problems into small steps: read input, decide, repeat actions',
    ],
    estimatedMinutes: 15,
  },
];
