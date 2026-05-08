import { useState, useEffect, useRef, useCallback } from 'react';
import { ElataCameraSDK, ElataBleSDK, type BiometricData } from '../lib/elata-mocks';

interface BiometricState {
  current: BiometricData;
  average: BiometricData;
  isCameraActive: boolean;
  isBleActive: boolean;
}

export function useElataBiometrics() {
  const [state, setState] = useState<BiometricState>({
    current: { focus: 0, calm: 0, stress: 0 },
    average: { focus: 0, calm: 0, stress: 0 },
    isCameraActive: false,
    isBleActive: false
  });

  const historyRef = useRef<{ timestamp: number, data: BiometricData }[]>([]);
  const cameraSdkRef = useRef(new ElataCameraSDK());
  const bleSdkRef = useRef(new ElataBleSDK());

  const updateAverages = useCallback(() => {
    const now = Date.now();
    // Keep only last 60 seconds
    historyRef.current = historyRef.current.filter(entry => now - entry.timestamp <= 60000);
    
    if (historyRef.current.length === 0) return;

    const sum = historyRef.current.reduce((acc, curr) => ({
      focus: acc.focus + curr.data.focus,
      calm: acc.calm + curr.data.calm,
      stress: acc.stress + curr.data.stress
    }), { focus: 0, calm: 0, stress: 0 });

    setState(prev => ({
      ...prev,
      average: {
        focus: Math.round(sum.focus / historyRef.current.length),
        calm: Math.round(sum.calm / historyRef.current.length),
        stress: Math.round(sum.stress / historyRef.current.length)
      }
    }));
  }, []);

  const handleNewData = useCallback((newData: Partial<BiometricData>) => {
    setState(prev => {
      const updatedCurrent = { ...prev.current, ...newData };
      historyRef.current.push({ timestamp: Date.now(), data: updatedCurrent });
      return { ...prev, current: updatedCurrent };
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(updateAverages, 1000);
    return () => clearInterval(interval);
  }, [updateAverages]);

  const startCamera = async () => {
    await cameraSdkRef.current.initialize();
    cameraSdkRef.current.startStream(handleNewData);
    setState(prev => ({ ...prev, isCameraActive: true }));
  };

  const startBle = async () => {
    await bleSdkRef.current.requestConnection();
    bleSdkRef.current.startStream(handleNewData);
    setState(prev => ({ ...prev, isBleActive: true }));
  };

  const stopSession = () => {
    cameraSdkRef.current.stopStream();
    bleSdkRef.current.stopStream();
    setState(prev => ({ ...prev, isCameraActive: false, isBleActive: false }));
    historyRef.current = [];
  };

  return {
    ...state,
    startCamera,
    startBle,
    stopSession
  };
}
