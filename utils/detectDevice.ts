import DeviceDetector from 'device-detector-js';

export default function detectDevice(userAgent: string) {
  const deviceDetector = new DeviceDetector();
  const info = deviceDetector.parse(userAgent);

  return info?.client?.name ? `${info?.client?.name}` : userAgent;
}
