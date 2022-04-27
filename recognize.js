const vosk = require('vosk')
const fs = require("fs");
const mic = require("mic");
const { Client } = require("openrgb-sdk")

MODEL_PATH = "model"
SAMPLE_RATE = 16000

const client = new Client("openrgb-client", 6742, "localhost");
var controllers = [];

let waiting = false;

const start = async () => {
    await client.connect();
    let count = await client.getControllerCount();
    for (let i = 0; i < count; i++) {
        let device = await client.getControllerData(i);
        await client.setCustomMode(i);
        controllers.push(device);
    }
    await setColor(0, 0, 0);
    if (!fs.existsSync(MODEL_PATH)) {
        console.log("Please download the model from https://alphacephei.com/vosk/models and unpack as " + MODEL_PATH + " in the current folder.")
        process.exit()
    }
    vosk.setLogLevel(0);
    const model = new vosk.Model(MODEL_PATH);
    const rec = new vosk.Recognizer({model: model, sampleRate: SAMPLE_RATE});

    var micInstance = mic({
        rate: String(SAMPLE_RATE),
        channels: '1',
        debug: false
    });

    var micInputStream = micInstance.getAudioStream();
    micInstance.start();

    micInputStream.on('data', (data) => {
        if (rec.acceptWaveform(data)) {
            let result = rec.result();
            if (result != undefined) parseResult(stripBackground(result.text));
        }
        else {
            let partial = rec.partialResult();
            processPartial(stripBackground(partial.partial));
        }
    });
    process.on('SIGINT', function() {
        console.log(rec.finalResult());
        console.log("\nDone");
        rec.free();
        model.free();
    });
}

const stripBackground = (text) => {
    let array = text.split(' ');
    if (array[0] == 'the') {
        array.shift();
    }
    return array;
}

const processPartial = async (partial) => {
    if (partial[0] == 'computer') {
        await setColor(255, 255, 255);
    }
    console.log(partial.join(' '));
}

const parseResult = async (result) => {
    console.log("Result: " + result.join(' '));
    if (result[0] == 'computer' && result.length == 1) {
        waiting = true;
    }
    else if (waiting) {
        await setColor(0, 0, 0);
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
