import L from "leaflet";
import { useEffect, useMemo } from "react";
import { Circle, MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import type { Post } from "../types";
import { CATEGORY_MAP, TYPE_COLORS } from "../types";

const GIRONDE_CENTER: [number, number] = [44.6, -1.0];
const GIRONDE_ZOOM = 10;

function createDivIcon(post: Post): L.DivIcon {
  const color = TYPE_COLORS[post.type];
  const emoji = CATEGORY_MAP[post.category]?.emoji ?? "📍";
  const size = post.type === "official" ? 36 : 32;

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        <div class="marker-pulse" style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: ${color};
          opacity: 0.3;
        "></div>
        <div style="
          position: relative;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: ${color};
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${size * 0.5}px;
          cursor: pointer;
        ">${emoji}</div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function MapController({
  posts,
  selectedId,
  userPos,
  mapTarget,
}: {
  posts: Post[];
  selectedId: string | null;
  userPos: [number, number] | null;
  mapTarget: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, [map]);

  useEffect(() => {
    if (mapTarget) {
      map.flyTo(mapTarget, 14, { duration: 0.8 });
    }
  }, [mapTarget, map]);

  useEffect(() => {
    if (selectedId) {
      const post = posts.find((p) => p.id === selectedId);
      if (post) {
        map.flyTo([post.lat, post.lng], Math.max(map.getZoom(), 13), {
          duration: 0.5,
        });
      }
    }
  }, [selectedId, posts, map]);

  useEffect(() => {
    if (userPos) {
      map.flyTo(userPos, 13, { duration: 0.5 });
    }
  }, [userPos, map]);

  return null;
}

export default function MapContainerView({
  posts,
  selectedPostId,
  onSelectPost,
  userPos,
  mapTarget,
}: {
  posts: Post[];
  selectedPostId: string | null;
  onSelectPost: (id: string) => void;
  userPos: [number, number] | null;
  mapTarget: [number, number] | null;
}) {
  const markers = useMemo(
    () =>
      posts.map((post) => ({
        post,
        icon: createDivIcon(post),
      })),
    [posts],
  );

  const userIcon = useMemo(
    () =>
      L.divIcon({
        className: "user-marker",
        html: `<div style="width: 16px; height: 16px; border-radius: 50%; background: #2563eb; border: 3px solid white; box-shadow: 0 0 8px rgba(37,99,235,0.8);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      }),
    [],
  );

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={GIRONDE_CENTER}
        zoom={GIRONDE_ZOOM}
        className="h-full w-full"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />

        {markers.map(({ post, icon }) => (
          <Marker
            key={post.id}
            position={[post.lat, post.lng]}
            icon={icon}
            eventHandlers={{
              click: () => onSelectPost(post.id),
            }}
          />
        ))}

        {userPos && (
          <>
            <Marker position={userPos} icon={userIcon} />
            <Circle
              center={userPos}
              radius={500}
              pathOptions={{
                color: "#2563eb",
                fillColor: "#2563eb",
                fillOpacity: 0.1,
              }}
            />
          </>
        )}

        <MapController
          posts={posts}
          selectedId={selectedPostId}
          userPos={userPos}
          mapTarget={mapTarget}
        />
      </MapContainer>
    </div>
  );
}
