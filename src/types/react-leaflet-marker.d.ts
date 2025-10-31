import { Icon } from 'leaflet';

declare module 'react-leaflet' {
  interface MarkerProps {
    icon?: Icon;
  }
}
