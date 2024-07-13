const MODULE_URL =
    "https://unpkg.com/@picovoice/picollm-web@1.0.7/dist/esm/index.js?module";
const ACCESS_KEY = "YOUR_ACCESS_KEY";

class Pico {
    PicoLLMWorker;

    _picoSdk;

    constructor() {
        return this;
    }

    async loadSdk() {
        this._picoSdk = await import(MODULE_URL);
    }

    async loadWorker(model) {
        this.PicoLLMWorker = await this._picoSdk.PicoLLMWorker.create(
            ACCESS_KEY,
            {
                modelFile: model
            }
        );
    }
}

(() => {
    window.Pico = new Pico();
})();
