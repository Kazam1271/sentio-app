import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { ElataCameraSDK, ElataBleSDK, type BiometricData } from '../lib/elata-mocks';

interface BioSensorContextType {
  current: BiometricData;
  average: BiometricData;
  isCameraActive: boolean;
  isBleActive: boolean;
  isScanningCamera: boolean;
  isScanningBle: boolean;
  startCamera: () => Promise<void>;
  startBle: () => Promise<void>;
  stopSession: () => void;
}

const BioSensorContext = createContext<BioSensorContextType | undefined>(undefined);

export const BioSensorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [current, setCurrent] = useState<BiometricData>({ focus: 0, calm: 0, stress: 0 });
  const [average, setAverage] = useState<BiometricData>({ focus: 0, calm: 0, stress: 0 });
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isBleActive, setIsBleActive] = useState(false);
  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const [isScanningBle, setIsScanningBle] = useState(false);

  const historyRef = useRef<{ timestamp: number, data: BiometricData }[]>([]);
  const cameraSdkRef = useRef(new ElataCameraSDK());
  const bleSdkRef = useRef(new ElataBleSDK());

  const updateAverages = useCallback(() => {
    const now = Date.now();
    historyRef.current = historyRef.current.filter(entry => now - entry.timestamp <= 60000);
    
    if (historyRef.current.length === 0) return;

    const sum = historyRef.current.reduce((acc, curr) => ({
      focus: acc.focus + curr.data.focus,
      calm: acc.calm + curr.data.calm,
      stress: acc.stress + curr.data.stress
    }), { focus: 0, calm: 0, stress: 0 });

    setAverage({
      focus: Math.round(sum.focus / historyRef.current.length),
      calm: Math.round(sum.calm / historyRef.current.length),
      stress: Math.round(sum.stress / historyRef.current.length)
    });
  }, []);

  const handleNewData = useCallback((newData: Partial<BiometricData>) => {
    setCurrent(prev => {
      const updatedCurrent = { ...prev, ...newData };
      historyRef.current.push({ timestamp: Date.now(), data: updatedCurrent });
      return updatedCurrent;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(updateAverages, 1000);
    return () => clearInterval(interval);
  }, [updateAverages]);

  const startCamera = async () => {
    setIsScanningCamera(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second scanning
    await cameraSdkRef.current.initialize();
    cameraSdkRef.current.startStream(handleNewData);
    setIsScanningCamera(false);
    setIsCameraActive(true);
  };

  const startBle = async () => {
    setIsScanningBle(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second scanning
    await bleSdkRef.current.requestConnection();
    bleSdkRef.current.startStream(handleNewData);
    setIsScanningBle(false);
    setIsBleActive(true);
  };

  const stopSession = () => {
    cameraSdkRef.current.stopStream();
    bleSdkRef.current.stopStream();
    setIsCameraActive(false);
    setIsBleActive(false);
    historyRef.current = [];
  };

  return (
    <BioSensorContext.Provider value={{
      current, average, isCameraActive, isBleActive, isScanningCamera, isScanningBle, startCamera, startBle, stopSession
    }}>
      {children}
    </BioSensorContext.Provider>
  );
};

export const useBioSensor = () => {
  const context = useContext(BioSensorContext);
  if (context === undefined) {
    throw new Error('useBioSensor must be used within a BioSensorProvider');
  }
  return context;
};
