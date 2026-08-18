export interface SyntaxQuestion {
  id: string;
  order: number;
  category: string;
  prompt: string;
  hint: string;
  patterns: string[];
  failureHint?: string;
}

function escRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function q(
  order: number,
  category: string,
  prompt: string,
  pattern: string,
  hint: string,
  failureHint?: string
): SyntaxQuestion {
  return {
    id: `syntax-${String(order).padStart(3, '0')}`,
    order,
    category,
    prompt,
    patterns: [pattern],
    hint,
    failureHint,
  };
}

export function buildSyntaxQuestions(): SyntaxQuestion[] {
  const questions: SyntaxQuestion[] = [];
  let order = 1;

  const intNames = [
    'ledPin', 'counter', 'speed', 'brightness', 'buttonPin', 'sensorValue', 'delayMs',
    'maxCount', 'index', 'score', 'level', 'attempts', 'pinNumber', 'motorSpeed', 'reading',
    'blinkCount', 'numLeds', 'targetCount', 'sum', 'numberA', 'numberB', 'tempValue',
    'lightLevel', 'potValue', 'distance', 'pulseWidth', 'rpm', 'steps', 'ticks', 'offset',
    'minValue', 'maxValue', 'threshold', 'sampleRate', 'baudRate',
  ];
  for (let i = 0; i < 35 && i < intNames.length; i++) {
    const name = intNames[i];
    const value = i + 1;
    questions.push(
      q(
        order++,
        'Variables',
        `Declare an integer variable named ${name} and assign it the value ${value}.`,
        `^int\\s+${escRegex(name)}\\s*=\\s*${value}\\s*;?\\s*$`,
        `Type: int ${name} = ${value};`,
        `Use the format: int ${name} = ${value};`
      )
    );
  }

  const constNames = [
    'LED_PIN', 'BUTTON_PIN', 'BUZZER_PIN', 'SERVO_PIN', 'MOTOR_PIN', 'TRIG_PIN', 'ECHO_PIN',
    'TEMP_PIN', 'ANALOG_PIN', 'PWM_PIN', 'RED_PIN', 'GREEN_PIN', 'BLUE_PIN', 'RELAY_PIN',
    'SENSOR_PIN', 'STATUS_PIN', 'ENABLE_PIN', 'CLOCK_PIN', 'DATA_PIN', 'CHIP_SELECT',
  ];
  const constPins = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 0; i < 20; i++) {
    const name = constNames[i];
    const pin = constPins[i];
    questions.push(
      q(
        order++,
        'Variables',
        `Declare a constant integer ${name} set to pin ${pin}.`,
        `^const\\s+int\\s+${escRegex(name)}\\s*=\\s*${pin}\\s*;?\\s*$`,
        `const keeps the value fixed: const int ${name} = ${pin};`,
        `Use: const int ${name} = ${pin};`
      )
    );
  }

  const boolNames = [
    'isOn', 'isReady', 'isPressed', 'ledState', 'motorRunning', 'alarmActive', 'doorOpen',
    'isDark', 'isHot', 'buttonHeld', 'blinkEnabled', 'sensorTriggered', 'flagSet', 'isEven', 'isValid',
  ];
  const boolValues = [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true];
  for (let i = 0; i < 15; i++) {
    const name = boolNames[i];
    const val = boolValues[i] ? 'true' : 'false';
    questions.push(
      q(
        order++,
        'Variables',
        `Declare a boolean variable ${name} and set it to ${val}.`,
        `^bool\\s+${escRegex(name)}\\s*=\\s*${val}\\s*;?\\s*$`,
        `Booleans are only true or false: bool ${name} = ${val};`,
        `Use: bool ${name} = ${val};`
      )
    );
  }

  const floatPairs: Array<[string, string]> = [
    ['brightness', '0.5'], ['voltage', '3.3'], ['tempC', '22.5'], ['ratio', '0.75'],
    ['speedFactor', '1.25'], ['alpha', '0.1'], ['beta', '2.0'], ['gain', '1.5'],
    ['offset', '0.05'], ['scale', '100.0'], ['percent', '87.5'], ['reading', '4.2'],
    ['sensorReading', '1.8'], ['target', '3.14'], ['threshold', '2.5'],
  ];
  for (const [name, value] of floatPairs) {
    questions.push(
      q(
        order++,
        'Variables',
        `Declare a float variable ${name} with value ${value}.`,
        `^float\\s+${escRegex(name)}\\s*=\\s*${escRegex(value)}\\s*;?\\s*$`,
        `Floats hold decimal numbers: float ${name} = ${value};`,
        `Use: float ${name} = ${value};`
      )
    );
  }

  const longPairs: Array<[string, number]> = [
    ['delayMs', 1000], ['interval', 500], ['timeout', 3000], ['period', 2000],
    ['timestamp', 60000], ['duration', 1500], ['pauseTime', 250], ['waitTime', 750],
  ];
  for (const [name, value] of longPairs) {
    questions.push(
      q(
        order++,
        'Variables',
        `Declare a long variable ${name} set to ${value}.`,
        `^long\\s+${escRegex(name)}\\s*=\\s*${value}\\s*;?\\s*$`,
        `long stores larger whole numbers: long ${name} = ${value};`,
        `Use: long ${name} = ${value};`
      )
    );
  }

  const charPairs: Array<[string, string]> = [
    ['grade', 'A'], ['status', 'X'], ['mode', 'R'], ['label', 'L'],
    ['marker', 'M'], ['unit', 'C'], ['flag', 'F'],
  ];
  for (const [name, ch] of charPairs) {
    questions.push(
      q(
        order++,
        'Variables',
        `Declare a char variable ${name} with the character '${ch}'.`,
        `^char\\s+${escRegex(name)}\\s*=\\s*'${escRegex(ch)}'\\s*;?\\s*$`,
        `Characters use single quotes: char ${name} = '${ch}';`,
        `Use: char ${name} = '${ch}';`
      )
    );
  }

  const stringMsgs = [
    'Hello', 'Ready', 'Start', 'Done', 'Error', 'OK', 'Sensor', 'Count', 'Value', 'Status',
  ];
  for (const msg of stringMsgs) {
    questions.push(
      q(
        order++,
        'Variables',
        `Declare a String variable message with the text "${msg}".`,
        `^String\\s+message\\s*=\\s*"${escRegex(msg)}"\\s*;?\\s*$`,
        `String text uses double quotes: String message = "${msg}";`,
        `Use: String message = "${msg}";`
      )
    );
  }

  const outputPins = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 13, 12, 11];
  for (const pin of outputPins) {
    questions.push(
      q(
        order++,
        'Pins',
        `Configure pin ${pin} as an OUTPUT using pinMode.`,
        `^pinMode\\s*\\(\\s*${pin}\\s*,\\s*OUTPUT\\s*\\)\\s*;?\\s*$`,
        `pinMode sets direction: pinMode(${pin}, OUTPUT);`,
        `Use: pinMode(${pin}, OUTPUT);`
      )
    );
  }

  const inputPins = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  for (const pin of inputPins) {
    questions.push(
      q(
        order++,
        'Pins',
        `Configure pin ${pin} as INPUT_PULLUP using pinMode.`,
        `^pinMode\\s*\\(\\s*${pin}\\s*,\\s*INPUT_PULLUP\\s*\\)\\s*;?\\s*$`,
        `INPUT_PULLUP enables the internal pull-up resistor: pinMode(${pin}, INPUT_PULLUP);`,
        `Use: pinMode(${pin}, INPUT_PULLUP);`
      )
    );
  }

  const writeHighPins = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
  for (const pin of writeHighPins) {
    questions.push(
      q(
        order++,
        'Pins',
        `Turn pin ${pin} ON by writing HIGH with digitalWrite.`,
        `^digitalWrite\\s*\\(\\s*${pin}\\s*,\\s*HIGH\\s*\\)\\s*;?\\s*$`,
        `digitalWrite sets output level: digitalWrite(${pin}, HIGH);`,
        `Use: digitalWrite(${pin}, HIGH);`
      )
    );
  }

  const writeLowPins = [13, 12, 11, 10, 8, 7, 6, 5];
  for (const pin of writeLowPins) {
    questions.push(
      q(
        order++,
        'Pins',
        `Turn pin ${pin} OFF by writing LOW with digitalWrite.`,
        `^digitalWrite\\s*\\(\\s*${pin}\\s*,\\s*LOW\\s*\\)\\s*;?\\s*$`,
        `LOW turns the output off: digitalWrite(${pin}, LOW);`,
        `Use: digitalWrite(${pin}, LOW);`
      )
    );
  }

  const readPins = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  for (const pin of readPins) {
    questions.push(
      q(
        order++,
        'Pins',
        `Read the button on pin ${pin} into a variable named buttonState.`,
        `^int\\s+buttonState\\s*=\\s*digitalRead\\s*\\(\\s*${pin}\\s*\\)\\s*;?\\s*$`,
        `digitalRead returns HIGH or LOW: int buttonState = digitalRead(${pin});`,
        `Use: int buttonState = digitalRead(${pin});`
      )
    );
  }

  const baudRates = [9600, 115200, 57600, 38400, 19200, 4800, 9600, 115200, 57600, 38400, 19200, 4800];
  for (const baud of baudRates) {
    questions.push(
      q(
        order++,
        'Serial',
        `Start Serial communication at ${baud} baud in one line.`,
        `^Serial\\s*\\.\\s*begin\\s*\\(\\s*${baud}\\s*\\)\\s*;?\\s*$`,
        `Serial must be started before printing: Serial.begin(${baud});`,
        `Use: Serial.begin(${baud});`
      )
    );
  }

  const printMsgs = [
    'Hello World', 'Ready', 'Starting', 'Done', 'Count', 'Value', 'Status', 'OK',
    'Sensor', 'Temperature', 'Distance', 'Speed', 'Error', 'Warning',
  ];
  for (const msg of printMsgs) {
    questions.push(
      q(
        order++,
        'Serial',
        `Print the text "${msg}" to Serial with a new line (println).`,
        `^Serial\\s*\\.\\s*println\\s*\\(\\s*"${escRegex(msg)}"\\s*\\)\\s*;?\\s*$`,
        `println adds a line break: Serial.println("${msg}");`,
        `Use: Serial.println("${msg}");`
      )
    );
  }

  const printNoLine = ['Count: ', 'Value = ', 'Reading: ', 'Status: ', 'Temp: '];
  for (const msg of printNoLine) {
    questions.push(
      q(
        order++,
        'Serial',
        `Print "${msg}" to Serial without starting a new line (use print).`,
        `^Serial\\s*\\.\\s*print\\s*\\(\\s*"${escRegex(msg)}"\\s*\\)\\s*;?\\s*$`,
        `print stays on the same line: Serial.print("${msg}");`,
        `Use: Serial.print("${msg}");`
      )
    );
  }

  const ifConditions: Array<[string, string]> = [
    ['isOn', 'digitalWrite(13, HIGH);'],
    ['isReady', 'Serial.println("Go");'],
    ['counter > 10', 'counter = 0;'],
    ['buttonState == LOW', 'digitalWrite(13, HIGH);'],
    ['sensorValue < 512', 'digitalWrite(12, LOW);'],
    ['brightness > 0.5', 'digitalWrite(9, HIGH);'],
    ['index == 5', 'Serial.println("Halfway");'],
    ['attempts != 0', 'attempts--;'],
    ['level >= 3', 'Serial.println("Level up");'],
    ['isPressed', 'counter++;'],
  ];
  for (const [cond, body] of ifConditions) {
    const bodyEsc = escRegex(body);
    questions.push(
      q(
        order++,
        'Conditionals',
        `Write a one-line if statement: if ${cond}, then run ${body}`,
        `^if\\s*\\(\\s*${escRegex(cond)}\\s*\\)\\s+${bodyEsc}\\s*;?\\s*$`,
        `Format: if (${cond}) ${body}`,
        `Use: if (${cond}) ${body}`
      )
    );
  }

  const forLoops: Array<[string, string, string]> = [
    ['0', '5', 'i'], ['0', '10', 'i'], ['1', '6', 'n'], ['0', '3', 'index'],
    ['0', '8', 'led'], ['0', '4', 'step'], ['0', '7', 'count'], ['0', '12', 'i'],
    ['0', '20', 'j'], ['0', '6', 'k'], ['0', '9', 'pos'], ['0', '15', 'x'],
    ['0', '100', 'i'], ['0', '50', 'n'], ['0', '25', 't'],
  ];
  for (const [start, end, varName] of forLoops) {
    questions.push(
      q(
        order++,
        'Loops',
        `Write a for loop header that counts ${varName} from ${start} up to (but not including) ${end}.`,
        `^for\\s*\\(\\s*int\\s+${escRegex(varName)}\\s*=\\s*${start}\\s*;\\s*${escRegex(varName)}\\s*<\\s*${end}\\s*;\\s*${escRegex(varName)}\\+\\+\\s*\\)\\s*;?\\s*$`,
        `Standard for loop: for (int ${varName} = ${start}; ${varName} < ${end}; ${varName}++)`,
        `Use: for (int ${varName} = ${start}; ${varName} < ${end}; ${varName}++)`
      )
    );
  }

  const increments = [
    'counter', 'index', 'attempts', 'score', 'level', 'ticks', 'steps', 'reading',
    'blinkCount', 'numLeds', 'maxCount', 'sum', 'offset', 'threshold', 'sampleRate',
  ];
  for (const name of increments) {
    questions.push(
      q(
        order++,
        'Operators',
        `Increase the variable ${name} by 1 using the increment operator.`,
        `^${escRegex(name)}\\+\\+\\s*;?\\s*$`,
        `++ adds 1: ${name}++;`,
        `Use: ${name}++;`
      )
    );
  }

  const assignments: Array<[string, string, string]> = [
    ['sum', 'numberA', 'numberB'], ['total', 'a', 'b'], ['result', 'x', 'y'],
    ['combined', 'val1', 'val2'], ['score', 'points', 'bonus'],
  ];
  for (const [target, a, b] of assignments) {
    questions.push(
      q(
        order++,
        'Operators',
        `Assign ${target} the sum of ${a} and ${b} in one statement.`,
        `^${escRegex(target)}\\s*=\\s*${escRegex(a)}\\s*\\+\\s*${escRegex(b)}\\s*;?\\s*$`,
        `Addition assignment: ${target} = ${a} + ${b};`,
        `Use: ${target} = ${a} + ${b};`
      )
    );
  }

  const analogPins = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'];
  for (const pin of analogPins) {
    questions.push(
      q(
        order++,
        'Pins',
        `Read analog pin ${pin} into a variable named sensorValue.`,
        `^int\\s+sensorValue\\s*=\\s*analogRead\\s*\\(\\s*${pin}\\s*\\)\\s*;?\\s*$`,
        `analogRead returns 0–1023: int sensorValue = analogRead(${pin});`,
        `Use: int sensorValue = analogRead(${pin});`
      )
    );
  }

  const pwmPairs: Array<[number, number]> = [
    [5, 128], [6, 200], [9, 255], [10, 64], [11, 100], [3, 150],
  ];
  for (const [pin, speed] of pwmPairs) {
    questions.push(
      q(
        order++,
        'Pins',
        `Set PWM speed ${speed} on pin ${pin} using analogWrite.`,
        `^analogWrite\\s*\\(\\s*${pin}\\s*,\\s*${speed}\\s*\\)\\s*;?\\s*$`,
        `analogWrite uses 0–255: analogWrite(${pin}, ${speed});`,
        `Use: analogWrite(${pin}, ${speed});`
      )
    );
  }

  const delays = [100, 250, 500, 750, 1000, 1500, 2000, 50, 300, 400];
  for (const ms of delays) {
    questions.push(
      q(
        order++,
        'Functions',
        `Pause the program for ${ms} milliseconds using delay.`,
        `^delay\\s*\\(\\s*${ms}\\s*\\)\\s*;?\\s*$`,
        `delay pauses in milliseconds: delay(${ms});`,
        `Use: delay(${ms});`
      )
    );
  }

  const delayVarNames = ['delayMs', 'pauseTime', 'waitTime', 'interval', 'duration'];
  for (const name of delayVarNames) {
    questions.push(
      q(
        order++,
        'Functions',
        `Call delay using the variable ${name} as the argument.`,
        `^delay\\s*\\(\\s*${escRegex(name)}\\s*\\)\\s*;?\\s*$`,
        `Pass a variable to delay: delay(${name});`,
        `Use: delay(${name});`
      )
    );
  }

  const comments = [
    ['Turn on the built-in LED', 'Turn on the built-in LED'],
    ['Read sensor value', 'Read sensor value'],
    ['Wait one second', 'Wait one second'],
    ['Initialize Serial port', 'Initialize Serial port'],
    ['Check button state', 'Check button state'],
  ];
  for (const [text] of comments) {
    questions.push(
      q(
        order++,
        'Comments',
        `Write a single-line comment that says: ${text}`,
        `^//\\s*${escRegex(text)}\\s*$`,
        `Line comments start with //: // ${text}`,
        `Use: // ${text}`
      )
    );
  }

  const ternaries: Array<[string, string, string]> = [
    ['ledPin', 'HIGH', 'LOW'], ['motorPin', 'HIGH', 'LOW'], ['statusLed', 'HIGH', 'LOW'],
    ['outputPin', 'HIGH', 'LOW'], ['relayPin', 'HIGH', 'LOW'],
  ];
  for (const [pin, on, off] of ternaries) {
    questions.push(
      q(
        order++,
        'Operators',
        `Set ${pin} to ${on} when isOn is true, otherwise ${off}, using the ternary operator in digitalWrite.`,
        `^digitalWrite\\s*\\(\\s*${escRegex(pin)}\\s*,\\s*isOn\\s*\\?\\s*${on}\\s*:\\s*${off}\\s*\\)\\s*;?\\s*$`,
        `Ternary: condition ? valueIfTrue : valueIfFalse`,
        `Use: digitalWrite(${pin}, isOn ? ${on} : ${off});`
      )
    );
  }

  // Pick 200 questions with balanced categories (all unique prompts)
  const seen = new Set<string>();
  const unique = questions.filter((item) => {
    if (seen.has(item.prompt)) return false;
    seen.add(item.prompt);
    return true;
  });

  const categoryQuota: Record<string, number> = {
    Variables: 55,
    Pins: 50,
    Serial: 30,
    Conditionals: 12,
    Loops: 18,
    Operators: 20,
    Functions: 10,
    Comments: 5,
  };

  const byCategory = new Map<string, SyntaxQuestion[]>();
  for (const item of unique) {
    if (!byCategory.has(item.category)) byCategory.set(item.category, []);
    byCategory.get(item.category)!.push(item);
  }

  const picked: SyntaxQuestion[] = [];
  for (const [category, quota] of Object.entries(categoryQuota)) {
    picked.push(...(byCategory.get(category) || []).slice(0, quota));
  }

  if (picked.length < 200) {
    const pickedPrompts = new Set(picked.map((q) => q.prompt));
    for (const item of unique) {
      if (picked.length >= 200) break;
      if (!pickedPrompts.has(item.prompt)) {
        picked.push(item);
        pickedPrompts.add(item.prompt);
      }
    }
  }

  if (picked.length < 200) {
    throw new Error(`Expected 200 unique questions, got ${picked.length}`);
  }

  return picked.slice(0, 200).map((item, i) => ({
    ...item,
    order: i + 1,
    id: `syntax-${String(i + 1).padStart(3, '0')}`,
  }));
}

export const SYNTAX_QUESTIONS = buildSyntaxQuestions();
