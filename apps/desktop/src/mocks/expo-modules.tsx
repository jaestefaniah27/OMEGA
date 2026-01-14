

// Mock para expo-camera
export const CameraView = () => {
  return (
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
};

export const useCameraPermissions = () => {
  // Simula que no hay permiso o que está pendiente, o simula concedido pero sin video real.
  // Retorna: [status, requestPermission]
  return [{ 
    granted: false, 
    status: 'denied', 
    canAskAgain: false,
    expires: 'never'
  }, async () => ({ 
    granted: false, 
    status: 'denied' 
  })];
};

// Mock para expo-image-manipulator
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
