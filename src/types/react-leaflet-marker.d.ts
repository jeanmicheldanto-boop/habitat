import { MarkerProps } from 'react-leaflet';
import { Icon } from 'leaflet';

declare module 'react-leaflet' {
  interface MarkerProps {
    icon?: Icon;
  }
}
