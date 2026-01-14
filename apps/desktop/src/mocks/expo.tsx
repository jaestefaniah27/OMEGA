

// Mock Expo Camera
export const CameraView = (_props: any) => (
  <div style={{ 
    backgroundColor: '#000', 
    flex: 1, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    color: 'white', 
    height: '100%',
    width: '100%'
  }}>
    [Cámara No Disponible en PC]
  </div>
);

export const useCameraPermissions = () => {
  // Simula que no hay permiso o que está pendiente
  return [{ 
    granted: false, 
    status: 'denied', 
    canAskAgain: false 
  }, async () => ({ 
    granted: false, 
    status: 'denied' 
  })];
};

// Mock Expo Image Manipulator
export const manipulateAsync = async () => ({ 
  uri: '', 
  width: 0, 
  height: 0, 
  base64: '' 
});

export const SaveFormat = { 
  JPEG: 'jpeg', 
  PNG: 'png' 
};

// Mock Expo Haptics
export const NotificationFeedbackType = {
  Success: 'success',
  Warning: 'warning',
  Error: 'error'
};

export const ImpactFeedbackStyle = {
  Light: 'light',
  Medium: 'medium',
  Heavy: 'heavy',
  Rigid: 'rigid',
  Soft: 'soft'
};

export const notificationAsync = async () => {};
export const impactAsync = async () => {};
