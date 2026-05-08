// Mocking @elata-biosciences/eeg-web and eeg-web-ble

export type BiometricData = {
  focus: number;
  calm: number;
  stress: number;
};

export class ElataCameraSDK {
  private active = false;
  private interval: number | null = null;

  async initialize(): Promise<void> {
    console.log("Initializing Elata Camera SDK (rPPG)... local WASM loaded.");
    return new Promise(resolve => setTimeout(resolve, 500));
  }

  startStream(onData: (data: Partial<BiometricData>) => void) {
    this.active = true;
    this.interval = window.setInterval(() => {
      if (this.active) {
        onData({
          stress: Math.round(40 + Math.random() * 50)
        });
      }
    }, 3000);
  }

  stopStream() {
    this.active = false;
    if (this.interval) clearInterval(this.interval);
  }
}

export class ElataBleSDK {
  private active = false;
  private interval: number | null = null;

  async requestConnection(): Promise<void> {
    console.log("Requesting BLE connection... (User gesture required)");
    return new Promise(resolve => setTimeout(resolve, 800));
  }

  startStream(onData: (data: Partial<BiometricData>) => void) {
    this.active = true;
    this.interval = window.setInterval(() => {
      if (this.active) {
        onData({
          focus: Math.round(40 + Math.random() * 50),
          calm: Math.round(40 + Math.random() * 50)
        });
      }
    }, 3000);
  }

  stopStream() {
    this.active = false;
    if (this.interval) clearInterval(this.interval);
  }
}
