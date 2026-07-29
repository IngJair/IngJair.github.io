import { useEffect, useRef } from 'react';

const LIMA_CENTER = [-12.0464, -77.0428];

export default function InteractiveMap({ 
  mode = 'zones', 
  zones = [], 
  interactive = false, 
  onMapClick, 
  onZoneMove,
  defaultCenter = LIMA_CENTER, // Lima por defecto
  defaultZoom = 11
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const zonesLayerRef = useRef(null);
  const [centerLat, centerLng] = defaultCenter;

  // 1. Inicialización del Mapa
  useEffect(() => {
    if (typeof window === 'undefined' || !window.L) return;
    const L = window.L;

    // Fix de iconos de Leaflet
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    if (!mapContainerRef.current) return;

    // Crear instancia del mapa
    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: defaultZoom,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    // Tile Layer de OpenStreetMap estándar (Claro)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Grupo de capas para zonas
    zonesLayerRef.current = L.featureGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [centerLat, centerLng, defaultZoom]);

  // Mantener el evento de clic sincronizado sin recrear el mapa.
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !interactive || mode !== 'zones' || !onMapClick) return;

    const handleClick = (event) => {
      const { lat, lng } = event.latlng;
      onMapClick({ lat, lng });
    };

    map.on('click', handleClick);
    return () => map.off('click', handleClick);
  }, [interactive, mode, onMapClick]);

  // 2. Actualización de Zonas
  useEffect(() => {
    if (!mapInstanceRef.current || !zonesLayerRef.current || mode !== 'zones') return;
    const L = window.L;
    const map = mapInstanceRef.current;
    const layerGroup = zonesLayerRef.current;

    layerGroup.clearLayers();

    if (zones.length > 0) {
      const bounds = L.latLngBounds();

      zones.forEach(zone => {
        if (!zone.lat || !zone.lng) return;

        // Círculo de cobertura
        const circle = L.circle([zone.lat, zone.lng], {
          radius: (zone.radiusKm || 4) * 1000,
          color: zone.color || '#bf953f',
          fillColor: zone.color || '#bf953f',
          fillOpacity: 0.2,
          weight: 2
        }).addTo(layerGroup);

        // Marcador
        const marker = L.marker([zone.lat, zone.lng], {
          draggable: interactive
        }).addTo(layerGroup);

        if (zone.name) {
          marker.bindPopup(`<b>${zone.name}</b>${zone.description ? `<br>${zone.description}` : ''}`);
        }

        if (interactive && onZoneMove) {
          marker.on('dragend', (e) => {
            const { lat, lng } = e.target.getLatLng();
            onZoneMove({ id: zone.id, lat, lng });
          });
        }

        bounds.extend([zone.lat, zone.lng]);
        // Extender bounds con el radio del círculo para asegurar que se vea todo
        const circleBounds = circle.getBounds();
        bounds.extend(circleBounds);
      });

      // Solo ajustar vista si no estamos en modo interactivo o es la primera carga con zonas
      if (!interactive || layerGroup.getLayers().length > 0) {
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40] });
        }
      }
    } else {
      map.setView([centerLat, centerLng], defaultZoom);
    }
  }, [zones, mode, interactive, onZoneMove, centerLat, centerLng, defaultZoom]);

  // 3. Soporte Modo "single"
  useEffect(() => {
    if (!mapInstanceRef.current || mode !== 'single') return;
    const L = window.L;
    const map = mapInstanceRef.current;
    
    // Limpiar zonas si las había
    if (zonesLayerRef.current) zonesLayerRef.current.clearLayers();
    
    L.marker([centerLat, centerLng]).addTo(map);
    map.setView([centerLat, centerLng], 14);
  }, [mode, centerLat, centerLng]);

  return (
    <div 
      className="map-wrapper" 
      style={{ 
        position: 'relative', 
        height: interactive ? '320px' : '280px',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #eee'
      }}
    >
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          cursor: interactive ? 'crosshair' : 'grab',
          background: '#f0f0f0'
        }}
      />
    </div>
  );
}
