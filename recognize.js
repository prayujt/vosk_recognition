const vosk = require('vosk');
const fs = require('fs');
const mic = require('mic');
const exec = require('child_process').exec;
const { Timer } = require('nodejs-timer');
const { Client } = require('openrgb-sdk');

MODEL_PATH = '/home/prayuj/repos/vosk_recognition/model'
SAMPLE_RATE = 16000

const client = new Client('openrgb-client', 6742, 'localhost');
var controllers = [];
const terminators = ['cancel', 'stop'];
const background = ['the', 'on', 'to', 'from', 'on', 'in', 'by', 'this', 'at'];
const delay = 2000;
const longDelay = 2500;


let waiting = false;
let last_partial = '';
let card = process.argv[2]
let sink = process.argv[3]

const model = new vosk.Model(MODEL_PATH);
const rec = new vosk.Recognizer({model: model, sampleRate: SAMPLE_RATE});

const timer = new Timer(async () => {
    rec.reset();
    await setColor(0, 0, 0);
    waiting = false;
});

const start = async () => {
    await client.connect();
    let count = await client.getControllerCount();
    for (let i = 0; i < count; i++) {
        let device = await client.getControllerData(i);
        await client.setCustomMode(i);
        controllers.push(device);
    } await setColor(0, 0, 0);
    if (!fs.existsSync(MODEL_PATH)) {
        console.log('Cannot find any models in the specified folder.');
        process.exit();
    }
    vosk.setLogLevel(0);

    var micInstance = mic({
        rate: String(SAMPLE_RATE),
        channels: '1',
        device: 'plughw:' + card + ',0',
        debug: false
    });

    var micInputStream = micInstance.getAudioStream();
    micInstance.start();

    micInputStream.on('data', (data) => {
        if (rec.acceptWaveform(data)) {
            let temp = rec.result();
            if (temp != undefined) parseResult(stripBackground(temp.text));
        }
        else {
            let temp = rec.partialResult();
            let partial = processPartial(stripBackground(temp.partial));
        }
    });
    process.on('SIGINT', function() {
        console.log(rec.finalResult());
        console.log('\nDone');
        rec.free();
        model.free();
    });
}

const stripBackground = (text) => {
    let array = text.split(' ');
    return array.filter(i => (!(background.includes(i)) && i.replace(/\s/g, '').length > 0));
}

const processPartial = async (partial) => {
    string = partial.join(' ')
    if (partial.length > 0 && string !== last_partial) {
        for (let i = 0; i < partial.length; i++) {
            if (terminators.includes(partial[i]) || (i < partial.length - 1 && partial[i] === 'never' && partial[i + 1] === 'mind')) {
                timer.clear();
                rec.reset();
                await setColor(0, 0, 0);
                last_partial = '';
                return;
            }
        }
        if (partial[0] === 'computer') {
            await setColor(255, 255, 255);
        }
        console.log(string);
        last_partial = string;
        timer.clear();
        timer.start(delay);
    }
}

const parseResult = async (result) => {
    if (result.length > 0) {
        timer.clear();
        console.log('Result: ' + result.join(' '));
        if (result[0] === 'computer' && result.length === 1) {
            waiting = true;
            timer.start(longDelay);
        }
        else if (result[0] === 'computer' && result.length > 1) {
            waiting = false;
            result.shift();
            let output = exec('notify-send -u normal -t 3000 \"Recognized: ' + result.join(' ') + '\"');
            //process result
            let processor = exec('python /home/prayuj/repos/vosk_recognition/processing.py \"' + result.join(' ') + '\"' + ' ' + sink);
            await setColor(0, 0, 0);
        }
        else if (waiting) {
            waiting = false;
            let output = exec('notify-send -u normal -t 3000 \"Recognized: ' + result.join(' ') + '\"');
            // process result
            let processor = exec('python /home/prayuj/repos/vosk_recognition/processing.py \"' + result.join(' ') + '\"' + ' ' + sink);
            await setColor(0, 0, 0);
        }
        last_partial = '';
    }
}

const setColor = async (r, g, b) => {
    for (let i = 0; i < controllers.length; i++) {
        const colors = Array(controllers[i].colors.length).fill({
            red: r,
            green: g,
            blue: b
        });
        await client.updateLeds(i, colors);
    }
}

start();
