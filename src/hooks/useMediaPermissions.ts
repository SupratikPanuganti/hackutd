import { useState, useCallback } from 'react';

interface MediaPermissions {
  camera: boolean;
  microphone: boolean;
}

export const useMediaPermissions = () => {
  const [permissions, setPermissions] = useState<MediaPermissions>({
    camera: false,
    microphone: false,
  });
  const [isRequesting, setIsRequesting] = useState(false);

  const requestMicrophone = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissions(prev => ({ ...prev, microphone: true }));
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setPermissions(prev => ({ ...prev, microphone: false }));
      return false;
    }
  }, []);

  const requestCamera = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissions(prev => ({ ...prev, camera: true }));
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      setPermissions(prev => ({ ...prev, camera: false }));
      return false;
    }
  }, []);

  const requestAll = useCallback(async (): Promise<MediaPermissions> => {
    setIsRequesting(true);
    const results: MediaPermissions = { camera: false, microphone: false };

    results.microphone = await requestMicrophone();
    results.camera = await requestCamera();

    setIsRequesting(false);
    return results;
  }, [requestMicrophone, requestCamera]);

  const checkPermissions = useCallback(async (): Promise<MediaPermissions> => {
    try {
      const micStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      const camStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });

      const results = {
        microphone: micStatus.state === 'granted',
        camera: camStatus.state === 'granted',
      };

      setPermissions(results);
      return results;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return permissions;
    }
  }, [permissions]);

  return {
    permissions,
    isRequesting,
    requestMicrophone,
    requestCamera,
    requestAll,
    checkPermissions,
  };
};
