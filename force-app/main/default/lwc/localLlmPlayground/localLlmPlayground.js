import { LightningElement } from "lwc";

import PicoSDK from "@salesforce/resourceUrl/PicoSDK";
import { loadScript } from "lightning/platformResourceLoader";

import * as chat from "./chat.js";

export default class LocalLlmPlayground extends LightningElement {
    isLoading = true;
    isGenerating = false;
    isStoppedGenerating = false;

    errorMessage;
    modelName;
    dialog;
    isWorkerCreated;

    async connectedCallback() {
        try {
            await loadScript(this, PicoSDK);
            window.Pico.loadSdk();
            this.isLoading = false;
        } catch (error) {
            this.errorMessage = error.message;
            this.isLoading = false;
        }
    }

    async loadModel(event) {
        this.isLoading = true;
        try {
            this.model = event.target.files[0];
            this.modelName = this.model.name;
        } catch (error) {
            this.errorMessage = error.message;
        } finally {
            this.isLoading = false;
        }
    }

    async generate() {
        this.errorMessage = "";
        this.isGenerating = true;
        this.isLoading = true;
        try {
            const { userInput, tokenLimit, temp } = this.collectInputValues();
            chat.renderMessage(
                this,
                chat.MessageType.OUTBOUND,
                userInput.value
            );

            if (!this.isWorkerCreated) {
                await this.createPicoLlmWorker();
            }
            this.isLoading = false;

            await this.dialog.addHumanRequest(userInput.value);
            userInput.value = "";

            await this.generateResponse(tokenLimit, temp);
        } catch (error) {
            this.errorMessage = error.message;
        } finally {
            this.isGenerating = false;
            this.isStoppedGenerating = false;
        }
    }

    collectInputValues() {
        return {
            userInput: this.template.querySelector("[data-name='user-prompt']"),
            tokenLimit: this.template.querySelector(
                "[data-name='completionTokenLimit']"
            ).value,
            temp: this.template.querySelector("[data-name='temperature']").value
        };
    }

    async createPicoLlmWorker() {
        if (window.Pico.PicoLLMWorker) {
            await window.Pico.PicoLLMWorker.release();
        }
        await window.Pico.loadWorker(this.model);

        const systemPrompt = this.template.querySelector(
            "[data-name='system-prompt']"
        ).value;
        this.dialog = await window.Pico.PicoLLMWorker.getDialog(
            undefined,
            0,
            systemPrompt
        );
        this.isWorkerCreated = true;
    }

    async generateResponse(tokenLimit, temp) {
        const msgInbound = chat.renderMessage(this, chat.MessageType.INBOUND);
        const { completion } = await window.Pico.PicoLLMWorker.generate(
            this.dialog.prompt(),
            {
                tokenLimit,
                temp,
                streamCallback: (token) => {
                    this.streamLlmResponse(token, msgInbound);
                }
            }
        );
        await this.dialog.addLLMResponse(completion);
    }

    streamLlmResponse(token, msgInbound) {
        if (!token || this.isStoppedGenerating) return;
        msgInbound.innerText += token;
        this.template.querySelector(".slds-chat").scrollBy(0, 32);
    }

    async releaseResources() {
        this.isLoading = true;
        try {
            await window.Pico.PicoLLMWorker.release();
            const databaseDeletionRequest = indexedDB.deleteDatabase("pv_db");
            databaseDeletionRequest.onerror = (event) => {
                this.errorMessage(event.target.error);
            };
            databaseDeletionRequest.onblocked = (event) => {
                this.errorMessage(event.target.error);
            };
        } catch (error) {
            this.errorMessage = error.message;
        } finally {
            this.isLoading = false;
        }
    }

    stopGeneration() {
        this.isStoppedGenerating = true;
        this.isGenerating = false;
    }
}
